import axios from 'axios';
import { db } from '../db';
import { integrations } from '@shared/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

// Constants for OAuth2 flow
const CONSTANT_CONTACT_CLIENT_ID = process.env.CONSTANT_CONTACT_CLIENT_ID;
const CONSTANT_CONTACT_CLIENT_SECRET = process.env.CONSTANT_CONTACT_CLIENT_SECRET;
const CONSTANT_CONTACT_REDIRECT_URI = process.env.CONSTANT_CONTACT_REDIRECT_URI;
const CONSTANT_CONTACT_BASE_URL = 'https://api.cc.email/v3';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface ConstantContactCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// Service class for handling Constant Contact API operations
export class ConstantContactService {
  private credentials: ConstantContactCredentials | null = null;

  // Generate the authorization URL for OAuth2 flow
  getAuthorizationUrl(): string {
    return `https://authz.constantcontact.com/oauth2/default/v1/authorize?client_id=${CONSTANT_CONTACT_CLIENT_ID}&redirect_uri=${encodeURIComponent(CONSTANT_CONTACT_REDIRECT_URI!)}&response_type=code&scope=contact_data campaign_data offline_access`;
  }

  // Exchange the authorization code for access and refresh tokens
  async exchangeCodeForTokens(code: string): Promise<ConstantContactCredentials> {
    try {
      const tokenUrl = 'https://authz.constantcontact.com/oauth2/default/v1/token';
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', CONSTANT_CONTACT_REDIRECT_URI!);

      const auth = Buffer.from(`${CONSTANT_CONTACT_CLIENT_ID}:${CONSTANT_CONTACT_CLIENT_SECRET}`).toString('base64');
      
      const response = await axios.post<TokenResponse>(tokenUrl, params, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      this.credentials = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt
      };

      // Save tokens to database for later use
      await this.saveCredentials();

      return this.credentials;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Load saved credentials from database
  async loadCredentials(): Promise<ConstantContactCredentials | null> {
    try {
      // If we have valid in-memory credentials, use them
      if (this.credentials && this.credentials.expiresAt > new Date()) {
        return this.credentials;
      }
      
      // Try to load from the database
      const [integration] = await db.query.integrations.findMany({
        where: (integrations, { eq }) => eq(integrations.serviceName, 'constant_contact'),
        orderBy: (integrations, { desc }) => desc(integrations.updatedAt),
        limit: 1
      });
      
      if (integration && integration.accessToken && integration.refreshToken && integration.expiresAt) {
        this.credentials = {
          accessToken: integration.accessToken,
          refreshToken: integration.refreshToken,
          expiresAt: integration.expiresAt
        };
        
        // If credentials are expired, refresh them
        if (integration.expiresAt < new Date()) {
          return await this.refreshAccessToken();
        }
        
        return this.credentials;
      }
      
      // If we have in-memory credentials that are expired, refresh them
      if (this.credentials) {
        return await this.refreshAccessToken();
      }
      
      return null;
    } catch (error) {
      console.error('Error loading credentials:', error);
      return null;
    }
  }

  // Save credentials to database
  private async saveCredentials(): Promise<void> {
    try {
      if (!this.credentials) {
        return;
      }
      
      // Find existing integration
      const [existingIntegration] = await db.query.integrations.findMany({
        where: (integrations, { eq }) => eq(integrations.serviceName, 'constant_contact'),
        orderBy: (integrations, { desc }) => desc(integrations.updatedAt),
        limit: 1
      });
      
      if (existingIntegration) {
        // Update existing integration
        await db.update(integrations)
          .set({
            accessToken: this.credentials.accessToken,
            refreshToken: this.credentials.refreshToken,
            expiresAt: this.credentials.expiresAt,
            updatedAt: new Date()
          })
          .where(eq(integrations.id, existingIntegration.id as number));
      } else {
        // Create new integration
        await db.insert(integrations).values({
          serviceName: 'constant_contact',
          accessToken: this.credentials.accessToken,
          refreshToken: this.credentials.refreshToken,
          expiresAt: this.credentials.expiresAt,
          active: true,
          metadata: {}
          // userId is removed since it's not in the database schema
        });
      }
      
      console.log('Constant Contact credentials saved to database');
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<ConstantContactCredentials> {
    try {
      if (!this.credentials?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenUrl = 'https://authz.constantcontact.com/oauth2/default/v1/token';
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.credentials.refreshToken);

      const auth = Buffer.from(`${CONSTANT_CONTACT_CLIENT_ID}:${CONSTANT_CONTACT_CLIENT_SECRET}`).toString('base64');
      
      const response = await axios.post<TokenResponse>(tokenUrl, params, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      this.credentials = {
        accessToken: access_token,
        refreshToken: refresh_token || this.credentials.refreshToken, // Use new refresh token if provided
        expiresAt
      };

      // Save updated tokens to database
      await this.saveCredentials();

      return this.credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Ensure we have valid credentials before making API calls
  private async ensureValidCredentials(): Promise<string> {
    const credentials = await this.loadCredentials();
    
    if (!credentials) {
      throw new Error('Not authenticated with Constant Contact');
    }

    // If token is expired or about to expire, refresh it
    if (credentials.expiresAt < new Date(Date.now() + 60000)) { // 1 minute buffer
      const refreshedCreds = await this.refreshAccessToken();
      return refreshedCreds.accessToken;
    }

    return credentials.accessToken;
  }

  // Get contact lists
  async getContactLists(): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.get(`${CONSTANT_CONTACT_BASE_URL}/contact_lists`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching contact lists:', error);
      throw error;
    }
  }

  // Create a new contact list
  async createContactList(name: string, description?: string): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.post(`${CONSTANT_CONTACT_BASE_URL}/contact_lists`, {
        name,
        description: description || ''
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating contact list:', error);
      throw error;
    }
  }

  // Get contacts
  async getContacts(limit: number = 50, includeLists: boolean = true): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.get(`${CONSTANT_CONTACT_BASE_URL}/contacts`, {
        params: {
          limit,
          include: includeLists ? 'list_memberships' : undefined
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  // Create or update a contact
  async createOrUpdateContact(contactData: any): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.post(`${CONSTANT_CONTACT_BASE_URL}/contacts/sign_up_form`, contactData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw error;
    }
  }

  // Get campaigns
  async getCampaigns(limit: number = 50): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.get(`${CONSTANT_CONTACT_BASE_URL}/emails`, {
        params: {
          limit
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  // Create a campaign
  async createCampaign(campaignData: any): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.post(`${CONSTANT_CONTACT_BASE_URL}/emails`, campaignData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Send a test email for a campaign
  async sendTestEmail(campaignId: string, emailAddresses: string[]): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.post(`${CONSTANT_CONTACT_BASE_URL}/emails/${campaignId}/test`, {
        email_addresses: emailAddresses
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }

  // Schedule a campaign
  async scheduleCampaign(campaignId: string, scheduledTime: string): Promise<any> {
    try {
      const accessToken = await this.ensureValidCredentials();
      
      const response = await axios.post(`${CONSTANT_CONTACT_BASE_URL}/emails/${campaignId}/schedule`, {
        scheduled_date: scheduledTime
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      throw error;
    }
  }

  // Check if connected to Constant Contact
  async isConnected(): Promise<boolean> {
    try {
      await this.ensureValidCredentials();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create a singleton instance
export const constantContactService = new ConstantContactService();
import { Router, Request, Response } from 'express';
import { constantContactService } from '../services/constantContact';
import { storage } from '../storage';
import crypto from 'crypto';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

// Route to initiate OAuth2 flow
router.get('/authorize', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    
    // Generate a secure random state parameter to prevent CSRF attacks
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store the state in both the session and the database for redundancy
    if (req.session) {
      req.session.oauthState = state;
      
      // Save session immediately to ensure persistence
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            reject(err);
          } else {
            console.log('Session saved with state', { state, sessionId: req.session?.id });
            resolve();
          }
        });
      });
    }
    
    // Store state in database with expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await storage.createOAuthState({
      state,
      service: 'constant_contact',
      userId: req.user.id,
      expiresAt,
      used: false
    });
    
    const authUrl = constantContactService.getAuthorizationUrl(state);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// OAuth2 callback route
router.get('/callback', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    if (!state || typeof state !== 'string') {
      return res.status(400).json({ error: 'State parameter is missing' });
    }
    
    // Validate state from database (this is more reliable than session-based validation)
    const isValidState = await storage.validateAndUseOAuthState(state, 'constant_contact');
    
    if (!isValidState) {
      // Also check session as fallback
      const sessionState = req.session?.oauthState;
      
      if (!sessionState || sessionState !== state) {
        return res.status(400).json({ 
          error: 'Invalid state parameter. This could be due to an expired session or a security issue.'
        });
      }
      
      // If we got here, session state is valid but database state is not
      console.warn('OAuth state valid in session but not in database, proceeding with caution.');
    }

    // Exchange code for tokens
    await constantContactService.exchangeCodeForTokens(code);
    
    // Clear the OAuth state from session
    if (req.session) {
      delete req.session.oauthState;
    }
    
    // Redirect to the marketing dashboard
    res.redirect('/crm/marketing');
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).json({ error: 'Failed to complete OAuth flow' });
  }
});

// Check connection status
router.get('/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const isConnected = await constantContactService.isConnected();
    res.json({ connected: isConnected });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});

// Get contact lists
router.get('/lists', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const lists = await constantContactService.getContactLists();
    res.json(lists);
  } catch (error) {
    console.error('Error fetching contact lists:', error);
    res.status(500).json({ error: 'Failed to fetch contact lists' });
  }
});

// Create a new contact list
router.post('/lists', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const newList = await constantContactService.createContactList(name, description);
    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating contact list:', error);
    res.status(500).json({ error: 'Failed to create contact list' });
  }
});

// Get contacts
router.get('/contacts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const includeLists = req.query.include_lists !== 'false';
    
    const contacts = await constantContactService.getContacts(limit, includeLists);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create or update a contact
router.post('/contacts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const contactData = req.body;
    
    if (!contactData.email_address) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const contact = await constantContactService.createOrUpdateContact(contactData);
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating/updating contact:', error);
    res.status(500).json({ error: 'Failed to create/update contact' });
  }
});

// Get campaigns
router.get('/campaigns', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    const campaigns = await constantContactService.getCampaigns(limit);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create a campaign
router.post('/campaigns', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const campaignData = req.body;
    
    if (!campaignData.name || !campaignData.from_email || !campaignData.subject) {
      return res.status(400).json({ error: 'Name, from email, and subject are required' });
    }

    const campaign = await constantContactService.createCampaign(campaignData);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Send a test email for a campaign
router.post('/campaigns/:id/test', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email_addresses } = req.body;
    
    if (!email_addresses || !Array.isArray(email_addresses) || email_addresses.length === 0) {
      return res.status(400).json({ error: 'At least one email address is required' });
    }

    const result = await constantContactService.sendTestEmail(id, email_addresses);
    res.json(result);
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Schedule a campaign
router.post('/campaigns/:id/schedule', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduled_time } = req.body;
    
    if (!scheduled_time) {
      return res.status(400).json({ error: 'Scheduled time is required' });
    }

    const result = await constantContactService.scheduleCampaign(id, scheduled_time);
    res.json(result);
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({ error: 'Failed to schedule campaign' });
  }
});

export default router;
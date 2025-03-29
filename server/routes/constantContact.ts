import { Router, Request, Response } from 'express';
import { constantContactService } from '../services/constantContact';

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
    const authUrl = constantContactService.getAuthorizationUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// OAuth2 callback route
router.get('/callback', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    await constantContactService.exchangeCodeForTokens(code);
    
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
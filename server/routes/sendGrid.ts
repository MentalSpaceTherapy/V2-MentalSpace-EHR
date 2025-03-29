import { Express, Request, Response } from 'express';
import sendGridService from '../services/sendGrid';
import { z } from 'zod';

// Schema for test email validation
const testEmailSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  name: z.string().optional(),
  subject: z.string(),
  text: z.string(), // Required by SendGrid service
  html: z.string(),
});

// Schema for campaign validation
const campaignSchema = z.object({
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    dynamicData: z.record(z.any()).optional(),
  })),
  from: z.string().email(),
  fromName: z.string().optional(),
  subject: z.string(),
  textTemplate: z.string(), // Required by SendGrid service
  htmlTemplate: z.string(),
});

export function registerSendGridRoutes(app: Express) {
  // Check SendGrid configuration status
  app.get('/api/sendgrid/status', (req: Request, res: Response) => {
    try {
      const status = sendGridService.getConfigStatus();
      return res.json(status);
    } catch (error: any) {
      console.error('Error checking SendGrid status:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });
  
  // Send a test email
  app.post('/api/sendgrid/send-test', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = testEmailSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.format()
        });
      }
      
      const result = await sendGridService.sendTestEmail(validationResult.data);
      return res.json(result);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      return res.status(500).json({
        error: 'Failed to send test email',
        message: error.message
      });
    }
  });
  
  // Send a campaign to multiple recipients
  app.post('/api/sendgrid/send-campaign', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = campaignSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.format()
        });
      }
      
      // Filter out recipients without email addresses
      const validRecipients = validationResult.data.recipients.filter(r => r.email);
      
      if (validRecipients.length === 0) {
        return res.status(400).json({
          error: 'No valid recipients',
          message: 'At least one recipient with a valid email address is required'
        });
      }
      
      // Replace validationResult.data.recipients with filtered list
      const campaignData = {
        ...validationResult.data,
        recipients: validRecipients
      };
      
      const result = await sendGridService.sendCampaign(campaignData);
      return res.json(result);
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      return res.status(500).json({
        error: 'Failed to send campaign',
        message: error.message
      });
    }
  });
}
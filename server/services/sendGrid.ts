import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Service class for handling SendGrid email operations
 */
export class SendGridService {
  isConfigured: boolean;

  constructor() {
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
  }

  /**
   * Check if SendGrid is properly configured
   */
  getConfigStatus(): { configured: boolean } {
    return { configured: this.isConfigured };
  }

  /**
   * Send a single test email
   */
  async sendTestEmail(options: {
    to: string;
    from: string;
    name?: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('SendGrid API key is not configured');
    }

    try {
      const msg = {
        to: options.to,
        from: {
          email: options.from,
          name: options.name || 'MentalSpace EHR'
        },
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const response = await sgMail.send(msg);
      return {
        success: true,
        message: 'Test email sent successfully',
        response
      };
    } catch (error: any) {
      console.error('Error sending test email:', error);
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }

  /**
   * Send a campaign to multiple recipients
   */
  async sendCampaign(options: {
    recipients: Array<{
      email: string;
      name?: string;
      dynamicData?: Record<string, any>;
    }>;
    from: string;
    fromName?: string;
    subject: string;
    textTemplate: string;
    htmlTemplate: string;
  }): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('SendGrid API key is not configured');
    }

    if (!options.recipients || options.recipients.length === 0) {
      throw new Error('No recipients provided for the campaign');
    }

    try {
      // Create a personalized message for each recipient
      const messages = options.recipients.map(recipient => {
        // Replace template variables with recipient-specific data
        let personalizedHtml = options.htmlTemplate;
        let personalizedText = options.textTemplate;
        
        if (recipient.dynamicData) {
          Object.entries(recipient.dynamicData).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            personalizedHtml = personalizedHtml.replace(regex, value || '');
            personalizedText = personalizedText.replace(regex, value || '');
          });
        }

        return {
          to: {
            email: recipient.email,
            name: recipient.name
          },
          from: {
            email: options.from,
            name: options.fromName || 'MentalSpace EHR'
          },
          subject: options.subject,
          text: personalizedText,
          html: personalizedHtml
        };
      });

      // Send all emails in a batch
      const response = await sgMail.send(messages);
      
      return {
        success: true,
        message: `Campaign sent to ${messages.length} recipients`,
        response
      };
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      throw new Error(`Failed to send campaign: ${error.message}`);
    }
  }

  /**
   * Process and format email templates by replacing variables
   */
  processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;
    
    // Replace any template variables with actual data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || '');
    });
    
    // Remove any remaining template variables
    processed = processed.replace(/{{[^{}]+}}/g, '');
    
    return processed;
  }
}

export default new SendGridService();
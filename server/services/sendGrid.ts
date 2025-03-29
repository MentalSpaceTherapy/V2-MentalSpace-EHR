import sgMail from '@sendgrid/mail';

/**
 * Service class for handling SendGrid email operations
 */
export class SendGridService {
  isConfigured: boolean;

  constructor() {
    // Check if the SendGrid API key is set
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
    
    if (this.isConfigured) {
      // Initialize SendGrid with API key
      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    }
  }

  /**
   * Check if SendGrid is properly configured
   */
  getConfigStatus(): { configured: boolean } {
    return {
      configured: this.isConfigured,
    };
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
  }): Promise<{ success: boolean; message?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'SendGrid API key is not configured',
      };
    }

    try {
      const { to, from, name, subject, text, html } = options;
      
      const fromEmail = name ? `${name} <${from}>` : from;

      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        text,
        html,
      });

      return { success: true };
    } catch (error: any) {
      console.error('SendGrid test email error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send test email',
      };
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
  }): Promise<{ success: boolean; message?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'SendGrid API key is not configured',
      };
    }

    try {
      const { recipients, from, fromName, subject, textTemplate, htmlTemplate } = options;
      
      const fromEmail = fromName ? `${fromName} <${from}>` : from;
      
      // Create personalized messages for each recipient
      const emails = recipients.map(recipient => {
        const { email, name, dynamicData } = recipient;
        
        // Process templates with personalization data
        const personalizedHtml = this.processTemplate(htmlTemplate, dynamicData || {});
        const personalizedText = this.processTemplate(textTemplate, dynamicData || {});
        
        return {
          to: name ? `${name} <${email}>` : email,
          from: fromEmail,
          subject,
          text: personalizedText,
          html: personalizedHtml,
        };
      });
      
      // Send all emails
      await sgMail.send(emails);
      
      return { success: true };
    } catch (error: any) {
      console.error('SendGrid campaign error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send campaign',
      };
    }
  }

  /**
   * Process and format email templates by replacing variables
   */
  processTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    
    // Replace all variables in the format {variableName} with their values
    const variableRegex = /\{([^\}]+)\}/g;
    result = result.replace(variableRegex, (match, variable) => {
      return data[variable] !== undefined ? data[variable] : match;
    });
    
    return result;
  }
}

// Export singleton instance
export const sendGridService = new SendGridService();
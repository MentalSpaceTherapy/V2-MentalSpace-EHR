import nodemailer from 'nodemailer';
import { logger } from '../logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

// Initialize email transport
let transporter: nodemailer.Transporter;

// Initialize email service based on environment
function initializeEmailService() {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES, etc.)
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // Using SendGrid
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
      logger.info('Email service initialized with SendGrid');
    } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      // Using custom SMTP server
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      logger.info('Email service initialized with custom SMTP server');
    } else {
      logger.warn('No email configuration found. Emails will not be sent in production.');
      setupDevEmailService();
    }
  } else {
    // Development/Test email service (uses Ethereal for testing)
    setupDevEmailService();
  }
}

// Setup development email service using ethereal.email
async function setupDevEmailService() {
  try {
    // Create a test account on ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    // Create reusable transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    logger.info(`Development email service initialized with Ethereal
                (${testAccount.user})`);
    logger.info(`View test emails at: https://ethereal.email/login
                 Username: ${testAccount.user}
                 Password: ${testAccount.pass}`);
  } catch (error) {
    logger.error('Failed to create test email account:', error);
    throw new Error('Could not initialize email service');
  }
}

// Send an email
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Initialize email service if not already done
  if (!transporter) {
    initializeEmailService();
  }
  
  const { to, subject, text, html, from } = options;
  
  // Use default from address if not provided
  const fromAddress = from || process.env.EMAIL_FROM || 'MentalSpace EHR <noreply@mentalspaceehr.com>';
  
  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html: html || text,
    });
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Email sent to ${to}`);
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      logger.info(`Email sent to ${to}`);
    }
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw new Error('Failed to send email');
  }
}

// Initialize email service on module load
initializeEmailService(); 
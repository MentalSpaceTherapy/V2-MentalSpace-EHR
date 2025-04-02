/**
 * Logger utility with environment-aware logging levels and audit capabilities
 */

import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create audit log file paths
const authAuditLogPath = path.join(logsDir, 'auth_audit.log');
const securityAuditLogPath = path.join(logsDir, 'security_audit.log');

// Function to write to audit log files
const writeToAuditLog = (logPath: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  fs.appendFile(logPath, logEntry, (err) => {
    if (err) {
      console.error(`Failed to write to audit log: ${err.message}`);
    }
  });
};

export const logger = {
  info: (message: string) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`);
  },
  
  error: (message: string, error?: any) => {
    const errorDetails = error ? `: ${error.message || JSON.stringify(error)}` : '';
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}${errorDetails}`);
  },
  
  warn: (message: string) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`);
  },
  
  debug: (message: string) => {
    // Only log debug messages in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`);
    }
  },
  
  // Log for general security-related events
  security: (message: string) => {
    console.log(`[SECURITY] [${new Date().toISOString()}] ${message}`);
    
    // Also write to security audit log file
    writeToAuditLog(securityAuditLogPath, `[SECURITY] ${message}`);
  },
  
  // Specialized audit logging for authentication events
  audit: {
    auth: (action: string, userId: string | number | null, details: Record<string, any> = {}) => {
      const userIdStr = userId !== null ? userId.toString() : 'anonymous';
      const detailsStr = Object.keys(details).length ? ` - ${JSON.stringify(details)}` : '';
      const message = `[AUTH] User ${userIdStr} - ${action}${detailsStr}`;
      
      // Log to console in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUDIT] ${message}`);
      }
      
      // Always write to auth audit log file
      writeToAuditLog(authAuditLogPath, message);
    },
    
    access: (action: string, userId: string | number, resource: string, success: boolean, details: Record<string, any> = {}) => {
      const result = success ? 'SUCCESS' : 'DENIED';
      const detailsStr = Object.keys(details).length ? ` - ${JSON.stringify(details)}` : '';
      const message = `[ACCESS] User ${userId} - ${action} - Resource: ${resource} - Result: ${result}${detailsStr}`;
      
      // Log to console in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUDIT] ${message}`);
      }
      
      // Always write to security audit log file
      writeToAuditLog(securityAuditLogPath, message);
    }
  }
}; 
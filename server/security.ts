import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { logger } from './logger';
import { db } from './db';
import { URL } from 'url';
import { wipeObjectProperties } from './utils/secure-memory';

// Interfaces for security-related data
export interface SecurityAuditLog {
  id?: number;
  userId: number;
  action: string;
  ipAddress: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp?: Date;
  isResolved?: boolean;
  resolvedBy?: number | null;
  resolvedAt?: Date | null;
}

export interface LoginAttemptCheck {
  blocked: boolean;
  remainingLockTime?: number;
  attemptCount?: number;
}

export interface LoginAttempt {
  id?: number;
  username?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp?: Date;
  success: boolean;
  attemptCount?: number;
}

/**
 * Security service to handle security-related operations
 * Centralized service for audit logging, login attempts, and other security features
 */
class SecurityService {
  private db: Pool;
  
  constructor(dbInstance: Pool) {
    this.db = dbInstance;
  }
  
  /**
   * Get the client's real IP address
   * Takes into account various proxy headers
   */
  getClientIp(req: Request): string {
    const xForwardedFor = req.headers['x-forwarded-for'] as string;
    if (xForwardedFor) {
      // Get the first IP in case of multiple proxies
      return xForwardedFor.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }
  
  /**
   * Create a security audit log entry
   */
  async createAuditLog(
    userId: number,
    action: string,
    ipAddress: string,
    details: Record<string, any>,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  ): Promise<SecurityAuditLog> {
    try {
      const result = await this.db.query(
        `INSERT INTO security_audit 
         (user_id, action, ip_address, details, severity) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userId, action, ipAddress, JSON.stringify(details), severity]
      );
      
      return {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        action: result.rows[0].action,
        ipAddress: result.rows[0].ip_address,
        details: result.rows[0].details,
        severity: result.rows[0].severity as 'LOW' | 'MEDIUM' | 'HIGH',
        timestamp: result.rows[0].timestamp,
        isResolved: result.rows[0].is_resolved,
        resolvedBy: result.rows[0].resolved_by,
        resolvedAt: result.rows[0].resolved_at
      };
    } catch (error) {
      logger.error('Failed to create security audit log:', error);
      throw error;
    }
  }
  
  /**
   * Get security audit logs with optional filters
   */
  async getAuditLogs(filters?: {
    userId?: number;
    action?: string;
    severity?: string;
    from?: Date;
    to?: Date;
    isResolved?: boolean;
  }): Promise<SecurityAuditLog[]> {
    try {
      let query = `
        SELECT * FROM security_audit 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;
      
      if (filters) {
        if (filters.userId !== undefined) {
          query += ` AND user_id = $${paramIndex++}`;
          params.push(filters.userId);
        }
        
        if (filters.action) {
          query += ` AND action = $${paramIndex++}`;
          params.push(filters.action);
        }
        
        if (filters.severity) {
          query += ` AND severity = $${paramIndex++}`;
          params.push(filters.severity);
        }
        
        if (filters.from) {
          query += ` AND timestamp >= $${paramIndex++}`;
          params.push(filters.from);
        }
        
        if (filters.to) {
          query += ` AND timestamp <= $${paramIndex++}`;
          params.push(filters.to);
        }
        
        if (filters.isResolved !== undefined) {
          query += ` AND is_resolved = $${paramIndex++}`;
          params.push(filters.isResolved);
        }
      }
      
      query += ` ORDER BY timestamp DESC`;
      
      const result = await this.db.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        ipAddress: row.ip_address,
        details: row.details,
        severity: row.severity as 'LOW' | 'MEDIUM' | 'HIGH',
        timestamp: row.timestamp,
        isResolved: row.is_resolved,
        resolvedBy: row.resolved_by,
        resolvedAt: row.resolved_at
      }));
    } catch (error) {
      logger.error('Failed to get security audit logs:', error);
      throw error;
    }
  }
  
  /**
   * Mark a security audit log as resolved
   */
  async resolveAuditLog(id: number, resolvedBy: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `UPDATE security_audit 
         SET is_resolved = true, resolved_by = $1, resolved_at = NOW() 
         WHERE id = $2 
         RETURNING id`,
        [resolvedBy, id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Failed to resolve security audit log ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Record a login attempt (successful or failed)
   */
  async recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
    try {
      // First check if there's a recent attempt from this IP/username
      const existingQuery = attempt.username 
        ? `SELECT * FROM login_attempts 
           WHERE ip_address = $1 AND username = $2 
           AND timestamp > NOW() - INTERVAL '30 minutes'
           ORDER BY timestamp DESC LIMIT 1`
        : `SELECT * FROM login_attempts 
           WHERE ip_address = $1 
           AND timestamp > NOW() - INTERVAL '30 minutes'
           ORDER BY timestamp DESC LIMIT 1`;
      
      const existingParams = attempt.username 
        ? [attempt.ipAddress, attempt.username]
        : [attempt.ipAddress];
      
      const existingResult = await this.db.query(existingQuery, existingParams);
      
      if (existingResult.rows.length > 0 && !attempt.success) {
        // Increment the attempt count for unsuccessful attempts
        await this.db.query(
          `UPDATE login_attempts 
           SET attempt_count = attempt_count + 1, timestamp = NOW() 
           WHERE id = $1`,
          [existingResult.rows[0].id]
        );
      } else {
        // Insert a new record
        await this.db.query(
          `INSERT INTO login_attempts 
           (username, ip_address, user_agent, success, attempt_count) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            attempt.username || null, 
            attempt.ipAddress, 
            attempt.userAgent || null, 
            attempt.success, 
            attempt.attemptCount || 1
          ]
        );
      }
    } catch (error) {
      logger.error('Failed to record login attempt:', error);
      // Don't throw here to prevent authentication errors
    }
  }
  
  /**
   * Check if login attempts from an IP should be blocked
   */
  async checkLoginAttempts(ipAddress: string): Promise<LoginAttemptCheck> {
    try {
      // Get the maximum allowed attempts from environment or default to 5
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      
      // Get the lockout duration from environment or default to 15 minutes (900 seconds)
      const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || '900');
      
      // Check for recent failed attempts
      const result = await this.db.query(
        `SELECT 
           SUM(attempt_count) as total_attempts,
           MAX(timestamp) as last_attempt
         FROM login_attempts 
         WHERE ip_address = $1 
           AND success = false 
           AND timestamp > NOW() - INTERVAL '30 minutes'`,
        [ipAddress]
      );
      
      const totalAttempts = parseInt(result.rows[0]?.total_attempts) || 0;
      const lastAttempt = result.rows[0]?.last_attempt;
      
      // If no attempts or under the limit, not blocked
      if (!lastAttempt || totalAttempts < maxAttempts) {
        return { 
          blocked: false,
          attemptCount: totalAttempts
        };
      }
      
      // Calculate time since last attempt
      const timeSinceLastAttempt = Math.floor(
        (Date.now() - new Date(lastAttempt).getTime()) / 1000
      );
      
      // If lockout duration has passed, not blocked
      if (timeSinceLastAttempt >= lockoutDuration) {
        return { 
          blocked: false,
          attemptCount: totalAttempts
        };
      }
      
      // Still in lockout period
      return {
        blocked: true,
        remainingLockTime: lockoutDuration - timeSinceLastAttempt,
        attemptCount: totalAttempts
      };
    } catch (error) {
      logger.error('Failed to check login attempts:', error);
      // Return not blocked to prevent locking out users due to errors
      return { blocked: false };
    }
  }
  
  /**
   * Clear login attempts for an IP address
   */
  async clearLoginAttempts(ipAddress: string, username?: string): Promise<void> {
    try {
      const query = username
        ? `DELETE FROM login_attempts WHERE ip_address = $1 AND username = $2`
        : `DELETE FROM login_attempts WHERE ip_address = $1`;
      
      const params = username ? [ipAddress, username] : [ipAddress];
      
      await this.db.query(query, params);
    } catch (error) {
      logger.error('Failed to clear login attempts:', error);
      // Don't throw to prevent authentication errors
    }
  }
  
  /**
   * Validate external URLs to prevent open redirect vulnerabilities
   */
  validateExternalUrl(url: string): boolean {
    try {
      // Check if URL is valid
      const parsedUrl = new URL(url);
      
      // List of allowed domains for redirects
      const allowedDomains = (process.env.ALLOWED_REDIRECT_DOMAINS || '').split(',')
        .map(domain => domain.trim())
        .filter(Boolean);
      
      // Add the current domain if present
      if (process.env.APP_DOMAIN) {
        allowedDomains.push(process.env.APP_DOMAIN);
      }
      
      // Check if the URL's domain is in the allowed list
      return allowedDomains.some(domain => 
        parsedUrl.hostname === domain || 
        parsedUrl.hostname.endsWith(`.${domain}`)
      );
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Clean sensitive data from objects before logging
   */
  sanitizeDataForLogging(data: Record<string, any>, sensitiveFields: string[] = []): Record<string, any> {
    // Default sensitive fields to sanitize
    const defaultSensitiveFields = [
      'password', 'passwordHash', 'token', 'secret', 'apiKey', 'key',
      'ssn', 'socialSecurity', 'creditCard', 'cardNumber', 'cvv',
      'accessToken', 'refreshToken', 'authToken'
    ];
    
    // Combine default and custom sensitive fields
    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
    
    // Create a deep copy to avoid modifying original
    const sanitizedData = JSON.parse(JSON.stringify(data));
    
    // Recursively sanitize the data
    const sanitizeObject = (obj: Record<string, any>) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        // Check if this key should be sanitized
        if (allSensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        )) {
          // Replace with [REDACTED]
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          // Recursively sanitize nested objects
          sanitizeObject(obj[key]);
        }
      });
    };
    
    sanitizeObject(sanitizedData);
    return sanitizedData;
  }
  
  // Middleware functions
  
  /**
   * Middleware to track client IP address and store in session
   */
  ipTrackingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (req.session) {
        const clientIp = this.getClientIp(req);
        
        // Check if this is a new IP address
        if (req.session.lastIpAddress && req.session.lastIpAddress !== clientIp && req.session.user) {
          // Log potential suspicious activity - IP changed mid-session
          logger.warn(`Session IP changed: User ${req.session.user.id} (${req.session.user.username}) - ` +
            `Previous: ${req.session.lastIpAddress}, Current: ${clientIp}`);
          
          // Record the IP change in audit log
          if (req.session.user.id) {
            this.createAuditLog(
              req.session.user.id,
              'IP_CHANGE',
              clientIp,
              {
                previousIp: req.session.lastIpAddress,
                newIp: clientIp,
                userAgent: req.headers['user-agent'] || 'unknown'
              },
              'MEDIUM'
            ).catch(err => {
              logger.error('Failed to log IP change:', err);
            });
          }
        }
        
        // Update session with current IP
        req.session.lastIpAddress = clientIp;
      }
      next();
    } catch (error) {
      logger.error('Error in IP tracking middleware:', error);
      next();
    }
  }
  
  /**
   * Middleware to prevent request parameter pollution
   */
  preventParamPollutionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check query parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          // If a parameter appears multiple times as an array, take the first value
          if (Array.isArray(value)) {
            req.query[key] = value[0];
            logger.warn(`Parameter pollution detected - duplicate query param: ${key}`);
          }
        }
      }
      
      // Check body parameters (only applicable for specific content types)
      if (req.body && typeof req.body === 'object') {
        // For each parameter, check if it's an unexpected array
        for (const [key, value] of Object.entries(req.body)) {
          if (Array.isArray(value) && !key.endsWith('[]') && !key.endsWith('List')) {
            // Parameter is an array but not explicitly named as one
            req.body[key] = value[0];
            logger.warn(`Parameter pollution detected - duplicate body param: ${key}`);
          }
        }
      }
      
      next();
    } catch (error) {
      logger.error('Error in parameter pollution prevention middleware:', error);
      next();
    }
  }
  
  /**
   * Middleware to check for multiple failed login attempts from the same IP
   */
  checkLoginAttemptsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const clientIp = this.getClientIp(req);
      
      this.checkLoginAttempts(clientIp)
        .then(result => {
          if (result.blocked) {
            return res.status(429).json({
              message: `Too many failed login attempts. Please try again after ${result.remainingLockTime} seconds.`
            });
          }
          next();
        })
        .catch(error => {
          logger.error('Error checking login attempts:', error);
          next();
        });
    } catch (error) {
      logger.error('Error in login attempts middleware:', error);
      next();
    }
  }
  
  /**
   * Middleware to handle request cleanup - wipe sensitive data
   */
  cleanupMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method
    res.end = function(cb?: () => void): any {
      try {
        // Wipe sensitive data from request
        if (req.body) {
          wipeObjectProperties(req.body, [
            'password', 'passwordConfirm', 'token', 'secret',
            'ssn', 'socialSecurityNumber', 'creditCard'
          ]);
        }
      } catch (error) {
        logger.error('Error in cleanup middleware:', error);
      }
      
      // Call original end method
      return originalEnd.call(this, cb);
    };
    
    next();
  }
}

// Create an instance using the database connection
export const securityService = new SecurityService(db); 
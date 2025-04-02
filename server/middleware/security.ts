import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../logger';
import { storage } from '../storage';
import { URL } from 'url';

/**
 * Get the client's real IP address
 * Takes into account various proxy headers
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'] as string;
  if (xForwardedFor) {
    // Get the first IP in case of multiple proxies
    return xForwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Middleware to track client IP address and store in session
 * Helps with security monitoring
 */
export function ipTrackingMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.session) {
      const clientIp = getClientIp(req);
      
      // Check if this is a new IP address
      if (req.session.lastIpAddress && req.session.lastIpAddress !== clientIp && req.session.user) {
        // Log potential suspicious activity - IP changed mid-session
        logger.warn(`Session IP changed: User ${req.session.user.id} (${req.session.user.username}) - ` +
          `Previous: ${req.session.lastIpAddress}, Current: ${clientIp}`);
        
        // Record the IP change in audit log
        if (req.session.user.id) {
          storage.createSecurityAuditLog({
            userId: req.session.user.id,
            action: 'IP_CHANGE',
            ipAddress: clientIp,
            details: JSON.stringify({
              previousIp: req.session.lastIpAddress,
              newIp: clientIp,
              userAgent: req.headers['user-agent'] || 'unknown'
            }),
            severity: 'MEDIUM'
          }).catch(err => {
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
 * Create a security audit log entry
 */
export async function createAuditLog(
  req: Request,
  action: string,
  details: Record<string, any>,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
): Promise<void> {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return;
    
    await storage.createSecurityAuditLog({
      userId,
      action,
      ipAddress: getClientIp(req),
      details: JSON.stringify(details),
      severity
    });
  } catch (error) {
    logger.error(`Failed to create audit log for ${action}:`, error);
  }
}

/**
 * Middleware to validate request data against a Zod schema
 */
export function validateRequest<T>(schema: z.ZodType<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      // Replace the request data with the validated data
      (req as any)[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Invalid request data',
          errors: error.errors
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate external URLs to prevent open redirect vulnerabilities
 */
export function validateExternalUrl(url: string): boolean {
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
 * Middleware to prevent request parameter pollution
 * Prevents attacks that submit duplicate parameters
 */
export function preventParamPollution(req: Request, res: Response, next: NextFunction): void {
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
 * Helps prevent brute force attacks
 */
export function checkLoginAttemptsMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const clientIp = getClientIp(req);
    
    // This would use a more robust implementation in production
    // with Redis or a database to track attempts across application instances
    storage.checkLoginAttempts(clientIp)
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
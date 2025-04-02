import { errorHandler, ApiError } from './errorHandler';
import { isAuthenticated, hasRole, isOwnerOrAdmin } from './roleAccess';
import { canAccessClient, canAccessClientId } from './clientAccess';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

/**
 * Middleware to log all requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log when request is received
  logger.info(`[REQUEST] ${req.method} ${req.path}`);
  
  // Add a listener for when the response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Use different log levels based on status code
    if (statusCode >= 500) {
      logger.error(`[RESPONSE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`);
    } else if (statusCode >= 400) {
      logger.warn(`[RESPONSE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`);
    } else {
      logger.info(`[RESPONSE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Middleware to handle 404 errors for routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Route not found: ${req.method} ${req.path}`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

/**
 * Security middleware to set common security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  
  next();
};

// Export all middleware
export {
  errorHandler,
  ApiError,
  isAuthenticated,
  hasRole,
  isOwnerOrAdmin,
  canAccessClient,
  canAccessClientId
}; 
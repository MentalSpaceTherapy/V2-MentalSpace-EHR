import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { z } from 'zod';
import { 
  ApiError, 
  HttpStatus, 
  ErrorCode,
  validationError,
  fromError,
  internalServerError
} from '../utils/api-error';

/**
 * Global error handling middleware for Express
 * 
 * This middleware catches all errors thrown in routes and middleware,
 * formats them consistently, and sends the appropriate HTTP response.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error: ApiError;
  
  // Convert to ApiError for consistent handling
  
  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    error = validationError('Validation failed', {
      errors: err.errors,
      path: req.path
    });
    
    logger.warn(`Validation Error at ${req.method} ${req.path}: ${JSON.stringify(err.errors)}`);
  } 
  // Handle API errors directly
  else if (err instanceof ApiError) {
    error = err;
  } 
  // Handle PostgreSQL errors
  else if (err.code && err.code.startsWith('PG')) {
    error = handlePostgresError(err, req);
  }
  // Handle other errors
  else {
    error = fromError(err);
  }
  
  // Log based on error severity
  logError(error, req);
  
  // Determine if stack trace should be included (not in production unless it's a non-operational error)
  const includeStack = process.env.NODE_ENV !== 'production' || !error.operational;
  
  // Build the error response
  const errorResponse = {
    status: 'error',
    message: error.message,
    code: error.code,
    requestId: req.headers['x-request-id'] || undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };
  
  // Include details in non-production or if specifically provided
  if (error.details || includeStack) {
    Object.assign(errorResponse, {
      details: error.details,
      stack: includeStack ? error.stack : undefined
    });
  }
  
  // Log audit info for authentication and authorization errors
  if (error.code.includes('AUTH') || error.statusCode === 401 || error.statusCode === 403) {
    const userId = req.user ? (req.user as any).id : null;
    logger.audit.access(
      'api_auth_error', 
      userId, 
      req.path, 
      false, 
      {
        ip: req.ip,
        method: req.method,
        code: error.code,
        statusCode: error.statusCode,
      }
    );
  }
    
  // Send response
  res.status(error.statusCode).json(errorResponse);
};

/**
 * Log errors based on their severity
 */
function logError(error: ApiError, req: Request): void {
  const { method, path, ip } = req;
  const userId = req.user ? `user:${(req.user as any).id}` : 'anonymous';
  const logMessage = `[${method}] ${path} from ${ip} by ${userId} - ${error.message}`;
  
  // Log different error types with appropriate severity
  if (error.statusCode >= 500) {
    // Server errors are logged with error level
    logger.error(`Server Error: ${logMessage}`);
    logger.error(error.stack || '(No stack trace)');
  } 
  else if (error.statusCode === 401) {
    // Auth errors with warn level
    logger.warn(`Authentication Error: ${logMessage}`);
  }
  else if (error.statusCode === 403) {
    // Permission errors with warn level
    logger.warn(`Authorization Error: ${logMessage}`);
  }
  else if (error.statusCode === 404) {
    // Not found with info level
    logger.info(`Not Found: ${logMessage}`);
  }
  else if (error.statusCode === 429) {
    // Rate limiting with warn level
    logger.warn(`Rate Limited: ${logMessage}`);
  }
  else {
    // Other client errors with info level
    logger.info(`Client Error: ${logMessage}`);
  }
}

/**
 * Handle PostgreSQL error codes and convert to ApiErrors
 */
function handlePostgresError(pgError: any, req: Request): ApiError {
  const { code, detail, constraint, table } = pgError;
  
  // Common PostgreSQL error handling
  switch (code) {
    // Unique constraint violation
    case '23505':
      return new ApiError(
        `Duplicate entry in ${table || 'database'}: ${constraint || detail || 'unique constraint violated'}`,
        HttpStatus.CONFLICT,
        ErrorCode.RESOURCE_EXISTS,
        { constraint, detail, table },
        'database',
        true
      );
    
    // Foreign key constraint
    case '23503':
      return new ApiError(
        `Reference error: ${detail || 'foreign key constraint violated'}`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.REFERENTIAL_INTEGRITY_ERROR,
        { constraint, detail, table },
        'database',
        true
      );
    
    // Not null violation
    case '23502':
      return new ApiError(
        `Required field missing: ${detail || 'not null constraint violated'}`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.MISSING_REQUIRED_FIELD,
        { constraint, detail, table },
        'database',
        true
      );
      
    // Connection errors
    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
      return new ApiError(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.DATABASE_ERROR,
        { originalError: pgError.message },
        'database',
        true
      );
      
    // Default database error
    default:
      return new ApiError(
        `Database error: ${pgError.message || 'Unknown database error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.DATABASE_ERROR,
        { code, detail, constraint, table },
        'database',
        true
      );
  }
}

// Export types and utilities
export { 
  ApiError,
  HttpStatus,
  ErrorCode
};

// Re-export helper functions for convenience
export {
  validationError,
  resourceNotFoundError,
  forbiddenError,
  authenticationRequiredError,
  invalidCredentialsError,
  sessionExpiredError,
  insufficientPermissionsError,
  resourceExistsError,
  internalServerError,
  databaseError
} from '../utils/api-error'; 
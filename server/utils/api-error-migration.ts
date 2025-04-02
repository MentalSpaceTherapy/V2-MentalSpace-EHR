/**
 * Migration utility to help transition from legacy error handlers to the new API error system
 * 
 * This file provides functions and documentation to help refactor route handlers and middleware
 * to use the new standardized error system.
 */

import { Request, Response, NextFunction } from 'express';
import { 
  ApiError,
  resourceNotFoundError,
  forbiddenError,
  operationFailedError,
  validationError,
  authenticationRequiredError,
  insufficientPermissionsError,
  databaseError
} from './api-error';

/**
 * MIGRATION GUIDE:
 * 
 * 1. Legacy imports to replace:
 *    - Replace: import { asyncHandler, createError, notFoundError, forbiddenError } from '../utils/error-handler';
 *    - With:    import { asyncHandler } from '../utils/error-handler';
 *               import { resourceNotFoundError, forbiddenError, operationFailedError } from '../utils/api-error';
 * 
 * 2. Error function replacements:
 *    - Replace: throw notFoundError('Resource');
 *    - With:    throw resourceNotFoundError('Resource', id);
 * 
 *    - Replace: throw createError("Failed operation", 500, "OPERATION_FAILED");
 *    - With:    throw operationFailedError('operationName', 'failed to complete');
 * 
 * 3. Database error handling:
 *    - Use try/catch blocks for database operations
 *    - In catch blocks: throw databaseError('Failed to query database', { originalError: error });
 */

/**
 * Common migration mapping between legacy error types and new API error functions
 */
export const errorMappings: Record<string, string> = {
  // Error type replacements
  'notFoundError': 'resourceNotFoundError',
  'createError("Failed to': 'operationFailedError',
  'createError("Unauthorized': 'authenticationRequiredError',
  'createError("Forbidden': 'forbiddenError',
  'createError("Invalid': 'validationError',
  
  // Common status code and error code replacements
  '404, "NOT_FOUND"': 'HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND',
  '400, "VALIDATION_ERROR"': 'HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR',
  '401, "UNAUTHORIZED"': 'HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_REQUIRED',
  '403, "FORBIDDEN"': 'HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN',
  '500, "SERVER_ERROR"': 'HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR'
};

/**
 * Wrapper for database operations that automatically handles common database errors
 * @param operation Function that performs a database operation
 * @param errorMessage Custom error message
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check for specific database error conditions
    if (error.code && error.code.startsWith('PG')) {
      throw databaseError(errorMessage, { originalError: error });
    }
    
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Otherwise wrap in a database error
    throw databaseError(errorMessage, { originalError: error });
  }
}

/**
 * Re-export commonly used error functions for convenience
 */
export {
  resourceNotFoundError,
  forbiddenError,
  operationFailedError,
  authenticationRequiredError,
  insufficientPermissionsError,
  validationError,
  databaseError
}; 
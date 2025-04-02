/**
 * Standardized error handling utilities for the frontend
 * 
 * This module provides consistent error handling across the application
 * and integrates with the backend error handling system.
 */

import { toast } from 'react-hot-toast';

// Error types that map to backend error codes
export enum ErrorType {
  // Authentication errors
  AUTHENTICATION = 'authentication',
  UNAUTHORIZED = 'unauthorized',
  
  // Authorization errors
  FORBIDDEN = 'forbidden',
  
  // Resource errors
  NOT_FOUND = 'not_found',
  
  // Validation errors
  VALIDATION = 'validation',
  
  // Network errors
  NETWORK = 'network',
  
  // Server errors
  SERVER = 'server',
  
  // Unknown errors
  UNKNOWN = 'unknown'
}

// Interface for standardized error objects
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  original?: Error;
}

/**
 * Creates a standardized application error
 */
export function createError(
  type: ErrorType,
  message: string,
  code?: string,
  details?: any,
  originalError?: Error
): AppError {
  return {
    type,
    message,
    code,
    details,
    original: originalError
  };
}

/**
 * Parses an error from any source into a standardized AppError
 */
export function parseError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (typeof error === 'object' && error !== null && 'type' in error && 'message' in error) {
    return error as AppError;
  }

  // If it's a Response object from fetch API
  if (error instanceof Response) {
    const status = error.status;
    let type = ErrorType.UNKNOWN;
    let message = error.statusText || 'An error occurred';

    switch (status) {
      case 401:
        type = ErrorType.UNAUTHORIZED;
        message = 'You need to be logged in to perform this action';
        break;
      case 403:
        type = ErrorType.FORBIDDEN;
        message = 'You do not have permission to perform this action';
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        message = 'The requested resource was not found';
        break;
      case 422:
        type = ErrorType.VALIDATION;
        message = 'Validation failed';
        break;
      default:
        if (status >= 500) {
          type = ErrorType.SERVER;
          message = 'A server error occurred';
        }
    }

    return createError(type, message, `HTTP_${status}`);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
      return createError(
        ErrorType.NETWORK,
        'Could not connect to the server. Please check your internet connection.',
        'NETWORK_ERROR',
        undefined,
        error
      );
    }

    // Default error handling
    return createError(
      ErrorType.UNKNOWN,
      error.message || 'An unexpected error occurred',
      'UNEXPECTED_ERROR',
      undefined,
      error
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return createError(ErrorType.UNKNOWN, error);
  }

  // Default unknown error
  return createError(
    ErrorType.UNKNOWN,
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    { rawError: error }
  );
}

/**
 * Displays an error toast with standardized formatting
 */
export function showErrorToast(error: unknown) {
  const appError = parseError(error);
  
  toast.error(appError.message, {
    duration: 4000,
    position: 'top-right',
  });
  
  // Log the error to console for debugging
  console.error('Application error:', appError);
  
  return appError;
}

/**
 * Handles an error in a standard way and returns the parsed error
 */
export function handleError(error: unknown): AppError {
  const appError = parseError(error);
  
  // Log all errors to console
  console.error('Error:', appError);
  
  // Return the standardized error
  return appError;
}

/**
 * Tries to extract a user-friendly message from a backend API error response
 */
export async function getErrorMessageFromResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    
    // Check if it's our standard API error format
    if (data.status === 'error' && data.message) {
      return data.message;
    }
    
    // Fallback to status text
    return response.statusText || `Error: ${response.status}`;
  } catch (e) {
    // If we can't parse the JSON, just return the status
    return response.statusText || `Error: ${response.status}`;
  }
} 
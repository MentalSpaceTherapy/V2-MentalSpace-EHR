/**
 * Centralized API Error Module
 * 
 * Defines standard error types, codes, and utilities for consistent error handling
 * across all API endpoints in the MentalSpace EHR application.
 */

// Standard HTTP status codes mapped to common application scenarios
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// Application-specific error codes for client identification
export enum ErrorCode {
  // Authentication errors
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Data errors
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR',
  REFERENTIAL_INTEGRITY_ERROR = 'REFERENTIAL_INTEGRITY_ERROR',
  
  // Operation errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
  
  // Route errors
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED'
}

/**
 * Custom error class for API errors with standardized properties
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: any;
  readonly source?: string;
  readonly timestamp: Date;
  readonly operational: boolean;

  /**
   * Creates a new API Error
   * 
   * @param message Human-readable error message
   * @param statusCode HTTP status code
   * @param code Application-specific error code
   * @param details Additional error details
   * @param source Error source (e.g., component or function name)
   * @param operational Whether this is an operational error (vs. programming error)
   */
  constructor(
    message: string, 
    statusCode: number, 
    code: ErrorCode,
    details?: any,
    source?: string,
    operational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.source = source;
    this.timestamp = new Date();
    this.operational = operational;
    
    // Captures stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a plain object for serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      source: this.source,
      timestamp: this.timestamp.toISOString(),
      operational: this.operational,
      stack: process.env.NODE_ENV !== 'production' ? this.stack : undefined
    };
  }
}

// Authentication errors
export function authenticationRequiredError(
  message: string = 'Authentication is required to access this resource',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.UNAUTHORIZED,
    ErrorCode.AUTHENTICATION_REQUIRED,
    details,
    'auth'
  );
}

export function invalidCredentialsError(
  message: string = 'Invalid username or password',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.UNAUTHORIZED,
    ErrorCode.INVALID_CREDENTIALS,
    details,
    'auth'
  );
}

export function sessionExpiredError(
  message: string = 'Your session has expired, please log in again',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.UNAUTHORIZED,
    ErrorCode.SESSION_EXPIRED,
    details,
    'auth'
  );
}

// Authorization errors
export function forbiddenError(
  message: string = 'You do not have permission to perform this action',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.FORBIDDEN,
    ErrorCode.FORBIDDEN,
    details,
    'auth'
  );
}

export function insufficientPermissionsError(
  message: string = 'You do not have sufficient permissions for this resource',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.FORBIDDEN,
    ErrorCode.INSUFFICIENT_PERMISSIONS,
    details,
    'auth'
  );
}

// Resource errors
export function resourceNotFoundError(
  resourceType: string,
  identifier?: string | number,
  details?: any
): ApiError {
  const message = identifier 
    ? `${resourceType} with identifier '${identifier}' was not found`
    : `${resourceType} not found`;
    
  return new ApiError(
    message,
    HttpStatus.NOT_FOUND,
    ErrorCode.RESOURCE_NOT_FOUND,
    details,
    'resource'
  );
}

export function resourceExistsError(
  resourceType: string,
  identifier: string | number,
  details?: any
): ApiError {
  return new ApiError(
    `${resourceType} with identifier '${identifier}' already exists`,
    HttpStatus.CONFLICT,
    ErrorCode.RESOURCE_EXISTS,
    details,
    'resource'
  );
}

// Validation errors
export function validationError(
  message: string = 'Validation failed',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_ERROR,
    details,
    'validation'
  );
}

export function missingRequiredFieldError(
  fieldName: string,
  details?: any
): ApiError {
  return new ApiError(
    `Required field '${fieldName}' is missing`,
    HttpStatus.BAD_REQUEST,
    ErrorCode.MISSING_REQUIRED_FIELD,
    details,
    'validation'
  );
}

export function invalidParameterError(
  paramName: string,
  reason: string = 'is invalid',
  details?: any
): ApiError {
  return new ApiError(
    `Parameter '${paramName}' ${reason}`,
    HttpStatus.BAD_REQUEST,
    ErrorCode.INVALID_PARAMETER,
    details,
    'validation'
  );
}

// Database errors
export function databaseError(
  message: string = 'A database error occurred',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.DATABASE_ERROR,
    details,
    'database',
    true
  );
}

// Rate limiting errors
export function rateLimitExceededError(
  message: string = 'Rate limit exceeded, please try again later',
  details?: any
): ApiError {
  return new ApiError(
    message,
    HttpStatus.TOO_MANY_REQUESTS,
    ErrorCode.RATE_LIMIT_EXCEEDED,
    details,
    'rate-limiter'
  );
}

// General server errors
export function internalServerError(
  message: string = 'An unexpected error occurred',
  details?: any,
  operational: boolean = false
): ApiError {
  return new ApiError(
    message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_SERVER_ERROR,
    details,
    'server',
    operational
  );
}

// Operation errors
export function operationFailedError(
  operation: string,
  reason: string = 'failed',
  details?: any
): ApiError {
  return new ApiError(
    `Operation '${operation}' ${reason}`,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.OPERATION_FAILED,
    details,
    'operation'
  );
}

// External service errors
export function externalServiceError(
  serviceName: string,
  message: string = 'failed to respond',
  details?: any
): ApiError {
  return new ApiError(
    `External service '${serviceName}' ${message}`,
    HttpStatus.SERVICE_UNAVAILABLE,
    ErrorCode.EXTERNAL_SERVICE_ERROR,
    details,
    'external'
  );
}

// Create error from generic Error object
export function fromError(error: Error, defaultMessage: string = 'An unexpected error occurred'): ApiError {
  // If it's already an ApiError, return it
  if (error instanceof ApiError) {
    return error;
  }
  
  // Create a new ApiError with the error message
  return internalServerError(
    error.message || defaultMessage,
    {
      originalError: error.name,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    },
    false
  );
} 
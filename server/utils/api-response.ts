/**
 * Standardized API Response Utilities
 * 
 * This module provides utilities for creating consistent API responses across all endpoints
 * in the MentalSpace EHR application.
 */

import { Response } from 'express';

/**
 * Standard response structure for all API endpoints
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  meta?: ResponseMetadata;
  message?: string;
  timestamp: string;
}

/**
 * Standard metadata for paginated responses
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Additional response metadata
 */
export interface ResponseMetadata {
  pagination?: PaginationMetadata;
  requestId?: string;
  processingTimeMs?: number;
  [key: string]: any; // Allow for additional metadata
}

/**
 * Send a success response with data
 * 
 * @param res Express response object
 * @param data The data to send in the response
 * @param statusCode HTTP status code (default: 200)
 * @param meta Additional metadata
 * @param message Optional success message
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ResponseMetadata,
  message?: string
): void {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    response.meta = meta;
  }

  if (message) {
    response.message = message;
  }

  // Add the request ID if available
  if (res.req.headers['x-request-id']) {
    if (!response.meta) {
      response.meta = {};
    }
    response.meta.requestId = res.req.headers['x-request-id'] as string;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a success response without data (e.g., for DELETE operations)
 * 
 * @param res Express response object
 * @param statusCode HTTP status code (default: 204)
 * @param message Optional success message
 */
export function sendSuccessNoContent(
  res: Response,
  statusCode: number = 204,
  message?: string
): void {
  if (statusCode === 204) {
    // 204 No Content should not have a response body
    res.status(204).end();
    return;
  }

  const response: ApiResponse<null> = {
    status: 'success',
    timestamp: new Date().toISOString()
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

/**
 * Create a paginated response
 * 
 * @param res Express response object
 * @param data Array of items for the current page
 * @param pagination Pagination metadata
 * @param meta Additional metadata
 * @param statusCode HTTP status code (default: 200)
 */
export function sendPaginatedSuccess<T>(
  res: Response,
  data: T[],
  pagination: PaginationMetadata,
  meta?: Omit<ResponseMetadata, 'pagination'>,
  statusCode: number = 200
): void {
  const response: ApiResponse<T[]> = {
    status: 'success',
    data,
    meta: {
      ...meta,
      pagination
    },
    timestamp: new Date().toISOString()
  };

  // Add the request ID if available
  if (res.req.headers['x-request-id'] && response.meta) {
    response.meta.requestId = res.req.headers['x-request-id'] as string;
  }

  res.status(statusCode).json(response);
}

/**
 * Create a standardized response for a created resource
 * 
 * @param res Express response object
 * @param data The created resource data
 * @param message Optional success message
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void {
  sendSuccess(res, data, 201, undefined, message);
}

/**
 * Create a standardized response for an updated resource
 * 
 * @param res Express response object
 * @param data The updated resource data
 * @param message Optional success message
 */
export function sendUpdated<T>(
  res: Response,
  data: T,
  message: string = 'Resource updated successfully'
): void {
  sendSuccess(res, data, 200, undefined, message);
}

/**
 * Response utility to simplify Express handlers and add timing information
 * 
 * @param res Express response object
 */
export function createResponseUtil(res: Response) {
  const startTime = Date.now();
  
  return {
    success: <T>(data: T, statusCode?: number, meta?: ResponseMetadata, message?: string) => {
      if (!meta) meta = {};
      meta.processingTimeMs = Date.now() - startTime;
      sendSuccess(res, data, statusCode, meta, message);
    },
    
    created: <T>(data: T, message?: string) => {
      const meta = { processingTimeMs: Date.now() - startTime };
      sendSuccess(res, data, 201, meta, message);
    },
    
    updated: <T>(data: T, message?: string) => {
      const meta = { processingTimeMs: Date.now() - startTime };
      sendSuccess(res, data, 200, meta, message);
    },
    
    noContent: (statusCode?: number, message?: string) => {
      sendSuccessNoContent(res, statusCode, message);
    },
    
    paginated: <T>(data: T[], pagination: PaginationMetadata, additionalMeta?: Omit<ResponseMetadata, 'pagination'>) => {
      const meta = { 
        ...additionalMeta,
        processingTimeMs: Date.now() - startTime
      };
      sendPaginatedSuccess(res, data, pagination, meta);
    }
  };
} 
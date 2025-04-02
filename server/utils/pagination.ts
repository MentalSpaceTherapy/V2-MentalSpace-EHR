/**
 * Pagination Utilities
 * 
 * This module provides utilities for implementing consistent pagination
 * across all list endpoints in the MentalSpace EHR application.
 */

import { Request } from 'express';
import { z } from 'zod';
import { PaginationMetadata } from './api-response';

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Pagination parameters from request query
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Pagination result with data and metadata
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Zod schema for validating pagination query parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (!val ? DEFAULT_PAGE : parseInt(val)))
    .pipe(z.number().positive().default(DEFAULT_PAGE)),
  
  limit: z
    .string()
    .optional()
    .transform(val => (!val ? DEFAULT_LIMIT : parseInt(val)))
    .pipe(z.number().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT))
});

/**
 * Parse pagination parameters from request query
 * 
 * @param req Express request object
 * @returns Pagination parameters
 */
export function getPaginationParams(req: Request): PaginationParams {
  const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
  const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  
  // Ensure limit doesn't exceed maximum
  const normalizedLimit = Math.min(limit, MAX_LIMIT);
  
  // Calculate offset (0-based for database queries)
  const offset = (page - 1) * normalizedLimit;
  
  return {
    page,
    limit: normalizedLimit,
    offset
  };
}

/**
 * Create pagination metadata
 * 
 * @param page Current page number
 * @param limit Items per page
 * @param totalItems Total number of items
 * @returns Pagination metadata
 */
export function createPaginationMetadata(
  page: number,
  limit: number,
  totalItems: number
): PaginationMetadata {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Create a paginated result
 * 
 * @param data Array of items for the current page
 * @param page Current page number
 * @param limit Items per page
 * @param totalItems Total number of items
 * @returns Paginated result with data and metadata
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number
): PaginatedResult<T> {
  return {
    data,
    pagination: createPaginationMetadata(page, limit, totalItems)
  };
}

/**
 * Apply pagination query to SQL query parts
 * 
 * @param params Pagination parameters
 * @returns SQL fragment for pagination
 */
export function sqlPagination(params: PaginationParams): string {
  return `LIMIT ${params.limit} OFFSET ${params.offset}`;
} 
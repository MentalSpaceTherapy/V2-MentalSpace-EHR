/**
 * Mock error-handler utilities for tests
 */
import { NextFunction, Request, Response } from 'express';

// Custom error type for tests
export interface ApiErrorMock extends Error {
  code: string;
  statusCode: number;
  details?: any;
  source?: string;
}

// Create a typed error factory function
export const createMockError = (message: string, code: string, statusCode: number, details?: any): ApiErrorMock => {
  const error = new Error(message) as ApiErrorMock;
  error.code = code;
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
};

// Mock asyncHandler
export const asyncHandler = jest.fn().mockImplementation(
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
);

// Mock asyncRoute
export const asyncRoute = jest.fn().mockImplementation(
  (routeName: string, fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
);

// Mock error functions
export const forbiddenError = jest.fn().mockImplementation((message: string, details?: any) => {
  const error = createMockError(message, 'FORBIDDEN', 403, details);
  throw error;
});

export const notFoundError = jest.fn().mockImplementation((resource: string, details?: any) => {
  const error = createMockError(`${resource} not found`, 'NOT_FOUND', 404, details);
  throw error;
});

export const validationError = jest.fn().mockImplementation((message: string, details?: any) => {
  const error = createMockError(message, 'VALIDATION_ERROR', 400, details);
  throw error;
});

export const fromError = jest.fn().mockImplementation((originalError: any, message?: string) => {
  const displayMessage = message || originalError.message || 'An unexpected error occurred';
  const error = createMockError(displayMessage, 'INTERNAL_ERROR', 500, {
    originalError: originalError.message || String(originalError)
  });
  throw error;
});

export const createError = jest.fn().mockImplementation((message: string, code: string, statusCode: number, details?: any) => {
  const error = createMockError(message, code, statusCode, details);
  throw error;
});

export default {
  asyncHandler,
  asyncRoute,
  forbiddenError,
  notFoundError: forbiddenError,
  validationError,
  fromError,
  createError
}; 
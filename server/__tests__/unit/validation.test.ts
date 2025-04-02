import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { 
  validate, 
  validateBody, 
  validateQuery, 
  validateParams,
  ValidationTarget,
  transformRequest
} from '../../middleware/validation';
import { validationError } from '../../utils/api-error';

// Mock dependencies
jest.mock('../../utils/api-error', () => ({
  validationError: jest.fn().mockImplementation((message, details) => ({
    message,
    details,
    code: 'VALIDATION_ERROR',
    statusCode: 400
  }))
}));

jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      body: {},
      query: {},
      params: {},
      headers: {}
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should pass validation when data is valid', async () => {
      // Setup
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(18)
      });
      
      mockRequest.body = {
        name: 'John Doe',
        age: 25
      };
      
      const middleware = validate(schema);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with validation error when data is invalid', async () => {
      // Setup
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(18)
      });
      
      mockRequest.body = {
        name: '',
        age: 15
      };
      
      const middleware = validate(schema);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext.mock.calls[0][0]).toHaveProperty('message', 'Validation failed');
      expect(mockNext.mock.calls[0][0]).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(validationError).toHaveBeenCalled();
    });

    it('should validate different request parts based on target', async () => {
      // Setup
      const schema = z.object({
        id: z.string().min(1)
      });
      
      mockRequest.params = {
        id: '123'
      };
      
      const middleware = validate(schema, ValidationTarget.PARAMS);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateBody', () => {
    it('should validate request body', async () => {
      // Setup
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8)
      });
      
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const middleware = validateBody(schema);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery', () => {
    it('should validate query parameters', async () => {
      // Setup
      const schema = z.object({
        page: z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
      });
      
      mockRequest.query = {
        page: '2',
        limit: '20'
      };
      
      const middleware = validateQuery(schema);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams', () => {
    it('should validate route parameters', async () => {
      // Setup
      const schema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      mockRequest.params = {
        id: '123'
      };
      
      const middleware = validateParams(schema);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('transformRequest', () => {
    it('should transform data during validation', async () => {
      // Setup
      const schema = z.object({
        id: z.string().transform(val => parseInt(val)),
        active: z.string().transform(val => val === 'true')
      });
      
      mockRequest.query = {
        id: '123',
        active: 'true'
      };
      
      const middleware = transformRequest(schema, ValidationTarget.QUERY);
      
      // Execute
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query).toEqual({
        id: 123,
        active: true
      });
    });
  });
}); 
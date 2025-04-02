import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, isAuthenticated } from '../../middleware';
import { ApiError } from '../../middleware/errorHandler';
import { createMockRequest, createMockResponse, createMockNext } from '../setup';

describe('Middleware Functions', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = createMockRequest({
      headers: {
        'x-request-id': 'test-request-id'
      },
      path: '/test-path',
      method: 'GET'
    });
    
    mockResponse = createMockResponse();
    nextFunction = createMockNext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated Middleware', () => {
    it('should call next if user is authenticated', () => {
      mockRequest.isAuthenticated = jest.fn().mockReturnValue(true);
      mockRequest.user = { id: 1, username: 'testuser' };

      isAuthenticated(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      mockRequest.isAuthenticated = jest.fn().mockReturnValue(false);

      isAuthenticated(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('notFoundHandler Middleware', () => {
    it('should return 404 with message', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('errorHandler Middleware', () => {
    it('should handle ApiError with proper status and message', () => {
      const error = new ApiError(400, 'Bad Request');

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Bad Request',
        requestId: 'test-request-id',
        path: '/test-path',
        method: 'GET'
      }));
    });

    it('should use 500 status for non-ApiError errors', () => {
      const error = new Error('Internal error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        requestId: 'test-request-id',
        path: '/test-path',
        method: 'GET'
      }));
    });
  });
}); 
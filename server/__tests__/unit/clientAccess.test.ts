import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { canAccessClient, canAccessClientId } from '../../middleware/clientAccess';
import { createMockRequest, createMockResponse, createMockNext } from '../setup';

// Mock dependencies
jest.mock('../../utils/error-handler', () => ({
  asyncHandler: jest.fn().mockImplementation((fn) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }),
  forbiddenError: jest.fn().mockImplementation((message) => {
    const error = new Error(message) as any;
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }),
  notFoundError: jest.fn().mockImplementation((resource) => {
    const error = new Error(`${resource} not found`) as any;
    error.code = 'NOT_FOUND';
    error.statusCode = 404;
    throw error;
  })
}));

jest.mock('../../storage', () => ({
  storage: {
    getClient: jest.fn()
  }
}));

describe('Client Access Middleware', () => {
  // Import mocked dependencies
  const { storage } = require('../../storage');
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request mock
    mockRequest = createMockRequest({
      user: {
        id: 123,
        role: 'clinician',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      },
      params: {
        id: '456'
      }
    });
    
    // Setup response and next mocks
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('canAccessClient', () => {
    it('should allow access when user is an administrator', async () => {
      // Setup
      mockRequest.user.role = 'administrator';
      
      // Execute
      await canAccessClient(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(storage.getClient).not.toHaveBeenCalled();
    });
    
    it('should allow access when user is the primary therapist', async () => {
      // Setup
      storage.getClient.mockResolvedValue({
        id: 456,
        primaryTherapistId: 123  // Same as mockRequest.user.id
      });
      
      // Execute
      await canAccessClient(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should deny access when user is not primary therapist or admin', async () => {
      // Setup
      storage.getClient.mockResolvedValue({
        id: 456,
        primaryTherapistId: 789  // Different from mockRequest.user.id
      });
      
      // Execute and Assert
      await expect(canAccessClient(mockRequest, mockResponse, mockNext))
        .rejects.toMatchObject({
          message: "You don't have permission to access this client.",
          code: 'FORBIDDEN'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should throw not found error when client does not exist', async () => {
      // Setup
      storage.getClient.mockResolvedValue(null);
      
      // Execute and Assert
      await expect(canAccessClient(mockRequest, mockResponse, mockNext))
        .rejects.toMatchObject({
          message: 'Client not found',
          code: 'NOT_FOUND'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should deny access when user is not authenticated', async () => {
      // Setup
      mockRequest.isAuthenticated.mockReturnValue(false);
      
      // Execute and Assert
      await expect(canAccessClient(mockRequest, mockResponse, mockNext))
        .rejects.toMatchObject({
          message: 'You must be authenticated to access client data',
          code: 'FORBIDDEN'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(storage.getClient).not.toHaveBeenCalled();
    });
  });

  describe('canAccessClientId', () => {
    it('should allow access when user is an administrator', async () => {
      // Setup
      mockRequest.user.role = 'administrator';
      mockRequest.body.clientId = '456';
      
      // Execute
      await canAccessClientId(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(storage.getClient).not.toHaveBeenCalled();
    });
    
    it('should allow access when no client ID is provided', async () => {
      // Setup - no clientId in body or query
      
      // Execute
      await canAccessClientId(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(storage.getClient).not.toHaveBeenCalled();
    });
    
    it('should allow access when user is the primary therapist (clientId in body)', async () => {
      // Setup
      mockRequest.body.clientId = '456';
      storage.getClient.mockResolvedValue({
        id: 456,
        primaryTherapistId: 123  // Same as mockRequest.user.id
      });
      
      // Execute
      await canAccessClientId(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should allow access when user is the primary therapist (clientId in query)', async () => {
      // Setup
      mockRequest.query.clientId = '456';
      storage.getClient.mockResolvedValue({
        id: 456,
        primaryTherapistId: 123  // Same as mockRequest.user.id
      });
      
      // Execute
      await canAccessClientId(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should deny access when user is not primary therapist or admin', async () => {
      // Setup
      mockRequest.body.clientId = '456';
      storage.getClient.mockResolvedValue({
        id: 456,
        primaryTherapistId: 789  // Different from mockRequest.user.id
      });
      
      // Execute and Assert
      await expect(canAccessClientId(mockRequest, mockResponse, mockNext))
        .rejects.toMatchObject({
          message: "You don't have permission to access this client.",
          code: 'FORBIDDEN'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should throw not found error when client does not exist', async () => {
      // Setup
      mockRequest.body.clientId = '456';
      storage.getClient.mockResolvedValue(null);
      
      // Execute and Assert
      await expect(canAccessClientId(mockRequest, mockResponse, mockNext))
        .rejects.toMatchObject({
          message: 'Client not found',
          code: 'NOT_FOUND'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(storage.getClient).toHaveBeenCalledWith(456);
    });
    
    it('should deny access when user is not authenticated', async () => {
      // Setup
      mockRequest.isAuthenticated.mockReturnValue(false);
      mockRequest.body.clientId = '456';
      
      // Execute and Assert
      await expect(canAccessClientId(mockRequest, mockResponse, mockNext))
        .rejects.toMatchObject({
          message: 'You must be authenticated to access client data',
          code: 'FORBIDDEN'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(storage.getClient).not.toHaveBeenCalled();
    });
  });
}); 
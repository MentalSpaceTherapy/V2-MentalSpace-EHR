import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { 
  hasMinimumRole, 
  hasRole, 
  hasMinimumRoleLevel, 
  isAuthenticated,
  isOwnerOrHasRole,
  Role
} from '../../middleware/roleAccess';
import { createMockRequest, createMockResponse, createMockNext } from '../setup';

// No need to mock logger anymore as it's handled by jest.setup.ts

describe('Role Access Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test mocks using our utilities
    mockRequest = createMockRequest({
      user: {
        id: 1,
        role: Role.CLINICIAN,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      }
    });
    
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('hasMinimumRole', () => {
    it('should return true when roles are equal', () => {
      const result = hasMinimumRole(Role.CLINICIAN, Role.CLINICIAN);
      expect(result).toBe(true);
    });

    it('should return true when user role has higher level than required role', () => {
      const result = hasMinimumRole(Role.ADMIN, Role.CLINICIAN);
      expect(result).toBe(true);
    });

    it('should return false when user role has lower level than required role', () => {
      const result = hasMinimumRole(Role.INTERN, Role.CLINICIAN);
      expect(result).toBe(false);
    });

    it('should handle non-listed roles as direct comparison', () => {
      const result = hasMinimumRole('custom_role', 'custom_role');
      expect(result).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('should call next() when user is authenticated', () => {
      isAuthenticated(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 response when user is not authenticated', () => {
      mockRequest.isAuthenticated.mockReturnValue(false);
      
      isAuthenticated(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user object is missing', () => {
      mockRequest.user = undefined;
      
      isAuthenticated(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('hasRole', () => {
    it('should call next() when user has the required role (single role)', () => {
      const middleware = hasRole(Role.CLINICIAN);
      
      middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() when user has one of the required roles (multiple roles)', () => {
      const middleware = hasRole([Role.ADMIN, Role.CLINICIAN]);
      
      middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw error when user does not have the required role', () => {
      const middleware = hasRole(Role.ADMIN);
      
      expect(() => {
        middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      }).toThrow();
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.isAuthenticated.mockReturnValue(false);
      
      const middleware = hasRole(Role.CLINICIAN);
      middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('hasMinimumRoleLevel', () => {
    it('should call next() when user has the minimum required role level', () => {
      const middleware = hasMinimumRoleLevel(Role.CLINICIAN);
      
      middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() when user has a higher role level than required', () => {
      mockRequest.user = {
        ...mockRequest.user,
        role: Role.ADMIN
      };
      
      const middleware = hasMinimumRoleLevel(Role.CLINICIAN);
      middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw error when user has a lower role level than required', () => {
      mockRequest.user = {
        ...mockRequest.user,
        role: Role.INTERN
      };
      
      const middleware = hasMinimumRoleLevel(Role.CLINICIAN);
      
      expect(() => {
        middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      }).toThrow();
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.isAuthenticated.mockReturnValue(false);
      
      const middleware = hasMinimumRoleLevel(Role.CLINICIAN);
      middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('isOwnerOrHasRole', () => {
    it('should call next() when user is the owner of the resource', async () => {
      const getResourceOwnerId = jest.fn().mockResolvedValue(1); // Same as mockRequest.user.id
      const middleware = isOwnerOrHasRole(getResourceOwnerId as unknown as (req: Request) => Promise<number | undefined>);
      
      await middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(getResourceOwnerId).toHaveBeenCalledWith(mockRequest);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() when user has sufficient role without checking ownership', async () => {
      mockRequest.user = {
        ...mockRequest.user,
        role: Role.ADMIN
      };
      
      const getResourceOwnerId = jest.fn(); // Should not be called
      const middleware = isOwnerOrHasRole(getResourceOwnerId as unknown as (req: Request) => Promise<number | undefined>);
      
      await middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(getResourceOwnerId).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw error when user is not the owner and does not have sufficient role', async () => {
      const getResourceOwnerId = jest.fn().mockResolvedValue(2); // Different from mockRequest.user.id
      const middleware = isOwnerOrHasRole(getResourceOwnerId as unknown as (req: Request) => Promise<number | undefined>);
      
      await expect(middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext))
        .rejects.toMatchObject({
          code: 'FORBIDDEN'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when resource ownership cannot be determined', async () => {
      const getResourceOwnerId = jest.fn().mockResolvedValue(undefined);
      const middleware = isOwnerOrHasRole(getResourceOwnerId as unknown as (req: Request) => Promise<number | undefined>);
      
      await expect(middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext))
        .rejects.toMatchObject({
          code: 'FORBIDDEN',
          message: 'Resource ownership could not be determined'
        });
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.isAuthenticated.mockReturnValue(false);
      
      const getResourceOwnerId = jest.fn();
      const middleware = isOwnerOrHasRole(getResourceOwnerId as unknown as (req: Request) => Promise<number | undefined>);
      
      await middleware(mockRequest as unknown as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    });
  });
}); 
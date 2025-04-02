import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Response } from 'express';
import { 
  sendSuccess, 
  sendSuccessNoContent, 
  sendPaginatedSuccess, 
  sendCreated, 
  sendUpdated,
  createResponseUtil,
  PaginationMetadata
} from '../../utils/api-response';
import { createMockResponse } from '../setup';

describe('API Response Utilities', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Clean up mocks
    jest.clearAllMocks();
    
    // Use our test setup utility
    mockResponse = createMockResponse();
  });

  describe('sendSuccess', () => {
    it('should send a successful response with data', () => {
      const data = { id: 1, name: 'Test' };
      
      sendSuccess(mockResponse as Response, data);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { id: 1, name: 'Test' },
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
    
    it('should include custom status code when provided', () => {
      const data = { id: 1, name: 'Test' };
      
      sendSuccess(mockResponse as Response, data, 201);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
    
    it('should include metadata when provided', () => {
      const data = { id: 1, name: 'Test' };
      const meta = { version: '1.0' };
      
      sendSuccess(mockResponse as Response, data, 200, meta);
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { id: 1, name: 'Test' },
        meta: { version: '1.0' },
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
    
    it('should include message when provided', () => {
      const data = { id: 1, name: 'Test' };
      
      sendSuccess(mockResponse as Response, data, 200, undefined, 'Operation successful');
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { id: 1, name: 'Test' },
        message: 'Operation successful',
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
    
    it('should include request ID when available', () => {
      const data = { id: 1, name: 'Test' };
      mockResponse.req.headers['x-request-id'] = 'abc123';
      
      sendSuccess(mockResponse as Response, data);
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { id: 1, name: 'Test' },
        meta: { requestId: 'abc123' },
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
  });
  
  describe('sendSuccessNoContent', () => {
    it('should send 204 response with no body', () => {
      sendSuccessNoContent(mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
    
    it('should send response with body for non-204 status codes', () => {
      sendSuccessNoContent(mockResponse as Response, 200, 'Resource deleted');
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Resource deleted',
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
  });
  
  describe('sendPaginatedSuccess', () => {
    it('should send paginated response with data and pagination metadata', () => {
      const data = [{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test 2' }];
      const pagination: PaginationMetadata = {
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false
      };
      
      sendPaginatedSuccess(mockResponse as Response, data, pagination);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        meta: {
          pagination
        },
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
    
    it('should include additional metadata when provided', () => {
      const data = [{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test 2' }];
      const pagination: PaginationMetadata = {
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false
      };
      const additionalMeta = { version: '1.0' };
      
      sendPaginatedSuccess(mockResponse as Response, data, pagination, additionalMeta);
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        meta: {
          ...additionalMeta,
          pagination
        },
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
  });
  
  describe('sendCreated', () => {
    it('should send a 201 Created response with data', () => {
      const data = { id: 1, name: 'Test' };
      
      sendCreated(mockResponse as Response, data);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        message: 'Resource created successfully',
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
    
    it('should use custom message when provided', () => {
      const data = { id: 1, name: 'Test' };
      
      sendCreated(mockResponse as Response, data, 'User created successfully');
      
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User created successfully'
      }));
    });
  });
  
  describe('sendUpdated', () => {
    it('should send a 200 OK response with updated data', () => {
      const data = { id: 1, name: 'Updated Test' };
      
      sendUpdated(mockResponse as Response, data);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        message: 'Resource updated successfully',
        timestamp: '2023-06-01T00:00:00.000Z'
      });
    });
    
    it('should use custom message when provided', () => {
      const data = { id: 1, name: 'Updated Test' };
      
      sendUpdated(mockResponse as Response, data, 'User profile updated');
      
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User profile updated'
      }));
    });
  });
  
  describe('createResponseUtil', () => {
    it('should create a response utility object with all helper methods', () => {
      const responseUtil = createResponseUtil(mockResponse as Response);
      
      expect(responseUtil).toHaveProperty('success');
      expect(responseUtil).toHaveProperty('created');
      expect(responseUtil).toHaveProperty('updated');
      expect(responseUtil).toHaveProperty('noContent');
      expect(responseUtil).toHaveProperty('paginated');
    });
    
    it('should add processing time to response metadata', () => {
      // Setup Date.now to return different values on successive calls
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)  // First call
        .mockReturnValueOnce(1100); // Second call
      
      const responseUtil = createResponseUtil(mockResponse as Response);
      responseUtil.success({ id: 1, name: 'Test' });
      
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        meta: expect.objectContaining({
          processingTimeMs: 100
        })
      }));
    });
    
    it('should use the correct status code for created response', () => {
      const responseUtil = createResponseUtil(mockResponse as Response);
      responseUtil.created({ id: 1, name: 'Test' });
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
    
    it('should handle paginated responses with additional metadata', () => {
      const data = [{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test 2' }];
      const pagination: PaginationMetadata = {
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false
      };
      const additionalMeta = { version: '1.0' };
      
      const responseUtil = createResponseUtil(mockResponse as Response);
      responseUtil.paginated(data, pagination, additionalMeta);
      
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        data,
        meta: expect.objectContaining({
          version: '1.0',
          pagination,
          processingTimeMs: expect.any(Number)
        })
      }));
    });
  });
}); 
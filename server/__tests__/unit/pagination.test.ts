import { describe, it, expect } from '@jest/globals';
import { Request } from 'express';
import { 
  getPaginationParams, 
  createPaginationMetadata,
  createPaginatedResult,
  sqlPagination,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT
} from '../../utils/pagination';

describe('Pagination Utilities', () => {
  describe('getPaginationParams', () => {
    it('should return default pagination parameters when none are provided', () => {
      // Create a mock request with no pagination query params
      const mockRequest = {
        query: {}
      } as Request;
      
      const params = getPaginationParams(mockRequest);
      
      expect(params).toEqual({
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        offset: 0
      });
    });
    
    it('should parse pagination parameters from request query', () => {
      // Create a mock request with pagination query params
      const mockRequest = {
        query: {
          page: '2',
          limit: '30'
        }
      } as Request;
      
      const params = getPaginationParams(mockRequest);
      
      expect(params).toEqual({
        page: 2,
        limit: 30,
        offset: 30 // (page-1) * limit = (2-1) * 30 = 30
      });
    });
    
    it('should enforce the maximum limit', () => {
      // Create a mock request with a limit exceeding the maximum
      const mockRequest = {
        query: {
          page: '1',
          limit: '200'  // MAX_LIMIT is 100
        }
      } as Request;
      
      const params = getPaginationParams(mockRequest);
      
      expect(params).toEqual({
        page: 1,
        limit: MAX_LIMIT, // Should be capped at MAX_LIMIT
        offset: 0
      });
    });
    
    it('should handle invalid values gracefully', () => {
      // Create a mock request with invalid pagination query params
      const mockRequest = {
        query: {
          page: 'invalid',
          limit: 'not-a-number'
        }
      } as Request;
      
      const params = getPaginationParams(mockRequest);
      
      expect(params).toEqual({
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        offset: 0
      });
    });
  });
  
  describe('createPaginationMetadata', () => {
    it('should create correct pagination metadata', () => {
      const page = 2;
      const limit = 10;
      const totalItems = 25;
      
      const metadata = createPaginationMetadata(page, limit, totalItems);
      
      expect(metadata).toEqual({
        page: 2,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true
      });
    });
    
    it('should handle the first page correctly', () => {
      const page = 1;
      const limit = 10;
      const totalItems = 25;
      
      const metadata = createPaginationMetadata(page, limit, totalItems);
      
      expect(metadata).toEqual({
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false  // First page should not have a previous page
      });
    });
    
    it('should handle the last page correctly', () => {
      const page = 3;
      const limit = 10;
      const totalItems = 25;
      
      const metadata = createPaginationMetadata(page, limit, totalItems);
      
      expect(metadata).toEqual({
        page: 3,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: false, // Last page should not have a next page
        hasPrevPage: true
      });
    });
    
    it('should handle empty results correctly', () => {
      const page = 1;
      const limit = 10;
      const totalItems = 0;
      
      const metadata = createPaginationMetadata(page, limit, totalItems);
      
      expect(metadata).toEqual({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    });
  });
  
  describe('createPaginatedResult', () => {
    it('should create a paginated result with data and metadata', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const page = 1;
      const limit = 10;
      const totalItems = 3;
      
      const result = createPaginatedResult(data, page, limit, totalItems);
      
      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    });
  });
  
  describe('sqlPagination', () => {
    it('should create correct SQL pagination fragment', () => {
      const params = {
        page: 2,
        limit: 10,
        offset: 10
      };
      
      const sql = sqlPagination(params);
      
      expect(sql).toBe('LIMIT 10 OFFSET 10');
    });
  });
}); 
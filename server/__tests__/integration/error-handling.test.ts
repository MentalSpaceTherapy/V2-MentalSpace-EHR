import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index';
import { createTestUser, createTestToken } from '../fixtures/auth-fixtures';
import { setupTestDatabase, teardownTestDatabase } from '../setup';

describe('API Error Handling Integration Tests', () => {
  let testUser: any;
  let authToken: string;
  
  // Set up test environment
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  // Clean up after tests
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  // Create a test user and authentication token before each test
  beforeEach(async () => {
    testUser = await createTestUser({
      username: 'tester',
      email: 'tester@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'therapist'
    });
    
    authToken = await createTestToken(testUser.id);
  });
  
  describe('Standardized Error Responses', () => {
    it('should return a standardized error format for invalid routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.any(String),
        code: expect.any(String),
        timestamp: expect.any(String),
        path: '/api/non-existent-route',
        method: 'GET'
      }));
    });
    
    it('should return a standardized error format for validation errors', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields to trigger validation error
          email: 'invalid-email' // Invalid email format
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.any(String),
        code: 'VALIDATION_ERROR',
        details: expect.any(Object),
        timestamp: expect.any(String),
        path: '/api/clients',
        method: 'POST'
      }));
      
      // Ensure validation details are included
      expect(response.body.details).toHaveProperty('errors');
    });
    
    it('should return a standardized error format for unauthorized access', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.any(String),
        code: expect.stringMatching(/AUTHENTICATION|UNAUTHORIZED/),
        timestamp: expect.any(String),
        path: '/api/messages',
        method: 'GET'
      }));
    });
    
    it('should return a standardized error format for forbidden access', async () => {
      // Create a user with limited permissions
      const limitedUser = await createTestUser({
        username: 'limited',
        email: 'limited@example.com',
        firstName: 'Limited',
        lastName: 'User',
        role: 'client' // Role with limited permissions
      });
      
      const limitedToken = await createTestToken(limitedUser.id);
      
      // Try to access an admin-only endpoint
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${limitedToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.any(String),
        code: expect.stringMatching(/FORBIDDEN|INSUFFICIENT_PERMISSIONS/),
        timestamp: expect.any(String),
        path: '/api/admin/users',
        method: 'GET'
      }));
    });
  });
  
  describe('Validation Middleware', () => {
    it('should validate request body and return detailed validation errors', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: '',  // Empty string, should fail validation
          lastName: 123,  // Number, should fail validation
          email: 'not-an-email',  // Invalid email format
          phone: '12345'  // Too short for a phone number
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      
      // Check that validation details are included for each field
      const errors = response.body.details.errors;
      expect(errors).toContainEqual(expect.objectContaining({
        path: expect.arrayContaining(['firstName']),
        message: expect.any(String)
      }));
      
      expect(errors).toContainEqual(expect.objectContaining({
        path: expect.arrayContaining(['lastName']),
        message: expect.any(String)
      }));
      
      expect(errors).toContainEqual(expect.objectContaining({
        path: expect.arrayContaining(['email']),
        message: expect.any(String)
      }));
    });
    
    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          limit: 'not-a-number',  // Should be a number
          page: -1  // Should be positive
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      
      // Check that validation details are included for query parameters
      const errors = response.body.details.errors;
      expect(errors).toContainEqual(expect.objectContaining({
        path: expect.arrayContaining(['limit']),
        message: expect.any(String)
      }));
      
      expect(errors).toContainEqual(expect.objectContaining({
        path: expect.arrayContaining(['page']),
        message: expect.any(String)
      }));
    });
  });
  
  describe('Error Logging', () => {
    it('should include a request ID in error responses for traceability', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.body).toHaveProperty('requestId');
      expect(typeof response.body.requestId).toBe('string');
    });
  });
  
  describe('Resource Not Found Errors', () => {
    it('should return a not found error for non-existent resources', async () => {
      const nonExistentId = 9999;
      const response = await request(app)
        .get(`/api/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining(`${nonExistentId}`),
        code: 'RESOURCE_NOT_FOUND',
        timestamp: expect.any(String),
        path: `/api/clients/${nonExistentId}`,
        method: 'GET'
      }));
    });
  });
  
  describe('Database Error Handling', () => {
    it('should handle database constraint violations gracefully', async () => {
      // First create a client
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567'
        });
      
      expect(createResponse.status).toBe(201);
      
      // Try to create another client with the same email (unique constraint violation)
      const duplicateResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john.doe@example.com', // Same email as previous client
          phone: '555-987-6543'
        });
      
      expect(duplicateResponse.status).toBe(409); // Conflict
      expect(duplicateResponse.body).toEqual(expect.objectContaining({
        status: 'error',
        code: 'RESOURCE_EXISTS',
        timestamp: expect.any(String),
        path: '/api/clients',
        method: 'POST'
      }));
      
      // Error message should be user-friendly
      expect(duplicateResponse.body.message).toMatch(/already exists|duplicate|in use/i);
    });
  });
}); 
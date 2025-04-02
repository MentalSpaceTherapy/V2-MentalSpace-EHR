import { describe, it, expect, beforeEach, jest, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index';
import { storage } from '../../storage';
import { mockUser } from '../fixtures/users';

// Mock the storage methods
jest.mock('../../storage', () => ({
  storage: {
    getUserByUsername: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn()
  }
}));

// Mock bcrypt for password handling
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => Promise.resolve(true))
}));

describe('Authentication Flow E2E', () => {
  let authToken: string;
  let refreshToken: string;

  // Test user data
  const testUser = {
    id: 999,
    username: 'testuser',
    email: 'test.user@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'clinician',
    enabled: true,
    createdAt: '2023-06-01T00:00:00.000Z',
    updatedAt: '2023-06-01T00:00:00.000Z'
  };

  beforeAll(() => {
    // Reset mocks before tests
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Mock storage responses
    (storage.getUserByUsername as jest.Mock).mockImplementation((username) => {
      if (username === testUser.username) {
        return Promise.resolve({
          ...testUser,
          password: `hashed_${testUser.password}` // Simulate hashed password
        });
      }
      return Promise.resolve(null);
    });

    (storage.getUserByEmail as jest.Mock).mockImplementation((email) => {
      if (email === testUser.email) {
        return Promise.resolve({
          ...testUser,
          password: `hashed_${testUser.password}` // Simulate hashed password
        });
      }
      return Promise.resolve(null);
    });

    (storage.createUser as jest.Mock).mockImplementation((userData) => {
      return Promise.resolve({
        ...userData,
        id: 1000,
        password: `hashed_${userData.password}`,
        createdAt: '2023-06-01T00:00:00.000Z',
        updatedAt: '2023-06-01T00:00:00.000Z'
      });
    });

    (storage.updateUser as jest.Mock).mockImplementation((id, updates) => {
      return Promise.resolve({
        ...testUser,
        ...updates,
        updatedAt: '2023-06-02T00:00:00.000Z'
      });
    });

    (storage.getUser as jest.Mock).mockImplementation((id) => {
      if (id === testUser.id) {
        return Promise.resolve(testUser);
      }
      return Promise.resolve(null);
    });
  });

  describe('Registration Process', () => {
    it('should register a new user successfully', async () => {
      // Mock that user does not already exist
      (storage.getUserByUsername as jest.Mock).mockResolvedValueOnce(null);
      (storage.getUserByEmail as jest.Mock).mockResolvedValueOnce(null);

      const newUser = {
        username: 'newuser',
        email: 'new.user@example.com',
        password: 'NewPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: 'clinician' // Some systems might restrict role during registration
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.username).toBe(newUser.username);
      expect(response.body.data).not.toHaveProperty('password'); // Password should never be returned
      expect(storage.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: newUser.username,
          email: newUser.email
        })
      );
    });

    it('should reject registration with duplicate username', async () => {
      // Mock that username already exists
      (storage.getUserByUsername as jest.Mock).mockResolvedValueOnce(testUser);

      const newUser = {
        username: testUser.username, // Duplicate username
        email: 'another.email@example.com',
        password: 'Password123!',
        firstName: 'Another',
        lastName: 'User',
        role: 'clinician'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(storage.createUser).not.toHaveBeenCalled();
    });

    it('should validate password strength', async () => {
      // Mock that user does not already exist
      (storage.getUserByUsername as jest.Mock).mockResolvedValueOnce(null);
      (storage.getUserByEmail as jest.Mock).mockResolvedValueOnce(null);

      const weakPasswordUser = {
        username: 'newuser',
        email: 'new.user@example.com',
        password: 'weak', // Too short and simple
        firstName: 'New',
        lastName: 'User',
        role: 'clinician'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('password');
      expect(storage.createUser).not.toHaveBeenCalled();
    });
  });

  describe('Login Process', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Save tokens for later tests
      authToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
    });

    it('should reject login with incorrect password', async () => {
      // Mock password comparison to fail
      const bcrypt = require('bcrypt');
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should reject login for non-existent user', async () => {
      (storage.getUserByUsername as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'DoesNotMatter123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should reject login for disabled account', async () => {
      // Mock a disabled user
      (storage.getUserByUsername as jest.Mock).mockResolvedValueOnce({
        ...testUser,
        enabled: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('disabled');
    });
  });

  describe('Authentication Verification', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.username).toBe(testUser.username);
    });

    it('should reject access to protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Token Refresh', () => {
    it('should issue new token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      
      // Update the auth token for next tests
      authToken = response.body.data.token;
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Password Reset Flow', () => {
    it('should initiate password reset process', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // In a real API, this would send an email with a reset token
    });

    it('should reset password with valid token', async () => {
      // This test is simplified because in real scenario we'd need the token from email
      // Here we mock that part and assume we have a valid token
      const mockResetToken = 'valid-reset-token-123';
      
      // Mock the token verification
      const utils = require('../../utils/auth');
      jest.spyOn(utils, 'verifyPasswordResetToken').mockReturnValueOnce({
        userId: testUser.id,
        email: testUser.email
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: mockResetToken,
          newPassword: 'NewSecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(storage.updateUser).toHaveBeenCalled();
    });
  });

  describe('Logout Process', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      // Verify the token is now invalid by trying to access a protected route
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(profileResponse.status).toBe(401);
    });
  });
}); 
import { describe, it, expect, beforeEach, jest, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index';
import { storage } from '../../storage';
import { hashPassword } from '../../utils/auth';

describe('Password Reset Flow', () => {
  // Mock user data
  const mockUser = {
    id: 999,
    username: 'test_reset_user',
    email: 'test_reset@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'clinician',
    passwordHash: ''
  };

  // Mock for email service
  jest.mock('../../services/email', () => ({
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
  }));

  // Mock storage methods related to password reset
  jest.mock('../../storage', () => ({
    storage: {
      getUserByEmail: jest.fn(),
      getUser: jest.fn(),
      createPasswordResetToken: jest.fn(),
      getPasswordResetToken: jest.fn(),
      deletePasswordResetToken: jest.fn(),
      updateUserPassword: jest.fn(),
    }
  }));

  // Setup before tests
  beforeAll(async () => {
    // Hash a known password for testing
    mockUser.passwordHash = await hashPassword('OldPassword123!');
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (storage.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (storage.getUser as jest.Mock).mockResolvedValue(mockUser);
    (storage.createPasswordResetToken as jest.Mock).mockResolvedValue({
      id: 1,
      userId: mockUser.id,
      token: 'valid-test-token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
    });
    (storage.getPasswordResetToken as jest.Mock).mockImplementation((token) => {
      if (token === 'valid-test-token') {
        return Promise.resolve({
          id: 1,
          userId: mockUser.id,
          token: 'valid-test-token',
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
          createdAt: new Date(),
        });
      } else if (token === 'expired-token') {
        return Promise.resolve({
          id: 2,
          userId: mockUser.id,
          token: 'expired-token',
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago (expired)
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        });
      } else {
        return Promise.resolve(undefined);
      }
    });
    (storage.deletePasswordResetToken as jest.Mock).mockResolvedValue({ success: true });
    (storage.updateUserPassword as jest.Mock).mockResolvedValue({ success: true });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send a reset link when email exists', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: mockUser.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('If your email exists');
      expect(storage.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(storage.createPasswordResetToken).toHaveBeenCalled();
      expect(require('../../services/email').sendEmail).toHaveBeenCalled();
    });

    it('should still return 200 when email does not exist (security)', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(undefined);
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('If your email exists');
      expect(storage.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(storage.createPasswordResetToken).not.toHaveBeenCalled();
      expect(require('../../services/email').sendEmail).not.toHaveBeenCalled();
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(storage.getUserByEmail).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/reset-password/:token', () => {
    it('should verify a valid token', async () => {
      const response = await request(app)
        .get('/api/auth/reset-password/valid-test-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.userId).toBe(mockUser.id);
      expect(storage.getPasswordResetToken).toHaveBeenCalledWith('valid-test-token');
    });

    it('should return 400 for an expired token', async () => {
      const response = await request(app)
        .get('/api/auth/reset-password/expired-token');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('expired');
      expect(storage.getPasswordResetToken).toHaveBeenCalledWith('expired-token');
      expect(storage.deletePasswordResetToken).toHaveBeenCalledWith('expired-token');
    });

    it('should return 400 for an invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/reset-password/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid');
      expect(storage.getPasswordResetToken).toHaveBeenCalledWith('invalid-token');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token and password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-test-token',
          password: 'NewSecure123!',
          confirmPassword: 'NewSecure123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reset successfully');
      expect(storage.getPasswordResetToken).toHaveBeenCalledWith('valid-test-token');
      expect(storage.updateUserPassword).toHaveBeenCalledWith(mockUser.id, expect.any(String));
      expect(storage.deletePasswordResetToken).toHaveBeenCalledWith('valid-test-token');
    });

    it('should return 400 for expired token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired-token',
          password: 'NewSecure123!',
          confirmPassword: 'NewSecure123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('expired');
      expect(storage.updateUserPassword).not.toHaveBeenCalled();
      expect(storage.deletePasswordResetToken).toHaveBeenCalledWith('expired-token');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewSecure123!',
          confirmPassword: 'NewSecure123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid');
      expect(storage.updateUserPassword).not.toHaveBeenCalled();
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-test-token',
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(storage.updateUserPassword).not.toHaveBeenCalled();
    });

    it('should validate password matching', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-test-token',
          password: 'StrongPass123!',
          confirmPassword: 'DifferentPass456!'
        });

      expect(response.status).toBe(400);
      expect(storage.updateUserPassword).not.toHaveBeenCalled();
    });
  });
}); 
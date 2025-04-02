import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../server/index';

describe('Authentication API Endpoints', () => {
  // Test user credentials
  const testUser = {
    username: 'testuser',
    password: 'P@ssw0rd123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'therapist'
  };

  let createdUserId: number | null = null;
  let authCookie: string | null = null;

  // Clear test data after all tests
  afterAll(async () => {
    if (createdUserId) {
      // In a real test environment, you'd delete the test user
      // This is just a placeholder
      console.log(`Test user ${createdUserId} would be deleted here`);
    }
  });

  // Test registration
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(testUser.username);
      expect(response.body).not.toHaveProperty('passwordHash'); // Make sure password is not returned

      // Save user ID for cleanup
      createdUserId = response.body.id;
    });

    it('should return 400 when registering with weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        username: 'weakuser',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password');
    });

    it('should return 400 when user already exists', async () => {
      // Try to register the same user again
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });
  });

  // Test login
  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(testUser.username);
      expect(response.body).not.toHaveProperty('passwordHash');

      // Save auth cookie for subsequent tests
      authCookie = response.headers['set-cookie'];
    });

    it('should return 401 with incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test auth status
  describe('GET /api/auth/me', () => {
    it('should return user info when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie!)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(testUser.username);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test logout
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', authCookie!)
        .expect(200);

      // Try to access protected route after logout
      const authResponse = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie!)
        .expect(401);

      expect(authResponse.body).toHaveProperty('message');
    });
  });
}); 
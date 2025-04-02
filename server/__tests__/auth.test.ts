import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { app } from '../index';
import { storage } from '../storage';
import { hashPassword } from '../utils/auth';
import authRouter from '../routes/auth';
import initDb from '../init-db';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const appTest = express();

// Configure middleware
appTest.use(express.json());
appTest.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Mount auth router
appTest.use('/api/auth', authRouter);

describe('Authentication API', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'client'
  };

  beforeAll(async () => {
    // Initialize database
    await initDb();
  });

  afterAll(async () => {
    // Clean up database and close connections
    try {
      await storage.deleteUserByUsername(testUser.username);
    } catch (error) {
      // Ignore errors if user doesn't exist
    }
    await storage.close();
  });

  beforeEach(async () => {
    // Clean up test user if exists
    try {
      await storage.deleteUserByUsername(testUser.username);
    } catch (error) {
      // Ignore errors if user doesn't exist
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should not register a user with invalid data', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          username: 'a', // too short
          email: 'invalid-email',
          password: '123', // too short
          firstName: '',
          lastName: '',
          role: 'invalid-role'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should not register a duplicate username', async () => {
      // First registration
      await request(appTest)
        .post('/api/auth/register')
        .send(testUser);

      // Second registration with same username
      const response = await request(appTest)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(appTest)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with missing credentials', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(appTest)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(appTest)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authenticated');
    });
  });
}); 
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../server/index';

describe('Clients API Endpoints', () => {
  // Test user credentials for authentication
  const testUser = {
    username: 'therapist_test',
    password: 'P@ssw0rd123',
    email: 'therapist@example.com',
    firstName: 'Test',
    lastName: 'Therapist',
    role: 'therapist'
  };

  // Test client data
  const testClient = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    dateOfBirth: '1990-01-01',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    status: 'active',
    insuranceProvider: 'Blue Shield',
    insurancePolicyNumber: 'BS12345',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '555-987-6543',
    emergencyContactRelationship: 'Spouse'
  };

  let authCookie: string | null = null;
  let createdClientId: number | null = null;

  // Setup - register and login a test user before all tests
  beforeAll(async () => {
    // Register test user
    await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    // Login to get auth cookie
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      })
      .expect(200);

    authCookie = loginResponse.headers['set-cookie'];
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Logout
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', authCookie!)
      .expect(200);
  });

  // Test client creation
  describe('POST /api/clients', () => {
    it('should create a client when authenticated', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Cookie', authCookie!)
        .send(testClient)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(testClient.firstName);
      expect(response.body.lastName).toBe(testClient.lastName);

      // Save client ID for later tests
      createdClientId = response.body.id;
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send(testClient)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test client retrieval
  describe('GET /api/clients', () => {
    it('should retrieve all clients when authenticated', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Cookie', authCookie!)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test single client retrieval
  describe('GET /api/clients/:id', () => {
    it('should retrieve a specific client when authenticated', async () => {
      const response = await request(app)
        .get(`/api/clients/${createdClientId}`)
        .set('Cookie', authCookie!)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdClientId);
      expect(response.body.firstName).toBe(testClient.firstName);
      expect(response.body.lastName).toBe(testClient.lastName);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/clients/${createdClientId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent client', async () => {
      const response = await request(app)
        .get('/api/clients/99999')
        .set('Cookie', authCookie!)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test client update
  describe('PUT /api/clients/:id', () => {
    it('should update a client when authenticated', async () => {
      const updatedData = {
        ...testClient,
        firstName: 'Updated',
        lastName: 'Client'
      };

      const response = await request(app)
        .put(`/api/clients/${createdClientId}`)
        .set('Cookie', authCookie!)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdClientId);
      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Client');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/clients/${createdClientId}`)
        .send({ firstName: 'Unauthorized' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test client deletion
  describe('DELETE /api/clients/:id', () => {
    it('should delete a client when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/clients/${createdClientId}`)
        .set('Cookie', authCookie!)
        .expect(200);

      // Check that client no longer exists
      const getResponse = await request(app)
        .get(`/api/clients/${createdClientId}`)
        .set('Cookie', authCookie!)
        .expect(404);

      expect(getResponse.body).toHaveProperty('message');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/clients/1`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
}); 
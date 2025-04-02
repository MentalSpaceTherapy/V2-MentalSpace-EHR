import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../server/index';

describe('Authentication Flow E2E', () => {
  // Test user credentials
  const testUser = {
    username: `e2e_user_${Date.now()}`, // Unique username to avoid conflicts
    password: 'P@ssw0rd123',
    email: `e2e_user_${Date.now()}@example.com`,
    firstName: 'E2E',
    lastName: 'Test',
    role: 'therapist'
  };

  let authCookie: string | null = null;

  afterAll(async () => {
    // Cleanup any data created during tests
    // This would involve database cleanup in a real environment
    console.log('E2E test completed');
  });

  it('should register, login, access resources, and logout', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(registerResponse.body).toHaveProperty('id');
    expect(registerResponse.body.username).toBe(testUser.username);

    // Step 2: Login with the new user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(loginResponse.body).toHaveProperty('id');
    expect(loginResponse.body.username).toBe(testUser.username);
    expect(loginResponse.headers['set-cookie']).toBeDefined();

    // Save auth cookie for subsequent requests
    authCookie = loginResponse.headers['set-cookie'];

    // Step 3: Access protected resources with valid auth
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie!)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(meResponse.body).toHaveProperty('id');
    expect(meResponse.body.username).toBe(testUser.username);

    // Step 4: Create a test client resource
    const clientData = {
      firstName: 'Test',
      lastName: 'Client',
      email: `test.client.${Date.now()}@example.com`,
      phone: '555-123-4567'
    };

    const clientResponse = await request(app)
      .post('/api/clients')
      .set('Cookie', authCookie!)
      .send(clientData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(clientResponse.body).toHaveProperty('id');
    expect(clientResponse.body.firstName).toBe(clientData.firstName);
    expect(clientResponse.body.lastName).toBe(clientData.lastName);

    const clientId = clientResponse.body.id;

    // Step 5: Create a message for this client
    const messageData = {
      clientId,
      content: 'This is a test message from E2E tests',
      category: 'Clinical',
      sender: 'therapist'
    };

    const messageResponse = await request(app)
      .post('/api/messages')
      .set('Cookie', authCookie!)
      .send(messageData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(messageResponse.body).toHaveProperty('id');
    expect(messageResponse.body.content).toBe(messageData.content);

    // Step 6: Retrieve client messages
    const clientMessagesResponse = await request(app)
      .get(`/api/clients/${clientId}/messages`)
      .set('Cookie', authCookie!)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(clientMessagesResponse.body)).toBe(true);
    expect(clientMessagesResponse.body.length).toBeGreaterThan(0);
    expect(clientMessagesResponse.body[0].content).toBe(messageData.content);

    // Step 7: Log out
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', authCookie!)
      .expect(200);

    // Step 8: Verify access is denied after logout
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie!)
      .expect(401);

    // Step 9: Verify cannot access client data after logout
    await request(app)
      .get(`/api/clients/${clientId}`)
      .set('Cookie', authCookie!)
      .expect(401);
  });
}); 
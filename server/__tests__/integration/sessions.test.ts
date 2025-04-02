import { describe, it, expect, beforeEach, jest, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index';
import { mockUsers, clinician, admin } from '../fixtures/users';
import { client1, client2 } from '../fixtures/clients';
import { storage } from '../../storage';

// Mock the storage methods
jest.mock('../../storage', () => ({
  storage: {
    getSessions: jest.fn(),
    getSession: jest.fn(),
    createSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    getClient: jest.fn()
  }
}));

describe('Sessions API', () => {
  let authToken: string;
  let adminToken: string;

  // Sample sessions for testing
  const mockSessions = [
    {
      id: 101,
      clientId: client1.id,
      therapistId: clinician.id,
      startTime: '2023-06-01T10:00:00.000Z',
      endTime: '2023-06-01T11:00:00.000Z',
      status: 'completed',
      notes: 'Initial session with client, discussed anxiety symptoms',
      type: 'individual',
      createdAt: '2023-05-25T00:00:00.000Z',
      updatedAt: '2023-06-01T11:05:00.000Z'
    },
    {
      id: 102,
      clientId: client1.id,
      therapistId: clinician.id,
      startTime: '2023-06-08T10:00:00.000Z',
      endTime: '2023-06-08T11:00:00.000Z',
      status: 'scheduled',
      notes: 'Follow-up session',
      type: 'individual',
      createdAt: '2023-06-01T11:10:00.000Z',
      updatedAt: '2023-06-01T11:10:00.000Z'
    }
  ];

  beforeAll(async () => {
    // Mock authentication
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: clinician.username,
        password: clinician.password
      });
    
    authToken = loginResponse.body.data.token;
    
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: admin.username,
        password: admin.password
      });
    
    adminToken = adminLoginResponse.body.data.token;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock storage methods responses
    (storage.getSessions as jest.Mock).mockResolvedValue({
      sessions: mockSessions,
      totalCount: mockSessions.length
    });
    
    (storage.getSession as jest.Mock).mockImplementation((id) => {
      const session = mockSessions.find(s => s.id === id);
      return Promise.resolve(session || null);
    });
    
    (storage.createSession as jest.Mock).mockImplementation((sessionData) => {
      const newSession = {
        id: 103,
        ...sessionData,
        createdAt: '2023-06-03T00:00:00.000Z',
        updatedAt: '2023-06-03T00:00:00.000Z'
      };
      return Promise.resolve(newSession);
    });
    
    (storage.updateSession as jest.Mock).mockImplementation((id, updates) => {
      const updatedSession = {
        ...mockSessions.find(s => s.id === id),
        ...updates,
        updatedAt: '2023-06-03T00:00:00.000Z'
      };
      return Promise.resolve(updatedSession);
    });
    
    (storage.deleteSession as jest.Mock).mockResolvedValue({ success: true });
    
    (storage.getClient as jest.Mock).mockImplementation((id) => {
      if (id === client1.id) {
        return Promise.resolve(client1);
      }
      if (id === client2.id) {
        return Promise.resolve(client2);
      }
      return Promise.resolve(null);
    });
  });

  describe('GET /api/sessions', () => {
    it('should return paginated list of sessions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(storage.getSessions).toHaveBeenCalled();
    });
    
    it('should filter sessions by status', async () => {
      const response = await request(app)
        .get('/api/sessions?status=scheduled')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(storage.getSessions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'scheduled' })
      );
    });
    
    it('should filter sessions by date range', async () => {
      const response = await request(app)
        .get('/api/sessions?startDate=2023-06-01&endDate=2023-06-30')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(storage.getSessions).toHaveBeenCalledWith(
        expect.objectContaining({ 
          startDate: '2023-06-01',
          endDate: '2023-06-30' 
        })
      );
    });
    
    it('should filter sessions by client ID', async () => {
      const response = await request(app)
        .get(`/api/sessions?clientId=${client1.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(storage.getSessions).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: client1.id })
      );
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/sessions');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return a specific session by ID', async () => {
      const response = await request(app)
        .get('/api/sessions/101')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(101);
      expect(storage.getSession).toHaveBeenCalledWith(101);
    });
    
    it('should return 404 for non-existent session', async () => {
      (storage.getSession as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/sessions/999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const newSession = {
        clientId: client1.id,
        startTime: '2023-06-15T10:00:00.000Z',
        endTime: '2023-06-15T11:00:00.000Z',
        type: 'individual',
        status: 'scheduled',
        notes: 'Follow-up session'
      };
      
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newSession);
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.clientId).toBe(client1.id);
      expect(storage.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          therapistId: clinician.id,
          clientId: client1.id,
          startTime: '2023-06-15T10:00:00.000Z'
        })
      );
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing clientId, startTime and endTime
          type: 'individual'
        });
      
      expect(response.status).toBe(400);
      expect(storage.createSession).not.toHaveBeenCalled();
    });
    
    it('should verify client access permissions', async () => {
      // Mock client access denied
      (storage.getClient as jest.Mock).mockImplementation(() => {
        const mockClient = { ...client2, primaryTherapistId: admin.id }; // Different therapist
        return Promise.resolve(mockClient);
      });
      
      const newSession = {
        clientId: client2.id,
        startTime: '2023-06-15T10:00:00.000Z',
        endTime: '2023-06-15T11:00:00.000Z',
        type: 'individual'
      };
      
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newSession);
      
      expect(response.status).toBe(403);
      expect(storage.createSession).not.toHaveBeenCalled();
    });
    
    it('should validate time range logic', async () => {
      const newSession = {
        clientId: client1.id,
        startTime: '2023-06-15T11:00:00.000Z', // End time before start time
        endTime: '2023-06-15T10:00:00.000Z',
        type: 'individual'
      };
      
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newSession);
      
      expect(response.status).toBe(400);
      expect(storage.createSession).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('should update an existing session', async () => {
      const updates = {
        startTime: '2023-06-08T11:00:00.000Z',
        endTime: '2023-06-08T12:00:00.000Z',
        notes: 'Rescheduled session'
      };
      
      const response = await request(app)
        .put('/api/sessions/102')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.data.notes).toBe('Rescheduled session');
      expect(storage.updateSession).toHaveBeenCalledWith(102, expect.objectContaining(updates));
    });
    
    it('should return 404 for non-existent session', async () => {
      (storage.getSession as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/sessions/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Updated notes' });
      
      expect(response.status).toBe(404);
      expect(storage.updateSession).not.toHaveBeenCalled();
    });
    
    it('should verify session ownership', async () => {
      // Mock session ownership check fails
      (storage.getSession as jest.Mock).mockResolvedValue({
        ...mockSessions[0],
        therapistId: admin.id // Different therapist
      });
      
      const response = await request(app)
        .put('/api/sessions/101')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Should Fail' });
      
      expect(response.status).toBe(403);
      expect(storage.updateSession).not.toHaveBeenCalled();
    });
    
    it('should not allow updating completed sessions', async () => {
      // Session 101 is already completed
      const response = await request(app)
        .put('/api/sessions/101')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Should not update completed session' });
      
      expect(response.status).toBe(400);
      expect(storage.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/sessions/:id/status', () => {
    it('should update session status', async () => {
      const statusUpdate = {
        status: 'cancelled',
        cancellationReason: 'Client requested reschedule'
      };
      
      const response = await request(app)
        .patch('/api/sessions/102/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusUpdate);
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('cancelled');
      expect(storage.updateSession).toHaveBeenCalledWith(
        102, 
        expect.objectContaining({ 
          status: 'cancelled',
          cancellationReason: 'Client requested reschedule'
        })
      );
    });
    
    it('should validate valid status transitions', async () => {
      // Cannot transition from completed to scheduled
      const statusUpdate = {
        status: 'scheduled'
      };
      
      const response = await request(app)
        .patch('/api/sessions/101/status') // Session 101 is completed
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusUpdate);
      
      expect(response.status).toBe(400);
      expect(storage.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session', async () => {
      const response = await request(app)
        .delete('/api/sessions/102') // Only delete scheduled, not completed
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(storage.deleteSession).toHaveBeenCalledWith(102);
    });
    
    it('should return 404 for non-existent session', async () => {
      (storage.getSession as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/api/sessions/999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(storage.deleteSession).not.toHaveBeenCalled();
    });
    
    it('should not allow deleting completed sessions', async () => {
      const response = await request(app)
        .delete('/api/sessions/101') // Session 101 is completed
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(400);
      expect(storage.deleteSession).not.toHaveBeenCalled();
    });
    
    it('should verify session ownership', async () => {
      // Mock session ownership check fails
      (storage.getSession as jest.Mock).mockResolvedValue({
        ...mockSessions[1], // Using scheduled session
        therapistId: admin.id // Different therapist
      });
      
      const response = await request(app)
        .delete('/api/sessions/102')
        .set('Authorization', `Bearer ${authToken}`); // Using clinician token
      
      expect(response.status).toBe(403);
      expect(storage.deleteSession).not.toHaveBeenCalled();
      
      // But should work with admin token
      const adminResponse = await request(app)
        .delete('/api/sessions/102')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(adminResponse.status).toBe(200);
      expect(storage.deleteSession).toHaveBeenCalledWith(102);
    });
  });
}); 
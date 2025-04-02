import { describe, it, expect, beforeEach, jest, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index';
import { mockUsers, clinician, admin } from '../fixtures/users';
import { client1, client2 } from '../fixtures/clients';
import { storage } from '../../storage';

// Mock the storage methods
jest.mock('../../storage', () => ({
  storage: {
    getDocumentation: jest.fn(),
    getDocumentById: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    getClient: jest.fn()
  }
}));

describe('Documentation API', () => {
  let authToken: string;
  let adminToken: string;

  // Sample documentation for testing
  const mockDocuments = [
    {
      id: 1,
      clientId: client1.id,
      therapistId: clinician.id,
      sessionId: 101,
      title: 'Initial Assessment',
      content: 'Patient presents with symptoms of anxiety...',
      type: 'assessment',
      status: 'final',
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z'
    },
    {
      id: 2,
      clientId: client1.id,
      therapistId: clinician.id,
      sessionId: 102,
      title: 'Progress Note',
      content: 'Patient reports improvement in sleep patterns...',
      type: 'progress_note',
      status: 'draft',
      createdAt: '2023-06-02T00:00:00.000Z',
      updatedAt: '2023-06-02T00:00:00.000Z'
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
    (storage.getDocumentation as jest.Mock).mockResolvedValue({
      documentation: mockDocuments,
      totalCount: mockDocuments.length
    });
    
    (storage.getDocumentById as jest.Mock).mockImplementation((id) => {
      const document = mockDocuments.find(d => d.id === id);
      return Promise.resolve(document || null);
    });
    
    (storage.createDocument as jest.Mock).mockImplementation((docData) => {
      const newDoc = {
        id: 3,
        ...docData,
        createdAt: '2023-06-03T00:00:00.000Z',
        updatedAt: '2023-06-03T00:00:00.000Z'
      };
      return Promise.resolve(newDoc);
    });
    
    (storage.updateDocument as jest.Mock).mockImplementation((id, updates) => {
      const updatedDoc = {
        ...mockDocuments.find(d => d.id === id),
        ...updates,
        updatedAt: '2023-06-03T00:00:00.000Z'
      };
      return Promise.resolve(updatedDoc);
    });
    
    (storage.deleteDocument as jest.Mock).mockResolvedValue({ success: true });
    
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

  describe('GET /api/documentation', () => {
    it('should return paginated list of documentation for authenticated user', async () => {
      const response = await request(app)
        .get('/api/documentation')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(storage.getDocumentation).toHaveBeenCalled();
    });
    
    it('should filter documentation by type', async () => {
      const response = await request(app)
        .get('/api/documentation?type=assessment')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(storage.getDocumentation).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'assessment' })
      );
    });
    
    it('should filter documentation by client ID', async () => {
      const response = await request(app)
        .get(`/api/documentation?clientId=${client1.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(storage.getDocumentation).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: client1.id })
      );
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/documentation');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/documentation/:id', () => {
    it('should return a specific document by ID', async () => {
      const response = await request(app)
        .get('/api/documentation/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(1);
      expect(storage.getDocumentById).toHaveBeenCalledWith(1);
    });
    
    it('should return 404 for non-existent document', async () => {
      (storage.getDocumentById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/documentation/999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/documentation', () => {
    it('should create a new document', async () => {
      const newDoc = {
        clientId: client1.id,
        sessionId: 103,
        title: 'New Progress Note',
        content: 'Patient continues to make progress...',
        type: 'progress_note',
        status: 'draft'
      };
      
      const response = await request(app)
        .post('/api/documentation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newDoc);
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('New Progress Note');
      expect(storage.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          therapistId: clinician.id,
          clientId: client1.id,
          title: 'New Progress Note'
        })
      );
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/documentation')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing clientId, title, and content
          type: 'progress_note'
        });
      
      expect(response.status).toBe(400);
      expect(storage.createDocument).not.toHaveBeenCalled();
    });
    
    it('should verify client access permissions', async () => {
      // Mock client access denied
      (storage.getClient as jest.Mock).mockImplementation(() => {
        const mockClient = { ...client2, primaryTherapistId: admin.id }; // Different therapist
        return Promise.resolve(mockClient);
      });
      
      const newDoc = {
        clientId: client2.id,
        title: 'Unauthorized Note',
        content: 'This should fail',
        type: 'progress_note'
      };
      
      const response = await request(app)
        .post('/api/documentation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newDoc);
      
      expect(response.status).toBe(403);
      expect(storage.createDocument).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/documentation/:id', () => {
    it('should update an existing document', async () => {
      const updates = {
        title: 'Updated Progress Note',
        content: 'Updated content...',
        status: 'final'
      };
      
      const response = await request(app)
        .put('/api/documentation/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Progress Note');
      expect(response.body.data.status).toBe('final');
      expect(storage.updateDocument).toHaveBeenCalledWith(2, expect.objectContaining(updates));
    });
    
    it('should return 404 for non-existent document', async () => {
      (storage.getDocumentById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/documentation/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });
      
      expect(response.status).toBe(404);
      expect(storage.updateDocument).not.toHaveBeenCalled();
    });
    
    it('should verify document ownership', async () => {
      // Mock document ownership check fails
      (storage.getDocumentById as jest.Mock).mockResolvedValue({
        ...mockDocuments[0],
        therapistId: admin.id // Different therapist
      });
      
      const response = await request(app)
        .put('/api/documentation/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Should Fail' });
      
      expect(response.status).toBe(403);
      expect(storage.updateDocument).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/documentation/:id', () => {
    it('should delete a document', async () => {
      const response = await request(app)
        .delete('/api/documentation/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(storage.deleteDocument).toHaveBeenCalledWith(1);
    });
    
    it('should return 404 for non-existent document', async () => {
      (storage.getDocumentById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/api/documentation/999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(storage.deleteDocument).not.toHaveBeenCalled();
    });
    
    it('should verify document ownership or admin rights', async () => {
      // Mock document ownership check fails for non-admin
      (storage.getDocumentById as jest.Mock).mockResolvedValue({
        ...mockDocuments[0],
        therapistId: admin.id // Different therapist
      });
      
      const response = await request(app)
        .delete('/api/documentation/1')
        .set('Authorization', `Bearer ${authToken}`); // Using clinician token
      
      expect(response.status).toBe(403);
      expect(storage.deleteDocument).not.toHaveBeenCalled();
      
      // But should work with admin token
      const adminResponse = await request(app)
        .delete('/api/documentation/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(adminResponse.status).toBe(200);
      expect(storage.deleteDocument).toHaveBeenCalledWith(1);
    });
  });
}); 
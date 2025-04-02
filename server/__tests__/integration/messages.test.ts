import { describe, it, expect, beforeEach, jest, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index';
import { mockUsers, clinician, admin } from '../fixtures/users';
import { storage } from '../../storage';
import { MockMessageData, convertToStorageMessage, createPaginatedResult, mockMessageStorage } from '../mocks/storage';

// Mock the storage methods
jest.mock('../../storage', () => ({
  storage: {
    getMessages: jest.fn(),
    getMessage: jest.fn(),
    createMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn()
  }
}));

describe('Messages API', () => {
  let authToken: string;
  let adminToken: string;

  // Sample messages for testing
  const mockMessages: MockMessageData[] = [
    {
      id: 1,
      senderId: clinician.id,
      recipientId: admin.id,
      subject: 'Test Message 1',
      content: 'This is a test message content',
      read: false,
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z'
    },
    {
      id: 2,
      senderId: admin.id,
      recipientId: clinician.id,
      subject: 'Test Reply',
      content: 'This is a reply message',
      read: true,
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
    
    // Mock the getMessages response with correct typing
    (storage.getMessages as jest.Mock).mockImplementation(() => {
      const storageMessages = mockMessages.map(convertToStorageMessage);
      return Promise.resolve(createPaginatedResult(storageMessages));
    });
    
    // Mock the getMessage response
    (storage.getMessage as jest.Mock).mockImplementation((id: number) => {
      const message = mockMessages.find(m => m.id === id);
      return message ? Promise.resolve(convertToStorageMessage(message)) : Promise.resolve(undefined);
    });
    
    // Mock the createMessage response
    (storage.createMessage as jest.Mock).mockImplementation((messageData: any) => {
      const newMessage: MockMessageData = {
        id: 3,
        senderId: messageData.senderId || clinician.id,
        recipientId: messageData.recipientId,
        subject: messageData.subject,
        content: messageData.content,
        read: false,
        createdAt: '2023-06-03T00:00:00.000Z',
        updatedAt: '2023-06-03T00:00:00.000Z'
      };
      return Promise.resolve(convertToStorageMessage(newMessage));
    });
    
    // Mock the updateMessage response
    (storage.updateMessage as jest.Mock).mockImplementation((id: number, updates: any) => {
      const message = mockMessages.find(m => m.id === id);
      if (!message) return Promise.resolve(undefined);
      
      // Create updated message
      const updatedMessage: MockMessageData = {
        ...message,
        read: updates.isRead !== undefined ? updates.isRead : message.read,
        updatedAt: '2023-06-03T00:00:00.000Z'
      };
      
      return Promise.resolve(convertToStorageMessage(updatedMessage));
    });
    
    // Mock the deleteMessage response
    (storage.deleteMessage as jest.Mock).mockImplementation(() => {
      return Promise.resolve(true);
    });
  });

  describe('GET /api/messages', () => {
    it('should return paginated list of messages for authenticated user', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(storage.getMessages).toHaveBeenCalled();
    });
    
    it('should filter messages by read status', async () => {
      const response = await request(app)
        .get('/api/messages?read=false')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(storage.getMessages).toHaveBeenCalledWith(
        expect.objectContaining({ isRead: false })
      );
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/messages');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/:id', () => {
    it('should return a specific message by ID', async () => {
      const response = await request(app)
        .get('/api/messages/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(1);
      expect(storage.getMessage).toHaveBeenCalledWith(1);
    });
    
    it('should return 404 for non-existent message', async () => {
      (storage.getMessage as jest.Mock).mockResolvedValue(undefined);
      
      const response = await request(app)
        .get('/api/messages/999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should mark message as read when viewed', async () => {
      await request(app)
        .get('/api/messages/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(storage.updateMessage).toHaveBeenCalledWith(1, { isRead: true });
    });
  });

  describe('POST /api/messages', () => {
    it('should create a new message', async () => {
      const newMessage = {
        recipientId: admin.id,
        subject: 'New Test Message',
        content: 'This is a new test message'
      };
      
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newMessage);
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.subject).toBe('New Test Message');
      expect(storage.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: clinician.id,
          recipientId: admin.id,
          subject: 'New Test Message'
        })
      );
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing recipientId and subject
          content: 'This is an invalid message'
        });
      
      expect(response.status).toBe(400);
      expect(storage.createMessage).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/messages/:id/read', () => {
    it('should mark message as read', async () => {
      const response = await request(app)
        .patch('/api/messages/1/read')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.isRead).toBe(true);
      expect(storage.updateMessage).toHaveBeenCalledWith(1, { isRead: true });
    });
    
    it('should return 404 for non-existent message', async () => {
      (storage.updateMessage as jest.Mock).mockRejectedValue(new Error('Message not found'));
      
      const response = await request(app)
        .patch('/api/messages/999/read')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete a message', async () => {
      const response = await request(app)
        .delete('/api/messages/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(storage.deleteMessage).toHaveBeenCalledWith(1);
    });
    
    it('should return 404 for non-existent message', async () => {
      // @ts-ignore
      (storage.deleteMessage as jest.Mock).mockRejectedValue(new Error('Message not found'));
      
      const response = await request(app)
        .delete('/api/messages/999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should only allow message owner to delete', async () => {
      // @ts-ignore
      (storage.getMessage as jest.Mock).mockResolvedValue(
        Object.assign({}, mockMessages[0], {
          senderId: admin.id + 1, // Different user
          recipientId: admin.id + 2 // Different user
        })
      );
      
      const response = await request(app)
        .delete('/api/messages/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(403);
      expect(storage.deleteMessage).not.toHaveBeenCalled();
    });
  });
}); 
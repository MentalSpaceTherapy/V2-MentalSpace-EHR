/**
 * Mock Storage Implementation for Testing
 * 
 * This file provides mock implementations of the storage interface
 * that can be used in tests to avoid database dependencies.
 */

import { IStorage, Message, PaginatedResult } from '../../storage';
import { mockClients } from '../fixtures/clients';
import { mockUsers } from '../fixtures/users';

export interface MockMessageData {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Convert our mock message format to the storage interface format
 */
export function convertToStorageMessage(mockMessage: MockMessageData): Message {
  return {
    id: mockMessage.id,
    clientId: mockMessage.recipientId, 
    therapistId: mockMessage.senderId,
    subject: mockMessage.subject,
    content: mockMessage.content,
    sender: 'therapist',
    isRead: mockMessage.read,
    status: 'sent',
    createdAt: new Date(mockMessage.createdAt),
    category: 'general'
  };
}

/**
 * Create paginated result from mock data
 */
export function createPaginatedResult<T>(data: T[], total?: number): PaginatedResult<T> {
  return {
    data,
    total: total || data.length
  };
}

/**
 * Mock implementation for the storage methods used in message tests
 */
export const mockMessageStorage = {
  getMessages: jest.fn().mockImplementation(() => {
    // Return properly typed paginated result
    return Promise.resolve(createPaginatedResult([]));
  }),
  
  getMessage: jest.fn().mockImplementation((id: number) => {
    // Return properly typed message or undefined
    return Promise.resolve(undefined);
  }),
  
  createMessage: jest.fn().mockImplementation((messageData: any) => {
    // Return properly typed message
    const newMessage: Message = {
      id: 1000,
      clientId: messageData.recipientId,
      therapistId: messageData.senderId,
      subject: messageData.subject || '',
      content: messageData.content,
      sender: 'therapist',
      isRead: false,
      status: 'sent',
      createdAt: new Date(),
      category: 'general'
    };
    return Promise.resolve(newMessage);
  }),
  
  updateMessage: jest.fn().mockImplementation((id: number, updates: Partial<Message>) => {
    // Return properly typed updated message or undefined
    return Promise.resolve(undefined);
  }),
  
  deleteMessage: jest.fn().mockImplementation((id: number) => {
    // Return success boolean
    return Promise.resolve(true);
  })
};

export const storage = {
  // User methods
  getUser: jest.fn().mockImplementation((id) => {
    return Promise.resolve(mockUsers.find(user => user.id === id) || null);
  }),
  
  getUserByUsername: jest.fn().mockImplementation((username) => {
    return Promise.resolve(mockUsers.find(user => user.username === username) || null);
  }),
  
  getUserByEmail: jest.fn().mockImplementation((email) => {
    return Promise.resolve(mockUsers.find(user => user.email === email) || null);
  }),
  
  createUser: jest.fn().mockImplementation((userData) => {
    const newUser = {
      id: Math.max(...mockUsers.map(u => u.id), 0) + 1,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(newUser);
  }),
  
  updateUser: jest.fn().mockImplementation((id, userData) => {
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return Promise.resolve(null);
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(updatedUser);
  }),
  
  // Client methods
  getClient: jest.fn().mockImplementation((id) => {
    return Promise.resolve(mockClients.find(client => client.id === id) || null);
  }),
  
  getClients: jest.fn().mockImplementation((options = {}) => {
    let filteredClients = [...mockClients];
    
    // Filter by therapist ID if provided
    if (options.therapistId) {
      filteredClients = filteredClients.filter(
        client => client.primaryTherapistId === options.therapistId
      );
    }
    
    // Filter by status if provided
    if (options.status) {
      filteredClients = filteredClients.filter(
        client => client.status === options.status
      );
    }
    
    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    return Promise.resolve({
      clients: paginatedClients,
      totalCount: filteredClients.length
    });
  }),
  
  createClient: jest.fn().mockImplementation((clientData) => {
    const newClient = {
      id: Math.max(...mockClients.map(c => c.id), 0) + 1,
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(newClient);
  }),
  
  updateClient: jest.fn().mockImplementation((id, updates) => {
    const clientIndex = mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
      return Promise.resolve(null);
    }
    
    const updatedClient = {
      ...mockClients[clientIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(updatedClient);
  }),
  
  deleteClient: jest.fn().mockImplementation((id) => {
    return Promise.resolve({ success: true });
  }),
  
  // Session methods
  getSessions: jest.fn().mockImplementation((options = {}) => {
    return Promise.resolve({
      sessions: [],
      totalCount: 0
    });
  }),
  
  // Documentation methods
  getDocumentation: jest.fn().mockImplementation((options = {}) => {
    return Promise.resolve({
      documentation: [],
      totalCount: 0
    });
  }),
  
  // Messages methods
  getMessages: jest.fn().mockImplementation((options = {}) => {
    return Promise.resolve({
      messages: [],
      totalCount: 0
    });
  }),
  
  // Add other methods as needed
};

export default storage; 
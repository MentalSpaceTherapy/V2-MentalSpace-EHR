/**
 * Test Setup Utilities
 * 
 * This file provides common setup and mock utilities for tests.
 */

import { Request, Response } from 'express';
import { MockUser } from './fixtures/users';
import { MockClient } from './fixtures/clients';

// Common mock for express Request
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    isAuthenticated: jest.fn().mockReturnValue(true),
    originalUrl: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    path: '/test',
    headers: {},
    params: {},
    query: {},
    body: {},
    ...overrides
  };
};

// Common mock for express Response
export const createMockResponse = (): Partial<Response> => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn(),
    req: {
      headers: {}
    } as any
  };
};

// Mock Next function for middleware tests
export const createMockNext = (): jest.Mock => {
  return jest.fn();
};

// Set authenticated user on request
export const authenticateAs = (req: Partial<Request>, user: MockUser): Partial<Request> => {
  req.user = user;
  req.isAuthenticated = jest.fn().mockReturnValue(true);
  return req;
};

// Common mocks for auth tests
export const setupAuthMocks = () => {
  // Mock bcrypt
  jest.mock('bcrypt', () => ({
    compare: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
      // For test purposes, we'll consider it a match if the plain password
      // is in the format "Password123!" and the hashedPassword is any string
      return Promise.resolve(plainPassword.match(/^[A-Z][a-z]+\d{3}!$/) !== null);
    }),
    hash: jest.fn().mockImplementation((password) => {
      return Promise.resolve(`hashed_${password}`);
    })
  }));

  // Mock JWT
  jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockImplementation((payload, secret, options) => {
      return `mocked_jwt_${payload.userId}_${options.expiresIn}`;
    }),
    verify: jest.fn().mockImplementation((token, secret) => {
      if (token.startsWith('mocked_jwt_')) {
        const parts = token.split('_');
        return { userId: parseInt(parts[2]) };
      }
      throw new Error('Invalid token');
    })
  }));
};

// Common mocks for database storage
export const setupStorageMocks = (mockClients: MockClient[] = []) => {
  jest.mock('../storage', () => ({
    storage: {
      getClient: jest.fn().mockImplementation((id: number) => {
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

        return Promise.resolve({
          clients: filteredClients,
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
      })
    }
  }));
};

// Helper to mock dates for consistent test output
export const mockDates = () => {
  const fixedDate = new Date('2023-06-01T00:00:00.000Z');
  
  global.Date = class extends Date {
    constructor() {
      super();
      return fixedDate;
    }
    
    static now() {
      return fixedDate.getTime();
    }
  } as any;
};

export default {
  createMockRequest,
  createMockResponse,
  createMockNext,
  authenticateAs,
  setupAuthMocks,
  setupStorageMocks,
  mockDates
}; 
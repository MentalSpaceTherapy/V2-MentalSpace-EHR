/**
 * Jest Setup File
 * 
 * This file is loaded before tests run to set up global mocks and test environment.
 */

// Mock fs and path modules to prevent direct file system access in tests
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  appendFile: jest.fn(),
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  basename: jest.fn((path) => path.split('/').pop())
}));

// Import test fixtures
import { allClients as mockClients } from './__tests__/fixtures/clients';
import { allUsers as mockUsers } from './__tests__/fixtures/users';

// Mock database-storage and storage modules
jest.mock('./database-storage', () => ({}));

jest.mock('./storage', () => {
  return {
    storage: {
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
        
        return Promise.resolve({
          clients: filteredClients,
          totalCount: filteredClients.length
        });
      }),
      
      // Add other methods as needed
    }
  };
});

// Mock Date for consistent test outputs
const mockDate = new Date('2023-06-01T00:00:00.000Z');
const fixedTimestamp = mockDate.getTime();

// Save original Date implementation
const RealDate = global.Date;

// Mock global Date
global.Date = class extends RealDate {
  constructor() {
    super();
    return mockDate;
  }
} as unknown as typeof global.Date;

// Mock static Date methods
global.Date.now = jest.fn(() => fixedTimestamp);
global.Date.parse = RealDate.parse;
global.Date.UTC = RealDate.UTC;

// Mock toISOString for consistent output
mockDate.toISOString = jest.fn().mockReturnValue('2023-06-01T00:00:00.000Z');

// Mock logger
jest.mock('./logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    security: jest.fn(),
    audit: {
      auth: jest.fn(),
      access: jest.fn()
    }
  }
}));

// Mock error handler with our custom implementation
jest.mock('./utils/error-handler', () => {
  // Import the mock implementation from our mocks directory
  const mockErrorHandler = require('./__tests__/mocks/error-handler');
  return mockErrorHandler;
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 
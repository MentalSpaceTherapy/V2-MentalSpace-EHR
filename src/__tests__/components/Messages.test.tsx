import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Messages from '../../pages/Messages';
import { AuthProvider } from '../../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API request utility
jest.mock('../../utils/apiRequest', () => ({
  apiRequest: jest.fn(),
}));

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 1, username: 'testuser', firstName: 'Test', lastName: 'User' },
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    refreshUser: jest.fn()
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock date-fns for consistent date formatting
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Jan 1, 2023'),
}));

// Create a mock QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

// Wrapper for testing
const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Messages Component', () => {
  const mockApiRequest = require('../../utils/apiRequest').apiRequest;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses for API calls
    mockApiRequest.mockImplementation((method, url) => {
      if (url === '/api/clients') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: [
              {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phone: '123-456-7890'
              },
              {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
                dateOfBirth: '1985-05-15',
                phone: '987-654-3210'
              }
            ]
          })
        });
      }
      
      if (url === '/api/messages') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: [
              {
                id: 1,
                clientId: 1,
                content: 'Hello',
                sender: 'client',
                isRead: false,
                createdAt: '2023-01-01T10:00:00Z'
              },
              {
                id: 2,
                clientId: 1,
                content: 'How are you?',
                sender: 'therapist',
                isRead: true,
                createdAt: '2023-01-01T10:05:00Z'
              }
            ]
          })
        });
      }
      
      if (url.includes('/api/clients/1/messages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: [
              {
                id: 1,
                clientId: 1,
                content: 'Hello',
                sender: 'client',
                isRead: false,
                createdAt: '2023-01-01T10:00:00Z'
              },
              {
                id: 2,
                clientId: 1,
                content: 'How are you?',
                sender: 'therapist',
                isRead: true,
                createdAt: '2023-01-01T10:05:00Z'
              }
            ]
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: [] })
      });
    });
  });
  
  it('should render the messages component', async () => {
    renderWithProviders(<Messages />);
    
    // Verify initial loading state
    expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/clients');
    expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/messages');
    
    // Wait for client list to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Verify client messages load
    expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/clients/1/messages');
  });
  
  it('should display client messages', async () => {
    renderWithProviders(<Messages />);
    
    // Wait for client messages to load
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('How are you?')).toBeInTheDocument();
    });
  });
  
  it('should send a new message', async () => {
    renderWithProviders(<Messages />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Setup mocked response for sending message
    mockApiRequest.mockImplementationOnce((method, url, data) => {
      expect(method).toBe('POST');
      expect(url).toBe('/api/messages');
      expect(data).toEqual({
        clientId: 1,
        content: 'Test message',
        sender: 'therapist'
      });
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: {
            id: 3,
            clientId: 1,
            content: 'Test message',
            sender: 'therapist',
            isRead: true,
            createdAt: new Date().toISOString()
          }
        })
      });
    });
    
    // Type and send a message
    const textarea = screen.getByPlaceholderText('Type a secure message...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Verify the API was called correctly
    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenLastCalledWith(
        'POST',
        '/api/messages',
        {
          clientId: 1,
          content: 'Test message',
          sender: 'therapist'
        }
      );
    });
  });
  
  it('should filter clients by search query', async () => {
    renderWithProviders(<Messages />);
    
    // Wait for clients to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Search for "Jane"
    const searchInput = screen.getByPlaceholderText('Search conversations...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // John should be filtered out
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
  
  it('should filter clients by unread status', async () => {
    renderWithProviders(<Messages />);
    
    // Wait for clients to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Click on "Unread" filter button
    const unreadButton = screen.getByRole('button', { name: /unread/i });
    fireEvent.click(unreadButton);
    
    // Only clients with unread messages should be visible
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
  
  it('should handle error scenarios gracefully', async () => {
    // Set up a mock for a failed API call
    mockApiRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error('API Error'));
    });
    
    renderWithProviders(<Messages />);
    
    // Component should not crash
    expect(screen.getByText('Please sign in to access messages')).toBeInTheDocument();
  });
}); 
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { apiRequest, get, post, put, patch, del } from '../../utils/apiRequest';
import * as errorHandler from '../../utils/errorHandler';

// Mock the errorHandler functions
jest.mock('../../utils/errorHandler', () => ({
  parseError: jest.fn().mockReturnValue({ type: 'unknown', message: 'Mocked error' }),
  getErrorMessageFromResponse: jest.fn().mockResolvedValue('Error message from response')
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('apiRequest utility', () => {
  let fetchMock: jest.SpyInstance;
  
  beforeEach(() => {
    // Reset localStorage
    localStorageMock.clear();
    
    // Mock fetch
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    fetchMock.mockRestore();
  });
  
  it('should make a GET request with the correct parameters', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    fetchMock.mockResolvedValueOnce(mockResponse);
    
    await apiRequest('GET', '/api/test');
    
    expect(fetchMock).toHaveBeenCalledWith('/api/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
  });
  
  it('should include auth token in headers if available', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    fetchMock.mockResolvedValueOnce(mockResponse);
    localStorageMock.setItem('authToken', 'test-token');
    
    await apiRequest('GET', '/api/test');
    
    expect(fetchMock).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-token'
      })
    }));
  });
  
  it('should include request body for non-GET requests', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    fetchMock.mockResolvedValueOnce(mockResponse);
    
    const requestData = { name: 'test', value: 123 };
    await apiRequest('POST', '/api/test', requestData);
    
    expect(fetchMock).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(requestData)
    }));
  });
  
  it('should throw an error for non-2xx responses', async () => {
    const mockErrorResponse = new Response(JSON.stringify({ 
      status: 'error', 
      message: 'Not found'
    }), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' }
    });
    
    fetchMock.mockResolvedValueOnce(mockErrorResponse);
    
    await expect(apiRequest('GET', '/api/test')).rejects.toThrow();
    
    expect(errorHandler.getErrorMessageFromResponse).toHaveBeenCalled();
  });
  
  it('should handle network errors', async () => {
    const networkError = new Error('Failed to fetch');
    fetchMock.mockRejectedValueOnce(networkError);
    
    await expect(apiRequest('GET', '/api/test')).rejects.toThrow();
    
    expect(errorHandler.parseError).toHaveBeenCalledWith(networkError);
  });
  
  it('should clear auth token for unauthorized errors', async () => {
    const unauthorizedError = new Error('Unauthorized');
    
    // Mock parseError to return an unauthorized error
    (errorHandler.parseError as jest.Mock).mockReturnValueOnce({
      type: 'unauthorized',
      message: 'You need to be logged in'
    });
    
    fetchMock.mockRejectedValueOnce(unauthorizedError);
    localStorageMock.setItem('authToken', 'test-token');
    
    await expect(apiRequest('GET', '/api/test')).rejects.toThrow();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
  });
  
  it('should allow custom headers', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    fetchMock.mockResolvedValueOnce(mockResponse);
    
    const customHeaders = {
      'X-Custom-Header': 'custom-value',
      'Content-Type': 'application/x-www-form-urlencoded' // Override default
    };
    
    await apiRequest('GET', '/api/test', undefined, customHeaders);
    
    expect(fetchMock).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.objectContaining({
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    }));
  });
  
  describe('Shorthand methods', () => {
    it('should provide a shorthand for GET requests', async () => {
      const mockApiRequest = jest.spyOn(require('../../utils/apiRequest'), 'apiRequest')
        .mockResolvedValueOnce(new Response());
      
      await get('/api/test');
      
      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/test', undefined, undefined);
      
      mockApiRequest.mockRestore();
    });
    
    it('should provide a shorthand for POST requests', async () => {
      const mockApiRequest = jest.spyOn(require('../../utils/apiRequest'), 'apiRequest')
        .mockResolvedValueOnce(new Response());
      
      const data = { test: true };
      await post('/api/test', data);
      
      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/test', data, undefined);
      
      mockApiRequest.mockRestore();
    });
    
    it('should provide a shorthand for PUT requests', async () => {
      const mockApiRequest = jest.spyOn(require('../../utils/apiRequest'), 'apiRequest')
        .mockResolvedValueOnce(new Response());
      
      const data = { test: true };
      await put('/api/test', data);
      
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/test', data, undefined);
      
      mockApiRequest.mockRestore();
    });
    
    it('should provide a shorthand for PATCH requests', async () => {
      const mockApiRequest = jest.spyOn(require('../../utils/apiRequest'), 'apiRequest')
        .mockResolvedValueOnce(new Response());
      
      const data = { test: true };
      await patch('/api/test', data);
      
      expect(mockApiRequest).toHaveBeenCalledWith('PATCH', '/api/test', data, undefined);
      
      mockApiRequest.mockRestore();
    });
    
    it('should provide a shorthand for DELETE requests', async () => {
      const mockApiRequest = jest.spyOn(require('../../utils/apiRequest'), 'apiRequest')
        .mockResolvedValueOnce(new Response());
      
      await del('/api/test');
      
      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/api/test', undefined, undefined);
      
      mockApiRequest.mockRestore();
    });
  });
}); 
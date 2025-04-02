import { describe, it, expect, jest } from '@jest/globals';
import { 
  parseError, 
  createError, 
  ErrorType, 
  handleError, 
  getErrorMessageFromResponse 
} from '../../utils/errorHandler';

// Mock toast to avoid actual toast notifications in tests
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

describe('errorHandler utility', () => {
  describe('createError', () => {
    it('should create a properly formatted error object', () => {
      const error = createError(
        ErrorType.VALIDATION,
        'Validation failed',
        'INVALID_INPUT',
        { field: 'email' },
        new Error('Original error')
      );

      expect(error).toEqual({
        type: ErrorType.VALIDATION,
        message: 'Validation failed',
        code: 'INVALID_INPUT',
        details: { field: 'email' },
        original: expect.any(Error)
      });
    });
  });

  describe('parseError', () => {
    it('should handle Error objects', () => {
      const originalError = new Error('Test error');
      const parsedError = parseError(originalError);

      expect(parsedError.message).toBe('Test error');
      expect(parsedError.type).toBe(ErrorType.UNKNOWN);
      expect(parsedError.original).toBe(originalError);
    });

    it('should handle network errors', () => {
      const networkError = new Error('Failed to fetch');
      const parsedError = parseError(networkError);

      expect(parsedError.type).toBe(ErrorType.NETWORK);
      expect(parsedError.message).toContain('internet connection');
    });

    it('should handle Response objects', () => {
      const unauthorizedResponse = new Response(null, { status: 401, statusText: 'Unauthorized' });
      const parsedError = parseError(unauthorizedResponse);

      expect(parsedError.type).toBe(ErrorType.UNAUTHORIZED);
      expect(parsedError.code).toBe('HTTP_401');
    });

    it('should handle string errors', () => {
      const stringError = 'Something went wrong';
      const parsedError = parseError(stringError);

      expect(parsedError.message).toBe('Something went wrong');
      expect(parsedError.type).toBe(ErrorType.UNKNOWN);
    });

    it('should handle unknown error types', () => {
      const unknownError = 123; // Number is not a standard error type
      const parsedError = parseError(unknownError);

      expect(parsedError.message).toBe('An unknown error occurred');
      expect(parsedError.type).toBe(ErrorType.UNKNOWN);
    });

    it('should pass through AppError objects', () => {
      const appError = createError(ErrorType.FORBIDDEN, 'Access denied');
      const parsedError = parseError(appError);

      expect(parsedError).toBe(appError);
    });
  });

  describe('handleError', () => {
    it('should parse and log the error', () => {
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error = new Error('Test error');
      const result = handleError(error);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(result.message).toBe('Test error');
      
      // Clean up
      consoleSpy.mockRestore();
    });
  });

  describe('getErrorMessageFromResponse', () => {
    it('should extract message from API error format', async () => {
      const mockResponse = new Response(
        JSON.stringify({
          status: 'error',
          message: 'Resource not found'
        })
      );
      
      const message = await getErrorMessageFromResponse(mockResponse);
      expect(message).toBe('Resource not found');
    });

    it('should fall back to status text when JSON parsing fails', async () => {
      const mockResponse = new Response(
        'Not JSON',
        { status: 400, statusText: 'Bad Request' }
      );
      
      const message = await getErrorMessageFromResponse(mockResponse);
      expect(message).toBe('Bad Request');
    });

    it('should fall back to status code when neither message nor statusText is available', async () => {
      const mockResponse = new Response(
        null,
        { status: 500 }
      );
      
      const message = await getErrorMessageFromResponse(mockResponse);
      expect(message).toBe('Error: 500');
    });
  });
}); 
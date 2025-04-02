import { 
  ApiError, 
  HttpStatus, 
  ErrorCode, 
  resourceNotFoundError,
  forbiddenError,
  validationError,
  operationFailedError,
  databaseError
} from '../utils/api-error';
import { withDatabaseErrorHandling } from '../utils/api-error-migration';

describe('API Error System', () => {
  // Create a Date before the Date mock is applied
  const realDate = new Date();
  
  // Store original Date
  const OriginalDate = global.Date;
  
  // Mock ApiError's timestamp to be an actual Date instance for testing
  const mockApiErrorImpl = jest.spyOn(ApiError.prototype, 'timestamp', 'get').mockImplementation(function() {
    return realDate;
  });
  
  afterAll(() => {
    mockApiErrorImpl.mockRestore();
  });
  
  describe('ApiError class', () => {
    it('should correctly instantiate with all properties', () => {
      const error = new ApiError(
        'Test error message',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        { field: 'test' },
        'test-component',
        true
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details).toEqual({ field: 'test' });
      expect(error.source).toBe('test-component');
      expect(error.operational).toBe(true);
      expect(error.stack).toBeDefined();
      expect(error.timestamp).toBe(realDate);
    });
    
    it('should convert to JSON correctly', () => {
      const error = new ApiError(
        'Test error',
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND
      );
      
      const json = error.toJSON();
      
      expect(json.name).toBe('ApiError');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(json.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(json.timestamp).toBeDefined();
    });
  });
  
  describe('Error factory functions', () => {
    it('should create resource not found errors correctly', () => {
      const error = resourceNotFoundError('User', 123);
      
      expect(error.message).toBe("User with identifier '123' was not found");
      expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(error.source).toBe('resource');
    });
    
    it('should create forbidden errors correctly', () => {
      const error = forbiddenError('You cannot access this resource');
      
      expect(error.message).toBe('You cannot access this resource');
      expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.source).toBe('auth');
    });
    
    it('should create validation errors correctly', () => {
      const error = validationError('Invalid input data', { fields: ['name', 'email'] });
      
      expect(error.message).toBe('Invalid input data');
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details).toEqual({ fields: ['name', 'email'] });
      expect(error.source).toBe('validation');
    });
    
    it('should create operation failed errors correctly', () => {
      const error = operationFailedError('deleteUser', 'user is referenced by other entities');
      
      expect(error.message).toBe("Operation 'deleteUser' user is referenced by other entities");
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.code).toBe(ErrorCode.OPERATION_FAILED);
      expect(error.source).toBe('operation');
    });
  });
  
  describe('Database error handling', () => {
    it('should pass through successful operations', async () => {
      const result = await withDatabaseErrorHandling(
        async () => 'success'
      );
      
      expect(result).toBe('success');
    });
    
    it('should handle database errors correctly', async () => {
      const mockDbError: any = new Error('DB connection failed');
      mockDbError.code = 'PGCONNECTIONFAILED';
      
      await expect(
        withDatabaseErrorHandling(async () => {
          throw mockDbError;
        }, 'Failed to connect to database')
      ).rejects.toThrow(ApiError);
      
      try {
        await withDatabaseErrorHandling(async () => {
          throw mockDbError;
        }, 'Failed to connect to database');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Failed to connect to database');
        expect((error as ApiError).code).toBe(ErrorCode.DATABASE_ERROR);
        expect((error as ApiError).details.originalError).toBe(mockDbError);
      }
    });
    
    it('should pass through ApiErrors', async () => {
      const originalError = forbiddenError('Access denied');
      
      await expect(
        withDatabaseErrorHandling(async () => {
          throw originalError;
        })
      ).rejects.toThrow(originalError);
    });
  });
}); 
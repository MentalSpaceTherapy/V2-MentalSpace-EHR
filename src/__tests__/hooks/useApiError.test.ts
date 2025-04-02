import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-hooks';
import { useApiError } from '../../hooks/useApiError';
import * as errorHandler from '../../utils/errorHandler';

// Mock the errorHandler module
jest.mock('../../utils/errorHandler', () => ({
  parseError: jest.fn(error => ({ 
    type: 'test-error', 
    message: 'Test error message',
    original: error
  })),
  showErrorToast: jest.fn(),
  ErrorType: { UNKNOWN: 'unknown' }
}));

describe('useApiError hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useApiError());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.handleApiCall).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.isErrorType).toBe('function');
  });
  
  it('should handle successful API calls', async () => {
    const { result } = renderHook(() => useApiError());
    
    const successCallback = jest.fn();
    const apiCall = jest.fn().mockResolvedValue({ data: 'test' });
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.handleApiCall(apiCall, {
        onSuccess: successCallback
      });
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(apiCall).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalledWith({ data: 'test' });
    expect(returnValue).toEqual({ data: 'test' });
  });
  
  it('should handle API errors', async () => {
    const { result } = renderHook(() => useApiError());
    
    const errorCallback = jest.fn();
    const errorObj = new Error('API error');
    const apiCall = jest.fn().mockRejectedValue(errorObj);
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.handleApiCall(apiCall, {
        onError: errorCallback,
        showToast: true
      });
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(errorHandler.parseError).toHaveBeenCalledWith(errorObj);
    expect(errorHandler.showErrorToast).toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();
    expect(returnValue).toBeNull();
  });
  
  it('should not show toast when showToast is false', async () => {
    const { result } = renderHook(() => useApiError());
    
    const apiCall = jest.fn().mockRejectedValue(new Error('API error'));
    
    await act(async () => {
      await result.current.handleApiCall(apiCall, {
        showToast: false
      });
    });
    
    expect(errorHandler.showErrorToast).not.toHaveBeenCalled();
  });
  
  it('should not reset error when resetOnSuccess is false', async () => {
    const { result } = renderHook(() => useApiError());
    
    // First set an error
    const errorCall = jest.fn().mockRejectedValue(new Error('API error'));
    await act(async () => {
      await result.current.handleApiCall(errorCall);
    });
    
    expect(result.current.error).not.toBeNull();
    
    // Then make a successful call with resetOnSuccess = false
    const successCall = jest.fn().mockResolvedValue({ data: 'test' });
    await act(async () => {
      await result.current.handleApiCall(successCall, {
        resetOnSuccess: false
      });
    });
    
    // Error should still be present
    expect(result.current.error).not.toBeNull();
  });
  
  it('should clear error with clearError method', async () => {
    const { result } = renderHook(() => useApiError());
    
    // Set an error
    const errorCall = jest.fn().mockRejectedValue(new Error('API error'));
    await act(async () => {
      await result.current.handleApiCall(errorCall);
    });
    
    expect(result.current.error).not.toBeNull();
    
    // Clear the error
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
  
  it('should check error type correctly with isErrorType', async () => {
    const { result } = renderHook(() => useApiError());
    
    // No error initially
    expect(result.current.isErrorType('test-error')).toBe(false);
    
    // Set an error of type 'test-error'
    const errorCall = jest.fn().mockRejectedValue(new Error('API error'));
    await act(async () => {
      await result.current.handleApiCall(errorCall);
    });
    
    // Should match the error type
    expect(result.current.isErrorType('test-error')).toBe(true);
    
    // Should not match other error types
    expect(result.current.isErrorType('other-error')).toBe(false);
  });
}); 
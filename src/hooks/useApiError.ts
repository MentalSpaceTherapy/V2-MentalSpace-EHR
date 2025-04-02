import { useState, useCallback } from 'react';
import { AppError, ErrorType, parseError, showErrorToast } from '../utils/errorHandler';

/**
 * Hook for handling API errors in a standardized way
 * @returns Error handling functions and state
 */
export function useApiError() {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Executes an async function with standardized error handling
   */
  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: AppError) => void;
      showToast?: boolean;
      resetOnSuccess?: boolean;
    } = {}
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      showToast = true,
      resetOnSuccess = true
    } = options;

    setIsLoading(true);
    
    try {
      const result = await apiCall();
      
      if (resetOnSuccess) {
        setError(null);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      setIsLoading(false);
      return result;
    } catch (e) {
      const appError = parseError(e);
      setError(appError);
      
      if (showToast) {
        showErrorToast(appError);
      }
      
      if (onError) {
        onError(appError);
      }
      
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Checks if the current error is of a specific type
   */
  const isErrorType = useCallback((type: ErrorType): boolean => {
    return error?.type === type;
  }, [error]);

  return {
    error,
    isLoading,
    isErrorType,
    handleApiCall,
    clearError
  };
} 
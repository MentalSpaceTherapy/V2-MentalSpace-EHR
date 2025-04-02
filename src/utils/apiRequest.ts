/**
 * Utility for making API requests with standardized error handling
 */

import { parseError, getErrorMessageFromResponse } from './errorHandler';

// Valid HTTP methods for API requests
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Make an API request with proper error handling
 * 
 * @param method HTTP method to use
 * @param url API endpoint to request
 * @param data Optional data to send with the request
 * @param customHeaders Optional additional headers
 * @returns Fetch Response object
 */
export async function apiRequest(
  method: Method,
  url: string,
  data?: any,
  customHeaders?: HeadersInit
): Promise<Response> {
  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  };

  // Get auth token from localStorage if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Request options
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for session handling
  };

  // Add body for non-GET requests if data is provided
  if (method !== 'GET' && data !== undefined) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    // Check if response is not ok (status code outside 200-299)
    if (!response.ok) {
      // Try to get a user-friendly error message from the response
      const errorMessage = await getErrorMessageFromResponse(response);
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    // Use our standardized error parsing
    const appError = parseError(error);
    
    // Handle specific error types
    if (appError.type === 'unauthorized') {
      // Clear token on unauthorized
      localStorage.removeItem('authToken');
    }
    
    // Throw the error to be handled by the calling code
    throw error;
  }
}

/**
 * Shorthand for GET requests
 */
export const get = (url: string, customHeaders?: HeadersInit) => 
  apiRequest('GET', url, undefined, customHeaders);

/**
 * Shorthand for POST requests
 */
export const post = (url: string, data?: any, customHeaders?: HeadersInit) => 
  apiRequest('POST', url, data, customHeaders);

/**
 * Shorthand for PUT requests
 */
export const put = (url: string, data?: any, customHeaders?: HeadersInit) => 
  apiRequest('PUT', url, data, customHeaders);

/**
 * Shorthand for PATCH requests
 */
export const patch = (url: string, data?: any, customHeaders?: HeadersInit) => 
  apiRequest('PATCH', url, data, customHeaders);

/**
 * Shorthand for DELETE requests
 */
export const del = (url: string, data?: any, customHeaders?: HeadersInit) => 
  apiRequest('DELETE', url, data, customHeaders); 
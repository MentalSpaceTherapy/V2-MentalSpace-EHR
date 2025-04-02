import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Create a standard axios instance for API requests
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for API requests that handles errors consistently
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    // Enhanced error handling with custom error object
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const errorObj = new Error(errorMessage);
    (errorObj as any).status = error.response?.status;
    (errorObj as any).data = error.response?.data;
    throw errorObj;
  }
};

// Configure the QueryClient with enhanced options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce network requests when components mount/unmount quickly
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Wait a bit before showing loading states to avoid flashes
      refetchOnWindowFocus: false,
      retry: 2,
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Default query keys
export const queryKeys = {
  clients: {
    all: ['clients'],
    list: () => [...queryKeys.clients.all, 'list'],
    detail: (id: number) => [...queryKeys.clients.all, 'detail', id],
    appointments: (id: number) => [...queryKeys.clients.all, 'appointments', id],
  },
  appointments: {
    all: ['appointments'],
    list: () => [...queryKeys.appointments.all, 'list'],
    detail: (id: number) => [...queryKeys.appointments.all, 'detail', id],
    calendar: (year: number, month: number) => [...queryKeys.appointments.all, 'calendar', year, month],
  },
  documents: {
    all: ['documents'],
    list: () => [...queryKeys.documents.all, 'list'],
    detail: (id: number) => [...queryKeys.documents.all, 'detail', id],
  },
  messages: {
    all: ['messages'],
    list: () => [...queryKeys.messages.all, 'list'],
    conversation: (id: number) => [...queryKeys.messages.all, 'conversation', id],
  },
  notifications: {
    all: ['notifications'],
  },
  user: {
    all: ['user'],
    preferences: () => [...queryKeys.user.all, 'preferences'],
    settings: () => [...queryKeys.user.all, 'settings'],
  },
}; 
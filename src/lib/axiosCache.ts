import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// Define cache configuration types
export interface CacheConfig {
  // Time-to-live in milliseconds
  ttl: number;
  // Methods to cache
  methods: string[];
  // Cache storage type
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
  // Max items in memory cache
  maxItems?: number;
  // Headers that should invalidate the cache when different
  varyHeaders?: string[];
  // Query parameters that should not affect cache
  ignoreParams?: string[];
}

// Default configuration
const defaultConfig: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  methods: ['GET'],
  storageType: 'memory',
  maxItems: 100,
  varyHeaders: ['Authorization'],
  ignoreParams: ['_t'], // Ignore timestamp parameters
};

/**
 * Create a cached axios instance with customizable cache configuration
 * @param config Custom cache configuration
 * @returns Cached axios instance
 */
export function createCachedAxios(config: Partial<CacheConfig> = {}) {
  // Merge with default configuration
  const mergedConfig: CacheConfig = {
    ...defaultConfig,
    ...config,
  };

  // Create base axios instance
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Set up storage provider
  let storageProvider: any;
  
  if (mergedConfig.storageType === 'localStorage') {
    storageProvider = {
      set: (key: string, value: any) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.warn('Failed to write to localStorage', e);
        }
      },
      get: (key: string) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : undefined;
        } catch (e) {
          console.warn('Failed to read from localStorage', e);
          return undefined;
        }
      },
      remove: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed to remove from localStorage', e);
        }
      },
      clear: () => {
        try {
          // Only clear our own cache keys
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('axios-cache:')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn('Failed to clear localStorage', e);
        }
      },
    };
  } else if (mergedConfig.storageType === 'sessionStorage') {
    storageProvider = {
      set: (key: string, value: any) => {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.warn('Failed to write to sessionStorage', e);
        }
      },
      get: (key: string) => {
        try {
          const value = sessionStorage.getItem(key);
          return value ? JSON.parse(value) : undefined;
        } catch (e) {
          console.warn('Failed to read from sessionStorage', e);
          return undefined;
        }
      },
      remove: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed to remove from sessionStorage', e);
        }
      },
      clear: () => {
        try {
          // Only clear our own cache keys
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('axios-cache:')) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn('Failed to clear sessionStorage', e);
        }
      },
    };
  }

  // Set up the cache
  const cachedApi = setupCache(api, {
    // Configure which HTTP methods to cache
    methods: mergedConfig.methods,
    // Set TTL (time-to-live) in milliseconds
    ttl: mergedConfig.ttl,
    // Use custom storage
    storage: mergedConfig.storageType !== 'memory' ? storageProvider : undefined,
    // Generate a cache key (important for customizing caching behavior)
    generateKey: (request) => {
      const { url, method, params, headers } = request;
      // Filter out ignore params from the cache key
      const relevantParams = params 
        ? Object.keys(params).reduce((acc: Record<string, any>, key: string) => {
            if (!mergedConfig.ignoreParams?.includes(key)) {
              acc[key] = params[key];
            }
            return acc;
          }, {})
        : undefined;
      
      // Include relevant headers in the cache key
      const relevantHeaders: Record<string, string> = {};
      if (headers && mergedConfig.varyHeaders?.length) {
        mergedConfig.varyHeaders.forEach(header => {
          const headerValue = headers[header];
          if (headerValue) {
            relevantHeaders[header] = headerValue as string;
          }
        });
      }
      
      // Create a deterministic cache key
      return `axios-cache:${method}:${url}:${JSON.stringify(relevantParams)}:${JSON.stringify(relevantHeaders)}`;
    },
    // Configure cache behavior
    cache: {
      // If browser goes offline, still use expired cache entries
      interpretHeader: false,
      // Maximum number of cached items
      limit: mergedConfig.maxItems,
      // Response validation (don't cache errors)
      readOnError: (error) => error.response?.status === 304,
    },
    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',
  });

  /**
   * Invalidate all cached API responses
   */
  const invalidateCache = () => {
    if (mergedConfig.storageType === 'memory') {
      cachedApi.storage.clear();
    } else {
      storageProvider.clear();
    }
  };

  /**
   * Invalidate a specific cached API response
   * @param url The URL to invalidate
   * @param method The HTTP method
   */
  const invalidateCacheFor = (url: string, method: string = 'GET') => {
    // Find all keys that match the URL pattern
    if (mergedConfig.storageType === 'memory') {
      // For memory storage, traverse keys
      const keys = cachedApi.storage.keys();
      for (const key of keys) {
        if (key.includes(`${method}:${url}`)) {
          cachedApi.storage.delete(key);
        }
      }
    } else {
      // For browser storage, scan all keys
      const storage = mergedConfig.storageType === 'localStorage' 
        ? localStorage 
        : sessionStorage;
      
      Object.keys(storage).forEach(key => {
        if (key.startsWith('axios-cache:') && key.includes(`${method}:${url}`)) {
          storage.removeItem(key);
        }
      });
    }
  };

  /**
   * Prefetch and cache a URL
   * @param url The URL to prefetch
   * @param config Axios request config
   */
  const prefetch = async (url: string, config: AxiosRequestConfig = {}) => {
    return cachedApi.get(url, {
      ...config,
      cache: {
        // Override TTL for this request if needed
        ttl: config.ttl || mergedConfig.ttl,
        // Interpret this as a prefetch
        prefetch: true,
      },
    });
  };

  return {
    api: cachedApi,
    invalidateCache,
    invalidateCacheFor,
    prefetch,
  };
}

// Create a default cached API instance
export const { api: cachedApi, invalidateCache, invalidateCacheFor, prefetch } = createCachedAxios();

// Export a hook for using the cached API
export function useCachedApi() {
  return {
    api: cachedApi,
    invalidateCache,
    invalidateCacheFor,
    prefetch,
  };
} 
import { useQuery, useMutation, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Custom hook for data fetching with React Query
 * Provides a simplified API for common data fetching patterns
 */
export function useApi() {
  const queryClient = useQueryClient();

  /**
   * Fetch data from an API endpoint
   * @param url API endpoint
   * @param queryKey Cache key for React Query
   * @param options Additional query options
   */
  const fetch = <TData = unknown>(
    url: string,
    queryKey: unknown[],
    options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery<TData, Error>({
      queryKey,
      queryFn: async () => apiRequest<TData>('GET', url),
      ...options,
    });
  };

  /**
   * Perform a mutation (POST, PUT, PATCH, DELETE)
   * @param method HTTP method
   * @param url API endpoint
   * @param options Mutation options
   */
  const mutate = <TData = unknown, TVariables = unknown>(
    method: ApiMethod,
    url: string,
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
  ) => {
    return useMutation<TData, Error, TVariables>({
      mutationFn: (variables) => apiRequest<TData>(method, url, variables),
      ...options,
    });
  };

  /**
   * Create a mutation for POST requests
   * @param url API endpoint
   * @param options Mutation options
   */
  const post = <TData = unknown, TVariables = unknown>(
    url: string,
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
  ) => {
    return mutate<TData, TVariables>('POST', url, options);
  };

  /**
   * Create a mutation for PUT requests
   * @param url API endpoint
   * @param options Mutation options
   */
  const put = <TData = unknown, TVariables = unknown>(
    url: string,
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
  ) => {
    return mutate<TData, TVariables>('PUT', url, options);
  };

  /**
   * Create a mutation for PATCH requests
   * @param url API endpoint
   * @param options Mutation options
   */
  const patch = <TData = unknown, TVariables = unknown>(
    url: string,
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
  ) => {
    return mutate<TData, TVariables>('PATCH', url, options);
  };

  /**
   * Create a mutation for DELETE requests
   * @param url API endpoint
   * @param options Mutation options
   */
  const remove = <TData = unknown, TVariables = unknown>(
    url: string,
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
  ) => {
    return mutate<TData, TVariables>('DELETE', url, options);
  };

  /**
   * Invalidate query cache by key
   * @param queryKey Query key to invalidate
   */
  const invalidate = (queryKey: unknown[]) => {
    return queryClient.invalidateQueries({ queryKey });
  };

  /**
   * Set query cache data directly
   * @param queryKey Query key to update
   * @param data Data to set in cache
   */
  const setQueryData = <TData>(queryKey: unknown[], data: TData) => {
    return queryClient.setQueryData(queryKey, data);
  };

  return {
    fetch,
    mutate,
    post,
    put,
    patch,
    remove,
    invalidate,
    setQueryData,
    queryClient,
  };
} 
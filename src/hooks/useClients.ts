import { useApi } from './useApi';
import { queryKeys } from '../lib/queryClient';
import type { Client } from '../types/client';

export interface ClientFilters {
  status?: string;
  search?: string;
  therapistId?: number;
}

/**
 * Hook for managing client data operations
 */
export function useClients() {
  const api = useApi();
  
  /**
   * Fetch all clients with optional filtering
   */
  const getClients = (filters?: ClientFilters) => {
    const queryString = filters
      ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
      : '';
      
    return api.fetch<Client[]>(
      `/clients${queryString}`,
      queryKeys.clients.list(),
    );
  };
  
  /**
   * Fetch a single client by ID
   */
  const getClient = (id: number) => {
    return api.fetch<Client>(
      `/clients/${id}`,
      queryKeys.clients.detail(id),
    );
  };
  
  /**
   * Create a new client with optimistic update
   */
  const createClient = () => {
    return api.post<Client, Partial<Client>>(
      '/clients',
      {
        onMutate: async (newClient) => {
          // Cancel any outgoing refetches to avoid overwriting optimistic update
          await api.queryClient.cancelQueries({ queryKey: queryKeys.clients.list() });
          
          // Get current clients from cache
          const previousClients = api.queryClient.getQueryData(queryKeys.clients.list()) as Client[] || [];
          
          // Create optimistic client with temporary ID
          const optimisticClient = {
            id: Math.random() * -1000000, // Temporary negative ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...newClient,
          } as Client;
          
          // Add optimistically
          api.queryClient.setQueryData(
            queryKeys.clients.list(),
            [...previousClients, optimisticClient]
          );
          
          // Return context for rollback
          return { previousClients };
        },
        onError: (_err, _newClient, context: any) => {
          // Rollback to previous state
          if (context?.previousClients) {
            api.queryClient.setQueryData(
              queryKeys.clients.list(),
              context.previousClients
            );
          }
        },
        onSettled: () => {
          // Always refetch after error or success
          api.queryClient.invalidateQueries({ queryKey: queryKeys.clients.list() });
        },
      }
    );
  };
  
  /**
   * Update client with optimistic update
   */
  const updateClient = () => {
    return api.patch<Client, { id: number; data: Partial<Client> }>(
      '/clients/:id',
      {
        onMutate: async ({ id, data }) => {
          // Cancel any outgoing refetches
          await api.queryClient.cancelQueries({ queryKey: queryKeys.clients.detail(id) });
          await api.queryClient.cancelQueries({ queryKey: queryKeys.clients.list() });
          
          // Get current client
          const previousClient = api.queryClient.getQueryData(queryKeys.clients.detail(id)) as Client;
          
          // Apply optimistic update
          if (previousClient) {
            const optimisticClient = {
              ...previousClient,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            
            // Update detailed view cache
            api.queryClient.setQueryData(
              queryKeys.clients.detail(id),
              optimisticClient
            );
            
            // Update in list view if present
            const clientList = api.queryClient.getQueryData(queryKeys.clients.list()) as Client[] | undefined;
            if (clientList) {
              api.queryClient.setQueryData(
                queryKeys.clients.list(),
                clientList.map(c => c.id === id ? optimisticClient : c)
              );
            }
          }
          
          return { previousClient };
        },
        onError: (_err, variables, context: any) => {
          // Rollback on error
          if (context?.previousClient) {
            api.queryClient.setQueryData(
              queryKeys.clients.detail(variables.id),
              context.previousClient
            );
            
            // Also update in list
            const clientList = api.queryClient.getQueryData(queryKeys.clients.list()) as Client[] | undefined;
            if (clientList) {
              api.queryClient.setQueryData(
                queryKeys.clients.list(),
                clientList.map(c => c.id === variables.id ? context.previousClient : c)
              );
            }
          }
        },
        onSettled: (_data, _error, variables) => {
          // Always refetch after error or success
          api.queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(variables.id) });
          api.queryClient.invalidateQueries({ queryKey: queryKeys.clients.list() });
        },
      }
    );
  };
  
  /**
   * Delete client with optimistic update
   */
  const deleteClient = () => {
    return api.remove<Client, number>(
      '/clients/:id',
      {
        onMutate: async (id) => {
          // Cancel outgoing refetches
          await api.queryClient.cancelQueries({ queryKey: queryKeys.clients.list() });
          
          // Snapshot current state
          const previousClients = api.queryClient.getQueryData(queryKeys.clients.list()) as Client[] | undefined;
          
          // Optimistically remove
          if (previousClients) {
            api.queryClient.setQueryData(
              queryKeys.clients.list(),
              previousClients.filter(c => c.id !== id)
            );
          }
          
          return { previousClients };
        },
        onError: (_err, id, context: any) => {
          // Rollback on error
          if (context?.previousClients) {
            api.queryClient.setQueryData(
              queryKeys.clients.list(),
              context.previousClients
            );
          }
        },
        onSettled: () => {
          // Always refetch after error or success
          api.queryClient.invalidateQueries({ queryKey: queryKeys.clients.list() });
        },
      }
    );
  };
  
  return {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
  };
} 
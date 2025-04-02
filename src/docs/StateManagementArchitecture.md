# MentalSpace EHR State Management Architecture

This document describes the state management architecture used in the MentalSpace EHR application, detailing the approach to data fetching, caching, and global state management.

## Overview

The state management architecture is built around:

1. **React Query** for server state management (data fetching, caching, synchronization)
2. **Custom hooks** for domain-specific data access patterns
3. **Context API** with reducer pattern for global application state
4. **Optimistic updates** for a responsive user experience

## Key Components

### 1. Query Client Configuration

The application uses a centralized query client configuration (`src/lib/queryClient.ts`) that:

- Configures global default options for queries and mutations
- Sets up default caching behavior and refetching strategies
- Provides standardized error handling through axios interceptors
- Defines consistent query keys across the application

```typescript
// Example of query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 2. Generic API Hook

The application provides a generic API hook (`src/hooks/useApi.ts`) that:

- Creates a standardized API for all data fetching operations
- Abstracts away the complexity of React Query
- Provides typed methods for common operations (GET, POST, PUT, PATCH, DELETE)
- Handles cache management consistently

```typescript
// Example usage of useApi hook
const { fetch, post, put, patch, remove } = useApi();

// Fetch data
const { data, isLoading } = fetch('/clients', ['clients', 'list']);

// Create data with mutation
const mutation = post('/clients');
mutation.mutate(newClient);
```

### 3. Domain-specific Data Hooks

The application provides domain-specific hooks that:

- Encapsulate business logic for specific entities (clients, appointments, etc.)
- Implement optimistic updates for better UX
- Handle complex data fetching patterns (pagination, filtering, etc.)
- Provide strongly typed interfaces for each domain

```typescript
// Example of domain-specific hook
function useClients() {
  // Provides methods specific to client data
  return {
    getClients, getClient, createClient, updateClient, deleteClient
  };
}

// Usage in components
const { getClients } = useClients();
const { data: clients } = getClients({ status: 'active' });
```

### 4. Global Application State

The application uses a global context (`src/contexts/AppStateContext.tsx`) for:

- User information and authentication state
- UI state (theme, sidebar, etc.)
- Notifications and system messages
- Other global application state

```typescript
// Example of using global application state
const { 
  theme, 
  setTheme, 
  currentUser, 
  addNotification 
} = useAppState();

// Set theme
setTheme('dark');

// Add notification
addNotification({
  message: 'Client record saved',
  type: 'success'
});
```

## Optimistic Updates

The architecture implements optimistic updates for a better user experience:

1. Update the UI immediately with the expected new state
2. Send the mutation to the server in the background
3. If successful, confirm the update in the UI
4. If failed, roll back to the previous state

```typescript
// Example of optimistic update implementation
const updateClient = () => {
  return api.patch<Client, { id: number; data: Partial<Client> }>(
    '/clients/:id',
    {
      onMutate: async ({ id, data }) => {
        // 1. Cancel ongoing refetches
        await api.queryClient.cancelQueries({ queryKey: queryKeys.clients.detail(id) });
        
        // 2. Save current data for rollback
        const previousClient = api.queryClient.getQueryData(queryKeys.clients.detail(id));
        
        // 3. Update cache optimistically
        api.queryClient.setQueryData(queryKeys.clients.detail(id), { ...previousClient, ...data });
        
        // 4. Return context for rollback
        return { previousClient };
      },
      onError: (error, variables, context) => {
        // 5. Rollback on error
        api.queryClient.setQueryData(
          queryKeys.clients.detail(variables.id),
          context.previousClient
        );
      },
      onSettled: (data, error, variables) => {
        // 6. Refetch to ensure consistency
        api.queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(variables.id) });
      },
    }
  );
};
```

## Integration with React Query DevTools

The application integrates React Query DevTools in development mode to:

- Monitor query and mutation states
- Debug cache issues
- Visualize refetching and loading states
- Track performance metrics

## Advantages of This Architecture

1. **Clear Separation of Concerns**
   - Server state vs. client state
   - Domain-specific logic encapsulated in hooks
   - Reusable patterns across the application

2. **Improved User Experience**
   - Optimistic updates
   - Consistent loading states
   - Error handling and recovery

3. **Developer Experience**
   - Strongly typed API
   - Consistent patterns
   - Reduced boilerplate code

4. **Performance Optimization**
   - Smart caching strategies
   - Reduced unnecessary fetching
   - Controlled refetching policies
   - Background data synchronization

## Best Practices

1. Always use the domain-specific hooks for entity operations
2. Follow the query key structure for consistent caching
3. Implement optimistic updates for mutations that modify data
4. Use the global application state only for truly global concerns
5. Prefer React Query for server data management over local state 
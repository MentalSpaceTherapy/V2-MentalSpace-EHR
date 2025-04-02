import { useInfiniteQuery } from '@tanstack/react-query';
import { useApi } from './useApi';
import { queryKeys } from '../lib/queryClient';
import { apiRequest } from '../lib/queryClient';
import type { Client } from '../types/client';

export interface Appointment {
  id: number;
  clientId: number;
  therapistId: number;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  type: string;
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations (expanded data)
  client?: Client;
  therapistName?: string;
}

export interface AppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  clientId?: number;
  therapistId?: number;
}

export interface CalendarViewFilters {
  year: number;
  month: number;
  therapistId?: number;
}

// Response type for paginated appointments
export interface PaginatedAppointmentsResponse {
  data: Appointment[];
  meta: { 
    total: number; 
    pages: number; 
    currentPage: number 
  };
}

/**
 * Hook for managing appointment data operations
 */
export function useAppointments() {
  const api = useApi();
  
  /**
   * Fetch all appointments with optional filtering
   */
  const getAppointments = (filters?: AppointmentFilters) => {
    const queryString = filters
      ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
      : '';
      
    return api.fetch<Appointment[]>(
      `/appointments${queryString}`,
      queryKeys.appointments.list(),
    );
  };

  /**
   * Fetch appointments for calendar view
   */
  const getCalendarAppointments = (filters: CalendarViewFilters) => {
    const { year, month, therapistId } = filters;
    const queryParams = new URLSearchParams();
    
    queryParams.append('year', year.toString());
    queryParams.append('month', (month + 1).toString()); // JavaScript months are 0-indexed
    
    if (therapistId) {
      queryParams.append('therapistId', therapistId.toString());
    }
    
    return api.fetch<Appointment[]>(
      `/appointments/calendar?${queryParams.toString()}`,
      queryKeys.appointments.calendar(year, month),
    );
  };
  
  /**
   * Fetch a single appointment by ID
   */
  const getAppointment = (id: number) => {
    return api.fetch<Appointment>(
      `/appointments/${id}`,
      queryKeys.appointments.detail(id),
    );
  };
  
  /**
   * Fetch client appointments with pagination support (infinite loading)
   */
  const getClientAppointments = (clientId: number, limit = 10) => {
    return useInfiniteQuery<PaginatedAppointmentsResponse, Error, PaginatedAppointmentsResponse, unknown, number>({
      queryKey: [...queryKeys.clients.appointments(clientId), 'infinite', limit],
      queryFn: async ({ pageParam }) => {
        const queryParams = new URLSearchParams({
          clientId: clientId.toString(),
          page: String(pageParam),
          limit: limit.toString(),
          sort: 'startTime:desc' // Most recent first
        });
        
        return apiRequest<PaginatedAppointmentsResponse>('GET', `/appointments?${queryParams.toString()}`);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage: PaginatedAppointmentsResponse) => {
        const nextPage = lastPage.meta.currentPage + 1;
        return nextPage <= lastPage.meta.pages ? nextPage : undefined;
      },
    });
  };
  
  /**
   * Create a new appointment with optimistic update
   */
  const createAppointment = () => {
    return api.post<Appointment, Partial<Appointment>>(
      '/appointments',
      {
        onMutate: async (newAppointment) => {
          // Cancel any outgoing refetches to avoid overwriting optimistic update
          await api.queryClient.cancelQueries({ queryKey: queryKeys.appointments.list() });
          
          if (newAppointment.startTime && newAppointment.endTime) {
            // Extract year and month to potentially invalidate calendar view
            const date = new Date(newAppointment.startTime);
            const year = date.getFullYear();
            const month = date.getMonth();
            await api.queryClient.cancelQueries({ 
              queryKey: queryKeys.appointments.calendar(year, month) 
            });
          }
          
          // Get current appointments from cache
          const previousAppointments = api.queryClient.getQueryData(
            queryKeys.appointments.list()
          ) as Appointment[] || [];
          
          // Create optimistic appointment
          const optimisticAppointment = {
            id: Math.random() * -1000000, // Temporary negative ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'scheduled',
            ...newAppointment,
          } as Appointment;
          
          // Add optimistically
          api.queryClient.setQueryData(
            queryKeys.appointments.list(),
            [...previousAppointments, optimisticAppointment]
          );
          
          // Return context for rollback
          return { previousAppointments };
        },
        onError: (_err, _newAppointment, context: any) => {
          // Rollback to previous state
          if (context?.previousAppointments) {
            api.queryClient.setQueryData(
              queryKeys.appointments.list(),
              context.previousAppointments
            );
          }
        },
        onSettled: (data) => {
          // Always refetch after error or success
          api.queryClient.invalidateQueries({ queryKey: queryKeys.appointments.list() });
          
          // If successful, invalidate client appointments
          if (data?.clientId) {
            api.queryClient.invalidateQueries({ 
              queryKey: queryKeys.clients.appointments(data.clientId) 
            });
          }
          
          // Invalidate calendar view if relevant
          if (data?.startTime) {
            const date = new Date(data.startTime);
            api.queryClient.invalidateQueries({ 
              queryKey: queryKeys.appointments.calendar(
                date.getFullYear(),
                date.getMonth()
              ) 
            });
          }
        },
      }
    );
  };
  
  /**
   * Update appointment status with optimistic update
   */
  const updateAppointmentStatus = () => {
    return api.patch<Appointment, { id: number; status: Appointment['status'] }>(
      '/appointments/:id/status',
      {
        onMutate: async ({ id, status }) => {
          // Cancel any outgoing refetches
          await api.queryClient.cancelQueries({ queryKey: queryKeys.appointments.detail(id) });
          await api.queryClient.cancelQueries({ queryKey: queryKeys.appointments.list() });
          
          // Get current appointment
          const previousAppointment = api.queryClient.getQueryData(
            queryKeys.appointments.detail(id)
          ) as Appointment;
          
          // Apply optimistic update
          if (previousAppointment) {
            const optimisticAppointment = {
              ...previousAppointment,
              status,
              updatedAt: new Date().toISOString(),
            };
            
            // Update detailed view cache
            api.queryClient.setQueryData(
              queryKeys.appointments.detail(id),
              optimisticAppointment
            );
            
            // Update in list view if present
            const appointmentList = api.queryClient.getQueryData(
              queryKeys.appointments.list()
            ) as Appointment[] | undefined;
            
            if (appointmentList) {
              api.queryClient.setQueryData(
                queryKeys.appointments.list(),
                appointmentList.map(a => a.id === id ? optimisticAppointment : a)
              );
            }
            
            return { previousAppointment };
          }
          
          return {};
        },
        onError: (_err, variables, context: any) => {
          // Rollback on error
          if (context?.previousAppointment) {
            api.queryClient.setQueryData(
              queryKeys.appointments.detail(variables.id),
              context.previousAppointment
            );
            
            // Also update in list
            const appointmentList = api.queryClient.getQueryData(
              queryKeys.appointments.list()
            ) as Appointment[] | undefined;
            
            if (appointmentList) {
              api.queryClient.setQueryData(
                queryKeys.appointments.list(),
                appointmentList.map(a => a.id === variables.id ? context.previousAppointment : a)
              );
            }
          }
        },
        onSettled: (_data, _error, variables) => {
          // Always refetch after error or success
          api.queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(variables.id) });
          api.queryClient.invalidateQueries({ queryKey: queryKeys.appointments.list() });
        },
      }
    );
  };
  
  return {
    getAppointments,
    getAppointment,
    getCalendarAppointments,
    getClientAppointments,
    createAppointment,
    updateAppointmentStatus,
  };
} 
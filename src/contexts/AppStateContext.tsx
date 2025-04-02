import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

// Types for app state
interface User {
  id: number;
  name: string;
  role: string;
  // Other user properties
}

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface AppState {
  currentUser: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadNotifications: number;
  lastSyncTime: string | null;
}

// Types for app actions
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: number }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: number }
  | { type: 'SET_LAST_SYNC_TIME'; payload: string };

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  // Convenience methods
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: number) => void;
}

// Initial state
const initialState: AppState = {
  currentUser: null,
  isInitialized: false,
  isLoading: true,
  theme: 'system',
  sidebarOpen: true,
  notifications: [],
  unreadNotifications: 0,
  lastSyncTime: null,
};

// Create context
const AppStateContext = createContext<AppContextValue | undefined>(undefined);

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        id: Date.now(), // Use timestamp as ID
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
      };
    }
    case 'MARK_NOTIFICATION_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
      };
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const updatedNotifications = state.notifications.map(notification => ({ ...notification, read: true }));
      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: 0,
      };
    }
    case 'REMOVE_NOTIFICATION': {
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      const updatedNotifications = state.notifications.filter(notification => notification.id !== action.payload);
      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: notificationToRemove && !notificationToRemove.read
          ? Math.max(0, state.unreadNotifications - 1)
          : state.unreadNotifications,
      };
    }
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    default:
      return state;
  }
}

// Provider component
interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const queryClient = useQueryClient();
  
  // Convenience methods
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };
  
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    localStorage.setItem('theme', theme);
  };
  
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    // Invalidate notifications query if we're using React Query for notifications
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
  
  const markNotificationRead = (id: number) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    // Invalidate notifications query
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
  
  const markAllNotificationsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    // Invalidate notifications query
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
  
  const removeNotification = (id: number) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    // Invalidate notifications query
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
  
  // Calculate unread notifications count whenever notifications change
  React.useEffect(() => {
    // This effect is just for demonstration purposes to show
    // how you might sync the context state with React Query
  }, [state.notifications, queryClient]);
  
  // Initialize the app
  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as AppState['theme'] | null;
        if (savedTheme) {
          dispatch({ type: 'SET_THEME', payload: savedTheme });
        }
        
        // Simulate loading user data
        // In a real app, you'd fetch from your API
        setTimeout(() => {
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_LOADING', payload: false });
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize app', error);
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Combine state and methods
  const value: AppContextValue = {
    ...state,
    dispatch,
    setUser,
    setTheme,
    toggleSidebar,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hook for using app state
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
} 
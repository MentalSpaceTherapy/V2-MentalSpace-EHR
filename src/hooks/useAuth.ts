import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Mock authentication for demo purposes
    setTimeout(() => {
      setAuthState({
        user: {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin',
          permissions: ['view_clients', 'edit_clients', 'view_appointments', 'manage_system'],
        },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login implementation
    setAuthState({
      user: {
        id: '1',
        name: 'Demo User',
        email,
        role: 'admin',
        permissions: ['view_clients', 'edit_clients', 'view_appointments', 'manage_system'],
      },
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  };
}; 
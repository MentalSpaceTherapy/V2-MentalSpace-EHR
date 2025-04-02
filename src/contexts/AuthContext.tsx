import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../utils/apiRequest';

// User type definition
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Authentication context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Registration data type
interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Provider props type
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        // User is not authenticated, but this isn't an error
        console.log('User not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setUser(data.data);
        // Store auth token if provided
        if (data.data.token) {
          localStorage.setItem('authToken', data.data.token);
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
      localStorage.removeItem('authToken');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during logout';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setUser(data.data);
        // Store auth token if provided
        if (data.data.token) {
          localStorage.setItem('authToken', data.data.token);
        }
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setUser(data.data);
      }
    } catch (err) {
      // If unauthorized, clear user data
      if (err instanceof Error && err.message.includes('401')) {
        setUser(null);
        localStorage.removeItem('authToken');
      }
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 
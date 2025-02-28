import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DEFAULT_AVATAR } from "@/lib/constants";

type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  licenseType?: string;
  profileImageUrl?: string;
  isAuthenticated: boolean;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  changeRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demonstration purposes
const MOCK_USER: AuthUser = {
  id: 1,
  firstName: "Sarah",
  lastName: "Johnson",
  email: "therapist@mentalspace.com",
  role: "Therapist",
  licenseType: "LPC, LMHC",
  profileImageUrl: DEFAULT_AVATAR,
  isAuthenticated: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    // In a real app, we'd check for a valid session/token
    // For the demo, we'll auto-logout on refresh
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API request timing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, we would make an API call here
      // For the demo, we'll just check against our mock data
      if (email === MOCK_USER.email && password) {
        setUser(MOCK_USER);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const changeRole = (role: string) => {
    if (user) {
      setUser({
        ...user,
        role: role
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, changeRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

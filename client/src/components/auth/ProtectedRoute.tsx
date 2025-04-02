import { ReactNode, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

/**
 * A component that protects routes by checking authentication status and optional role requirements.
 * 
 * @param children - The content to render when authenticated
 * @param requiredRoles - Optional array of roles that are allowed to access this route
 */
export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If authentication check is complete and user is not logged in, redirect to login
    if (!isLoading && !user) {
      setLocation("/login");
    }
    
    // If user doesn't have required role, redirect to dashboard
    if (!isLoading && user && requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        setLocation("/");
      }
    }
  }, [user, isLoading, setLocation, requiredRoles]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is complete but user is not logged in, return null to prevent flash before redirect
  if (!user) {
    return null;
  }

  // If role check fails, return null to prevent flash before redirect
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 
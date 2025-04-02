import { LoginForm } from "@/components/auth/LoginForm";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log("LoginPage mounted");
  }, []);

  // If still loading, show nothing
  if (isLoading) {
    return null;
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    setLocation("/");
    return null;
  }

  console.log("Rendering LoginPage");

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
} 
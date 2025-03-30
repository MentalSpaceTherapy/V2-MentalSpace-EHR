import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function SignIn() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Since we have a default authenticated user, redirect to dashboard
    navigate("/");
  }, [navigate]);

  return null; // Don't render anything while redirecting
} 
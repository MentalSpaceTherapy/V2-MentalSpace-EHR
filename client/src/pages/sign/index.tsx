import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import SignatureView from "@/components/signatures/SignatureView";

/**
 * Signature Request Handler Page
 * 
 * This page handles signature requests accessed via a URL.
 * Format: /sign/:accessUrl?code=:accessCode
 */
const SignaturePage = () => {
  const [match, params] = useRoute("/sign/:accessUrl");
  const [_, navigate] = useLocation();
  
  // Extract access URL and code from URL
  const accessUrl = match ? params.accessUrl : null;
  const searchParams = new URLSearchParams(window.location.search);
  const accessCode = searchParams.get("code") || undefined;
  
  useEffect(() => {
    // Redirect to home if no access URL
    if (!accessUrl) {
      navigate("/");
    }
  }, [accessUrl, navigate]);
  
  if (!accessUrl) {
    return <div>Redirecting...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SignatureView accessUrl={accessUrl} accessCode={accessCode} />
    </div>
  );
};

export default SignaturePage;
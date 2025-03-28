import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CRMIndex() {
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the CRM dashboard
    setLocation("/crm/dashboard");
  }, [setLocation]);
  
  // Return an empty div instead of null to satisfy the Element return type
  return <div className="hidden"></div>;
}
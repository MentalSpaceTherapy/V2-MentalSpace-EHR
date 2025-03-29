import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { StaffForm } from "@/components/practice/StaffForm";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AddStaffPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  const handleSave = (data: any) => {
    toast({
      title: "Staff Member Saved",
      description: `Successfully saved staff member: ${data.first_name} ${data.last_name}`,
    });
    // Redirect to staff list after save
    setLocation("/staff");
  };

  const handleCancel = () => {
    setLocation("/staff");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Add Staff Member" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Add New Staff Member</h2>
              <div className="mt-6">
                <StaffForm 
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
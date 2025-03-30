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

  const handleSave = async (data: any) => {
    try {
      // Make API call to save staff member
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save staff member');
      }
      
      toast({
        title: "Staff Member Saved",
        description: `Successfully saved staff member: ${data.firstName} ${data.lastName}`,
      });
      // Redirect to staff list after save
      setLocation("/staff");
    } catch (error) {
      console.error('Error saving staff member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save staff member",
        variant: "destructive",
      });
    }
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
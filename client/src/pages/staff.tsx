import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { StaffList } from "@/components/practice/StaffList";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { Staff } from "@shared/schema";
import { StaffModal } from "@/components/practice/StaffModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  roles?: string[];
  licenseType?: string | null;
  licenseNumber?: string | null;
  licenseExpiration?: Date | null;
  status: string;
  profileImage?: string | null;
}

export default function StaffPage() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const { toast } = useToast();

  // Fetch staff data
  const {
    data: staffData,
    isLoading,
    isError,
  } = useQuery<StaffMember[]>({
    queryKey: ['/api/staff'],
    retry: 1,
    onSuccess: (data) => {
      // Map date strings to Date objects
      if (data) {
        data.forEach(staff => {
          if (staff.licenseExpiration && typeof staff.licenseExpiration === 'string') {
            staff.licenseExpiration = new Date(staff.licenseExpiration);
          }
        });
      }
    },
    onError: () => {
      console.error("Failed to fetch staff data");
      setError("Failed to load staff data. Please try again later.");
    }
  });

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Staff Management" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <Button onClick={handleAddStaff}>Add Staff Member</Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : isError || error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error || "An error occurred while loading staff data. Please try refreshing the page."}
            </div>
          ) : (
            <StaffList initialStaff={staffData || []} onEdit={handleEditStaff} />
          )}
        </div>

        <StaffModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          staff={selectedStaff}
        />
      </div>
    </div>
  );
}
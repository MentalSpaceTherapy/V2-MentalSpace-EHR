import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaffForm } from "./StaffForm";
import { Staff } from "@shared/schema";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: Staff | null;
}

export function StaffModal({ isOpen, onClose, staff }: StaffModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? "Edit Staff Member" : "Add Staff Member"}
          </DialogTitle>
        </DialogHeader>
        <StaffForm
          staff={staff}
          onCancel={onClose}
          onSubmit={async (data) => {
            // Handle form submission
            try {
              const url = staff ? `/api/staff/${staff.id}` : '/api/staff';
              const method = staff ? 'PUT' : 'POST';
              
              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Failed to save staff member');
              }

              onClose();
            } catch (error) {
              console.error('Error saving staff member:', error);
              throw error;
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
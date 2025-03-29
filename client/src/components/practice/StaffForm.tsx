// StaffForm.tsx with the exact same structure as the JSX version
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StaffFormProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
  editingStaff?: any;
}

export function StaffForm({ onSave, onCancel, editingStaff }: StaffFormProps) {
  const { toast } = useToast();
  const [staffData, setStaffData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    type_of_clinician: "",
    npi_number: "",
    supervisor_id: "",
    role: "",
    email: "",
    phone: "",
    can_receive_texts: false,
    work_phone: "",
    address: "",
    city_state: "",
    zip_code: "",
    license_state: "",
    license_taxonomy: "",
    license_expiration: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setStaffData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Error",
          description: result.message || "Error creating staff member",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Staff member ${staffData.first_name} ${staffData.last_name} created successfully`,
        });
        
        // Reset form
        setStaffData({
          first_name: "",
          middle_name: "",
          last_name: "",
          suffix: "",
          type_of_clinician: "",
          npi_number: "",
          supervisor_id: "",
          role: "",
          email: "",
          phone: "",
          can_receive_texts: false,
          work_phone: "",
          address: "",
          city_state: "",
          zip_code: "",
          license_state: "",
          license_taxonomy: "",
          license_expiration: "",
        });
        
        // If onSave prop is provided, call it with the staff data
        if (onSave) {
          onSave(result.staff);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Add New Staff</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">First Name:</label>
          <input
            type="text"
            name="first_name"
            value={staffData.first_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Middle Name:</label>
          <input
            type="text"
            name="middle_name"
            value={staffData.middle_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={staffData.last_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Suffix:</label>
          <input
            type="text"
            name="suffix"
            value={staffData.suffix}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Type of Clinician:</label>
        <select
          name="type_of_clinician"
          value={staffData.type_of_clinician}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">--Select--</option>
          <option value="Licensed Clinical Psychologist">
            Licensed Clinical Psychologist
          </option>
          <option value="Licensed Professional Counselor">
            Licensed Professional Counselor
          </option>
          <option value="Clinical Social Worker">
            Clinical Social Worker
          </option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">NPI Number:</label>
        <input
          type="text"
          name="npi_number"
          value={staffData.npi_number}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Supervisor ID (if any):</label>
        <input
          type="number"
          name="supervisor_id"
          value={staffData.supervisor_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Role:</label>
        <select 
          name="role" 
          value={staffData.role} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">--Select--</option>
          <option value="Practice Administrator">Practice Administrator</option>
          <option value="Clinician">Clinician</option>
          <option value="Intern/Assistant/Associate">
            Intern/Assistant/Associate
          </option>
          <option value="Supervisor">Supervisor</option>
          <option value="Clinical Administrator">Clinical Administrator</option>
          <option value="Scheduler">Scheduler</option>
          <option value="Biller">Biller</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Email:</label>
        <input
          type="email"
          name="email"
          value={staffData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Phone:</label>
          <input
            type="text"
            name="phone"
            value={staffData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-8">
          <input
            type="checkbox"
            name="can_receive_texts"
            checked={staffData.can_receive_texts}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm font-medium">Can Receive Texts</label>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Work Phone:</label>
        <input
          type="text"
          name="work_phone"
          value={staffData.work_phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Address:</label>
        <input
          type="text"
          name="address"
          value={staffData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">City/State:</label>
          <input
            type="text"
            name="city_state"
            value={staffData.city_state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Zip Code:</label>
          <input
            type="text"
            name="zip_code"
            value={staffData.zip_code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <hr className="my-6" />
      <h3 className="text-lg font-medium mb-4">License Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">License State:</label>
          <input
            type="text"
            name="license_state"
            value={staffData.license_state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Taxonomy:</label>
          <input
            type="text"
            name="license_taxonomy"
            value={staffData.license_taxonomy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">License Expiration (mm/dd/yyyy):</label>
        <input
          type="text"
          name="license_expiration"
          value={staffData.license_expiration}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="flex justify-end space-x-4 mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save New Staff
        </button>
      </div>
    </form>
  );
}
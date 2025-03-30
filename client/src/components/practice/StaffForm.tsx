// StaffForm.tsx - Refactored for consistency with data model
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Staff } from "@shared/schema";

interface StaffFormProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
  editingStaff?: Partial<Staff> | null;
}

export function StaffForm({ onSave, onCancel, editingStaff }: StaffFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default empty form structure using camelCase for frontend interface
  const [staffData, setStaffData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    typeOfClinician: "",
    npiNumber: "",
    supervisorId: "",
    role: "",
    roles: [] as string[],
    email: "",
    phone: "",
    canReceiveSMS: false,
    workPhone: "",
    homePhone: "",
    address: "",
    cityState: "",
    zipCode: "",
    licenseState: "",
    licenseType: "",
    licenseNumber: "",
    licenseExpiration: "",
    formalName: "",
    title: "",
    languages: [] as string[],
    status: "active",
    profileImage: "",
  });

  // Initialize form when editing
  useEffect(() => {
    if (editingStaff) {
      setStaffData({
        // Set defaults that match the required structure
        firstName: editingStaff.firstName || "",
        middleName: editingStaff.middleName || "",
        lastName: editingStaff.lastName || "",
        suffix: editingStaff.suffix || "",
        typeOfClinician: editingStaff.typeOfClinician || "",
        npiNumber: editingStaff.npiNumber || "",
        supervisorId: editingStaff.supervisorId?.toString() || "",
        role: editingStaff.role || "",
        roles: editingStaff.roles || [],
        email: editingStaff.email || "",
        phone: editingStaff.phone || "",
        canReceiveSMS: editingStaff.canReceiveSMS || false,
        workPhone: editingStaff.workPhone || "",
        homePhone: editingStaff.homePhone || "",
        address: editingStaff.address || "",
        cityState: editingStaff.cityState || "",
        zipCode: editingStaff.zipCode || "",
        licenseState: editingStaff.licenseState || "",
        licenseType: editingStaff.licenseType || "",
        licenseNumber: editingStaff.licenseNumber || "",
        licenseExpiration: editingStaff.licenseExpiration || "",
        formalName: editingStaff.formalName || "",
        title: editingStaff.title || "",
        languages: editingStaff.languages || [],
        status: editingStaff.status || "active",
        profileImage: editingStaff.profileImage || "",
      });
    }
  }, [editingStaff]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setStaffData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setStaffData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setStaffData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call onSave directly with the staffData if provided - the parent will handle the API call
      if (onSave) {
        await onSave(staffData);
        setIsSubmitting(false);
        return;
      }
      
      // Otherwise, handle the API call here
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
          description: `Staff member ${staffData.firstName} ${staffData.lastName} created successfully`,
        });
        
        // Redirect to staff list
        setLocation("/staff");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clinicianTypes = [
    "Licensed Clinical Psychologist",
    "Licensed Professional Counselor",
    "Clinical Social Worker",
    "Licensed Marriage and Family Therapist",
    "Psychiatrist",
    "Advanced Practice Registered Nurse",
    "Occupational Therapist",
    "Physical Therapist",
    "Speech-Language Pathologist",
    "Other"
  ];
  
  const roleOptions = [
    "Practice Administrator",
    "Clinician",
    "Intern/Assistant/Associate",
    "Supervisor",
    "Clinical Administrator",
    "Scheduler",
    "Biller"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">{editingStaff ? "Edit Staff Member" : "Add New Staff"}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={staffData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            name="middleName"
            value={staffData.middleName}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={staffData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="suffix">Suffix</Label>
          <Input
            id="suffix"
            name="suffix"
            value={staffData.suffix}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="typeOfClinician">Type of Clinician</Label>
        <Select 
          name="typeOfClinician" 
          value={staffData.typeOfClinician}
          onValueChange={(value) => handleSelectChange("typeOfClinician", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select clinician type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">--Select--</SelectItem>
            {clinicianTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="npiNumber">NPI Number</Label>
        <Input
          id="npiNumber"
          name="npiNumber"
          value={staffData.npiNumber}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="supervisorId">Supervisor ID (if any)</Label>
        <Input
          id="supervisorId"
          name="supervisorId"
          type="number"
          value={staffData.supervisorId}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Primary Role</Label>
        <Select 
          name="role" 
          value={staffData.role}
          onValueChange={(value) => handleSelectChange("role", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">--Select--</SelectItem>
            {roleOptions.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={staffData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={staffData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-8">
          <Checkbox
            id="canReceiveSMS"
            checked={staffData.canReceiveSMS}
            onCheckedChange={(checked) => handleCheckboxChange("canReceiveSMS", checked as boolean)}
          />
          <Label htmlFor="canReceiveSMS">Can Receive Texts</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="workPhone">Work Phone</Label>
        <Input
          id="workPhone"
          name="workPhone"
          value={staffData.workPhone}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="homePhone">Home Phone</Label>
        <Input
          id="homePhone"
          name="homePhone"
          value={staffData.homePhone}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={staffData.address}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cityState">City/State</Label>
          <Input
            id="cityState"
            name="cityState"
            value={staffData.cityState}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={staffData.zipCode}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <hr className="my-6" />
      <h3 className="text-lg font-medium mb-4">License Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="licenseState">License State</Label>
          <Input
            id="licenseState"
            name="licenseState"
            value={staffData.licenseState}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="licenseType">License Type</Label>
          <Input
            id="licenseType"
            name="licenseType"
            value={staffData.licenseType}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={staffData.licenseNumber}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="licenseExpiration">License Expiration (mm/dd/yyyy)</Label>
          <Input
            id="licenseExpiration"
            name="licenseExpiration"
            value={staffData.licenseExpiration}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="formalName">Formal Name</Label>
          <Input
            id="formalName"
            name="formalName"
            value={staffData.formalName}
            onChange={handleChange}
            placeholder="Dr. Smith"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            name="title"
            value={staffData.title}
            onChange={handleChange}
            placeholder="Clinical Director"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-8">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : editingStaff ? "Update Staff Member" : "Save New Staff"}
        </Button>
      </div>
    </form>
  );
}
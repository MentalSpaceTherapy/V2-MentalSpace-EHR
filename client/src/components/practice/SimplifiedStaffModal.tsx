import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { USER_ROLES, ROLE_CATEGORIES, ROLE_DETAILS, LICENSE_TYPES } from "@/lib/constants";

interface StaffMember {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
  roles?: string[];
  licenseType?: string | null;
  licenseNumber?: string | null;
  licenseExpiration?: Date | null;
  status?: string;
  formalName?: string;
  title?: string;
  npiNumber?: string;
  supervision?: string;
  languages?: string[];
  canReceiveSMS?: boolean;
  workPhone?: string;
  homePhone?: string;
  address1?: string;
  address2?: string;
  zip?: string;
  city?: string;
  state?: string;
}

interface SimplifiedStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: StaffMember) => void;
  editingStaff?: StaffMember;
}

export function SimplifiedStaffModal({ 
  isOpen, 
  onClose, 
  onSave,
  editingStaff 
}: SimplifiedStaffModalProps) {
  // Initialize form data
  const [formData, setFormData] = useState<StaffMember>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roles: [],
    licenseType: "",
    licenseNumber: "",
    formalName: "",
    title: "",
    npiNumber: "",
    supervision: "Not Supervised",
    languages: ["English (primary)"],
    canReceiveSMS: false,
    workPhone: "",
    homePhone: "",
    address1: "",
    address2: "",
    zip: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showClinicianFields, setShowClinicianFields] = useState(false);
  
  // Update form data when editing an existing staff member
  useEffect(() => {
    if (editingStaff) {
      setFormData({
        ...editingStaff,
        roles: editingStaff.roles || (editingStaff.role ? [editingStaff.role] : []),
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        roles: [],
        licenseType: "",
        licenseNumber: "",
        formalName: "",
        title: "",
        npiNumber: "",
        supervision: "Not Supervised",
        languages: ["English (primary)"],
        canReceiveSMS: false,
        workPhone: "",
        homePhone: "",
        address1: "",
        address2: "",
        zip: "",
        city: "",
        state: "",
      });
    }
  }, [editingStaff]);

  // Update showClinicianFields based on selected roles
  useEffect(() => {
    const hasClinicianRole = 
      formData.roles?.includes(USER_ROLES.CLINICIAN) || 
      formData.roles?.includes(USER_ROLES.INTERN) ||
      formData.roles?.includes(USER_ROLES.SUPERVISOR) ||
      formData.roles?.includes(USER_ROLES.CLINICAL_ADMIN);
    
    setShowClinicianFields(hasClinicianRole || false);
  }, [formData.roles]);

  // Validate form before saving
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    
    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = "At least one role is required";
    }
    
    if (showClinicianFields) {
      if (!formData.licenseType) {
        newErrors.licenseType = "License type is required for clinical roles";
      }
      if (!formData.licenseNumber) {
        newErrors.licenseNumber = "License number is required for clinical roles";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle role toggle
  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      const roles = prev.roles || [];
      const roleExists = roles.includes(role);
      
      if (roleExists) {
        return {
          ...prev,
          roles: roles.filter(r => r !== role)
        };
      } else {
        return {
          ...prev,
          roles: [...roles, role]
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name*</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name*</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address*</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            {/* Roles Section */}
            <div className="space-y-2">
              <Label>Roles*</Label>
              <div className="border rounded-md p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Each user can have multiple roles. Select all that apply:
                </p>
                
                {Object.entries(ROLE_CATEGORIES).map(([categoryKey, categoryName]) => (
                  <div key={categoryKey} className="space-y-2">
                    <h3 className="font-medium">{categoryName}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(USER_ROLES)
                        .filter(([_, roleName]) => ROLE_DETAILS[roleName]?.category === categoryName)
                        .map(([roleKey, roleName]) => (
                          <div key={roleKey} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`role-${roleKey}`}
                              checked={formData.roles?.includes(roleName) || false}
                              onCheckedChange={() => handleRoleToggle(roleName)}
                            />
                            <div>
                              <Label 
                                htmlFor={`role-${roleKey}`}
                                className="font-normal cursor-pointer"
                              >
                                {roleName}
                              </Label>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
                
                {errors.roles && (
                  <p className="text-red-500 text-sm">{errors.roles}</p>
                )}
              </div>
            </div>

            {/* Clinician Fields */}
            {showClinicianFields && (
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Clinician Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type*</Label>
                  <Select 
                    value={formData.licenseType || ""} 
                    onValueChange={(value) => setFormData({...formData, licenseType: value})}
                  >
                    <SelectTrigger className={errors.licenseType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_TYPES.map((license) => (
                        <SelectItem key={license} value={license}>
                          {license}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.licenseType && (
                    <p className="text-red-500 text-sm">{errors.licenseType}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number*</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber || ""}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className={errors.licenseNumber ? "border-red-500" : ""}
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-500 text-sm">{errors.licenseNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formalName">Formal Name with Credentials</Label>
                  <Input
                    id="formalName"
                    placeholder='e.g., "Dr. Jane Smith, Ph.D."'
                    value={formData.formalName || ""}
                    onChange={(e) => setFormData({...formData, formalName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Licensed Clinical Psychologist"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="npi">NPI Number</Label>
                  <Input
                    id="npi"
                    value={formData.npiNumber || ""}
                    onChange={(e) => setFormData({...formData, npiNumber: e.target.value})}
                  />
                </div>
                
                {formData.roles?.includes(USER_ROLES.INTERN) && (
                  <div className="space-y-2">
                    <Label htmlFor="supervision">Supervision</Label>
                    <Select 
                      value={formData.supervision || "Not Supervised"} 
                      onValueChange={(value) => setFormData({...formData, supervision: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not Supervised" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Supervised">Not Supervised</SelectItem>
                        <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                        <SelectItem value="Dr. Michael Williams">Dr. Michael Williams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Additional Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Additional Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workPhone">Work Phone</Label>
                  <Input
                    id="workPhone"
                    value={formData.workPhone || ""}
                    onChange={(e) => setFormData({...formData, workPhone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="homePhone">Home Phone</Label>
                  <Input
                    id="homePhone"
                    value={formData.homePhone || ""}
                    onChange={(e) => setFormData({...formData, homePhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canReceiveSMS"
                  checked={formData.canReceiveSMS || false}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, canReceiveSMS: checked === true})
                  }
                />
                <Label htmlFor="canReceiveSMS">Can receive SMS notifications</Label>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  value={formData.address1 || ""}
                  onChange={(e) => setFormData({...formData, address1: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  value={formData.address2 || ""}
                  onChange={(e) => setFormData({...formData, address2: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={formData.state || ""} 
                    onValueChange={(value) => setFormData({...formData, state: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip || ""}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingStaff ? "Update Staff Member" : "Add Staff Member"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
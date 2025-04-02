// StaffForm.tsx - Refactored for consistency with data model
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USER_ROLES, ROLE_CATEGORIES, ROLE_DETAILS, LICENSE_TYPES } from "@/lib/constants";
import { Search, AlertCircle, Info, X, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Staff } from "@shared/schema";

interface StaffFormProps {
  staff?: Staff | null;
  onCancel: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
}

const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  typeOfClinician: z.string().min(1, "Type of clinician is required"),
  npiNumber: z.string().optional(),
  supervisorId: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  roles: z.array(z.string()).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  canReceiveSMS: z.boolean().optional(),
  workPhone: z.string().optional(),
  homePhone: z.string().optional(),
  address: z.string().optional(),
  cityState: z.string().optional(),
  zipCode: z.string().optional(),
  licenseState: z.string().optional(),
  licenseType: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiration: z.string().optional(),
  formalName: z.string().optional(),
  title: z.string().optional(),
  languages: z.array(z.string()).optional(),
  status: z.string().min(1, "Status is required"),
  profileImage: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

export function StaffForm({ staff, onCancel, onSubmit }: StaffFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(staff?.roles || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: staff?.firstName || "",
      middleName: staff?.middleName || "",
      lastName: staff?.lastName || "",
      suffix: staff?.suffix || "",
      typeOfClinician: staff?.typeOfClinician || "",
      npiNumber: staff?.npiNumber || "",
      supervisorId: staff?.supervisorId?.toString() || "",
      role: staff?.role || "",
      roles: staff?.roles || [],
      email: staff?.email || "",
      phone: staff?.phone || "",
      canReceiveSMS: staff?.canReceiveSMS || false,
      workPhone: staff?.workPhone || "",
      homePhone: staff?.homePhone || "",
      address: staff?.address || "",
      cityState: staff?.cityState || "",
      zipCode: staff?.zipCode || "",
      licenseState: staff?.licenseState || "",
      licenseType: staff?.licenseType || "",
      licenseNumber: staff?.licenseNumber || "",
      licenseExpiration: staff?.licenseExpiration || "",
      formalName: staff?.formalName || "",
      title: staff?.title || "",
      languages: staff?.languages || [],
      status: staff?.status || "active",
      profileImage: staff?.profileImage || "",
    },
  });

  const selectedRole = watch("role");
  const isClinician = selectedRole === USER_ROLES.CLINICIAN || selectedRole === USER_ROLES.THERAPIST;

  useEffect(() => {
    if (staff) {
      setSelectedRoles(staff.roles || []);
      Object.entries(staff).forEach(([key, value]) => {
        if (key === "supervisorId") {
          setValue(key, value?.toString() || "");
        } else {
          setValue(key as keyof StaffFormData, value as any);
        }
      });
    }
  }, [staff, setValue]);

  const handleFormSubmit = handleSubmit(async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Success",
        description: `Staff member ${staff ? "updated" : "created"} successfully`,
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

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

  const handleRoleChange = (role: string) => {
    setValue("role", role);
    setValue("roles", [role]);
    setSelectedRoles([role]);
  };

  const handleRoleToggle = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(newRoles);
    setValue("roles", newRoles);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="roles">Roles & Access</TabsTrigger>
          <TabsTrigger value="user">User Information</TabsTrigger>
          <TabsTrigger value="credentials">
            Credentials
          </TabsTrigger>
        </TabsList>
        
        {/* Roles & Access Tab */}
        <TabsContent value="roles" className="space-y-4 mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Each user can have multiple roles. A user's roles determine what they can access within MentalSpace.
            </p>
            
            {Object.entries(ROLE_CATEGORIES).map(([categoryKey, categoryName]) => (
              <div key={categoryKey} className="flex items-start space-x-3">
                {Object.entries(USER_ROLES)
                  .filter(([_, roleName]) => ROLE_DETAILS[roleName]?.category === categoryName)
                  .map(([roleKey, roleName]) => (
                    <div key={roleKey} className="flex items-start space-x-3">
                      <Checkbox 
                        id={`role-${roleKey}`}
                        checked={selectedRoles.includes(roleName) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleRoleChange(roleName);
                          } else {
                            handleRoleToggle(roleName);
                          }
                        }}
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor={`role-${roleKey}`}
                          className="font-medium cursor-pointer"
                        >
                          {roleName}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {ROLE_DETAILS[roleName]?.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* User Information Tab */}
        <TabsContent value="user" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name*</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name*</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
            />
          </div>
          
          <div className="flex items-center pl-4 mt-8">
            <Checkbox 
              id="canReceiveSMS"
              checked={staff?.canReceiveSMS || false}
              onCheckedChange={(checked) => {
                register("canReceiveSMS")(checked === true);
              }}
            />
            <Label htmlFor="canReceiveSMS" className="ml-2 cursor-pointer">
              Can receive text messages
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workPhone">Work Phone</Label>
            <Input
              id="workPhone"
              {...register("workPhone")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="homePhone">Home Phone</Label>
            <Input
              id="homePhone"
              {...register("homePhone")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                {...register("zipCode")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cityState">City/State</Label>
              <Input
                id="cityState"
                {...register("cityState")}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4 mt-4">
          <div className="p-4 bg-primary/10 rounded-md mb-4">
            <h3 className="text-md font-medium mb-2">Look Up Clinician in NPI Registry</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Search the public NPI registry to speed up user account creation. We will import details, including the clinician's name and licenses. You can review and update this information below. This step is optional if you do not have the clinician's NPI number handy.
            </p>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Individual NPI - Type 1"
                  {...register("npiNumber")}
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typeOfClinician">Type of Clinician*</Label>
              <Select 
                {...register("typeOfClinician")}
                className={errors.typeOfClinician ? "border-red-500" : ""}
              >
                <SelectTrigger className={errors.typeOfClinician ? "border-red-500" : ""}>
                  <SelectValue placeholder="-- Select Clinician Type --" />
                </SelectTrigger>
                <SelectContent>
                  {clinicianTypes.map((license) => (
                    <SelectItem key={license} value={license}>
                      {license}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.typeOfClinician && (
                <p className="text-red-500 text-sm">{errors.typeOfClinician.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formalName">Formal Name</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Input
                        id="formalName"
                        placeholder='Example: "John Smith, Ph.D."'
                        {...register("formalName")}
                      />
                      <Info className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The clinician's formal name with credentials as it should appear on forms, notes, and letterhead.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Example: Licensed Clinical Psychologist"
                {...register("title")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number*</Label>
              <Input
                id="licenseNumber"
                {...register("licenseNumber")}
                className={errors.licenseNumber ? "border-red-500" : ""}
              />
              {errors.licenseNumber && (
                <p className="text-red-500 text-sm">{errors.licenseNumber.message}</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : staff ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
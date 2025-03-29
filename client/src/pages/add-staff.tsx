import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USER_ROLES, ROLE_CATEGORIES, ROLE_DETAILS, LICENSE_TYPES } from "@/lib/constants";
import { Search, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function AddStaffPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    roles: [] as string[],
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

  const [activeTab, setActiveTab] = useState("roles");
  const [showClinicianFields, setShowClinicianFields] = useState(false);
  const [npiSearchQuery, setNpiSearchQuery] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Update showClinicianFields based on selected roles
  useEffect(() => {
    setShowClinicianFields(
      formData.roles.includes(USER_ROLES.CLINICIAN) || 
      formData.roles.includes(USER_ROLES.INTERN) ||
      formData.roles.includes(USER_ROLES.SUPERVISOR) ||
      formData.roles.includes(USER_ROLES.CLINICAL_ADMIN)
    );
  }, [formData.roles]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    
    if (!formData.password) errors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    if (formData.roles.length === 0) errors.roles = "At least one role is required";
    
    if (showClinicianFields) {
      if (!formData.licenseType) errors.licenseType = "License type is required for clinical roles";
      if (!formData.licenseNumber) errors.licenseNumber = "License number is required for clinical roles";
      
      if (formData.roles.includes(USER_ROLES.INTERN) && !formData.supervision) {
        errors.supervision = "Supervision is required for interns";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here we would typically save the data to an API
      // For now, we'll just show a success message
      toast({
        title: "Staff Added",
        description: `${formData.firstName} ${formData.lastName} has been added to your practice.`,
      });
      
      navigate("/practice");
    } else {
      toast({
        title: "Form Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      });
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      const roleExists = prev.roles.includes(role);
      let newRoles;
      
      if (roleExists) {
        newRoles = prev.roles.filter(r => r !== role);
      } else {
        newRoles = [...prev.roles, role];
      }
      
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  const handleNpiSearch = () => {
    // In a real implementation, this would call an API to search the NPI registry
    console.log("Searching NPI registry for:", npiSearchQuery);
    
    // Mock example of filling data from NPI lookup
    if (npiSearchQuery.trim()) {
      setFormData(prev => ({
        ...prev,
        npiNumber: "1234567890", // This would be returned from the API
        formalName: `${prev.firstName} ${prev.lastName}, PhD`, // Example of format
        title: "Licensed Clinical Psychologist" // Example of retrieved title
      }));
    }
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Add New Staff Member" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate("/practice")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Staff Management
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Add New Staff Member</CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="roles">Roles & Access</TabsTrigger>
                  <TabsTrigger value="user">User Information</TabsTrigger>
                  <TabsTrigger value="credentials">
                    Credentials
                    {showClinicianFields && <span className="ml-1 text-primary">*</span>}
                  </TabsTrigger>
                </TabsList>
                
                {/* Roles & Access Tab */}
                <TabsContent value="roles" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Each user can have multiple roles. A user's roles determine what they can access within MentalSpace.
                    </p>
                    
                    {Object.entries(ROLE_CATEGORIES).map(([categoryKey, categoryName]) => (
                      <Card key={categoryKey} className="overflow-hidden">
                        <div className="bg-muted p-3">
                          <h3 className="font-medium">{categoryName}</h3>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          {Object.entries(USER_ROLES)
                            .filter(([_, roleName]) => ROLE_DETAILS[roleName]?.category === categoryName)
                            .map(([roleKey, roleName]) => (
                              <div key={roleKey} className="flex items-start space-x-3">
                                <Checkbox 
                                  id={`role-${roleKey}`}
                                  checked={formData.roles.includes(roleName)}
                                  onCheckedChange={() => handleRoleToggle(roleName)}
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
                        </CardContent>
                      </Card>
                    ))}
                    
                    {validationErrors.roles && (
                      <div className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.roles}
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button onClick={() => setActiveTab("user")}>
                        Continue to User Information
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* User Information Tab */}
                <TabsContent value="user" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className={validationErrors.firstName ? "border-red-500" : ""}
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-500 text-sm">{validationErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className={validationErrors.lastName ? "border-red-500" : ""}
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-500 text-sm">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={validationErrors.email ? "border-red-500" : ""}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm">{validationErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="Leave blank to use email"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password*</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={validationErrors.password ? "border-red-500" : ""}
                      />
                      {validationErrors.password && (
                        <p className="text-red-500 text-sm">{validationErrors.password}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password*</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={validationErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center pl-4 mt-8">
                      <Checkbox 
                        id="canReceiveSMS"
                        checked={formData.canReceiveSMS}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, canReceiveSMS: checked === true})
                        }
                      />
                      <Label htmlFor="canReceiveSMS" className="ml-2 cursor-pointer">
                        Can receive text messages
                      </Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workPhone">Work Phone</Label>
                      <Input
                        id="workPhone"
                        value={formData.workPhone}
                        onChange={(e) => setFormData({...formData, workPhone: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="homePhone">Home Phone</Label>
                      <Input
                        id="homePhone"
                        value={formData.homePhone}
                        onChange={(e) => setFormData({...formData, homePhone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address 1</Label>
                    <Input
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => setFormData({...formData, address1: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address2">Address 2</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => setFormData({...formData, address2: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                        placeholder="zip code"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={formData.state} 
                        onValueChange={(value) => setFormData({...formData, state: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="---" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          {/* Add other states as needed */}
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 pt-4">
                    <Button variant="outline" onClick={() => setActiveTab("roles")}>
                      Back to Roles
                    </Button>
                    <Button onClick={() => setActiveTab("credentials")}>
                      Continue to Credentials
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Credentials Tab */}
                <TabsContent value="credentials" className="space-y-4 mt-4">
                  {showClinicianFields ? (
                    <>
                      <div className="p-4 bg-primary/10 rounded-md mb-4">
                        <h3 className="text-md font-medium mb-2">Look Up Clinician in NPI Registry</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Search the public NPI registry to speed up user account creation. We will import details, including the clinician's name and licenses. You can review and update this information below. This step is optional if you do not have the clinician's NPI number handy.
                        </p>
                        
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Individual NPI - Type 1"
                              value={npiSearchQuery}
                              onChange={(e) => setNpiSearchQuery(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleNpiSearch}>
                            <Search className="h-4 w-4 mr-2" />
                            Search
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clinician-type">Type of Clinician*</Label>
                          <Select 
                            value={formData.licenseType} 
                            onValueChange={(value) => setFormData({...formData, licenseType: value})}
                          >
                            <SelectTrigger className={validationErrors.licenseType ? "border-red-500" : ""}>
                              <SelectValue placeholder="-- Select Clinician Type --" />
                            </SelectTrigger>
                            <SelectContent>
                              {LICENSE_TYPES.map((license) => (
                                <SelectItem key={license} value={license}>
                                  {license}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors.licenseType && (
                            <p className="text-red-500 text-sm">{validationErrors.licenseType}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="formal-name">Formal Name</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Input
                                    id="formal-name"
                                    placeholder='Example: "John Smith, Ph.D."'
                                    value={formData.formalName}
                                    onChange={(e) => setFormData({...formData, formalName: e.target.value})}
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
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="npi">NPI</Label>
                          <Input
                            id="npi"
                            placeholder="Individual NPI - Type 1"
                            value={formData.npiNumber}
                            onChange={(e) => setFormData({...formData, npiNumber: e.target.value})}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="license-number">License Number*</Label>
                            <Input
                              id="license-number"
                              value={formData.licenseNumber}
                              onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                              className={validationErrors.licenseNumber ? "border-red-500" : ""}
                            />
                            {validationErrors.licenseNumber && (
                              <p className="text-red-500 text-sm">{validationErrors.licenseNumber}</p>
                            )}
                          </div>
                        </div>
                        
                        {formData.roles.includes(USER_ROLES.INTERN) && (
                          <div className="space-y-2">
                            <Label htmlFor="supervision">Supervision*</Label>
                            <Select 
                              value={formData.supervision} 
                              onValueChange={(value) => setFormData({...formData, supervision: value})}
                            >
                              <SelectTrigger className={validationErrors.supervision ? "border-red-500" : ""}>
                                <SelectValue placeholder="Not Supervised" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Supervised">Not Supervised</SelectItem>
                                {/* This would typically be populated with a list of eligible supervisors */}
                                <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                                <SelectItem value="Dr. Michael Williams">Dr. Michael Williams</SelectItem>
                              </SelectContent>
                            </Select>
                            {validationErrors.supervision && (
                              <p className="text-red-500 text-sm">{validationErrors.supervision}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="text-amber-800 font-medium mb-2 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Credential information not required
                      </h3>
                      <p className="text-amber-700 text-sm">
                        The selected role(s) do not require professional credential information.
                        If this user will be providing clinical services, please add the
                        Clinician role in the "Roles & Access" tab.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between gap-2 pt-6">
                    <Button variant="outline" onClick={() => setActiveTab("user")}>
                      Back to User Information
                    </Button>
                    <Button onClick={handleSubmit}>
                      Add Staff Member
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
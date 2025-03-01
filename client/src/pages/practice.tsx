import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Settings, 
  Shield, 
  FileText,
  Users,
  Building,
  Edit,
  Trash,
  Search,
  Plus,
  Copy,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Archive,
  MoreHorizontal,
  ArrowDownToLine
} from "lucide-react";
import { format, addDays, addMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LICENSE_TYPES, USER_ROLES } from "@/lib/constants";
import { DEFAULT_AVATAR } from "@/lib/constants";

// Mock staff data
const mockStaff = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Therapist",
    email: "sarah.johnson@mentalspace.com",
    phone: "(555) 123-4567",
    licenseType: "Licensed Professional Counselor (LPC)",
    licenseNumber: "LPC12345",
    licenseExpiration: addMonths(new Date(), 8),
    status: "Active",
    profileImage: DEFAULT_AVATAR
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Williams",
    role: "Therapist",
    email: "michael.williams@mentalspace.com",
    phone: "(555) 234-5678",
    licenseType: "Licensed Clinical Social Worker (LCSW)",
    licenseNumber: "LCSW67890",
    licenseExpiration: addMonths(new Date(), 3),
    status: "Active",
    profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 3,
    firstName: "Emily",
    lastName: "Davis",
    role: "Administrator",
    email: "emily.davis@mentalspace.com",
    phone: "(555) 345-6789",
    licenseType: null,
    licenseNumber: null,
    licenseExpiration: null,
    status: "Active",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 4,
    firstName: "Robert",
    lastName: "Garcia",
    role: "Billing Staff",
    email: "robert.garcia@mentalspace.com",
    phone: "(555) 456-7890",
    licenseType: null,
    licenseNumber: null,
    licenseExpiration: null,
    status: "Active",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 5,
    firstName: "Jessica",
    lastName: "Brown",
    role: "Therapist",
    email: "jessica.brown@mentalspace.com",
    phone: "(555) 567-8901",
    licenseType: "Licensed Marriage and Family Therapist (LMFT)",
    licenseNumber: "LMFT54321",
    licenseExpiration: addDays(new Date(), 45),
    status: "Active",
    profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 6,
    firstName: "Daniel",
    lastName: "Taylor",
    role: "Front Desk",
    email: "daniel.taylor@mentalspace.com",
    phone: "(555) 678-9012",
    licenseType: null,
    licenseNumber: null,
    licenseExpiration: null,
    status: "Active",
    profileImage: null
  },
  {
    id: 7,
    firstName: "Jennifer",
    lastName: "Martinez",
    role: "Therapist",
    email: "jennifer.martinez@mentalspace.com",
    phone: "(555) 789-0123",
    licenseType: "Licensed Psychologist (PhD)",
    licenseNumber: "PSY98765",
    licenseExpiration: addMonths(new Date(), 10),
    status: "Inactive",
    profileImage: null
  }
];

// Mock templates
const documentTemplates = [
  {
    id: 1,
    name: "Initial Assessment",
    type: "Assessment",
    lastUpdated: subDays(new Date(), 30),
    status: "Active"
  },
  {
    id: 2,
    name: "Progress Note - Standard",
    type: "Progress Note",
    lastUpdated: subDays(new Date(), 15),
    status: "Active"
  },
  {
    id: 3,
    name: "Treatment Plan",
    type: "Treatment Plan",
    lastUpdated: subDays(new Date(), 45),
    status: "Active"
  },
  {
    id: 4,
    name: "Discharge Summary",
    type: "Discharge",
    lastUpdated: subDays(new Date(), 60),
    status: "Active"
  },
  {
    id: 5,
    name: "Client Intake Form",
    type: "Intake",
    lastUpdated: subDays(new Date(), 10),
    status: "Active"
  }
];

// Mock audit trail entries
const auditTrail = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: "Viewed client record",
    details: "Accessed Emma Wilson's demographic information",
    timestamp: subHours(new Date(), 1),
    ip: "192.168.1.105"
  },
  {
    id: 2,
    user: "Michael Williams",
    action: "Modified session note",
    details: "Updated progress note for David Thompson",
    timestamp: subHours(new Date(), 3),
    ip: "192.168.1.108"
  },
  {
    id: 3,
    user: "Emily Davis",
    action: "User management",
    details: "Created new user account for Daniel Taylor",
    timestamp: subDays(new Date(), 1),
    ip: "192.168.1.110"
  },
  {
    id: 4,
    user: "Robert Garcia",
    action: "Billing activity",
    details: "Generated invoice #INV-2023-082 for Jamie Rodriguez",
    timestamp: subDays(new Date(), 1),
    ip: "192.168.1.115"
  },
  {
    id: 5,
    user: "Sarah Johnson",
    action: "Authorization",
    details: "Failed login attempt (invalid password)",
    timestamp: subDays(new Date(), 2),
    ip: "192.168.1.105"
  }
];

// Helper functions
function subDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function subHours(date: Date, hours: number) {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  return result;
}

export default function Practice() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staffSearch, setStaffSearch] = useState("");
  const [staff, setStaff] = useState(mockStaff);
  const [templates, setTemplates] = useState(documentTemplates);
  const [auditLogs, setAuditLogs] = useState(auditTrail);

  // Filter staff based on search
  const filteredStaff = staff.filter(member => 
    member.firstName.toLowerCase().includes(staffSearch.toLowerCase()) ||
    member.lastName.toLowerCase().includes(staffSearch.toLowerCase()) ||
    member.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
    member.role.toLowerCase().includes(staffSearch.toLowerCase())
  );

  // Check if license is expiring soon (within 60 days)
  const isLicenseExpiringSoon = (expirationDate: Date | null) => {
    if (!expirationDate) return false;
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  };

  // Handle add staff member
  const handleAddStaff = () => {
    toast({
      title: "Add Staff Member",
      description: "Opening new staff member form...",
    });
  };

  // Handle edit staff member
  const handleEditStaff = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    toast({
      title: "Edit Staff Member",
      description: `Opening edit form for ${staffMember?.firstName} ${staffMember?.lastName}...`,
    });
  };

  // Handle deactivate staff member
  const handleDeactivateStaff = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    
    setStaff(staff.map(s => 
      s.id === staffId ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
    ));
    
    toast({
      title: staffMember?.status === "Active" ? "Staff Deactivated" : "Staff Activated",
      description: `${staffMember?.firstName} ${staffMember?.lastName} has been ${staffMember?.status === "Active" ? "deactivated" : "activated"}.`,
    });
  };

  // Handle edit template
  const handleEditTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    toast({
      title: "Edit Template",
      description: `Opening edit form for ${template?.name}...`,
    });
  };

  // Handle duplicate template
  const handleDuplicateTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const newTemplate = {
      ...template,
      id: Math.max(...templates.map(t => t.id)) + 1,
      name: `${template.name} (Copy)`,
      lastUpdated: new Date()
    };
    
    setTemplates([...templates, newTemplate]);
    
    toast({
      title: "Template Duplicated",
      description: `"${template.name}" has been duplicated.`,
    });
  };

  // Handle delete template
  const handleDeleteTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    setTemplates(templates.filter(t => t.id !== templateId));
    
    toast({
      title: "Template Deleted",
      description: `"${template?.name}" has been deleted.`,
    });
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Practice Management" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <Tabs defaultValue="staff" className="mb-6">
            <TabsList>
              <TabsTrigger value="staff" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Document Templates
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security & Compliance
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Practice Settings
              </TabsTrigger>
            </TabsList>

            {/* Staff Management Tab */}
            <TabsContent value="staff" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Staff Management</CardTitle>
                    <Button onClick={handleAddStaff}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Staff Member
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input 
                        placeholder="Search staff..." 
                        className="pl-10"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Contact Info</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStaff.length > 0 ? (
                          filteredStaff.map((staffMember) => (
                            <TableRow key={staffMember.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage src={staffMember.profileImage || undefined} />
                                    <AvatarFallback>{`${staffMember.firstName[0]}${staffMember.lastName[0]}`}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{staffMember.firstName} {staffMember.lastName}</div>
                                    <div className="text-sm text-neutral-500">Staff ID: {staffMember.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{staffMember.role}</TableCell>
                              <TableCell>
                                <div className="text-sm">{staffMember.email}</div>
                                <div className="text-sm text-neutral-500">{staffMember.phone}</div>
                              </TableCell>
                              <TableCell>
                                {staffMember.licenseType ? (
                                  <div>
                                    <div className="text-sm">{staffMember.licenseType}</div>
                                    <div className="text-sm text-neutral-500">
                                      {staffMember.licenseNumber} • Exp: {format(staffMember.licenseExpiration!, "MMM d, yyyy")}
                                      {isLicenseExpiringSoon(staffMember.licenseExpiration) && (
                                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                          Expiring Soon
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-neutral-500">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  staffMember.status === "Active" 
                                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-100"
                                }>
                                  {staffMember.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditStaff(staffMember.id)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeactivateStaff(staffMember.id)}>
                                      {staffMember.status === "Active" ? (
                                        <>
                                          <Archive className="h-4 w-4 mr-2" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-neutral-500">
                              No staff members found matching your search.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Document Templates Tab */}
            <TabsContent value="templates" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Document Templates</CardTitle>
                    <Button onClick={() => toast({ title: "Create Template", description: "Opening new template form..." })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.type}</TableCell>
                            <TableCell>{format(template.lastUpdated, "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                {template.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditTemplate(template.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDuplicateTemplate(template.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Duplicate</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security & Compliance Tab */}
            <TabsContent value="security" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                {/* Audit Trail */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Audit Trail</CardTitle>
                      <Button variant="outline" onClick={() => toast({ title: "Export Audit Log", description: "Exporting audit logs as CSV..." })}>
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Export Logs
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>IP Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{log.user}</TableCell>
                              <TableCell>{log.action}</TableCell>
                              <TableCell>{log.details}</TableCell>
                              <TableCell>{format(log.timestamp, "MMM d, yyyy h:mm a")}</TableCell>
                              <TableCell>{log.ip}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t flex justify-between">
                    <p className="text-sm text-neutral-500">Showing most recent 5 entries</p>
                    <Button variant="link" className="p-0 h-auto text-primary-600 hover:text-primary-700">
                      View Full Audit Trail
                    </Button>
                  </CardFooter>
                </Card>

                {/* Security Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Policy */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-primary-500" />
                        Password Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Minimum Length</span>
                          <Badge>8 characters</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Require Numbers</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Require Special Characters</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Require Mixed Case</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Password Expiration</span>
                          <Badge>90 days</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Failed Login Lockout</span>
                          <Badge>5 attempts</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t">
                      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Security Settings", description: "Opening password policy settings..." })}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Password Policy
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Two-Factor Authentication */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-primary-500" />
                        Two-Factor Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Required for Admin Users</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Yes</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Required for All Users</span>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Optional</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Methods Available</span>
                          <Badge>Email, Authenticator App</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Staff with 2FA Enabled</span>
                          <Badge>4 of 7 users</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t">
                      <Button variant="outline" className="w-full" onClick={() => toast({ title: "Security Settings", description: "Opening two-factor authentication settings..." })}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure 2FA Settings
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Compliance Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-primary-500" />
                      HIPAA Compliance Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-md bg-green-50">
                        <div className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-green-700 mr-2" />
                          <span>Data Encryption at Rest and in Transit</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md bg-green-50">
                        <div className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-green-700 mr-2" />
                          <span>Role-Based Access Controls</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md bg-green-50">
                        <div className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-green-700 mr-2" />
                          <span>Audit Logging</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md bg-yellow-50">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-700 mr-2" />
                          <span>Staff HIPAA Training</span>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          2 Staff Due for Renewal
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md bg-green-50">
                        <div className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-green-700 mr-2" />
                          <span>Business Associate Agreements</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md bg-green-50">
                        <div className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-green-700 mr-2" />
                          <span>Risk Assessment</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Completed (3 months ago)</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <Button onClick={() => toast({ title: "Compliance", description: "Opening full compliance report..." })}>
                      View Full Compliance Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Practice Settings Tab */}
            <TabsContent value="practice" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Practice Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Practice Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Practice Name</h3>
                        <p className="mt-1">MentalSpace Behavioral Health</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Practice Address</h3>
                        <p className="mt-1">123 Therapy Lane, Suite 200<br />Wellness City, CA 90210</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Phone Number</h3>
                        <p className="mt-1">(555) 123-4567</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                        <p className="mt-1">admin@mentalspace.com</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Tax ID / EIN</h3>
                        <p className="mt-1">12-3456789</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">NPI Number</h3>
                        <p className="mt-1">1234567890</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <Button variant="outline" className="w-full" onClick={() => toast({ title: "Practice Settings", description: "Opening practice information settings..." })}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Practice Information
                    </Button>
                  </CardFooter>
                </Card>

                {/* Calendar & Scheduling Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar & Scheduling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Business Hours</h3>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm">Monday - Friday</p>
                            <p className="text-sm text-neutral-500">8:00 AM - 6:00 PM</p>
                          </div>
                          <div>
                            <p className="text-sm">Saturday</p>
                            <p className="text-sm text-neutral-500">9:00 AM - 2:00 PM</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Default Appointment Length</h3>
                        <p className="mt-1">50 minutes</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Buffer Between Appointments</h3>
                        <p className="mt-1">10 minutes</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Cancellation Policy</h3>
                        <p className="mt-1">24 hours notice required</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">No-Show Fee</h3>
                        <p className="mt-1">$75.00</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <Button variant="outline" className="w-full" onClick={() => toast({ title: "Practice Settings", description: "Opening calendar settings..." })}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Calendar Settings
                    </Button>
                  </CardFooter>
                </Card>

                {/* Billing & Insurance Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Insurance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">In-Network Insurance Providers</h3>
                        <div className="mt-1 space-y-1">
                          {["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Medicare", "Medicaid"].map((provider, index) => (
                            <div key={index} className="flex items-center">
                              <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">{provider}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Standard Session Rate (Self-Pay)</h3>
                        <p className="mt-1">$150.00</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Intake Session Rate (Self-Pay)</h3>
                        <p className="mt-1">$175.00</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Sliding Scale Available</h3>
                        <p className="mt-1">Yes ($75.00 - $150.00)</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <Button variant="outline" className="w-full" onClick={() => toast({ title: "Practice Settings", description: "Opening billing settings..." })}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Billing Settings
                    </Button>
                  </CardFooter>
                </Card>

                {/* Client Portal Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Portal Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Client Portal Status</h3>
                        <p className="mt-1 flex items-center">
                          <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Self-Scheduling</h3>
                        <p className="mt-1 flex items-center">
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                          <span className="text-sm text-neutral-500 ml-2">(Requires approval)</span>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Document Upload</h3>
                        <p className="mt-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Online Payments</h3>
                        <p className="mt-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Appointment Reminders</h3>
                        <p className="mt-1">Email (24 hours before), SMS (2 hours before)</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <Button variant="outline" className="w-full" onClick={() => toast({ title: "Practice Settings", description: "Opening client portal settings..." })}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Portal Settings
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

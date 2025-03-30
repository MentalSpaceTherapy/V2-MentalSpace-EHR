import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  UserPlus, 
  Edit, 
  Archive, 
  RefreshCw,
  MoreHorizontal,
  FileDown,
  Filter,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isAfter, subDays } from "date-fns";
import { USER_ROLES, ROLE_DETAILS } from "@/lib/constants";
import { StaffForm } from "./StaffForm";
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

interface StaffListProps {
  initialStaff: StaffMember[];
}

export function StaffList({ initialStaff }: StaffListProps) {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [staffSearch, setStaffSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch staff data from API
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/staffManagement');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch staff: ${response.statusText}`);
        }
        
        const staffData = await response.json();
        setStaff(staffData);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Keep the initial staff data if provided
        if (initialStaff.length === 0) {
          toast({
            title: "Error loading staff",
            description: err instanceof Error ? err.message : 'Could not load staff data',
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaff();
  }, [toast, initialStaff]);
  
  // Filter staff based on search and role filter
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.lastName.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (member.role && member.role.toLowerCase().includes(staffSearch.toLowerCase()));
    
    const matchesRoleFilter = roleFilter ? (
      member.roles?.includes(roleFilter) || member.role === roleFilter
    ) : true;
    
    return matchesSearch && matchesRoleFilter;
  });

  // Check if license is expiring soon (within 60 days)
  const isLicenseExpiringSoon = (expirationDate: Date | null) => {
    if (!expirationDate) return false;
    const today = new Date();
    const sixtyDaysFromNow = addDays(today, 60);
    return isAfter(expirationDate, today) && !isAfter(expirationDate, sixtyDaysFromNow);
  };
  
  // Helper function to add days to a date
  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const handleAddStaff = () => {
    window.location.href = '/staff-new';
  };

  const handleEditStaff = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
      setEditingStaff(staffMember);
      setIsFormOpen(true);
    }
  };

  const handleDeactivateStaff = async (staffId: number) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      
      if (!staffMember) return;
      
      const newStatus = staffMember.status === "Active" ? "Inactive" : "Active";
      
      const response = await fetch(`/api/staffManagement/${staffId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update staff status: ${response.statusText}`);
      }
      
      const updatedStaffMember = await response.json();
      
      // Update local state
      setStaff(staff.map(s => s.id === staffId ? updatedStaffMember : s));
      
      toast({
        title: staffMember.status === "Active" ? "Staff Deactivated" : "Staff Activated",
        description: `${staffMember.firstName} ${staffMember.lastName} has been ${staffMember.status === "Active" ? "deactivated" : "activated"}.`,
      });
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast({
        title: "Error",
        description: `Failed to update staff status: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveStaff = async (staffData: any) => {
    try {
      if (staffData.id) {
        // Update existing staff member
        const response = await fetch(`/api/staffManagement/${staffData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            email: staffData.email,
            phone: staffData.phone,
            role: staffData.roles[0] || "",  // Primary role
            roles: staffData.roles,
            licenseType: staffData.licenseType,
            licenseNumber: staffData.licenseNumber,
            licenseExpiration: staffData.licenseExpiration,
            formalName: staffData.formalName,
            title: staffData.title,
            npiNumber: staffData.npiNumber,
            canReceiveSMS: staffData.canReceiveSMS,
            workPhone: staffData.workPhone,
            homePhone: staffData.homePhone,
            address1: staffData.address1,
            address2: staffData.address2,
            zipCode: staffData.zip,
            city: staffData.city,
            state: staffData.state,
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update staff member: ${response.statusText}`);
        }
        
        const updatedStaffMember = await response.json();
        
        // Update local state
        setStaff(staff.map(s => s.id === staffData.id ? updatedStaffMember : s));
        
        toast({
          title: "Staff Updated",
          description: `${staffData.firstName} ${staffData.lastName}'s information has been updated.`,
        });
      } else {
        // Add new staff member
        const response = await fetch('/api/staffManagement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            email: staffData.email,
            phone: staffData.phone,
            role: staffData.roles[0] || "",  // Primary role
            roles: staffData.roles,
            licenseType: staffData.licenseType,
            licenseNumber: staffData.licenseNumber,
            licenseExpiration: staffData.licenseExpiration,
            status: "Active",
            formalName: staffData.formalName,
            title: staffData.title,
            npiNumber: staffData.npiNumber,
            canReceiveSMS: staffData.canReceiveSMS,
            workPhone: staffData.workPhone,
            homePhone: staffData.homePhone,
            address1: staffData.address1,
            address2: staffData.address2,
            zipCode: staffData.zip,
            city: staffData.city,
            state: staffData.state,
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create staff member: ${response.statusText}`);
        }
        
        const newStaffMember = await response.json();
        
        // Update local state
        setStaff([...staff, newStaffMember]);
        
        toast({
          title: "Staff Added",
          description: `${staffData.firstName} ${staffData.lastName} has been added to your practice.`,
        });
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving staff member:', error);
      toast({
        title: "Error",
        description: `Failed to save staff member: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };
  
  const getRoleBadges = (staffMember: StaffMember) => {
    const roles = staffMember.roles || [staffMember.role];
    
    // Only show 2 roles with a +X indicator for additional roles
    if (roles.length <= 2) {
      return roles.map(role => (
        <Badge key={role} variant="outline" className="bg-primary-50 text-primary-700 mr-1">
          {role}
        </Badge>
      ));
    } else {
      return (
        <>
          <Badge variant="outline" className="bg-primary-50 text-primary-700 mr-1">
            {roles[0]}
          </Badge>
          <Badge variant="outline" className="bg-primary-50 text-primary-700 mr-1">
            {roles[1]}
          </Badge>
          <Badge variant="outline" className="bg-neutral-100 text-neutral-700">
            +{roles.length - 2}
          </Badge>
        </>
      );
    }
  };
  
  // Get all available role categories for filtering
  const availableRoles = Object.values(USER_ROLES);

  return (
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
          <div className="flex gap-2 w-full max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search staff..." 
                className="pl-10"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {roleFilter ? `Filter: ${roleFilter}` : "Filter by Role"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRoleFilter(null)}>
                  All Roles
                </DropdownMenuItem>
                {availableRoles.map(role => (
                  <DropdownMenuItem 
                    key={role}
                    onClick={() => setRoleFilter(role)}
                  >
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
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
              {isLoading ? (
                // Loading state - show 3 skeleton rows
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 mr-3 rounded-full bg-neutral-100 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-24 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-36 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-28 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse"></div></TableCell>
                    <TableCell className="text-right"><div className="h-6 w-6 bg-neutral-100 rounded-full ml-auto animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                // Error state
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                      <h4 className="text-base font-medium text-red-600">Error loading staff members</h4>
                      <p className="text-sm mt-1">{error}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((staffMember) => (
                  <TableRow 
                    key={staffMember.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditStaff(staffMember.id)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={staffMember.profileImage || undefined} />
                          <AvatarFallback>{`${staffMember.firstName[0]}${staffMember.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staffMember.firstName} {staffMember.lastName}</div>
                          <div className="text-sm text-muted-foreground">Staff ID: {staffMember.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadges(staffMember)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{staffMember.email}</div>
                      <div className="text-sm text-muted-foreground">{staffMember.phone}</div>
                    </TableCell>
                    <TableCell>
                      {staffMember.licenseType ? (
                        <div>
                          <div className="text-sm">{staffMember.licenseType}</div>
                          {staffMember.licenseNumber && staffMember.licenseExpiration && (
                            <div className="text-sm text-muted-foreground">
                              {staffMember.licenseNumber} • Exp: {format(staffMember.licenseExpiration, "MMM d, yyyy")}
                              {isLicenseExpiringSoon(staffMember.licenseExpiration) && (
                                <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
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
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No staff members found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Display the form when adding or editing */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <StaffForm
                onCancel={() => setIsFormOpen(false)}
                onSave={handleSaveStaff}
                editingStaff={editingStaff}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
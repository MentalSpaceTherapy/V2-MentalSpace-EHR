import { useState } from "react";
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
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isAfter, subDays } from "date-fns";
import { USER_ROLES, ROLE_DETAILS } from "@/lib/constants";
import { StaffModal } from "./StaffModal";
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
    setEditingStaff(undefined);
    setIsFormOpen(true);
    console.log("Opening staff form", isFormOpen);
  };

  const handleEditStaff = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
      setEditingStaff(staffMember);
      setIsFormOpen(true);
    }
  };

  const handleDeactivateStaff = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    
    if (staffMember) {
      setStaff(staff.map(s => 
        s.id === staffId ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
      ));
      
      toast({
        title: staffMember.status === "Active" ? "Staff Deactivated" : "Staff Activated",
        description: `${staffMember.firstName} ${staffMember.lastName} has been ${staffMember.status === "Active" ? "deactivated" : "activated"}.`,
      });
    }
  };

  const handleSaveStaff = (staffData: any) => {
    if (staffData.id) {
      // Update existing staff member
      setStaff(staff.map(s => 
        s.id === staffData.id ? {
          ...s,
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          email: staffData.email,
          phone: staffData.phone,
          role: staffData.roles[0] || "",  // For backward compatibility
          roles: staffData.roles,
          licenseType: staffData.licenseType,
          licenseNumber: staffData.licenseNumber,
          formalName: staffData.formalName,
          title: staffData.title,
          npiNumber: staffData.npiNumber,
          supervision: staffData.supervision,
          languages: staffData.languages,
          canReceiveSMS: staffData.canReceiveSMS,
          workPhone: staffData.workPhone,
          homePhone: staffData.homePhone,
          address1: staffData.address1,
          address2: staffData.address2,
          zip: staffData.zip,
          city: staffData.city,
          state: staffData.state,
        } : s
      ));
      
      toast({
        title: "Staff Updated",
        description: `${staffData.firstName} ${staffData.lastName}'s information has been updated.`,
      });
    } else {
      // Add new staff member
      const newStaff: StaffMember = {
        id: Math.max(0, ...staff.map(s => s.id)) + 1,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.roles[0] || "",  // For backward compatibility
        roles: staffData.roles,
        licenseType: staffData.licenseType,
        licenseNumber: staffData.licenseNumber,
        licenseExpiration: staffData.licenseExpirationDate,
        status: "Active",
        profileImage: null,
        formalName: staffData.formalName,
        title: staffData.title,
        npiNumber: staffData.npiNumber,
        supervision: staffData.supervision,
        languages: staffData.languages,
        canReceiveSMS: staffData.canReceiveSMS,
        workPhone: staffData.workPhone,
        homePhone: staffData.homePhone,
        address1: staffData.address1,
        address2: staffData.address2,
        zip: staffData.zip,
        city: staffData.city,
        state: staffData.state,
      };
      
      setStaff([...staff, newStaff]);
      
      toast({
        title: "Staff Added",
        description: `${staffData.firstName} ${staffData.lastName} has been added to your practice.`,
      });
    }
    
    setIsFormOpen(false);
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
      
      {/* Staff Modal */}
      <StaffModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveStaff}
        editingStaff={editingStaff}
      />
    </Card>
  );
}
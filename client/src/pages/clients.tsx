import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Filter, MoreHorizontal, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Mock client data
const mockClients = [
  {
    id: 1,
    firstName: "Emma",
    lastName: "Wilson",
    dateOfBirth: new Date("1990-05-15"),
    phone: "(555) 123-4567",
    email: "emma.wilson@example.com",
    lastSession: new Date("2023-07-24"),
    nextSession: new Date("2023-07-31"),
    status: "Active",
    balance: 125.00,
    therapistId: 1,
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    dateOfBirth: new Date("1985-11-08"),
    phone: "(555) 234-5678",
    email: "michael.chen@example.com",
    lastSession: new Date("2023-07-22"),
    nextSession: new Date("2023-07-29"),
    status: "Active",
    balance: 0,
    therapistId: 1,
  },
  {
    id: 3,
    firstName: "Sophie",
    lastName: "Garcia",
    dateOfBirth: new Date("1992-03-27"),
    phone: "(555) 345-6789",
    email: "sophie.garcia@example.com",
    lastSession: new Date("2023-07-20"),
    nextSession: new Date("2023-07-27"),
    status: "Active",
    balance: 75.50,
    therapistId: 1,
  },
  {
    id: 4,
    firstName: "David",
    lastName: "Thompson",
    dateOfBirth: new Date("1978-09-12"),
    phone: "(555) 456-7890",
    email: "david.thompson@example.com",
    lastSession: new Date("2023-07-10"),
    nextSession: null,
    status: "Inactive",
    balance: 0,
    therapistId: 1,
  },
  {
    id: 5,
    firstName: "Jamie",
    lastName: "Rodriguez",
    dateOfBirth: new Date("1995-07-30"),
    phone: "(555) 567-8901",
    email: "jamie.rodriguez@example.com",
    lastSession: null,
    nextSession: new Date("2023-07-29"),
    status: "New",
    balance: 0,
    therapistId: 1,
  }
];

export default function Clients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clients, setClients] = useState(mockClients);

  // Filter clients based on search query and status filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === "all" || 
      client.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    toast({
      title: "New Client",
      description: "Opening new client form...",
    });
  };

  const handleViewClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    toast({
      title: "View Client",
      description: `Opening client chart for ${client?.firstName} ${client?.lastName}...`,
    });
  };

  const handleEditClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    toast({
      title: "Edit Client",
      description: `Opening edit form for ${client?.firstName} ${client?.lastName}...`,
    });
  };

  const handleScheduleSession = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    toast({
      title: "Schedule Session",
      description: `Opening scheduler for ${client?.firstName} ${client?.lastName}...`,
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
        <TopBar title="Client Management" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Clients</CardTitle>
                <Button onClick={handleAddClient}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Search clients..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Last Session</TableHead>
                      <TableHead>Next Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{client.firstName} {client.lastName}</div>
                              <div className="text-sm text-neutral-500">
                                {format(client.dateOfBirth, "MMM d, yyyy")} ({new Date().getFullYear() - client.dateOfBirth.getFullYear()} years)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{client.phone}</div>
                            <div className="text-sm text-neutral-500">{client.email}</div>
                          </TableCell>
                          <TableCell>
                            {client.lastSession ? format(client.lastSession, "MMM d, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            {client.nextSession ? format(client.nextSession, "MMM d, yyyy") : "Not scheduled"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              client.status === "Active" 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : client.status === "Inactive" 
                                  ? "bg-neutral-100 text-neutral-800 hover:bg-neutral-100" 
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            }>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {client.balance > 0 
                              ? <span className="text-error-500">${client.balance.toFixed(2)}</span> 
                              : <span>${client.balance.toFixed(2)}</span>
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                                  Edit Client
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleScheduleSession(client.id)}>
                                  Schedule Session
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-neutral-500">
                          No clients found matching the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronDown,
  UserPlus,
  CircleX
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";

// Extended mock client data
const mockClients = [
  {
    id: 1,
    firstName: "Emma",
    lastName: "Wilson",
    dateOfBirth: new Date("1990-05-15"),
    phone: "(555) 123-4567",
    email: "emma.wilson@example.com",
    address: "123 Main St, Apt 4B\nNew York, NY 10001",
    lastSession: new Date("2023-07-24"),
    nextSession: new Date("2023-07-31"),
    status: "Active",
    balance: 125.00,
    therapistId: 1,
    therapistName: "Dr. Emma Johnson",
    createdAt: new Date("2022-03-15"),
    sessionsAttended: 24,
    emergencyContactName: "James Wilson",
    emergencyContactPhone: "(555) 987-6543",
    insuranceProvider: "Blue Cross Blue Shield",
    insurancePolicyNumber: "XYZ123456789",
    insuranceGroupNumber: "G-987654",
    preferredPronouns: "she/her",
    notes: "Client has been making good progress with anxiety management techniques. Has reported improved sleep patterns over the past month. Continues to work on setting boundaries at work.\n\nGoals for next session include developing strategies for family gatherings and addressing conflict avoidance patterns.",
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    dateOfBirth: new Date("1985-11-08"),
    phone: "(555) 234-5678",
    email: "michael.chen@example.com",
    address: "456 Park Avenue\nBoston, MA 02115",
    lastSession: new Date("2023-07-22"),
    nextSession: new Date("2023-07-29"),
    status: "Active",
    balance: 0,
    therapistId: 1,
    therapistName: "Dr. Emma Johnson",
    createdAt: new Date("2022-05-10"),
    sessionsAttended: 18,
    emergencyContactName: "Lisa Chen",
    emergencyContactPhone: "(555) 876-5432",
    insuranceProvider: "Aetna",
    insurancePolicyNumber: "ATN7891234",
    insuranceGroupNumber: "GA-12345",
    preferredPronouns: "he/him",
    notes: "Michael has been focusing on stress management related to his work situation. Has been implementing mindfulness exercises consistently.",
  },
  {
    id: 3,
    firstName: "Sophie",
    lastName: "Garcia",
    dateOfBirth: new Date("1992-03-27"),
    phone: "(555) 345-6789",
    email: "sophie.garcia@example.com",
    address: "789 Oak Street\nSan Francisco, CA 94110",
    lastSession: new Date("2023-07-20"),
    nextSession: new Date("2023-07-27"),
    status: "Active",
    balance: 75.50,
    therapistId: 1,
    therapistName: "Dr. Emma Johnson",
    createdAt: new Date("2022-08-22"),
    sessionsAttended: 12,
    emergencyContactName: "Marco Garcia",
    emergencyContactPhone: "(555) 765-4321",
    insuranceProvider: "Cigna",
    insurancePolicyNumber: "CGN456789",
    insuranceGroupNumber: "GC-56789",
    preferredPronouns: "she/her",
    notes: "Sophie is working through childhood trauma. Has shown significant improvement in emotional regulation.",
  },
  {
    id: 4,
    firstName: "David",
    lastName: "Thompson",
    dateOfBirth: new Date("1978-09-12"),
    phone: "(555) 456-7890",
    email: "david.thompson@example.com",
    address: "101 Maple Drive\nChicago, IL 60607",
    lastSession: new Date("2023-07-10"),
    nextSession: null,
    status: "Inactive",
    balance: 0,
    therapistId: 1,
    therapistName: "Dr. Emma Johnson",
    createdAt: new Date("2021-11-05"),
    sessionsAttended: 32,
    emergencyContactName: "Sarah Thompson",
    emergencyContactPhone: "(555) 654-3210",
    insuranceProvider: "UnitedHealthcare",
    insurancePolicyNumber: "UHC567890",
    insuranceGroupNumber: "GU-67890",
    preferredPronouns: "he/him",
    notes: "David completed his treatment goals and has transitioned to monthly check-ins. Has maintained progress well.",
  },
  {
    id: 5,
    firstName: "Jamie",
    lastName: "Rodriguez",
    dateOfBirth: new Date("1995-07-30"),
    phone: "(555) 567-8901",
    email: "jamie.rodriguez@example.com",
    address: "202 Pine Lane\nSeattle, WA 98101",
    lastSession: null,
    nextSession: new Date("2023-07-29"),
    status: "New",
    balance: 0,
    therapistId: 1,
    therapistName: "Dr. Emma Johnson",
    createdAt: new Date("2023-07-15"),
    sessionsAttended: 0,
    emergencyContactName: "Alex Rodriguez",
    emergencyContactPhone: "(555) 543-2109",
    insuranceProvider: "Kaiser Permanente",
    insurancePolicyNumber: "KP678901",
    insuranceGroupNumber: "GK-78901",
    preferredPronouns: "they/them",
    notes: "Initial assessment scheduled. Referred by Dr. Martinez for anxiety and depression management.",
  }
];

export default function Clients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clients, setClients] = useState(mockClients);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

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
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleViewClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setIsDetailsOpen(true);
    }
  };

  const handleEditClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setIsFormOpen(true);
    }
  };

  const handleScheduleSession = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    toast({
      title: "Schedule Session",
      description: `Opening scheduler for ${client?.firstName} ${client?.lastName}...`,
    });
  };

  const handleClientFormSubmit = (data: any) => {
    if (selectedClient) {
      // Update existing client
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === selectedClient.id 
            ? { ...client, ...data, id: selectedClient.id } 
            : client
        )
      );
      
      toast({
        title: "Client Updated",
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    } else {
      // Add new client
      const newClient = {
        ...data,
        id: clients.length + 1,
        createdAt: new Date(),
        lastSession: null,
        nextSession: null,
        balance: 0,
        sessionsAttended: 0,
        therapistId: user?.id || 1,
        therapistName: `${user?.firstName} ${user?.lastName}` || "Dr. Emma Johnson",
      };
      
      setClients(prevClients => [...prevClients, newClient]);
      
      toast({
        title: "Client Added",
        description: `${data.firstName} ${data.lastName} has been added to your client list.`,
      });
    }
    
    setIsFormOpen(false);
  };

  const handleClientUpdate = (data: any) => {
    if (selectedClient) {
      // Update existing client
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === selectedClient.id 
            ? { ...client, ...data } 
            : client
        )
      );
      
      // Update the selected client state as well
      setSelectedClient({
        ...selectedClient,
        ...data
      });
      
      toast({
        title: "Client Updated",
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    }
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  // If viewing client details
  if (isDetailsOpen && selectedClient) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <TopBar title={`${selectedClient.firstName} ${selectedClient.lastName}`} />
          
          <div className="p-6 bg-neutral-50 min-h-screen">
            <ClientDetails 
              {...selectedClient}
              onClose={() => setIsDetailsOpen(false)}
              onEdit={handleClientUpdate}
            />
          </div>
        </div>
      </div>
    );
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
                <div>
                  <CardTitle>Clients</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your practice's client list
                  </CardDescription>
                </div>
                <Button onClick={handleAddClient} className="group relative overflow-hidden rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/25 hover:scale-105">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                  <span className="relative z-10 flex items-center">
                    <UserPlus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Add Client
                  </span>
                  <span className="absolute -bottom-1 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-white opacity-70 transition-all duration-300 group-hover:w-1/2"></span>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Search clients by name, email, or phone..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-400 hover:text-neutral-700"
                      onClick={() => setSearchQuery("")}
                    >
                      <CircleX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
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
                      <SelectItem value="onhold">On Hold</SelectItem>
                      <SelectItem value="discharged">Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
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
                        <TableRow 
                          key={client.id} 
                          className="hover:bg-neutral-50 cursor-pointer"
                          onClick={() => handleViewClient(client.id)}
                        >
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
                                  : client.status === "New"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                    : client.status === "onHold"
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                      : "bg-red-100 text-red-800 hover:bg-red-100"
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
                          <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                                  View Client Chart
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
                        <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                          <div className="flex flex-col items-center">
                            <UserPlus className="h-8 w-8 text-neutral-300 mb-2" />
                            <p>No clients found matching the current filters.</p>
                            {searchQuery && (
                              <Button 
                                variant="link" 
                                className="mt-2" 
                                onClick={() => setSearchQuery("")}
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
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
      
      {/* Client Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-5xl h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Edit Client' : 'New Client'}</DialogTitle>
            <DialogDescription>
              {selectedClient 
                ? 'Edit the client information below.' 
                : 'Fill out the form below to add a new client to your practice.'}
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            client={selectedClient} 
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleClientFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRoute } from "wouter";
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
  CircleX,
  Loader2
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Client, type ExtendedClient } from "@shared/schema";

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
  const [matched, params] = useRoute("/clients/:id");
  const clientId = matched ? params.id : null;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ExtendedClientData | null>(null);
  
  // Define a more flexible client type to handle properties that might not exist in the database schema
  // Override the Client type with more flexible date handling for API responses
  interface ExtendedClientData {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    status: string;
    address: string | null;
    primaryTherapistId: number | null;
    // Modified to handle string dates from API
    dateOfBirth?: Date | string | null;
    // Additional properties that might be returned from the API
    lastSession?: Date | string | null;
    nextSession?: Date | string | null;
    balance?: number;
    therapistName?: string;
    sessionsAttended?: number;
    // Add any other fields that might be used in the UI
    middleName?: string;
    preferredName?: string;
    mobilePhone?: string;
    homePhone?: string;
    workPhone?: string;
    otherPhone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    timeZone?: string;
    administrativeSex?: "male" | "female" | "unknown";
    genderIdentity?: string;
    sexualOrientation?: string;
    race?: string;
    ethnicity?: string;
    language?: string;
    maritalStatus?: string;
    employment?: string;
    referralSource?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    insuranceGroupNumber?: string;
    insuranceCopay?: string;
    insuranceDeductible?: string;
    responsibleParty?: string;
    diagnosisCodes?: string[];
    medicationList?: string;
    allergies?: string;
    smokingStatus?: string;
    hipaaConsentSigned?: boolean;
    consentForTreatmentSigned?: boolean;
    consentForCommunication?: string[];
    notes?: string;
    billingNotes?: string;
    privateNotes?: string;
    lastPaymentAmount?: number;
    lastPaymentDate?: Date | string;
    emergencyContacts?: any[];
    insuranceInformation?: any[];
    paymentCards?: any[];
    preferredPronouns?: string;
  }
  
  // Fetch clients from API
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<ExtendedClientData[]>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    },
  });
  
  // Check if we have a client ID in the URL parameters
  useEffect(() => {
    // Only run this when clients are loaded and we have an ID parameter
    if (!isLoadingClients && clients.length > 0 && clientId) {
      const id = parseInt(clientId);
      if (!isNaN(id)) {
        const client = clients.find(c => c.id === id);
        if (client) {
          setSelectedClient(client);
          setIsDetailsOpen(true);
        }
      }
    }
  }, [clients, isLoadingClients, clientId]);
  
  // Add client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: ExtendedClient) => {
      const response = await apiRequest('POST', '/api/clients', clientData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate clients query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error Adding Client",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExtendedClient> }) => {
      const response = await apiRequest('PATCH', `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error Updating Client",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter clients based on search query and status filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.phone && client.phone.includes(searchQuery));
    
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
      // Update existing client using mutation
      updateClientMutation.mutate({
        id: selectedClient.id,
        data: data
      });
      
      toast({
        title: "Client Updated",
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    } else {
      // Add new client using mutation
      const newClient = {
        ...data,
        therapistId: user?.id || 1,
        // Other fields will be set by the server
      };
      
      createClientMutation.mutate(newClient as ExtendedClient);
      
      toast({
        title: "Client Added",
        description: `${data.firstName} ${data.lastName} has been added to your client list.`,
      });
    }
  };

  const handleClientUpdate = (data: any) => {
    if (selectedClient) {
      // Update existing client using mutation
      updateClientMutation.mutate({
        id: selectedClient.id,
        data: data
      });
      
      // Update the selected client state as well for immediate UI update
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
              {...selectedClient as any}
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
                    {isLoadingClients ? (
                      // Loading state
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                            <p>Loading clients...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : clientsError ? (
                      // Error state
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-red-500">
                          <div className="flex flex-col items-center">
                            <p>Error loading clients: {clientsError.message}</p>
                            <Button 
                              variant="link" 
                              className="mt-2" 
                              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/clients'] })}
                            >
                              Try again
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredClients.length > 0 ? (
                      // Clients data
                      filteredClients.map((client) => (
                        <TableRow 
                          key={client.id} 
                          className="hover:bg-neutral-50 cursor-pointer"
                          onClick={() => handleViewClient(client.id)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{client.firstName} {client.lastName}</div>
                              {client.dateOfBirth && (
                                <div className="text-sm text-neutral-500">
                                  {format(new Date(client.dateOfBirth), "MMM d, yyyy")} 
                                  ({new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear()} years)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.phone && <div className="text-sm">{client.phone}</div>}
                            {client.email && <div className="text-sm text-neutral-500">{client.email}</div>}
                          </TableCell>
                          <TableCell>
                            {/* Safely access lastSession if it exists in the object */}
                            {client.lastSession ? format(new Date(client.lastSession), "MMM d, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            {/* Safely access nextSession if it exists in the object */}
                            {client.nextSession ? format(new Date(client.nextSession), "MMM d, yyyy") : "Not scheduled"}
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
                            {/* Safely access balance, providing a default if it doesn't exist */}
                            {typeof client.balance !== 'undefined' ? (
                              client.balance > 0 
                                ? <span className="text-error-500">${client.balance.toFixed(2)}</span> 
                                : <span>${client.balance.toFixed(2)}</span>
                            ) : (
                              <span>$0.00</span>
                            )}
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
                      // No clients matching filter
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
            client={selectedClient || undefined} 
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleClientFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

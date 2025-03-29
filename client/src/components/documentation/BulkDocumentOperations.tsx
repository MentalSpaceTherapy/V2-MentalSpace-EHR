import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { format } from 'date-fns';

// Type definitions
interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  dateOfBirth?: string | Date | null;
  lastSession?: string | Date | null;
  nextSession?: string | Date | null;
  therapistName?: string;
}

interface DocumentTemplate {
  id: number;
  name: string;
  description: string | null;
  type: string;
  status: string;
}

interface BulkDocumentData {
  templateId: number;
  clientIds: number[];
  documentType: string;
  completedDate: string;
  notes: string;
}

export default function BulkDocumentOperations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [bulkDocData, setBulkDocData] = useState<BulkDocumentData>({
    templateId: 0,
    clientIds: [],
    documentType: "progress-note",
    completedDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ""
  });
  
  // Fetch clients
  const { 
    data: clients = [], 
    isLoading: isLoadingClients,
    isError: isClientsError,
    error: clientsError
  } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json() as Promise<Client[]>;
    },
  });
  
  // Fetch templates
  const { 
    data: templates = [], 
    isLoading: isLoadingTemplates
  } = useQuery({
    queryKey: ['/api/document-templates'],
    queryFn: async () => {
      const response = await fetch('/api/document-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json() as Promise<DocumentTemplate[]>;
    },
  });
  
  // Filter active templates
  const activeTemplates = templates.filter(template => 
    template.status === 'active' || template.status === 'draft'
  );
  
  // Filter clients based on search query and status filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      client.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    }
  }, [selectAll]);
  
  // Update selectAll state based on individual selections
  useEffect(() => {
    if (filteredClients.length > 0 && selectedClients.length === filteredClients.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedClients, filteredClients]);
  
  // Handle individual client selection
  const handleClientSelection = (clientId: number) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };
  
  // Prepare for bulk operation preview
  const handlePreviewBulkOperation = () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a document template first",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedClients.length === 0) {
      toast({
        title: "No Clients Selected",
        description: "Please select at least one client",
        variant: "destructive"
      });
      return;
    }
    
    setBulkDocData({
      templateId: selectedTemplate,
      clientIds: selectedClients,
      documentType: activeTemplates.find(t => t.id === selectedTemplate)?.type.toLowerCase().replace(' ', '-') || "progress-note",
      completedDate: format(new Date(), 'yyyy-MM-dd'),
      notes: ""
    });
    
    setIsPreviewOpen(true);
  };
  
  // Bulk document creation mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (data: BulkDocumentData) => {
      return fetch('/api/documents/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdById: user?.id
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create bulk documents');
        return res.json();
      });
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documentation'] });
      setIsPreviewOpen(false);
      setSelectedClients([]);
      setSelectedTemplate(null);
      toast({
        title: 'Success',
        description: `Documents created for ${selectedClients.length} clients`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const handleSubmitBulkOperation = async () => {
    bulkCreateMutation.mutate(bulkDocData);
  };
  
  // Handle template change
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(parseInt(value));
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Documentation</h1>
          <p className="text-muted-foreground">
            Apply documentation templates to multiple clients at once
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Templates Selection */}
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Step 1: Select Document Template</CardTitle>
            <CardDescription>
              Choose the template you want to apply to multiple clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Select
                value={selectedTemplate?.toString() || ""}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-full md:w-[350px]">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading templates...</span>
                    </div>
                  ) : activeTemplates.length > 0 ? (
                    activeTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name} ({template.type})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p>No active templates found</p>
                      <Button 
                        variant="link" 
                        className="mt-2" 
                        onClick={() => window.location.href = '/templates'}
                      >
                        Create a template
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
              
              {selectedTemplate && (
                <div className="bg-neutral-50 p-4 rounded-md border">
                  <h3 className="font-medium mb-1">
                    {activeTemplates.find(t => t.id === selectedTemplate)?.name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {activeTemplates.find(t => t.id === selectedTemplate)?.description || 'No description provided.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Client Selection */}
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Step 2: Select Clients</CardTitle>
            <CardDescription>
              Choose the clients who will receive this documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <p className="text-sm text-neutral-500">Filter:</p>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
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
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectAll} 
                        onCheckedChange={(checked) => {
                          setSelectAll(checked === true);
                        }} 
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Session</TableHead>
                    <TableHead>Therapist</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingClients ? (
                    // Loading state
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                          <p>Loading clients...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : isClientsError ? (
                    // Error state
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-red-500">
                        <div className="flex flex-col items-center">
                          <p>Error loading clients: {clientsError?.message}</p>
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
                      <TableRow key={client.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedClients.includes(client.id)} 
                            onCheckedChange={() => handleClientSelection(client.id)} 
                          />
                        </TableCell>
                        <TableCell>
                          {client.firstName} {client.lastName}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            client.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            client.status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {client.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {client.lastSession 
                            ? typeof client.lastSession === 'string' 
                              ? client.lastSession 
                              : format(client.lastSession, 'MMM d, yyyy')
                            : 'None'}
                        </TableCell>
                        <TableCell>
                          {client.therapistName || 'Unassigned'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No clients matching filter
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                        <div className="flex flex-col items-center">
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
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-neutral-500">
                {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
              </p>
              <Button 
                onClick={handlePreviewBulkOperation}
                disabled={selectedClients.length === 0 || !selectedTemplate}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:shadow-md"
              >
                <FileText className="h-4 w-4 mr-2" />
                Preview Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Documentation</DialogTitle>
            <DialogDescription>
              You are about to create documentation for {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <label className="text-sm font-medium">Template</label>
                <p className="text-sm mt-1">
                  {activeTemplates.find(t => t.id === selectedTemplate)?.name}
                </p>
              </div>
              
              <div className="col-span-4">
                <label className="text-sm font-medium">Document Type</label>
                <p className="text-sm mt-1">
                  {activeTemplates.find(t => t.id === selectedTemplate)?.type}
                </p>
              </div>
              
              <div className="col-span-4">
                <label className="text-sm font-medium">Document Date</label>
                <Input
                  type="date"
                  value={bulkDocData.completedDate}
                  onChange={(e) => setBulkDocData({...bulkDocData, completedDate: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-4">
                <label className="text-sm font-medium">Additional Notes</label>
                <Input
                  value={bulkDocData.notes}
                  onChange={(e) => setBulkDocData({...bulkDocData, notes: e.target.value})}
                  placeholder="Optional notes for all documents"
                  className="mt-1"
                />
              </div>
            </div>
            
            <Alert>
              <AlertTitle>Selected Clients: {selectedClients.length}</AlertTitle>
              <AlertDescription>
                This will create a new document for each selected client based on the template "{activeTemplates.find(t => t.id === selectedTemplate)?.name}".
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBulkOperation}
              disabled={bulkCreateMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-teal-700 hover:shadow-md"
            >
              {bulkCreateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Documents
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
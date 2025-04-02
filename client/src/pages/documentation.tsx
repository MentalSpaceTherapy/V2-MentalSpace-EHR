import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  FilePlus, 
  ClipboardList, 
  FileEdit,
  User,
  UserPlus,
  FileCheck,
  Clock,
  Calendar,
  CheckCircle,
  ClipboardEdit,
  FileQuestion,
  Edit,
  Phone,
  FileClock,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENTATION_STATUS, DOCUMENTATION_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Components
import { ProgressNoteForm } from "@/components/forms/ProgressNoteForm";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { TreatmentPlanForm } from "@/components/forms/TreatmentPlanForm";
import { ContactNoteForm } from "@/components/forms/ContactNoteForm";
import { CancellationMissedForm } from "@/components/forms/CancellationMissedForm";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { MiscellaneousForm } from "@/components/forms/MiscellaneousForm";
import { AbsenceNoteForm } from "@/components/forms/AbsenceNoteForm";

// Mock documentation data
const mockDocuments = [
  {
    id: 1,
    clientName: "Emma Wilson",
    sessionDate: subDays(new Date(), 1),
    createdDate: subDays(new Date(), 1),
    dueDate: new Date(),
    type: "Progress Note",
    status: "Overdue",
  },
  {
    id: 2,
    clientName: "Michael Chen",
    sessionDate: subDays(new Date(), 2),
    createdDate: subDays(new Date(), 2),
    dueDate: new Date(),
    type: "Treatment Plan",
    status: "Due Today",
  },
  {
    id: 3,
    clientName: "Sophie Garcia",
    sessionDate: subDays(new Date(), 3),
    createdDate: subDays(new Date(), 3),
    dueDate: addDays(new Date(), 1),
    type: "Assessment",
    status: "In Progress",
  },
  {
    id: 4,
    clientName: "David Thompson",
    sessionDate: subDays(new Date(), 5),
    createdDate: subDays(new Date(), 5),
    dueDate: subDays(new Date(), 1),
    type: "Progress Note",
    status: "Complete",
  },
  {
    id: 5,
    clientName: "Jamie Rodriguez",
    sessionDate: subDays(new Date(), 1),
    createdDate: subDays(new Date(), 1),
    dueDate: addDays(new Date(), 2),
    type: "Intake Form",
    status: "Draft",
  },
  {
    id: 6,
    clientName: "Alex Johnson",
    sessionDate: subDays(new Date(), 10),
    createdDate: subDays(new Date(), 10),
    dueDate: subDays(new Date(), 7),
    type: "Discharge Summary",
    status: "Signed",
  }
];

interface DocumentationProps {
  formType?: string;
}

export default function Documentation({ formType }: DocumentationProps) {
  const [location] = useLocation();
  const isDocumentationPage = location.startsWith('/documentation');
  const shouldOpenCreateDialog = location.includes('create=true');
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState(formType ? formType.toLowerCase() : "all");
  const [currentTab, setCurrentTab] = useState("pending");
  const [documents, setDocuments] = useState(mockDocuments);
  
  // State for document creation and editing
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'form'>(formType ? 'form' : 'list');
  const [currentForm, setCurrentForm] = useState<string | undefined>(formType || undefined);
  
  // Effect to automatically open create dialog when navigated with create=true parameter
  // Parse URL parameters for document selection and navigation
  useEffect(() => {
    // Get all URL parameters
    const params = new URLSearchParams(window.location.search);
    const docIdParam = params.get('docId');
    const typeParam = params.get('type');
    const clientNameParam = params.get('clientName');
    
    // Handle document creation dialog
    if (shouldOpenCreateDialog) {
      setIsCreateDialogOpen(true);
    }
    
    // Handle document opening when docId is provided
    if (docIdParam) {
      const docId = parseInt(docIdParam);
      setActiveDocument(docId);
      // If document exists in our store, open the form view
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        setViewMode('form');
        setCurrentForm(doc.type.toLowerCase().replace(/\s+/g, '-'));
        toast({
          title: `Opening ${doc.type}`,
          description: `Opening document for ${doc.clientName}...`,
        });
      }
    }
  }, [shouldOpenCreateDialog, documents, toast]);
  
  // Filter documents based on search query, status filter, and type filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      doc.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesType = 
      typeFilter === "all" || 
      doc.type.toLowerCase() === typeFilter.toLowerCase();
    
    const matchesTab = 
      (currentTab === "pending" && ['Draft', 'In Progress', 'Overdue', 'Due Today'].includes(doc.status)) ||
      (currentTab === "completed" && ['Complete', 'Signed'].includes(doc.status)) ||
      currentTab === "all";
    
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-red-500 text-white border-transparent";
      case "Due Today":
        return "bg-amber-500 text-white border-transparent";
      case "In Progress":
        return "bg-blue-500 text-white border-transparent";
      case "Complete":
        return "bg-green-500 text-white border-transparent";
      case "Signed":
        return "bg-purple-500 text-white border-transparent";
      case "Draft":
        return "bg-gray-500 text-white border-transparent";
      default:
        return "bg-gray-500 text-white border-transparent";
    }
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case "Progress Note":
        return <ClipboardEdit className="h-5 w-5 text-blue-500" />;
      case "Intake Form":
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case "Treatment Plan":
        return <FileEdit className="h-5 w-5 text-green-500" />;
      case "Contact Note":
        return <Phone className="h-5 w-5 text-indigo-500" />;
      case "Cancellation/Missed Appointment":
      case "Absence Note":
        return <FileClock className="h-5 w-5 text-amber-500" />;
      case "Consultation":
        return <FileSpreadsheet className="h-5 w-5 text-teal-500" />;
      case "Miscellaneous":
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleCreateDocument = (type: string) => {
    setIsCreateDialogOpen(false);
    setViewMode('form');
    setCurrentForm(type);
    
    toast({
      title: `Creating ${type}`,
      description: `Opening new ${type.toLowerCase()} form...`,
    });
  };

  const handleEditDocument = (docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setActiveDocument(docId);
      setViewMode('form');
      setCurrentForm(doc.type);
      
      toast({
        title: `Opening ${doc.type}`,
        description: `Opening document for ${doc.clientName}...`,
      });
    }
  };

  const handleReturnToList = () => {
    setViewMode('list');
    setCurrentForm(undefined);
    setActiveDocument(null);
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  // Render form based on document type
  const renderForm = () => {
    switch (currentForm) {
      case "Progress Note":
        return <ProgressNoteForm />;
      case "Intake Form":
        return <IntakeForm />;
      case "Treatment Plan":
        return <TreatmentPlanForm />;
      case "Contact Note":
        return <ContactNoteForm />;
      case "Cancellation/Missed Appointment":
      case "Absence Note":
        return <CancellationMissedForm />;
      case "Consultation":
        return <ConsultationForm />;
      case "Miscellaneous":
        return <MiscellaneousForm />;
      default:
        // Import and render the DocumentationDashboard component
        if (location === '/documentation') {
          const DocumentationDashboard = require('@/pages/documentation-dashboard').default;
          return <DocumentationDashboard />;
        }
        return (
          <div className="max-w-4xl mx-auto p-10 text-center bg-white rounded-lg shadow-md">
            <FileQuestion className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Form Not Implemented Yet</h3>
            <p className="text-gray-500 mb-6">
              The {currentForm} form is currently under development and will be available soon.
            </p>
            <Button onClick={handleReturnToList}>
              Return to Documents
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title={formType ? `${formType} Documentation` : "Session Documentation"} />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          {location === '/documentation' ? (
            renderForm()
          ) : viewMode === 'list' ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{formType ? `${formType} Documentation` : 'Documentation'}</CardTitle>
                    <CardDescription className="mt-1">
                      {formType 
                        ? `Manage ${formType.toLowerCase()} documents` 
                        : 'Manage clinical notes, assessments, and treatment plans'}
                    </CardDescription>
                  </div>
                  
                  {/* Create Document Button */}
                  {!formType && isDocumentationPage ? (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:shadow-md">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Create New Document</DialogTitle>
                          <DialogDescription>
                            Select the type of document you want to create
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                          {DOCUMENTATION_TYPES.map((type) => (
                            <button
                              key={type}
                              className="group flex flex-col items-center p-4 border border-transparent rounded-lg transition-all duration-300 hover:border-primary-300 hover:bg-white hover:shadow-xl"
                              onClick={() => handleCreateDocument(type)}
                            >
                              <div className="bg-primary-100 p-3 rounded-full mb-3 shadow">
                                {getDocTypeIcon(type)}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{type}</span>
                            </button>
                          ))}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button 
                      onClick={() => handleCreateDocument(formType || '')}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create {formType}
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Show appropriate filter/content based on whether this is a specific document type page */}
                {!formType ? (
                  /* Main Documentation Page with Tabs */
                  <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="pending">
                        <div className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Pending
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        <div className="flex items-center">
                          <FileCheck className="h-4 w-4 mr-2" />
                          Completed
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="all">All Documents</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input 
                          placeholder="Search client or document..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                            {DOCUMENTATION_STATUS.map(status => (
                              <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={typeFilter}
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="w-full md:w-[180px]">
                            <div className="flex items-center">
                              <FilePlus className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Filter by Type" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {DOCUMENTATION_TYPES.map(type => (
                              <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Session Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {filteredDocuments.length > 0 ? (
                              filteredDocuments.map((doc) => (
                                <tr 
                                  key={doc.id} 
                                  className="hover:bg-neutral-50 cursor-pointer transition-colors duration-150"
                                  onClick={() => handleEditDocument(doc.id)}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-2 text-neutral-400" />
                                      {doc.clientName}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    {format(doc.sessionDate, "MMM d, yyyy")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    {format(doc.createdDate, "MMM d, yyyy")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={doc.status === "Overdue" || doc.status === "Due Today" ? "text-error-500 font-medium" : ""}>
                                      {format(doc.dueDate, "MMM d, yyyy")}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    <div className="flex items-center">
                                      {getDocTypeIcon(doc.type)}
                                      <span className="ml-2">{doc.type}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant="outline" className={getStatusBadgeClass(doc.status)}>
                                      {doc.status}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                      variant="link" 
                                      className="text-primary-600 hover:text-primary-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditDocument(doc.id);
                                      }}
                                    >
                                      {doc.status === "Complete" || doc.status === "Signed" ? "View" : 
                                       doc.status === "In Progress" ? "Continue" : "Complete"}
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-neutral-500">
                                  No documents found matching the current filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Tabs>
                ) : (
                  /* Specific Document Type Page */
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input 
                          placeholder="Search client..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                            {DOCUMENTATION_STATUS.map(status => (
                              <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Session Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {filteredDocuments.length > 0 ? (
                              filteredDocuments.map((doc) => (
                                <tr 
                                  key={doc.id} 
                                  className="hover:bg-neutral-50 cursor-pointer transition-colors duration-150"
                                  onClick={() => handleEditDocument(doc.id)}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-2 text-neutral-400" />
                                      {doc.clientName}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    {format(doc.sessionDate, "MMM d, yyyy")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    {format(doc.createdDate, "MMM d, yyyy")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={doc.status === "Overdue" || doc.status === "Due Today" ? "text-red-600 font-medium" : ""}>
                                      {format(doc.dueDate, "MMM d, yyyy")}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant="outline" className={getStatusBadgeClass(doc.status)}>
                                      {doc.status}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                      variant="link" 
                                      className="text-primary-600 hover:text-primary-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditDocument(doc.id);
                                      }}
                                    >
                                      {doc.status === "Complete" || doc.status === "Signed" ? "View" : 
                                      doc.status === "In Progress" ? "Continue" : "Complete"}
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                                  No {formType?.toLowerCase()} documents found matching the current filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            // Form view mode
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h2 className="text-xl font-semibold">{currentForm}</h2>
                  <p className="text-neutral-500 text-sm">
                    {activeDocument !== null 
                      ? `Editing document for ${documents.find(d => d.id === activeDocument)?.clientName || ''}` 
                      : 'Creating new document'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleReturnToList}
                >
                  Return to List
                </Button>
              </div>
              
              {renderForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
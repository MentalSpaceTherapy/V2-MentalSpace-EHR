import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { ProgressNoteForm } from "@/components/forms/ProgressNoteForm";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { TreatmentPlanForm } from "@/components/forms/TreatmentPlanForm";
import { ContactNoteForm } from "@/components/forms/ContactNoteForm";
import { AbsenceNoteForm } from "@/components/forms/AbsenceNoteForm";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { MiscellaneousForm } from "@/components/forms/MiscellaneousForm";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  X,
  ClipboardEdit,
  FileQuestion,
  Edit,
  Phone,
  FileClock,
  FileSpreadsheet
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("pending");
  const [documents, setDocuments] = useState(mockDocuments);
  
  // State for document creation and editing
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | undefined>(undefined);
  const [activeDocument, setActiveDocument] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'form'>(formType ? 'form' : 'list');
  const [currentForm, setCurrentForm] = useState<string | undefined>(formType);
  
  // Initialize with formType if provided
  useEffect(() => {
    if (formType) {
      // Check if we should open a form or show filtered dashboard
      const shouldShowForm = new URLSearchParams(window.location.search).get('new') === 'true';
      
      if (shouldShowForm) {
        setViewMode('form');
        setCurrentForm(formType);
      } else {
        // Show dashboard with type filter applied
        setViewMode('list');
        setTypeFilter(formType);
      }
    }
  }, [formType]);

  // Filter documents based on search query, status filter, type filter, and active tab
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      doc.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesType = 
      typeFilter === "all" || 
      doc.type === typeFilter;
    
    // For the "pending" tab, include everything that's not Complete or Signed
    const matchesTab = 
      (currentTab === "pending" && ['Draft', 'In Progress', 'Overdue', 'Due Today'].includes(doc.status)) ||
      (currentTab === "completed" && ['Complete', 'Signed'].includes(doc.status)) ||
      currentTab === "all";
    
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-md hover:shadow-red-200 border-transparent font-medium animate-pulse";
      case "Due Today":
        return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:shadow-md hover:shadow-yellow-200 border-transparent font-medium";
      case "In Progress":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md hover:shadow-blue-200 border-transparent font-medium";
      case "Complete":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md hover:shadow-green-200 border-transparent font-medium";
      case "Signed":
        return "bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:shadow-md hover:shadow-purple-200 border-transparent font-medium";
      case "Draft":
        return "bg-gradient-to-r from-slate-400 to-gray-500 text-white hover:shadow-md hover:shadow-gray-200 border-transparent font-medium";
      default:
        return "bg-gradient-to-r from-slate-400 to-gray-500 text-white hover:shadow-md hover:shadow-gray-200 border-transparent font-medium";
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
    setSelectedDocType(type);
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
    setSelectedDocType(undefined);
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
      case "Absence Note":
        return <AbsenceNoteForm />;
      case "Consultation":
        return <ConsultationForm />;
      case "Miscellaneous":
        return <MiscellaneousForm />;
      default:
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
        <TopBar title={formType && typeFilter !== 'all' ? `${typeFilter} Documentation` : "Session Documentation"} />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          {viewMode === 'list' ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{typeFilter !== 'all' ? `${typeFilter} Documentation` : 'Documentation'}</CardTitle>
                    <CardDescription className="mt-1">
                      {typeFilter !== 'all' 
                        ? `Manage ${typeFilter.toLowerCase()} documents` 
                        : 'Manage clinical notes, assessments, and treatment plans'}
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <button 
                        className="group relative inline-flex items-center overflow-hidden rounded-md bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                        <Plus className="h-4 w-4 mr-2 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />
                        <span className="relative z-10">Create Document</span>
                        <span className="absolute -bottom-1 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-white opacity-70 transition-all duration-300 group-hover:w-1/2"></span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create New Document</DialogTitle>
                        <DialogDescription>
                          Select the type of document you want to create
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        {DOCUMENTATION_TYPES.map((type) => {
                          const getButtonStyle = () => {
                            switch(type) {
                              case "Progress Note":
                                return "from-blue-500 to-indigo-500 shadow-blue-200";
                              case "Intake Form":
                                return "from-purple-500 to-pink-500 shadow-purple-200";
                              case "Treatment Plan":
                                return "from-green-500 to-emerald-500 shadow-green-200";
                              case "Contact Note":
                                return "from-indigo-500 to-blue-500 shadow-indigo-200";
                              case "Absence Note":
                                return "from-amber-500 to-yellow-500 shadow-amber-200";
                              case "Consultation":
                                return "from-teal-500 to-cyan-500 shadow-teal-200";
                              case "Miscellaneous":
                                return "from-gray-500 to-slate-500 shadow-gray-200";
                              default:
                                return "from-gray-500 to-slate-500 shadow-gray-200";
                            }
                          };
                          
                          return (
                            <button
                              key={type}
                              className={cn(
                                "group flex flex-col items-center p-4 border border-transparent rounded-lg transition-all duration-300",
                                "hover:border-primary-300 hover:bg-white hover:shadow-xl hover:scale-105",
                                "focus:outline-none focus:ring-2 focus:ring-primary-500"
                              )}
                              onClick={() => handleCreateDocument(type)}
                            >
                              <div className={`bg-gradient-to-r ${getButtonStyle()} p-3 rounded-full mb-3 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-110`}>
                                {getDocTypeIcon(type)}
                              </div>
                              <span className="text-sm font-medium text-gray-700 transition-all duration-300 group-hover:text-primary-700 group-hover:font-semibold">{type}</span>
                              <div className="mt-2 h-0.5 w-0 bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-all duration-300 group-hover:w-3/4 opacity-0 group-hover:opacity-100"></div>
                            </button>
                          );
                        })}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="pending" onValueChange={setCurrentTab} className="mb-6">
                  <TabsList className="p-1 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-xl">
                    <TabsTrigger 
                      value="pending" 
                      className="flex items-center transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
                    >
                      <div className="relative">
                        <ClipboardList className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full opacity-80 animate-pulse"></span>
                      </div>
                      Pending
                    </TabsTrigger>
                    <TabsTrigger 
                      value="completed" 
                      className="flex items-center transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
                    >
                      <FileText className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      Completed
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
                    >
                      All Documents
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input 
                      placeholder="Search client or document type..." 
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
                          <SelectItem key={type} value={type}>{type}</SelectItem>
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
                            <tr key={doc.id} className="hover:bg-neutral-50">
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
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button 
                                  variant="link" 
                                  className="text-primary-600 hover:text-primary-800"
                                  onClick={() => handleEditDocument(doc.id)}
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
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="mb-6 flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full w-8 h-8 p-0"
                  onClick={handleReturnToList}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-medium text-neutral-800">
                    {activeDocument 
                      ? `Edit ${currentForm} for ${documents.find(d => d.id === activeDocument)?.clientName}` 
                      : `New ${currentForm}`}
                  </h1>
                </div>
              </div>
              
              {renderForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

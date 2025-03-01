import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENTATION_STATUS, DOCUMENTATION_TYPES } from "@/lib/constants";
import { format, subDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Filter,
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
  FileSpreadsheet,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Plus
} from "lucide-react";

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
  },
  {
    id: 7,
    clientName: "Taylor McKenzie",
    sessionDate: subDays(new Date(), 4),
    createdDate: subDays(new Date(), 4),
    dueDate: addDays(new Date(), 3),
    type: "Contact Note",
    status: "Draft",
  },
  {
    id: 8,
    clientName: "Jordan Smith",
    sessionDate: subDays(new Date(), 6),
    createdDate: subDays(new Date(), 6),
    dueDate: subDays(new Date(), 2),
    type: "Progress Note",
    status: "Overdue",
  },
  {
    id: 9,
    clientName: "Riley Cooper",
    sessionDate: subDays(new Date(), 2),
    createdDate: subDays(new Date(), 2),
    dueDate: addDays(new Date(), 1),
    type: "Treatment Plan",
    status: "In Progress",
  },
];

export default function DocumentationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [documents, setDocuments] = useState(mockDocuments);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
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
      doc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-red-500 text-white border-transparent font-medium";
      case "Due Today":
        return "bg-amber-500 text-white border-transparent font-medium";
      case "In Progress":
        return "bg-blue-500 text-white border-transparent font-medium";
      case "Complete":
        return "bg-green-500 text-white border-transparent font-medium";
      case "Signed":
        return "bg-purple-500 text-white border-transparent font-medium";
      case "Draft":
        return "bg-gray-500 text-white border-transparent font-medium";
      default:
        return "bg-gray-500 text-white border-transparent font-medium";
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
        return <FileClock className="h-5 w-5 text-amber-500" />;
      case "Consultation":
        return <FileSpreadsheet className="h-5 w-5 text-teal-500" />;
      case "Miscellaneous":
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleEditDocument = (docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      toast({
        title: `Opening ${doc.type}`,
        description: `Opening document for ${doc.clientName}...`,
      });
      
      // In a real app, this would navigate to the document edit page
      // For now, just show a toast
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
        <TopBar title="Documentation Dashboard" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Documentation Dashboard</CardTitle>
                  <CardDescription className="mt-1">
                    Manage and monitor all your clinical documentation
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="default"
                    onClick={() => setLocation('/documentation?create=true')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:shadow-md mr-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                  
                  <Button 
                    variant={viewMode === 'card' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className="flex items-center"
                  >
                    <div className="grid grid-cols-2 gap-1 h-4 w-4 mr-1">
                      <div className="bg-current rounded-sm opacity-70"></div>
                      <div className="bg-current rounded-sm opacity-70"></div>
                      <div className="bg-current rounded-sm opacity-70"></div>
                      <div className="bg-current rounded-sm opacity-70"></div>
                    </div>
                    <span>Card</span>
                  </Button>
                  <Button 
                    variant={viewMode === 'table' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center"
                  >
                    <div className="flex flex-col h-4 w-4 mr-1 justify-between">
                      <div className="h-0.5 bg-current rounded-sm"></div>
                      <div className="h-0.5 bg-current rounded-sm"></div>
                      <div className="h-0.5 bg-current rounded-sm"></div>
                    </div>
                    <span>Table</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="shadow-sm border-neutral-200 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 font-medium mb-1">Total Documents</p>
                        <h3 className="text-2xl font-bold text-neutral-800">{documents.length}</h3>
                      </div>
                      <div className="bg-primary-600 p-3 rounded-xl text-white">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-amber-200 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 font-medium mb-1">Pending Review</p>
                        <h3 className="text-2xl font-bold text-neutral-800">{documents.filter(d => d.status === 'In Progress' || d.status === 'Draft').length}</h3>
                      </div>
                      <div className="bg-amber-500 p-3 rounded-xl text-white">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-red-200 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 font-medium mb-1">Overdue</p>
                        <h3 className="text-2xl font-bold text-neutral-800">{documents.filter(d => d.status === 'Overdue').length}</h3>
                      </div>
                      <div className="bg-red-500 p-3 rounded-xl text-white">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-green-200 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 font-medium mb-1">Completed</p>
                        <h3 className="text-2xl font-bold text-neutral-800">{documents.filter(d => d.status === 'Complete' || d.status === 'Signed').length}</h3>
                      </div>
                      <div className="bg-green-500 p-3 rounded-xl text-white">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input 
                    placeholder="Search client or document type..." 
                    className="pl-10 border-neutral-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px] border-neutral-300">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-neutral-500" />
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
                    <SelectTrigger className="w-full md:w-[180px] border-neutral-300">
                      <div className="flex items-center">
                        <FilePlus className="h-4 w-4 mr-2 text-neutral-500" />
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
              
              {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border-neutral-200 hover:border-primary-200" onClick={() => handleEditDocument(doc.id)}>
                      <div className={`h-1.5 w-full ${
                        doc.status === "Overdue" ? "bg-red-500" : 
                        doc.status === "Due Today" ? "bg-amber-500" : 
                        doc.status === "In Progress" ? "bg-blue-500" : 
                        doc.status === "Complete" ? "bg-green-500" : 
                        doc.status === "Signed" ? "bg-purple-500" : "bg-gray-500"}`}
                      />
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              {getDocTypeIcon(doc.type)}
                              <span className="text-sm font-medium text-neutral-700">{doc.type}</span>
                            </div>
                            <h3 className="text-base font-semibold mb-1.5 text-neutral-900 group-hover:text-primary-700 transition-colors">{doc.clientName}</h3>
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                              <span>Session: {format(doc.sessionDate, "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                              <Clock className="h-3.5 w-3.5 text-neutral-500" />
                              <span className={doc.status === "Overdue" ? "text-red-600 font-medium" : ""}>
                                Due: {format(doc.dueDate, "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusBadgeClass(doc.status)}>
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
                          <span className="text-xs text-neutral-600">Created {format(doc.createdDate, "MMM d, yyyy")}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 text-primary-600">
                              {doc.status === "Complete" || doc.status === "Signed" ? "View" : 
                              doc.status === "In Progress" ? "Continue" : "Complete"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <div className="col-span-full p-10 text-center bg-white rounded-lg border border-dashed border-neutral-300">
                      <FileQuestion className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
                      <h3 className="text-lg font-medium text-neutral-800 mb-1">No documents found</h3>
                      <p className="text-neutral-600 mb-4">No documents match your current filters.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setStatusFilter("all");
                          setTypeFilter("all");
                          setSearchQuery("");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
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
                                  <User className="h-4 w-4 mr-2 text-neutral-500" />
                                  {doc.clientName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                {format(doc.sessionDate, "MMM d, yyyy")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                {format(doc.createdDate, "MMM d, yyyy")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={doc.status === "Overdue" || doc.status === "Due Today" ? "text-red-600 font-medium" : "text-neutral-700"}>
                                  {format(doc.dueDate, "MMM d, yyyy")}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                <div className="flex items-center">
                                  {getDocTypeIcon(doc.type)}
                                  <span className="ml-2">{doc.type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getStatusBadgeClass(doc.status)}>
                                  {doc.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button 
                                  variant="ghost" 
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
                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-neutral-600">
                              No documents found matching the current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
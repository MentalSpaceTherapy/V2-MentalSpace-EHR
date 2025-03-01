import { useState } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  FileText,
  CreditCard,
  Edit,
  FileSignature,
  Clock,
  X,
  ChevronLeft,
  AlertTriangle,
  Brain,
  ClipboardCheck,
  UserCircle2,
  Home,
  CheckCircle2,
  Upload,
  DownloadCloud,
  MessageCircle,
  Plus,
  PlusCircle,
  RefreshCw,
  Briefcase
} from "lucide-react";
import { ClientForm } from "./ClientForm";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for the client detail page
const mockSessionsData = [
  {
    id: 1,
    date: new Date("2023-03-15T15:00:00"),
    type: "Individual Therapy",
    duration: "50 minutes",
    status: "Completed",
    notes: "Client reported improved mood but continued anxiety about work situation.",
    therapistName: "Dr. Emma Wilson"
  },
  {
    id: 2,
    date: new Date("2023-03-22T15:00:00"),
    type: "Individual Therapy",
    duration: "50 minutes",
    status: "Cancelled",
    notes: "Client called to cancel due to illness.",
    therapistName: "Dr. Emma Wilson"
  },
  {
    id: 3,
    date: new Date("2023-03-29T15:00:00"),
    type: "Individual Therapy",
    duration: "50 minutes",
    status: "Completed",
    notes: "Continued work on anxiety management strategies.",
    therapistName: "Dr. Emma Wilson"
  },
  {
    id: 4,
    date: new Date("2023-04-05T15:00:00"),
    type: "Individual Therapy",
    duration: "50 minutes",
    status: "Completed",
    notes: "Discussed progress with assertiveness techniques.",
    therapistName: "Dr. Emma Wilson"
  },
  {
    id: 5,
    date: new Date("2023-04-12T15:00:00"),
    type: "Individual Therapy",
    duration: "50 minutes",
    status: "No-Show",
    notes: "Client did not attend and did not call.",
    therapistName: "Dr. Emma Wilson"
  },
];

const mockDocumentsData = [
  {
    id: 1,
    title: "Initial Assessment",
    type: "Intake Form",
    date: new Date("2023-03-10T10:30:00"),
    status: "Completed",
    author: "Dr. Emma Wilson",
  },
  {
    id: 2,
    title: "Treatment Plan",
    type: "Treatment Plan",
    date: new Date("2023-03-15T16:00:00"),
    status: "Completed",
    author: "Dr. Emma Wilson",
  },
  {
    id: 3,
    title: "Session Notes - March 15",
    type: "Progress Note",
    date: new Date("2023-03-15T16:00:00"),
    status: "Completed",
    author: "Dr. Emma Wilson",
  },
  {
    id: 4,
    title: "Session Notes - March 29",
    type: "Progress Note",
    date: new Date("2023-03-29T16:00:00"),
    status: "Completed",
    author: "Dr. Emma Wilson",
  },
  {
    id: 5,
    title: "Consent for Treatment",
    type: "Consent Form",
    date: new Date("2023-03-10T10:00:00"),
    status: "Signed",
    author: "System",
  },
  {
    id: 6,
    title: "Privacy Practices Acknowledgment",
    type: "Consent Form",
    date: new Date("2023-03-10T10:00:00"),
    status: "Signed",
    author: "System",
  },
  {
    id: 7,
    title: "Session Notes - April 5",
    type: "Progress Note",
    date: new Date("2023-04-05T16:00:00"),
    status: "In Progress",
    author: "Dr. Emma Wilson",
    awaitingSignature: true
  },
];

const mockPayments = [
  {
    id: 1,
    date: new Date("2023-03-15T16:30:00"),
    amount: 25,
    type: "Copay",
    status: "Completed",
    description: "Copay for session on March 15, 2023"
  },
  {
    id: 2,
    date: new Date("2023-03-29T16:30:00"),
    amount: 25,
    type: "Copay",
    status: "Completed",
    description: "Copay for session on March 29, 2023"
  },
  {
    id: 3,
    date: new Date("2023-04-05T16:30:00"),
    amount: 25,
    type: "Copay",
    status: "Completed",
    description: "Copay for session on April 5, 2023"
  },
  {
    id: 4,
    date: new Date("2023-04-15"),
    amount: 150,
    type: "Insurance Payment",
    status: "Pending",
    description: "Insurance payment for sessions in March"
  },
];

interface ClientDetailProps {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth?: Date;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  homePhone?: string;
  workPhone?: string;
  otherPhone?: string;
  address?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  timeZone?: string;
  status: string;
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
  balance?: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: Date;
  lastSession?: Date;
  nextSession?: Date | null;
  therapistId?: number;
  therapistName?: string;
  createdAt?: Date;
  sessionsAttended?: number;
  preferredPronouns?: string;
  onClose: () => void;
  onEdit: (clientData: any) => void;
}

export function ClientDetails(props: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDiagnosisDialog, setShowAddDiagnosisDialog] = useState(false);
  const [showAddMedicationDialog, setShowAddMedicationDialog] = useState(false);
  const navigate = useNavigate();
  
  // Cast to any to avoid potential client type mismatch
  const [clientData, setClientData] = useState<any>({
    ...props
  });
  
  const { toast } = useToast();
  
  const [sessionsData] = useState(mockSessionsData);
  const [documentsData] = useState(mockDocumentsData);
  const [paymentsData] = useState(mockPayments);
  const [isPortalEnabled, setIsPortalEnabled] = useState(false);
  const [showUploadDocumentDialog, setShowUploadDocumentDialog] = useState(false);
  const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false);

  const [documentType, setDocumentType] = useState("progress");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [diagnosisDescription, setDiagnosisDescription] = useState("");
  const [medication, setMedication] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdateClient = (data: any) => {
    // Here we would normally make an API call to update the client
    // For now, we're just updating the local state
    setClientData({
      ...clientData,
      ...data
    });
    
    setIsEditing(false);
    
    toast({
      title: "Client Updated",
      description: "Client information has been updated successfully.",
    });
    
    // Pass the updated data back to the parent component
    props.onEdit(data);
  };

  const handleCreateDocument = () => {
    setIsSubmitting(true);
    
    // Get the form type based on selection
    let formType = "";
    switch(documentType) {
      case "progress":
        formType = "progressNote";
        break;
      case "treatment":
        formType = "treatmentPlan";
        break;
      case "intake": 
        formType = "intake";
        break;
      case "consultation":
        formType = "consultation";
        break;
      case "discharge":
        formType = "discharge";
        break;
      default:
        formType = "progressNote";
    }
    
    // Close dialog and navigate to documentation page with client context
    setIsSubmitting(false);
    setShowCreateNoteDialog(false);
    
    navigate(`/documentation?formType=${formType}&clientId=${props.id}&clientName=${props.firstName} ${props.lastName}`);
  };

  const handleUploadDocument = () => {
    setIsSubmitting(true);
    
    // Close dialog and navigate to document upload page with client context
    setIsSubmitting(false);
    setShowUploadDocumentDialog(false);
    
    // Navigate to document upload page with client context
    navigate(`/documentation/upload?clientId=${props.id}&clientName=${props.firstName} ${props.lastName}`);
  };

  const handlePortalToggle = (value: boolean) => {
    setIsPortalEnabled(value);
    
    toast({
      title: value ? "Portal Access Enabled" : "Portal Access Disabled",
      description: value ? "Client portal access has been enabled." : "Client portal access has been disabled.",
    });
  };
  
  const handleAddDiagnosis = () => {
    setIsSubmitting(true);
    
    // In a real application, we would make an API call to save the diagnosis
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAddDiagnosisDialog(false);
      
      // Update local state with the new diagnosis
      if (diagnosisCode && diagnosisDescription) {
        setClientData({
          ...clientData,
          diagnosisCodes: [...(clientData.diagnosisCodes || []), 
            `${diagnosisCode}: ${diagnosisDescription}`]
        });
        
        // Reset the form fields
        setDiagnosisCode("");
        setDiagnosisDescription("");
        
        toast({
          title: "Diagnosis Added",
          description: "The diagnosis has been added to the client's record.",
        });
      }
    }, 1000);
  };
  
  const handleAddMedication = () => {
    setIsSubmitting(true);
    
    // In a real application, we would make an API call to save the medication
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAddMedicationDialog(false);
      
      // Update local state with the new medication
      if (medication) {
        const currentMeds = clientData.medicationList || "";
        const updatedMeds = currentMeds ? `${currentMeds}\n- ${medication}` : `- ${medication}`;
        
        setClientData({
          ...clientData,
          medicationList: updatedMeds
        });
        
        // Reset the form field
        setMedication("");
        
        toast({
          title: "Medication Added",
          description: "The medication has been added to the client's record.",
        });
      }
    }, 1000);
  };

  const calculateAge = (dob?: Date) => {
    if (!dob) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "inactive":
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
      case "new":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "onhold":
      case "on hold":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "discharged":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "signed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending signature":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  if (isEditing) {
    // Cast clientData to type 'any' to ensure it's accepted without type errors
    return (
      <div className="pt-6 pb-12">
        <ClientForm 
          client={clientData as any}
          onClose={() => setIsEditing(false)}
          onSubmit={handleUpdateClient}
        />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-12">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onClose}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/documentation/progress-notes?create=true&clientId=${props.id}&clientName=${props.firstName} ${props.lastName}`)}
                  className="gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FileSignature className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Note</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new clinical document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/scheduling?clientId=${props.id}&clientName=${props.firstName} ${props.lastName}`)}
                  className="gap-1 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Schedule an appointment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/billing?clientId=${props.id}&clientName=${props.firstName} ${props.lastName}`)}
                  className="gap-1 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Payment</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Process a payment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-1 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Client</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit client information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Client Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {props.firstName[0]}{props.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {props.firstName} {props.middleName ? props.middleName + ' ' : ''}{props.lastName}
              </h1>
              {props.preferredName && (
                <span className="text-gray-500 font-normal text-sm sm:text-base">
                  (Preferred: {props.preferredName})
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className={getStatusColor(props.status)}>
                {props.status}
              </Badge>
              {props.preferredPronouns && (
                <span className="text-sm text-gray-500">({props.preferredPronouns})</span>
              )}
              {props.dateOfBirth && (
                <span className="text-sm text-gray-500">
                  {calculateAge(props.dateOfBirth)} years old
                </span>
              )}
              {props.nextSession && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Calendar className="mr-1 h-3 w-3" />
                  Next: {format(props.nextSession, "MMM d")}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2 sm:mt-0">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <a href={`tel:${props.phone || props.mobilePhone}`} className="text-blue-600 hover:underline">
                {props.phone || props.mobilePhone || "No phone"}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <a href={`mailto:${props.email}`} className="text-blue-600 hover:underline">
                {props.email || "No email"}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <UserCircle2 className="h-4 w-4 mr-1.5 hidden sm:block" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            <Calendar className="h-4 w-4 mr-1.5 hidden sm:block" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <FileText className="h-4 w-4 mr-1.5 hidden sm:block" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="clinical" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
            <Brain className="h-4 w-4 mr-1.5 hidden sm:block" />
            Clinical
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            <CreditCard className="h-4 w-4 mr-1.5 hidden sm:block" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="portal" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
            <MessageCircle className="h-4 w-4 mr-1.5 hidden sm:block" />
            Portal
          </TabsTrigger>
        </TabsList>
        
        {/* Clinical Tab Content */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diagnoses Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-lg">
                    <ClipboardCheck className="mr-2 h-5 w-5 text-teal-600" />
                    Diagnoses
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 gap-1 text-teal-700 hover:bg-teal-100"
                    onClick={() => setShowAddDiagnosisDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Diagnosis</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {clientData.diagnosisCodes && clientData.diagnosisCodes.length > 0 ? (
                  <ul className="space-y-2">
                    {clientData.diagnosisCodes.map((diagnosis: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 p-2 rounded-md border border-gray-100 bg-gray-50">
                        <Badge variant="outline" className="bg-teal-100 text-teal-800 mt-0.5">
                          {diagnosis.split(':')[0]}
                        </Badge>
                        <span className="text-gray-700">
                          {diagnosis.split(':')[1]}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No diagnoses have been added yet.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowAddDiagnosisDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Diagnosis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Medications Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-lg">
                    <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
                    Medications
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 gap-1 text-emerald-700 hover:bg-emerald-100"
                    onClick={() => setShowAddMedicationDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Medication</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {clientData.medicationList ? (
                  <div className="whitespace-pre-wrap p-3 bg-gray-50 rounded-md border border-gray-100">
                    {clientData.medicationList}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No medications have been added yet.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowAddMedicationDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medication
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
      </Tabs>
      
      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <div className="relative group">
          <Button className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25">
            <PlusCircle className="h-6 w-6" />
          </Button>
          <div className="absolute hidden group-hover:flex flex-col items-end gap-2 bottom-16 right-0 mb-2">
            <Button size="sm" variant="outline" className="bg-white shadow-md px-3 py-2 h-auto">
              <FileText className="h-4 w-4 mr-2" />
              New Document
            </Button>
            <Button size="sm" variant="outline" className="bg-white shadow-md px-3 py-2 h-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
            <Button size="sm" variant="outline" className="bg-white shadow-md px-3 py-2 h-auto">
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Add Diagnosis Dialog */}
      <Dialog open={showAddDiagnosisDialog} onOpenChange={setShowAddDiagnosisDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Diagnosis</DialogTitle>
            <DialogDescription>
              Add a new diagnosis to the client's medical record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="diagnosisCode">Diagnosis Code</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select diagnosis code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F32.9">F32.9 - Major depressive disorder</SelectItem>
                  <SelectItem value="F41.1">F41.1 - Generalized anxiety disorder</SelectItem>
                  <SelectItem value="F43.1">F43.1 - Post-traumatic stress disorder</SelectItem>
                  <SelectItem value="F60.3">F60.3 - Borderline personality disorder</SelectItem>
                  <SelectItem value="F50.0">F50.0 - Anorexia nervosa</SelectItem>
                  <SelectItem value="F90.0">F90.0 - Attention-deficit hyperactivity disorder</SelectItem>
                  <SelectItem value="F42">F42 - Obsessive-compulsive disorder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosisDescription">Description</Label>
              <Input 
                id="diagnosisDescription" 
                placeholder="Enter diagnosis details or notes"
                value={diagnosisDescription}
                onChange={(e) => setDiagnosisDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosisDate">Date Diagnosed</Label>
              <Input 
                id="diagnosisDate" 
                type="date" 
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDiagnosisDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDiagnosis} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Diagnosis'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedicationDialog} onOpenChange={setShowAddMedicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>
              Add a new medication to the client's record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medicationName">Medication Name</Label>
              <Input 
                id="medicationName" 
                placeholder="Enter medication name"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" placeholder="e.g. 10mg, twice daily" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prescribedBy">Prescribed By</Label>
              <Input id="prescribedBy" placeholder="Name of prescribing provider" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicationNotes">Additional Notes</Label>
              <Textarea id="medicationNotes" placeholder="Side effects, special instructions, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMedicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedication} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Medication'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useNavigate() {
  const [_, navigate] = useLocation();
  return navigate;
}
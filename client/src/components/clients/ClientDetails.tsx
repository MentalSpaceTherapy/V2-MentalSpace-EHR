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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormItem,
} from "@/components/ui/form";

// Mock session types
const SESSION_TYPES = {
  INDIVIDUAL: "Individual Therapy",
  GROUP: "Group Therapy",
  FAMILY: "Family Therapy",
  COUPLE: "Couples Therapy",
  ASSESSMENT: "Assessment",
  INITIAL: "Initial Consultation",
};

// Mock client data structure
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

// Mock session data
interface SessionData {
  id: number;
  date: Date;
  type: string;
  duration: string;
  status: string;
  notes?: string;
  therapistName: string;
}

// Mock document data
interface DocumentData {
  id: number;
  title: string;
  type: string;
  date: Date;
  status: string;
  author: string;
  awaitingSignature?: boolean;
}

// Mock payment data
interface PaymentData {
  id: number;
  date: Date;
  amount: number;
  type: string;
  status: string;
  description: string;
}

// Mock sessions
const mockSessions: SessionData[] = [
  {
    id: 1,
    date: new Date("2023-07-10T14:00:00"),
    type: SESSION_TYPES.INDIVIDUAL,
    duration: "50 min",
    status: "Completed",
    notes: "Discussed anxiety management techniques. Client reported improved sleep.",
    therapistName: "Dr. Emma Johnson"
  },
  {
    id: 2,
    date: new Date("2023-07-17T14:00:00"),
    type: SESSION_TYPES.INDIVIDUAL,
    duration: "50 min",
    status: "Completed",
    notes: "Continued work on anxiety management. Client practicing breathing exercises.",
    therapistName: "Dr. Emma Johnson"
  },
  {
    id: 3,
    date: new Date("2023-07-24T14:00:00"),
    type: SESSION_TYPES.INDIVIDUAL,
    duration: "50 min",
    status: "Completed",
    notes: "Client reported significant improvement in anxiety symptoms.",
    therapistName: "Dr. Emma Johnson"
  },
  {
    id: 4,
    date: new Date("2023-07-31T14:00:00"),
    type: SESSION_TYPES.INDIVIDUAL,
    duration: "50 min",
    status: "Scheduled",
    therapistName: "Dr. Emma Johnson"
  }
];

// Mock documents
const mockDocuments: DocumentData[] = [
  {
    id: 1,
    title: "Intake Assessment",
    type: "Clinical",
    date: new Date("2023-06-20"),
    status: "Completed",
    author: "Dr. Emma Johnson"
  },
  {
    id: 2,
    title: "Treatment Plan",
    type: "Clinical",
    date: new Date("2023-06-25"),
    status: "Completed",
    author: "Dr. Emma Johnson"
  },
  {
    id: 3,
    title: "Progress Note",
    type: "Clinical",
    date: new Date("2023-07-10"),
    status: "Completed",
    author: "Dr. Emma Johnson"
  },
  {
    id: 4,
    title: "Progress Note",
    type: "Clinical",
    date: new Date("2023-07-17"),
    status: "Completed",
    author: "Dr. Emma Johnson"
  },
  {
    id: 5,
    title: "Progress Note",
    type: "Clinical",
    date: new Date("2023-07-24"),
    status: "In Progress",
    author: "Dr. Emma Johnson"
  },
  {
    id: 6,
    title: "Consent for Treatment",
    type: "Administrative",
    date: new Date("2023-06-20"),
    status: "Signed",
    author: "System"
  },
  {
    id: 7,
    title: "HIPAA Acknowledgment",
    type: "Administrative",
    date: new Date("2023-06-20"),
    status: "Signed",
    author: "System"
  },
  {
    id: 8,
    title: "Release of Information",
    type: "Administrative",
    date: new Date("2023-06-25"),
    status: "Pending Signature",
    author: "Dr. Emma Johnson",
    awaitingSignature: true
  }
];

// Mock payments
const mockPayments: PaymentData[] = [
  {
    id: 1,
    date: new Date("2023-07-10"),
    amount: 125.00,
    type: "Copay",
    status: "Paid",
    description: "Copay for session on 07/10/2023"
  },
  {
    id: 2,
    date: new Date("2023-07-17"),
    amount: 125.00,
    type: "Copay",
    status: "Paid",
    description: "Copay for session on 07/17/2023"
  },
  {
    id: 3,
    date: new Date("2023-07-24"),
    amount: 125.00,
    type: "Copay",
    status: "Paid",
    description: "Copay for session on 07/24/2023"
  },
  {
    id: 4,
    date: new Date("2023-07-31"),
    amount: 125.00,
    type: "Copay",
    status: "Pending",
    description: "Copay for upcoming session on 07/31/2023"
  }
];

export function ClientDetails(props: ClientDetailProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [clientData, setClientData] = useState(props);
  const [sessionsData] = useState(mockSessions);
  const [documentsData] = useState(mockDocuments);
  const [paymentsData] = useState(mockPayments);
  const [isPortalEnabled, setIsPortalEnabled] = useState(false);
  const [showUploadDocumentDialog, setShowUploadDocumentDialog] = useState(false);
  const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false);
  const [documentType, setDocumentType] = useState("progress");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd>{props.dateOfBirth ? format(props.dateOfBirth, "MMM d, yyyy") : "N/A"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Age</dt>
                    <dd>{props.dateOfBirth ? calculateAge(props.dateOfBirth) : "N/A"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Administrative Sex</dt>
                    <dd className="capitalize">{props.administrativeSex || "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Gender Identity</dt>
                    <dd className="capitalize">{props.genderIdentity ? props.genderIdentity.replace(/-/g, ' ') : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Pronouns</dt>
                    <dd>{props.preferredPronouns || "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Sexual Orientation</dt>
                    <dd className="capitalize">{props.sexualOrientation ? props.sexualOrientation.replace(/-/g, ' ') : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Race</dt>
                    <dd className="capitalize">{props.race ? props.race.replace(/-/g, ' ') : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Ethnicity</dt>
                    <dd className="capitalize">{props.ethnicity ? props.ethnicity.replace(/-/g, ' ') : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Preferred Language</dt>
                    <dd className="capitalize">{props.language || "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                    <dd className="capitalize">{props.maritalStatus || "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Employment</dt>
                    <dd className="capitalize">{props.employment ? props.employment.replace(/-/g, ' ') : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Referral Source</dt>
                    <dd className="capitalize">{props.referralSource ? props.referralSource.replace(/-/g, ' ') : "Not specified"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <Mail className="mr-2 h-5 w-5 text-indigo-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd>
                      {props.email ? (
                        <a href={`mailto:${props.email}`} className="text-blue-600 hover:underline">
                          {props.email}
                        </a>
                      ) : "N/A"}
                    </dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Mobile Phone</dt>
                    <dd>
                      {props.mobilePhone || props.phone ? (
                        <a href={`tel:${props.mobilePhone || props.phone}`} className="text-blue-600 hover:underline">
                          {props.mobilePhone || props.phone}
                        </a>
                      ) : "N/A"}
                    </dd>
                  </div>
                  
                  {props.homePhone && (
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Home Phone</dt>
                      <dd>
                        <a href={`tel:${props.homePhone}`} className="text-blue-600 hover:underline">
                          {props.homePhone}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {props.workPhone && (
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Work Phone</dt>
                      <dd>
                        <a href={`tel:${props.workPhone}`} className="text-blue-600 hover:underline">
                          {props.workPhone}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="whitespace-pre-wrap">
                      {props.address || 
                       (props.address1 ? 
                         `${props.address1}${props.address2 ? '\n' + props.address2 : ''}${props.city ? '\n' + props.city : ''}${props.state ? ', ' + props.state : ''}${props.zipCode ? ' ' + props.zipCode : ''}` 
                         : "N/A")}
                    </dd>
                  </div>
                  
                  {props.timeZone && (
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Time Zone</dt>
                      <dd className="capitalize">{props.timeZone.replace(/-/g, ' ')}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
            
            {/* Emergency Contact */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-red-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="mr-2 h-5 w-5 text-purple-600" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd>{props.emergencyContactName || "Not provided"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                    <dd className="capitalize">{props.emergencyContactRelationship ? props.emergencyContactRelationship.replace(/-/g, ' ') : "Not provided"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd>
                      {props.emergencyContactPhone ? (
                        <a href={`tel:${props.emergencyContactPhone}`} className="text-blue-600 hover:underline">
                          {props.emergencyContactPhone}
                        </a>
                      ) : "Not provided"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Insurance Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="mr-2 h-5 w-5 text-red-500" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Provider</dt>
                    <dd>{props.insuranceProvider || "Not provided"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Policy #</dt>
                    <dd>{props.insurancePolicyNumber || "Not provided"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Group #</dt>
                    <dd>{props.insuranceGroupNumber || "Not provided"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Copay</dt>
                    <dd>{props.insuranceCopay ? `$${props.insuranceCopay}` : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Deductible</dt>
                    <dd>{props.insuranceDeductible ? `$${props.insuranceDeductible}` : "Not specified"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Responsible Party</dt>
                    <dd className="capitalize">{props.responsibleParty || "Self"}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">Balance</dt>
                    <dd className={props.balance && props.balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                      ${props.balance?.toFixed(2) || '0.00'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Client Status */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-amber-600" />
                  Client Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Current Status Card */}
                  <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-500">Status</div>
                      <Badge variant="outline" className={getStatusColor(props.status)}>
                        {props.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Client Since</p>
                      <p className="text-gray-600">{props.createdAt ? format(props.createdAt, "MMMM d, yyyy") : "Unknown"}</p>
                    </div>
                  </div>
                  
                  {/* Upcoming Appointment Card */}
                  <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-2">Next Appointment</div>
                    {props.nextSession ? (
                      <div className="text-sm">
                        <p className="font-medium">{format(props.nextSession, "EEEE, MMMM d")}</p>
                        <p className="text-gray-600">{format(props.nextSession, "h:mm a")} - Individual Therapy</p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No upcoming appointments</div>
                    )}
                  </div>
                  
                  {/* Sessions Summary Card */}
                  <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-2">Sessions</div>
                    <div className="text-lg font-bold">{props.sessionsAttended || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Total sessions attended</div>
                    {props.lastSession && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last: {format(props.lastSession, "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Clinical Notes Preview */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Clinical Notes</h3>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileSignature className="h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm">
                    {props.notes || "No clinical notes have been added yet."}
                  </div>
                </div>
                
                {/* Consent Status */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Consent Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 rounded-md border">
                      <div className={`p-1.5 rounded-full mr-3 ${props.hipaaConsentSigned ? 'bg-green-100' : 'bg-amber-100'}`}>
                        {props.hipaaConsentSigned ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">HIPAA Consent</p>
                        <p className="text-xs text-gray-500">
                          {props.hipaaConsentSigned ? "Signed" : "Not signed"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-md border">
                      <div className={`p-1.5 rounded-full mr-3 ${props.consentForTreatmentSigned ? 'bg-green-100' : 'bg-amber-100'}`}>
                        {props.consentForTreatmentSigned ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Treatment Consent</p>
                        <p className="text-xs text-gray-500">
                          {props.consentForTreatmentSigned ? "Signed" : "Not signed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                  Session History
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Clock className="h-4 w-4" />
                    Schedule Session
                  </Button>
                  <Button size="sm" className="gap-1">
                    <FileSignature className="h-4 w-4" />
                    New Progress Note
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Session Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Sessions</div>
                  <div className="text-xl font-bold">{props.sessionsAttended || 0}</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">No-Shows</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Cancellations</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Last Session</div>
                  <div className="text-sm font-medium">
                    {props.lastSession ? format(props.lastSession, "MMM d, yyyy") : "N/A"}
                  </div>
                </div>
              </div>
              
              {/* Upcoming Session Alert */}
              {props.nextSession && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800">Upcoming Appointment</h3>
                        <p className="text-sm text-blue-700">
                          {format(props.nextSession, "EEEE, MMMM d, yyyy")} at {format(props.nextSession, "h:mm a")} - Individual Therapy
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center">
                      <Button size="sm" variant="outline" className="bg-white gap-1">
                        Reschedule
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 bg-white hover:text-red-700 gap-1">
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Session Table */}
              <div className="border rounded-md overflow-hidden mb-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Therapist
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionsData.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(session.date, "MMM d, yyyy")} at {format(session.date, "h:mm a")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge variant="outline" className={
                              session.status === "Completed" 
                                ? "bg-green-100 text-green-800" 
                                : session.status === "Cancelled" 
                                  ? "bg-red-100 text-red-800" 
                                  : session.status === "No-Show" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-blue-100 text-blue-800"
                            }>
                              {session.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.therapistName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {session.status === "Completed" ? (
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm">
                                  View Note
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Bill
                                </Button>
                              </div>
                            ) : session.status === "Scheduled" ? (
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                Showing most recent sessions
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="mr-2 h-5 w-5 text-green-600" />
                    Client Documents
                  </CardTitle>
                  <CardDescription>
                    View and manage all client documentation
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Dialog open={showCreateNoteDialog} onOpenChange={setShowCreateNoteDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <FileSignature className="h-4 w-4" />
                        Create Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Document</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="document-type" className="text-right">
                            Document Type
                          </Label>
                          <div className="col-span-3">
                            <Select
                              value={documentType}
                              onValueChange={setDocumentType}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="progress">Progress Note</SelectItem>
                                <SelectItem value="treatment">Treatment Plan</SelectItem>
                                <SelectItem value="intake">Intake Assessment</SelectItem>
                                <SelectItem value="consultation">Consultation Note</SelectItem>
                                <SelectItem value="discharge">Discharge Summary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateNoteDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateDocument} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : "Create Document"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showUploadDocumentDialog} onOpenChange={setShowUploadDocumentDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="border-2 border-dashed rounded-md p-6 flex flex-col justify-center items-center text-center">
                          <div className="p-3 bg-blue-50 rounded-full mb-3">
                            <Upload className="h-6 w-6 text-blue-600" />
                          </div>
                          <h4 className="font-medium text-gray-700 mb-1">Upload Document</h4>
                          <p className="text-sm text-gray-500 mb-3">
                            Drag and drop files here or click to browse
                          </p>
                          <Button variant="outline" size="sm">
                            Browse Files
                          </Button>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDocumentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUploadDocument} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : "Upload Document"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {documentsData.length > 0 ? (
                <>
                  {/* Document Type Filters */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="outline" size="sm" className="bg-white">
                      All Documents
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      Clinical
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      Administrative
                    </Button>
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      Billing
                    </Button>
                  </div>
                  
                  {/* Document List */}
                  <div className="border rounded-md overflow-hidden mb-2">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Document
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Author
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {documentsData.map((doc) => (
                            <tr key={doc.id} className={`hover:bg-gray-50 ${doc.awaitingSignature ? 'bg-amber-50' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                {doc.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(doc.date, "MMM d, yyyy")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.author}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge variant="outline" className={getDocumentStatusColor(doc.status)}>
                                  {doc.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" size="sm" className="h-8">
                                    View
                                  </Button>
                                  {doc.awaitingSignature && (
                                    <Button size="sm" className="h-8">
                                      Sign
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No documents found for this client.</p>
                  <p className="text-sm mt-1">Click "Create Document" to add treatment plans, progress notes, or other documentation.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Clinical Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 border-b">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-teal-600" />
                Clinical Information
              </CardTitle>
              <CardDescription>
                Diagnosis, medications, and clinical records
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Diagnosis Information */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Diagnosis Information</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Diagnosis
                  </Button>
                </div>
                
                {props.diagnosisCodes && props.diagnosisCodes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {props.diagnosisCodes.map((code, index) => (
                      <div key={index} className="p-4 rounded-md border">
                        <div className="flex items-start">
                          <div className="p-2 bg-green-100 rounded-md mr-3">
                            <ClipboardCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{code}</div>
                            <div className="text-sm text-gray-500">
                              {code === "F32.9" ? "Major Depressive Disorder" : 
                               code === "F41.1" ? "Generalized Anxiety Disorder" :
                               code === "F43.10" ? "Post-Traumatic Stress Disorder" :
                               code === "F60.3" ? "Borderline Personality Disorder" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                    <p>No diagnosis information has been recorded.</p>
                  </div>
                )}
              </div>
              
              {/* Medication Information */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Medication Information</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medication
                  </Button>
                </div>
                
                {props.medicationList ? (
                  <div className="p-4 bg-white rounded-md border">
                    <div className="whitespace-pre-wrap">
                      {props.medicationList}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                    <p>No medication information has been recorded.</p>
                  </div>
                )}
              </div>
              
              {/* Allergies */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Allergies and Adverse Reactions</h3>
                </div>
                
                {props.allergies ? (
                  <div className="p-4 bg-white rounded-md border">
                    <div className="whitespace-pre-wrap">
                      {props.allergies}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                    <p>No allergies or adverse reactions have been recorded.</p>
                  </div>
                )}
              </div>
              
              {/* Treatment Progress */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4">Treatment Progress</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Anxiety Management</h4>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Client has shown improvement in managing anxiety symptoms through mindfulness techniques.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Sleep Improvement</h4>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Achieved</Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Client has successfully established a healthy sleep routine and reports improved sleep quality.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="mr-2 h-5 w-5 text-amber-600" />
                    Billing Summary
                  </CardTitle>
                  <CardDescription>
                    Payment history and insurance claims
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <CreditCard className="h-4 w-4" />
                    Process Payment
                  </Button>
                  <Button size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Billing Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Current Balance</div>
                  <div className={`text-xl font-bold ${props.balance && props.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${props.balance?.toFixed(2) || '0.00'}
                  </div>
                  {props.balance && props.balance > 0 && (
                    <Button variant="outline" size="sm" className="mt-2 w-full text-sm">
                      Pay Balance
                    </Button>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Last Payment</div>
                  <div className="text-xl font-bold text-gray-700">
                    ${props.lastPaymentAmount?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {props.lastPaymentDate ? format(props.lastPaymentDate, "MMM d, yyyy") : "No payments"}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Insurance</div>
                  <div className="text-base font-medium text-gray-700 truncate">
                    {props.insuranceProvider || "Self-Pay"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {props.insuranceCopay ? `$${props.insuranceCopay} copay` : "No copay information"}
                  </div>
                </div>
              </div>
              
              {/* Billing Tabs */}
              <Tabs defaultValue="transactions" className="w-full mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="transactions">
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="claims">
                    Insurance Claims
                  </TabsTrigger>
                  <TabsTrigger value="statements">
                    Statements
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactions" className="mt-4">
                  {paymentsData.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paymentsData.map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {format(payment.date, "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {payment.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {payment.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <Badge variant="outline" className={
                                    payment.status === "Paid" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-amber-100 text-amber-800"
                                  }>
                                    {payment.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                  ${payment.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button variant="outline" size="sm">
                                    Receipt
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>No payment history available.</p>
                      <p className="text-sm mt-1">Payment records will appear here when available.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="claims" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No insurance claims found.</p>
                    <p className="text-sm mt-1">Insurance claim records will appear here when available.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="statements" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No statements found.</p>
                    <p className="text-sm mt-1">Client statements will appear here when generated.</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Billing Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Billing Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Responsible Party</h4>
                        <p className="text-sm text-gray-500 mt-1 capitalize">
                          {props.responsibleParty ? props.responsibleParty.replace(/-/g, ' ') : "Self (Client)"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Payment Method</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          No payment method on file
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                
                {props.billingNotes && (
                  <div className="p-4 rounded-md border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Billing Notes</h4>
                      <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{props.billingNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Portal Tab */}
        <TabsContent value="portal" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b">
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="mr-2 h-5 w-5 text-sky-600" />
                Client Portal Access
              </CardTitle>
              <CardDescription>
                Manage client portal access and shared documents
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Portal Access Controls */}
                <div className="p-6 bg-white rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-sky-100 rounded-full">
                        <UserCircle2 className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Client Portal</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {isPortalEnabled 
                            ? "Client has access to their secure portal" 
                            : "Client does not have portal access"}
                        </p>
                        {isPortalEnabled && (
                          <div className="text-sm text-gray-600 mt-3">
                            <p>Portal Login: {props.email}</p>
                            <p className="mt-1">Last login: Never</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="portal-access" className={isPortalEnabled ? "text-sky-700" : "text-gray-500"}>
                        {isPortalEnabled ? "Enabled" : "Disabled"}
                      </Label>
                      <Switch
                        id="portal-access"
                        checked={isPortalEnabled}
                        onCheckedChange={handlePortalToggle}
                      />
                    </div>
                  </div>
                  
                  {isPortalEnabled && (
                    <div className="mt-6 flex gap-3">
                      <Button variant="outline" size="sm">
                        Reset Password
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Revoke Access
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Portal Features */}
                {isPortalEnabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-md border flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-green-100 rounded-md mr-3">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="font-medium">Document Sharing</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          Share documents securely with your client through the portal.
                        </p>
                        <Button size="sm">
                          Share Documents
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-white rounded-md border flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-purple-100 rounded-md mr-3">
                            <MessageCircle className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="font-medium">Secure Messaging</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          Send and receive secure messages with your client.
                        </p>
                        <Button size="sm" variant="outline">
                          View Messages
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-white rounded-md border flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-amber-100 rounded-md mr-3">
                            <ClipboardCheck className="h-5 w-5 text-amber-600" />
                          </div>
                          <h3 className="font-medium">Forms & Questionnaires</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          Send forms and assessments for the client to complete.
                        </p>
                        <Button size="sm" variant="outline">
                          Manage Forms
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pending Portal Items */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-4">Portal Documents Awaiting Action</h3>
                      
                      <div className="border rounded-md overflow-hidden mb-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sent
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                  Consent for Treatment
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(), "MMM d, yyyy")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge className="bg-amber-100 text-amber-800">
                                  Awaiting Signature
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                  Remind
                                </Button>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                  Client Information Form
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(), "MMM d, yyyy")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge className="bg-amber-100 text-amber-800">
                                  Form Incomplete
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                  Remind
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Client Communication Preferences */}
                    <div className="p-6 bg-white rounded-md border">
                      <h3 className="font-medium text-gray-700 mb-4">Communication Preferences</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Switch 
                            id="email-notifications" 
                            checked={props.consentForCommunication?.includes("email")} 
                          />
                          <div>
                            <Label htmlFor="email-notifications" className="font-medium">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Send appointment reminders and portal notifications via email
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Switch 
                            id="sms-notifications" 
                            checked={props.consentForCommunication?.includes("sms")} 
                          />
                          <div>
                            <Label htmlFor="sms-notifications" className="font-medium">
                              SMS Text Messages
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Send appointment reminders via text message
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
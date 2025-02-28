import { useState } from "react";
import { format } from "date-fns";
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
  AlertCircle
} from "lucide-react";
import { ClientForm } from "./ClientForm";
import { useToast } from "@/hooks/use-toast";

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
  dateOfBirth?: Date;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  preferredPronouns?: string;
  notes?: string;
  balance?: number;
  lastSession?: Date;
  nextSession?: Date | null;
  therapistId?: number;
  therapistName?: string;
  createdAt?: Date;
  sessionsAttended?: number;
  diagnosisCodes?: string[];
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

export function ClientDetails(props: ClientDetailProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [clientData, setClientData] = useState(props);

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

  const calculateAge = (dob?: Date) => {
    if (!dob) return "N/A";
    return new Date().getFullYear() - dob.getFullYear();
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
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "discharged":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  if (isEditing) {
    return (
      <div className="pt-6 pb-12">
        <ClientForm 
          client={clientData}
          onClose={() => setIsEditing(false)}
          onSubmit={handleUpdateClient}
        />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-12">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onClose}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        <Button 
          variant="outline"
          onClick={handleEdit}
          className="gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit Client
        </Button>
      </div>
      
      {/* Client Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
            {props.firstName[0]}{props.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{props.firstName} {props.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getStatusColor(props.status)}>
                {props.status}
              </Badge>
              {props.preferredPronouns && (
                <span className="text-sm text-gray-500">({props.preferredPronouns})</span>
              )}
              {props.dateOfBirth && (
                <span className="text-sm text-gray-500">
                  {calculateAge(props.dateOfBirth)} years
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            Documents
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            Billing
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
                <dl className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Date of Birth</div>
                  <div className="col-span-2">{props.dateOfBirth ? format(props.dateOfBirth, "PPP") : "N/A"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Pronouns</div>
                  <div className="col-span-2">{props.preferredPronouns || "Not specified"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Status</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className={getStatusColor(props.status)}>
                      {props.status}
                    </Badge>
                  </div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Client Since</div>
                  <div className="col-span-2">{props.createdAt ? format(props.createdAt, "PPP") : "N/A"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Sessions</div>
                  <div className="col-span-2">{props.sessionsAttended || 0} attended</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Primary Therapist</div>
                  <div className="col-span-2">{props.therapistName || "Not assigned"}</div>
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
                <dl className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Email</div>
                  <div className="col-span-2">
                    {props.email ? (
                      <a href={`mailto:${props.email}`} className="text-blue-600 hover:underline">
                        {props.email}
                      </a>
                    ) : "N/A"}
                  </div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Phone</div>
                  <div className="col-span-2">
                    {props.phone ? (
                      <a href={`tel:${props.phone}`} className="text-blue-600 hover:underline">
                        {props.phone}
                      </a>
                    ) : "N/A"}
                  </div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Address</div>
                  <div className="col-span-2 whitespace-pre-wrap">{props.address || "N/A"}</div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Emergency Contact */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-red-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="mr-2 h-5 w-5 text-purple-600" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Name</div>
                  <div className="col-span-2">{props.emergencyContactName || "Not provided"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Phone</div>
                  <div className="col-span-2">
                    {props.emergencyContactPhone ? (
                      <a href={`tel:${props.emergencyContactPhone}`} className="text-blue-600 hover:underline">
                        {props.emergencyContactPhone}
                      </a>
                    ) : "Not provided"}
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
                <dl className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Provider</div>
                  <div className="col-span-2">{props.insuranceProvider || "Not provided"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Policy #</div>
                  <div className="col-span-2">{props.insurancePolicyNumber || "Not provided"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Group #</div>
                  <div className="col-span-2">{props.insuranceGroupNumber || "Not provided"}</div>
                  
                  <div className="col-span-1 font-medium text-gray-500">Balance</div>
                  <div className="col-span-2">
                    {props.balance !== undefined && props.balance > 0 ? (
                      <span className="text-red-600 font-medium">${props.balance.toFixed(2)}</span>
                    ) : (
                      <span className="text-green-600 font-medium">${props.balance?.toFixed(2) || '0.00'}</span>
                    )}
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Notes */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-amber-600" />
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 bg-gray-50 rounded-md min-h-[150px] whitespace-pre-wrap">
                  {props.notes || "No clinical notes have been added yet."}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="ml-auto">
                  <FileSignature className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming Appointments */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <div className="flex justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                    Upcoming Appointments
                  </CardTitle>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Clock className="h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {props.nextSession ? (
                  <div className="p-4 bg-gray-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 mr-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(props.nextSession, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(props.nextSession, "h:mm a")} - Individual Therapy
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        Reschedule
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 gap-1">
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No upcoming appointments scheduled.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                  Session History
                </CardTitle>
                <Button size="sm">
                  Schedule New Session
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border rounded-md overflow-hidden">
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
                    {mockSessions.map((session) => (
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
                            <Button variant="link" size="sm" className="text-indigo-600 hover:text-indigo-800">
                              View Note
                            </Button>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
              <div className="flex justify-between">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-green-600" />
                  Client Documents
                </CardTitle>
                <Button size="sm">
                  Create New Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No documents found for this client.</p>
                <p className="text-sm mt-1">Click "Create New Document" to add treatment plans, progress notes, or other documentation.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <div className="flex justify-between">
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="mr-2 h-5 w-5 text-amber-600" />
                  Billing Summary
                </CardTitle>
                <Button size="sm">
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Current Balance</div>
                  <div className={`text-xl font-bold ${props.balance && props.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${props.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Last Payment</div>
                  <div className="text-xl font-bold text-gray-700">$125.00</div>
                  <div className="text-xs text-gray-500 mt-1">July 3, 2023</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Insurance Status</div>
                  <div className="text-xl font-bold text-gray-700">
                    {props.insuranceProvider ? "Verified" : "No Insurance"}
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No billing history available.</p>
                <p className="text-sm mt-1">Invoices and payment records will appear here when available.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
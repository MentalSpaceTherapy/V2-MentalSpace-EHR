import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, 
  Save, 
  RefreshCw, 
  X,
  User,
  Mail,
  Phone,
  Home,
  Calendar as CalendarIcon2,
  FileText,
  CreditCard,
  ClipboardCheck,
  Brain,
  UserCircle2,
  Briefcase,
  Upload,
  CheckCircle2,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { InsertClient } from "@shared/schema";

// Enhanced schema with additional validations
const clientSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal("")),
  preferredName: z.string().optional().or(z.literal("")),
  dateOfBirth: z.date().optional(),
  administrativeSex: z.enum(["male", "female", "unknown", ""]).optional(),
  genderIdentity: z.string().optional().or(z.literal("")),
  sexualOrientation: z.string().optional().or(z.literal("")),
  preferredPronouns: z.string().optional().or(z.literal("")),
  race: z.string().optional().or(z.literal("")),
  ethnicity: z.string().optional().or(z.literal("")),
  language: z.string().optional().or(z.literal("")),
  maritalStatus: z.string().optional().or(z.literal("")),
  
  // Contact Information
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobilePhone: z.string().optional().or(z.literal("")),
  homePhone: z.string().optional().or(z.literal("")),
  workPhone: z.string().optional().or(z.literal("")),
  otherPhone: z.string().optional().or(z.literal("")),
  address1: z.string().optional().or(z.literal("")),
  address2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  timeZone: z.string().optional().or(z.literal("")),
  
  // Client Status
  status: z.string().default("active"),
  primaryTherapistId: z.number().optional(),
  referralSource: z.string().optional().or(z.literal("")),
  employment: z.string().optional().or(z.literal("")),
  
  // Emergency Contact
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  emergencyContactRelationship: z.string().optional().or(z.literal("")),
  
  // Insurance Information
  insuranceProvider: z.string().optional().or(z.literal("")),
  insurancePolicyNumber: z.string().optional().or(z.literal("")),
  insuranceGroupNumber: z.string().optional().or(z.literal("")),
  insuranceCopay: z.string().optional().or(z.literal("")),
  insuranceDeductible: z.string().optional().or(z.literal("")),
  responsibleParty: z.string().optional().or(z.literal("self")),
  
  // Clinical Information 
  diagnosisCodes: z.array(z.string()).optional(),
  medicationList: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  smokingStatus: z.string().optional().or(z.literal("")),
  
  // Consent & Privacy
  hipaaConsentSigned: z.boolean().optional(),
  consentForTreatmentSigned: z.boolean().optional(),
  consentForCommunication: z.array(z.string()).optional(),
  
  // General Notes
  notes: z.string().optional().or(z.literal("")),
  billingNotes: z.string().optional().or(z.literal("")),
  privateNotes: z.string().optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Partial<ClientFormValues> & { 
    id?: number;
    phone?: string; 
    address?: string;
  };
  onClose: () => void;
  onSubmit: (data: ClientFormValues) => void;
  isLoading?: boolean;
}

export function ClientForm({ client, onClose, onSubmit, isLoading = false }: ClientFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Initialize form with default values or existing client data
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      // Personal Information
      firstName: client?.firstName || "",
      lastName: client?.lastName || "",
      middleName: client?.middleName || "",
      preferredName: client?.preferredName || "",
      dateOfBirth: client?.dateOfBirth,
      administrativeSex: client?.administrativeSex || undefined,
      genderIdentity: client?.genderIdentity || "",
      sexualOrientation: client?.sexualOrientation || "",
      preferredPronouns: client?.preferredPronouns || "",
      race: client?.race || "",
      ethnicity: client?.ethnicity || "",
      language: client?.language || "",
      maritalStatus: client?.maritalStatus || "",
      
      // Contact Information
      email: client?.email || "",
      mobilePhone: client?.mobilePhone || client?.phone || "",
      homePhone: client?.homePhone || "",
      workPhone: client?.workPhone || "",
      otherPhone: client?.otherPhone || "",
      address1: client?.address1 || (client?.address ? client.address.split('\n')[0] : ""),
      address2: client?.address2 || "",
      city: client?.city || "",
      state: client?.state || "",
      zipCode: client?.zipCode || "",
      timeZone: client?.timeZone || "",
      
      // Client Status
      status: client?.status || "active",
      primaryTherapistId: client?.primaryTherapistId,
      referralSource: client?.referralSource || "",
      employment: client?.employment || "",
      
      // Emergency Contact
      emergencyContactName: client?.emergencyContactName || "",
      emergencyContactPhone: client?.emergencyContactPhone || "",
      emergencyContactRelationship: client?.emergencyContactRelationship || "",
      
      // Insurance Information
      insuranceProvider: client?.insuranceProvider || "",
      insurancePolicyNumber: client?.insurancePolicyNumber || "",
      insuranceGroupNumber: client?.insuranceGroupNumber || "",
      insuranceCopay: client?.insuranceCopay || "",
      insuranceDeductible: client?.insuranceDeductible || "",
      responsibleParty: client?.responsibleParty || "self",
      
      // Clinical Information
      diagnosisCodes: client?.diagnosisCodes || [],
      medicationList: client?.medicationList || "",
      allergies: client?.allergies || "",
      smokingStatus: client?.smokingStatus || "",
      
      // Consent & Privacy
      hipaaConsentSigned: client?.hipaaConsentSigned || false,
      consentForTreatmentSigned: client?.consentForTreatmentSigned || false,
      consentForCommunication: client?.consentForCommunication || ["email", "phone"],
      
      // General Notes
      notes: client?.notes || "",
      billingNotes: client?.billingNotes || "",
      privateNotes: client?.privateNotes || "",
    },
  });

  const handleSubmit = (data: ClientFormValues) => {
    setSubmitting(true);
    
    try {
      // Reconstruct full address from components if needed for backward compatibility
      const fullData = {
        ...data,
        phone: data.mobilePhone, // For backward compatibility
        address: `${data.address1}${data.address2 ? '\n' + data.address2 : ''}${data.city ? '\n' + data.city : ''}${data.state ? ', ' + data.state : ''}${data.zipCode ? ' ' + data.zipCode : ''}`,
      };
      
      onSubmit(fullData as ClientFormValues);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving the client data.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {client?.id ? "Edit Client" : "New Client"}
          </h1>
          <p className="text-gray-600 mt-1">
            {client?.id ? "Update client information" : "Add a new client to your practice"}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="rounded-full hover:bg-neutral-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              <TabsTrigger value="personal" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-1 items-center">
                <UserCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline-block">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 flex gap-1 items-center">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline-block">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 flex gap-1 items-center">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline-block">Emergency</span>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 flex gap-1 items-center">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline-block">Insurance</span>
              </TabsTrigger>
              <TabsTrigger value="clinical" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 flex gap-1 items-center">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline-block">Clinical</span>
              </TabsTrigger>
              <TabsTrigger value="consent" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 flex gap-1 items-center">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline-block">Consent</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Client demographic information</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Preferred name or nickname" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMM d, yyyy")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="administrativeSex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administrative Sex</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue=""
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select administrative sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select administrative sex</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="genderIdentity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender Identity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender identity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select gender identity</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="transgender-male">Transgender Male</SelectItem>
                            <SelectItem value="transgender-female">Transgender Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="decline">Decline to state</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sexualOrientation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexual Orientation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sexual orientation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select sexual orientation</SelectItem>
                            <SelectItem value="straight">Straight/Heterosexual</SelectItem>
                            <SelectItem value="gay">Gay</SelectItem>
                            <SelectItem value="lesbian">Lesbian</SelectItem>
                            <SelectItem value="bisexual">Bisexual</SelectItem>
                            <SelectItem value="pansexual">Pansexual</SelectItem>
                            <SelectItem value="asexual">Asexual</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="decline">Decline to state</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredPronouns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Pronouns</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pronouns" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select pronouns</SelectItem>
                            <SelectItem value="she/her">she/her</SelectItem>
                            <SelectItem value="he/him">he/him</SelectItem>
                            <SelectItem value="they/them">they/them</SelectItem>
                            <SelectItem value="she/they">she/they</SelectItem>
                            <SelectItem value="he/they">he/they</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select race" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select race</SelectItem>
                            <SelectItem value="american-indian">American Indian or Alaska Native</SelectItem>
                            <SelectItem value="asian">Asian</SelectItem>
                            <SelectItem value="black">Black or African American</SelectItem>
                            <SelectItem value="native-hawaiian">Native Hawaiian or Pacific Islander</SelectItem>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="multiracial">Multiracial</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="decline">Decline to state</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ethnicity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethnicity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ethnicity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select ethnicity</SelectItem>
                            <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                            <SelectItem value="not-hispanic">Not Hispanic or Latino</SelectItem>
                            <SelectItem value="decline">Decline to state</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select language</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                            <SelectItem value="tagalog">Tagalog</SelectItem>
                            <SelectItem value="vietnamese">Vietnamese</SelectItem>
                            <SelectItem value="arabic">Arabic</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select marital status</SelectItem>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="partnered">Partnered</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="separated">Separated</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "active"}
                          defaultValue="active"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="onHold">On Hold</SelectItem>
                            <SelectItem value="discharged">Discharged</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current status of the client in your practice
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How did they find you?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select referral source</SelectItem>
                            <SelectItem value="insurance">Insurance Provider</SelectItem>
                            <SelectItem value="doctor">Doctor Referral</SelectItem>
                            <SelectItem value="therapist">Another Therapist</SelectItem>
                            <SelectItem value="friend">Friend or Family</SelectItem>
                            <SelectItem value="online">Online Search</SelectItem>
                            <SelectItem value="psychology-today">Psychology Today</SelectItem>
                            <SelectItem value="social-media">Social Media</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select employment status</SelectItem>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="self-employed">Self-employed</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="unable-to-work">Unable to work</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-indigo-600" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Client contact details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="client@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for appointment reminders and portal access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mobilePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="homePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="workPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="otherPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address 1</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt #123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="">Select state</SelectItem>
                            <SelectItem value="AL">Alabama</SelectItem>
                            <SelectItem value="AK">Alaska</SelectItem>
                            <SelectItem value="AZ">Arizona</SelectItem>
                            <SelectItem value="AR">Arkansas</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="CO">Colorado</SelectItem>
                            <SelectItem value="CT">Connecticut</SelectItem>
                            <SelectItem value="DE">Delaware</SelectItem>
                            <SelectItem value="DC">District of Columbia</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="GA">Georgia</SelectItem>
                            <SelectItem value="HI">Hawaii</SelectItem>
                            <SelectItem value="ID">Idaho</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="IN">Indiana</SelectItem>
                            <SelectItem value="IA">Iowa</SelectItem>
                            <SelectItem value="KS">Kansas</SelectItem>
                            <SelectItem value="KY">Kentucky</SelectItem>
                            <SelectItem value="LA">Louisiana</SelectItem>
                            <SelectItem value="ME">Maine</SelectItem>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="MA">Massachusetts</SelectItem>
                            <SelectItem value="MI">Michigan</SelectItem>
                            <SelectItem value="MN">Minnesota</SelectItem>
                            <SelectItem value="MS">Mississippi</SelectItem>
                            <SelectItem value="MO">Missouri</SelectItem>
                            <SelectItem value="MT">Montana</SelectItem>
                            <SelectItem value="NE">Nebraska</SelectItem>
                            <SelectItem value="NV">Nevada</SelectItem>
                            <SelectItem value="NH">New Hampshire</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="NM">New Mexico</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="NC">North Carolina</SelectItem>
                            <SelectItem value="ND">North Dakota</SelectItem>
                            <SelectItem value="OH">Ohio</SelectItem>
                            <SelectItem value="OK">Oklahoma</SelectItem>
                            <SelectItem value="OR">Oregon</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="RI">Rhode Island</SelectItem>
                            <SelectItem value="SC">South Carolina</SelectItem>
                            <SelectItem value="SD">South Dakota</SelectItem>
                            <SelectItem value="TN">Tennessee</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="UT">Utah</SelectItem>
                            <SelectItem value="VT">Vermont</SelectItem>
                            <SelectItem value="VA">Virginia</SelectItem>
                            <SelectItem value="WA">Washington</SelectItem>
                            <SelectItem value="WV">West Virginia</SelectItem>
                            <SelectItem value="WI">Wisconsin</SelectItem>
                            <SelectItem value="WY">Wyoming</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Zone</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select time zone</SelectItem>
                            <SelectItem value="eastern">Eastern (EST/EDT)</SelectItem>
                            <SelectItem value="central">Central (CST/CDT)</SelectItem>
                            <SelectItem value="mountain">Mountain (MST/MDT)</SelectItem>
                            <SelectItem value="pacific">Pacific (PST/PDT)</SelectItem>
                            <SelectItem value="alaska">Alaska (AKST/AKDT)</SelectItem>
                            <SelectItem value="hawaii">Hawaii (HST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Important for scheduling telehealth sessions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Emergency Contact Tab */}
            <TabsContent value="emergency" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-red-50 border-b">
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-purple-600" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>Who to contact in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Client</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select relationship</SelectItem>
                            <SelectItem value="spouse">Spouse/Partner</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other-family">Other Family Member</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardHeader className="border-t border-b mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center text-base">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-600" />
                    Crisis Plan
                  </CardTitle>
                  <CardDescription>Emergency response information</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2">Crisis Planning Information</h4>
                      <p className="text-sm text-amber-700">
                        Consider adding crisis-specific details for this client, such as warning signs, coping strategies,
                        safety planning, and resources they can access when in distress.
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="privateNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crisis Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add any safety planning information or crisis protocol specific to this client"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include any specific warning signs, triggers, or safety protocols. This information is only visible to providers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-white rounded-md border flex items-start space-x-3">
                        <div className="p-2 bg-red-100 rounded-md">
                          <Phone className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Crisis Hotline</h4>
                          <p className="text-sm text-gray-500">988 Suicide & Crisis Lifeline</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white rounded-md border flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-md">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Nearest Emergency Room</h4>
                          <p className="text-sm text-gray-500">Locate nearest ER</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Insurance Information Tab */}
            <TabsContent value="insurance" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 border-b">
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-red-500" />
                    Insurance & Billing Information
                  </CardTitle>
                  <CardDescription>Client's insurance details and billing preferences</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select insurance provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Select insurance provider</SelectItem>
                            <SelectItem value="aetna">Aetna</SelectItem>
                            <SelectItem value="anthem">Anthem</SelectItem>
                            <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                            <SelectItem value="cigna">Cigna</SelectItem>
                            <SelectItem value="humana">Humana</SelectItem>
                            <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
                            <SelectItem value="medicare">Medicare</SelectItem>
                            <SelectItem value="medicaid">Medicaid</SelectItem>
                            <SelectItem value="tricare">Tricare</SelectItem>
                            <SelectItem value="uhc">UnitedHealthcare</SelectItem>
                            <SelectItem value="optum">Optum</SelectItem>
                            <SelectItem value="magellan">Magellan</SelectItem>
                            <SelectItem value="beacon">Beacon Health Options</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="self-pay">Self-Pay</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select "Self-Pay" if the client is not using insurance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="insurancePolicyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member/Policy ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Policy/Member ID number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="insuranceGroupNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Group Number (if applicable)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="insuranceCopay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Co-pay Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                            <Input placeholder="0.00" {...field} className="pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="insuranceDeductible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deductible</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                            <Input placeholder="0.00" {...field} className="pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="responsibleParty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsible Party for Billing</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "self"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Who is responsible for payment?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="self">Self (Client)</SelectItem>
                            <SelectItem value="parent">Parent/Guardian</SelectItem>
                            <SelectItem value="spouse">Spouse/Partner</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardHeader className="border-t border-b mt-6 bg-gradient-to-r from-amber-50 to-yellow-50">
                  <CardTitle className="flex items-center text-base">
                    <FileText className="mr-2 h-5 w-5 text-amber-600" />
                    Billing Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="billingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special billing instructions or payment arrangements"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add any specific billing information, payment arrangements, or financial assistance details
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardHeader className="border-t border-b mt-6 bg-gradient-to-r from-yellow-50 to-green-50">
                  <CardTitle className="flex items-center text-base">
                    <Upload className="mr-2 h-5 w-5 text-green-600" />
                    Insurance Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col justify-center items-center text-center">
                    <div className="p-3 bg-green-50 rounded-full mb-3">
                      <Upload className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-700 mb-1">Upload Insurance Card Images</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload front and back of the insurance card (PDF, JPG, or PNG)
                    </p>
                    <Button variant="outline" size="sm" type="button">
                      Upload Insurance Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Clinical Information Tab */}
            <TabsContent value="clinical" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-green-600" />
                    Clinical Information
                  </CardTitle>
                  <CardDescription>Medical and mental health history</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Diagnosis Information</h3>
                    <div className="p-4 bg-green-50 rounded-md border border-green-200">
                      <p className="text-sm text-green-700">
                        You can add ICD-10 diagnosis codes for this client. Common mental health diagnoses include:
                      </p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="text-green-800">F32.9 - Major Depressive Disorder</div>
                        <div className="text-green-800">F41.1 - Generalized Anxiety Disorder</div>
                        <div className="text-green-800">F43.10 - Post-Traumatic Stress Disorder</div>
                        <div className="text-green-800">F60.3 - Borderline Personality Disorder</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Placeholder for diagnosis codes - in a real app, this would be a multi-select or searchable component */}
                      <FormField
                        control={form.control}
                        name="diagnosisCodes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Diagnosis</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange([value])}
                              value={field.value?.[0] || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select primary diagnosis" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Select diagnosis</SelectItem>
                                <SelectItem value="F32.9">F32.9 - Major Depressive Disorder</SelectItem>
                                <SelectItem value="F41.1">F41.1 - Generalized Anxiety Disorder</SelectItem>
                                <SelectItem value="F43.10">F43.10 - Post-Traumatic Stress Disorder</SelectItem>
                                <SelectItem value="F60.3">F60.3 - Borderline Personality Disorder</SelectItem>
                                <SelectItem value="F90.0">F90.0 - ADHD, Predominantly Inattentive Type</SelectItem>
                                <SelectItem value="F42">F42 - Obsessive-Compulsive Disorder</SelectItem>
                                <SelectItem value="F31.9">F31.9 - Bipolar Disorder</SelectItem>
                                <SelectItem value="F20.9">F20.9 - Schizophrenia</SelectItem>
                                <SelectItem value="F50.0">F50.0 - Anorexia Nervosa</SelectItem>
                                <SelectItem value="F50.2">F50.2 - Bulimia Nervosa</SelectItem>
                                <SelectItem value="Z03.89">Z03.89 - No Diagnosis / Rule Out</SelectItem>
                                <SelectItem value="OTHER">Other (specify in notes)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-700">Medication Information</h3>
                    <FormField
                      control={form.control}
                      name="medicationList"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Medications</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List all current medications, dosages, and prescribing providers"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include psychiatric and non-psychiatric medications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergies and Adverse Reactions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any known allergies, medication reactions, or sensitivities"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-700">Health Information</h3>
                    <FormField
                      control={form.control}
                      name="smokingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Smoking Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select smoking status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Select status</SelectItem>
                              <SelectItem value="current">Current Smoker</SelectItem>
                              <SelectItem value="former">Former Smoker</SelectItem>
                              <SelectItem value="never">Never Smoked</SelectItem>
                              <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-700">Clinical Notes</h3>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>General Clinical Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Clinical observations, treatment history, or other relevant information"
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Note: Information entered here will be visible in the clinical record
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Consent & Privacy Tab */}
            <TabsContent value="consent" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                  <CardTitle className="flex items-center">
                    <ClipboardCheck className="mr-2 h-5 w-5 text-amber-600" />
                    Consent & Privacy
                  </CardTitle>
                  <CardDescription>Documentation of client consent and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Required Consent Forms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="hipaaConsentSigned"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                HIPAA Notice of Privacy Practices
                              </FormLabel>
                              <FormDescription>
                                Client has received and signed the HIPAA Privacy Notice
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="consentForTreatmentSigned"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Informed Consent for Treatment
                              </FormLabel>
                              <FormDescription>
                                Client has provided informed consent for treatment
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-700">Communication Preferences</h3>
                    <p className="text-sm text-gray-500">
                      Select the approved methods for contacting this client
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="consentForCommunication"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name="consentForCommunication"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key="email"
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes("email")}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], "email"])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== "email"
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>
                                        Email Communication
                                      </FormLabel>
                                      <FormDescription>
                                        Appointment reminders, portal notifications
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                            
                            <FormField
                              control={form.control}
                              name="consentForCommunication"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key="phone"
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes("phone")}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], "phone"])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== "phone"
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>
                                        Phone Communication
                                      </FormLabel>
                                      <FormDescription>
                                        Phone calls and voicemails
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                            
                            <FormField
                              control={form.control}
                              name="consentForCommunication"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key="sms"
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes("sms")}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], "sms"])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== "sms"
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>
                                        Text Message (SMS)
                                      </FormLabel>
                                      <FormDescription>
                                        Appointment reminders via text
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                            
                            <FormField
                              control={form.control}
                              name="consentForCommunication"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key="portal"
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes("portal")}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], "portal"])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== "portal"
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>
                                        Client Portal
                                      </FormLabel>
                                      <FormDescription>
                                        Secure messaging through portal
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-700">Document Management</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-md">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Notice of Privacy Practices</h4>
                            <p className="text-sm text-gray-500">HIPAA compliance document</p>
                          </div>
                        </div>
                        <Button variant="outline" type="button" size="sm">Upload</Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-md">
                            <ClipboardCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Consent for Treatment</h4>
                            <p className="text-sm text-gray-500">Treatment authorization</p>
                          </div>
                        </div>
                        <Button variant="outline" type="button" size="sm">Upload</Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-md">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Release of Information</h4>
                            <p className="text-sm text-gray-500">Authorization to share information</p>
                          </div>
                        </div>
                        <Button variant="outline" type="button" size="sm">Upload</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Form Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabOrder = ["personal", "contact", "emergency", "insurance", "clinical", "consent"];
                    const currentIndex = tabOrder.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabOrder[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === "personal"}
                >
                  Previous
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabOrder = ["personal", "contact", "emergency", "insurance", "clinical", "consent"];
                    const currentIndex = tabOrder.indexOf(activeTab);
                    if (currentIndex < tabOrder.length - 1) {
                      setActiveTab(tabOrder[currentIndex + 1]);
                    }
                  }}
                  disabled={activeTab === "consent"}
                >
                  Next
                </Button>
                
                <Button
                  type="submit"
                  className="group relative overflow-hidden rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/25 hover:scale-105"
                  disabled={submitting || isLoading}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                  <span className="relative z-10 flex items-center">
                    {submitting || isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {client?.id ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {client?.id ? "Update Client" : "Save Client"}
                      </>
                    )}
                  </span>
                  <span className="absolute -bottom-1 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-white opacity-70 transition-all duration-300 group-hover:w-1/2"></span>
                </Button>
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
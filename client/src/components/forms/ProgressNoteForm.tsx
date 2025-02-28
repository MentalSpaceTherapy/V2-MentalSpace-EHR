import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { 
  FileText, 
  CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ClipboardCheck, 
  PenLine, 
  Eye, 
  Save, 
  UserCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock client data for the form
const mockClients = [
  { id: 1, name: "Jane Smith", mrn: "MRN001" },
  { id: 2, name: "John Doe", mrn: "MRN002" },
  { id: 3, name: "Alice Johnson", mrn: "MRN003" },
];

// Session types
const sessionTypes = [
  "Individual Therapy",
  "Group Therapy",
  "Family Therapy",
  "Couples Therapy",
  "Crisis Intervention",
  "Assessment",
  "Medication Review",
  "Other"
];

// CPT codes commonly used in mental health
const cptCodes = [
  { code: "90791", description: "Psychiatric diagnostic evaluation" },
  { code: "90832", description: "Psychotherapy, 30 min" },
  { code: "90834", description: "Psychotherapy, 45 min" },
  { code: "90837", description: "Psychotherapy, 60 min" },
  { code: "90846", description: "Family therapy without patient present" },
  { code: "90847", description: "Family therapy with patient present" },
  { code: "90853", description: "Group psychotherapy" },
];

// Telehealth platforms
const telehealthPlatforms = [
  "Zoom HIPAA Compliant",
  "Doxy.me",
  "VSee",
  "Updox",
  "GoToMeeting Healthcare",
  "Microsoft Teams (HIPAA)",
  "Phone (Voice Only)",
  "In Person",
  "Other"
];

// Form schema using zod
const progressNoteSchema = z.object({
  // Header information
  clientId: z.string({
    required_error: "Please select a client"
  }),
  sessionDate: z.date({
    required_error: "Please select the session date"
  }),
  startTime: z.string().min(1, "Please enter the start time"),
  endTime: z.string().min(1, "Please enter the end time"),
  sessionType: z.string({
    required_error: "Please select a session type"
  }),
  cptCode: z.string({
    required_error: "Please select a CPT code"
  }),
  platform: z.string({
    required_error: "Please select a telehealth platform"
  }),
  
  // SOAP sections
  subjective: z.string().min(10, "Subjective section must be at least 10 characters"),
  objective: z.string().min(10, "Objective section must be at least 10 characters"),
  assessment: z.string().min(10, "Assessment section must be at least 10 characters"),
  plan: z.string().min(10, "Plan section must be at least 10 characters"),
  
  // Risk assessment
  riskAssessment: z.object({
    suicidalRisk: z.boolean().default(false),
    homicidalRisk: z.boolean().default(false),
    selfHarmRisk: z.boolean().default(false),
    riskDetails: z.string().optional(),
  }),
  
  // Follow-up
  nextAppointment: z.string().optional(),
  
  // Signatures
  requiresSupervisorSignature: z.boolean().default(false),
  supervisorId: z.string().optional(),
  
  // Note status
  status: z.enum(["draft", "finalized", "locked"]).default("draft"),
});

type ProgressNoteFormValues = z.infer<typeof progressNoteSchema>;

export function ProgressNoteForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("header");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default values for the form
  const defaultValues: Partial<ProgressNoteFormValues> = {
    sessionDate: new Date(),
    startTime: format(new Date().setMinutes(0), "HH:mm"),
    endTime: format(new Date().setMinutes(50), "HH:mm"),
    status: "draft",
    riskAssessment: {
      suicidalRisk: false,
      homicidalRisk: false,
      selfHarmRisk: false,
      riskDetails: "",
    },
    requiresSupervisorSignature: false,
  };
  
  const form = useForm<ProgressNoteFormValues>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues,
  });
  
  function onSubmit(data: ProgressNoteFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", data);
      toast({
        title: "Progress Note Saved",
        description: "Your progress note has been saved successfully.",
      });
      setIsSubmitting(false);
    }, 1000);
  }
  
  // Function to finalize the note
  const finalizeNote = () => {
    const formValues = form.getValues();
    
    // Check for required fields
    if (!form.formState.isValid) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before finalizing.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if risk assessment details are provided when risks are checked
    if (
      (formValues.riskAssessment.suicidalRisk || 
       formValues.riskAssessment.homicidalRisk || 
       formValues.riskAssessment.selfHarmRisk) && 
      !formValues.riskAssessment.riskDetails
    ) {
      toast({
        title: "Risk Assessment Details Required",
        description: "Please provide details for the identified risks.",
        variant: "destructive",
      });
      return;
    }
    
    // Set status to finalized and submit
    form.setValue("status", "finalized");
    form.handleSubmit(onSubmit)();
  };
  
  // Function to toggle preview mode
  const togglePreview = () => {
    if (!previewMode && !form.formState.isValid) {
      // If switching to preview but form is invalid, show error
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before previewing.",
        variant: "destructive",
      });
      return;
    }
    setPreviewMode(!previewMode);
  };
  
  // Get client name from ID
  const getClientName = (id: string) => {
    const client = mockClients.find(c => c.id.toString() === id);
    return client ? client.name : "Unknown Client";
  };
  
  // Function to navigate to next tab
  const goToNextTab = () => {
    const tabs = ["header", "soap", "risk", "finalize"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  // Function to navigate to previous tab
  const goToPreviousTab = () => {
    const tabs = ["header", "soap", "risk", "finalize"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 gradient-text">Progress Note</h1>
              <p className="text-gray-500">SOAP format documentation for clinical sessions</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Badge 
              variant={form.watch("status") === "draft" ? "outline" : "default"}
              className={cn(
                "text-sm py-1 px-3",
                form.watch("status") === "draft" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                form.watch("status") === "finalized" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                "bg-blue-100 text-blue-800 hover:bg-blue-100"
              )}
            >
              {form.watch("status") === "draft" ? "Draft" : 
               form.watch("status") === "finalized" ? "Finalized" : "Locked"}
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm"
              className="transition-all duration-200"
              onClick={togglePreview}
            >
              {previewMode ? (
                <>
                  <PenLine className="h-4 w-4 mr-1.5" />
                  Edit Mode
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1.5" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {!previewMode ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-white rounded-xl shadow-md mb-4">
                <TabsList className="grid grid-cols-4 w-full p-0 rounded-t-xl bg-gray-50">
                  <TabsTrigger 
                    value="header" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200"
                    )}
                  >
                    Session Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="soap" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200"
                    )}
                  >
                    SOAP Note
                  </TabsTrigger>
                  <TabsTrigger 
                    value="risk" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200"
                    )}
                  >
                    Risk Assessment
                  </TabsTrigger>
                  <TabsTrigger 
                    value="finalize" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200"
                    )}
                  >
                    Finalize
                  </TabsTrigger>
                </TabsList>
              </div>
            
              {/* Session Info Tab */}
              <TabsContent value="header" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Session Information</CardTitle>
                    <CardDescription>Enter basic details about the session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockClients.map((client) => (
                                  <SelectItem 
                                    key={client.id} 
                                    value={client.id.toString()}
                                  >
                                    {client.name} ({client.mrn})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sessionDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Session Date <span className="text-red-500">*</span></FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
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
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="sessionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Type <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select session type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sessionTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="cptCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPT Code <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select CPT code" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cptCodes.map((code) => (
                                  <SelectItem key={code.code} value={code.code}>
                                    {code.code}: {code.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {telehealthPlatforms.map((platform) => (
                                  <SelectItem key={platform} value={platform}>
                                    {platform}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Therapist Information</p>
                          <p className="mt-1">Dr. {user?.firstName} {user?.lastName} ({user?.licenseType})</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t p-4 bg-gray-50">
                    <Button onClick={goToNextTab} type="button">
                      Continue to SOAP Note
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* SOAP Note Tab */}
              <TabsContent value="soap" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">SOAP Note</CardTitle>
                    <CardDescription>Document the clinical session details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField
                      control={form.control}
                      name="subjective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                                <span className="text-blue-700 font-bold">S</span>
                              </div>
                              <span>Subjective <span className="text-red-500">*</span></span>
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Client's own words, reports, experiences, and concerns
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client reports feeling anxious about..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <div className="bg-green-100 p-1.5 rounded-md mr-2">
                                <span className="text-green-700 font-bold">O</span>
                              </div>
                              <span>Objective <span className="text-red-500">*</span></span>
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Your observations, mental status, appearance, and behavior
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client appeared well-groomed with appropriate affect..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="assessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <div className="bg-purple-100 p-1.5 rounded-md mr-2">
                                <span className="text-purple-700 font-bold">A</span>
                              </div>
                              <span>Assessment <span className="text-red-500">*</span></span>
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Your clinical impression, diagnosis, and progress toward goals
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client continues to meet criteria for Generalized Anxiety Disorder..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <div className="bg-amber-100 p-1.5 rounded-md mr-2">
                                <span className="text-amber-700 font-bold">P</span>
                              </div>
                              <span>Plan <span className="text-red-500">*</span></span>
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Treatment plan, next steps, interventions, and follow-up
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Continue weekly therapy sessions focusing on CBT techniques..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                    <Button 
                      onClick={goToPreviousTab} 
                      type="button" 
                      variant="outline"
                    >
                      Back
                    </Button>
                    <Button onClick={goToNextTab} type="button">
                      Continue to Risk Assessment
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Risk Assessment Tab */}
              <TabsContent value="risk" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Risk Assessment</CardTitle>
                    <CardDescription>Document any safety concerns and follow-up plans</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Risk Assessment Guidelines</p>
                          <p className="mt-1 text-sm">
                            Check all that apply. If any risks are identified, you must document your 
                            assessment and safety plan in the details section below.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="riskAssessment.suicidalRisk"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base">
                                Suicidal Ideation/Risk
                              </FormLabel>
                              <FormDescription>
                                Client expresses thoughts of suicide or self-harm
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="riskAssessment.homicidalRisk"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base">
                                Homicidal Ideation/Risk
                              </FormLabel>
                              <FormDescription>
                                Client expresses thoughts of harming others
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="riskAssessment.selfHarmRisk"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base">
                                Non-Suicidal Self-Harm
                              </FormLabel>
                              <FormDescription>
                                Client engages in self-harm without suicidal intent
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="riskAssessment.riskDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Assessment Details</FormLabel>
                          <FormDescription>
                            Document your assessment, safety plan, and any actions taken
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Describe risk severity, plan/means, protective factors, safety planning, and referrals made..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nextAppointment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Appointment</FormLabel>
                          <FormDescription>
                            When is the client scheduled to return?
                          </FormDescription>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Next Tuesday at 3pm or in 2 weeks" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                    <Button 
                      onClick={goToPreviousTab} 
                      type="button" 
                      variant="outline"
                    >
                      Back
                    </Button>
                    <Button onClick={goToNextTab} type="button">
                      Continue to Finalize
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Finalize Tab */}
              <TabsContent value="finalize" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Finalize Note</CardTitle>
                    <CardDescription>Review and sign your clinical documentation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                      <div className="flex">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Almost Done!</p>
                          <p className="mt-1 text-sm">
                            Please review your note carefully before signing. Once finalized, 
                            changes can only be made through an addendum.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="requiresSupervisorSignature"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base">
                              Requires Supervisor Signature
                            </FormLabel>
                            <FormDescription>
                              Check this box if you need a supervisor to co-sign this note
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("requiresSupervisorSignature") && (
                      <FormField
                        control={form.control}
                        name="supervisorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supervisor <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a supervisor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sup1">Dr. Sarah Johnson</SelectItem>
                                <SelectItem value="sup2">Dr. Michael Chen</SelectItem>
                                <SelectItem value="sup3">Dr. Latisha Williams</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 text-primary-500 mr-2" />
                        <h3 className="font-medium text-gray-800">Signature</h3>
                      </div>
                      <div className="mt-4 flex items-center">
                        <p className="text-sm text-gray-700">
                          By clicking "Save as Draft" or "Finalize & Sign", I confirm that I, <span className="font-medium">Dr. {user?.firstName} {user?.lastName}</span>, 
                          am the author of this document and that the information contained herein is accurate to the best of my knowledge.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={goToPreviousTab} 
                        type="button" 
                        variant="outline"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        variant="outline" 
                        disabled={isSubmitting}
                        className="bg-white"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        Save as Draft
                      </Button>
                    </div>
                    <Button 
                      onClick={finalizeNote} 
                      type="button" 
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md px-6"
                      disabled={isSubmitting}
                    >
                      <ClipboardCheck className="h-4 w-4 mr-1.5" />
                      Finalize & Sign
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      ) : (
        // Preview Mode
        <Card className="border-none shadow-md modern-card">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-white border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-primary-700">Progress Note Preview</CardTitle>
                <CardDescription>SOAP format clinical documentation</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={togglePreview}
              >
                <PenLine className="h-4 w-4 mr-1.5" />
                Edit Mode
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header Information */}
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{getClientName(form.getValues().clientId || "")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Session Date</p>
                    <p className="font-medium">{form.getValues().sessionDate ? format(form.getValues().sessionDate, "PPP") : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{form.getValues().startTime} - {form.getValues().endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Session Type</p>
                    <p className="font-medium">{form.getValues().sessionType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CPT Code</p>
                    <p className="font-medium">{form.getValues().cptCode || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Platform</p>
                    <p className="font-medium">{form.getValues().platform || "Not specified"}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium">Dr. {user?.firstName} {user?.lastName} ({user?.licenseType})</p>
                </div>
              </div>
              
              {/* SOAP Note */}
              <div>
                <div className="mb-5">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                      <span className="text-blue-700 font-bold">S</span>
                    </div>
                    <h3 className="font-medium text-gray-800">Subjective</h3>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-line">{form.getValues().subjective || "No subjective information recorded."}</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-1.5 rounded-md mr-2">
                      <span className="text-green-700 font-bold">O</span>
                    </div>
                    <h3 className="font-medium text-gray-800">Objective</h3>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-line">{form.getValues().objective || "No objective information recorded."}</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-1.5 rounded-md mr-2">
                      <span className="text-purple-700 font-bold">A</span>
                    </div>
                    <h3 className="font-medium text-gray-800">Assessment</h3>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-line">{form.getValues().assessment || "No assessment information recorded."}</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-1.5 rounded-md mr-2">
                      <span className="text-amber-700 font-bold">P</span>
                    </div>
                    <h3 className="font-medium text-gray-800">Plan</h3>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-line">{form.getValues().plan || "No plan information recorded."}</p>
                  </div>
                </div>
              </div>
              
              {/* Risk Assessment */}
              <div>
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-medium text-gray-800">Risk Assessment</h3>
                </div>
                
                <div className="space-y-2 ml-7 mb-4">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${form.getValues().riskAssessment?.suicidalRisk ? "bg-red-500" : "bg-gray-300"} mr-2`}></div>
                    <p className={form.getValues().riskAssessment?.suicidalRisk ? "font-medium" : "text-gray-500"}>
                      Suicidal Ideation/Risk
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${form.getValues().riskAssessment?.homicidalRisk ? "bg-red-500" : "bg-gray-300"} mr-2`}></div>
                    <p className={form.getValues().riskAssessment?.homicidalRisk ? "font-medium" : "text-gray-500"}>
                      Homicidal Ideation/Risk
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${form.getValues().riskAssessment?.selfHarmRisk ? "bg-red-500" : "bg-gray-300"} mr-2`}></div>
                    <p className={form.getValues().riskAssessment?.selfHarmRisk ? "font-medium" : "text-gray-500"}>
                      Non-Suicidal Self-Harm
                    </p>
                  </div>
                </div>
                
                {(form.getValues().riskAssessment?.suicidalRisk || 
                  form.getValues().riskAssessment?.homicidalRisk || 
                  form.getValues().riskAssessment?.selfHarmRisk) && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm mb-1">Risk Details & Safety Plan</h4>
                    <p className="whitespace-pre-line">{form.getValues().riskAssessment?.riskDetails || "No risk details recorded."}</p>
                  </div>
                )}
              </div>
              
              {/* Follow-up */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Follow-up</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p><span className="font-medium">Next Appointment:</span> {form.getValues().nextAppointment || "Not specified"}</p>
                </div>
              </div>
              
              {/* Signature */}
              <div className="rounded-lg border p-4 mt-6">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="font-medium text-gray-800">Signature</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    <span className="font-medium">Provider:</span> Dr. {user?.firstName} {user?.lastName}, {user?.licenseType}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Status:</span> {form.getValues().status === "draft" ? "Draft" : form.getValues().status === "finalized" ? "Finalized" : "Locked"}
                  </p>
                  
                  {form.getValues().requiresSupervisorSignature && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Co-Sign Required:</span> Yes
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Supervisor:</span> {form.getValues().supervisorId === "sup1" ? "Dr. Sarah Johnson" : 
                          form.getValues().supervisorId === "sup2" ? "Dr. Michael Chen" : 
                          form.getValues().supervisorId === "sup3" ? "Dr. Latisha Williams" : "Not specified"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
            <Button 
              onClick={togglePreview} 
              variant="outline"
            >
              <PenLine className="h-4 w-4 mr-1.5" />
              Edit Note
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save as Draft
              </Button>
              <Button 
                onClick={finalizeNote} 
                type="button" 
                className="bg-primary-600 hover:bg-primary-700"
                disabled={isSubmitting}
              >
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Finalize & Sign
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
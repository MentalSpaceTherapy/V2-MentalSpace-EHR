import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  FilePlus, 
  CalendarIcon, 
  ClipboardList, 
  UserCircle, 
  Brain, 
  Clock, 
  Pill, 
  Users, 
  Save, 
  CheckCircle2,
  Eye,
  PenLine,
  UserCheck,
  TimerReset,
  ShieldAlert,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock client data
const mockClients = [
  { id: 1, name: "Jane Smith", mrn: "MRN001" },
  { id: 2, name: "John Doe", mrn: "MRN002" },
  { id: 3, name: "Alice Johnson", mrn: "MRN003" },
];

// Presenting problems
const presentingProblems = [
  "Anxiety",
  "Depression",
  "Trauma / PTSD",
  "Stress Management",
  "Relationship Issues",
  "Grief / Loss",
  "Anger Management",
  "Substance Use / Addiction",
  "Behavioral Issues",
  "Bipolar Symptoms",
  "Psychosis / Schizophrenia",
  "Eating Disorder Concerns",
  "Personality Disorder Concerns",
  "Sexual / Gender Identity Concerns",
  "Other"
];

// Symptom onset options
const symptomOnsetOptions = [
  "Recent (Less than 1 month)",
  "Acute (1-3 months)",
  "Subacute (3-6 months)",
  "Chronic (6+ months)",
  "Episodic (Comes and goes)",
  "Longstanding (Years)",
  "Since childhood",
  "Unknown / Not specified"
];

// Symptom severity options
const severityOptions = [
  "Mild",
  "Moderate",
  "Severe",
  "Extreme",
  "Fluctuating"
];

// Previous treatment types
const treatmentTypes = [
  "Individual Therapy",
  "Group Therapy",
  "Family Therapy",
  "Couples Therapy",
  "Psychiatric Medication",
  "Substance Abuse Treatment",
  "Inpatient Hospitalization",
  "Partial Hospitalization (PHP)",
  "Intensive Outpatient Program (IOP)",
  "Support Group",
  "Other"
];

// Medication frequency options
const medicationFrequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "As needed / PRN",
  "Weekly",
  "Monthly",
  "Other"
];

// Mental status examination options
const appearance = [
  "Well-groomed",
  "Casual",
  "Disheveled",
  "Inappropriate",
  "Poor hygiene",
  "Other"
];

const behaviorMotor = [
  "Calm",
  "Restless",
  "Agitated",
  "Psychomotor retardation",
  "Hyperactive",
  "Tremors",
  "Other"
];

const speechOptions = [
  "Normal rate/volume",
  "Loud",
  "Soft/quiet",
  "Pressured",
  "Slow",
  "Rapid",
  "Poverty of speech",
  "Other"
];

const moodOptions = [
  "Euthymic",
  "Depressed",
  "Anxious",
  "Irritable",
  "Angry",
  "Euphoric",
  "Guilty",
  "Fearful",
  "Hopeless",
  "Other"
];

const affectOptions = [
  "Full range",
  "Constricted",
  "Flat",
  "Blunted",
  "Labile",
  "Inappropriate",
  "Congruent with mood",
  "Incongruent with mood",
  "Other"
];

const thoughtProcessOptions = [
  "Logical",
  "Coherent",
  "Disorganized",
  "Circumstantial",
  "Tangential",
  "Loosening of associations",
  "Flight of ideas",
  "Thought blocking",
  "Other"
];

const thoughtContentOptions = [
  "Unremarkable",
  "Suicidal ideation",
  "Homicidal ideation",
  "Paranoid ideation",
  "Delusions",
  "Obsessions",
  "Phobias",
  "Ruminations",
  "Ideas of reference",
  "Poverty of content",
  "Other"
];

const perceptionOptions = [
  "No abnormalities",
  "Auditory hallucinations",
  "Visual hallucinations",
  "Tactile hallucinations",
  "Olfactory hallucinations",
  "Gustatory hallucinations",
  "Illusions",
  "Depersonalization",
  "Derealization",
  "Other"
];

const cognitionOptions = [
  "Alert",
  "Oriented x3",
  "Disoriented",
  "Impaired attention",
  "Impaired concentration",
  "Impaired memory",
  "Impaired abstraction",
  "Impaired judgment",
  "Impaired insight",
  "Other"
];

const insightJudgmentOptions = [
  "Good",
  "Fair",
  "Limited",
  "Poor",
  "Absent"
];

// Common diagnoses
const commonDiagnoses = [
  { code: "F32.9", name: "Major Depressive Disorder, Single Episode, Unspecified" },
  { code: "F33.9", name: "Major Depressive Disorder, Recurrent, Unspecified" },
  { code: "F41.1", name: "Generalized Anxiety Disorder" },
  { code: "F41.9", name: "Anxiety Disorder, Unspecified" },
  { code: "F43.10", name: "Post-Traumatic Stress Disorder, Unspecified" },
  { code: "F43.21", name: "Adjustment Disorder with Depressed Mood" },
  { code: "F43.23", name: "Adjustment Disorder with Mixed Anxiety and Depressed Mood" },
  { code: "F60.9", name: "Personality Disorder, Unspecified" },
  { code: "F90.9", name: "Attention-Deficit/Hyperactivity Disorder, Unspecified Type" },
  { code: "F42.9", name: "Obsessive-Compulsive Disorder, Unspecified" },
  { code: "F31.9", name: "Bipolar Disorder, Unspecified" },
  { code: "F20.9", name: "Schizophrenia, Unspecified" },
  { code: "F50.9", name: "Eating Disorder, Unspecified" },
  { code: "F10.10", name: "Alcohol Use Disorder, Mild" },
  { code: "F10.20", name: "Alcohol Use Disorder, Moderate" },
  { code: "F10.90", name: "Alcohol Use Disorder, Unspecified" },
];

// Treatment modalities
const treatmentModalities = [
  "Individual Therapy",
  "Group Therapy",
  "Family Therapy",
  "Couples Therapy",
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Trauma-Focused Therapy",
  "Mindfulness-Based Interventions",
  "Motivational Interviewing",
  "Psychodynamic Therapy",
  "Supportive Therapy",
  "Solution-Focused Brief Therapy",
  "Psychoeducation",
  "Medication Management",
  "Skills Training",
  "Other"
];

// Form schema using zod
const intakeFormSchema = z.object({
  // Basic information
  clientId: z.string({
    required_error: "Please select a client"
  }),
  intakeDate: z.date({
    required_error: "Please select the intake date"
  }),
  
  // Presenting Problem
  chiefComplaint: z.string({
    required_error: "Please select the primary presenting problem"
  }),
  additionalConcerns: z.array(z.string()).optional(),
  symptomOnset: z.string({
    required_error: "Please select when the symptoms began"
  }),
  severity: z.string({
    required_error: "Please rate the severity of symptoms"
  }),
  presentingProblemDescription: z.string().min(10, "Please provide a detailed description of at least 10 characters"),
  impactOnFunctioning: z.string().min(10, "Please describe the impact on functioning with at least 10 characters"),
  
  // Treatment History
  priorTreatment: z.boolean().default(false),
  treatmentTypes: z.array(z.string()).optional(),
  treatmentDetails: z.string().optional(),
  treatmentEffectiveness: z.string().optional(),
  
  // Medical & Psychiatric History
  medicalConditions: z.string().optional(),
  currentMedications: z.array(z.object({
    name: z.string().min(1, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    reason: z.string().min(1, "Reason for medication is required"),
    prescriber: z.string().optional(),
  })).optional().default([]),
  medicationAllergies: z.string().optional(),
  familyPsychiatricHistory: z.string().optional(),
  
  // Substance Use
  substanceUse: z.object({
    alcohol: z.boolean().default(false),
    tobacco: z.boolean().default(false),
    cannabis: z.boolean().default(false),
    stimulants: z.boolean().default(false),
    opioids: z.boolean().default(false),
    sedatives: z.boolean().default(false),
    other: z.boolean().default(false),
    otherDescription: z.string().optional(),
  }),
  substanceUseDetails: z.string().optional(),
  
  // Risk Assessment
  riskFactors: z.object({
    suicidalIdeation: z.boolean().default(false),
    suicideAttemptHistory: z.boolean().default(false),
    homicidalIdeation: z.boolean().default(false),
    selfHarmBehaviors: z.boolean().default(false),
    impulsivity: z.boolean().default(false),
    aggressionViolence: z.boolean().default(false),
  }),
  riskAssessmentDetails: z.string().optional(),
  riskLevel: z.enum(["none", "low", "moderate", "high", "extreme"]).default("none"),
  safetyPlan: z.boolean().default(false),
  
  // Mental Status Examination
  mentalStatus: z.object({
    appearance: z.array(z.string()).default([]),
    appearanceOther: z.string().optional(),
    behavior: z.array(z.string()).default([]),
    behaviorOther: z.string().optional(),
    speech: z.array(z.string()).default([]),
    speechOther: z.string().optional(),
    mood: z.array(z.string()).default([]),
    moodOther: z.string().optional(),
    affect: z.array(z.string()).default([]),
    affectOther: z.string().optional(),
    thoughtProcess: z.array(z.string()).default([]),
    thoughtProcessOther: z.string().optional(),
    thoughtContent: z.array(z.string()).default([]),
    thoughtContentOther: z.string().optional(),
    perception: z.array(z.string()).default([]),
    perceptionOther: z.string().optional(),
    cognition: z.array(z.string()).default([]),
    cognitionOther: z.string().optional(),
    insightJudgment: z.string().optional(),
    additionalObservations: z.string().optional(),
  }).default({}),
  
  // Diagnosis
  diagnoses: z.array(z.object({
    code: z.string().min(1, "Diagnosis code is required"),
    name: z.string().min(1, "Diagnosis name is required"),
    isPrimary: z.boolean().default(false),
    specifier: z.string().optional(),
    notes: z.string().optional()
  })).default([]),
  rulOutDiagnoses: z.array(z.object({
    code: z.string().min(1, "Diagnosis code is required"),
    name: z.string().min(1, "Diagnosis name is required")
  })).default([]),
  zCode: z.string().optional(),
  diagnosticFormulation: z.string().optional(),
  
  // Treatment Recommendations
  recommendedTreatment: z.object({
    recommendedModalities: z.array(z.string()).default([]),
    recommendedFrequency: z.string().optional(),
    recommendedDuration: z.string().optional(),
    medicationRecommendations: z.string().optional(),
    additionalRecommendations: z.string().optional(),
    referrals: z.string().optional(),
  }).default({}),
  
  // Psychosocial Information
  maritalStatus: z.string().optional(),
  livingSituation: z.string().optional(),
  occupation: z.string().optional(),
  socialSupport: z.string().optional(),
  stressors: z.string().optional(),
  strengths: z.string().optional(),
  
  // Note status
  status: z.enum(["draft", "finalized", "locked"]).default("draft"),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export function IntakeForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default values for the form
  const defaultValues: Partial<IntakeFormValues> = {
    intakeDate: new Date(),
    status: "draft",
    priorTreatment: false,
    currentMedications: [],
    substanceUse: {
      alcohol: false,
      tobacco: false,
      cannabis: false,
      stimulants: false,
      opioids: false,
      sedatives: false,
      other: false,
    },
    riskFactors: {
      suicidalIdeation: false,
      suicideAttemptHistory: false,
      homicidalIdeation: false,
      selfHarmBehaviors: false,
      impulsivity: false,
      aggressionViolence: false,
    },
    riskLevel: "none",
    safetyPlan: false,
    mentalStatus: {
      appearance: [],
      behavior: [],
      speech: [],
      mood: [],
      affect: [],
      thoughtProcess: [],
      thoughtContent: [],
      perception: [],
      cognition: [],
    },
    diagnoses: [],
    rulOutDiagnoses: [],
    recommendedTreatment: {
      recommendedModalities: [],
    }
  };
  
  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues,
  });
  
  function onSubmit(data: IntakeFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", data);
      toast({
        title: "Intake Form Saved",
        description: "Your intake form has been saved successfully.",
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
      (formValues.riskFactors.suicidalIdeation || 
       formValues.riskFactors.homicidalIdeation || 
       formValues.riskFactors.suicideAttemptHistory ||
       formValues.riskFactors.selfHarmBehaviors) && 
      !formValues.riskAssessmentDetails
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
  
  // Add a new medication to the form
  const addMedication = () => {
    const currentMeds = form.getValues().currentMedications || [];
    form.setValue("currentMedications", [
      ...currentMeds,
      { name: "", dosage: "", frequency: "", reason: "", prescriber: "" }
    ]);
  };
  
  // Remove a medication from the form
  const removeMedication = (index: number) => {
    const currentMeds = form.getValues().currentMedications || [];
    form.setValue("currentMedications", 
      currentMeds.filter((_, i) => i !== index)
    );
  };
  
  // Function to navigate to next tab
  const goToNextTab = () => {
    const tabs = ["basic", "presenting", "history", "medical", "substances", "risk", "mentalstatus", "diagnosis", "recommendations", "psychosocial", "finalize"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  // Function to navigate to previous tab
  const goToPreviousTab = () => {
    const tabs = ["basic", "presenting", "history", "medical", "substances", "risk", "mentalstatus", "diagnosis", "recommendations", "psychosocial", "finalize"];
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
            <FilePlus className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 gradient-text">Client Intake Form</h1>
              <p className="text-gray-500">Comprehensive assessment for new clients</p>
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
              <div className="bg-white rounded-xl shadow-md mb-4 overflow-x-auto">
                <TabsList className="flex w-full p-0 rounded-t-xl bg-gray-50">
                  <TabsTrigger 
                    value="basic" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="presenting" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Presenting Problems
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Treatment History
                  </TabsTrigger>
                  <TabsTrigger 
                    value="medical" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Medical
                  </TabsTrigger>
                  <TabsTrigger 
                    value="substances" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Substances
                  </TabsTrigger>
                  <TabsTrigger 
                    value="risk" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Risk Assessment
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mentalstatus" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Mental Status
                  </TabsTrigger>
                  <TabsTrigger 
                    value="diagnosis" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Diagnosis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recommendations" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Treatment Plan
                  </TabsTrigger>
                  <TabsTrigger 
                    value="psychosocial" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Psychosocial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="finalize" 
                    className={cn(
                      "data-[state=active]:shadow-none rounded-none py-3",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-700",
                      "transition-all duration-200 flex-shrink-0"
                    )}
                  >
                    Finalize
                  </TabsTrigger>
                </TabsList>
              </div>
            
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Basic Information</CardTitle>
                    <CardDescription>Client identification and intake date</CardDescription>
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
                        name="intakeDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Intake Date <span className="text-red-500">*</span></FormLabel>
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
                    
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          <UserCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Clinician Information</p>
                          <p className="mt-1">Intake conducted by: Dr. {user?.firstName} {user?.lastName} ({user?.licenseType})</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t p-4 bg-gray-50">
                    <Button onClick={goToNextTab} type="button">
                      Continue to Presenting Problems
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Presenting Problems Tab */}
              <TabsContent value="presenting" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Presenting Problems</CardTitle>
                    <CardDescription>Client's primary concerns and symptom history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField
                      control={form.control}
                      name="chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Presenting Problem <span className="text-red-500">*</span></FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select the primary concern" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {presentingProblems.map((problem) => (
                                <SelectItem key={problem} value={problem}>
                                  {problem}
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
                      name="additionalConcerns"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Additional Concerns</FormLabel>
                            <FormDescription>
                              Select any additional issues the client is experiencing
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {presentingProblems.filter(p => p !== form.watch("chiefComplaint")).map((problem) => (
                              <FormField
                                key={problem}
                                control={form.control}
                                name="additionalConcerns"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={problem}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(problem)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), problem])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== problem
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {problem}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="symptomOnset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symptom Onset <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select when symptoms began" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {symptomOnsetOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
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
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symptom Severity <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select severity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {severityOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="presentingProblemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Description <span className="text-red-500">*</span></FormLabel>
                          <FormDescription>
                            Describe the presenting problem(s) in detail, including specific symptoms and concerns
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client describes experiencing panic attacks that began 3 months ago following a car accident..."
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
                      name="impactOnFunctioning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impact on Functioning <span className="text-red-500">*</span></FormLabel>
                          <FormDescription>
                            How are these problems affecting the client's daily life, relationships, work, etc.
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Symptoms have significantly impacted client's ability to work, leading to missed days and reduced productivity..."
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
                      Continue to Treatment History
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Treatment History Tab */}
              <TabsContent value="history" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Treatment History</CardTitle>
                    <CardDescription>Prior mental health treatment and interventions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField
                      control={form.control}
                      name="priorTreatment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base">
                              Prior Mental Health Treatment
                            </FormLabel>
                            <FormDescription>
                              Has the client received any previous mental health treatment?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("priorTreatment") && (
                      <div className="space-y-6 pl-8 border-l-2 border-primary-100">
                        <FormField
                          control={form.control}
                          name="treatmentTypes"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Treatment Types</FormLabel>
                                <FormDescription>
                                  Select all types of treatment previously received
                                </FormDescription>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {treatmentTypes.map((type) => (
                                  <FormField
                                    key={type}
                                    control={form.control}
                                    name="treatmentTypes"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={type}
                                          className="flex flex-row items-center space-x-2 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(type)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value || []), type])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== type
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal text-sm">
                                            {type}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="treatmentDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Treatment Details</FormLabel>
                              <FormDescription>
                                Provide details about previous treatment, including providers, dates, and duration
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  placeholder="Client received CBT at ABC Therapy Center from January to June 2022..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="treatmentEffectiveness"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Treatment Effectiveness</FormLabel>
                              <FormDescription>
                                Describe what was helpful or unhelpful about previous treatment
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  placeholder="Client reports CBT techniques were helpful for managing anxiety in the moment but felt therapy ended too soon..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {!form.watch("priorTreatment") && (
                      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                        <div className="flex">
                          <TimerReset className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">No Prior Treatment</p>
                            <p className="mt-1">
                              Client reports no previous mental health treatment. This will be documented as their first episode of care.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                      Continue to Medical History
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Medical History Tab */}
              <TabsContent value="medical" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Medical & Psychiatric History</CardTitle>
                    <CardDescription>Current and past medical conditions, medications, and family history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions</FormLabel>
                          <FormDescription>
                            List any current or past medical conditions that may be relevant to treatment
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Hypertension (controlled with medication), Hypothyroidism, History of concussion (2018)..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <FormLabel className="text-base">Current Medications</FormLabel>
                          <FormDescription>
                            Include all prescription medications, over-the-counter drugs, and supplements
                          </FormDescription>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addMedication}
                        >
                          Add Medication
                        </Button>
                      </div>
                      
                      {form.watch("currentMedications")?.length === 0 ? (
                        <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
                          <Pill className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                          <p>No medications added. Click "Add Medication" to include client's medications.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {form.watch("currentMedications")?.map((_, index) => (
                            <div key={index} className="p-4 border rounded-md relative">
                              <button 
                                type="button" 
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                onClick={() => removeMedication(index)}
                              >
                                &times;
                              </button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`currentMedications.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Medication Name <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="e.g., Sertraline, Lisinopril" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`currentMedications.${index}.dosage`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Dosage <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="e.g., 50mg, 10mg" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`currentMedications.${index}.frequency`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Frequency <span className="text-red-500">*</span></FormLabel>
                                      <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {medicationFrequencyOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                              {option}
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
                                  name={`currentMedications.${index}.reason`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Reason <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="e.g., Depression, Hypertension" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`currentMedications.${index}.prescriber`}
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel>Prescriber</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="e.g., Dr. Smith, Primary Care" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="medicationAllergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Allergies</FormLabel>
                          <FormDescription>
                            List any known medication allergies or adverse reactions
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Penicillin (hives), Sulfa drugs (rash)..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="familyPsychiatricHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family Psychiatric History</FormLabel>
                          <FormDescription>
                            Describe any known mental health conditions in the client's family
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Mother has history of depression, maternal aunt diagnosed with bipolar disorder..."
                              className="min-h-[100px]"
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
                      Continue to Substance Use
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Substance Use Tab */}
              <TabsContent value="substances" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Substance Use</CardTitle>
                    <CardDescription>Current and past substance use patterns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <FormLabel className="text-base mb-4 block">Substance Use History</FormLabel>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="substanceUse.alcohol"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Alcohol
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="substanceUse.tobacco"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Tobacco/Nicotine
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="substanceUse.cannabis"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Cannabis
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="substanceUse.stimulants"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Stimulants (cocaine, methamphetamine, etc.)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="substanceUse.opioids"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Opioids (heroin, prescription pain medications, etc.)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="substanceUse.sedatives"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Sedatives/Hypnotics (benzodiazepines, sleep medications, etc.)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-start space-x-3 p-3 border rounded-md">
                          <FormField
                            control={form.control}
                            name="substanceUse.other"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0 mt-1">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-base">
                                  Other Substances
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          {form.watch("substanceUse.other") && (
                            <FormField
                              control={form.control}
                              name="substanceUse.otherDescription"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder="Specify other substances"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(form.watch("substanceUse.alcohol") || 
                      form.watch("substanceUse.tobacco") || 
                      form.watch("substanceUse.cannabis") ||
                      form.watch("substanceUse.stimulants") ||
                      form.watch("substanceUse.opioids") ||
                      form.watch("substanceUse.sedatives") ||
                      form.watch("substanceUse.other")) && (
                      <FormField
                        control={form.control}
                        name="substanceUseDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Substance Use Details</FormLabel>
                            <FormDescription>
                              Provide details about frequency, amount, duration, and impact of substance use
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="Client reports drinking 3-4 glasses of wine daily for the past 5 years. Reports increased use in the last 6 months following job loss..."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {!(form.watch("substanceUse.alcohol") || 
                       form.watch("substanceUse.tobacco") || 
                       form.watch("substanceUse.cannabis") ||
                       form.watch("substanceUse.stimulants") ||
                       form.watch("substanceUse.opioids") ||
                       form.watch("substanceUse.sedatives") ||
                       form.watch("substanceUse.other")) && (
                      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                        <div className="flex">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">No Substance Use Reported</p>
                            <p className="mt-1">
                              Client denies current use of substances. This will be documented in the intake assessment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                    <CardDescription>Evaluate potential safety concerns and risk factors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                      <div className="flex">
                        <ShieldAlert className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Risk Assessment Guidelines</p>
                          <p className="mt-1 text-sm">
                            Check all that apply. If any risks are identified, you must document your 
                            assessment and safety plan in the details section below.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel className="text-base mb-4 block">Risk Factors</FormLabel>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="riskFactors.suicidalIdeation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Current Suicidal Ideation
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="riskFactors.suicideAttemptHistory"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  History of Suicide Attempt(s)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="riskFactors.homicidalIdeation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Homicidal Ideation
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="riskFactors.selfHarmBehaviors"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Self-Harm Behaviors
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="riskFactors.impulsivity"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Significant Impulsivity
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="riskFactors.aggressionViolence"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  Aggression/Violence History
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="riskLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Risk Level Assessment <span className="text-red-500">*</span></FormLabel>
                          <FormDescription>
                            Based on your clinical judgment, rate the client's overall risk level
                          </FormDescription>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="none" />
                                </FormControl>
                                <FormLabel className="font-normal text-gray-800">
                                  No identified risk
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="low" />
                                </FormControl>
                                <FormLabel className="font-normal text-blue-800">
                                  Low risk - Minimal risk factors, good impulse control
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="moderate" />
                                </FormControl>
                                <FormLabel className="font-normal text-yellow-800">
                                  Moderate risk - Some risk factors present, adequate impulse control
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="high" />
                                </FormControl>
                                <FormLabel className="font-normal text-orange-800">
                                  High risk - Multiple risk factors, poor impulse control
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="extreme" />
                                </FormControl>
                                <FormLabel className="font-normal text-red-800">
                                  Extreme risk - Imminent danger, immediate intervention required
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {(form.watch("riskFactors.suicidalIdeation") ||
                      form.watch("riskFactors.suicideAttemptHistory") ||
                      form.watch("riskFactors.homicidalIdeation") ||
                      form.watch("riskFactors.selfHarmBehaviors") ||
                      form.watch("riskFactors.impulsivity") ||
                      form.watch("riskFactors.aggressionViolence") ||
                      form.watch("riskLevel") === "moderate" ||
                      form.watch("riskLevel") === "high" ||
                      form.watch("riskLevel") === "extreme") && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="riskAssessmentDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Risk Assessment Details <span className="text-red-500">*</span></FormLabel>
                              <FormDescription>
                                Provide detailed assessment of identified risks, including severity, protective factors, 
                                and safety planning measures
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  placeholder="Client endorses passive suicidal ideation without plan or intent. Reports strong protective factors including family support and goals for the future..."
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
                          name="safetyPlan"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-amber-200 rounded-md bg-amber-50">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base text-amber-800">
                                  Safety Plan Completed
                                </FormLabel>
                                <FormDescription className="text-amber-700">
                                  I confirm that a comprehensive safety plan has been developed and reviewed with the client, 
                                  emergency contacts have been established, and crisis resources have been provided.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {!(form.watch("riskFactors.suicidalIdeation") ||
                       form.watch("riskFactors.suicideAttemptHistory") ||
                       form.watch("riskFactors.homicidalIdeation") ||
                       form.watch("riskFactors.selfHarmBehaviors") ||
                       form.watch("riskFactors.impulsivity") ||
                       form.watch("riskFactors.aggressionViolence")) &&
                       (form.watch("riskLevel") === "none" || form.watch("riskLevel") === "low") && (
                      <div className="bg-green-50 rounded-lg p-4 text-sm text-green-800">
                        <div className="flex">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">No Acute Risk Factors Identified</p>
                            <p className="mt-1">
                              Client denies current suicidal/homicidal ideation and does not present with significant risk factors at this time.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                      Continue to Mental Status Exam
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Mental Status Examination Tab */}
              <TabsContent value="mentalstatus" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700 flex items-center gap-2">
                      Mental Status Examination
                      <Badge variant="outline" className="bg-green-100 text-green-800 animate-pulse">NEW</Badge>
                    </CardTitle>
                    <CardDescription>Comprehensive assessment of the client's mental state</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                      <div className="flex">
                        <Brain className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Mental Status Examination</p>
                          <p className="mt-1 text-sm">
                            Select all applicable observations for each category. Multiple selections are allowed.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Appearance */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.appearance"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Appearance</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's presentation
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {appearance.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.appearance"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.appearance")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.appearanceOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other appearance details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other appearance observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Behavior/Motor Activity */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.behavior"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Behavior/Motor Activity</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's behavior
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {behaviorMotor.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.behavior"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.behavior")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.behaviorOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other behavior details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other behavior observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Speech */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.speech"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Speech</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's speech
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {speechOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.speech"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.speech")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.speechOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other speech details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other speech observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Mood */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.mood"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Mood</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's reported mood
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {moodOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.mood"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.mood")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.moodOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other mood details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other mood observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Affect */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.affect"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Affect</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's observed affect
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {affectOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.affect"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.affect")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.affectOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other affect details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other affect observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Thought Process */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.thoughtProcess"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Thought Process</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's thought process
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {thoughtProcessOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.thoughtProcess"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.thoughtProcess")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.thoughtProcessOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other thought process details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other thought process observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Thought Content */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.thoughtContent"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Thought Content</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's thought content
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {thoughtContentOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.thoughtContent"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.thoughtContent")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.thoughtContentOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other thought content details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other thought content observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Perception */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.perception"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Perception</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's perception
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {perceptionOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.perception"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.perception")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.perceptionOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other perception details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other perception observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Cognition */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.cognition"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Cognition</FormLabel>
                            <FormDescription>
                              Select all that apply to the client's cognitive functioning
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cognitionOptions.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="mentalStatus.cognition"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>

                          {form.watch("mentalStatus.cognition")?.includes("Other") && (
                            <FormField
                              control={form.control}
                              name="mentalStatus.cognitionOther"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Other cognition details</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Please specify other cognition observations"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Insight and Judgment */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.insightJudgment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Insight and Judgment</FormLabel>
                          <FormDescription>
                            Rate the client's level of insight into their condition and judgment
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select insight/judgment level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {insightJudgmentOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Additional Observations */}
                    <FormField
                      control={form.control}
                      name="mentalStatus.additionalObservations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Observations</FormLabel>
                          <FormDescription>
                            Record any additional mental status observations or elaborations not covered above
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client demonstrated good eye contact throughout the session and was able to recall details of recent events without difficulty..."
                              className="min-h-[100px]"
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
                      Continue to Diagnosis
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Diagnosis Tab */}
              <TabsContent value="diagnosis" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700 flex items-center gap-2">
                      Diagnosis
                      <Badge variant="outline" className="bg-green-100 text-green-800 animate-pulse">NEW</Badge>
                    </CardTitle>
                    <CardDescription>Clinical diagnosis using ICD-10/DSM-5 codes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6">
                      <div className="flex">
                        <ClipboardList className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Clinical Diagnosis</p>
                          <p className="mt-1 text-sm">
                            Select from common diagnoses or enter custom ICD-10/DSM-5 codes. Mark one diagnosis as primary.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <FormLabel className="text-base">Clinical Diagnoses</FormLabel>
                          <FormDescription>
                            Add all applicable diagnoses. Select at least one primary diagnosis.
                          </FormDescription>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const currentDiagnoses = form.getValues().diagnoses || [];
                            form.setValue("diagnoses", [
                              ...currentDiagnoses, 
                              { code: "", name: "", isPrimary: currentDiagnoses.length === 0, specifier: "", notes: "" }
                            ]);
                          }}
                        >
                          Add Diagnosis
                        </Button>
                      </div>
                      
                      {form.watch("diagnoses")?.length === 0 ? (
                        <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
                          <ClipboardList className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                          <p>No diagnoses added. Click "Add Diagnosis" to begin.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {form.watch("diagnoses")?.map((_, index) => (
                            <div key={index} className="p-4 border rounded-md relative">
                              <button 
                                type="button" 
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  const currentDiagnoses = form.getValues().diagnoses || [];
                                  form.setValue("diagnoses", 
                                    currentDiagnoses.filter((_, i) => i !== index)
                                  );
                                  
                                  // If no primary diagnosis is left, mark the first one as primary
                                  const remaining = form.getValues().diagnoses || [];
                                  if (remaining.length > 0 && !remaining.some(d => d.isPrimary)) {
                                    const updated = [...remaining];
                                    updated[0].isPrimary = true;
                                    form.setValue("diagnoses", updated);
                                  }
                                }}
                              >
                                &times;
                              </button>
                              
                              <div className="flex items-center mb-4">
                                <FormField
                                  control={form.control}
                                  name={`diagnoses.${index}.isPrimary`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={(checked) => {
                                            // Uncheck all others if this is checked
                                            if (checked) {
                                              const currentDiagnoses = form.getValues().diagnoses || [];
                                              const updated = currentDiagnoses.map((diag, i) => ({
                                                ...diag,
                                                isPrimary: i === index
                                              }));
                                              form.setValue("diagnoses", updated);
                                            } else {
                                              // Don't allow unchecking if this is the only primary
                                              const currentDiagnoses = form.getValues().diagnoses || [];
                                              if (currentDiagnoses.filter(d => d.isPrimary).length <= 1) {
                                                return;
                                              }
                                              field.onChange(false);
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-semibold text-sm">
                                        Primary Diagnosis
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                
                                {form.watch(`diagnoses.${index}.isPrimary`) && (
                                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Primary</Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <FormField
                                    control={form.control}
                                    name={`diagnoses.${index}.code`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Diagnosis Code <span className="text-red-500">*</span></FormLabel>
                                        <Select 
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            // Auto-fill the name if a common diagnosis is selected
                                            const selected = commonDiagnoses.find(d => d.code === value);
                                            if (selected) {
                                              form.setValue(`diagnoses.${index}.name`, selected.name);
                                            }
                                          }}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select or type code" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <div className="px-3 py-2 text-sm text-gray-500 border-b">Common Diagnoses</div>
                                            {commonDiagnoses.map((diagnosis) => (
                                              <SelectItem key={diagnosis.code} value={diagnosis.code}>
                                                {diagnosis.code} - {diagnosis.name}
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
                                    name={`diagnoses.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem className="mt-4">
                                        <FormLabel>Diagnosis Description <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder="e.g., Major Depressive Disorder" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div>
                                  <FormField
                                    control={form.control}
                                    name={`diagnoses.${index}.specifier`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Specifiers (if applicable)</FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder="e.g., With anxious distress, moderate" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name={`diagnoses.${index}.notes`}
                                    render={({ field }) => (
                                      <FormItem className="mt-4">
                                        <FormLabel>Diagnostic Notes</FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            {...field} 
                                            className="min-h-[80px]"
                                            placeholder="Additional diagnostic information..." 
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <FormLabel className="text-base">Rule Out Diagnoses</FormLabel>
                          <FormDescription>
                            Add diagnoses that should be considered or ruled out
                          </FormDescription>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const currentRuleOuts = form.getValues().rulOutDiagnoses || [];
                            form.setValue("rulOutDiagnoses", [
                              ...currentRuleOuts, 
                              { code: "", name: "" }
                            ]);
                          }}
                        >
                          Add Rule Out
                        </Button>
                      </div>
                      
                      {form.watch("rulOutDiagnoses")?.length === 0 ? (
                        <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
                          <p>No rule-out diagnoses. Add if appropriate for this assessment.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {form.watch("rulOutDiagnoses")?.map((_, index) => (
                            <div key={index} className="p-4 border rounded-md relative">
                              <button 
                                type="button" 
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  const currentRuleOuts = form.getValues().rulOutDiagnoses || [];
                                  form.setValue("rulOutDiagnoses", 
                                    currentRuleOuts.filter((_, i) => i !== index)
                                  );
                                }}
                              >
                                &times;
                              </button>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`rulOutDiagnoses.${index}.code`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Diagnosis Code <span className="text-red-500">*</span></FormLabel>
                                      <Select 
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          // Auto-fill the name if a common diagnosis is selected
                                          const selected = commonDiagnoses.find(d => d.code === value);
                                          if (selected) {
                                            form.setValue(`rulOutDiagnoses.${index}.name`, selected.name);
                                          }
                                        }}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select or type code" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <div className="px-3 py-2 text-sm text-gray-500 border-b">Common Diagnoses</div>
                                          {commonDiagnoses.map((diagnosis) => (
                                            <SelectItem key={diagnosis.code} value={diagnosis.code}>
                                              {diagnosis.code} - {diagnosis.name}
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
                                  name={`rulOutDiagnoses.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Diagnosis Description <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="e.g., Bipolar Disorder" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="zCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Z-Code (Psychosocial Factors)</FormLabel>
                          <FormDescription>
                            Optional Z-code to document psychosocial factors affecting condition
                          </FormDescription>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="e.g., Z63.0 Problems in relationship with spouse or partner" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="diagnosticFormulation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnostic Formulation</FormLabel>
                          <FormDescription>
                            Provide a clinical formulation explaining your diagnostic reasoning and conceptualization
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="The client's symptoms meet criteria for Major Depressive Disorder as evidenced by..."
                              className="min-h-[150px]"
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
                      Continue to Treatment Plan
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Treatment Recommendations Tab */}
              <TabsContent value="recommendations" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Treatment Recommendations</CardTitle>
                    <CardDescription>Recommended treatment approach and interventions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6">
                      <div className="flex">
                        <ClipboardList className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Treatment Plan</p>
                          <p className="mt-1 text-sm">
                            Outline recommended treatment modalities, frequency, duration, and specific interventions for this client.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="recommendedTreatment.recommendedModalities"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Recommended Treatment Modalities</FormLabel>
                            <FormDescription>
                              Select all treatment approaches recommended for this client
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {treatmentModalities.map((item) => (
                              <FormField
                                key={item}
                                control={form.control}
                                name="recommendedTreatment.recommendedModalities"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="recommendedTreatment.recommendedFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recommended Frequency</FormLabel>
                            <FormDescription>
                              How often should sessions occur?
                            </FormDescription>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="e.g., Weekly, Bi-weekly, Monthly" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recommendedTreatment.recommendedDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Treatment Duration</FormLabel>
                            <FormDescription>
                              Anticipated length of treatment
                            </FormDescription>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="e.g., 12 weeks, 6 months, Ongoing" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="recommendedTreatment.medicationRecommendations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Recommendations</FormLabel>
                          <FormDescription>
                            Provide recommendations regarding medication evaluation, management, or continuation
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Recommend psychiatric evaluation for possible antidepressant medication. Client should continue current medication regimen and follow up with prescriber..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recommendedTreatment.additionalRecommendations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Treatment Recommendations</FormLabel>
                          <FormDescription>
                            Provide any additional recommendations, interventions, or specific treatment goals
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Recommend stress management techniques including mindfulness practice and progressive muscle relaxation. Focus on developing coping skills for anxiety management..."
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
                      name="recommendedTreatment.referrals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referrals</FormLabel>
                          <FormDescription>
                            List any recommended referrals to other providers or services
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Referral to psychiatrist for medication evaluation, Referral to substance abuse treatment program, Referral to support group..."
                              className="min-h-[100px]"
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
                      Continue to Psychosocial
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Psychosocial Tab */}
              <TabsContent value="psychosocial" className="p-0 m-0">
                <Card className="border-none shadow-md modern-card">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
                    <CardTitle className="text-xl text-primary-700">Psychosocial Information</CardTitle>
                    <CardDescription>Social, family, and occupational history and functioning</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship/Marital Status</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="E.g., Single, Married, Divorced, Partnered"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation/Employment</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="E.g., Teacher, Currently unemployed, Retired"
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
                      name="livingSituation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Living Situation</FormLabel>
                          <FormDescription>
                            Describe the client's current living arrangements and household members
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client lives in apartment with spouse and two children..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialSupport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Support System</FormLabel>
                          <FormDescription>
                            Describe the client's support network, including family, friends, and community resources
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client reports having a supportive spouse and close relationships with several friends. Also active in church community..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stressors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stressors</FormLabel>
                          <FormDescription>
                            Identify significant life stressors affecting the client
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client reports financial strain following recent job change. Also experiencing stress from caring for aging parent..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="strengths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strengths & Coping Skills</FormLabel>
                          <FormDescription>
                            Identify client's personal strengths, resources, and positive coping strategies
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Client demonstrates strong problem-solving abilities and insight. Reports using exercise and journaling to manage stress..."
                              className="min-h-[100px]"
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
                    <CardTitle className="text-xl text-primary-700">Finalize Intake</CardTitle>
                    <CardDescription>Review and sign the intake assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                      <div className="flex">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Almost Done!</p>
                          <p className="mt-1 text-sm">
                            Please review the entire intake form before signing. Once finalized, 
                            changes can only be made through an addendum.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 text-primary-500 mr-2" />
                        <h3 className="font-medium text-gray-800">Signature</h3>
                      </div>
                      <div className="mt-4 flex items-center">
                        <p className="text-sm text-gray-700">
                          By clicking "Save as Draft" or "Finalize & Sign", I confirm that I, <span className="font-medium">Dr. {user?.firstName} {user?.lastName}</span>, 
                          have completed this intake assessment and that the information contained herein is accurate to the best of my knowledge.
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
                    <button 
                      onClick={finalizeNote} 
                      type="button" 
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md px-6 rounded-md flex items-center"
                      style={{ 
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.375rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      disabled={isSubmitting}
                    >
                      <ClipboardCheck className="h-4 w-4 mr-1.5" />
                      Finalize & Sign
                    </button>
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
                <CardTitle className="text-xl text-primary-700">Intake Assessment Preview</CardTitle>
                <CardDescription>Comprehensive clinical assessment</CardDescription>
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
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{getClientName(form.getValues().clientId || "")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Intake Date</p>
                    <p className="font-medium">{form.getValues().intakeDate ? format(form.getValues().intakeDate, "PPP") : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clinician</p>
                    <p className="font-medium">Dr. {user?.firstName} {user?.lastName} ({user?.licenseType})</p>
                  </div>
                </div>
              </div>
              
              {/* Presenting Problems */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Presenting Problems</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Primary Concern</p>
                    <p className="font-medium">{form.getValues().chiefComplaint || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Onset</p>
                    <p className="font-medium">{form.getValues().symptomOnset || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Severity</p>
                    <p className="font-medium">{form.getValues().severity || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Additional Concerns</p>
                    <p className="font-medium">
                      {form.getValues().additionalConcerns?.length 
                        ? form.getValues().additionalConcerns.join(", ") 
                        : "None reported"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Detailed Description</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().presentingProblemDescription || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Impact on Functioning</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().impactOnFunctioning || "Not specified"}</p>
                  </div>
                </div>
              </div>
              
              {/* Treatment History */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Treatment History</h3>
                {form.getValues().priorTreatment ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Previous Treatment Types</p>
                      <p className="font-medium">
                        {form.getValues().treatmentTypes?.length 
                          ? form.getValues().treatmentTypes.join(", ") 
                          : "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Treatment Details</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().treatmentDetails || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Treatment Effectiveness</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().treatmentEffectiveness || "Not specified"}</p>
                    </div>
                  </div>
                ) : (
                  <p>Client reports no prior mental health treatment.</p>
                )}
              </div>
              
              {/* Medical History */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Medical & Psychiatric History</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Medical Conditions</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().medicalConditions || "None reported"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Current Medications</p>
                    {form.getValues().currentMedications?.length ? (
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prescriber</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {form.getValues().currentMedications.map((med, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2">{med.name}</td>
                                <td className="px-4 py-2">{med.dosage}</td>
                                <td className="px-4 py-2">{med.frequency}</td>
                                <td className="px-4 py-2">{med.reason}</td>
                                <td className="px-4 py-2">{med.prescriber || "Not specified"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-1 p-3 bg-gray-50 rounded-md">None reported</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Medication Allergies</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().medicationAllergies || "None reported"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Family Psychiatric History</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().familyPsychiatricHistory || "None reported"}</p>
                  </div>
                </div>
              </div>
              
              {/* Substance Use */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Substance Use</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().substanceUse?.alcohol ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().substanceUse?.alcohol ? "font-medium" : "text-gray-500"}>Alcohol</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().substanceUse?.tobacco ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().substanceUse?.tobacco ? "font-medium" : "text-gray-500"}>Tobacco/Nicotine</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().substanceUse?.cannabis ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().substanceUse?.cannabis ? "font-medium" : "text-gray-500"}>Cannabis</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().substanceUse?.stimulants ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().substanceUse?.stimulants ? "font-medium" : "text-gray-500"}>Stimulants</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().substanceUse?.opioids ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().substanceUse?.opioids ? "font-medium" : "text-gray-500"}>Opioids</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().substanceUse?.sedatives ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().substanceUse?.sedatives ? "font-medium" : "text-gray-500"}>Sedatives</p>
                  </div>
                  {form.getValues().substanceUse?.other && (
                    <div className="flex space-x-2 items-center col-span-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <p className="font-medium">Other: {form.getValues().substanceUse?.otherDescription}</p>
                    </div>
                  )}
                </div>
                
                {(form.getValues().substanceUse?.alcohol || 
                  form.getValues().substanceUse?.tobacco || 
                  form.getValues().substanceUse?.cannabis ||
                  form.getValues().substanceUse?.stimulants ||
                  form.getValues().substanceUse?.opioids ||
                  form.getValues().substanceUse?.sedatives ||
                  form.getValues().substanceUse?.other) && (
                  <FormField
                    control={form.control}
                    name="substanceUseDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Substance Use Details</FormLabel>
                        <FormDescription>
                          Provide details about frequency, amount, duration, and impact of substance use
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Client reports drinking 3-4 glasses of wine daily for the past 5 years. Reports increased use in the last 6 months following job loss..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Risk Assessment */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Risk Assessment</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().riskFactors?.suicidalIdeation ? "bg-red-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().riskFactors?.suicidalIdeation ? "font-medium" : "text-gray-500"}>Current Suicidal Ideation</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().riskFactors?.suicideAttemptHistory ? "bg-red-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().riskFactors?.suicideAttemptHistory ? "font-medium" : "text-gray-500"}>Suicide Attempt History</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().riskFactors?.homicidalIdeation ? "bg-red-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().riskFactors?.homicidalIdeation ? "font-medium" : "text-gray-500"}>Homicidal Ideation</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().riskFactors?.selfHarmBehaviors ? "bg-red-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().riskFactors?.selfHarmBehaviors ? "font-medium" : "text-gray-500"}>Self-Harm Behaviors</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().riskFactors?.impulsivity ? "bg-yellow-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().riskFactors?.impulsivity ? "font-medium" : "text-gray-500"}>Significant Impulsivity</p>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className={`h-3 w-3 rounded-full ${form.getValues().riskFactors?.aggressionViolence ? "bg-yellow-500" : "bg-gray-300"}`}></div>
                    <p className={form.getValues().riskFactors?.aggressionViolence ? "font-medium" : "text-gray-500"}>Aggression/Violence</p>
                  </div>
                </div>
                
                <div className="mt-3 mb-4">
                  <p className="text-sm text-gray-500">Overall Risk Level</p>
                  <div className="flex items-center mt-1">
                    <Badge className={cn(
                      "text-sm",
                      form.getValues().riskLevel === "none" ? "bg-gray-100 text-gray-700" :
                      form.getValues().riskLevel === "low" ? "bg-blue-100 text-blue-700" :
                      form.getValues().riskLevel === "moderate" ? "bg-yellow-100 text-yellow-700" :
                      form.getValues().riskLevel === "high" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {form.getValues().riskLevel === "none" ? "No identified risk" :
                       form.getValues().riskLevel === "low" ? "Low risk" :
                       form.getValues().riskLevel === "moderate" ? "Moderate risk" :
                       form.getValues().riskLevel === "high" ? "High risk" :
                       "Extreme risk"}
                    </Badge>
                    
                    {form.getValues().safetyPlan && (
                      <Badge className="ml-2 bg-green-100 text-green-700">Safety Plan Completed</Badge>
                    )}
                  </div>
                </div>
                
                {(form.getValues().riskFactors?.suicidalIdeation ||
                  form.getValues().riskFactors?.suicideAttemptHistory ||
                  form.getValues().riskFactors?.homicidalIdeation ||
                  form.getValues().riskFactors?.selfHarmBehaviors ||
                  form.getValues().riskFactors?.impulsivity ||
                  form.getValues().riskFactors?.aggressionViolence) && (
                  <div>
                    <p className="text-sm text-gray-500">Risk Assessment Details</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().riskAssessmentDetails || "Not specified"}</p>
                  </div>
                )}
              </div>
              
              {/* Mental Status Display in Preview */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Mental Status Examination</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Appearance</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.appearance?.length 
                          ? form.getValues().mentalStatus.appearance.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.appearanceOther && 
                         ` (${form.getValues().mentalStatus.appearanceOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Behavior</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.behavior?.length 
                          ? form.getValues().mentalStatus.behavior.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.behaviorOther && 
                         ` (${form.getValues().mentalStatus.behaviorOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Speech</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.speech?.length 
                          ? form.getValues().mentalStatus.speech.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.speechOther && 
                         ` (${form.getValues().mentalStatus.speechOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mood</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.mood?.length 
                          ? form.getValues().mentalStatus.mood.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.moodOther && 
                         ` (${form.getValues().mentalStatus.moodOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Affect</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.affect?.length 
                          ? form.getValues().mentalStatus.affect.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.affectOther && 
                         ` (${form.getValues().mentalStatus.affectOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thought Process</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.thoughtProcess?.length 
                          ? form.getValues().mentalStatus.thoughtProcess.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.thoughtProcessOther && 
                         ` (${form.getValues().mentalStatus.thoughtProcessOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thought Content</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.thoughtContent?.length 
                          ? form.getValues().mentalStatus.thoughtContent.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.thoughtContentOther && 
                         ` (${form.getValues().mentalStatus.thoughtContentOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Perception</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.perception?.length 
                          ? form.getValues().mentalStatus.perception.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.perceptionOther && 
                         ` (${form.getValues().mentalStatus.perceptionOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cognition</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.cognition?.length 
                          ? form.getValues().mentalStatus.cognition.join(", ") 
                          : "Not documented"}
                        {form.getValues().mentalStatus?.cognitionOther && 
                         ` (${form.getValues().mentalStatus.cognitionOther})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Insight/Judgment</p>
                      <p className="font-medium">
                        {form.getValues().mentalStatus?.insightJudgment || "Not documented"}
                      </p>
                    </div>
                  </div>
                  
                  {form.getValues().mentalStatus?.additionalObservations && (
                    <div>
                      <p className="text-sm text-gray-500">Additional Observations</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                        {form.getValues().mentalStatus.additionalObservations}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Diagnosis Display in Preview */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Clinical Diagnosis</h3>
                
                {form.getValues().diagnoses?.length > 0 ? (
                  <div className="space-y-4">
                    {form.getValues().diagnoses.map((diagnosis, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center mb-1">
                          <p className="font-medium">{diagnosis.code}: {diagnosis.name}</p>
                          {diagnosis.isPrimary && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800">Primary</Badge>
                          )}
                        </div>
                        {diagnosis.specifier && (
                          <p className="text-sm text-gray-700">Specifier: {diagnosis.specifier}</p>
                        )}
                        {diagnosis.notes && (
                          <p className="text-sm text-gray-700 mt-1">{diagnosis.notes}</p>
                        )}
                      </div>
                    ))}
                    
                    {form.getValues().rulOutDiagnoses?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 font-medium mb-2">Rule Out Diagnoses:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {form.getValues().rulOutDiagnoses.map((diagnosis, index) => (
                            <li key={index} className="text-gray-700">
                              {diagnosis.code}: {diagnosis.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {form.getValues().zCode && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 font-medium mb-1">Z-Code:</p>
                        <p className="text-gray-700">{form.getValues().zCode}</p>
                      </div>
                    )}
                    
                    {form.getValues().diagnosticFormulation && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 font-medium mb-1">Formulation:</p>
                        <p className="text-gray-700 whitespace-pre-line p-2 bg-white border rounded-md">
                          {form.getValues().diagnosticFormulation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No diagnoses documented</p>
                )}
              </div>
              
              {/* Treatment Recommendations Display in Preview */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Treatment Recommendations</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Recommended Modalities</p>
                      <p className="font-medium">
                        {form.getValues().recommendedTreatment?.recommendedModalities?.length
                          ? form.getValues().recommendedTreatment.recommendedModalities.join(", ")
                          : "None specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Frequency</p>
                      <p className="font-medium">
                        {form.getValues().recommendedTreatment?.recommendedFrequency || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Duration</p>
                      <p className="font-medium">
                        {form.getValues().recommendedTreatment?.recommendedDuration || "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  {form.getValues().recommendedTreatment?.medicationRecommendations && (
                    <div>
                      <p className="text-sm text-gray-500">Medication Recommendations</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                        {form.getValues().recommendedTreatment.medicationRecommendations}
                      </p>
                    </div>
                  )}
                  
                  {form.getValues().recommendedTreatment?.additionalRecommendations && (
                    <div>
                      <p className="text-sm text-gray-500">Additional Recommendations</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                        {form.getValues().recommendedTreatment.additionalRecommendations}
                      </p>
                    </div>
                  )}
                  
                  {form.getValues().recommendedTreatment?.referrals && (
                    <div>
                      <p className="text-sm text-gray-500">Referrals</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                        {form.getValues().recommendedTreatment.referrals}
                      </p>
                    </div>
                  )}
                  
                  {!form.getValues().recommendedTreatment?.recommendedModalities?.length &&
                   !form.getValues().recommendedTreatment?.medicationRecommendations &&
                   !form.getValues().recommendedTreatment?.additionalRecommendations &&
                   !form.getValues().recommendedTreatment?.referrals && (
                    <p className="text-gray-500 italic">No treatment recommendations documented</p>
                  )}
                </div>
              </div>
              
              {/* Psychosocial */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary-700 border-b pb-1">Psychosocial Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Relationship/Marital Status</p>
                    <p className="font-medium">{form.getValues().maritalStatus || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occupation/Employment</p>
                    <p className="font-medium">{form.getValues().occupation || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Living Situation</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().livingSituation || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Social Support System</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().socialSupport || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Current Stressors</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().stressors || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Strengths & Coping Skills</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">{form.getValues().strengths || "Not specified"}</p>
                  </div>
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
                    <span className="font-medium">Clinician:</span> Dr. {user?.firstName} {user?.lastName}, {user?.licenseType}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Status:</span> {form.getValues().status === "draft" ? "Draft" : form.getValues().status === "finalized" ? "Finalized" : "Locked"}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Date:</span> {format(new Date(), "PPP")}
                  </p>
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
              Edit Intake
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
              <button 
                onClick={finalizeNote} 
                type="button" 
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md px-6 rounded-md flex items-center"
                style={{ 
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                disabled={isSubmitting}
              >
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Finalize & Sign
              </button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
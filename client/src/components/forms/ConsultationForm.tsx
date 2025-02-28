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
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, FileSpreadsheet, Save, RefreshCw, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for the consultation form
const consultationSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  consultationDate: z.date({
    required_error: "Consultation date is required",
  }),
  consultationTime: z.string().min(1, "Consultation time is required"),
  consultationType: z.string().min(1, "Consultation type is required"),
  consultee: z.string().min(1, "Consultee name is required"),
  consulteeRole: z.string().min(1, "Consultee role is required"),
  consultationDuration: z.string().min(1, "Duration is required"),
  presentingConcerns: z.string().min(10, "Presenting concerns are required"),
  consultationSummary: z.string().min(10, "Consultation summary is required"),
  recommendations: z.string().min(5, "Recommendations are required"),
  followupNeeded: z.enum(["Yes", "No"]),
  followupDetails: z.string().optional(),
  billableConsultation: z.boolean().default(false),
  copyToClientRecord: z.boolean().default(true),
});

type ConsultationValues = z.infer<typeof consultationSchema>;

const consultationTypes = [
  "Case Consultation",
  "Medication Consultation",
  "Risk Assessment",
  "Treatment Planning",
  "Interdisciplinary Team",
  "Educational Consultation",
  "Other"
];

const consulteeRoles = [
  "Therapist",
  "Psychiatrist",
  "Physician",
  "Nurse",
  "Social Worker",
  "Teacher",
  "School Counselor", 
  "Parent/Guardian",
  "Case Manager",
  "Other"
];

export function ConsultationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<ConsultationValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      clientName: "",
      consultationDate: new Date(),
      consultationTime: "",
      consultationType: "Case Consultation",
      consultee: "",
      consulteeRole: "Therapist",
      consultationDuration: "30 minutes",
      presentingConcerns: "",
      consultationSummary: "",
      recommendations: "",
      followupNeeded: "No",
      followupDetails: "",
      billableConsultation: false,
      copyToClientRecord: true,
    },
  });

  // Watch for followupNeeded field to conditionally render followup details
  const watchFollowupNeeded = form.watch("followupNeeded");

  function onSubmit(data: ConsultationValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Consultation Data:", data);
      
      toast({
        title: "Consultation Note Saved",
        description: `Consultation note for ${data.clientName} has been saved successfully.`,
      });
      
      setIsSubmitting(false);
    }, 1500);
  }

  // Helper function to format dates in inputs
  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Consultation Note</h1>
        <p className="text-gray-600">Document professional consultation about the client's case</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Details about the consultation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="consultationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Consultation Date</FormLabel>
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
                                formatDate(field.value)
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
                  name="consultationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="e.g., 2:30 PM" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="consultationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {consultationTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="consultationDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15 minutes">15 minutes</SelectItem>
                          <SelectItem value="30 minutes">30 minutes</SelectItem>
                          <SelectItem value="45 minutes">45 minutes</SelectItem>
                          <SelectItem value="60 minutes">60 minutes</SelectItem>
                          <SelectItem value="90 minutes">90 minutes</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b">
              <CardTitle>Consultee Information</CardTitle>
              <CardDescription>Details about the person being consulted with</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="consultee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultee Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Name of person consulted with" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="consulteeRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultee Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {consulteeRoles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
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
                  name="billableConsultation"
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
                          Billable Consultation
                        </FormLabel>
                        <FormDescription>
                          Check if this consultation is billable
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="copyToClientRecord"
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
                          Copy to Client Record
                        </FormLabel>
                        <FormDescription>
                          Add to client's official medical record
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
              <CardTitle>Consultation Content</CardTitle>
              <CardDescription>Details of the consultation discussion</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="presentingConcerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presenting Concerns/Questions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the specific concerns or questions that prompted this consultation"
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
                name="consultationSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a summary of the consultation discussion, including key points and clinical insights shared"
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
                name="recommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List specific recommendations, action items, or next steps resulting from this consultation"
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
                name="followupNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Needed?</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="followup-yes" />
                          <Label htmlFor="followup-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="followup-no" />
                          <Label htmlFor="followup-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchFollowupNeeded === "Yes" && (
                <FormField
                  control={form.control}
                  name="followupDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe follow-up plans, including timeline and responsible parties"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
              >
                Save as Draft
              </Button>
              <button
                type="submit"
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-teal-500/25 hover:scale-105"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Save Consultation
                    </>
                  )}
                </span>
                <span className="absolute -bottom-1 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-white opacity-70 transition-all duration-300 group-hover:w-1/2"></span>
              </button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
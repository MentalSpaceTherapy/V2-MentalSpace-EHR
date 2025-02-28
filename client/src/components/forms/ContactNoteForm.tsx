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
import { CalendarIcon, Clock, Phone, Save, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for the contact note form
const contactNoteSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  contactDate: z.date({
    required_error: "Contact date is required",
  }),
  contactTime: z.string().min(1, "Contact time is required"),
  contactDuration: z.string().min(1, "Duration is required"),
  contactMethod: z.string().min(1, "Contact method is required"),
  contactInitiator: z.string().min(1, "Contact initiator is required"),
  contactPurpose: z.string().min(1, "Contact purpose is required"),
  contactSummary: z.string().min(10, "Contact summary is required"),
  followupNeeded: z.enum(["Yes", "No"]),
  followupDetails: z.string().optional(),
});

type ContactNoteValues = z.infer<typeof contactNoteSchema>;

const contactMethods = [
  "Phone",
  "Text Message",
  "Email",
  "Video Call",
  "Social Media",
  "Other"
];

const contactPurposes = [
  "Scheduling",
  "Rescheduling",
  "Cancellation",
  "Billing Question",
  "Clinical Question",
  "Medication-related",
  "Crisis Intervention",
  "Insurance Question",
  "Client Update",
  "Coordination of Care",
  "Other"
];

export function ContactNoteForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<ContactNoteValues>({
    resolver: zodResolver(contactNoteSchema),
    defaultValues: {
      clientName: "",
      contactDate: new Date(),
      contactTime: "",
      contactDuration: "5 minutes",
      contactMethod: "Phone",
      contactInitiator: "Client",
      contactPurpose: "Scheduling",
      contactSummary: "",
      followupNeeded: "No",
      followupDetails: "",
    },
  });

  // Watch for followupNeeded field to conditionally render followup details
  const watchFollowupNeeded = form.watch("followupNeeded");

  function onSubmit(data: ContactNoteValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Contact Note Data:", data);
      
      toast({
        title: "Contact Note Saved",
        description: `Contact note for ${data.clientName} has been saved successfully.`,
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Contact Note</h1>
        <p className="text-gray-600">Document client contact outside of scheduled sessions</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Information about the contact event</CardDescription>
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
                  name="contactDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Contact Date</FormLabel>
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
                  name="contactTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Time</FormLabel>
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
                  name="contactDuration"
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
                          <SelectItem value="5 minutes">5 minutes</SelectItem>
                          <SelectItem value="10 minutes">10 minutes</SelectItem>
                          <SelectItem value="15 minutes">15 minutes</SelectItem>
                          <SelectItem value="20 minutes">20 minutes</SelectItem>
                          <SelectItem value="30 minutes">30 minutes</SelectItem>
                          <SelectItem value="45 minutes">45 minutes</SelectItem>
                          <SelectItem value="60 minutes">60 minutes</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactMethods.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
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
                  name="contactInitiator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Initiated By</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Client" id="initiator-client" />
                            <Label htmlFor="initiator-client">Client</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Therapist" id="initiator-therapist" />
                            <Label htmlFor="initiator-therapist">Therapist</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="initiator-other" />
                            <Label htmlFor="initiator-other">Other</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Contact</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactPurposes.map(purpose => (
                            <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                          ))}
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
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle>Contact Summary</CardTitle>
              <CardDescription>Details of the conversation and follow-up</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="contactSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary of Contact</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a summary of the contact, including key points discussed and any decisions made"
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
                          placeholder="Describe any follow-up actions needed, including timelines and responsible parties"
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
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Save Contact Note
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
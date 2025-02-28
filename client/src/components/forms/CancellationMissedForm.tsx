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
import { CalendarIcon, CalendarX, Save, RefreshCw, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SESSION_TYPES, SESSION_MEDIUMS } from "@/lib/constants";

// Schema for the cancellation/missed appointment form
const cancellationSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  cancellationDate: z.date({
    required_error: "Cancellation date is required",
  }),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  sessionType: z.string().min(1, "Session type is required"),
  sessionMedium: z.string().min(1, "Session medium is required"),
  cancellationType: z.string().min(1, "Cancellation type is required"),
  notificationMethod: z.string().min(1, "Notification method is required"),
  noticePeriod: z.string().min(1, "Notice period is required"),
  chargeLateFee: z.boolean().default(false),
  lateFeeAmount: z.string().optional(),
  billInsurance: z.boolean().default(false),
  reason: z.string().min(5, "Reason is required"),
  therapistNotes: z.string().optional(),
  followUpNeeded: z.boolean().default(false),
  followUpAction: z.string().optional(),
});

type CancellationFormValues = z.infer<typeof cancellationSchema>;

// Cancellation types
const cancellationTypes = [
  "Client Cancellation",
  "Client No-Show",
  "Therapist Cancellation",
  "Emergency Cancellation",
  "Weather-Related",
  "Technology Issue",
  "Other"
];

// Notification methods
const notificationMethods = [
  "Phone Call",
  "Text Message",
  "Email",
  "Client Portal",
  "None (No-show)",
  "Other"
];

// Notice periods
const noticePeriods = [
  "24+ hours notice",
  "Less than 24 hours",
  "Less than 12 hours",
  "No notice (No-show)",
  "Same day"
];

export function CancellationMissedForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationSchema),
    defaultValues: {
      clientName: "",
      cancellationDate: new Date(),
      appointmentTime: "",
      sessionType: "Individual Therapy",
      sessionMedium: "Telehealth",
      cancellationType: "Client Cancellation",
      notificationMethod: "Phone Call",
      noticePeriod: "24+ hours notice",
      chargeLateFee: false,
      lateFeeAmount: "",
      billInsurance: false,
      reason: "",
      therapistNotes: "",
      followUpNeeded: false,
      followUpAction: "",
    },
  });

  // Watch for values that determine conditional fields
  const chargeLateFee = form.watch("chargeLateFee");
  const followUpNeeded = form.watch("followUpNeeded");
  const cancellationType = form.watch("cancellationType");
  
  function onSubmit(data: CancellationFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Cancellation/Missed Appointment Data:", data);
      
      toast({
        title: "Document Saved",
        description: `Cancellation record for ${data.clientName} has been saved successfully.`,
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Cancellation/Missed Appointment Form</h1>
        <p className="text-gray-600">Document appointment cancellations and no-shows with billing options</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Information about the cancelled/missed appointment</CardDescription>
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
                  name="cancellationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Appointment Date</FormLabel>
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
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
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
                          {SESSION_TYPES.map(type => (
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
                  name="sessionMedium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Medium</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session medium" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSION_MEDIUMS.map(medium => (
                            <SelectItem key={medium} value={medium}>{medium}</SelectItem>
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
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle>Cancellation Details</CardTitle>
              <CardDescription>Information about the cancellation or missed appointment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cancellationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Type</FormLabel>
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
                          {cancellationTypes.map(type => (
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
                  name="notificationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Method</FormLabel>
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
                          {notificationMethods.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
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
                name="noticePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notice period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {noticePeriods.map(period => (
                          <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Cancellation/Absence</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter detailed reason for the cancellation or missed appointment"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing Options</CardTitle>
                  <CardDescription>Fee settings for missed appointment</CardDescription>
                </div>
                {cancellationType !== "Therapist Cancellation" && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none">
                    Billable
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {cancellationType !== "Therapist Cancellation" && (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-md bg-amber-50">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-amber-600" />
                      <div>
                        <h3 className="text-sm font-medium">Charge Late Cancellation Fee</h3>
                        <p className="text-xs text-gray-500">Applies to cancellations with insufficient notice</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="chargeLateFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {chargeLateFee && (
                    <FormField
                      control={form.control}
                      name="lateFeeAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Late Fee Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="0.00"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Standard late fee is determined by your practice policy
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="flex items-center justify-between p-4 border rounded-md bg-amber-50">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-amber-600" />
                      <div>
                        <h3 className="text-sm font-medium">Bill Insurance for Missed Appointment</h3>
                        <p className="text-xs text-gray-500">Check your insurance policies regarding missed appointments</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="billInsurance"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {cancellationType === "Therapist Cancellation" && (
                <div className="flex p-4 border rounded-md bg-blue-50">
                  <CalendarX className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-700">Therapist Cancellation Notice</h3>
                    <p className="text-xs text-blue-600 mt-1">
                      No charges will be applied to the client when the session is cancelled by the therapist.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
              <CardTitle>Notes & Follow-up</CardTitle>
              <CardDescription>Additional notes and follow-up actions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="therapistNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Therapist Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional notes about this cancellation"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      These notes are only visible to therapists and not included in client-facing documentation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between p-4 border rounded-md bg-yellow-50">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  <div>
                    <h3 className="text-sm font-medium">Follow-up Required</h3>
                    <p className="text-xs text-gray-500">Flag this cancellation for follow-up</p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="followUpNeeded"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {followUpNeeded && (
                <FormField
                  control={form.control}
                  name="followUpAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Action Plan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the follow-up plan (e.g., 'Call client to reschedule within 2 days')"
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
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/25 hover:scale-105"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Document
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
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
import { CalendarIcon, FileClock, Save, RefreshCw, FilePlus, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

// Schema for the absence note form
const absenceNoteSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientTitle: z.string().min(1, "Recipient title is required"),
  recipientOrganization: z.string().min(1, "Organization name is required"),
  absenceStartDate: z.date({
    required_error: "Start date is required",
  }),
  absenceEndDate: z.date({
    required_error: "End date is required",
  }),
  absenceReason: z.string().min(3, "Absence reason is required"),
  additionalInformation: z.string().optional(),
  restrictionsLimitations: z.string().optional(),
  returnToWorkDate: z.date().optional(),
  includeReturnDate: z.boolean().default(false),
  includeRestrictionsLimitations: z.boolean().default(false),
  includeProviderInfo: z.boolean().default(true),
  includeProviderSignature: z.boolean().default(true),
});

type AbsenceNoteValues = z.infer<typeof absenceNoteSchema>;

export function AbsenceNoteForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize the form with default values
  const form = useForm<AbsenceNoteValues>({
    resolver: zodResolver(absenceNoteSchema),
    defaultValues: {
      clientName: "",
      recipientName: "",
      recipientTitle: "",
      recipientOrganization: "",
      absenceStartDate: new Date(),
      absenceEndDate: new Date(),
      absenceReason: "",
      additionalInformation: "",
      restrictionsLimitations: "",
      includeReturnDate: false,
      includeRestrictionsLimitations: false,
      includeProviderInfo: true,
      includeProviderSignature: true,
    },
  });

  // Watch for checkbox fields to conditionally render related inputs
  const watchIncludeReturnDate = form.watch("includeReturnDate");
  const watchIncludeRestrictionsLimitations = form.watch("includeRestrictionsLimitations");

  function onSubmit(data: AbsenceNoteValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Absence Note Data:", data);
      
      toast({
        title: "Absence Note Saved",
        description: `Absence note for ${data.clientName} has been saved successfully.`,
      });
      
      setIsSubmitting(false);
      // After saving, show preview mode
      setPreviewMode(true);
    }, 1500);
  }

  // Switch back to edit mode
  function handleEditClick() {
    setPreviewMode(false);
  }

  // Simulate printing the note
  function handlePrintClick() {
    toast({
      title: "Print Document",
      description: "The document has been sent to the printer.",
    });
  }

  // Helper function to format dates in inputs
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  if (previewMode) {
    const formData = form.getValues();
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">MentalSpace Health Services</h1>
            <p className="text-gray-600">123 Therapy Lane, Wellness City, ST 12345</p>
            <p className="text-gray-600">Phone: (555) 123-4567 • Email: care@mentalspace.com</p>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase tracking-wider">Absence Verification Note</h2>
          </div>
          
          <div className="mb-6">
            <p className="mb-4">
              <span className="font-bold">Date: </span>
              {format(new Date(), "MMMM d, yyyy")}
            </p>
            
            <p className="mb-4">
              <span className="font-bold">To: </span>
              {formData.recipientName}, {formData.recipientTitle}
              <br />
              {formData.recipientOrganization}
            </p>
            
            <p className="mb-4">
              <span className="font-bold">Re: </span>
              {formData.clientName}
            </p>
          </div>
          
          <div className="mb-8">
            <p className="mb-4">
              This letter confirms that {formData.clientName} was absent from work/school for 
              mental health reasons from {formatDate(formData.absenceStartDate)} to {formatDate(formData.absenceEndDate)}.
            </p>
            
            <p className="mb-4">
              <span className="font-bold">Reason for absence: </span>
              {formData.absenceReason}
            </p>
            
            {formData.additionalInformation && (
              <p className="mb-4">
                <span className="font-bold">Additional information: </span>
                {formData.additionalInformation}
              </p>
            )}
            
            {watchIncludeReturnDate && formData.returnToWorkDate && (
              <p className="mb-4">
                <span className="font-bold">Return to work/school date: </span>
                {formatDate(formData.returnToWorkDate)}
              </p>
            )}
            
            {watchIncludeRestrictionsLimitations && formData.restrictionsLimitations && (
              <p className="mb-4">
                <span className="font-bold">Restrictions/Limitations: </span>
                {formData.restrictionsLimitations}
              </p>
            )}
          </div>
          
          {formData.includeProviderInfo && (
            <div className="mt-12">
              <p className="mb-1">Sincerely,</p>
              
              {formData.includeProviderSignature && (
                <div className="h-16 mb-2 border-b border-dashed border-gray-400 flex items-end">
                  <p className="italic text-gray-600">Signature on file</p>
                </div>
              )}
              
              <p className="font-bold">Dr. Sarah Johnson</p>
              <p>Licensed Clinical Psychologist</p>
              <p>License #PSY12345</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleEditClick}
          >
            Edit Note
          </Button>
          <Button 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handlePrintClick}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Absence Note</h1>
        <p className="text-gray-600">Create an official absence verification for school or work</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Basic client information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle>Recipient Information</CardTitle>
              <CardDescription>Information about who will receive this note</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the person who will receive this note
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="recipientTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Human Resources Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recipientOrganization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization/School</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
              <CardTitle>Absence Details</CardTitle>
              <CardDescription>Information about the client's absence</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="absenceStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                  name="absenceEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
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
                            disabled={(date) =>
                              date < form.getValues().absenceStartDate
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="absenceReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Absence</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Mental health appointment, Medical treatment, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Keep this generic to protect client privacy
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details that should be included in the note"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="includeReturnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Include Return Date
                        </FormLabel>
                        <FormDescription>
                          Specify when the client can return to work/school
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {watchIncludeReturnDate && (
                  <FormField
                    control={form.control}
                    name="returnToWorkDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col ml-10">
                        <FormLabel>Return to Work/School Date</FormLabel>
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
                              disabled={(date) =>
                                date < form.getValues().absenceEndDate
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="includeRestrictionsLimitations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Include Restrictions/Limitations
                        </FormLabel>
                        <FormDescription>
                          Specify any restrictions or limitations upon return
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {watchIncludeRestrictionsLimitations && (
                  <FormField
                    control={form.control}
                    name="restrictionsLimitations"
                    render={({ field }) => (
                      <FormItem className="ml-10">
                        <FormLabel>Restrictions/Limitations</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Reduced work hours, flexible schedule, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle>Provider Information</CardTitle>
              <CardDescription>Information about the healthcare provider</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="includeProviderInfo"
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
                        Include Provider Information
                      </FormLabel>
                      <FormDescription>
                        Include provider name, credentials, and license number
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="includeProviderSignature"
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
                        Include Provider Signature
                      </FormLabel>
                      <FormDescription>
                        Include a line for provider signature
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
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
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-amber-600 to-yellow-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/25 hover:scale-105"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileClock className="mr-2 h-4 w-4" />
                      Generate Note
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
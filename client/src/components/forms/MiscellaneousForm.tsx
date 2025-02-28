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
import { CalendarIcon, FileQuestion, Save, RefreshCw, Upload, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for the miscellaneous form
const miscellaneousFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  documentDate: z.date({
    required_error: "Document date is required",
  }),
  documentTitle: z.string().min(1, "Document title is required"),
  documentType: z.string().min(1, "Document type is required"),
  associatedProviders: z.string().optional(),
  content: z.string().min(5, "Content is required"),
  additionalNotes: z.string().optional(),
  attachmentDescription: z.string().optional(),
});

type MiscellaneousFormValues = z.infer<typeof miscellaneousFormSchema>;

const miscDocumentTypes = [
  "Letter to Client",
  "Letter to External Provider",
  "Educational Material",
  "Release of Information",
  "Insurance Documentation",
  "Court Documentation",
  "School Documentation",
  "Treatment Summary",
  "Other",
];

export function MiscellaneousForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);

  // Initialize the form with default values
  const form = useForm<MiscellaneousFormValues>({
    resolver: zodResolver(miscellaneousFormSchema),
    defaultValues: {
      clientName: "",
      documentDate: new Date(),
      documentTitle: "",
      documentType: "Other",
      associatedProviders: "",
      content: "",
      additionalNotes: "",
      attachmentDescription: "",
    },
  });

  function onSubmit(data: MiscellaneousFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Miscellaneous Document Data:", data);
      
      toast({
        title: "Document Saved",
        description: `${data.documentTitle} for ${data.clientName} has been saved successfully.`,
      });
      
      setIsSubmitting(false);
    }, 1500);
  }

  // Helper function to format dates in inputs
  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  // Handle file upload
  const handleFileUpload = () => {
    // In a real app, this would trigger a file input
    toast({
      title: "File Attached",
      description: "Your file has been attached to this document.",
    });
    setHasAttachment(true);
  };

  // Remove attachment
  const handleRemoveAttachment = () => {
    toast({
      title: "File Removed",
      description: "The attachment has been removed.",
      variant: "destructive",
    });
    setHasAttachment(false);
    form.setValue("attachmentDescription", "");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Miscellaneous Document</h1>
        <p className="text-gray-600">Create and document any additional client information</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Document details and classification</CardDescription>
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
                  name="documentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Document Date</FormLabel>
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
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {miscDocumentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
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
                name="documentTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Give this document a descriptive title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A clear title helps with future searching and organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="associatedProviders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Providers (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="List any other providers associated with this document" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include names of any other providers involved
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
              <CardTitle>Document Content</CardTitle>
              <CardDescription>Main content and notes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the main content of your document here"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes or context about this document"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-700">Attachments</h3>
                  
                  {!hasAttachment ? (
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex items-center"
                      onClick={handleFileUpload}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={handleRemoveAttachment}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                {hasAttachment ? (
                  <div>
                    <div className="flex items-center p-3 mb-3 bg-white rounded border">
                      <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">attached_document.pdf</span>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="attachmentDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attachment Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Briefly describe the attached file" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-md bg-white">
                    <FileQuestion className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      Drag and drop a file here, or click "Upload File"
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                )}
              </div>
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
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-gray-600 to-slate-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-gray-500/25 hover:scale-105"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
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
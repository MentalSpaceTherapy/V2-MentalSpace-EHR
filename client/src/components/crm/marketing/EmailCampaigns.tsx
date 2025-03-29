import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCcw, AlertCircle, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define form schema for email campaigns
const emailCampaignSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  htmlTemplate: z.string().min(1, "HTML template is required"),
  textTemplate: z.string().min(1, "Text template is required"),
  from: z.string().email("Must be a valid email"),
  fromName: z.string().optional(),
  testEmail: z.string().email("Must be a valid email").optional(),
});

export default function EmailCampaigns() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('compose');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  // Form setup
  const form = useForm<z.infer<typeof emailCampaignSchema>>({
    resolver: zodResolver(emailCampaignSchema),
    defaultValues: {
      subject: '',
      htmlTemplate: '<html><body><h1>Hello {firstName}</h1><p>Your content here</p></body></html>',
      textTemplate: 'Hello {firstName},\n\nYour content here',
      from: 'no-reply@mentalspace.health',
      fromName: 'MentalSpace EHR',
      testEmail: '',
    },
  });
  
  // Check SendGrid configuration status
  const { data: sendGridStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['/api/sendgrid/status'],
    queryFn: () => apiRequest('/api/sendgrid/status', { method: 'GET' })
  });
  
  // Get clients to use as recipients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: () => apiRequest('/api/clients', { method: 'GET' })
  });
  
  // Get leads to use as recipients
  const { data: leads, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['/api/leads'],
    queryFn: () => apiRequest('/api/leads', { method: 'GET' })
  });
  // No need for constant contact related state variables anymore

  // Load client and lead data when component mounts
  useEffect(() => {
    // No need to fetch data here as it's handled by React Query
  }, []);

  // Get client IDs for recipient selection
  const allClientIds = clients ? clients.map((client: any) => `client-${client.id}`) : [];
  
  // Get lead IDs for recipient selection
  const allLeadIds = leads ? leads.map((lead: any) => `lead-${lead.id}`) : [];

  // The handleCreateCampaign, handleSendTestEmail, and handleScheduleCampaign functions
  // are replaced by the new mutations and their handler functions below

  // Function to get appropriate badge styling based on status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "sending":
        return <Badge className="bg-orange-500">Sending</Badge>;
      case "sent":
        return <Badge className="bg-green-600">Sent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If SendGrid is not properly configured
  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking SendGrid configuration...</span>
      </div>
    );
  }
  
  if (!sendGridStatus?.configured) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>Create and manage your email marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>SendGrid Not Configured</AlertTitle>
            <AlertDescription>
              Your SendGrid API key is not properly configured. Please set up your SendGrid API key in the environment variables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Mutations for sending emails
  const testEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/sendgrid/send-test', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "Your test email has been sent successfully.",
        variant: "default",
      });
      form.setValue('testEmail', '');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send test email",
        description: error.message || "There was an error sending your test email.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for sending campaign
  const campaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/sendgrid/send-campaign', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: "Campaign sent",
        description: "Your email campaign has been sent successfully.",
        variant: "default",
      });
      setIsSending(false);
      setSelectedClients([]);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send campaign",
        description: error.message || "There was an error sending your campaign.",
        variant: "destructive",
      });
      setIsSending(false);
    }
  });
  
  // Handle sending test email
  const handleSendTest = () => {
    const formValues = form.getValues();
    
    if (!formValues.testEmail) {
      toast({
        title: "Test email required",
        description: "Please enter a test email address.",
        variant: "destructive",
      });
      return;
    }
    
    testEmailMutation.mutate({
      to: formValues.testEmail,
      from: formValues.from,
      name: formValues.fromName,
      subject: formValues.subject,
      text: formValues.textTemplate,
      html: formValues.htmlTemplate
    });
  };
  
  // Handle sending email campaign
  const handleSendCampaign = () => {
    if (selectedClients.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    const formValues = form.getValues();
    
    // Prepare recipient data from selected clients and leads
    const recipients = selectedClients.map(id => {
      if (id.startsWith('client-')) {
        const clientId = id.replace('client-', '');
        const client = clients?.find((c: any) => c.id.toString() === clientId);
        
        if (client) {
          return {
            email: client.email,
            name: `${client.firstName} ${client.lastName}`,
            dynamicData: {
              firstName: client.firstName,
              lastName: client.lastName,
              type: 'client'
            }
          };
        }
      } else if (id.startsWith('lead-')) {
        const leadId = id.replace('lead-', '');
        const lead = leads?.find((l: any) => l.id.toString() === leadId);
        
        if (lead) {
          return {
            email: lead.email,
            name: lead.name,
            dynamicData: {
              firstName: lead.name.split(' ')[0],
              lastName: lead.name.split(' ').slice(1).join(' '),
              type: 'lead'
            }
          };
        }
      }
      
      return null;
    }).filter(Boolean);
    
    campaignMutation.mutate({
      recipients,
      from: formValues.from,
      fromName: formValues.fromName,
      subject: formValues.subject,
      textTemplate: formValues.textTemplate,
      htmlTemplate: formValues.htmlTemplate
    });
  };
  
  // Toggle select all clients
  const handleSelectAllClients = () => {
    if (!clients) return;
    
    if (selectedClients.length === allClientIds.length) {
      // Deselect all if all are already selected
      setSelectedClients([]);
    } else {
      // Select all
      setSelectedClients(allClientIds);
    }
  };
  
  // Handle select all leads
  const handleSelectAllLeads = () => {
    if (!leads) return;
    
    if (selectedClients.length === allLeadIds.length) {
      // Deselect all if all are already selected
      setSelectedClients([]);
    } else {
      // Select all
      setSelectedClients(allLeadIds);
    }
  };
  
  // Main component return
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Campaign Builder</CardTitle>
          <CardDescription>
            Create personalized email campaigns to send to your clients and leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compose" className="mt-4">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter subject line"
                      {...form.register("subject")}
                    />
                    {form.formState.errors.subject && (
                      <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="from">From Email</Label>
                    <Input
                      id="from"
                      placeholder="your@email.com"
                      {...form.register("from")}
                    />
                    {form.formState.errors.from && (
                      <p className="text-sm text-red-500">{form.formState.errors.from.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    placeholder="Your Name or Practice Name"
                    {...form.register("fromName")}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="htmlTemplate">
                    HTML Content
                    <span className="text-xs text-muted-foreground ml-2">
                      (Use {"{firstName}"} for personalization)
                    </span>
                  </Label>
                  <Textarea
                    id="htmlTemplate"
                    placeholder="<html><body><h1>Hello {firstName}</h1><p>Your content here</p></body></html>"
                    rows={10}
                    {...form.register("htmlTemplate")}
                  />
                  {form.formState.errors.htmlTemplate && (
                    <p className="text-sm text-red-500">{form.formState.errors.htmlTemplate.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="textTemplate">
                    Plain Text Version
                    <span className="text-xs text-muted-foreground ml-2">
                      (Required for accessibility)
                    </span>
                  </Label>
                  <Textarea
                    id="textTemplate"
                    placeholder="Hello {firstName}, Your content here"
                    rows={4}
                    {...form.register("textTemplate")}
                  />
                  {form.formState.errors.textTemplate && (
                    <p className="text-sm text-red-500">{form.formState.errors.textTemplate.message}</p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPreviewHtml(form.getValues().htmlTemplate);
                      setSelectedTab("preview");
                    }}
                  >
                    Preview
                  </Button>
                  
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.setValue('testEmail', '');
                        document.getElementById('test-email-dialog-trigger')?.click();
                      }}
                    >
                      Send Test
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setSelectedTab("recipients")}
                    >
                      Next: Select Recipients
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="recipients" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Recipients</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose which clients or leads will receive this email campaign.
                  </p>
                </div>
                
                {isLoadingClients || isLoadingLeads ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading contacts...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {clients && clients.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Clients</h4>
                          <Button variant="outline" size="sm" onClick={handleSelectAllClients}>
                            {selectedClients.length === allClientIds.length ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="border rounded-md divide-y">
                          {clients.map((client: any) => (
                            <div key={client.id} className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id={`client-${client.id}`}
                                  checked={selectedClients.includes(`client-${client.id}`)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedClients([...selectedClients, `client-${client.id}`]);
                                    } else {
                                      setSelectedClients(selectedClients.filter(id => id !== `client-${client.id}`));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor={`client-${client.id}`} className="flex flex-col">
                                  <span className="font-medium">{client.firstName} {client.lastName}</span>
                                  <span className="text-sm text-muted-foreground">{client.email}</span>
                                </label>
                              </div>
                              <Badge>Client</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {leads && leads.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Leads</h4>
                          <Button variant="outline" size="sm" onClick={handleSelectAllLeads}>
                            {selectedClients.length === allLeadIds.length ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="border rounded-md divide-y">
                          {leads.map((lead: any) => (
                            <div key={lead.id} className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id={`lead-${lead.id}`}
                                  checked={selectedClients.includes(`lead-${lead.id}`)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedClients([...selectedClients, `lead-${lead.id}`]);
                                    } else {
                                      setSelectedClients(selectedClients.filter(id => id !== `lead-${lead.id}`));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor={`lead-${lead.id}`} className="flex flex-col">
                                  <span className="font-medium">{lead.name}</span>
                                  <span className="text-sm text-muted-foreground">{lead.email}</span>
                                </label>
                              </div>
                              <Badge variant="outline">Lead</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <span className="text-sm font-medium">
                          {selectedClients.length} recipient{selectedClients.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTab("compose")}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleSendCampaign}
                          disabled={selectedClients.length === 0 || isSending}
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Campaign"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Email Preview</h3>
                  <Button variant="outline" onClick={() => setSelectedTab("compose")}>Back to Editor</Button>
                </div>
                
                <Card className="border">
                  <CardHeader className="border-b bg-muted/50">
                    <div className="grid gap-1">
                      <div className="font-medium">Subject: {form.getValues().subject}</div>
                      <div className="text-sm text-muted-foreground">
                        From: {form.getValues().fromName || form.getValues().from} ({form.getValues().from})
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Test Email Dialog */}
      <Dialog>
        <DialogTrigger className="hidden" id="test-email-dialog-trigger">Open</DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test version of your email to preview how it will look.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                placeholder="your@email.com"
                {...form.register("testEmail")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => document.getElementById('test-email-dialog-trigger')?.click()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={testEmailMutation.isPending}
            >
              {testEmailMutation.isPending ? "Sending..." : "Send Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
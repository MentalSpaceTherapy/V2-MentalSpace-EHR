import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Send, AlertTriangle, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Email schema for validation
const emailCampaignSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  htmlTemplate: z.string().min(1, "HTML content is required"),
  textTemplate: z.string().optional(),
  from: z.string().email("Must be a valid email").optional(),
  fromName: z.string().optional(),
  testEmail: z.string().email("Must be a valid email").optional(),
});

export default function EmailCampaigns() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('compose');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof emailCampaignSchema>>({
    resolver: zodResolver(emailCampaignSchema),
    defaultValues: {
      subject: '',
      htmlTemplate: '<html><body><h1>Hello {{firstName}}</h1><p>Your content here</p></body></html>',
      textTemplate: 'Hello {{firstName}},\n\nYour content here',
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
  
  // Mutation for sending test email
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
  
  // Handle form submission for test email
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
    
    const testData = {
      to: formValues.testEmail,
      subject: formValues.subject,
      text: formValues.textTemplate || '',
      html: formValues.htmlTemplate,
      from: formValues.from,
      name: formValues.fromName
    };
    
    testEmailMutation.mutate(testData);
  };
  
  // Handle form submission for sending campaign
  const handleSendCampaign = (formValues: z.infer<typeof emailCampaignSchema>) => {
    if (selectedClients.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    // Prepare recipients with dynamic data
    const recipients = selectedClients.map(id => {
      const isClient = id.startsWith('client-');
      const isLead = id.startsWith('lead-');
      const actualId = id.split('-')[1];
      
      let recipient;
      
      if (isClient) {
        const client = clients?.find((c: any) => c.id === parseInt(actualId));
        recipient = {
          email: client?.email,
          name: `${client?.firstName} ${client?.lastName}`,
          dynamicData: {
            firstName: client?.firstName || '',
            lastName: client?.lastName || '',
            fullName: `${client?.firstName} ${client?.lastName}`.trim(),
            email: client?.email || '',
            // Add more dynamic data as needed
          }
        };
      } else if (isLead) {
        const lead = leads?.find((l: any) => l.id === parseInt(actualId));
        recipient = {
          email: lead?.email,
          name: lead?.name || '',
          dynamicData: {
            firstName: lead?.name?.split(' ')[0] || '',
            lastName: lead?.name?.split(' ').slice(1).join(' ') || '',
            fullName: lead?.name || '',
            email: lead?.email || '',
            // Add more dynamic data as needed
          }
        };
      }
      
      return recipient;
    }).filter(r => r && r.email); // Filter out recipients with no email
    
    const campaignData = {
      recipients,
      subject: formValues.subject,
      htmlTemplate: formValues.htmlTemplate,
      textTemplate: formValues.textTemplate || '',
      from: formValues.from,
      fromName: formValues.fromName
    };
    
    campaignMutation.mutate(campaignData);
  };
  
  // Update HTML preview when template changes
  useEffect(() => {
    setPreviewHtml(form.getValues().htmlTemplate);
  }, [form.watch('htmlTemplate')]);
  
  // Handle client/lead selection
  const handleRecipientToggle = (id: string) => {
    setSelectedClients(prev => 
      prev.includes(id) 
        ? prev.filter(clientId => clientId !== id) 
        : [...prev, id]
    );
  };
  
  // Toggle select all clients/leads
  const handleSelectAllClients = () => {
    if (!clients) return;
    
    const allClientIds = clients.map((client: any) => `client-${client.id}`);
    
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
    
    const allLeadIds = leads.map((lead: any) => `lead-${lead.id}`);
    
    if (selectedClients.length === allLeadIds.length) {
      // Deselect all if all are already selected
      setSelectedClients([]);
    } else {
      // Select all
      setSelectedClients(allLeadIds);
    }
  };
  
  // Check if SendGrid is properly configured
  const isConfigured = sendGridStatus?.configured;
  
  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking SendGrid configuration...</span>
      </div>
    );
  }
  
  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>SendGrid Not Configured</AlertTitle>
        <AlertDescription>
          Your SendGrid API key is not properly configured. Please set up your SendGrid API key in the environment variables.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Email Marketing Campaigns</CardTitle>
          <CardDescription>
            Create and send targeted email campaigns to your clients and leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="compose">Compose Email</TabsTrigger>
              <TabsTrigger value="recipients">Select Recipients</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSendCampaign)}>
                <TabsContent value="compose" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input placeholder="noreply@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Practice Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="htmlTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTML Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter HTML content" 
                            className="font-mono h-64"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use variables like {`{{firstName}}`}, {`{{lastName}}`}, etc. for personalization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="textTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plain Text Version (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter plain text content" 
                            className="font-mono h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Plain text alternative for email clients that don't support HTML
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border rounded-md p-4 bg-muted/20">
                    <h3 className="font-medium mb-2">Test Your Email</h3>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="testEmail"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Enter test email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button" 
                        onClick={handleSendTest}
                        disabled={testEmailMutation.isPending}
                        variant="outline"
                      >
                        {testEmailMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Test
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="recipients">
                  <div className="space-y-4">
                    <div className="border rounded-md p-4 bg-muted/20">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Select Clients</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleSelectAllClients}
                        >
                          {clients && selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      
                      {isLoadingClients ? (
                        <div className="flex items-center justify-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Loading clients...</span>
                        </div>
                      ) : clients && clients.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {clients.map((client: any) => (
                            <div 
                              key={`client-${client.id}`} 
                              className="flex items-center space-x-2 border rounded-md p-2"
                            >
                              <Checkbox 
                                id={`client-${client.id}`}
                                checked={selectedClients.includes(`client-${client.id}`)}
                                onCheckedChange={() => handleRecipientToggle(`client-${client.id}`)}
                              />
                              <div className="flex-1 truncate">
                                <Label 
                                  htmlFor={`client-${client.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {client.firstName} {client.lastName}
                                </Label>
                                <p className="text-sm text-muted-foreground truncate">
                                  {client.email || 'No email'}
                                </p>
                              </div>
                              <Badge variant={client.status === 'active' ? 'default' : 'outline'}>
                                {client.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No clients found
                        </p>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="border rounded-md p-4 bg-muted/20">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Select Leads</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleSelectAllLeads}
                        >
                          {leads && selectedClients.length === leads.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      
                      {isLoadingLeads ? (
                        <div className="flex items-center justify-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Loading leads...</span>
                        </div>
                      ) : leads && leads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {leads.map((lead: any) => (
                            <div 
                              key={`lead-${lead.id}`} 
                              className="flex items-center space-x-2 border rounded-md p-2"
                            >
                              <Checkbox 
                                id={`lead-${lead.id}`}
                                checked={selectedClients.includes(`lead-${lead.id}`)}
                                onCheckedChange={() => handleRecipientToggle(`lead-${lead.id}`)}
                              />
                              <div className="flex-1 truncate">
                                <Label 
                                  htmlFor={`lead-${lead.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {lead.name || 'Unnamed Lead'}
                                </Label>
                                <p className="text-sm text-muted-foreground truncate">
                                  {lead.email || 'No email'}
                                </p>
                              </div>
                              <Badge variant={lead.status === 'new' ? 'default' : 'outline'}>
                                {lead.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No leads found
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-muted/30 rounded-md p-3 mt-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        <span className="font-medium">Selected Recipients: {selectedClients.length}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview">
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Subject:</h3>
                      <p className="text-lg">{form.watch('subject')}</p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">From:</h3>
                      <p>{form.watch('fromName')} &lt;{form.watch('from')}&gt;</p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">HTML Preview:</h3>
                      <div 
                        className="border p-4 rounded-md bg-white"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Plain Text Preview:</h3>
                      <pre className="whitespace-pre-wrap bg-muted p-3 rounded-md font-mono text-sm">
                        {form.watch('textTemplate')}
                      </pre>
                    </div>
                    
                    <div className="bg-muted/30 rounded-md p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-2" />
                          <span className="font-medium">Recipients: {selectedClients.length}</span>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={isSending || selectedClients.length === 0}
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Campaign
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
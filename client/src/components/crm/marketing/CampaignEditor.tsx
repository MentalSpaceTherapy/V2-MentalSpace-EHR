import { useState, useEffect, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCRM, Campaign } from '@/hooks/use-crm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DragHandleDots2Icon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowLeftRight,
  Calendar as CalendarIcon2,
  ChevronDown,
  Edit2,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Save,
  Send,
  Settings,
  Smartphone,
  Users,
} from 'lucide-react';

// Define the types needed
type CampaignFormData = {
  name: string;
  type: string;
  status: string;
  description: string;
  audience: string | null;
  content: any;
  startDate: Date | null;
  endDate: Date | null;
  tags: string[];
};

type AudienceSegment = {
  id: string;
  name: string;
  count: number;
  filters: Record<string, any>;
};

type MessageTemplate = {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social';
  subject?: string;
  body: string;
  previewImage?: string;
};

interface CampaignEditorProps {
  campaign?: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: CampaignFormData) => void;
}

export function CampaignEditor({ campaign, isOpen, onClose, onSave }: CampaignEditorProps) {
  // Default form state for new campaigns
  const defaultFormState: CampaignFormData = {
    name: '',
    type: 'Email',
    status: 'Draft',
    description: '',
    audience: null,
    content: {
      emailSubject: '',
      emailBody: '',
      smsText: '',
      socialText: '',
      template: null,
      schedulingOptions: {
        frequency: 'once',
        sendTime: '09:00',
        repeatDays: [],
        sendImmediately: false,
      },
      personalization: {
        usePersonalization: true,
        fields: ['firstName', 'appointmentDate'],
      },
    },
    startDate: new Date(),
    endDate: null,
    tags: [],
  };

  // State for form data
  const [formData, setFormData] = useState<CampaignFormData>(defaultFormState);
  const [currentTab, setCurrentTab] = useState('details');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  // Sample audience segments
  const audienceSegments: AudienceSegment[] = [
    {
      id: 'all-clients',
      name: 'All Clients',
      count: 135,
      filters: {},
    },
    {
      id: 'active-clients',
      name: 'Active Clients',
      count: 87,
      filters: { status: 'active' },
    },
    {
      id: 'therapy-anxiety',
      name: 'Therapy: Anxiety',
      count: 42,
      filters: { condition: 'anxiety' },
    },
    {
      id: 'therapy-depression',
      name: 'Therapy: Depression',
      count: 38,
      filters: { condition: 'depression' },
    },
    {
      id: 'new-clients-30',
      name: 'New Clients (30 days)',
      count: 12,
      filters: { newClient: true, days: 30 },
    },
    {
      id: 'inactive-90',
      name: 'Inactive (90+ days)',
      count: 23,
      filters: { inactive: true, days: 90 },
    },
  ];

  // Sample message templates
  const messageTemplates: MessageTemplate[] = [
    {
      id: 'template-1',
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to Your Therapy Journey',
      body: 'Hello {{firstName}}, \n\nWelcome to our practice. We look forward to supporting you on your journey to better mental health.\n\nYour next appointment is scheduled for {{appointmentDate}}.\n\nBest regards,\nThe Therapy Team',
      previewImage: '/templates/welcome-email.png',
    },
    {
      id: 'template-2',
      name: 'Session Reminder',
      type: 'email',
      subject: 'Your Upcoming Therapy Session',
      body: 'Hi {{firstName}}, \n\nThis is a friendly reminder that you have a therapy session scheduled for {{appointmentDate}}.\n\nWe look forward to seeing you!\n\nBest regards,\nThe Therapy Team',
      previewImage: '/templates/session-reminder.png',
    },
    {
      id: 'template-3',
      name: 'Wellness Check-In',
      type: 'sms',
      body: 'Hi {{firstName}}, how are you feeling today? Your therapist is checking in. Reply with any updates before your next session on {{appointmentDate}}.',
    },
    {
      id: 'template-4',
      name: 'Monthly Newsletter',
      type: 'email',
      subject: 'Mental Health Tips: Monthly Newsletter',
      body: 'Hello {{firstName}},\n\nHere are this month\'s top mental health and wellness tips...\n\nWe hope these tips help you on your wellness journey.\n\nBest regards,\nThe Therapy Team',
      previewImage: '/templates/newsletter.png',
    },
  ];

  // Tag options
  const tagOptions = [
    'newsletter', 
    'wellness', 
    'anxiety', 
    'depression', 
    'follow-up', 
    'seasonal', 
    'workshop', 
    'feedback', 
    'engagement',
    'reactivation'
  ];

  // Effect to populate form with campaign data if editing
  useEffect(() => {
    if (campaign) {
      // Convert campaign to form data format
      setFormData({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        description: campaign.description || '',
        audience: campaign.audience,
        content: campaign.content || defaultFormState.content,
        startDate: campaign.startDate ? new Date(campaign.startDate) : null,
        endDate: campaign.endDate ? new Date(campaign.endDate) : null,
        tags: campaign.tags || [],
      });
    } else {
      // Reset to default if creating new
      setFormData(defaultFormState);
    }
  }, [campaign, isOpen]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    
    // Update content based on template type
    if (template.type === 'email') {
      setFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          emailSubject: template.subject || '',
          emailBody: template.body || '',
          template: template.id,
        },
      }));
    } else if (template.type === 'sms') {
      setFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          smsText: template.body || '',
          template: template.id,
        },
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleAudienceSelect = (audienceId: string) => {
    const segment = audienceSegments.find(seg => seg.id === audienceId);
    setFormData(prev => ({
      ...prev,
      audience: segment?.name || null,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {campaign
              ? 'Make changes to your campaign here. Click save when you\'re done.'
              : 'Set up your new marketing campaign with the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="details">Campaign Details</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Campaign Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="E.g., Summer Wellness Newsletter"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Campaign Type*</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="Social">Social Media</SelectItem>
                        <SelectItem value="Multi-channel">Multi-channel</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Webinar">Webinar</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status*</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Running">Running</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose and goals of this campaign"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {tagOptions.map((tag) => (
                      <div
                        key={tag}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience</CardTitle>
                  <CardDescription>
                    Select the audience segment to target with this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {audienceSegments.map((segment) => (
                        <div
                          key={segment.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.audience === segment.name
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/30'
                          }`}
                          onClick={() => handleAudienceSelect(segment.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{segment.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {segment.count} clients
                              </p>
                            </div>
                            <Checkbox checked={formData.audience === segment.name} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button variant="outline" className="gap-2">
                        <Plus size={16} />
                        <span>Create Custom Segment</span>
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ArrowLeftRight size={14} />
                          <span>Edit Segments</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Tabs defaultValue={formData.type.toLowerCase()} className="w-full">
                <TabsList className="w-full">
                  {formData.type === 'Multi-channel' && (
                    <>
                      <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail size={16} /> Email
                      </TabsTrigger>
                      <TabsTrigger value="sms" className="flex items-center gap-2">
                        <Smartphone size={16} /> SMS
                      </TabsTrigger>
                      <TabsTrigger value="social" className="flex items-center gap-2">
                        <Users size={16} /> Social
                      </TabsTrigger>
                    </>
                  )}
                  {formData.type === 'Email' && (
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail size={16} /> Email
                    </TabsTrigger>
                  )}
                  {formData.type === 'SMS' && (
                    <TabsTrigger value="sms" className="flex items-center gap-2">
                      <Smartphone size={16} /> SMS
                    </TabsTrigger>
                  )}
                  {formData.type === 'Social' && (
                    <TabsTrigger value="social" className="flex items-center gap-2">
                      <Users size={16} /> Social
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Email Content */}
                <TabsContent value="email" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Email Content</CardTitle>
                        <Select
                          value={formData.content.template || ""}
                          onValueChange={(templateId) => {
                            const template = messageTemplates.find(t => t.id === templateId && t.type === 'email');
                            if (template) handleSelectTemplate(template);
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No template</SelectItem>
                            {messageTemplates
                              .filter(t => t.type === 'email')
                              .map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="emailSubject">Subject Line</Label>
                        <Input
                          id="emailSubject"
                          value={formData.content.emailSubject || ''}
                          onChange={(e) => handleContentChange('emailSubject', e.target.value)}
                          placeholder="Enter email subject line"
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailBody">Email Body</Label>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Personalization:</span>
                            <code className="bg-secondary px-1 rounded">{'{{firstName}}'}</code>
                            <code className="bg-secondary px-1 rounded">{'{{appointmentDate}}'}</code>
                          </div>
                        </div>
                        <Textarea
                          id="emailBody"
                          value={formData.content.emailBody || ''}
                          onChange={(e) => handleContentChange('emailBody', e.target.value)}
                          placeholder="Enter your email content here"
                          rows={10}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <AlertCircle size={14} className="mr-1" />
                        <span>All emails will include required footer and unsubscribe options</span>
                      </div>
                      <Button variant="outline" className="gap-1">
                        <Eye size={14} />
                        <span>Preview</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* SMS Content */}
                <TabsContent value="sms" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>SMS Message</CardTitle>
                        <Select
                          value={formData.content.template || ""}
                          onValueChange={(templateId) => {
                            const template = messageTemplates.find(t => t.id === templateId && t.type === 'sms');
                            if (template) handleSelectTemplate(template);
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No template</SelectItem>
                            {messageTemplates
                              .filter(t => t.type === 'sms')
                              .map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="smsText">Message Text</Label>
                          <span className="text-sm text-muted-foreground">
                            <span id="charCount">{formData.content.smsText?.length || 0}</span>/160 characters
                          </span>
                        </div>
                        <Textarea
                          id="smsText"
                          value={formData.content.smsText || ''}
                          onChange={(e) => handleContentChange('smsText', e.target.value)}
                          placeholder="Enter your SMS message content"
                          rows={4}
                          maxLength={160}
                        />
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <AlertCircle size={14} />
                          <span>Available personalization fields:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <code className="bg-secondary px-2 py-1 rounded text-xs cursor-pointer hover:bg-secondary/80" 
                                onClick={() => handleContentChange('smsText', (formData.content.smsText || '') + '{{firstName}}')}>
                            {'{{firstName}}'}
                          </code>
                          <code className="bg-secondary px-2 py-1 rounded text-xs cursor-pointer hover:bg-secondary/80" 
                                onClick={() => handleContentChange('smsText', (formData.content.smsText || '') + '{{appointmentDate}}')}>
                            {'{{appointmentDate}}'}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <AlertCircle size={14} className="mr-1" />
                        <span>All SMS messages include required compliance text and opt-out instructions</span>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Social Media Content */}
                <TabsContent value="social" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Media Post</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="socialText">Post Content</Label>
                        <Textarea
                          id="socialText"
                          value={formData.content.socialText || ''}
                          onChange={(e) => handleContentChange('socialText', e.target.value)}
                          placeholder="Enter your social media post content"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Social Platforms</Label>
                          <div className="space-y-2">
                            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
                              <div key={platform} className="flex items-center space-x-2">
                                <Checkbox id={`platform-${platform}`} />
                                <label
                                  htmlFor={`platform-${platform}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {platform}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mediaUpload" className="mb-2 block">
                            Media Upload
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground mb-2">
                              Drag and drop or click to upload
                            </div>
                            <Button variant="outline" size="sm" className="mx-auto">
                              Browse Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Schedule</CardTitle>
                  <CardDescription>
                    Set when your campaign should start and end
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon2 className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate || undefined}
                            onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon2 className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate || undefined}
                            onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sending Options</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="sendImmediately" 
                          checked={formData.content.schedulingOptions?.sendImmediately}
                          onCheckedChange={(checked) => 
                            handleContentChange('schedulingOptions', {
                              ...formData.content.schedulingOptions,
                              sendImmediately: !!checked
                            })
                          }
                        />
                        <label
                          htmlFor="sendImmediately"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Send immediately when published
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="autoFollowup" 
                          checked={formData.content.schedulingOptions?.autoFollowup}
                          onCheckedChange={(checked) => 
                            handleContentChange('schedulingOptions', {
                              ...formData.content.schedulingOptions,
                              autoFollowup: !!checked
                            })
                          }
                        />
                        <label
                          htmlFor="autoFollowup"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Automatic follow-up for non-responders
                        </label>
                      </div>
                    </div>
                  </div>

                  {!formData.content.schedulingOptions?.sendImmediately && (
                    <div className="space-y-2">
                      <Label>Send Time</Label>
                      <Input
                        type="time"
                        value={formData.content.schedulingOptions?.sendTime || "09:00"}
                        onChange={(e) => 
                          handleContentChange('schedulingOptions', {
                            ...formData.content.schedulingOptions,
                            sendTime: e.target.value
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={formData.content.schedulingOptions?.frequency || "once"}
                      onValueChange={(value) => 
                        handleContentChange('schedulingOptions', {
                          ...formData.content.schedulingOptions,
                          frequency: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Preview</CardTitle>
                  <CardDescription>
                    Review your campaign before saving or publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Campaign Name</h3>
                        <p className="text-lg font-medium">{formData.name || 'Untitled Campaign'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Type & Status</h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5">
                            {formData.type === 'Email' && <Mail size={16} />}
                            {formData.type === 'SMS' && <MessageSquare size={16} />}
                            {formData.type === 'Social' && <Users size={16} />}
                            {formData.type === 'Multi-channel' && <ArrowLeftRight size={16} />}
                            {formData.type}
                          </span>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-300"></span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            formData.status === 'Draft' ? 'bg-neutral-100 text-neutral-800' :
                            formData.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            formData.status === 'Running' ? 'bg-green-100 text-green-800' :
                            formData.status === 'Paused' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {formData.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Schedule</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CalendarIcon2 size={14} />
                            <span>
                              Start: {formData.startDate ? format(formData.startDate, 'PPP') : 'Not set'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon2 size={14} />
                            <span>
                              End: {formData.endDate ? format(formData.endDate, 'PPP') : 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Audience</h3>
                        <p>{formData.audience || 'No audience selected'}</p>
                      </div>
                      {formData.tags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-secondary rounded-full text-xs">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Content Preview</h3>
                      
                      {formData.type === 'Email' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-secondary/50 rounded-lg">
                            <span className="text-sm font-medium">Subject:</span> 
                            <span className="text-muted-foreground ml-1">{formData.content.emailSubject || 'No subject'}</span>
                          </div>
                          <div className="border rounded-lg p-4 min-h-[200px] whitespace-pre-line">
                            {formData.content.emailBody || 'No content'}
                          </div>
                        </div>
                      )}
                      
                      {formData.type === 'SMS' && (
                        <div className="border rounded-lg p-4 bg-secondary/20 min-h-[200px] flex items-center justify-center">
                          <div className="max-w-[300px] border rounded-lg p-3 bg-white">
                            <div className="whitespace-pre-line">
                              {formData.content.smsText || 'No SMS content'}
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.type === 'Social' && (
                        <div className="border rounded-lg p-4 bg-secondary/20 min-h-[200px] flex items-center justify-center">
                          <div className="max-w-[350px] border rounded-lg p-3 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium">Your Practice</div>
                                <div className="text-xs text-muted-foreground">@yourpractice</div>
                              </div>
                            </div>
                            <div className="whitespace-pre-line">
                              {formData.content.socialText || 'No social media content'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setCurrentTab(currentTab === 'preview' ? 'details' : getNextTab(currentTab))}>
              {currentTab === 'preview' ? 'Back to Details' : 'Next'}
            </Button>
            <Button type="submit" className="gap-1">
              <Save size={16} />
              <span>Save Campaign</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to navigate between tabs
function getNextTab(currentTab: string): string {
  const tabs = ['details', 'audience', 'content', 'schedule', 'preview'];
  const currentIndex = tabs.indexOf(currentTab);
  return tabs[currentIndex + 1] || tabs[0];
}
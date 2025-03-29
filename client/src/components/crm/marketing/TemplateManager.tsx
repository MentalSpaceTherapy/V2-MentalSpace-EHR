import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Edit,
  Eye,
  File,
  FileText,
  ImageIcon,
  LayoutTemplate,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pen,
  Plus,
  Save,
  Search,
  Send,
  Smartphone,
  Trash,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCRM } from '@/hooks/use-crm';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Define types
type TemplateType = 'email' | 'sms' | 'letter' | 'social';

type MarketingTemplate = {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  subject?: string;
  content: string;
  previewImage?: string;
  tags: string[];
  usageCount: number;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
};

export function TemplateManager() {
  // Sample templates
  const [templates, setTemplates] = useState<MarketingTemplate[]>([
    {
      id: 'tmpl1',
      name: 'Welcome Email',
      type: 'email',
      description: 'Sent to new clients after their first appointment is scheduled',
      subject: 'Welcome to Our Practice - Your Journey Begins',
      content: `Dear {{client.firstName}},

Welcome to our practice! We're delighted that you've chosen us for your mental health journey. Your first appointment is scheduled for {{appointment.date}} at {{appointment.time}} with {{therapist.name}}.

Here's what to expect:
- Please arrive 15 minutes early to complete any remaining paperwork
- Bring your insurance card and ID
- Our office is located at {{practice.address}}

If you have any questions before your appointment, please don't hesitate to reach out at {{practice.phone}}.

We look forward to meeting you soon!

Warm regards,
{{practice.name}} Team`,
      tags: ['onboarding', 'welcome', 'new-client'],
      usageCount: 87,
      createdBy: {
        id: 'user1',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
      },
      createdAt: '2023-03-15T10:30:00Z',
      updatedAt: '2023-06-22T14:45:00Z',
      isSystem: true,
    },
    {
      id: 'tmpl2',
      name: 'Appointment Reminder',
      type: 'email',
      description: 'Sent 48 hours before scheduled appointments',
      subject: 'Reminder: Your Upcoming Appointment',
      content: `Hello {{client.firstName}},

This is a friendly reminder that you have an appointment scheduled with {{therapist.name}} on {{appointment.date}} at {{appointment.time}}.

Location: {{appointment.location}}
{{#if appointment.isVirtual}}
Video link: {{appointment.videoLink}}
{{/if}}

If you need to reschedule, please contact us at least 24 hours in advance at {{practice.phone}}.

We look forward to seeing you!

Warm regards,
{{practice.name}} Team`,
      tags: ['reminder', 'appointment'],
      usageCount: 156,
      createdBy: {
        id: 'user2',
        name: 'Michael Chen',
        avatar: '/avatars/michael.jpg',
      },
      createdAt: '2023-04-10T09:15:00Z',
      updatedAt: '2023-08-05T11:20:00Z',
      isSystem: true,
    },
    {
      id: 'tmpl3',
      name: 'Session Confirmation SMS',
      type: 'sms',
      description: 'Sent immediately after booking a session',
      content: `Hi {{client.firstName}}, your therapy session with {{therapist.firstName}} is confirmed for {{appointment.date}} at {{appointment.time}}. Reply YES to confirm or call {{practice.phone}} to reschedule.`,
      tags: ['appointment', 'confirmation', 'sms'],
      usageCount: 112,
      createdBy: {
        id: 'user1',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
      },
      createdAt: '2023-05-20T14:30:00Z',
      updatedAt: '2023-07-15T08:45:00Z',
    },
    {
      id: 'tmpl4',
      name: 'Feedback Request',
      type: 'email',
      description: 'Sent after 3 completed sessions to gather client feedback',
      subject: 'How Are We Doing? Share Your Feedback',
      content: `Dear {{client.firstName}},

We value your opinion and want to ensure we're providing the best possible care. As you've now completed {{client.sessionCount}} sessions with us, we'd appreciate your feedback.

Please take a moment to complete our brief survey: {{feedbackLink}}

Your responses will be kept confidential and will help us improve our services.

Thank you for your time and trust in our practice.

Warm regards,
{{practice.name}} Team`,
      tags: ['feedback', 'survey'],
      usageCount: 42,
      createdBy: {
        id: 'user3',
        name: 'Jessica Williams',
        avatar: '/avatars/jessica.jpg',
      },
      createdAt: '2023-06-18T11:20:00Z',
      updatedAt: '2023-06-18T11:20:00Z',
    },
    {
      id: 'tmpl5',
      name: 'Re-engagement Email',
      type: 'email',
      description: 'Sent to clients who haven\'t scheduled in 60+ days',
      subject: 'We Miss You - Checking In',
      content: `Hello {{client.firstName}},

We noticed it's been a while since we've seen you at {{practice.name}}. We hope you're doing well and wanted to check in.

If you're interested in scheduling another session, you can:
- Reply to this email
- Call us at {{practice.phone}}
- Book online: {{practice.bookingLink}}

Remember, your mental health is important, and we're here to support you whenever you're ready.

Warm regards,
{{therapist.name}}
{{practice.name}}`,
      tags: ['re-engagement', 'inactive-clients'],
      usageCount: 23,
      createdBy: {
        id: 'user2',
        name: 'Michael Chen',
        avatar: '/avatars/michael.jpg',
      },
      createdAt: '2023-07-05T15:45:00Z',
      updatedAt: '2023-09-12T09:30:00Z',
    },
  ]);

  const [templateDialog, setTemplateDialog] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit' or 'view'
    currentTemplate: null as MarketingTemplate | null,
  });

  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    tag: '',
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState<{
    name: string;
    type: TemplateType;
    description: string;
    subject?: string;
    content: string;
    tags: string[];
  }>({
    name: '',
    type: 'email',
    description: '',
    subject: '',
    content: '',
    tags: [],
  });

  // Filter template data
  const filteredTemplates = templates.filter((template) => {
    // Apply search filter
    const searchMatch = filters.search
      ? template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        (template.subject && template.subject.toLowerCase().includes(filters.search.toLowerCase()))
      : true;

    // Apply type filter
    const typeMatch = filters.type === 'all' ? true : template.type === filters.type;

    // Apply tag filter
    const tagMatch = filters.tag
      ? template.tags.includes(filters.tag)
      : true;

    return searchMatch && typeMatch && tagMatch;
  });

  // All tags from all templates for the tag filter
  const allTags = Array.from(
    new Set(templates.flatMap((template) => template.tags))
  ).sort();

  // Dialog handlers
  const openCreateTemplateDialog = () => {
    setTemplateForm({
      name: '',
      type: 'email',
      description: '',
      subject: '',
      content: '',
      tags: [],
    });
    setTemplateDialog({
      isOpen: true,
      mode: 'create',
      currentTemplate: null,
    });
  };

  const openEditTemplateDialog = (template: MarketingTemplate) => {
    setTemplateForm({
      name: template.name,
      type: template.type,
      description: template.description,
      subject: template.subject || '',
      content: template.content,
      tags: template.tags,
    });
    setTemplateDialog({
      isOpen: true,
      mode: 'edit',
      currentTemplate: template,
    });
  };

  const openViewTemplateDialog = (template: MarketingTemplate) => {
    setTemplateDialog({
      isOpen: true,
      mode: 'view',
      currentTemplate: template,
    });
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplateForm({ ...templateForm, [name]: value });
  };

  const handleTypeChange = (type: string) => {
    setTemplateForm({ ...templateForm, type: type as TemplateType });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = [...templateForm.tags];
    if (newTags.includes(tag)) {
      setTemplateForm({
        ...templateForm,
        tags: newTags.filter((t) => t !== tag),
      });
    } else {
      setTemplateForm({ ...templateForm, tags: [...newTags, tag] });
    }
  };

  // Save template
  const handleSaveTemplate = () => {
    const currentUser = {
      id: 'current-user',
      name: 'Current User',
      avatar: '/avatars/default.jpg',
    };

    const newTemplate: MarketingTemplate = {
      id: templateDialog.currentTemplate?.id || `tmpl${templates.length + 1}`,
      name: templateForm.name,
      type: templateForm.type,
      description: templateForm.description,
      subject: templateForm.type === 'email' ? templateForm.subject : undefined,
      content: templateForm.content,
      tags: templateForm.tags,
      usageCount: templateDialog.currentTemplate?.usageCount || 0,
      createdBy: templateDialog.currentTemplate?.createdBy || currentUser,
      createdAt: templateDialog.currentTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (templateDialog.mode === 'create') {
      setTemplates([...templates, newTemplate]);
    } else {
      setTemplates(
        templates.map((tmpl) =>
          tmpl.id === newTemplate.id ? newTemplate : tmpl
        )
      );
    }

    setTemplateDialog({ ...templateDialog, isOpen: false });
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id));
  };

  const getIconForTemplateType = (type: TemplateType) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'letter':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marketing Templates</h2>
          <p className="text-muted-foreground">
            Manage reusable templates for client communications
          </p>
        </div>
        <Button onClick={openCreateTemplateDialog} className="gap-1.5">
          <Plus size={16} />
          <span>Create Template</span>
        </Button>
      </div>

      {/* Search and Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.tag}
          onValueChange={(value) => setFilters({ ...filters, tag: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Marketing Templates</CardTitle>
          <CardDescription>
            Reusable message templates for consistent client communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-center">Usage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.name}</span>
                        {template.isSystem && (
                          <Badge variant="outline" className="text-xs rounded-sm">System</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIconForTemplateType(template.type)}
                      <span className="capitalize">{template.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-medium">
                      {template.usageCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={template.createdBy.avatar} />
                        <AvatarFallback>{template.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openViewTemplateDialog(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditTemplateDialog(template)}
                        disabled={template.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2" onClick={() => {}}>
                            <Send className="h-4 w-4" />
                            <span>Use in Campaign</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => {
                            const newTemplate = {...template};
                            newTemplate.id = `tmpl${templates.length + 1}`;
                            newTemplate.name = `${template.name} (Copy)`;
                            newTemplate.isSystem = false;
                            setTemplates([...templates, newTemplate]);
                          }}>
                            <Copy className="h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive" 
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={template.isSystem}
                          >
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit/View Template Dialog */}
      <Dialog
        open={templateDialog.isOpen}
        onOpenChange={(open) => setTemplateDialog({ ...templateDialog, isOpen: open })}
      >
        <DialogContent className={cn(
          "sm:max-w-[700px]",
          templateDialog.mode === 'view' && "sm:max-w-[800px]"
        )}>
          <DialogHeader>
            <DialogTitle>
              {templateDialog.mode === 'create'
                ? 'Create New Template'
                : templateDialog.mode === 'edit'
                ? 'Edit Template'
                : 'View Template'}
            </DialogTitle>
            <DialogDescription>
              {templateDialog.mode === 'create' || templateDialog.mode === 'edit'
                ? 'Define your marketing message template'
                : 'Preview how this template will appear to recipients'}
            </DialogDescription>
          </DialogHeader>

          {templateDialog.mode === 'view' ? (
            <div className="py-4">
              {/* Template Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    <div className="flex items-center gap-1.5">
                      {getIconForTemplateType(templateDialog.currentTemplate?.type as TemplateType)}
                      <span>{templateDialog.currentTemplate?.type}</span>
                    </div>
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Created by {templateDialog.currentTemplate?.createdBy.name} on {format(new Date(templateDialog.currentTemplate?.createdAt || ''), 'MMM d, yyyy')}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1">{templateDialog.currentTemplate?.name}</h3>
                  <p className="text-sm text-muted-foreground">{templateDialog.currentTemplate?.description}</p>
                </div>

                {templateDialog.currentTemplate?.type === 'email' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm font-medium">Subject:</span> 
                      <span className="ml-1">{templateDialog.currentTemplate?.subject}</span>
                    </div>
                    <div className="border p-5 rounded-lg bg-card whitespace-pre-line">
                      {templateDialog.currentTemplate?.content}
                    </div>
                  </div>
                )}

                {templateDialog.currentTemplate?.type === 'sms' && (
                  <div className="flex justify-center p-6 bg-secondary/20 rounded-lg">
                    <div className="w-[300px] border rounded-lg p-4 bg-background shadow-sm">
                      <div className="whitespace-pre-line">
                        {templateDialog.currentTemplate?.content}
                      </div>
                    </div>
                  </div>
                )}

                {templateDialog.currentTemplate?.type === 'letter' && (
                  <div className="border p-8 rounded-lg bg-card whitespace-pre-line">
                    {templateDialog.currentTemplate?.content}
                  </div>
                )}

                {templateDialog.currentTemplate?.type === 'social' && (
                  <div className="flex justify-center p-6 bg-secondary/20 rounded-lg">
                    <div className="w-[400px] border rounded-lg p-4 bg-background shadow-sm">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>MP</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Mental Practice</div>
                          <div className="text-xs text-muted-foreground">@mentalpractice</div>
                        </div>
                      </div>
                      <div className="whitespace-pre-line">
                        {templateDialog.currentTemplate?.content}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <h4 className="text-sm font-medium mb-2">Available Personalization Fields:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-secondary/30 rounded text-xs font-mono">{'{{client.firstName}}'}</div>
                    <div className="p-2 bg-secondary/30 rounded text-xs font-mono">{'{{client.lastName}}'}</div>
                    <div className="p-2 bg-secondary/30 rounded text-xs font-mono">{'{{appointment.date}}'}</div>
                    <div className="p-2 bg-secondary/30 rounded text-xs font-mono">{'{{appointment.time}}'}</div>
                    <div className="p-2 bg-secondary/30 rounded text-xs font-mono">{'{{therapist.name}}'}</div>
                    <div className="p-2 bg-secondary/30 rounded text-xs font-mono">{'{{practice.name}}'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="templateName">Template Name*</Label>
                  <Input
                    id="templateName"
                    name="name"
                    value={templateForm.name}
                    onChange={handleInputChange}
                    placeholder="E.g., Appointment Reminder"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="templateType">Type*</Label>
                  <Select
                    value={templateForm.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger id="templateType">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="templateDescription">Description</Label>
                <Input
                  id="templateDescription"
                  name="description"
                  value={templateForm.description}
                  onChange={handleInputChange}
                  placeholder="Describe the purpose of this template"
                />
              </div>

              {templateForm.type === 'email' && (
                <div className="grid gap-2">
                  <Label htmlFor="templateSubject">Subject Line*</Label>
                  <Input
                    id="templateSubject"
                    name="subject"
                    value={templateForm.subject}
                    onChange={handleInputChange}
                    placeholder="Enter the email subject line"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="templateContent">Content*</Label>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    <span>Personalization available</span>
                  </div>
                </div>
                <Textarea
                  id="templateContent"
                  name="content"
                  value={templateForm.content}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${templateForm.type} content here...`}
                  rows={8}
                  required
                />
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setTemplateForm({
                      ...templateForm,
                      content: templateForm.content + '{{client.firstName}}'
                    })}
                  >
                    + client.firstName
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setTemplateForm({
                      ...templateForm,
                      content: templateForm.content + '{{appointment.date}}'
                    })}
                  >
                    + appointment.date
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setTemplateForm({
                      ...templateForm,
                      content: templateForm.content + '{{therapist.name}}'
                    })}
                  >
                    + therapist.name
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setTemplateForm({
                      ...templateForm,
                      content: templateForm.content + '{{practice.name}}'
                    })}
                  >
                    + practice.name
                  </Badge>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {allTags.map((tag) => (
                    <div
                      key={tag}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        templateForm.tags.includes(tag)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/60 hover:bg-secondary/80 cursor-pointer">
                    + Add Tag
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {templateDialog.mode === 'view' ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTemplateDialog({ ...templateDialog, isOpen: false })}>
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => {
                    setTemplateDialog({
                      isOpen: true,
                      mode: 'edit',
                      currentTemplate: templateDialog.currentTemplate,
                    });
                    if (templateDialog.currentTemplate) {
                      openEditTemplateDialog(templateDialog.currentTemplate);
                    }
                  }}
                  disabled={templateDialog.currentTemplate?.isSystem}
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
                <Button className="gap-1">
                  <Send size={16} />
                  <span>Use Template</span>
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setTemplateDialog({ ...templateDialog, isOpen: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSaveTemplate}
                  disabled={!templateForm.name || !templateForm.content || (templateForm.type === 'email' && !templateForm.subject)}
                  className="gap-1"
                >
                  <Save size={16} />
                  <span>
                    {templateDialog.mode === 'create' ? 'Create Template' : 'Update Template'}
                  </span>
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
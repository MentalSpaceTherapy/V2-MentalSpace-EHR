import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, PlusCircle, Pencil, Trash2, FileText, CheckCircle, History } from 'lucide-react';
import TemplateVersionManager from './TemplateVersionManager';

// Define template schema for form validation
const templateFormSchema = z.object({
  name: z.string().min(3, { message: 'Template name must be at least 3 characters' }),
  description: z.string().optional(),
  type: z.string({ required_error: 'Please select a template type' }),
  status: z.string().default('draft'),
  isGlobal: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  organizationId: z.number().optional(),
});

// Types based on our database schema
interface DocumentTemplate {
  id: number;
  name: string;
  description: string | null;
  type: string;
  status: string;
  createdById: number;
  createdAt: string;
  updatedAt: string | null;
  organizationId: number | null;
  isGlobal: boolean;
  requiresApproval: boolean;
  approvalStatus: string | null;
  approvedById: number | null;
  approvedAt: string | null;
  currentVersionId: number | null;
}

interface DocumentTemplateFormData {
  name: string;
  description: string;
  type: string;
  status: string;
  isGlobal: boolean;
  requiresApproval: boolean;
  organizationId?: number;
}

export default function DocumentTemplateManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Create form
  const createForm = useForm<DocumentTemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      isGlobal: false,
      requiresApproval: false,
    },
  });

  // Edit form
  const editForm = useForm<DocumentTemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      isGlobal: false,
      requiresApproval: false,
    },
  });

  // Fetch templates
  const { data: templates, isLoading, isError } = useQuery({
    queryKey: ['/api/document-templates'],
    queryFn: async () => {
      const response = await fetch('/api/document-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json() as Promise<DocumentTemplate[]>;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DocumentTemplateFormData) => {
      return fetch('/api/document-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdById: user?.id,
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create template');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setOpenCreateDialog(false);
      createForm.reset();
      toast({
        title: 'Success',
        description: 'Document template created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: Partial<DocumentTemplateFormData> }) => {
      return fetch(`/api/document-templates/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update template');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setOpenEditDialog(false);
      editForm.reset();
      toast({
        title: 'Success',
        description: 'Document template updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`/api/document-templates/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete template');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setOpenDeleteDialog(false);
      setSelectedTemplate(null);
      toast({
        title: 'Success',
        description: 'Document template deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateSubmit = (data: DocumentTemplateFormData) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: DocumentTemplateFormData) => {
    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, data });
    }
  };

  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate.id);
    }
  };

  const handleOpenEditDialog = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    editForm.reset({
      name: template.name,
      description: template.description || '',
      type: template.type,
      status: template.status,
      isGlobal: template.isGlobal,
      requiresApproval: template.requiresApproval,
      organizationId: template.organizationId || undefined,
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setOpenDeleteDialog(true);
  };

  const openVersionDialog = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowVersionManager(true);
  };

  const renderApprovalStatus = (template: DocumentTemplate) => {
    if (!template.requiresApproval) return null;
    
    switch (template.approvalStatus) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500">Not Submitted</Badge>;
    }
  };

  const renderTemplateStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500">Inactive</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500">Archived</Badge>;
      default:
        return <Badge className="bg-blue-500">Draft</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading templates. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {showVersionManager && selectedTemplate ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowVersionManager(false)}
            >
              Back to Templates
            </Button>
          </div>
          <TemplateVersionManager 
            template={selectedTemplate} 
            onClose={() => setShowVersionManager(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
              <p className="text-muted-foreground">
                Manage document templates for clinical documentation
              </p>
            </div>
            <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>New Template</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create new document template</DialogTitle>
                  <DialogDescription>
                    Add the details for the new document template. Once created, you can manage versions of this template.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Progress Note Template" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="A standard template for session progress notes"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Progress Note">Progress Note</SelectItem>
                              <SelectItem value="Treatment Plan">Treatment Plan</SelectItem>
                              <SelectItem value="Assessment">Assessment</SelectItem>
                              <SelectItem value="Intake Form">Intake Form</SelectItem>
                              <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                              <SelectItem value="Contact Note">Contact Note</SelectItem>
                              <SelectItem value="Absence Note">Absence Note</SelectItem>
                              <SelectItem value="Consultation">Consultation</SelectItem>
                              <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="isGlobal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Global Template</FormLabel>
                              <FormDescription>
                                Make available to all users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="requiresApproval"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Require Approval</FormLabel>
                              <FormDescription>
                                Changes require admin approval
                              </FormDescription>
                            </div>
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
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setOpenCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Template
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <div className="flex space-x-1">
                        {renderTemplateStatus(template.status)}
                        {renderApprovalStatus(template)}
                      </div>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      {template.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="line-clamp-3">{template.description || 'No description provided.'}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3 border-t">
                    <div className="flex space-x-2 items-center text-xs text-muted-foreground">
                      {template.isGlobal && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Global</span>
                      )}
                      {template.currentVersionId && (
                        <span className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          <span>Has versions</span>
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openVersionDialog(template)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Versions
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenEditDialog(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={openDeleteDialog && selectedTemplate?.id === template.id} onOpenChange={setOpenDeleteDialog}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(template)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the template "{template.name}" and all its versions. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600"
                              onClick={handleDeleteTemplate}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center p-10 border rounded-lg">
                <p className="text-muted-foreground mb-4">No templates found. Create your first template to get started.</p>
                <Button 
                  onClick={() => setOpenCreateDialog(true)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Template</span>
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit document template</DialogTitle>
            <DialogDescription>
              Update the details for this document template.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Progress Note">Progress Note</SelectItem>
                        <SelectItem value="Treatment Plan">Treatment Plan</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Intake Form">Intake Form</SelectItem>
                        <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                        <SelectItem value="Contact Note">Contact Note</SelectItem>
                        <SelectItem value="Absence Note">Absence Note</SelectItem>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="isGlobal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Global Template</FormLabel>
                        <FormDescription>
                          Make available to all users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Require Approval</FormLabel>
                        <FormDescription>
                          Changes require admin approval
                        </FormDescription>
                      </div>
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
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setOpenEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
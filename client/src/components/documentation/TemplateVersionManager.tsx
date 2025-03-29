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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, PlusCircle, CheckCircle, XCircle, Star, Pencil, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Types from our database schema
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

interface TemplateVersion {
  id: number;
  templateId: number;
  versionNumber: number;
  content: string;
  metadata: Record<string, any>;
  createdById: number;
  createdAt: string;
  isLatest: boolean;
  notes: string | null;
  approvalStatus: string;
  approvedById: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

// Schema for the form
const versionFormSchema = z.object({
  content: z.string().min(1, { message: 'Template content is required' }),
  metadata: z.record(z.any()),
  notes: z.string().optional(),
  isLatest: z.boolean().default(false),
});

interface TemplateVersionFormData {
  content: string;
  metadata: Record<string, any>;
  notes: string;
  isLatest: boolean;
}

interface TemplateVersionManagerProps {
  template: DocumentTemplate;
  onClose: () => void;
}

export default function TemplateVersionManager({ template, onClose }: TemplateVersionManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create form
  const createForm = useForm<TemplateVersionFormData>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      content: '',
      metadata: {},
      notes: '',
      isLatest: false,
    },
  });

  // Fetch versions for this template
  const { data: versions, isLoading } = useQuery({
    queryKey: ['/api/template-versions', { templateId: template.id }],
    queryFn: async () => {
      const response = await fetch(`/api/template-versions?templateId=${template.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template versions');
      }
      return response.json() as Promise<TemplateVersion[]>;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TemplateVersionFormData & { templateId: number }) => {
      return fetch('/api/template-versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdById: user?.id,
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create template version');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-versions', { templateId: template.id }] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setOpenCreateDialog(false);
      createForm.reset();
      toast({
        title: 'Success',
        description: 'Template version created successfully',
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
      return fetch(`/api/template-versions/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete template version');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-versions', { templateId: template.id }] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setOpenDeleteDialog(false);
      setSelectedVersion(null);
      toast({
        title: 'Success',
        description: 'Template version deleted successfully',
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

  // Set as latest version mutation
  const setLatestMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`/api/template-versions/${id}/set-latest`, {
        method: 'POST',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to set latest version');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-versions', { templateId: template.id }] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      toast({
        title: 'Success',
        description: 'Latest version updated successfully',
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

  // Approve version mutation
  const approveMutation = useMutation({
    mutationFn: (data: { id: number; notes?: string }) => {
      return fetch(`/api/template-versions/${data.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: data.notes,
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to approve template version');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-versions', { templateId: template.id }] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      toast({
        title: 'Success',
        description: 'Template version approved successfully',
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

  // Reject version mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { id: number; reason: string }) => {
      return fetch(`/api/template-versions/${data.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: data.reason,
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to reject template version');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-versions', { templateId: template.id }] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setOpenRejectDialog(false);
      setRejectionReason('');
      toast({
        title: 'Success',
        description: 'Template version rejected successfully',
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

  const handleCreateSubmit = (data: TemplateVersionFormData) => {
    // Get the highest version number
    const highestVersion = versions && versions.length > 0
      ? Math.max(...versions.map(v => v.versionNumber))
      : 0;
    
    // Create the new version with an incremented version number
    createMutation.mutate({
      ...data,
      templateId: template.id,
      versionNumber: highestVersion + 1,
    });
  };

  const handleDeleteVersion = () => {
    if (selectedVersion) {
      deleteMutation.mutate(selectedVersion.id);
    }
  };

  const handleSetLatest = (version: TemplateVersion) => {
    setLatestMutation.mutate(version.id);
  };

  const handleApproveVersion = (version: TemplateVersion) => {
    approveMutation.mutate({ id: version.id });
  };

  const handleOpenRejectDialog = (version: TemplateVersion) => {
    setSelectedVersion(version);
    setOpenRejectDialog(true);
  };

  const handleRejectVersion = () => {
    if (selectedVersion && rejectionReason) {
      rejectMutation.mutate({
        id: selectedVersion.id,
        reason: rejectionReason,
      });
    }
  };

  const viewVersionContent = (version: TemplateVersion) => {
    setSelectedVersion(version);
    setOpenViewDialog(true);
  };

  const renderApprovalStatus = (version: TemplateVersion) => {
    if (template.requiresApproval) {
      switch (version.approvalStatus) {
        case 'approved':
          return <Badge className="bg-green-500">Approved</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-500">Pending Approval</Badge>;
        case 'rejected':
          return <Badge className="bg-red-500">Rejected</Badge>;
        default:
          return <Badge className="bg-gray-500">Not Submitted</Badge>;
      }
    }
    return null;
  };

  // Check if user has admin role
  const isAdmin = user?.role === 'administrator';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Template Versions: {template.name}</h2>
          <p className="text-muted-foreground">
            Manage versions of this template
          </p>
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>New Version</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Create new template version</DialogTitle>
              <DialogDescription>
                Add the content for the new template version. You can include HTML formatting and template variables.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter your template content here..."
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        You can use HTML and template variables like {'{client.name}'}, {'{date}'}, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Change Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the changes in this version..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="isLatest"
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
                          Set as latest version
                        </FormLabel>
                        <FormDescription>
                          This will make this version the current active version of the template
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
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
                    Create Version
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !versions || versions.length === 0 ? (
        <div className="text-center p-10 border rounded-lg">
          <p className="text-muted-foreground mb-4">No versions found for this template. Create your first version to get started.</p>
          <Button 
            onClick={() => setOpenCreateDialog(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Version</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {versions.map((version) => (
              <Card key={version.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>Version {version.versionNumber}</CardTitle>
                      {version.isLatest && (
                        <Badge className="bg-blue-500">Latest</Badge>
                      )}
                      {renderApprovalStatus(version)}
                    </div>
                    <CardDescription className="text-right">
                      Created: {new Date(version.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Change Notes</h4>
                      <p className="text-sm text-muted-foreground">
                        {version.notes || 'No change notes provided'}
                      </p>
                    </div>
                    {version.rejectionReason && (
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-red-500">Rejection Reason</h4>
                        <p className="text-sm text-muted-foreground">
                          {version.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3 border-t">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => viewVersionContent(version)}
                  >
                    View Content
                  </Button>
                  <div className="flex gap-2">
                    {!version.isLatest && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetLatest(version)}
                        disabled={setLatestMutation.isPending}
                      >
                        {setLatestMutation.isPending && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        <Star className="h-4 w-4 mr-1" />
                        Set as Latest
                      </Button>
                    )}
                    
                    {template.requiresApproval && isAdmin && version.approvalStatus === 'pending' && (
                      <>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleApproveVersion(version)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleOpenRejectDialog(version)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <AlertDialog open={openDeleteDialog && selectedVersion?.id === version.id} onOpenChange={setOpenDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setSelectedVersion(version); setOpenDeleteDialog(true); }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete version {version.versionNumber} of this template.
                            {version.isLatest && " This is currently set as the latest version!"}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={handleDeleteVersion}
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
            ))}
          </div>
        </div>
      )}

      {/* View Content Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Template Content - Version {selectedVersion?.versionNumber}</DialogTitle>
            <DialogDescription>
              Content of this template version.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <pre className="text-sm whitespace-pre-wrap">{selectedVersion?.content}</pre>
          </ScrollArea>
          <DialogFooter>
            <Button 
              type="button" 
              variant="default"
              onClick={() => setOpenViewDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Reject Template Version</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this template version.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Rejection Reason</FormLabel>
                <Textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this version is being rejected..."
                  rows={4}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setOpenRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="default"
              onClick={handleRejectVersion}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              className="bg-red-500 hover:bg-red-600"
            >
              {rejectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
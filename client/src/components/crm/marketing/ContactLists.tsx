import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, RefreshCcw, AlertCircle, Loader2, Download, Upload } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ContactLists() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newList, setNewList] = useState({
    name: "",
    description: ""
  });

  // Check SendGrid configuration
  const { data: sendGridStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['/api/sendgrid/status'],
    queryFn: () => apiRequest('/api/sendgrid/status', { method: 'GET' })
  });

  // Get contact segments - In SendGrid they're called segments instead of lists
  const { data: contactSegments, isLoading: isLoadingSegments, refetch: refetchSegments } = useQuery({
    queryKey: ['/api/sendgrid/segments'],
    queryFn: () => apiRequest('/api/sendgrid/segments', { method: 'GET' }),
    enabled: !!sendGridStatus?.configured
  });

  // Mutation for creating a new segment (list)
  const createSegmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/sendgrid/segments', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: "Segment created",
        description: "Your contact segment has been created successfully.",
        variant: "default",
      });
      setNewList({ name: "", description: "" });
      setIsDialogOpen(false);
      refetchSegments();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create segment",
        description: error.message || "There was an error creating your segment.",
        variant: "destructive",
      });
    }
  });

  const handleCreateSegment = () => {
    if (!newList.name.trim()) return;
    
    createSegmentMutation.mutate({
      name: newList.name,
      description: newList.description
    });
  };

  // Handle status when SendGrid is not configured
  if (isLoadingStatus) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contact Segments</CardTitle>
          <CardDescription>Manage your contact segments for email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Checking SendGrid configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!sendGridStatus?.configured) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contact Segments</CardTitle>
          <CardDescription>Manage your contact segments for email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>SendGrid Not Configured</AlertTitle>
            <AlertDescription>
              Your SendGrid API key is not properly configured. Please set up your SendGrid API key in the environment variables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Main component return
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Contact Segments</CardTitle>
          <CardDescription>Manage your SendGrid contact segments for targeted email campaigns</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSegments()}
            disabled={isLoadingSegments}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Contact Segment</DialogTitle>
                <DialogDescription>
                  Create a new segment to organize your contacts in SendGrid for targeted email campaigns
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Segment Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter segment name"
                    value={newList.name}
                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter segment description"
                    value={newList.description}
                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSegment}
                  disabled={!newList.name.trim() || createSegmentMutation.isPending}
                >
                  {createSegmentMutation.isPending ? "Creating..." : "Create Segment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingSegments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading segments...</span>
          </div>
        ) : !contactSegments || contactSegments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No contact segments found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first contact segment to start organizing your email recipients.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactSegments.map((segment: any) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell>{segment.description || "-"}</TableCell>
                  <TableCell className="text-right">{segment.contact_count || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Total Segments: {contactSegments?.length || 0}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export Contacts
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
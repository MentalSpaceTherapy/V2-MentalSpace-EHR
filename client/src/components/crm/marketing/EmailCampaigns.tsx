import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCcw, AlertCircle, Calendar } from "lucide-react";
import { useCRM } from "@/hooks/use-crm";

export function EmailCampaigns() {
  const { 
    ccCampaigns,
    ccLists,
    fetchCCCampaigns,
    fetchCCLists,
    createCCCampaign,
    sendTestEmail,
    scheduleCampaign,
    isConstantContactConnected
  } = useCRM();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    fromEmail: "",
    fromName: "",
    listId: "",
    content: ""
  });

  useEffect(() => {
    if (isConstantContactConnected) {
      loadCampaigns();
      if (ccLists.length === 0) {
        fetchCCLists();
      }
    }
  }, [isConstantContactConnected]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      await fetchCCCampaigns();
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.fromEmail || !newCampaign.listId) return;

    setIsLoading(true);
    try {
      const campaignData = {
        name: newCampaign.name,
        subject: newCampaign.subject,
        from_email: newCampaign.fromEmail,
        from_name: newCampaign.fromName,
        list_id: newCampaign.listId,
        content: newCampaign.content
      };
      
      await createCCCampaign(campaignData);
      setNewCampaign({
        name: "",
        subject: "",
        fromEmail: "",
        fromName: "",
        listId: "",
        content: ""
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!selectedCampaign || !testEmail) return;

    setIsLoading(true);
    try {
      await sendTestEmail(selectedCampaign, [testEmail]);
      setTestEmail("");
      setIsTestDialogOpen(false);
    } catch (error) {
      console.error("Error sending test email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleCampaign = async () => {
    if (!selectedCampaign || !scheduledDate) return;

    setIsLoading(true);
    try {
      await scheduleCampaign(selectedCampaign, scheduledDate);
      setScheduledDate("");
      setIsScheduleDialogOpen(false);
    } catch (error) {
      console.error("Error scheduling campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isConstantContactConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>Create and manage your email marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-600">
              Please connect to Constant Contact to manage your email campaigns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>Create and manage your email marketing campaigns</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCampaigns}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Email Campaign</DialogTitle>
                <DialogDescription>
                  Design a new email campaign to send to your contacts
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter campaign name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      placeholder="your@email.com"
                      value={newCampaign.fromEmail}
                      onChange={(e) => setNewCampaign({ ...newCampaign, fromEmail: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      placeholder="Your Name"
                      value={newCampaign.fromName}
                      onChange={(e) => setNewCampaign({ ...newCampaign, fromName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="listId">Contact List</Label>
                  <Select
                    value={newCampaign.listId}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, listId: value })}
                  >
                    <SelectTrigger id="listId">
                      <SelectValue placeholder="Select a contact list" />
                    </SelectTrigger>
                    <SelectContent>
                      {ccLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} ({list.memberCount} contacts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your email content. HTML is supported."
                    value={newCampaign.content}
                    onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={
                    !newCampaign.name.trim() || 
                    !newCampaign.subject.trim() || 
                    !newCampaign.fromEmail.trim() || 
                    !newCampaign.listId || 
                    isLoading
                  }
                >
                  {isLoading ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && ccCampaigns.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading campaigns...</div>
          </div>
        ) : ccCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No email campaigns found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first email campaign to start reaching out to your contacts.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ccCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>{campaign.scheduledDate || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {campaign.status.toLowerCase() === "draft" && (
                        <>
                          <Dialog open={isTestDialogOpen && selectedCampaign === campaign.id} 
                            onOpenChange={(open) => {
                              setIsTestDialogOpen(open);
                              if (open) setSelectedCampaign(campaign.id);
                              else setSelectedCampaign(null);
                            }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Test</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xs">
                              <DialogHeader>
                                <DialogTitle>Send Test Email</DialogTitle>
                                <DialogDescription>
                                  Send a test email to preview this campaign
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="testEmail">Email Address</Label>
                                  <Input
                                    id="testEmail"
                                    placeholder="Enter your email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsTestDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSendTestEmail}
                                  disabled={!testEmail.trim() || isLoading}
                                >
                                  {isLoading ? "Sending..." : "Send Test"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isScheduleDialogOpen && selectedCampaign === campaign.id} 
                            onOpenChange={(open) => {
                              setIsScheduleDialogOpen(open);
                              if (open) setSelectedCampaign(campaign.id);
                              else setSelectedCampaign(null);
                            }}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xs">
                              <DialogHeader>
                                <DialogTitle>Schedule Campaign</DialogTitle>
                                <DialogDescription>
                                  Set a date and time to send this campaign
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="scheduledDate">Date and Time</Label>
                                  <Input
                                    id="scheduledDate"
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsScheduleDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleScheduleCampaign}
                                  disabled={!scheduledDate || isLoading}
                                >
                                  {isLoading ? "Scheduling..." : "Schedule"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Total Campaigns: {ccCampaigns.length}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
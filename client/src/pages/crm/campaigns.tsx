import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import EmailCampaigns from "@/components/crm/EmailCampaigns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  Edit, 
  Filter, 
  Mail, 
  MoreHorizontal, 
  Pause, 
  PieChart, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Smartphone, 
  Trash2, 
  Users 
} from "lucide-react";
import { useCRM, Campaign } from "@/hooks/use-crm";
import { format } from "date-fns";

export default function CRMCampaigns() {
  // Get data and methods from CRM context
  const { 
    campaigns, 
    addCampaign, 
    updateCampaign, 
    deleteCampaign,
    selectedTimeRange,
    setSelectedTimeRange 
  } = useCRM();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignForm, setCampaignForm] = useState<Omit<Campaign, "id" | "performance" | "stats">>({
    name: "",
    type: "Email",
    audience: "All Clients",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    status: "Draft"
  });
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Time range options
  const timeRangeOptions = {
    "week": "This Week",
    "month": "This Month",
    "quarter": "This Quarter",
    "year": "This Year"
  };
  
  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter(
    (campaign) => campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group campaigns by status
  const draftCampaigns = filteredCampaigns.filter(campaign => campaign.status === "Draft");
  const scheduledCampaigns = filteredCampaigns.filter(campaign => campaign.status === "Scheduled");
  const runningCampaigns = filteredCampaigns.filter(campaign => campaign.status === "Running");
  const completedCampaigns = filteredCampaigns.filter(campaign => campaign.status === "Completed");
  const pausedCampaigns = filteredCampaigns.filter(campaign => campaign.status === "Paused");
  
  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setCampaignForm({
      ...campaignForm,
      [field]: value
    });
  };
  
  // Handle campaign creation
  const handleCreateCampaign = () => {
    // Create new campaign object
    const newCampaign: Omit<Campaign, "id"> = {
      ...campaignForm,
      performance: "Not started", // Add performance field
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    };
    
    // Add campaign to context
    addCampaign(newCampaign);
    
    // Reset form and close dialog
    setCampaignForm({
      name: "",
      type: "Email",
      audience: "All Clients",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      status: "Draft"
    });
    setIsCreateDialogOpen(false);
  };
  
  // Get badge color based on campaign status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Running":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Completed":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Paused":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };
  
  // Get icon based on campaign type
  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "Email":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "SMS":
        return <Smartphone className="h-5 w-5 text-green-500" />;
      case "Social":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "Multi-channel":
        return <PieChart className="h-5 w-5 text-amber-500" />;
      default:
        return <Mail className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Marketing Campaigns" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Marketing Campaigns</h1>
              <p className="text-neutral-500 mt-1">
                Create and manage your email, SMS, and social media campaigns
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="h-9 px-3 text-xs gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>New Campaign</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Set up your new marketing campaign. You can edit all details later.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="campaignName" className="text-sm font-medium">
                        Campaign Name
                      </label>
                      <Input 
                        id="campaignName" 
                        value={campaignForm.name} 
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        placeholder="Summer Wellness Newsletter"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="campaignType" className="text-sm font-medium">
                          Type
                        </label>
                        <Select 
                          value={campaignForm.type} 
                          onValueChange={(value) => handleFormChange("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="Social">Social Media</SelectItem>
                            <SelectItem value="Multi-channel">Multi-channel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="campaignStatus" className="text-sm font-medium">
                          Status
                        </label>
                        <Select 
                          value={campaignForm.status} 
                          onValueChange={(value) => handleFormChange("status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Running">Running</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="campaignAudience" className="text-sm font-medium">
                        Audience
                      </label>
                      <Select 
                        value={campaignForm.audience} 
                        onValueChange={(value) => handleFormChange("audience", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Clients">All Clients</SelectItem>
                          <SelectItem value="Active Clients">Active Clients</SelectItem>
                          <SelectItem value="Inactive Clients">Inactive Clients</SelectItem>
                          <SelectItem value="New Clients">New Clients</SelectItem>
                          <SelectItem value="Prospective Clients">Prospective Clients</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium">
                          Start Date
                        </label>
                        <Input 
                          id="startDate" 
                          type="date" 
                          value={campaignForm.startDate} 
                          onChange={(e) => handleFormChange("startDate", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium">
                          End Date
                        </label>
                        <Input 
                          id="endDate" 
                          type="date" 
                          value={campaignForm.endDate} 
                          onChange={(e) => handleFormChange("endDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleCreateCampaign}
                      disabled={!campaignForm.name}
                    >
                      Create Campaign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="relative w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-9 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs gap-1.5"
                onClick={() => {
                  // Cycle through time ranges
                  const ranges: ("week" | "month" | "quarter" | "year")[] = ["week", "month", "quarter", "year"];
                  const currentIndex = ranges.indexOf(selectedTimeRange);
                  const nextIndex = (currentIndex + 1) % ranges.length;
                  setSelectedTimeRange(ranges[nextIndex]);
                }}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{timeRangeOptions[selectedTimeRange]}</span>
              </Button>
              
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-neutral-100 p-1">
              <TabsTrigger value="all" className="text-sm">All Campaigns</TabsTrigger>
              <TabsTrigger value="draft" className="text-sm">
                Draft
                <span className="ml-2 bg-neutral-200 rounded-full px-2 py-0.5 text-xs">
                  {draftCampaigns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="text-sm">
                Scheduled
                <span className="ml-2 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                  {scheduledCampaigns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="running" className="text-sm">
                Running
                <span className="ml-2 bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                  {runningCampaigns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm">
                Completed
                <span className="ml-2 bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                  {completedCampaigns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="paused" className="text-sm">
                Paused
                <span className="ml-2 bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                  {pausedCampaigns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="sendgrid" className="text-sm">
                <Mail className="h-4 w-4 mr-1.5" />
                SendGrid
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>All Campaigns</CardTitle>
                  <CardDescription>
                    View and manage all your marketing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredCampaigns.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Campaign Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCampaigns.map((campaign) => {
                          // Calculate performance metrics
                          const sentCount = campaign.stats.sent;
                          const openRate = sentCount > 0 
                            ? Math.round((campaign.stats.opened / sentCount) * 100) 
                            : 0;
                            
                          return (
                            <TableRow key={campaign.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {getCampaignTypeIcon(campaign.type)}
                                  <span>{campaign.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{campaign.type}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusBadgeClass(campaign.status)}>
                                  {campaign.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{campaign.audience}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Open rate: {openRate}%</span>
                                    <span>{campaign.stats.opened}/{sentCount}</span>
                                  </div>
                                  <Progress value={openRate} className="h-2" />
                                </div>
                              </TableCell>
                              <TableCell>{campaign.startDate}</TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  {campaign.status === "Running" ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <PieChart className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                      <p className="text-neutral-500 mb-6">
                        {searchQuery ? "Try adjusting your search query" : "Create your first campaign to get started"}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Campaign
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other tab contents would be similar but filtered by status */}
            <TabsContent value="draft">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Draft Campaigns</CardTitle>
                  <CardDescription>
                    Campaigns that are still in the creation process
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {draftCampaigns.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Campaign Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draftCampaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getCampaignTypeIcon(campaign.type)}
                                <span>{campaign.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{campaign.type}</TableCell>
                            <TableCell>{campaign.audience}</TableCell>
                            <TableCell>{campaign.startDate}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium mb-2">No draft campaigns</h3>
                      <p className="text-neutral-500 mb-6">
                        Create a new campaign to get started
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other status tabs would follow the same pattern */}
            
            <TabsContent value="sendgrid">
              <Card>
                <CardHeader>
                  <CardTitle>Email Marketing with SendGrid</CardTitle>
                  <CardDescription>
                    Create and send email campaigns using our SendGrid integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCampaigns />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
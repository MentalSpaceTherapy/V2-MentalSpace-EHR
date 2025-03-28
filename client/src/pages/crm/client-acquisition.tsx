import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight,
  Clock, 
  Filter, 
  Mail, 
  PhoneCall, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Target, 
  UserPlus,
  Users
} from "lucide-react";
import { useCRM } from "@/hooks/use-crm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Client Segmentation and Pipeline
type LeadStage = "New Lead" | "Contacted" | "Qualified" | "Consultation" | "Converted" | "Lost";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  notes: string;
  dateAdded: string;
  lastContacted?: string;
}

const initialLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Jennifer Smith",
    email: "jennifer.smith@example.com",
    phone: "(555) 123-4567",
    source: "Website",
    stage: "New Lead",
    notes: "Interested in anxiety treatment options",
    dateAdded: "2023-06-15",
    lastContacted: "2023-06-16",
  },
  {
    id: "lead-2",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "(555) 234-5678",
    source: "Referral",
    stage: "Contacted",
    notes: "Looking for family therapy sessions",
    dateAdded: "2023-06-10",
    lastContacted: "2023-06-14",
  },
  {
    id: "lead-3",
    name: "Maria Garcia",
    email: "maria.g@example.com",
    phone: "(555) 345-6789",
    source: "Social Media",
    stage: "Qualified",
    notes: "Needs depression counseling",
    dateAdded: "2023-06-05",
    lastContacted: "2023-06-12",
  },
  {
    id: "lead-4",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "(555) 456-7890",
    source: "Healthcare Provider",
    stage: "Consultation",
    notes: "Scheduled initial consultation for PTSD",
    dateAdded: "2023-06-01",
    lastContacted: "2023-06-10",
  },
  {
    id: "lead-5",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "(555) 567-8901",
    source: "Website",
    stage: "Converted",
    notes: "Started weekly therapy sessions",
    dateAdded: "2023-05-20",
    lastContacted: "2023-06-08",
  },
];

export default function CRMClientAcquisition() {
  // Get data and methods from CRM context
  const { 
    leads,
    incrementLeads,
    conversionRate,
    setConversionRate,
    clientSegments,
    addClientSegment,
    selectedTimeRange,
    setSelectedTimeRange 
  } = useCRM();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "",
    email: "",
    phone: "",
    source: "Website",
    stage: "New Lead",
    notes: "",
  });
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    criteria: [""],
  });
  
  // Time range options
  const timeRangeOptions = {
    "week": "This Week",
    "month": "This Month",
    "quarter": "This Quarter",
    "year": "This Year"
  };
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Filter leads based on search query
  const filteredLeads = leadsList.filter(
    (lead) => lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group leads by stage
  const newLeads = filteredLeads.filter(lead => lead.stage === "New Lead");
  const contactedLeads = filteredLeads.filter(lead => lead.stage === "Contacted");
  const qualifiedLeads = filteredLeads.filter(lead => lead.stage === "Qualified");
  const consultationLeads = filteredLeads.filter(lead => lead.stage === "Consultation");
  const convertedLeads = filteredLeads.filter(lead => lead.stage === "Converted");
  const lostLeads = filteredLeads.filter(lead => lead.stage === "Lost");
  
  // Handle lead form changes
  const handleLeadChange = (field: string, value: string) => {
    setNewLead({
      ...newLead,
      [field]: value
    });
  };
  
  // Handle segment form changes
  const handleSegmentChange = (field: string, value: string | string[]) => {
    setNewSegment({
      ...newSegment,
      [field]: value
    });
  };
  
  // Add criteria to segment
  const addCriteria = () => {
    setNewSegment({
      ...newSegment,
      criteria: [...newSegment.criteria, ""]
    });
  };
  
  // Update criteria at index
  const updateCriteria = (index: number, value: string) => {
    const newCriteria = [...newSegment.criteria];
    newCriteria[index] = value;
    setNewSegment({
      ...newSegment,
      criteria: newCriteria
    });
  };
  
  // Remove criteria at index
  const removeCriteria = (index: number) => {
    const newCriteria = [...newSegment.criteria];
    newCriteria.splice(index, 1);
    setNewSegment({
      ...newSegment,
      criteria: newCriteria
    });
  };
  
  // Create new lead
  const createLead = () => {
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      name: newLead.name || "",
      email: newLead.email || "",
      phone: newLead.phone || "",
      source: newLead.source as string || "Website",
      stage: newLead.stage as LeadStage || "New Lead",
      notes: newLead.notes || "",
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    setLeadsList([...leadsList, lead]);
    incrementLeads(1); // Increment lead count in CRM context
    
    // Reset form
    setNewLead({
      name: "",
      email: "",
      phone: "",
      source: "Website",
      stage: "New Lead",
      notes: "",
    });
    setIsCreateLeadOpen(false);
  };
  
  // Create new segment
  const createSegment = () => {
    if (newSegment.name) {
      addClientSegment({
        name: newSegment.name,
        description: newSegment.description,
        criteria: newSegment.criteria.filter(c => c.trim() !== ""), // Remove empty criteria
        count: Math.floor(Math.random() * 50) + 5 // Random count for demo
      });
      
      // Reset form
      setNewSegment({
        name: "",
        description: "",
        criteria: [""]
      });
      setIsCreateSegmentOpen(false);
    }
  };
  
  // Handle drag end for kanban board
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the lead that was dragged
      const lead = leadsList.find(l => l.id === active.id);
      if (!lead) return;
      
      // Get the new stage from the over container
      const newStage = over.id as LeadStage;
      
      // Update the lead's stage
      const updatedLeads = leadsList.map(l => 
        l.id === lead.id ? { ...l, stage: newStage, lastContacted: new Date().toISOString().split('T')[0] } : l
      );
      
      setLeadsList(updatedLeads);
      
      // If moved to "Converted", update conversion rate
      if (newStage === "Converted" && lead.stage !== "Converted") {
        // For demo purposes, slightly increase conversion rate when a lead converts
        setConversionRate(Math.min(100, conversionRate + 0.5));
      }
    }
  };
  
  // Get color for lead source badge
  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "Website":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Referral":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Social Media":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Healthcare Provider":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        <TopBar title="Client Acquisition" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Client Acquisition</h1>
              <p className="text-neutral-500 mt-1">
                Track and manage your lead generation and conversion pipeline
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="h-9 px-3 text-xs gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>New Lead</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                      Enter the details of your new lead. You can update their status as they progress through your pipeline.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="leadName" className="text-sm font-medium">
                        Name
                      </label>
                      <Input 
                        id="leadName" 
                        value={newLead.name || ""} 
                        onChange={(e) => handleLeadChange("name", e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="leadEmail" className="text-sm font-medium">
                          Email
                        </label>
                        <Input 
                          id="leadEmail" 
                          type="email" 
                          value={newLead.email || ""} 
                          onChange={(e) => handleLeadChange("email", e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="leadPhone" className="text-sm font-medium">
                          Phone
                        </label>
                        <Input 
                          id="leadPhone" 
                          value={newLead.phone || ""} 
                          onChange={(e) => handleLeadChange("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="leadSource" className="text-sm font-medium">
                          Source
                        </label>
                        <Select 
                          value={newLead.source || "Website"} 
                          onValueChange={(value) => handleLeadChange("source", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Social Media">Social Media</SelectItem>
                            <SelectItem value="Healthcare Provider">Healthcare Provider</SelectItem>
                            <SelectItem value="Event">Event or Workshop</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="leadStage" className="text-sm font-medium">
                          Stage
                        </label>
                        <Select 
                          value={newLead.stage || "New Lead"} 
                          onValueChange={(value) => handleLeadChange("stage", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New Lead">New Lead</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                            <SelectItem value="Converted">Converted</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="leadNotes" className="text-sm font-medium">
                        Notes
                      </label>
                      <Textarea 
                        id="leadNotes" 
                        value={newLead.notes || ""} 
                        onChange={(e) => handleLeadChange("notes", e.target.value)}
                        placeholder="Enter any relevant notes about this lead..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateLeadOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={createLead}
                      disabled={!newLead.name || !newLead.email}
                    >
                      Add Lead
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="relative w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search leads..."
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
          
          <Tabs defaultValue="pipeline" className="space-y-6">
            <TabsList className="bg-neutral-100 p-1">
              <TabsTrigger value="pipeline" className="text-sm">Pipeline</TabsTrigger>
              <TabsTrigger value="leads" className="text-sm">Leads List</TabsTrigger>
              <TabsTrigger value="segments" className="text-sm">Client Segments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pipeline">
              <div className="mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Client Acquisition Pipeline</CardTitle>
                    <CardDescription>
                      Drag and drop leads to update their status in your pipeline
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-6 gap-4">
                  {/* New Leads Column */}
                  <div className="col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                          <Badge variant="outline" className="bg-neutral-100">
                            {newLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 p-2">
                        <SortableContext 
                          items={newLeads.map(lead => lead.id)} 
                          strategy={verticalListSortingStrategy}
                          id="New Lead"
                        >
                          {newLeads.map((lead) => (
                            <Card key={lead.id} id={lead.id} className="mb-2 cursor-move">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{lead.email}</div>
                                <Badge variant="outline" className={`mt-2 text-xs ${getSourceBadgeClass(lead.source)}`}>
                                  {lead.source}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </SortableContext>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Contacted Column */}
                  <div className="col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Contacted</CardTitle>
                          <Badge variant="outline" className="bg-neutral-100">
                            {contactedLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 p-2">
                        <SortableContext 
                          items={contactedLeads.map(lead => lead.id)} 
                          strategy={verticalListSortingStrategy}
                          id="Contacted"
                        >
                          {contactedLeads.map((lead) => (
                            <Card key={lead.id} id={lead.id} className="mb-2 cursor-move">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{lead.email}</div>
                                <Badge variant="outline" className={`mt-2 text-xs ${getSourceBadgeClass(lead.source)}`}>
                                  {lead.source}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </SortableContext>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Qualified Column */}
                  <div className="col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                          <Badge variant="outline" className="bg-neutral-100">
                            {qualifiedLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 p-2">
                        <SortableContext 
                          items={qualifiedLeads.map(lead => lead.id)} 
                          strategy={verticalListSortingStrategy}
                          id="Qualified"
                        >
                          {qualifiedLeads.map((lead) => (
                            <Card key={lead.id} id={lead.id} className="mb-2 cursor-move">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{lead.email}</div>
                                <Badge variant="outline" className={`mt-2 text-xs ${getSourceBadgeClass(lead.source)}`}>
                                  {lead.source}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </SortableContext>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Consultation Column */}
                  <div className="col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Consultation</CardTitle>
                          <Badge variant="outline" className="bg-neutral-100">
                            {consultationLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 p-2">
                        <SortableContext 
                          items={consultationLeads.map(lead => lead.id)} 
                          strategy={verticalListSortingStrategy}
                          id="Consultation"
                        >
                          {consultationLeads.map((lead) => (
                            <Card key={lead.id} id={lead.id} className="mb-2 cursor-move">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{lead.email}</div>
                                <Badge variant="outline" className={`mt-2 text-xs ${getSourceBadgeClass(lead.source)}`}>
                                  {lead.source}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </SortableContext>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Converted Column */}
                  <div className="col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Converted</CardTitle>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {convertedLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 p-2">
                        <SortableContext 
                          items={convertedLeads.map(lead => lead.id)} 
                          strategy={verticalListSortingStrategy}
                          id="Converted"
                        >
                          {convertedLeads.map((lead) => (
                            <Card key={lead.id} id={lead.id} className="mb-2 cursor-move">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{lead.email}</div>
                                <Badge variant="outline" className={`mt-2 text-xs ${getSourceBadgeClass(lead.source)}`}>
                                  {lead.source}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </SortableContext>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Lost Column */}
                  <div className="col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Lost</CardTitle>
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            {lostLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 p-2">
                        <SortableContext 
                          items={lostLeads.map(lead => lead.id)} 
                          strategy={verticalListSortingStrategy}
                          id="Lost"
                        >
                          {lostLeads.map((lead) => (
                            <Card key={lead.id} id={lead.id} className="mb-2 cursor-move">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{lead.email}</div>
                                <Badge variant="outline" className={`mt-2 text-xs ${getSourceBadgeClass(lead.source)}`}>
                                  {lead.source}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </SortableContext>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DndContext>
            </TabsContent>
            
            <TabsContent value="leads">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Leads Directory</CardTitle>
                      <CardDescription>
                        View and manage all your leads in one place
                      </CardDescription>
                    </div>
                    <Button variant="default" size="sm" onClick={() => setIsCreateLeadOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredLeads.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 bg-neutral-50 p-3 text-xs font-medium text-neutral-500">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-2">Email</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-2">Stage</div>
                        <div className="col-span-2">Added</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredLeads.map((lead) => (
                          <div key={lead.id} className="grid grid-cols-12 items-center p-3 hover:bg-neutral-50">
                            <div className="col-span-3 font-medium">{lead.name}</div>
                            <div className="col-span-2 text-sm">{lead.email}</div>
                            <div className="col-span-2">
                              <Badge variant="outline" className={getSourceBadgeClass(lead.source)}>
                                {lead.source}
                              </Badge>
                            </div>
                            <div className="col-span-2 text-sm">{lead.stage}</div>
                            <div className="col-span-2 text-sm text-neutral-500">{lead.dateAdded}</div>
                            <div className="col-span-1 flex justify-end">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <PhoneCall className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium mb-2">No leads found</h3>
                      <p className="text-neutral-500 mb-6">
                        {searchQuery ? "Try adjusting your search query" : "Add your first lead to get started"}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsCreateLeadOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New Lead
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="segments">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-9">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Client Segments</CardTitle>
                          <CardDescription>
                            Create and manage groups of clients based on specific criteria
                          </CardDescription>
                        </div>
                        <Dialog open={isCreateSegmentOpen} onOpenChange={setIsCreateSegmentOpen}>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              New Segment
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Create Client Segment</DialogTitle>
                              <DialogDescription>
                                Define a new client segment based on specific criteria. This will help you target marketing campaigns.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <label htmlFor="segmentName" className="text-sm font-medium">
                                  Segment Name
                                </label>
                                <Input
                                  id="segmentName"
                                  value={newSegment.name}
                                  onChange={(e) => handleSegmentChange("name", e.target.value)}
                                  placeholder="Anxiety Clients"
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <label htmlFor="segmentDescription" className="text-sm font-medium">
                                  Description
                                </label>
                                <Textarea
                                  id="segmentDescription"
                                  value={newSegment.description}
                                  onChange={(e) => handleSegmentChange("description", e.target.value)}
                                  placeholder="Clients seeking treatment for anxiety disorders"
                                  rows={2}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm font-medium">Segment Criteria</label>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={addCriteria}
                                  >
                                    Add Criteria
                                  </Button>
                                </div>
                                
                                <div className="space-y-3">
                                  {newSegment.criteria.map((criterion, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        value={criterion}
                                        onChange={(e) => updateCriteria(index, e.target.value)}
                                        placeholder="E.g., Age 25-40, Diagnosis: Anxiety, etc."
                                        className="flex-1"
                                      />
                                      {newSegment.criteria.length > 1 && (
                                        <Button 
                                          type="button" 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => removeCriteria(index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsCreateSegmentOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                onClick={createSegment}
                                disabled={!newSegment.name}
                              >
                                Create Segment
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {clientSegments.length > 0 ? (
                        <div className="divide-y border rounded-md">
                          {clientSegments.map((segment, index) => (
                            <div key={index} className="p-4 hover:bg-neutral-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{segment.name}</h3>
                                  <p className="text-sm text-neutral-500 mt-1">{segment.description}</p>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {segment.count} clients
                                </Badge>
                              </div>
                              
                              <div className="mt-3">
                                <h4 className="text-xs font-medium text-neutral-500 mb-2">Criteria:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {segment.criteria.map((criterion, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-neutral-100">
                                      {criterion}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <Target className="h-3.5 w-3.5 mr-1" />
                                  Target Campaign
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <ArrowRight className="h-3.5 w-3.5 mr-1" />
                                  View Clients
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <h3 className="text-lg font-medium mb-2">No segments created</h3>
                          <p className="text-neutral-500 mb-6">
                            Create your first client segment to better target your marketing efforts
                          </p>
                          <Button onClick={() => setIsCreateSegmentOpen(true)}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Segment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="md:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Total Leads</h3>
                          <p className="text-2xl font-bold">{leads}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Conversion Rate</h3>
                          <p className="text-2xl font-bold">{conversionRate}%</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Active Segments</h3>
                          <p className="text-2xl font-bold">{clientSegments.length}</p>
                        </div>
                        
                        <div className="pt-2">
                          <Button variant="outline" className="w-full justify-start">
                            <PieChart className="h-4 w-4 mr-2" />
                            View Full Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
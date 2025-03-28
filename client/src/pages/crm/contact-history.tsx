import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { 
  CalendarClock, 
  Check, 
  Clock, 
  Edit, 
  Filter, 
  Mail, 
  MessageSquare, 
  Phone, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Users, 
  Video, 
  X 
} from "lucide-react";
import { useCRM, ContactHistory } from "@/hooks/use-crm";
import { format } from "date-fns";

// Define Lead type locally since we just need it for this component
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  notes?: string;
  dateAdded: string;
  lastContacted: string;
};

export default function CRMContactHistory() {
  // Get data and methods from CRM context
  const { 
    contactHistory,
    addContactHistory,
    updateContactHistory,
    deleteContactHistory,
    getLeadContactHistory
  } = useCRM();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<Omit<ContactHistory, "id">>({
    leadId: "",
    contactType: "Email",
    contactNumber: 1,
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    outcome: "Positive",
    notes: "",
    completedBy: "Current User", // This would normally come from the logged-in user
    followUpDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // Default 1 week in future
    followUpType: "Email"
  });
  
  // Load initial leads list - in a real implementation, this would come from the CRM context
  // or a separate API call for all leads
  const [leadsList, setLeadsList] = useState<Lead[]>([
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
    }
  ]);
  
  // When a lead is selected, update the new contact form with the lead ID
  useEffect(() => {
    if (selectedLead) {
      setNewContact(prev => ({ 
        ...prev, 
        leadId: selectedLead,
        // Get the last contact number for this lead and increment it
        contactNumber: getLeadContactHistory(selectedLead).length + 1
      }));
    }
  }, [selectedLead, getLeadContactHistory]);
  
  // Function to handle contact form input changes
  const handleContactChange = (field: string, value: string | number) => {
    setNewContact({
      ...newContact,
      [field]: value
    });
  };
  
  // Function to add a new contact history entry
  const handleAddContact = () => {
    // Add to context
    addContactHistory(newContact);
    
    // Reset form
    setNewContact({
      leadId: selectedLead || "",
      contactType: "Email",
      contactNumber: newContact.contactNumber + 1, // Increment for next contact
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      outcome: "Positive",
      notes: "",
      completedBy: "Current User",
      followUpDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      followUpType: "Email"
    });
    
    // Close dialog
    setIsAddContactOpen(false);
  };
  
  // Filter contacts based on search query
  const filteredContacts = contactHistory.filter(
    (contact) => {
      const matchesSearch = 
        leadsList.find(lead => lead.id === contact.leadId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.contactType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.completedBy.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesSearch && (!selectedLead || contact.leadId === selectedLead);
    }
  );
  
  // Sort contacts by date and time (most recent first)
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Get the lead name from the ID
  const getLeadName = (leadId: string) => {
    const lead = leadsList.find(lead => lead.id === leadId);
    return lead ? lead.name : 'Unknown Lead';
  };
  
  // Get icon for contact type
  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case "Email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "Phone":
        return <Phone className="h-4 w-4 text-green-500" />;
      case "Video":
        return <Video className="h-4 w-4 text-purple-500" />;
      case "In-Person":
        return <Users className="h-4 w-4 text-amber-500" />;
      case "Text":
        return <MessageSquare className="h-4 w-4 text-teal-500" />;
      case "Social Media":
        return <MessageSquare className="h-4 w-4 text-pink-500" />;
      default:
        return <Mail className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Get badge class for outcome type
  const getOutcomeBadgeClass = (outcome: string) => {
    switch (outcome) {
      case "Positive":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Neutral":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Negative":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "No Response":
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  // Helper function to safely format note excerpts with proper null checks
  const formatNoteExcerpt = (notes: string | undefined) => {
    if (!notes) return '';
    
    const excerpt = notes.substring(0, 80);
    return `${excerpt}${notes.length > 80 ? '...' : ''}`;
  };
  
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        <TopBar title="Contact History" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Contact History</h1>
              <p className="text-neutral-500 mt-1">
                Track your interactions with leads and clients
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="h-9 px-3 text-xs gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Record Contact</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Record Contact</DialogTitle>
                    <DialogDescription>
                      Record a new contact with a lead or client
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="leadId" className="text-sm font-medium">
                        Lead/Client
                      </label>
                      <Select 
                        value={newContact.leadId} 
                        onValueChange={(value) => {
                          setSelectedLead(value);
                          handleContactChange("leadId", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead or client" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadsList.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="contactType" className="text-sm font-medium">
                          Contact Type
                        </label>
                        <Select 
                          value={newContact.contactType} 
                          onValueChange={(value) => handleContactChange("contactType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Video">Video</SelectItem>
                            <SelectItem value="In-Person">In-Person</SelectItem>
                            <SelectItem value="Text">Text</SelectItem>
                            <SelectItem value="Social Media">Social Media</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="contactNumber" className="text-sm font-medium">
                          Contact Number
                        </label>
                        <Input 
                          id="contactNumber" 
                          type="number"
                          value={newContact.contactNumber} 
                          onChange={(e) => handleContactChange("contactNumber", parseInt(e.target.value))}
                          min={1}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="date" className="text-sm font-medium">
                          Date
                        </label>
                        <Input 
                          id="date" 
                          type="date"
                          value={newContact.date} 
                          onChange={(e) => handleContactChange("date", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="time" className="text-sm font-medium">
                          Time
                        </label>
                        <Input 
                          id="time" 
                          type="time"
                          value={newContact.time} 
                          onChange={(e) => handleContactChange("time", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="outcome" className="text-sm font-medium">
                          Outcome
                        </label>
                        <Select 
                          value={newContact.outcome} 
                          onValueChange={(value) => handleContactChange("outcome", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Neutral">Neutral</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="No Response">No Response</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="duration" className="text-sm font-medium">
                          Duration (minutes)
                        </label>
                        <Input 
                          id="duration" 
                          type="number"
                          value={newContact.duration || ''} 
                          onChange={(e) => handleContactChange("duration", parseInt(e.target.value))}
                          min={1}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        Notes
                      </label>
                      <Textarea 
                        id="notes" 
                        value={newContact.notes || ''} 
                        onChange={(e) => handleContactChange("notes", e.target.value)}
                        rows={3}
                        placeholder="Enter notes about the contact..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="followUpDate" className="text-sm font-medium">
                          Follow-up Date
                        </label>
                        <Input 
                          id="followUpDate" 
                          type="date"
                          value={newContact.followUpDate || ''} 
                          onChange={(e) => handleContactChange("followUpDate", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="followUpType" className="text-sm font-medium">
                          Follow-up Type
                        </label>
                        <Input 
                          id="followUpType" 
                          value={newContact.followUpType || ''} 
                          onChange={(e) => handleContactChange("followUpType", e.target.value)}
                          placeholder="Email, Phone, In-Person, etc."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setIsAddContactOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddContact}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All Contacts</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Follow-ups</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input 
                        type="search" 
                        placeholder="Search..." 
                        className="w-64 pl-9 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <TabsContent value="all" className="mt-0">
                  <Card>
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-lg">All Contact History</CardTitle>
                      <CardDescription>
                        View all contact interactions with leads and clients
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Lead/Client</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Contact #</TableHead>
                            <TableHead>Outcome</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Follow-up</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedContacts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-6 text-neutral-500">
                                No contact history found. Record your first contact.
                              </TableCell>
                            </TableRow>
                          ) : (
                            sortedContacts.map((contact) => (
                              <TableRow key={contact.id}>
                                <TableCell>
                                  <div className="font-medium">{getLeadName(contact.leadId)}</div>
                                  <div className="text-xs text-neutral-500">
                                    {leadsList.find(lead => lead.id === contact.leadId)?.email}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getContactTypeIcon(contact.contactType)}
                                    <span>{contact.contactType}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>{contact.date}</div>
                                  <div className="text-xs text-neutral-500">{contact.time}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50">
                                    {contact.contactNumber}{getContactNumberSuffix(contact.contactNumber)} Contact
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getOutcomeBadgeClass(contact.outcome)}>
                                    {contact.outcome}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs truncate">
                                    {formatNoteExcerpt(contact.notes)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {contact.followUpDate && (
                                    <div className="text-xs">
                                      <div className="flex items-center text-neutral-600">
                                        <CalendarClock className="h-3 w-3 mr-1" />
                                        {contact.followUpDate}
                                      </div>
                                      <div className="text-neutral-500 mt-0.5">
                                        via {contact.followUpType}
                                      </div>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="upcoming" className="mt-0">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader className="p-5 pb-3">
                        <CardTitle className="text-lg">Today's Follow-ups</CardTitle>
                        <CardDescription>
                          Follow-ups scheduled for today
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 pt-1">
                        {sortedContacts.filter(contact => contact.followUpDate === format(new Date(), "yyyy-MM-dd")).length === 0 ? (
                          <div className="text-center py-8 text-neutral-500">
                            No follow-ups scheduled for today
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {sortedContacts
                              .filter(contact => contact.followUpDate === format(new Date(), "yyyy-MM-dd"))
                              .map(contact => (
                                <div key={contact.id} className="border rounded-lg p-4 flex justify-between items-center">
                                  <div className="flex gap-3">
                                    <div className="mt-0.5">
                                      {getContactTypeIcon(contact.followUpType || "Email")}
                                    </div>
                                    <div>
                                      <div className="font-medium">Follow up with {getLeadName(contact.leadId)}</div>
                                      <div className="text-sm text-neutral-500">
                                        {contact.followUpType} follow-up - {formatNoteExcerpt(contact.notes)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8">
                                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                                      Reschedule
                                    </Button>
                                    <Button size="sm" className="h-8">
                                      <Check className="h-3.5 w-3.5 mr-1.5" />
                                      Complete
                                    </Button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-5 pb-3">
                        <CardTitle className="text-lg">Upcoming Follow-ups</CardTitle>
                        <CardDescription>
                          Follow-ups scheduled for the coming days
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 pt-1">
                        {sortedContacts.filter(contact => 
                          contact.followUpDate && 
                          contact.followUpDate > format(new Date(), "yyyy-MM-dd") &&
                          new Date(contact.followUpDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        ).length === 0 ? (
                          <div className="text-center py-8 text-neutral-500">
                            No upcoming follow-ups scheduled for the next 7 days
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {sortedContacts
                              .filter(contact => 
                                contact.followUpDate && 
                                contact.followUpDate > format(new Date(), "yyyy-MM-dd") &&
                                new Date(contact.followUpDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              )
                              .map(contact => (
                                <div key={contact.id} className="border rounded-lg p-4 flex justify-between items-center">
                                  <div className="flex gap-3">
                                    <div className="mt-0.5">
                                      {getContactTypeIcon(contact.followUpType || "Email")}
                                    </div>
                                    <div>
                                      <div className="font-medium">Follow up with {getLeadName(contact.leadId)}</div>
                                      <div className="text-sm text-neutral-500">
                                        {contact.followUpType} follow-up - {formatNoteExcerpt(contact.notes)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8">
                                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                                      Reschedule
                                    </Button>
                                    <Button size="sm" className="h-8">
                                      <Check className="h-3.5 w-3.5 mr-1.5" />
                                      Complete
                                    </Button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="overdue" className="mt-0">
                  <Card>
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-lg">Overdue Follow-ups</CardTitle>
                      <CardDescription>
                        Follow-ups that are past their scheduled date
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-1">
                      {sortedContacts.filter(contact => 
                        contact.followUpDate && contact.followUpDate < format(new Date(), "yyyy-MM-dd")
                      ).length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          No overdue follow-ups
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sortedContacts
                            .filter(contact => 
                              contact.followUpDate && contact.followUpDate < format(new Date(), "yyyy-MM-dd")
                            )
                            .map(contact => (
                              <div key={contact.id} className="border border-red-200 bg-red-50 rounded-lg p-4 flex justify-between items-start">
                                <div className="flex gap-3">
                                  <div className="mt-0.5">
                                    {getContactTypeIcon(contact.followUpType || "Email")}
                                  </div>
                                  <div>
                                    <div className="font-medium">Follow up with {getLeadName(contact.leadId)}</div>
                                    <div className="text-xs text-neutral-500">{contact.followUpDate}</div>
                                    <div className="text-sm text-neutral-500 mt-1">
                                      {contact.followUpType} follow-up - {formatNoteExcerpt(contact.notes)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="h-8 border-red-200">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    Reschedule
                                  </Button>
                                  <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700">
                                    <Check className="h-3.5 w-3.5 mr-1.5" />
                                    Complete
                                  </Button>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="col-span-1">
              <div className="sticky top-6 space-y-6">
                <Card>
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-lg">Lead Filter</CardTitle>
                    <CardDescription>
                      View contacts by lead
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-2">
                    <div className="space-y-3">
                      <div 
                        className={`p-2.5 rounded-md cursor-pointer hover:bg-neutral-100 ${!selectedLead ? 'bg-primary-50 text-primary-700 font-medium' : ''}`}
                        onClick={() => setSelectedLead(null)}
                      >
                        All Leads
                      </div>
                      
                      {leadsList.map((lead) => (
                        <div 
                          key={lead.id} 
                          className={`p-2.5 rounded-md cursor-pointer hover:bg-neutral-100 ${selectedLead === lead.id ? 'bg-primary-50 text-primary-700 font-medium' : ''}`}
                          onClick={() => setSelectedLead(lead.id)}
                        >
                          <div>{lead.name}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {getLeadContactHistory(lead.id).length} contacts
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-lg">Contact Statistics</CardTitle>
                    <CardDescription>
                      Overview of contact activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-2">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-neutral-500">Total Contacts</div>
                        <div className="text-2xl font-bold mt-1">{contactHistory.length}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-neutral-500">By Outcome</div>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span>Positive</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.outcome === "Positive").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span>Neutral</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.outcome === "Neutral").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              <span>Negative</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.outcome === "Negative").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-neutral-400 mr-2"></div>
                              <span>No Response</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.outcome === "No Response").length}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-neutral-500">By Type</div>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <Mail className="h-3.5 w-3.5 text-blue-500 mr-2" />
                              <span>Email</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.contactType === "Email").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <Phone className="h-3.5 w-3.5 text-green-500 mr-2" />
                              <span>Phone</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.contactType === "Phone").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <Video className="h-3.5 w-3.5 text-purple-500 mr-2" />
                              <span>Video</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.contactType === "Video").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 text-amber-500 mr-2" />
                              <span>In-Person</span>
                            </div>
                            <span className="font-medium">
                              {contactHistory.filter(c => c.contactType === "In-Person").length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get the correct suffix for contact numbers (1st, 2nd, 3rd, etc.)
function getContactNumberSuffix(num: number): string {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
}
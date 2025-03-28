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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { 
  BarChart3, 
  Building2, 
  Calendar, 
  Clock, 
  Edit, 
  ExternalLink, 
  Filter, 
  Mail, 
  MapPin, 
  Phone, 
  PieChart, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Share2, 
  Smartphone, 
  Tag, 
  Trash2, 
  TrendingUp, 
  User, 
  Users 
} from "lucide-react";
import { useCRM, ReferralPartner } from "@/hooks/use-crm";
import { PieChart as RechartPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from "date-fns";

export default function CRMReferralSources() {
  // Get data and methods from CRM context
  const { 
    referralSources, 
    updateReferralSources,
    referralPartners,
    addReferralPartner,
    updateReferralPartner,
    deleteReferralPartner,
    selectedTimeRange,
    setSelectedTimeRange
  } = useCRM();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<Omit<ReferralPartner, "id" | "referralCount" | "conversionRate">>({
    name: "",
    type: "Healthcare Provider",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    partnerSince: format(new Date(), "yyyy-MM-dd"),
    activeStatus: "Active",
    notes: "",
    lastContactDate: format(new Date(), "yyyy-MM-dd")
  });
  
  // Time range options
  const timeRangeOptions = {
    "week": "This Week",
    "month": "This Month",
    "quarter": "This Quarter",
    "year": "This Year"
  };
  
  // Function to handle partner form input changes
  const handlePartnerChange = (field: string, value: string) => {
    setNewPartner({
      ...newPartner,
      [field]: value
    });
  };
  
  // Function to add a new referral partner
  const handleAddPartner = () => {
    // Create the partner with initial metrics
    const partnerToAdd = {
      ...newPartner,
      referralCount: 0,
      conversionRate: 0
    };
    
    // Add to context
    addReferralPartner(partnerToAdd);
    
    // Reset form and close dialog
    setNewPartner({
      name: "",
      type: "Healthcare Provider",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      partnerSince: format(new Date(), "yyyy-MM-dd"),
      activeStatus: "Active",
      notes: "",
      lastContactDate: format(new Date(), "yyyy-MM-dd")
    });
    setIsAddPartnerOpen(false);
  };
  
  // Filter partners based on search query
  const filteredPartners = referralPartners.filter(
    (partner) => 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get color for partner type badge
  const getPartnerTypeBadgeClass = (type: string) => {
    switch (type) {
      case "Healthcare Provider":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Community Organization":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Former Client":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Business":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Educational Institution":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };
  
  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Inactive":
        return "text-neutral-500";
      case "Potential":
        return "text-blue-600";
      default:
        return "text-neutral-600";
    }
  };
  
  // COLORS for chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        <TopBar title="Referral Sources" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Referral Sources</h1>
              <p className="text-neutral-500 mt-1">
                Track and manage your referral partners and lead sources
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="h-9 px-3 text-xs gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Partner</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add Referral Partner</DialogTitle>
                    <DialogDescription>
                      Add a new referral partner to track their referrals and effectiveness.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="partnerName" className="text-sm font-medium">
                          Partner Name
                        </label>
                        <Input 
                          id="partnerName" 
                          value={newPartner.name} 
                          onChange={(e) => handlePartnerChange("name", e.target.value)}
                          placeholder="Oakwood Medical Center"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="partnerType" className="text-sm font-medium">
                          Partner Type
                        </label>
                        <Select 
                          value={newPartner.type} 
                          onValueChange={(value) => handlePartnerChange("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Healthcare Provider">Healthcare Provider</SelectItem>
                            <SelectItem value="Community Organization">Community Organization</SelectItem>
                            <SelectItem value="Former Client">Former Client</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="contactPerson" className="text-sm font-medium">
                          Contact Person
                        </label>
                        <Input 
                          id="contactPerson" 
                          value={newPartner.contactPerson} 
                          onChange={(e) => handlePartnerChange("contactPerson", e.target.value)}
                          placeholder="Dr. Sarah Johnson"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="activeStatus" className="text-sm font-medium">
                          Status
                        </label>
                        <Select 
                          value={newPartner.activeStatus} 
                          onValueChange={(value) => handlePartnerChange("activeStatus", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Potential">Potential</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input 
                          id="email" 
                          type="email"
                          value={newPartner.email} 
                          onChange={(e) => handlePartnerChange("email", e.target.value)}
                          placeholder="contact@partner.com"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone
                        </label>
                        <Input 
                          id="phone" 
                          value={newPartner.phone} 
                          onChange={(e) => handlePartnerChange("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="address" className="text-sm font-medium">
                        Address
                      </label>
                      <Input 
                        id="address" 
                        value={newPartner.address} 
                        onChange={(e) => handlePartnerChange("address", e.target.value)}
                        placeholder="123 Main St, Portland, OR 97205"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="partnerSince" className="text-sm font-medium">
                          Partner Since
                        </label>
                        <Input 
                          id="partnerSince" 
                          type="date"
                          value={newPartner.partnerSince} 
                          onChange={(e) => handlePartnerChange("partnerSince", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="lastContactDate" className="text-sm font-medium">
                          Last Contact Date
                        </label>
                        <Input 
                          id="lastContactDate" 
                          type="date"
                          value={newPartner.lastContactDate} 
                          onChange={(e) => handlePartnerChange("lastContactDate", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        Notes
                      </label>
                      <Textarea 
                        id="notes" 
                        value={newPartner.notes} 
                        onChange={(e) => handlePartnerChange("notes", e.target.value)}
                        rows={3}
                        placeholder="Additional notes about the partner..."
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddPartnerOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleAddPartner}
                      disabled={!newPartner.name || !newPartner.contactPerson || !newPartner.email || !newPartner.phone}
                    >
                      Add Partner
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="relative w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search partners..."
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
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-neutral-100 p-1">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="partners" className="text-sm">Referral Partners</TabsTrigger>
              <TabsTrigger value="metrics" className="text-sm">Performance Metrics</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-12 gap-6">
                {/* Referral Sources Chart */}
                <div className="col-span-8">
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle>Referral Source Distribution</CardTitle>
                      <CardDescription>
                        Where your leads are coming from in {timeRangeOptions[selectedTimeRange].toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartPieChart>
                            <Pie
                              data={referralSources}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {referralSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                            <Legend />
                          </RechartPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Metrics Cards */}
                <div className="col-span-4 space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {referralPartners
                        .sort((a, b) => b.referralCount - a.referralCount)
                        .slice(0, 3)
                        .map((partner, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{partner.name}</div>
                              <div className="text-xs text-neutral-500">
                                {partner.type}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{partner.referralCount} referrals</div>
                              <div className="text-xs text-green-600">
                                {partner.conversionRate}% conversion
                              </div>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Summary Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>Total Partners:</div>
                        <div className="font-medium">{referralPartners.length}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>Active Partners:</div>
                        <div className="font-medium">
                          {referralPartners.filter(p => p.activeStatus === "Active").length}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>Total Referrals:</div>
                        <div className="font-medium">
                          {referralPartners.reduce((sum, p) => sum + p.referralCount, 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>Avg. Conversion Rate:</div>
                        <div className="font-medium text-green-600">
                          {(referralPartners.reduce((sum, p) => sum + p.conversionRate, 0) / 
                            (referralPartners.length || 1)).toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Referral Trends */}
                <div className="col-span-12">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Referral Trends</CardTitle>
                      <CardDescription>
                        Referral volume by source over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={referralSources}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Referrals" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Partners Tab */}
            <TabsContent value="partners">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Referral Partners</CardTitle>
                  <CardDescription>
                    Manage your referral partner relationships and track performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredPartners.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Partner Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Referrals</TableHead>
                          <TableHead>Conversion Rate</TableHead>
                          <TableHead>Last Contact</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPartners.map((partner) => (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-neutral-400" />
                                <span>{partner.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPartnerTypeBadgeClass(partner.type)}>
                                {partner.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={getStatusColorClass(partner.activeStatus)}>
                                {partner.activeStatus}
                              </span>
                            </TableCell>
                            <TableCell>{partner.contactPerson}</TableCell>
                            <TableCell className="font-semibold">{partner.referralCount}</TableCell>
                            <TableCell>
                              <span className={partner.conversionRate > 50 ? "text-green-600" : "text-amber-600"}>
                                {partner.conversionRate}%
                              </span>
                            </TableCell>
                            <TableCell>{partner.lastContactDate}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-24 text-center text-neutral-500">
                      <Share2 className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                      <h3 className="text-lg font-medium">No referral partners found</h3>
                      <p className="max-w-sm mx-auto mt-2 mb-6">
                        Add your first referral partner to start tracking where your clients are coming from
                      </p>
                      <Button onClick={() => setIsAddPartnerOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Partner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Metrics Tab */}
            <TabsContent value="metrics">
              <div className="grid grid-cols-12 gap-6">
                {/* Performance Metrics */}
                <div className="col-span-full">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Referral Source Performance</CardTitle>
                      <CardDescription>
                        Comparative metrics across different referral sources
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Source</TableHead>
                            <TableHead>Referrals</TableHead>
                            <TableHead>% of Total</TableHead>
                            <TableHead>Avg. Conversion</TableHead>
                            <TableHead>Cost Per Acquisition</TableHead>
                            <TableHead>ROI</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralSources.map((source, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{source.name}</TableCell>
                              <TableCell>{source.value}</TableCell>
                              <TableCell>{source.percentage}%</TableCell>
                              <TableCell>
                                <span className="text-green-600">
                                  {25 + Math.floor(Math.random() * 50)}%
                                </span>
                              </TableCell>
                              <TableCell>${(50 + Math.floor(Math.random() * 150)).toFixed(2)}</TableCell>
                              <TableCell>
                                <span className="text-green-600">
                                  {(2 + Math.random() * 3).toFixed(1)}x
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Actions to Improve */}
                <div className="col-span-12 md:col-span-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                          Increase Healthcare Provider Outreach
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Healthcare providers have the highest conversion rate. Focus on expanding this network.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="text-xs">Create Outreach Campaign</Button>
                          <Button variant="outline" size="sm" className="text-xs">Schedule Follow-ups</Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          Nurture Community Organization Relationships
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Community organizations show growth potential. Schedule quarterly meetings to strengthen relationships.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="text-xs">Schedule Meetings</Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-purple-600" />
                          Create Referral Incentive Program
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Implement a structured incentive program to encourage more referrals from existing partners.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="text-xs">Design Program</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Contact Tracking */}
                <div className="col-span-12 md:col-span-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Recent Contacts</CardTitle>
                      <CardDescription>
                        Most recent outreach activities with referral partners
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        {referralPartners.slice(0, 4).map((partner, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="mt-0.5">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100">
                                {partner.type === "Healthcare Provider" ? (
                                  <User className="h-5 w-5 text-blue-600" />
                                ) : partner.type === "Community Organization" ? (
                                  <Users className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Building2 className="h-5 w-5 text-neutral-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div className="font-medium">{partner.contactPerson}</div>
                                <div className="text-sm text-neutral-500">{partner.lastContactDate}</div>
                              </div>
                              <div className="text-sm text-neutral-500 mb-1">{partner.name}</div>
                              <div className="text-sm">
                                {idx === 0 
                                  ? "Follow-up call to discuss recent referrals and new services" 
                                  : idx === 1 
                                  ? "Email sent with updated brochure and referral forms" 
                                  : idx === 2 
                                  ? "In-person meeting to strengthen partnership"
                                  : "Quarterly check-in call to maintain relationship"}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="text-center mt-4">
                          <Button variant="outline" size="sm">View All Contact History</Button>
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
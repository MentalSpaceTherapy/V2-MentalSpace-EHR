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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  UserPlus,
  Users,
  Target,
  Mail,
  RefreshCw,
  Filter,
  Clock,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Temporary sample data for charts
const clientAcquisitionData = [
  { name: "Jan", newClients: 5, prospects: 12 },
  { name: "Feb", newClients: 8, prospects: 15 },
  { name: "Mar", newClients: 12, prospects: 21 },
  { name: "Apr", newClients: 10, prospects: 18 },
  { name: "May", newClients: 14, prospects: 24 },
  { name: "Jun", newClients: 18, prospects: 30 },
];

const referralSourceData = [
  { name: "Website", value: 35 },
  { name: "Healthcare Providers", value: 25 },
  { name: "Social Media", value: 20 },
  { name: "Client Referrals", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = [
  "#6366f1", // primary
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#312e81",
];

const campaignPerformanceData = [
  { name: "Week 1", emailOpen: 35, clickThrough: 28, conversion: 12 },
  { name: "Week 2", emailOpen: 40, clickThrough: 32, conversion: 15 },
  { name: "Week 3", emailOpen: 45, clickThrough: 36, conversion: 18 },
  { name: "Week 4", emailOpen: 50, clickThrough: 40, conversion: 22 },
];

export default function CRMDashboard() {
  const [activeTimeframe, setActiveTimeframe] = useState("thisMonth");

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="CRM Dashboard" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          {/* Page header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">CRM & Marketing</h1>
              <p className="text-neutral-500 mt-1">
                Track client acquisition, marketing campaigns, and engagement metrics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>This Month</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          {/* Top metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="New Leads"
              value="28"
              change={{ value: "+12.5%", positive: true }}
              icon={<UserPlus className="h-5 w-5 text-primary-500" />}
              description="From all lead channels"
            />
            <MetricCard 
              title="Conversion Rate"
              value="24.8%"
              change={{ value: "+3.2%", positive: true }}
              icon={<Target className="h-5 w-5 text-green-500" />}
              description="Leads to clients"
            />
            <MetricCard 
              title="Active Campaigns"
              value="4"
              change={{ value: "0%", positive: true }}
              icon={<Mail className="h-5 w-5 text-amber-500" />}
              description="Email and SMS"
              changeType="neutral"
            />
            <MetricCard 
              title="Client Retention"
              value="92%"
              change={{ value: "-1.3%", positive: false }}
              icon={<Users className="h-5 w-5 text-blue-500" />}
              description="Last 3 months"
            />
          </div>
          
          {/* Charts and analytics section */}
          <div className="grid grid-cols-12 gap-6">
            {/* Client Acquisition Chart */}
            <Card className="col-span-8">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Client Acquisition Pipeline</CardTitle>
                    <CardDescription>New leads, prospects, and clients over time</CardDescription>
                  </div>
                  <Tabs defaultValue="prospects" className="w-[300px]">
                    <TabsList className="grid grid-cols-3 h-8">
                      <TabsTrigger value="prospects" className="text-xs">Prospects</TabsTrigger>
                      <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
                      <TabsTrigger value="conversions" className="text-xs">Conversions</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={clientAcquisitionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="prospects" fill="#c7d2fe" name="Prospects" />
                      <Bar dataKey="newClients" fill="#6366f1" name="New Clients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Referral Sources */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Referral Sources</CardTitle>
                <CardDescription>Where your clients come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={400} height={250}>
                      <Pie
                        data={referralSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {referralSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <span className="text-sm text-neutral-500">Top source:</span>
                <span className="text-sm font-medium">Website (35%)</span>
              </CardFooter>
            </Card>
            
            {/* Campaign Performance */}
            <Card className="col-span-6">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Email open, click-through, and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      width={500}
                      height={250}
                      data={campaignPerformanceData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="emailOpen" stroke="#c7d2fe" name="Open Rate" strokeWidth={2} />
                      <Line type="monotone" dataKey="clickThrough" stroke="#818cf8" name="Click Rate" strokeWidth={2} />
                      <Line type="monotone" dataKey="conversion" stroke="#4f46e5" name="Conversion" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Active Campaigns */}
            <Card className="col-span-6">
              <CardHeader>
                <CardTitle>Active Marketing Campaigns</CardTitle>
                <CardDescription>Current email, SMS, and social media campaigns</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3">
                  {[
                    {
                      name: "Summer Wellness Newsletter",
                      type: "Email",
                      status: "Running",
                      performance: "45% open rate",
                      icon: Mail,
                      color: "text-blue-500",
                    },
                    {
                      name: "New Client Welcome Series",
                      type: "Email + SMS",
                      status: "Running",
                      performance: "92% open rate",
                      icon: UserPlus,
                      color: "text-green-500",
                    },
                    {
                      name: "Anxiety Workshop Promotion",
                      type: "Email",
                      status: "Running",
                      performance: "38% open rate",
                      icon: Clock,
                      color: "text-purple-500",
                    },
                    {
                      name: "Client Re-engagement",
                      type: "SMS",
                      status: "Running",
                      performance: "23% response rate",
                      icon: RefreshCw,
                      color: "text-amber-500",
                    },
                  ].map((campaign, i) => {
                    const CampaignIcon = campaign.icon;
                    return (
                      <div key={i} className="flex items-center py-3 px-6 hover:bg-neutral-50">
                        <div className={cn("p-2 rounded-full", campaign.color === "text-blue-500" ? "bg-blue-50" : campaign.color === "text-green-500" ? "bg-green-50" : campaign.color === "text-purple-500" ? "bg-purple-50" : "bg-amber-50")}>
                          <CampaignIcon className={cn("h-4 w-4", campaign.color)} />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-neutral-500">{campaign.type}</span>
                            <span className="inline-block mx-2 w-1 h-1 rounded-full bg-neutral-300"></span>
                            <span className="text-xs text-green-600">{campaign.status}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{campaign.performance}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 px-6">
                <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                  View All Campaigns
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
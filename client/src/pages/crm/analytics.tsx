import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Clock, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCRM } from "@/hooks/use-crm";

// Chart colors
const COLORS = [
  "#6366f1", // primary indigo
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#312e81",
];

export default function CRMAnalytics() {
  // Get data from CRM context
  const { 
    campaigns, 
    leads, 
    conversionRate, 
    selectedTimeRange, 
    setSelectedTimeRange,
    referralSources 
  } = useCRM();
  
  // Time range options
  const timeRangeOptions = {
    "week": "This Week",
    "month": "This Month",
    "quarter": "This Quarter",
    "year": "This Year"
  };

  // Sample campaign performance data (we'd replace this with actual analytics data)
  const campaignPerformanceData = [
    { name: "Week 1", emailOpen: 35, clickThrough: 28, conversion: 12 },
    { name: "Week 2", emailOpen: 40, clickThrough: 32, conversion: 15 },
    { name: "Week 3", emailOpen: 45, clickThrough: 36, conversion: 18 },
    { name: "Week 4", emailOpen: 50, clickThrough: 40, conversion: 22 },
  ];

  // Calculate cumulative campaign stats
  const campaignStats = {
    totalSent: campaigns.reduce((acc, campaign) => acc + campaign.stats.sent, 0),
    totalOpened: campaigns.reduce((acc, campaign) => acc + campaign.stats.opened, 0),
    totalClicked: campaigns.reduce((acc, campaign) => acc + campaign.stats.clicked, 0),
    totalConverted: campaigns.reduce((acc, campaign) => acc + campaign.stats.converted, 0),
  };

  // Calculate rates
  const openRate = campaignStats.totalSent > 0 
    ? Math.round((campaignStats.totalOpened / campaignStats.totalSent) * 100) 
    : 0;
    
  const clickRate = campaignStats.totalOpened > 0 
    ? Math.round((campaignStats.totalClicked / campaignStats.totalOpened) * 100) 
    : 0;
    
  const conversionRateFromClicks = campaignStats.totalClicked > 0 
    ? Math.round((campaignStats.totalConverted / campaignStats.totalClicked) * 100) 
    : 0;

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Marketing Analytics" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Marketing Analytics</h1>
              <p className="text-neutral-500 mt-1">
                Analyze marketing performance and client acquisition metrics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
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
          
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-12 gap-6">
            {/* Campaign Performance Metrics */}
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Campaign Performance Overview</CardTitle>
                <CardDescription>Key metrics across all marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-neutral-500 text-sm mb-1">Total Sent</div>
                    <div className="text-2xl font-bold">{campaignStats.totalSent.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400 mt-1">Across all campaigns</div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-neutral-500 text-sm mb-1">Open Rate</div>
                    <div className="text-2xl font-bold">{openRate}%</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {campaignStats.totalOpened.toLocaleString()} opens
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-neutral-500 text-sm mb-1">Click Rate</div>
                    <div className="text-2xl font-bold">{clickRate}%</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {campaignStats.totalClicked.toLocaleString()} clicks
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-neutral-500 text-sm mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold">{conversionRateFromClicks}%</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {campaignStats.totalConverted.toLocaleString()} conversions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Over Time */}
            <Card className="col-span-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Campaign Performance Over Time</CardTitle>
                    <CardDescription>Open, click, and conversion rates</CardDescription>
                  </div>
                  <Tabs defaultValue="open" className="w-[300px]">
                    <TabsList className="grid grid-cols-3 h-8">
                      <TabsTrigger value="open" className="text-xs">Opens</TabsTrigger>
                      <TabsTrigger value="click" className="text-xs">Clicks</TabsTrigger>
                      <TabsTrigger value="conversion" className="text-xs">Conversions</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={campaignPerformanceData}
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
                      <Line type="monotone" dataKey="emailOpen" stroke="#c7d2fe" name="Open Rate" strokeWidth={2} />
                      <Line type="monotone" dataKey="clickThrough" stroke="#818cf8" name="Click Rate" strokeWidth={2} />
                      <Line type="monotone" dataKey="conversion" stroke="#4f46e5" name="Conversion" strokeWidth={2} />
                    </LineChart>
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
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referralSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: string, percent: number }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {referralSources.map((entry, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Campaign Comparison */}
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Campaign Comparison</CardTitle>
                <CardDescription>Performance metrics by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaigns.slice(0, 5)} // Show only the first 5 campaigns
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        name="Open Rate" 
                        dataKey={(entry) => (entry.stats.opened / (entry.stats.sent || 1)) * 100} 
                        fill="#c7d2fe" 
                      />
                      <Bar 
                        name="Click Rate" 
                        dataKey={(entry) => (entry.stats.clicked / (entry.stats.opened || 1)) * 100} 
                        fill="#818cf8" 
                      />
                      <Bar 
                        name="Conversion" 
                        dataKey={(entry) => (entry.stats.converted / (entry.stats.clicked || 1)) * 100} 
                        fill="#4f46e5" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
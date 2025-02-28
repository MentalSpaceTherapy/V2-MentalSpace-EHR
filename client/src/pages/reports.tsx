import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, Calendar, BarChart2, LineChart, PieChart, Users, FileText, CalendarCheck, UserX, Percent } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { addMonths, format, subMonths } from "date-fns";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Mock data for reports
const clinicalMetrics = {
  totalClients: 64,
  activeClients: 48,
  inactiveClients: 16,
  newClientsThisMonth: 5,
  clientRetentionRate: 87,
  avgSessionsPerClient: 6.2,
  diagnosisDistribution: [
    { name: "Anxiety Disorders", value: 35 },
    { name: "Depressive Disorders", value: 28 },
    { name: "Trauma-Related Disorders", value: 15 },
    { name: "Bipolar Disorders", value: 8 },
    { name: "Substance Use Disorders", value: 7 },
    { name: "Others", value: 7 }
  ]
};

const operationalMetrics = {
  noShowRate: 8,
  cancellationRate: 12,
  documentationComplianceRate: 92,
  avgSessionsPerDay: 7.8,
  mostCommonSessionTypes: [
    { name: "Individual Therapy", value: 65 },
    { name: "Family Therapy", value: 15 },
    { name: "CBT Session", value: 10 },
    { name: "Group Therapy", value: 5 },
    { name: "Other", value: 5 }
  ]
};

const financialMetrics = {
  monthlyRevenue: 10250.00,
  revenueGrowth: 15,
  averageRevenuePerClient: 213.54,
  topServicesByRevenue: [
    { name: "Individual Therapy", value: 6500 },
    { name: "Family Therapy", value: 1850 },
    { name: "CBT Sessions", value: 950 },
    { name: "Assessments", value: 650 },
    { name: "Group Therapy", value: 300 }
  ]
};

// Client acquisition data by month
const clientAcquisitionData = [
  { month: 'Jan', newClients: 4, completedTreatment: 2 },
  { month: 'Feb', newClients: 3, completedTreatment: 1 },
  { month: 'Mar', newClients: 5, completedTreatment: 2 },
  { month: 'Apr', newClients: 7, completedTreatment: 3 },
  { month: 'May', newClients: 6, completedTreatment: 4 },
  { month: 'Jun', newClients: 4, completedTreatment: 2 },
  { month: 'Jul', newClients: 5, completedTreatment: 3 },
  { month: 'Aug', newClients: 8, completedTreatment: 4 },
  { month: 'Sep', newClients: 9, completedTreatment: 3 },
  { month: 'Oct', newClients: 6, completedTreatment: 5 },
  { month: 'Nov', newClients: 5, completedTreatment: 3 },
  { month: 'Dec', newClients: 4, completedTreatment: 2 }
];

// Monthly revenue data
const monthlyRevenueData = [
  { month: 'Jan', revenue: 8200 },
  { month: 'Feb', revenue: 7800 },
  { month: 'Mar', revenue: 8500 },
  { month: 'Apr', revenue: 9200 },
  { month: 'May', revenue: 8800 },
  { month: 'Jun', revenue: 9100 },
  { month: 'Jul', revenue: 9400 },
  { month: 'Aug', revenue: 9700 },
  { month: 'Sep', revenue: 10100 },
  { month: 'Oct', revenue: 10250 },
  { month: 'Nov', revenue: 0 }, // Future month
  { month: 'Dec', revenue: 0 }  // Future month
];

// No-show and cancellation rates by month
const attendanceData = [
  { month: 'Jan', noShow: 10, cancellation: 15 },
  { month: 'Feb', noShow: 8, cancellation: 12 },
  { month: 'Mar', noShow: 7, cancellation: 14 },
  { month: 'Apr', noShow: 9, cancellation: 11 },
  { month: 'May', noShow: 6, cancellation: 10 },
  { month: 'Jun', noShow: 5, cancellation: 13 },
  { month: 'Jul', noShow: 7, cancellation: 14 },
  { month: 'Aug', noShow: 8, cancellation: 12 },
  { month: 'Sep', noShow: 9, cancellation: 11 },
  { month: 'Oct', noShow: 8, cancellation: 12 }
];

// Colors for pie charts
const COLORS = ['#4db6bc', '#2c7a7b', '#4fd1c5', '#32a39a', '#9cdbd8', '#d1edec'];

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("last-month");
  const [reportPeriod, setReportPeriod] = useState("monthly");
  
  const currentDate = new Date();
  const displayDateRange = {
    "last-month": `${format(subMonths(currentDate, 1), "MMMM yyyy")}`,
    "current-month": `${format(currentDate, "MMMM yyyy")}`,
    "last-quarter": `${format(subMonths(currentDate, 3), "MMMM yyyy")} - ${format(currentDate, "MMMM yyyy")}`,
    "year-to-date": `${format(new Date(currentDate.getFullYear(), 0, 1), "MMMM yyyy")} - ${format(currentDate, "MMMM yyyy")}`,
  }[dateRange];

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Download Report",
      description: `Downloading ${reportType} report for ${displayDateRange}...`,
    });
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Reports & Analytics" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-800">Practice Analytics</h1>
              <p className="text-neutral-500">Data for: {displayDateRange}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Date Range" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="year-to-date">Year to Date</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => handleDownloadReport("Full Analytics")}>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Active Clients */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Active Clients</p>
                    <p className="text-2xl font-bold mt-1">{clinicalMetrics.activeClients}</p>
                    <div className="flex items-center mt-1">
                      <Users className="text-primary-500 h-4 w-4 mr-1" />
                      <span className="text-sm text-primary-500">
                        {clinicalMetrics.newClientsThisMonth} new this month
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Retention */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Client Retention</p>
                    <p className="text-2xl font-bold mt-1">{clinicalMetrics.clientRetentionRate}%</p>
                    <div className="flex items-center mt-1">
                      <Percent className="text-success-500 h-4 w-4 mr-1" />
                      <span className="text-sm text-success-500">
                        5% higher than industry average
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-success-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* No-Show Rate */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">No-Show Rate</p>
                    <p className="text-2xl font-bold mt-1">{operationalMetrics.noShowRate}%</p>
                    <div className="flex items-center mt-1">
                      <UserX className="text-error-500 h-4 w-4 mr-1" />
                      <span className="text-sm text-error-500">
                        {operationalMetrics.cancellationRate}% cancellation rate
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-error-100 flex items-center justify-center">
                    <UserX className="h-5 w-5 text-error-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="clinical" className="mb-6">
            <TabsList>
              <TabsTrigger value="clinical" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Clinical
              </TabsTrigger>
              <TabsTrigger value="operational" className="flex items-center">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Operational
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Financial
              </TabsTrigger>
            </TabsList>

            {/* Clinical Reports */}
            <TabsContent value="clinical" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Acquisition & Discharge */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client Acquisition & Discharge</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={clientAcquisitionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newClients" name="New Clients" fill="#4db6bc" />
                        <Bar dataKey="completedTreatment" name="Completed Treatment" fill="#d1edec" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Diagnosis Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Diagnosis Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={clinicalMetrics.diagnosisDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {clinicalMetrics.diagnosisDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Client Demographics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Client Demographics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Age Distribution */}
                      <div>
                        <h3 className="font-medium mb-3">Age Distribution</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Under 18</span>
                              <span className="text-sm">15%</span>
                            </div>
                            <Progress value={15} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">18-24</span>
                              <span className="text-sm">22%</span>
                            </div>
                            <Progress value={22} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">25-34</span>
                              <span className="text-sm">31%</span>
                            </div>
                            <Progress value={31} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">35-44</span>
                              <span className="text-sm">18%</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">45+</span>
                              <span className="text-sm">14%</span>
                            </div>
                            <Progress value={14} className="h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Gender Distribution */}
                      <div>
                        <h3 className="font-medium mb-3">Gender Distribution</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Female</span>
                              <span className="text-sm">58%</span>
                            </div>
                            <Progress value={58} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Male</span>
                              <span className="text-sm">39%</span>
                            </div>
                            <Progress value={39} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Non-binary</span>
                              <span className="text-sm">3%</span>
                            </div>
                            <Progress value={3} className="h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Referral Source */}
                      <div>
                        <h3 className="font-medium mb-3">Referral Source</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Insurance Provider</span>
                              <span className="text-sm">28%</span>
                            </div>
                            <Progress value={28} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Physician</span>
                              <span className="text-sm">24%</span>
                            </div>
                            <Progress value={24} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Previous Client</span>
                              <span className="text-sm">21%</span>
                            </div>
                            <Progress value={21} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Self-Referral</span>
                              <span className="text-sm">18%</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Other</span>
                              <span className="text-sm">9%</span>
                            </div>
                            <Progress value={9} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Operational Reports */}
            <TabsContent value="operational" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* No-Show & Cancellation Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">No-Show & Cancellation Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={attendanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Line type="monotone" dataKey="noShow" name="No-Show Rate" stroke="#e53e3e" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="cancellation" name="Cancellation Rate" stroke="#dd6b20" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Session Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={operationalMetrics.mostCommonSessionTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {operationalMetrics.mostCommonSessionTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Documentation Compliance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documentation Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center my-4">
                      <div className="relative w-48 h-48 flex items-center justify-center rounded-full">
                        <div className="absolute inset-0">
                          <div
                            className="h-full w-full rounded-full"
                            style={{
                              background: `conic-gradient(#4fd1c5 ${operationalMetrics.documentationComplianceRate}%, #e2e8f0 0)`
                            }}
                          />
                          <div className="absolute inset-4 bg-white rounded-full" />
                        </div>
                        <div className="relative text-4xl font-bold">
                          {operationalMetrics.documentationComplianceRate}%
                        </div>
                      </div>
                      <p className="mt-4 text-neutral-500">Notes completed within 48 hours</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-lg font-semibold">85%</p>
                        <p className="text-sm text-neutral-500">Same-Day Completion</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">7%</p>
                        <p className="text-sm text-neutral-500">24-48 Hour Completion</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">8%</p>
                        <p className="text-sm text-neutral-500">Overdue Notes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <p className="text-3xl font-bold">{operationalMetrics.avgSessionsPerDay.toFixed(1)}</p>
                        <p className="text-sm text-neutral-500">Avg. Sessions Per Day</p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <p className="text-3xl font-bold">{clinicalMetrics.avgSessionsPerClient.toFixed(1)}</p>
                        <p className="text-sm text-neutral-500">Avg. Sessions Per Client</p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <p className="text-3xl font-bold">85%</p>
                        <p className="text-sm text-neutral-500">Telehealth Sessions</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Busiest Days of Week</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Monday</span>
                            <span className="text-sm">22%</span>
                          </div>
                          <Progress value={22} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Tuesday</span>
                            <span className="text-sm">24%</span>
                          </div>
                          <Progress value={24} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Wednesday</span>
                            <span className="text-sm">28%</span>
                          </div>
                          <Progress value={28} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Thursday</span>
                            <span className="text-sm">18%</span>
                          </div>
                          <Progress value={18} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Friday</span>
                            <span className="text-sm">8%</span>
                          </div>
                          <Progress value={8} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financial Reports */}
            <TabsContent value="financial" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyRevenueData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Monthly Revenue" fill="#4db6bc" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Revenue by Service Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={financialMetrics.topServicesByRevenue}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: $${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {financialMetrics.topServicesByRevenue.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Financial Overview */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                        <p className="text-sm text-neutral-500">Monthly Revenue</p>
                        <p className="text-3xl font-bold mt-2">${financialMetrics.monthlyRevenue.toFixed(2)}</p>
                        <p className="text-sm text-success-500 mt-1">↑ {financialMetrics.revenueGrowth}% from last month</p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                        <p className="text-sm text-neutral-500">Avg. Revenue Per Client</p>
                        <p className="text-3xl font-bold mt-2">${financialMetrics.averageRevenuePerClient.toFixed(2)}</p>
                        <p className="text-sm text-success-500 mt-1">↑ 5% from last month</p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                        <p className="text-sm text-neutral-500">Collection Rate</p>
                        <p className="text-3xl font-bold mt-2">92%</p>
                        <p className="text-sm text-success-500 mt-1">↑ 3% from last month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-3">Revenue by Insurance</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Blue Cross Blue Shield</span>
                              <span className="text-sm">$3,250</span>
                            </div>
                            <Progress value={32} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Aetna</span>
                              <span className="text-sm">$2,100</span>
                            </div>
                            <Progress value={21} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">UnitedHealthcare</span>
                              <span className="text-sm">$1,800</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Self-Pay</span>
                              <span className="text-sm">$1,500</span>
                            </div>
                            <Progress value={15} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Other Insurance</span>
                              <span className="text-sm">$1,350</span>
                            </div>
                            <Progress value={14} className="h-2" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-3">Outstanding by Age</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Current</span>
                              <span className="text-sm">$850</span>
                            </div>
                            <Progress value={35} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">1-30 Days</span>
                              <span className="text-sm">$650</span>
                            </div>
                            <Progress value={27} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">31-60 Days</span>
                              <span className="text-sm">$450</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">61-90 Days</span>
                              <span className="text-sm">$300</span>
                            </div>
                            <Progress value={12} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">90+ Days</span>
                              <span className="text-sm">$200</span>
                            </div>
                            <Progress value={8} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => handleDownloadReport("Clinical Performance")}
                >
                  <FileText className="h-8 w-8 mb-2 text-primary-500" />
                  <span className="font-medium">Clinical Performance</span>
                  <span className="text-sm text-neutral-500 mt-1">Client outcomes and retention</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => handleDownloadReport("Operational Efficiency")}
                >
                  <CalendarCheck className="h-8 w-8 mb-2 text-primary-500" />
                  <span className="font-medium">Operational Efficiency</span>
                  <span className="text-sm text-neutral-500 mt-1">Scheduling and documentation</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => handleDownloadReport("Financial Summary")}
                >
                  <BarChart2 className="h-8 w-8 mb-2 text-primary-500" />
                  <span className="font-medium">Financial Summary</span>
                  <span className="text-sm text-neutral-500 mt-1">Revenue and claims analysis</span>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <p className="text-sm text-neutral-500">
                Need a custom report? Contact your administrator to generate specialized reports for your practice needs.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

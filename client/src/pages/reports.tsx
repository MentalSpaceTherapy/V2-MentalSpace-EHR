import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDownToLine, 
  Calendar, 
  BarChart2, 
  LineChart, 
  PieChart, 
  Users, 
  FileText, 
  CalendarCheck, 
  UserX, 
  Percent, 
  TrendingUp, 
  Clock, 
  Activity, 
  Award, 
  Briefcase, 
  BriefcaseMedical,
  Compass, 
  Database, 
  DollarSign, 
  FileSpreadsheet, 
  Heart, 
  Megaphone, 
  Map, 
  MessageSquare, 
  NetworkIcon, 
  StarIcon, 
  Target, 
  ThumbsUp, 
  TrendingDown, 
  UserIcon, 
  UserCheck, 
  UserPlus
} from "lucide-react";
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
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
  Scatter,
  ScatterChart,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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

// Marketing analytics data
const marketingMetrics = {
  referralSources: [
    { name: "Physician Referrals", value: 28 },
    { name: "Insurance Directory", value: 22 },
    { name: "Online Search", value: 18 },
    { name: "Client Referrals", value: 15 },
    { name: "Social Media", value: 12 },
    { name: "Other", value: 5 }
  ],
  websiteTraffic: [
    { month: 'Jan', visitors: 520, conversions: 22 },
    { month: 'Feb', visitors: 480, conversions: 18 },
    { month: 'Mar', visitors: 590, conversions: 25 },
    { month: 'Apr', visitors: 650, conversions: 32 },
    { month: 'May', visitors: 720, conversions: 38 },
    { month: 'Jun', visitors: 690, conversions: 35 },
    { month: 'Jul', visitors: 710, conversions: 36 },
    { month: 'Aug', visitors: 740, conversions: 42 },
    { month: 'Sep', visitors: 790, conversions: 48 },
    { month: 'Oct', visitors: 810, conversions: 50 }
  ],
  servicePopularity: [
    { service: "Individual Therapy", inquiries: 65, conversions: 48 },
    { service: "Family Therapy", inquiries: 42, conversions: 28 },
    { service: "Group Therapy", inquiries: 30, conversions: 18 },
    { service: "Online Counseling", inquiries: 38, conversions: 32 },
    { service: "Psychological Testing", inquiries: 25, conversions: 15 }
  ]
};

// Outcomes and quality data
const outcomesMetrics = {
  clientOutcomes: [
    { outcome: "Significant Improvement", percentage: 42 },
    { outcome: "Moderate Improvement", percentage: 31 },
    { outcome: "Slight Improvement", percentage: 18 },
    { outcome: "No Change", percentage: 7 },
    { outcome: "Deterioration", percentage: 2 }
  ],
  satisfactionScores: [
    { category: "Quality of Care", score: 4.7 },
    { category: "Clinician Empathy", score: 4.8 },
    { category: "Appointment Availability", score: 4.3 },
    { category: "Administrative Support", score: 4.5 },
    { category: "Telehealth Experience", score: 4.4 },
    { category: "Facility Comfort", score: 4.6 }
  ],
  treatmentEffectiveness: [
    { diagnosis: "Anxiety Disorders", baselineScore: 7.8, currentScore: 4.2, sessions: 8 },
    { diagnosis: "Depressive Disorders", baselineScore: 8.2, currentScore: 3.8, sessions: 10 },
    { diagnosis: "PTSD", baselineScore: 8.5, currentScore: 5.1, sessions: 12 },
    { diagnosis: "Adjustment Disorders", baselineScore: 6.9, currentScore: 3.5, sessions: 6 },
    { diagnosis: "Bipolar Disorders", baselineScore: 7.6, currentScore: 4.8, sessions: 14 }
  ]
};

// Performance data
const performanceMetrics = {
  clinicianProductivity: [
    { name: "Dr. Johnson", sessionsPerWeek: 28, documentation: 95, clientSatisfaction: 4.8 },
    { name: "Dr. Williams", sessionsPerWeek: 24, documentation: 97, clientSatisfaction: 4.9 },
    { name: "Dr. Smith", sessionsPerWeek: 30, documentation: 88, clientSatisfaction: 4.6 },
    { name: "Dr. Garcia", sessionsPerWeek: 22, documentation: 98, clientSatisfaction: 4.7 },
    { name: "Dr. Chen", sessionsPerWeek: 26, documentation: 92, clientSatisfaction: 4.8 }
  ],
  documentationTiming: [
    { clinician: "All Clinicians", sameDay: 65, nextDay: 25, twoPlus: 10 }
  ],
  treatmentPlanCompliance: [
    { month: 'Jan', compliance: 88 },
    { month: 'Feb', compliance: 90 },
    { month: 'Mar', compliance: 92 },
    { month: 'Apr', compliance: 91 },
    { month: 'May', compliance: 93 },
    { month: 'Jun', compliance: 95 },
    { month: 'Jul', compliance: 94 },
    { month: 'Aug', compliance: 96 },
    { month: 'Sep', compliance: 97 },
    { month: 'Oct', compliance: 98 }
  ]
};

// Growth and strategic metrics
const growthMetrics = {
  capacityUtilization: [
    { month: 'Jan', utilized: 72, available: 100 },
    { month: 'Feb', utilized: 76, available: 100 },
    { month: 'Mar', utilized: 78, available: 100 },
    { month: 'Apr', utilized: 80, available: 100 },
    { month: 'May', utilized: 82, available: 100 },
    { month: 'Jun', utilized: 84, available: 100 },
    { month: 'Jul', utilized: 85, available: 100 },
    { month: 'Aug', utilized: 88, available: 100 },
    { month: 'Sep', utilized: 90, available: 100 },
    { month: 'Oct', utilized: 92, available: 100 }
  ],
  growthOpportunities: [
    { service: "Telehealth Services", potentialRevenue: 28000, implementationCost: 5000, timeToImplement: "1-2 months" },
    { service: "Group Therapy Expansion", potentialRevenue: 35000, implementationCost: 8000, timeToImplement: "2-3 months" },
    { service: "Assessment Services", potentialRevenue: 42000, implementationCost: 12000, timeToImplement: "3-4 months" },
    { service: "Specialized Treatment Programs", potentialRevenue: 55000, implementationCost: 15000, timeToImplement: "4-6 months" }
  ],
  waitlistAnalysis: {
    totalWaitlist: 28,
    averageWaitTime: 12, // days
    servicesDemanded: [
      { service: "Individual Therapy", count: 15 },
      { service: "Specialized Trauma Treatment", count: 7 },
      { service: "Family Therapy", count: 4 },
      { service: "Psychological Testing", count: 2 }
    ]
  }
};

// Compliance data
const complianceMetrics = {
  documentationCompleteness: 92,
  hipaaCompliance: 98,
  auditReadiness: 95,
  requiredTrainingCompletion: 94,
  supervisionCompliance: 97
};

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
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="clinical" className="flex items-center">
                <BriefcaseMedical className="h-4 w-4 mr-2" />
                Clinical Outcomes
              </TabsTrigger>
              <TabsTrigger value="operational" className="flex items-center">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Operational
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="marketing" className="flex items-center">
                <Megaphone className="h-4 w-4 mr-2" />
                Marketing
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="outcomes" className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Quality & Outcomes
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center">
                <FileCheck className="h-4 w-4 mr-2" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="growth" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Growth Opportunities
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

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Settings,
  FileBarChart,
  FileSpreadsheet,
  FileClock,
  Receipt,
  CreditCard,
  Ban,
  RefreshCw,
  FileCheck,
  FileSearch,
  FilePlus,
  Calendar,
  BarChart,
  PieChart
} from "lucide-react";
import { format, subDays } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Mock insurance payers
const insurancePayers = [
  "Blue Cross Blue Shield",
  "Aetna",
  "UnitedHealthcare",
  "Cigna",
  "Medicare",
  "Medicaid",
  "Optum",
  "Humana",
  "Self-Pay"
];

// Mock invoices data
const mockInvoices = [
  {
    id: "INV-2023-078",
    clientName: "Emma Wilson",
    date: subDays(new Date(), 2),
    dueDate: subDays(new Date(), -12),
    amount: 125.00,
    status: "Paid",
    insurancePayer: "Blue Cross Blue Shield",
    paymentMethod: "Insurance",
    serviceType: "Individual Therapy (50 min)"
  },
  {
    id: "INV-2023-079",
    clientName: "Michael Chen",
    date: subDays(new Date(), 3),
    dueDate: subDays(new Date(), -11),
    amount: 125.00,
    status: "Pending",
    insurancePayer: "Aetna",
    paymentMethod: "Insurance",
    serviceType: "CBT Session (50 min)"
  },
  {
    id: "INV-2023-080",
    clientName: "Sophie Garcia",
    date: subDays(new Date(), 5),
    dueDate: subDays(new Date(), -9),
    amount: 175.00,
    status: "Overdue",
    insurancePayer: "UnitedHealthcare",
    paymentMethod: "Insurance",
    serviceType: "Family Therapy (80 min)"
  },
  {
    id: "INV-2023-081",
    clientName: "David Thompson",
    date: subDays(new Date(), 7),
    dueDate: subDays(new Date(), -7),
    amount: 75.00,
    status: "Paid",
    insurancePayer: "Self-Pay",
    paymentMethod: "Credit Card",
    serviceType: "Individual Therapy (50 min)"
  },
  {
    id: "INV-2023-082",
    clientName: "Jamie Rodriguez",
    date: subDays(new Date(), 10),
    dueDate: subDays(new Date(), -4),
    amount: 150.00,
    status: "Denied",
    insurancePayer: "Cigna",
    paymentMethod: "Insurance",
    serviceType: "Intake Assessment (75 min)"
  },
  {
    id: "INV-2023-083",
    clientName: "Alex Johnson",
    date: subDays(new Date(), 1),
    dueDate: subDays(new Date(), -13),
    amount: 125.00,
    status: "Pending",
    insurancePayer: "Medicare",
    paymentMethod: "Insurance",
    serviceType: "Individual Therapy (50 min)"
  }
];

// Mock billing metrics
const billingMetrics = {
  totalOutstanding: 450.00,
  totalCollected: 2375.00,
  averageDaysToPayment: 14,
  claimDenialRate: 8,
  revenueByService: [
    { service: "Individual Therapy", revenue: 1875.00, percentage: 45 },
    { service: "Family Therapy", revenue: 700.00, percentage: 17 },
    { service: "CBT Sessions", revenue: 625.00, percentage: 15 },
    { service: "Intake Assessments", revenue: 525.00, percentage: 13 },
    { service: "Group Therapy", revenue: 425.00, percentage: 10 }
  ],
  revenueByPayer: [
    { payer: "Blue Cross Blue Shield", revenue: 875.00, percentage: 21 },
    { payer: "Aetna", revenue: 750.00, percentage: 18 },
    { payer: "UnitedHealthcare", revenue: 625.00, percentage: 15 },
    { payer: "Cigna", revenue: 425.00, percentage: 10 },
    { payer: "Medicare", revenue: 375.00, percentage: 9 },
    { payer: "Self-Pay", revenue: 750.00, percentage: 18 },
    { payer: "Other", revenue: 375.00, percentage: 9 }
  ]
};

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoices, setInvoices] = useState(mockInvoices);

  // Filter invoices based on search query and status filter
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.insurancePayer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      invoice.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Overdue":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Denied":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Create Invoice",
      description: "Opening new invoice form...",
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast({
      title: "View Invoice",
      description: `Opening invoice ${invoiceId} details...`,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download Invoice",
      description: `Downloading invoice ${invoiceId} as PDF...`,
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
        <TopBar title="Billing & Insurance" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          {/* Billing Categories */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Patient Accounting */}
                <div>
                  <h3 className="font-semibold text-gray-600 mb-3">Patient Accounting</h3>
                  <div className="space-y-2">
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <Receipt className="h-4 w-4 mr-2" />
                      Enter Patient Payment
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Enter Misc Charge
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <Ban className="h-4 w-4 mr-2" />
                      Enter Refund
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Enter Misc Credit
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Create Statement
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileText className="h-4 w-4 mr-2" />
                      Pt Aging & Batch Statements
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pt Credit Cards
                    </Button>
                  </div>
                </div>

                {/* Insurance Claims */}
                <div>
                  <h3 className="font-semibold text-gray-600 mb-3">Insurance Claims</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Button variant="link" className="justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                        <FileSearch className="h-4 w-4 mr-2" />
                        Eligibility History
                      </Button>
                      <Badge className="ml-2 bg-blue-500 rounded-full text-xs">948</Badge>
                    </div>
                    <div className="flex items-center">
                      <Button variant="link" className="justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                        <FilePlus className="h-4 w-4 mr-2" />
                        Submit Primary Claims
                      </Button>
                      <Badge className="ml-2 bg-blue-500 rounded-full text-xs">20</Badge>
                    </div>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FilePlus className="h-4 w-4 mr-2" />
                      Submit Secondary Claims
                    </Button>
                    <div className="flex items-center">
                      <Button variant="link" className="justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                        <Calendar className="h-4 w-4 mr-2" />
                        Mark External Claims
                      </Button>
                      <Badge className="ml-2 bg-neutral-200 rounded-full text-xs">0</Badge>
                    </div>
                    <div className="flex items-center">
                      <Button variant="link" className="justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                        <FilePlus className="h-4 w-4 mr-2" />
                        Create CMS-1500
                      </Button>
                      <Badge className="ml-2 bg-neutral-200 rounded-full text-xs">0</Badge>
                    </div>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Create Superbill
                    </Button>
                  </div>
                </div>

                {/* Insurance Payments */}
                <div>
                  <h3 className="font-semibold text-gray-600 mb-3">Insurance Payments</h3>
                  <div className="space-y-2">
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <Receipt className="h-4 w-4 mr-2" />
                      Enter Insurance Payment
                    </Button>
                    <div className="flex items-center">
                      <Button variant="link" className="justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                        <FileText className="h-4 w-4 mr-2" />
                        Electronic Claim History
                      </Button>
                      <Badge className="ml-2 bg-neutral-200 rounded-full text-xs">9</Badge>
                    </div>
                    <div className="flex items-center">
                      <Button variant="link" className="justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                        <BarChart className="h-4 w-4 mr-2" />
                        ERA
                      </Button>
                      <Badge className="ml-2 bg-neutral-200 rounded-full text-xs">0</Badge>
                    </div>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileClock className="h-4 w-4 mr-2" />
                      Insurance Aging Report
                    </Button>
                  </div>
                </div>

                {/* More Reports */}
                <div>
                  <h3 className="font-semibold text-gray-600 mb-3">More Reports</h3>
                  <div className="space-y-2">
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileBarChart className="h-4 w-4 mr-2" />
                      Revenue Report
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Write-Off Report
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Note Count Report
                    </Button>
                    <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80 text-sm h-auto">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Prior Authorizations
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Outstanding */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Outstanding Balance</p>
                    <p className="text-2xl font-bold mt-1 text-error-500">${billingMetrics.totalOutstanding.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <AlertCircle className="text-error-500 h-4 w-4 mr-1" />
                      <span className="text-sm text-error-500">3 overdue invoices</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-error-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-error-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Collected */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Collected (This Month)</p>
                    <p className="text-2xl font-bold mt-1">${billingMetrics.totalCollected.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="text-success-500 h-4 w-4 mr-1" />
                      <span className="text-sm text-success-500">15% increase from last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-success-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Days to Payment */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Avg. Days to Payment</p>
                    <p className="text-2xl font-bold mt-1">{billingMetrics.averageDaysToPayment} days</p>
                    <div className="flex items-center mt-1">
                      <Clock className="text-primary-500 h-4 w-4 mr-1" />
                      <span className="text-sm text-primary-500">2 days faster than last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Search */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search Billing Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinician:</label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Any Clinician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Clinician</SelectItem>
                      <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                      <SelectItem value="dr-williams">Dr. Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer:</label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Any Payer or Direct from Patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Payer or Direct from Patient</SelectItem>
                      <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                      <SelectItem value="aetna">Aetna</SelectItem>
                      <SelectItem value="direct">Direct from Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="claim">Claim</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location:</label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Any Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Location</SelectItem>
                      <SelectItem value="main">Main Office</SelectItem>
                      <SelectItem value="north">North Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method:</label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Any Submission Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Submission Method</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items:</label>
                  <Select defaultValue="charges">
                    <SelectTrigger>
                      <SelectValue placeholder="Charges and Payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="charges">Charges and Payments</SelectItem>
                      <SelectItem value="charges-only">Charges Only</SelectItem>
                      <SelectItem value="payments-only">Payments Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="7days">
                      <SelectTrigger>
                        <SelectValue placeholder="Last 7 Days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-gray-500">to</span>
                    <Input type="date" className="w-36" value="2025-02-28" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
                  <Input placeholder="Check Number or Transaction ID" />
                </div>
              </div>
              
              <div className="flex justify-start mt-4">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search Billing Transactions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Practice Settings Button */}
          <div className="flex justify-end mb-6">
            <Button variant="outline" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Practice Billing Settings
            </Button>
          </div>

          <Tabs defaultValue="invoices" className="mb-6">
            <TabsList>
              <TabsTrigger value="invoices" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Invoices & Payments
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Invoices</CardTitle>
                    <Button onClick={handleCreateInvoice}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input 
                        placeholder="Search invoices..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[180px]">
                          <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Insurance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.length > 0 ? (
                          filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.id}</TableCell>
                              <TableCell>{invoice.clientName}</TableCell>
                              <TableCell>{format(invoice.date, "MMM d, yyyy")}</TableCell>
                              <TableCell>{format(invoice.dueDate, "MMM d, yyyy")}</TableCell>
                              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>{invoice.insurancePayer}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusBadgeClass(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleViewInvoice(invoice.id)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center"
                                    onClick={() => handleDownloadInvoice(invoice.id)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    PDF
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4 text-neutral-500">
                              No invoices found matching the current filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Service Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {billingMetrics.revenueByService.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{item.service}</span>
                            <span className="text-sm font-medium">${item.revenue.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center">
                            <Progress value={item.percentage} className="h-2.5 flex-1" />
                            <span className="text-xs ml-2 w-10 text-neutral-500">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue by Insurance Payer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue by Insurance Payer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {billingMetrics.revenueByPayer.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{item.payer}</span>
                            <span className="text-sm font-medium">${item.revenue.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center">
                            <Progress value={item.percentage} className="h-2.5 flex-1" />
                            <span className="text-xs ml-2 w-10 text-neutral-500">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Claim Denial Rate Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Claim Denial Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-8 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-error-500">{billingMetrics.claimDenialRate}%</div>
                      <div className="text-sm text-neutral-500 mt-1">Overall Denial Rate</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-2">Current Month vs. Industry Average (8%)</div>
                      <Progress value={billingMetrics.claimDenialRate * 10} className="h-3" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Top Denial Reasons</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Missing or invalid information</span>
                        <Badge variant="outline" className="bg-neutral-100">42%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Service not covered</span>
                        <Badge variant="outline" className="bg-neutral-100">28%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Prior authorization required</span>
                        <Badge variant="outline" className="bg-neutral-100">15%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Duplicate claim</span>
                        <Badge variant="outline" className="bg-neutral-100">10%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other reasons</span>
                        <Badge variant="outline" className="bg-neutral-100">5%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <div className="w-full">
                    <div className="text-sm text-neutral-500 mb-2">Actions to improve claim acceptance:</div>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                        Verify patient eligibility before sessions
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                        Ensure all required fields are completed correctly
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                        Obtain prior authorizations when needed
                      </li>
                    </ul>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

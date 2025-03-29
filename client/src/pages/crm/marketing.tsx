import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ArrowRight, 
  FileText, 
  Globe, 
  LineChart, 
  Mail, 
  MessageCircle, 
  Share2, 
  Users, 
  Zap 
} from "lucide-react";
import { AudienceSegmentation } from "@/components/crm/marketing/AudienceSegmentation";
import { TemplateManager } from "@/components/crm/marketing/TemplateManager";
import { MarketingAutomation } from "@/components/crm/marketing/MarketingAutomation";
import { CampaignEditor } from "@/components/crm/marketing/CampaignEditor";

export default function CRMMarketing() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [campaignEditorOpen, setCampaignEditorOpen] = useState(false);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle form submission for campaign editor
  const handleSaveCampaign = (data: any) => {
    console.log("Campaign saved:", data);
    setCampaignEditorOpen(false);
    // Here we would typically add the campaign to the CRM context
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto pb-12">
        <TopBar title="Marketing & Outreach" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Marketing & Outreach</h1>
              <p className="text-neutral-500 mt-1">
                Manage your marketing content, campaigns, and client outreach
              </p>
            </div>
            
            <Button onClick={() => setCampaignEditorOpen(true)} className="gap-2">
              <span>Create Campaign</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-neutral-100 p-1">
              <TabsTrigger value="dashboard" className="text-sm gap-1.5">
                <LineChart className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-sm gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="segments" className="text-sm gap-1.5">
                <Users className="h-4 w-4" />
                <span>Audience</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="text-sm gap-1.5">
                <Zap className="h-4 w-4" />
                <span>Automation</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab Content */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Marketing Channels */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Marketing Channels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Email Marketing",
                      description: "Create and manage email campaigns to clients and prospects",
                      icon: Mail,
                      color: "bg-blue-50 text-blue-600",
                      onClick: () => setCampaignEditorOpen(true),
                    },
                    {
                      title: "SMS & Notifications",
                      description: "Send targeted text messages and app notifications",
                      icon: MessageCircle,
                      color: "bg-green-50 text-green-600",
                      onClick: () => setCampaignEditorOpen(true),
                    },
                    {
                      title: "Social Media",
                      description: "Manage content for social media platforms",
                      icon: Share2,
                      color: "bg-purple-50 text-purple-600",
                      onClick: () => setCampaignEditorOpen(true),
                    },
                    {
                      title: "Content Library",
                      description: "Organize and store marketing materials and content",
                      icon: FileText,
                      color: "bg-amber-50 text-amber-600",
                      onClick: () => setActiveTab("templates"),
                    },
                    {
                      title: "Website Content",
                      description: "Update and manage your practice website content",
                      icon: Globe,
                      color: "bg-indigo-50 text-indigo-600",
                    },
                    {
                      title: "Referral Program",
                      description: "Track and manage client referrals and partnerships",
                      icon: Users,
                      color: "bg-pink-50 text-pink-600",
                    },
                  ].map((channel, i) => {
                    const ChannelIcon = channel.icon;
                    return (
                      <Card key={i} 
                        className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
                        onClick={channel.onClick}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1.5 rounded-md ${channel.color}`}>
                              <ChannelIcon className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">{channel.title}</CardTitle>
                          </div>
                          <CardDescription>{channel.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {/* Marketing Analytics */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Marketing Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Campaigns</CardTitle>
                      <CardDescription>Currently running marketing initiatives</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">3</div>
                      <div className="flex justify-between text-sm">
                        <span>Email Newsletter</span>
                        <span className="font-medium text-green-600">62% open rate</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span>Referral Program</span>
                        <span className="font-medium text-blue-600">12 new clients</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span>Re-engagement SMS</span>
                        <span className="font-medium text-amber-600">8 responses</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        View All Campaigns
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Acquisition</CardTitle>
                      <CardDescription>New client sources this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">24</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Website Contact Form</span>
                          <span className="font-medium">8 (33%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Referral Program</span>
                          <span className="font-medium">6 (25%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Social Media</span>
                          <span className="font-medium">5 (21%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Other Sources</span>
                          <span className="font-medium">5 (21%)</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        View Acquisition Details
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Marketing ROI</CardTitle>
                      <CardDescription>Return on investment by channel</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">342%</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Email Campaigns</span>
                          <span className="font-medium text-green-600">412%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Referral Program</span>
                          <span className="font-medium text-green-600">387%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Social Media</span>
                          <span className="font-medium text-amber-600">215%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Google Ads</span>
                          <span className="font-medium text-red-600">98%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        View Full Report
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setCampaignEditorOpen(true)}
                  >
                    <Mail className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Create Email Campaign</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab("segments")}
                  >
                    <Users className="h-6 w-6 text-purple-600" />
                    <span className="font-medium">Create Client Segment</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab("automation")}
                  >
                    <Zap className="h-6 w-6 text-amber-600" />
                    <span className="font-medium">Set Up Automation</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Templates Tab Content */}
            <TabsContent value="templates">
              <TemplateManager />
            </TabsContent>
            
            {/* Audience Segments Tab Content */}
            <TabsContent value="segments">
              <AudienceSegmentation />
            </TabsContent>
            
            {/* Automation Tab Content */}
            <TabsContent value="automation">
              <MarketingAutomation />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Campaign Editor Modal */}
      <CampaignEditor 
        isOpen={campaignEditorOpen}
        onClose={() => setCampaignEditorOpen(false)}
        onSave={handleSaveCampaign}
      />
    </div>
  );
}
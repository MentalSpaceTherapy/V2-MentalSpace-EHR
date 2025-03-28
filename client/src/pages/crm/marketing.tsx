import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Send, Users, Globe, FileText, ArrowRight, Share2, MessageCircle } from "lucide-react";

export default function CRMMarketing() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto pb-12">
        <TopBar title="Marketing & Outreach" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Marketing & Outreach</h1>
              <p className="text-neutral-500 mt-1">
                Manage your marketing content, materials, and outreach strategies
              </p>
            </div>
            
            <Button className="gap-2">
              <span>Create New</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Marketing Channels */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Marketing Channels</h2>
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  title: "Email Marketing",
                  description: "Create and manage email campaigns to clients and prospects",
                  icon: Mail,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "SMS & Notifications",
                  description: "Send targeted text messages and app notifications",
                  icon: MessageCircle,
                  color: "bg-green-50 text-green-600",
                },
                {
                  title: "Social Media",
                  description: "Manage content for social media platforms",
                  icon: Share2,
                  color: "bg-purple-50 text-purple-600",
                },
                {
                  title: "Content Library",
                  description: "Organize and store marketing materials and content",
                  icon: FileText,
                  color: "bg-amber-50 text-amber-600",
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
                  <Card key={i} className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer">
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
          
          {/* Marketing Templates Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Marketing Templates</h2>
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Pre-designed templates for various email campaigns</CardDescription>
                </CardHeader>
                <CardContent className="pb-0 pt-2">
                  <div className="space-y-2">
                    {[
                      "Welcome Email Series (3)",
                      "Monthly Newsletter (5)",
                      "Event Promotion (2)",
                      "Service Announcement (4)",
                      "Seasonal Campaign (3)"
                    ].map((template, i) => (
                      <div key={i} className="py-2 px-4 bg-neutral-50 rounded-md flex justify-between items-center">
                        <span className="text-sm">{template}</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <span className="text-xs">View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                    View All Templates
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Client Segmentation */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Client Segmentation</h2>
            <Card>
              <CardHeader>
                <CardTitle>Client Groups & Tags</CardTitle>
                <CardDescription>Organize clients into groups for targeted marketing</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-3">
                  {[
                    {
                      name: "New Clients",
                      count: 12,
                      description: "Clients who joined in the last 30 days",
                    },
                    {
                      name: "Anxiety & Depression",
                      count: 28,
                      description: "Clients seeking help with anxiety or depression",
                    },
                    {
                      name: "Inactive (3+ months)",
                      count: 8,
                      description: "Clients without sessions in 3+ months",
                    },
                    {
                      name: "Telehealth Only",
                      count: 35,
                      description: "Clients who prefer telehealth sessions",
                    },
                  ].map((segment, i) => (
                    <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{segment.name}</p>
                          <p className="text-sm text-neutral-500">{segment.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium bg-neutral-100 py-1 px-2 rounded-full">
                            {segment.count} clients
                          </span>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button variant="outline" size="sm" className="text-xs h-8 px-3 mr-2">
                  Create Segment
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                  View All Segments
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
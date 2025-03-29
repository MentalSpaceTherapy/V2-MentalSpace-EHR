import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactLists } from "@/components/crm/marketing/ContactLists";
import EmailCampaigns from "@/components/crm/marketing/EmailCampaigns";
import { CRMProvider } from "@/hooks/use-crm";
import { SendGridIntegration } from "@/components/crm/marketing/SendGridIntegration";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function MarketingPage() {
  // Define breadcrumb items for navigation
  const breadcrumbItems = [
    { label: "CRM", href: "/crm" },
    { label: "Marketing", href: "/crm/marketing" }
  ];

  return (
    <CRMProvider>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage email campaigns and email marketing for your therapy practice
          </p>
        </div>
        
        <SendGridIntegration />
        
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
            <TabsTrigger value="lists">Contact Lists</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="mt-4">
            <EmailCampaigns />
          </TabsContent>
          <TabsContent value="lists" className="mt-4">
            <ContactLists />
          </TabsContent>
        </Tabs>
      </div>
    </CRMProvider>
  );
}
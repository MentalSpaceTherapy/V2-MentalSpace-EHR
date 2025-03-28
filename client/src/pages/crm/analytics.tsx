import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function CRMAnalytics() {
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
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-3">Marketing Analytics Coming Soon</h2>
              <p className="text-neutral-500 max-w-md mx-auto">
                This section will provide detailed analytics on marketing campaigns, client acquisition costs, ROI, and audience engagement metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
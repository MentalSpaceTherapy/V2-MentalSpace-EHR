import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DocumentationTasks } from "@/components/dashboard/DocumentationTasks";
import { Notifications } from "@/components/dashboard/Notifications";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  FileText, 
  TrendingUp, 
  BrainCircuit, 
  Clock, 
  Workflow,
  Sparkles
} from "lucide-react";
import { addDays, subDays } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Mock data for the dashboard
  const sessions = [
    {
      id: 1,
      time: "9:30",
      clientName: "Emma Wilson",
      status: "Confirmed" as const,
      type: "Individual Therapy",
      medium: "Telehealth" as const,
      duration: "50 min"
    },
    {
      id: 2,
      time: "11:00",
      clientName: "Michael Chen",
      status: "Confirmed" as const,
      type: "CBT Session",
      medium: "In-person" as const,
      duration: "50 min"
    },
    {
      id: 3,
      time: "1:30",
      clientName: "Sophie Garcia",
      status: "Pending" as const,
      type: "Family Therapy",
      medium: "Telehealth" as const,
      duration: "80 min"
    },
    {
      id: 4,
      time: "3:15",
      clientName: "Alex Johnson",
      status: "Confirmed" as const,
      type: "Individual Therapy",
      medium: "Telehealth" as const,
      duration: "50 min"
    }
  ];

  const documentationTasks = [
    {
      id: 1,
      clientName: "David Thompson",
      sessionDate: subDays(new Date(), 1),
      dueDate: new Date(),
      type: "Progress Note",
      status: "Overdue" as const
    },
    {
      id: 2,
      clientName: "Emma Wilson",
      sessionDate: subDays(new Date(), 1),
      dueDate: new Date(),
      type: "Treatment Plan",
      status: "Due Today" as const
    },
    {
      id: 3,
      clientName: "Robert Miller",
      sessionDate: subDays(new Date(), 2),
      dueDate: addDays(new Date(), 1),
      type: "Progress Note",
      status: "In Progress" as const
    },
    {
      id: 4,
      clientName: "Maria Lopez",
      sessionDate: subDays(new Date(), 2),
      dueDate: addDays(new Date(), 1),
      type: "Assessment",
      status: "In Progress" as const
    }
  ];

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New intake form submitted",
      message: "Jamie Rodriguez has completed their intake assessment.",
      icon: "document" as const,
      timestamp: subDays(new Date(), 0.007), // 10 minutes ago
      read: false
    },
    {
      id: 2,
      title: "Session rescheduled",
      message: "Michael Chen rescheduled from 7/26 to 7/28 at 10:00 AM.",
      icon: "schedule" as const,
      timestamp: subDays(new Date(), 0.04), // 1 hour ago
      read: false
    },
    {
      id: 3,
      title: "Payment received",
      message: "Emma Wilson has paid their invoice #INV-2023-078.",
      icon: "payment" as const,
      timestamp: subDays(new Date(), 1), // Yesterday
      read: false
    },
    {
      id: 4,
      title: "New secure message",
      message: "Sophie Garcia sent you a secure message about medication questions.",
      icon: "message" as const,
      timestamp: subDays(new Date(), 1.1), // Yesterday
      read: false
    }
  ]);

  const performanceMetrics = [
    {
      name: "Documentation Compliance",
      description: "Notes completed within 48 hours",
      value: 92
    },
    {
      name: "Session Completion Rate",
      description: "Completed vs. scheduled sessions",
      value: 85
    },
    {
      name: "No-Show Rate",
      description: "Last 30 days",
      value: 7
    }
  ];

  const quickActions = [
    {
      id: "new-client",
      name: "New Client",
      icon: "new-client" as const,
      onClick: () => {
        setLocation("/clients");
        toast({
          title: "New Client",
          description: "Navigating to client form...",
        });
      }
    },
    {
      id: "schedule-session",
      name: "Schedule Session",
      icon: "schedule-session" as const,
      onClick: () => {
        setLocation("/scheduling");
        toast({
          title: "Schedule Session",
          description: "Navigating to scheduling...",
        });
      }
    },
    {
      id: "create-note",
      name: "Create Note",
      icon: "create-note" as const,
      onClick: () => {
        setLocation("/documentation");
        toast({
          title: "Create Note",
          description: "Navigating to documentation...",
        });
      }
    },
    {
      id: "create-invoice",
      name: "Create Invoice",
      icon: "create-invoice" as const,
      onClick: () => {
        setLocation("/billing");
        toast({
          title: "Create Invoice",
          description: "Navigating to billing...",
        });
      }
    }
  ];

  // Handle notification actions
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const handleViewNotification = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      toast({
        title: `Viewing: ${notification.title}`,
        description: notification.message,
      });
    }
  };

  // No longer needed after refactoring the quickActions

  // If user is not authenticated, show login form
  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar 
          title="Dashboard" 
          notificationCount={notifications.filter(n => !n.read).length}
        />
        
        <main className="p-6 bg-gradient-to-br from-neutral-50 to-white min-h-screen overflow-y-auto">
          {/* Welcome Banner */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <BrainCircuit className="w-64 h-64 -mt-12 -mr-12 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-3 text-primary-200" />
                <h2 className="text-2xl font-bold">Welcome back, Dr. {user?.firstName}!</h2>
              </div>
              <p className="mt-2 max-w-lg text-white">
                You have {sessions.length} sessions scheduled today and {documentationTasks.filter(t => t.status === "Overdue" || t.status === "Due Today").length} documentation items that need attention.
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>Next session: {sessions[0].time} with {sessions[0].clientName}</span>
                </div>
                <div className="bg-white bg-opacity-20 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                  <Workflow className="h-4 w-4 mr-1.5" />
                  <span>Productivity score: 94%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <MetricCard 
                title="Today's Sessions" 
                value={sessions.length}
                change={{ value: "2 more than yesterday", positive: true }}
                icon={<Calendar className="h-5 w-5 text-white" />}
                className="bg-gradient-purple shadow-lg shadow-purple-200 hover-lift"
              />
            </div>
            
            <div>
              <MetricCard 
                title="Pending Notes" 
                value={documentationTasks.length}
                change={{ value: "2 due today", positive: false }}
                icon={<FileText className="h-5 w-5 text-white" />}
                className="bg-gradient-blue shadow-lg shadow-blue-200 hover-lift"
              />
            </div>
            
            <div>
              <MetricCard 
                title="Client Retention" 
                value="87%"
                change={{ value: "4% increase this month", positive: true }}
                icon={<TrendingUp className="h-5 w-5 text-white" />}
                className="bg-gradient-green shadow-lg shadow-green-200 hover-lift"
              />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <UpcomingSessions sessions={sessions} />
              </div>
              
              <div>
                <DocumentationTasks tasks={documentationTasks} />
              </div>
            </div>
            
            {/* Right Column (1/3 width) */}
            <div className="space-y-8">
              <div>
                <Notifications 
                  notifications={notifications}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onViewNotification={handleViewNotification}
                  className="glass-effect"
                />
              </div>
              
              <div>
                <PerformanceMetrics metrics={performanceMetrics} />
              </div>
              
              <div>
                <QuickActions actions={quickActions} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
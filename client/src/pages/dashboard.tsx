import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { DocumentationTasks } from "@/components/dashboard/DocumentationTasks";
import { Notifications } from "@/components/dashboard/Notifications";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, Users } from "lucide-react";
import { addDays, subDays } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock data for the dashboard
  const [sessions, setSessions] = useState([
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
  ]);

  const [documentationTasks, setDocumentationTasks] = useState([
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
  ]);

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
      onClick: () => handleQuickAction("New Client")
    },
    {
      id: "schedule-session",
      name: "Schedule Session",
      icon: "schedule-session" as const,
      onClick: () => handleQuickAction("Schedule Session")
    },
    {
      id: "create-note",
      name: "Create Note",
      icon: "create-note" as const,
      onClick: () => handleQuickAction("Create Note")
    },
    {
      id: "create-invoice",
      name: "Create Invoice",
      icon: "create-invoice" as const,
      onClick: () => handleQuickAction("Create Invoice")
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

  // Handle quick actions
  const handleQuickAction = (actionName: string) => {
    toast({
      title: actionName,
      description: `Navigating to ${actionName.toLowerCase()} form...`,
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
        <TopBar 
          title="Dashboard" 
          notificationCount={notifications.filter(n => !n.read).length}
        />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard 
              title="Today's Sessions" 
              value={sessions.length}
              change={{ value: "2 more than yesterday", positive: true }}
              icon={<Calendar className="h-5 w-5 text-primary-500" />}
            />
            
            <MetricCard 
              title="Pending Notes" 
              value={documentationTasks.length}
              change={{ value: "2 due today", positive: false }}
              icon={<FileText className="h-5 w-5 text-warning-500" />}
            />
            
            <MetricCard 
              title="Client Retention" 
              value="87%"
              change={{ value: "4% increase this month", positive: true }}
              icon={<Users className="h-5 w-5 text-success-500" />}
            />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <UpcomingSessions sessions={sessions} />
              <DocumentationTasks tasks={documentationTasks} />
            </div>
            
            {/* Right Column (1/3 width) */}
            <div className="space-y-6">
              <Notifications 
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onViewNotification={handleViewNotification}
              />
              <PerformanceMetrics metrics={performanceMetrics} />
              <QuickActions actions={quickActions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

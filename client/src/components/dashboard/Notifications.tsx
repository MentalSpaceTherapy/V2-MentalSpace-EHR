import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  FileText, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Bell, 
  CheckCircle, 
  EyeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Types for notifications
interface Notification {
  id: number;
  title: string;
  message: string;
  icon: "document" | "schedule" | "payment" | "message";
  timestamp: Date;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  className?: string;
  onMarkAllAsRead: () => void;
  onViewNotification: (id: number) => void;
}

export function Notifications({ notifications, className, onMarkAllAsRead, onViewNotification }: NotificationsProps) {
  const { toast } = useToast();
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null);

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    toast({
      title: "Notifications",
      description: "All notifications marked as read.",
    });
  };

  const getIconForType = (type: Notification["icon"]) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "schedule":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
    }
  };

  const getGradientForType = (type: Notification["icon"]) => {
    switch (type) {
      case "document":
        return "from-blue-500 to-indigo-600";
      case "schedule":
        return "from-amber-500 to-orange-600";
      case "payment":
        return "from-green-500 to-emerald-600";
      case "message":
        return "from-purple-500 to-violet-600";
    }
  };

  const getBackgroundForType = (type: Notification["icon"]) => {
    switch (type) {
      case "document":
        return "bg-blue-100";
      case "schedule":
        return "bg-amber-100";
      case "payment":
        return "bg-green-100";
      case "message":
        return "bg-purple-100";
    }
  };
  
  const getRingColorForType = (type: Notification["icon"]) => {
    switch (type) {
      case "document":
        return "ring-blue-400";
      case "schedule":
        return "ring-amber-400";
      case "payment":
        return "ring-green-400";
      case "message":
        return "ring-purple-400";
    }
  };

  return (
    <Card className={cn("modern-card overflow-hidden border-none shadow-lg", className)}>
      <CardHeader className="pb-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <Bell className="h-5 w-5 text-primary-600" />
            </div>
            <CardTitle className="text-lg font-bold gradient-text">Notifications</CardTitle>
            <div className="ml-2 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full px-2 py-0.5">
              {notifications.filter(n => !n.read).length}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center"
            onClick={handleMarkAllAsRead}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Mark all as read
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 max-h-[350px] overflow-y-auto">
        <div className="divide-y divide-neutral-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-4 hover:bg-neutral-50 transition-all duration-300 cursor-pointer relative card-transition",
                  {
                    "bg-neutral-50": notification.read,
                    "shadow-sm": hoveredNotification === notification.id
                  }
                )}
                onClick={() => onViewNotification(notification.id)}
                onMouseEnter={() => setHoveredNotification(notification.id)}
                onMouseLeave={() => setHoveredNotification(null)}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b animate-pulse-subtle" style={{
                    backgroundImage: `linear-gradient(to bottom, rgb(var(--primary-rgb)), transparent)`
                  }}/>
                )}
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300",
                      getBackgroundForType(notification.icon),
                      hoveredNotification === notification.id && "ring-2 shadow-md scale-105 transform",
                      hoveredNotification === notification.id && getRingColorForType(notification.icon)
                    )}>
                      {getIconForType(notification.icon)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium transition-all duration-300", 
                      notification.read ? "text-neutral-600" : "text-neutral-800",
                      hoveredNotification === notification.id && "text-primary-700"
                    )}>
                      {notification.title}
                    </p>
                    <p className={cn(
                      "text-sm mt-1",
                      notification.read ? "text-neutral-400" : "text-neutral-500"
                    )}>
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-neutral-400 italic">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                      {hoveredNotification === notification.id && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-1 h-auto rounded-full"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-neutral-500">
              <Bell className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-100 bg-gradient-to-r from-white to-primary-50">
        <Button 
          variant="link" 
          className="p-0 h-auto text-primary-600 hover:text-primary-700 font-medium transition-transform hover:translate-x-1"
        >
          <span>View notification center</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

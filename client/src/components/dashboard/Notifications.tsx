import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Calendar, DollarSign, MessageSquare } from "lucide-react";
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
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-primary-500" />;
    }
  };

  const getBackgroundForType = (type: Notification["icon"]) => {
    switch (type) {
      case "document":
        return "bg-blue-100";
      case "schedule":
        return "bg-yellow-100";
      case "payment":
        return "bg-green-100";
      case "message":
        return "bg-primary-100";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-neutral-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
          <Button 
            variant="link" 
            className="text-primary-600 hover:text-primary-700 p-0 h-auto"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 divide-y divide-neutral-200">
        {notifications.map((notification) => (
          <div key={notification.id} className={cn("p-4 hover:bg-neutral-50", {
            "bg-neutral-50": notification.read,
          })}>
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", getBackgroundForType(notification.icon))}>
                  {getIconForType(notification.icon)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">{notification.title}</p>
                <p className="text-sm text-neutral-500 mt-1">{notification.message}</p>
                <div className="mt-2 flex items-center text-xs text-neutral-500">
                  <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                  <span className="mx-2">•</span>
                  <Button 
                    variant="link" 
                    className="text-primary-600 hover:text-primary-700 p-0 h-auto"
                    onClick={() => onViewNotification(notification.id)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-200">
        <Button variant="link" className="p-0 h-auto text-primary-600 hover:text-primary-700">
          <span>View all notifications</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreVertical, Video, FolderOpen, Calendar, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Types for sessions
interface Session {
  id: number;
  time: string;
  clientName: string;
  status: "Confirmed" | "Pending" | "No-Show" | "Cancelled";
  type: string;
  medium: "Telehealth" | "In-person";
  duration: string;
}

interface UpcomingSessionsProps {
  sessions: Session[];
  className?: string;
}

export function UpcomingSessions({ sessions, className }: UpcomingSessionsProps) {
  const [timeFilter, setTimeFilter] = useState<"Today" | "Week">("Today");
  const { toast } = useToast();

  const handleStartSession = (session: Session) => {
    toast({
      title: "Starting session",
      description: `Connecting to session with ${session.clientName}...`,
    });
  };

  const handleViewChart = (session: Session) => {
    toast({
      title: "Viewing client chart",
      description: `Opening chart for ${session.clientName}...`,
    });
  };

  const filteredSessions = sessions.filter(session => 
    timeFilter === "Today" ? true : true
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3 border-b border-neutral-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Upcoming Sessions</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => setTimeFilter("Today")}
              variant={timeFilter === "Today" ? "secondary" : "ghost"}
              size="sm"
              className={timeFilter === "Today" ? "bg-primary-50 text-primary-700" : ""}
            >
              Today
            </Button>
            <Button
              onClick={() => setTimeFilter("Week")}
              variant={timeFilter === "Week" ? "secondary" : "ghost"}
              size="sm"
              className={timeFilter === "Week" ? "bg-primary-50 text-primary-700" : ""}
            >
              Week
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 divide-y divide-neutral-200">
        {filteredSessions.map((session) => (
          <div key={session.id} className="p-4 hover:bg-neutral-50 flex items-center">
            <div className="rounded-full w-10 h-10 bg-primary-100 flex items-center justify-center mr-4">
              <span className="text-primary-700 font-medium">{session.time}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium text-neutral-800">{session.clientName}</h3>
                <span className={cn("px-2 py-1 text-xs rounded-full", {
                  "bg-green-100 text-green-800": session.status === "Confirmed",
                  "bg-yellow-100 text-yellow-800": session.status === "Pending",
                  "bg-red-100 text-red-800": session.status === "No-Show",
                  "bg-gray-100 text-gray-800": session.status === "Cancelled"
                })}>
                  {session.status}
                </span>
              </div>
              <div className="flex items-center text-sm text-neutral-500 mt-1">
                {session.medium === "Telehealth" ? (
                  <Video className="h-3 w-3 mr-1" />
                ) : (
                  <Building className="h-3 w-3 mr-1" />
                )}
                <span>{session.medium} - {session.type} ({session.duration})</span>
              </div>
            </div>
            <div className="ml-4 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleStartSession(session)}
                className="h-8 w-8 text-neutral-400 hover:text-primary-500"
              >
                <Video className="h-4 w-4" />
                <span className="sr-only">Start session</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleViewChart(session)}
                className="h-8 w-8 text-neutral-400 hover:text-primary-500"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="sr-only">View client chart</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-neutral-400 hover:text-neutral-700"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-200">
        <Button variant="link" className="p-0 h-auto text-primary-600 hover:text-primary-700">
          <span>View all sessions</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

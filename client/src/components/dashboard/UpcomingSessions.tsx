import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, MoreVertical, Video, FolderOpen, Calendar, 
  Building, PlayCircle, Clock, CalendarClock, Zap, MoreHorizontal 
} from "lucide-react";
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
  const [_, setLocation] = useLocation();

  const handleStartSession = (session: Session) => {
    toast({
      title: "Starting session",
      description: `Connecting to session with ${session.clientName}...`,
    });
    // In a real implementation, this would launch the telehealth interface
    // For now we'll navigate to the client page
    setLocation("/clients");
  };

  const handleViewChart = (session: Session) => {
    toast({
      title: "Viewing client chart",
      description: `Opening chart for ${session.clientName}...`,
    });
    // Navigate to clients page - in a real implementation we would pass the client ID
    setLocation("/clients");
  };

  const handlePrepareNotes = (session: Session) => {
    toast({
      title: "Preparing session notes",
      description: `Opening documentation for ${session.clientName}...`,
    });
    // Navigate to the progress notes section
    setLocation("/documentation/progress-notes");
  };

  const handleViewFullSchedule = () => {
    setLocation("/scheduling");
  };

  const filteredSessions = sessions.filter(session => 
    timeFilter === "Today" ? true : true
  );
  
  // Get relative time to session (e.g. "In 30 min")
  const getRelativeTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const now = new Date();
    const sessionTime = new Date();
    sessionTime.setHours(hour);
    sessionTime.setMinutes(minute);
    
    const diffMs = sessionTime.getTime() - now.getTime();
    if (diffMs < 0) return "Ongoing";
    
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `In ${diffMinutes} min`;
    return `In ${Math.floor(diffMinutes / 60)} hr`;
  };

  return (
    <Card className={cn("modern-card overflow-hidden border-none shadow-lg", className)}>
      <CardHeader className="pb-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <CalendarClock className="h-5 w-5 text-primary-600" />
            </div>
            <CardTitle className="text-lg font-bold gradient-text">Upcoming Sessions</CardTitle>
          </div>
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
            <Button
              onClick={() => setTimeFilter("Today")}
              variant={timeFilter === "Today" ? "default" : "ghost"}
              size="sm"
              className={timeFilter === "Today" 
                ? "bg-primary-600 text-white shadow-md" 
                : "hover:bg-primary-50 hover:text-primary-700"
              }
            >
              Today
            </Button>
            <Button
              onClick={() => setTimeFilter("Week")}
              variant={timeFilter === "Week" ? "default" : "ghost"}
              size="sm"
              className={timeFilter === "Week" 
                ? "bg-primary-600 text-white shadow-md" 
                : "hover:bg-primary-50 hover:text-primary-700"
              }
            >
              Week
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {filteredSessions.map((session, index) => (
            <div 
              key={session.id} 
              className="p-4 hover:bg-neutral-50 border-b border-neutral-100 transition-all duration-300 hover:shadow-sm card-transition"
            >
              <div className="flex items-center">
                <div className={cn(
                  "rounded-xl min-w-20 h-16 flex flex-col items-center justify-center mr-4 shadow-md transition-all duration-300",
                  {
                    "bg-gradient-purple text-white": index === 0,
                    "bg-white border border-primary-100": index !== 0
                  }
                )}>
                  <span className={cn(
                    "text-lg font-bold", 
                    index === 0 ? "text-white" : "text-primary-600"
                  )}>
                    {session.time}
                  </span>
                  <div className={cn(
                    "flex items-center text-xs mt-1", 
                    index === 0 ? "text-primary-100" : "text-neutral-500"
                  )}>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{getRelativeTime(session.time)}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-neutral-800 text-lg">{session.clientName}</h3>
                      <div className="flex items-center text-sm text-neutral-500 mt-1">
                        {session.medium === "Telehealth" ? (
                          <Video className="h-3.5 w-3.5 mr-1.5 text-primary-400" />
                        ) : (
                          <Building className="h-3.5 w-3.5 mr-1.5 text-primary-400" />
                        )}
                        <span>{session.medium}</span>
                        <span className="mx-1.5 text-neutral-300">•</span>
                        <span>{session.type}</span>
                        <span className="mx-1.5 text-neutral-300">•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                    
                    <span className={cn("px-3 py-1 text-xs rounded-full font-medium", {
                      "bg-green-100 text-green-800": session.status === "Confirmed",
                      "bg-yellow-100 text-yellow-800": session.status === "Pending",
                      "bg-red-100 text-red-800": session.status === "No-Show",
                      "bg-neutral-100 text-neutral-800": session.status === "Cancelled"
                    })}>
                      {session.status}
                    </span>
                  </div>
                </div>
                
                <div className="ml-4">
                  {index === 0 ? (
                    <Button 
                      onClick={() => handleStartSession(session)}
                      className="bg-gradient-purple hover:bg-gradient-purple hover:opacity-90 text-white transition-all duration-300 hover-lift"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleViewChart(session)}
                        className="h-9 w-9 rounded-xl text-primary-600 border-primary-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all duration-300"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-9 w-9 rounded-xl text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 transition-all duration-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {index === 0 && (
                <div className="flex mt-3 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewChart(session)}
                    className="text-primary-600 border-primary-200 hover:bg-primary-50"
                  >
                    <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
                    View Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    onClick={() => handlePrepareNotes(session)}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    Prepare Notes
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-100 bg-gradient-to-r from-white to-primary-50">
        <Button 
          variant="link" 
          className="p-0 h-auto text-primary-600 hover:text-primary-700 font-medium transition-transform hover:translate-x-1"
          onClick={handleViewFullSchedule}
        >
          <span>View full schedule</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

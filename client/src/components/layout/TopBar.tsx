import { useState, useEffect } from "react";
import { Bell, HelpCircle, Settings, Search, Zap, Calendar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TopBarProps {
  title: string;
  notificationCount?: number;
}

export function TopBar({ title, notificationCount = 0 }: TopBarProps) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={`bg-white shadow-lg z-10 animate-fade-in backdrop-blur-sm bg-opacity-90 transition-all duration-300`}>
      <div className="flex justify-between items-center px-6 py-4">
        <div className={mounted ? "animate-slide-up" : "opacity-0"}>
          <h1 className="text-2xl font-bold gradient-text">{title}</h1>
          <div className="flex items-center text-sm text-neutral-500 mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
            <span>{today}</span>
            <span className="mx-2 text-primary-300">•</span>
            <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            <span>{format(currentTime, "h:mm a")}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className={`relative ${mounted ? "animate-slide-up" : "opacity-0"}`} style={{ animationDelay: '100ms' }}>
            <Input
              type="text"
              placeholder="Search anything..."
              className="pl-10 pr-4 py-2 w-64 rounded-xl bg-neutral-50 border-neutral-100 focus-within:bg-white transition-all duration-300 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary-400" />
            <div className="absolute right-3 top-2 text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
              <kbd className="font-sans">⌘</kbd> <kbd className="font-sans">K</kbd>
            </div>
          </div>
          
          {/* Quick Actions Button */}
          <Button 
            variant="outline" 
            className={`rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800 transition-all ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: '200ms' }}
          >
            <Zap className="h-4 w-4 mr-2 text-primary-500" />
            Quick Actions
          </Button>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`relative rounded-full hover:bg-primary-100 hover:text-primary-700 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: '300ms' }}
          >
            <Bell className="h-5 w-5 text-neutral-600" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-purple animate-pulse-subtle shadow-md shadow-purple-200"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full hover:bg-primary-100 hover:text-primary-700 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: '400ms' }}
          >
            <HelpCircle className="h-5 w-5 text-neutral-600" />
          </Button>
          
          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full hover:bg-primary-100 hover:text-primary-700 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: '500ms' }}
          >
            <Settings className="h-5 w-5 text-neutral-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}

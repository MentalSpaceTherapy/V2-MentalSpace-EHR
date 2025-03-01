import { useState, useEffect } from "react";
import { 
  Bell, HelpCircle, Settings, Search, Zap, Calendar, Sun, LogOut, 
  UserCog, Users, FileText, DollarSign 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  title: string;
  notificationCount?: number;
}

export function TopBar({ title, notificationCount = 0 }: TopBarProps) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout, changeRole } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/auth");
  };
  
  const handleRoleChange = (role: string) => {
    changeRole(role);
    toast({
      title: "Role Changed",
      description: `You are now acting as a ${role}.`,
    });
  };

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
        <div className="animate-slide-up">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800 transition-all ${mounted ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: '200ms' }}
              >
                <Zap className="h-4 w-4 mr-2 text-primary-500" />
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/clients")}>
                <Users className="h-4 w-4 mr-2" />
                New Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/scheduling")}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/documentation")}>
                <FileText className="h-4 w-4 mr-2" />
                Create Documentation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/billing")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Create Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem>
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New intake form submitted</p>
                      <p className="text-xs text-neutral-500 mt-1">Jamie Rodriguez has completed their intake assessment.</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Session rescheduled</p>
                      <p className="text-xs text-neutral-500 mt-1">Michael Chen rescheduled from 7/26 to 7/28 at 10:00 AM.</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/billing")}>
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-neutral-500 mt-1">Emma Wilson has paid their invoice #INV-2023-078.</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs text-primary-600 font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Help */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full hover:bg-primary-100 hover:text-primary-700 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: '400ms' }}
              >
                <HelpCircle className="h-5 w-5 text-neutral-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">User Guide</span>
                  <span className="text-xs text-neutral-500">Learn how to use MentalSpace EHR</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">Video Tutorials</span>
                  <span className="text-xs text-neutral-500">Watch step-by-step guides</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">Support Center</span>
                  <span className="text-xs text-neutral-500">Contact our support team</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium text-primary-600">What's New</span>
                  <span className="text-xs text-neutral-500">See latest features and updates</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full hover:bg-primary-100 hover:text-primary-700 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: '500ms' }}
            onClick={() => setLocation("/practice")}
          >
            <Settings className="h-5 w-5 text-neutral-600" />
          </Button>

          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full hover:bg-blue-100 hover:text-blue-600 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: '550ms' }}
                title="Switch Role"
              >
                <UserCog className="h-5 w-5 text-neutral-600" />
                {user?.role && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 px-1.5 rounded-full flex items-center justify-center bg-blue-500 text-white text-xs"
                  >
                    {user.role.substring(0, 1)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={user?.role === "Therapist" ? "bg-blue-50 font-medium text-blue-700" : ""} 
                onClick={() => handleRoleChange("Therapist")}
              >
                Therapist
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={user?.role === "Administrator" ? "bg-blue-50 font-medium text-blue-700" : ""} 
                onClick={() => handleRoleChange("Administrator")}
              >
                Administrator
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={user?.role === "Supervisor" ? "bg-blue-50 font-medium text-blue-700" : ""} 
                onClick={() => handleRoleChange("Supervisor")}
              >
                Supervisor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full hover:bg-red-100 hover:text-red-600 transition-transform hover:scale-110 ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: '600ms' }}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-neutral-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}

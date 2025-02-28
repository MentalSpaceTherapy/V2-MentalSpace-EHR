import { useState } from "react";
import { Bell, HelpCircle, Settings, Search } from "lucide-react";
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

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-800">{title}</h1>
          <p className="text-sm text-neutral-500">{today}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-neutral-500" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary-500"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* Help */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5 text-neutral-500" />
          </Button>
          
          {/* Settings */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}

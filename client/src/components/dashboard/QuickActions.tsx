import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  CalendarPlus, 
  FilePlus, 
  Receipt, 
  Zap, 
  Sparkles,
  UserCog,
  UsersRound,
  Settings,
  ClipboardCheck,
  BarChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Types for actions
interface Action {
  id: string;
  name: string;
  icon: "new-client" | "schedule-session" | "create-note" | "create-invoice" | "manage-therapists" | "assign-clients" | "practice-settings" | "review-notes" | "therapist-performance";
  onClick: () => void;
}

interface QuickActionsProps {
  actions: Action[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  const { toast } = useToast();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  
  const getIconColorClass = (type: Action["icon"]) => {
    switch (type) {
      case "new-client":
        return "text-purple-500 group-hover:text-purple-600";
      case "schedule-session":
        return "text-blue-500 group-hover:text-blue-600";
      case "create-note":
        return "text-green-500 group-hover:text-green-600";
      case "create-invoice":
        return "text-amber-500 group-hover:text-amber-600";
      case "manage-therapists":
        return "text-indigo-500 group-hover:text-indigo-600";
      case "assign-clients":
        return "text-cyan-500 group-hover:text-cyan-600";
      case "practice-settings":
        return "text-violet-500 group-hover:text-violet-600";
      case "review-notes":
        return "text-emerald-500 group-hover:text-emerald-600";
      case "therapist-performance":
        return "text-teal-500 group-hover:text-teal-600";
      default:
        return "text-primary-500 group-hover:text-primary-600";
    }
  };
  
  const getBgGradientClass = (type: Action["icon"]) => {
    switch (type) {
      case "new-client":
        return "from-purple-50 to-white";
      case "schedule-session":
        return "from-blue-50 to-white";
      case "create-note":
        return "from-green-50 to-white";
      case "create-invoice":
        return "from-amber-50 to-white";
      case "manage-therapists":
        return "from-indigo-50 to-white";
      case "assign-clients":
        return "from-cyan-50 to-white";
      case "practice-settings":
        return "from-violet-50 to-white";
      case "review-notes":
        return "from-emerald-50 to-white";
      case "therapist-performance":
        return "from-teal-50 to-white";
      default:
        return "from-primary-50 to-white";
    }
  };
  
  const getIconForType = (type: Action["icon"], isHovered: boolean) => {
    const colorClass = getIconColorClass(type);
    const className = cn(
      "h-7 w-7 mb-3 transition-all duration-300",
      colorClass,
      isHovered && "scale-110 transform"
    );
    
    switch (type) {
      case "new-client":
        return <PlusCircle className={className} />;
      case "schedule-session":
        return <CalendarPlus className={className} />;
      case "create-note":
        return <FilePlus className={className} />;
      case "create-invoice":
        return <Receipt className={className} />;
      case "manage-therapists":
        return <UserCog className={className} />;
      case "assign-clients":
        return <UsersRound className={className} />;
      case "practice-settings":
        return <Settings className={className} />;
      case "review-notes":
        return <ClipboardCheck className={className} />;
      case "therapist-performance":
        return <BarChart className={className} />;
    }
  };

  return (
    <Card className={cn("modern-card overflow-hidden border-none shadow-lg", className)}>
      <CardHeader className="pb-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex items-center">
          <div className="bg-primary-100 p-2 rounded-lg mr-3">
            <Zap className="h-5 w-5 text-primary-600" />
          </div>
          <CardTitle className="text-lg font-bold gradient-text">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={cn(
                "group flex flex-col items-center justify-center p-5 h-auto",
                "bg-gradient-to-tr hover-lift card-transition rounded-xl shadow-sm",
                "hover:shadow-md border border-neutral-100",
                `bg-gradient-to-b ${getBgGradientClass(action.icon)}`,
                hoveredAction === action.id && "ring-2 ring-primary-200"
              )}
              onClick={action.onClick}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div className="relative">
                {getIconForType(action.icon, hoveredAction === action.id)}
                {hoveredAction === action.id && (
                  <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse">
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}
              </div>
              <span className={cn(
                "text-sm font-semibold transition-all duration-300",
                "text-neutral-800 group-hover:text-primary-700",
                hoveredAction === action.id && "scale-105 transform"
              )}>
                {action.name}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

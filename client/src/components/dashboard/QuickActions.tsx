import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarPlus, FilePlus, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for actions
interface Action {
  id: string;
  name: string;
  icon: "new-client" | "schedule-session" | "create-note" | "create-invoice";
  onClick: () => void;
}

interface QuickActionsProps {
  actions: Action[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  const { toast } = useToast();
  
  const getIconForType = (type: Action["icon"]) => {
    switch (type) {
      case "new-client":
        return <PlusCircle className="h-6 w-6 text-primary-500 mb-2" />;
      case "schedule-session":
        return <CalendarPlus className="h-6 w-6 text-primary-500 mb-2" />;
      case "create-note":
        return <FilePlus className="h-6 w-6 text-primary-500 mb-2" />;
      case "create-invoice":
        return <Receipt className="h-6 w-6 text-primary-500 mb-2" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-neutral-200">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className="flex flex-col items-center justify-center p-4 h-auto bg-neutral-50 hover:bg-primary-50 transition-colors"
              onClick={action.onClick}
            >
              {getIconForType(action.icon)}
              <span className="text-sm font-medium text-neutral-700">{action.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

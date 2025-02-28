import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  const hasGradient = className?.includes('bg-gradient');
  
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 border-none dashboard-card metric-card", className)}>
      <CardContent className="p-6 relative">
        {/* Floating sparkles for visual interest */}
        {hasGradient && (
          <div className="absolute top-2 right-2 opacity-20">
            <Sparkles className="h-6 w-6 text-white animate-pulse-subtle" />
          </div>
        )}
        
        <div className="flex justify-between">
          <div>
            <p className={cn("text-sm font-medium", 
              hasGradient ? "text-white text-opacity-80" : "text-neutral-500"
            )}>
              {title}
            </p>
            <p className={cn("text-2xl font-bold mt-1", 
              hasGradient 
                ? "text-white" 
                : {
                    "text-warning-500": title === "Pending Notes",
                    "text-success-500": title === "Client Retention",
                    "text-primary-500": title === "Today's Sessions"
                  }
            )}>
              {value}
            </p>
            {change && (
              <div className="flex items-center mt-1.5">
                {change.positive ? (
                  <ArrowUpIcon className={`h-4 w-4 mr-1 ${hasGradient ? "text-white text-opacity-80" : "text-success-500"}`} />
                ) : (
                  <ArrowDownIcon className={`h-4 w-4 mr-1 ${hasGradient ? "text-white text-opacity-80" : "text-error-500"}`} />
                )}
                <span className={cn("text-sm font-medium", 
                  hasGradient 
                    ? "text-white text-opacity-90" 
                    : {
                        "text-success-500": change.positive,
                        "text-error-500": !change.positive,
                        "text-warning-500": title === "Pending Notes" && !change.positive
                      }
                )}>
                  {change.value}
                </span>
              </div>
            )}
          </div>
          
          <div className={cn("h-14 w-14 rounded-full flex items-center justify-center shadow-md", 
            hasGradient 
              ? "bg-white bg-opacity-20" 
              : {
                  "bg-primary-50": title === "Today's Sessions",
                  "bg-warning-100": title === "Pending Notes",
                  "bg-success-100": title === "Client Retention"
                }
          )}>
            {icon}
          </div>
        </div>
        
        {/* Subtle decorative element at the bottom */}
        {hasGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20"></div>
        )}
      </CardContent>
    </Card>
  );
}

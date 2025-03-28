import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Sparkles, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  } | number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  className?: string;
  description?: string;
}

export function MetricCard({ title, value, change, changeType, icon, className, description }: MetricCardProps) {
  const hasGradient = className?.includes('bg-gradient');
  
  // Determine if change is positive, negative, or neutral based on changeType or change value
  let isChangePositive = false;
  let isChangeNeutral = false;
  let changeValue = '';
  
  if (typeof change === 'number') {
    isChangePositive = changeType === 'positive' || (changeType === undefined && change > 0);
    isChangeNeutral = changeType === 'neutral' || change === 0;
    changeValue = change > 0 ? `+${change}%` : `${change}%`;
  } else if (change && 'value' in change) {
    isChangePositive = change.positive;
    changeValue = change.value;
  }
  
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
            {description && (
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            )}
            {change && (
              <div className="flex items-center mt-1.5">
                {isChangeNeutral ? (
                  <Minus className={`h-4 w-4 mr-1 ${hasGradient ? "text-white text-opacity-80" : "text-neutral-500"}`} />
                ) : isChangePositive ? (
                  <ArrowUpIcon className={`h-4 w-4 mr-1 ${hasGradient ? "text-white text-opacity-80" : "text-success-500"}`} />
                ) : (
                  <ArrowDownIcon className={`h-4 w-4 mr-1 ${hasGradient ? "text-white text-opacity-80" : "text-error-500"}`} />
                )}
                <span className={cn("text-sm font-medium", 
                  hasGradient 
                    ? "text-white text-opacity-90" 
                    : {
                        "text-success-500": isChangePositive && !isChangeNeutral,
                        "text-error-500": !isChangePositive && !isChangeNeutral,
                        "text-neutral-500": isChangeNeutral,
                        "text-warning-500": title === "Pending Notes" && !isChangePositive
                      }
                )}>
                  {changeValue}
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

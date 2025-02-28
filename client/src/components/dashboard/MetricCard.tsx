import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
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
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className={cn("text-2xl font-bold mt-1", {
              "text-warning-500": title === "Pending Notes"
            })}>{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {change.positive ? (
                  <ArrowUpIcon className="text-success-500 h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="text-error-500 h-4 w-4 mr-1" />
                )}
                <span className={cn("text-sm", {
                  "text-success-500": change.positive,
                  "text-error-500": !change.positive,
                  "text-warning-500": title === "Pending Notes"
                })}>
                  {change.value}
                </span>
              </div>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", {
            "bg-primary-50": title === "Today's Sessions",
            "bg-warning-100": title === "Pending Notes",
            "bg-success-100": title === "Client Retention"
          })}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

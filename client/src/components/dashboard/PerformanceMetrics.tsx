import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for performance metrics
interface MetricItem {
  name: string;
  description: string;
  value: number;
}

interface PerformanceMetricsProps {
  metrics: MetricItem[];
  className?: string;
}

export function PerformanceMetrics({ metrics, className }: PerformanceMetricsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-neutral-200">
        <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {metrics.map((metric, index) => (
            <div key={index} className={index < metrics.length - 1 ? "mb-6" : ""}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700">{metric.name}</h3>
                  <p className="text-xs text-neutral-500">{metric.description}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-800">{metric.value}%</span>
              </div>
              <Progress 
                value={metric.value} 
                className="h-2.5"
                indicatorClassName={cn({
                  "bg-primary-500": metric.name !== "No-Show Rate",
                  "bg-success-500": metric.name === "No-Show Rate",
                })}
              />
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-200">
        <Button variant="link" className="p-0 h-auto text-primary-600 hover:text-primary-700">
          <span>View detailed reports</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

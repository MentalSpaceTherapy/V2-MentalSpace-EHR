import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ChartLine, 
  Users, 
  CreditCard, 
  Clock, 
  Award, 
  InfoIcon 
} from "lucide-react";
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
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);

  const getMetricColor = (name: string, isHovered: boolean) => {
    switch (name) {
      case "Client Retention Rate":
        return isHovered ? "from-indigo-500 to-blue-600" : "from-indigo-400 to-blue-500";
      case "Documentation Compliance":
        return isHovered ? "from-purple-500 to-violet-600" : "from-purple-400 to-violet-500";
      case "Payment Collection Rate":
        return isHovered ? "from-green-500 to-emerald-600" : "from-green-400 to-emerald-500";
      case "No-Show Rate":
        return isHovered ? "from-amber-500 to-orange-600" : "from-amber-400 to-orange-500";
      default:
        return isHovered ? "from-primary-500 to-primary-600" : "from-primary-400 to-primary-500";
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case "Client Retention Rate":
        return <Users className="h-5 w-5 text-indigo-500" />;
      case "Documentation Compliance":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "Payment Collection Rate":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "No-Show Rate":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <ChartLine className="h-5 w-5 text-primary-500" />;
    }
  };

  return (
    <Card className={cn("modern-card overflow-hidden border-none shadow-lg", className)}>
      <CardHeader className="pb-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex items-center">
          <div className="bg-primary-100 p-2 rounded-lg mr-3">
            <ChartLine className="h-5 w-5 text-primary-600" />
          </div>
          <CardTitle className="text-lg font-bold gradient-text">Performance Metrics</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const isHovered = hoveredMetric === index;
            const gradientColors = getMetricColor(metric.name, isHovered);
            
            return (
              <div 
                key={index} 
                className={cn(
                  "rounded-lg p-4 transition-all duration-300",
                  isHovered ? "bg-neutral-50 shadow-sm" : "bg-white"
                )}
                onMouseEnter={() => setHoveredMetric(index)}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center mr-3 transition-all duration-300",
                      isHovered ? "bg-white shadow-md" : "bg-neutral-50"
                    )}>
                      {getMetricIcon(metric.name)}
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-sm font-semibold transition-all duration-300",
                        isHovered ? "text-primary-600" : "text-neutral-700"
                      )}>
                        {metric.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{metric.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={cn(
                      "text-base font-bold transition-all duration-300",
                      isHovered ? "text-primary-600" : "text-neutral-800"
                    )}>
                      {metric.value}%
                    </span>
                    {isHovered && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 h-6 w-6 p-0 rounded-full"
                      >
                        <InfoIcon className="h-3.5 w-3.5 text-neutral-400" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={metric.value} 
                    className={cn(
                      "h-3 rounded-full bg-neutral-100 transition-all duration-300",
                      isHovered && "h-4"
                    )}
                    indicatorClassName={cn(
                      "rounded-full bg-gradient-to-r transition-all duration-500",
                      gradientColors
                    )}
                  />
                  {isHovered && (
                    <div className="absolute -bottom-5 left-0 right-0 h-5 bg-gradient-to-b from-neutral-100/30 to-transparent rounded-full blur-sm" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-100 bg-gradient-to-r from-white to-primary-50">
        <Button 
          variant="link" 
          className="p-0 h-auto text-primary-600 hover:text-primary-700 font-medium transition-transform hover:translate-x-1"
        >
          <span>View detailed analytics</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

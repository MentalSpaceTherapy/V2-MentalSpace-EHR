import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { 
  FileEdit, 
  ClipboardCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpDown,
  FileText,
  HourglassIcon
} from "lucide-react";

// Types for documentation
interface DocumentationTask {
  id: number;
  clientName: string;
  sessionDate: Date;
  dueDate: Date;
  type: string;
  status: "Overdue" | "Due Today" | "In Progress";
}

interface DocumentationTasksProps {
  tasks: DocumentationTask[];
  className?: string;
}

export function DocumentationTasks({ tasks, className }: DocumentationTasksProps) {
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const { toast } = useToast();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [_, setLocation] = useLocation();

  // Function to get the documentation route based on document type
  const getDocumentationRoute = (type: string): string => {
    switch(type) {
      case "Progress Note":
        return "/documentation/progress-notes";
      case "Treatment Plan":
        return "/documentation/treatment-plans";
      case "Assessment":
        return "/documentation/intake";
      default:
        return "/documentation";
    }
  };

  const handleCompleteTask = (task: DocumentationTask) => {
    toast({
      title: `Completing ${task.type}`,
      description: `Opening documentation for ${task.clientName}...`,
    });
    // Navigate to the appropriate documentation form based on type
    setLocation(getDocumentationRoute(task.type));
  };

  const handleContinueTask = (task: DocumentationTask) => {
    toast({
      title: `Continuing ${task.type}`,
      description: `Opening documentation for ${task.clientName}...`,
    });
    // Navigate to the appropriate documentation form
    setLocation(getDocumentationRoute(task.type));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (sortBy === "clientName") {
      return a.clientName.localeCompare(b.clientName);
    } else if (sortBy === "type") {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });
  
  // Get the icon for the document type
  const getDocTypeIcon = (type: string) => {
    switch(type) {
      case "Progress Note":
        return <FileText className="h-4 w-4 text-primary-500" />;
      case "Treatment Plan":
        return <ClipboardCheck className="h-4 w-4 text-green-500" />;
      case "Assessment":
        return <HourglassIcon className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-primary-500" />;
    }
  };
  
  // Get the urgency of a task
  const getUrgency = (task: DocumentationTask) => {
    if (task.status === "Overdue") return "high";
    if (task.status === "Due Today") return "medium";
    return "low";
  };

  return (
    <Card className={cn("modern-card overflow-hidden border-none shadow-lg", className)}>
      <CardHeader className="pb-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <FileEdit className="h-5 w-5 text-primary-600" />
            </div>
            <CardTitle className="text-lg font-bold gradient-text">Pending Documentation</CardTitle>
          </div>
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-sm bg-white border border-primary-100 rounded-lg shadow-sm w-[180px] hover:border-primary-200 transition-all">
                <div className="flex items-center">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-primary-500" />
                  <SelectValue placeholder="Sort by Due Date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                <SelectItem value="clientName">Sort by Client Name</SelectItem>
                <SelectItem value="type">Sort by Document Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-primary-50 to-white">
              <TableRow>
                <TableHead className="text-xs font-medium text-primary-700 uppercase">Client</TableHead>
                <TableHead className="text-xs font-medium text-primary-700 uppercase">Session Date</TableHead>
                <TableHead className="text-xs font-medium text-primary-700 uppercase">Due Date</TableHead>
                <TableHead className="text-xs font-medium text-primary-700 uppercase">Type</TableHead>
                <TableHead className="text-xs font-medium text-primary-700 uppercase">Status</TableHead>
                <TableHead className="text-xs font-medium text-primary-700 uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => {
                const urgency = getUrgency(task);
                const isHovered = hoveredRow === task.id;
                
                return (
                  <TableRow 
                    key={task.id} 
                    className={cn(
                      "hover:bg-neutral-50 transition-all duration-300 card-transition border-b border-neutral-100",
                      urgency === "high" ? "bg-red-50" : urgency === "medium" ? "bg-amber-50" : "",
                      isHovered && "shadow-sm"
                    )}
                    onMouseEnter={() => setHoveredRow(task.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-1.5 h-10 rounded-full mr-3",
                          urgency === "high" ? "bg-red-500" : 
                          urgency === "medium" ? "bg-amber-500" : 
                          "bg-blue-500"
                        )} />
                        {task.clientName}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                        {format(task.sessionDate, "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className={cn("py-3", 
                      (task.status === "Overdue" || task.status === "Due Today") 
                        ? "text-error-700 font-medium" 
                        : "text-neutral-700"
                    )}>
                      <div className="flex items-center">
                        {task.status === "Overdue" && (
                          <AlertCircle className="h-3.5 w-3.5 mr-2 text-red-500" />
                        )}
                        {task.status === "Due Today" && (
                          <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                        )}
                        {task.status === "In Progress" && (
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-blue-500" />
                        )}
                        {task.status === "Overdue" 
                          ? "Past Due" 
                          : task.status === "Due Today" 
                            ? "Today" 
                            : format(task.dueDate, "MMM d, yyyy")
                        }
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        {getDocTypeIcon(task.type)}
                        <span className="ml-2">{task.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={cn(
                        "font-medium transition-all duration-300",
                        task.status === "Overdue" 
                          ? "bg-red-100 text-red-800 hover:bg-red-100" 
                          : task.status === "Due Today" 
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                            : "bg-blue-100 text-blue-800 hover:bg-blue-100",
                        isHovered && "shadow-sm scale-105"
                      )}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Button 
                        variant={isHovered ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "transition-all duration-300",
                          task.status === "Overdue" 
                            ? "text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800" 
                            : task.status === "Due Today" 
                              ? "text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800" 
                              : "text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800",
                          isHovered && (
                            task.status === "Overdue" 
                              ? "bg-red-500 text-white hover:bg-red-600 hover:text-white border-red-500" 
                              : task.status === "Due Today" 
                                ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white border-amber-500" 
                                : "bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-blue-500"
                          )
                        )}
                        onClick={() => task.status === "In Progress" ? handleContinueTask(task) : handleCompleteTask(task)}
                      >
                        {task.status === "In Progress" ? "Continue" : "Complete Now"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

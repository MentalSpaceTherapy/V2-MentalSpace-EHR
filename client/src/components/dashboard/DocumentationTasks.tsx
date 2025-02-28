import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

  const handleCompleteTask = (task: DocumentationTask) => {
    toast({
      title: `Completing ${task.type}`,
      description: `Opening documentation for ${task.clientName}...`,
    });
  };

  const handleContinueTask = (task: DocumentationTask) => {
    toast({
      title: `Continuing ${task.type}`,
      description: `Opening documentation for ${task.clientName}...`,
    });
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

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-neutral-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Pending Documentation</CardTitle>
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-sm bg-neutral-50 border-none w-[180px]">
                <SelectValue placeholder="Sort by Due Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                <SelectItem value="clientName">Sort by Client Name</SelectItem>
                <SelectItem value="type">Sort by Session Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase">Client</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase">Session Date</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase">Due Date</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase">Type</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase">Status</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-neutral-50">
                <TableCell className="font-medium">{task.clientName}</TableCell>
                <TableCell>{format(task.sessionDate, "MMM d, yyyy")}</TableCell>
                <TableCell className={task.status === "Overdue" || task.status === "Due Today" ? "text-error-500 font-medium" : ""}>
                  {task.status === "Overdue" || task.status === "Due Today" ? "Today" : format(task.dueDate, "MMM d, yyyy")}
                </TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    task.status === "Overdue" 
                      ? "bg-red-100 text-red-800 hover:bg-red-100" 
                      : task.status === "Due Today" 
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" 
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  }>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="link" 
                    className="text-primary-600 hover:text-primary-800"
                    onClick={() => task.status === "In Progress" ? handleContinueTask(task) : handleCompleteTask(task)}
                  >
                    {task.status === "In Progress" ? "Continue" : "Complete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

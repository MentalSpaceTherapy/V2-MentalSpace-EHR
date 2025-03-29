import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Circle,
  Copy,
  Edit,
  FilePlus,
  MoreHorizontal,
  Plus,
  Save,
  Trash,
  Undo2,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useCRM } from '@/hooks/use-crm';
import { cn } from '@/lib/utils';

// Define types
type WorkflowTrigger = {
  id: string;
  name: string;
  type: 'event' | 'behavior' | 'date' | 'manual';
  description: string;
  icon: keyof typeof triggerIcons;
};

type WorkflowStep = {
  id: string;
  type: 'email' | 'sms' | 'task' | 'wait' | 'condition';
  name: string;
  description: string;
  config: Record<string, any>;
  nextSteps?: string[];
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  enabled: boolean;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
};

// Icons for different trigger types
const triggerIcons = {
  appointment: Circle,
  clientAction: Circle,
  missedSession: Circle,
  newClient: Circle,
  birthdayEvent: Circle,
  documentExpiry: Circle,
  manualTrigger: Circle,
  dateBasedEvent: Circle,
};

export function MarketingAutomation() {
  // State for sample automation workflows
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf1',
      name: 'New Client Welcome Sequence',
      description: 'Send welcome emails and resources to new clients',
      enabled: true,
      trigger: {
        id: 'trigger1',
        name: 'New Client Registration',
        type: 'event',
        description: 'Triggered when a new client is registered in the system',
        icon: 'newClient',
      },
      steps: [
        {
          id: 'step1',
          type: 'email',
          name: 'Welcome Email',
          description: 'Send a welcome email with practice information',
          config: {
            template: 'welcome-email',
            delay: 0,
          },
          nextSteps: ['step2'],
        },
        {
          id: 'step2',
          type: 'wait',
          name: 'Wait 2 Days',
          description: 'Wait for 2 days before next action',
          config: {
            duration: 48, // hours
          },
          nextSteps: ['step3'],
        },
        {
          id: 'step3',
          type: 'email',
          name: 'Resources Email',
          description: 'Send resources and forms to complete',
          config: {
            template: 'resources-email',
            delay: 0,
          },
        },
      ],
      createdAt: '2023-08-15T10:30:00Z',
      updatedAt: '2023-09-22T14:45:00Z',
    },
    {
      id: 'wf2',
      name: 'Missed Appointment Follow-up',
      description: 'Automated follow-up for missed therapy sessions',
      enabled: true,
      trigger: {
        id: 'trigger2',
        name: 'Missed Appointment',
        type: 'event',
        description: 'Triggered when a client misses a scheduled appointment',
        icon: 'missedSession',
      },
      steps: [
        {
          id: 'step1',
          type: 'email',
          name: 'Missed Appointment Notice',
          description: 'Send a follow-up email about the missed appointment',
          config: {
            template: 'missed-appointment-email',
            delay: 1, // hours
          },
          nextSteps: ['step2'],
        },
        {
          id: 'step2',
          type: 'condition',
          name: 'Check Response',
          description: 'Check if client responded to email',
          config: {
            condition: 'email_opened',
            timeout: 48, // hours
          },
          nextSteps: ['step3', 'step4'],
        },
        {
          id: 'step3',
          type: 'task',
          name: 'Create Follow-up Task',
          description: 'Create a task for staff to call the client',
          config: {
            assignee: 'therapist',
            priority: 'high',
          },
        },
        {
          id: 'step4',
          type: 'sms',
          name: 'SMS Reminder',
          description: 'Send SMS reminder to reschedule',
          config: {
            template: 'reschedule-sms',
            delay: 0,
          },
        },
      ],
      createdAt: '2023-07-10T09:15:00Z',
      updatedAt: '2023-10-05T11:20:00Z',
    },
    {
      id: 'wf3',
      name: 'Client Re-engagement',
      description: 'Re-engage inactive clients after 30 days',
      enabled: false,
      trigger: {
        id: 'trigger3',
        name: 'Client Inactivity',
        type: 'behavior',
        description: 'Triggered when a client has been inactive for 30 days',
        icon: 'clientAction',
      },
      steps: [
        {
          id: 'step1',
          type: 'email',
          name: 'Check-in Email',
          description: 'Send a friendly check-in email',
          config: {
            template: 'reengagement-email',
            delay: 0,
          },
          nextSteps: ['step2'],
        },
        {
          id: 'step2',
          type: 'wait',
          name: 'Wait 7 Days',
          description: 'Wait for 7 days before next action',
          config: {
            duration: 168, // hours
          },
          nextSteps: ['step3'],
        },
        {
          id: 'step3',
          type: 'task',
          name: 'Personal Outreach',
          description: 'Create task for therapist to personally reach out',
          config: {
            assignee: 'therapist',
            priority: 'medium',
          },
        },
      ],
      createdAt: '2023-09-05T15:30:00Z',
      updatedAt: '2023-09-05T15:30:00Z',
    },
  ]);
  
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    trigger: '',
  });
  
  // Trigger options
  const triggerOptions = [
    {
      id: 'appointment',
      name: 'Appointment Events',
      type: 'event',
      options: [
        { value: 'appointment_booked', label: 'Appointment Booked' },
        { value: 'appointment_rescheduled', label: 'Appointment Rescheduled' },
        { value: 'appointment_cancelled', label: 'Appointment Cancelled' },
        { value: 'appointment_reminder', label: 'Appointment Reminder' },
        { value: 'appointment_completed', label: 'Appointment Completed' },
        { value: 'appointment_missed', label: 'Appointment Missed' },
      ],
    },
    {
      id: 'client',
      name: 'Client Actions',
      type: 'event',
      options: [
        { value: 'client_registered', label: 'New Client Registration' },
        { value: 'client_updated_info', label: 'Client Updated Information' },
        { value: 'client_inactive', label: 'Client Inactive (30+ days)' },
        { value: 'document_signed', label: 'Document Signed' },
        { value: 'form_submitted', label: 'Form Submitted' },
      ],
    },
    {
      id: 'date',
      name: 'Date-based Triggers',
      type: 'date',
      options: [
        { value: 'client_birthday', label: 'Client Birthday' },
        { value: 'treatment_anniversary', label: 'Treatment Anniversary' },
        { value: 'document_expiry', label: 'Document Expiration' },
      ],
    },
    {
      id: 'manual',
      name: 'Manual Triggers',
      type: 'manual',
      options: [
        { value: 'manual_start', label: 'Manual Workflow Start' },
        { value: 'segment_based', label: 'Client Segment' },
        { value: 'campaign_based', label: 'Marketing Campaign' },
      ],
    },
  ];
  
  const handleToggleWorkflow = (id: string, enabled: boolean) => {
    setWorkflows(
      workflows.map((wf) => (wf.id === id ? { ...wf, enabled } : wf))
    );
  };
  
  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowForm({
      name: workflow.name,
      description: workflow.description,
      trigger: workflow.trigger.id,
    });
    setShowWorkflowDialog(true);
  };
  
  const handleCreateNewWorkflow = () => {
    setSelectedWorkflow(null);
    setWorkflowForm({
      name: '',
      description: '',
      trigger: '',
    });
    setShowWorkflowDialog(true);
  };
  
  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter((wf) => wf.id !== id));
  };
  
  const handleSaveWorkflow = () => {
    // Here we would typically save to the backend
    // For now, we'll just update the local state
    if (selectedWorkflow) {
      // Update existing workflow
      setWorkflows(
        workflows.map((wf) =>
          wf.id === selectedWorkflow.id
            ? {
                ...wf,
                name: workflowForm.name,
                description: workflowForm.description,
                updatedAt: new Date().toISOString(),
              }
            : wf
        )
      );
    } else {
      // Create new workflow
      const newWorkflow: Workflow = {
        id: `wf${workflows.length + 1}`,
        name: workflowForm.name,
        description: workflowForm.description,
        enabled: false,
        trigger: {
          id: workflowForm.trigger || 'manual_start',
          name: 'Manual Trigger',
          type: 'manual',
          description: 'Manually triggered workflow',
          icon: 'manualTrigger',
        },
        steps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setWorkflows([...workflows, newWorkflow]);
    }
    setShowWorkflowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marketing Automation</h2>
          <p className="text-muted-foreground">
            Build automated workflows to engage clients and streamline marketing tasks
          </p>
        </div>
        <Button onClick={handleCreateNewWorkflow} className="gap-1.5">
          <Plus size={16} />
          <span>Create Workflow</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>
            Automated sequences that run based on triggers and conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Workflow Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => {
                const TriggerIcon = triggerIcons[workflow.trigger.icon] || Circle;
                return (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{workflow.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {workflow.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-secondary">
                          <TriggerIcon className="h-3.5 w-3.5" />
                        </div>
                        <span>{workflow.trigger.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workflow.steps.length}</span>
                        <div className="flex items-center gap-0.5">
                          {workflow.steps.slice(0, 3).map((step, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                "rounded-sm px-1 py-0 text-[10px] font-normal",
                                step.type === 'email' && "bg-blue-50 text-blue-700 border-blue-200",
                                step.type === 'sms' && "bg-green-50 text-green-700 border-green-200",
                                step.type === 'task' && "bg-amber-50 text-amber-700 border-amber-200",
                                step.type === 'wait' && "bg-purple-50 text-purple-700 border-purple-200",
                                step.type === 'condition' && "bg-indigo-50 text-indigo-700 border-indigo-200"
                              )}
                            >
                              {step.type}
                            </Badge>
                          ))}
                          {workflow.steps.length > 3 && (
                            <Badge variant="outline" className="rounded-sm px-1 py-0 text-[10px] font-normal">
                              +{workflow.steps.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.enabled}
                          onCheckedChange={(enabled) => handleToggleWorkflow(workflow.id, enabled)}
                        />
                        <span className={workflow.enabled ? "text-green-600" : "text-neutral-500"}>
                          {workflow.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSelectWorkflow(workflow)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newWorkflow = { ...workflow };
                            newWorkflow.id = `wf${workflows.length + 1}`;
                            newWorkflow.name = `${workflow.name} (Copy)`;
                            setWorkflows([...workflows, newWorkflow]);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkflow
                ? 'Update your automation workflow settings'
                : 'Set up a new automated marketing workflow'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workflow Name*</Label>
              <Input
                id="name"
                value={workflowForm.name}
                onChange={(e) =>
                  setWorkflowForm({ ...workflowForm, name: e.target.value })
                }
                placeholder="E.g., New Client Welcome Sequence"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={workflowForm.description}
                onChange={(e) =>
                  setWorkflowForm({ ...workflowForm, description: e.target.value })
                }
                placeholder="Briefly describe the purpose of this workflow"
              />
            </div>

            {!selectedWorkflow && (
              <div className="grid gap-2">
                <Label htmlFor="trigger">Trigger Event*</Label>
                <Select
                  value={workflowForm.trigger}
                  onValueChange={(value) =>
                    setWorkflowForm({ ...workflowForm, trigger: value })
                  }
                >
                  <SelectTrigger id="trigger">
                    <SelectValue placeholder="Select a trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map((group) => (
                      <div key={group.id}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {group.name}
                        </div>
                        {group.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This event will trigger the start of your workflow
                </p>
              </div>
            )}
            
            {selectedWorkflow && selectedWorkflow.steps.length > 0 && (
              <div className="mt-2">
                <Label className="mb-2 block">Workflow Steps</Label>
                <div className="border rounded-md p-3 bg-secondary/20">
                  <div className="space-y-4">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-full bg-secondary text-primary">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">{step.description}</div>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-sm",
                            step.type === 'email' && "bg-blue-50 text-blue-700 border-blue-200",
                            step.type === 'sms' && "bg-green-50 text-green-700 border-green-200",
                            step.type === 'task' && "bg-amber-50 text-amber-700 border-amber-200",
                            step.type === 'wait' && "bg-purple-50 text-purple-700 border-purple-200",
                            step.type === 'condition' && "bg-indigo-50 text-indigo-700 border-indigo-200"
                          )}
                        >
                          {step.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" className="gap-1.5" disabled>
                      <Edit size={14} />
                      <span>Edit Steps</span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  To edit workflow steps in detail, use the full workflow editor
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSaveWorkflow}
              disabled={!workflowForm.name}
              className="gap-1"
            >
              <Save size={16} />
              {selectedWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
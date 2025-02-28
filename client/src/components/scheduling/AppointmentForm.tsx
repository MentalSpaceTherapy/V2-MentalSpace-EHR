import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { SESSION_TYPES, SESSION_MEDIUMS, SESSION_STATUS } from "@/lib/constants";

// Mock client data
const mockClients = [
  { id: 1, name: "Emma Wilson" },
  { id: 2, name: "Michael Chen" },
  { id: 3, name: "Sophie Garcia" },
  { id: 4, name: "Alex Johnson" },
  { id: 5, name: "Jamie Rodriguez" },
  { id: 6, name: "Robert Miller" },
  { id: 7, name: "Maria Lopez" },
  { id: 8, name: "David Thompson" },
  { id: 9, name: "Rebecca Taylor" },
  { id: 10, name: "John Smith" },
];

// Mock service codes
const mockServiceCodes = [
  { id: 1, code: "90791", description: "Psychiatric Diagnostic Evaluation, 50 min" },
  { id: 2, code: "90832", description: "Psychotherapy, 30 min" },
  { id: 3, code: "90834", description: "Psychotherapy, 45 min" },
  { id: 4, code: "90837", description: "Psychotherapy, 60 min" },
  { id: 5, code: "90846", description: "Family Psychotherapy without patient, 45 min" },
  { id: 6, code: "90847", description: "Family Psychotherapy with patient, 45 min" },
  { id: 7, code: "90853", description: "Group Psychotherapy, 75 min" },
];

// Mock locations
const mockLocations = [
  { id: 1, name: "Main Office" },
  { id: 2, name: "Downtown Clinic" },
  { id: 3, name: "HIPAA Compliant Telehealth Platform" },
  { id: 4, name: "Home Visit" },
];

// Mock frequency options
const frequencyOptions = [
  "One time",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Every 3 months"
];

// Form schema
const appointmentFormSchema = z.object({
  appointmentType: z.string().min(1, "Please select an appointment type"),
  patientId: z.string().min(1, "Please select a patient"),
  clinicianName: z.string().min(1, "Clinician name is required"),
  location: z.string().min(1, "Please select a location"),
  useTelehealth: z.boolean().optional(),
  serviceCode: z.string().min(1, "Please select a service code"),
  scheduledDate: z.string().min(1, "Please enter a date"),
  scheduledTime: z.string().min(1, "Please enter a time"),
  duration: z.string().min(1, "Please enter a duration"),
  frequency: z.string().default("One time"),
  alert: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Component props
interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialDate?: Date;
  initialTimeSlot?: {
    date: Date;
    time: string;
  };
}

export function AppointmentForm({ open, onOpenChange, onSubmit, initialDate, initialTimeSlot }: AppointmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert 24-hour format time to 12-hour format with AM/PM for display
  const formatTimeFor12Hour = (time: string) => {
    if (!time) return "09:00 AM";
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    
    if (hour === 0) return `12:${minutes || '00'} AM`;
    if (hour < 12) return `${hour}:${minutes || '00'} AM`;
    if (hour === 12) return `12:${minutes || '00'} PM`;
    return `${hour - 12}:${minutes || '00'} PM`;
  };

  // Form initialization
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: "Therapy Session",
      patientId: "",
      clinicianName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Brenda Jean-Baptiste",
      location: "HIPAA Compliant Telehealth Platform",
      useTelehealth: false,
      serviceCode: "90834: Psychotherapy, 45 min",
      scheduledDate: initialTimeSlot?.date 
        ? format(initialTimeSlot.date, "MM/dd/yyyy") 
        : initialDate 
          ? format(initialDate, "MM/dd/yyyy") 
          : format(new Date(), "MM/dd/yyyy"),
      scheduledTime: initialTimeSlot?.time 
        ? formatTimeFor12Hour(initialTimeSlot.time)
        : "09:00 AM",
      duration: "45",
      frequency: "One time",
      alert: ""
    }
  });

  const handleFormSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert form data to the format expected by the parent component
      const formattedData = {
        clientId: data.patientId,
        date: new Date(data.scheduledDate),
        startTime: data.scheduledTime,
        duration: `${data.duration} minutes`,
        sessionType: data.appointmentType,
        medium: data.location.includes("Telehealth") ? "Telehealth" : "In-person",
        status: "Scheduled",
        notes: data.alert || ""
      };
      
      // Process the data, in a real app we would submit to the backend
      onSubmit(formattedData);
      
      toast({
        title: "Appointment scheduled",
        description: `${data.appointmentType} with ${mockClients.find(c => c.id.toString() === data.patientId)?.name || "Patient"} on ${data.scheduledDate} at ${data.scheduledTime}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error scheduling the appointment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Appointment</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Appointment Type */}
            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SESSION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Patient */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient:</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Name or ID of existing patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockClients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" className="bg-blue-500 hover:bg-blue-600">
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Clinician */}
            <FormField
              control={form.control}
              name="clinicianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinician:</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="bg-neutral-50"
                      />
                    </FormControl>
                    <X className="h-4 w-4 text-neutral-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location:</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="bg-neutral-50"
                      />
                    </FormControl>
                    <X className="h-4 w-4 text-neutral-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Telehealth Option */}
            <FormField
              control={form.control}
              name="useTelehealth"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Use TherapyNotes Telehealth
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Service Code */}
            <FormField
              control={form.control}
              name="serviceCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Code:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service code" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockServiceCodes.map(service => (
                        <SelectItem key={service.id} value={`${service.code}: ${service.description}`}>
                          {service.code}: {service.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Scheduled Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Time:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MM/DD/YYYY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <Label className="mb-2">at</Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="h:mm am"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration:</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="w-24"
                      />
                    </FormControl>
                    <span className="text-neutral-500">minutes</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Frequency */}
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Appointment Alert */}
            <FormField
              control={form.control}
              name="alert"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Alert:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special instructions or alerts for this appointment..."
                      {...field}
                      className="min-h-[80px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-lime-500 hover:bg-lime-600"
              >
                {isSubmitting ? "Scheduling..." : "Save New Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
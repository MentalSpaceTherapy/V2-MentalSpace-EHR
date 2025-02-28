import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, addHours, parse, setHours, setMinutes } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Video, Building, Save, X } from "lucide-react";
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

// Form schema
const appointmentFormSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  duration: z.string().min(1, "Please select a duration"),
  sessionType: z.string().min(1, "Please select a session type"),
  medium: z.string().min(1, "Please select a session medium"),
  status: z.string().default("Scheduled"),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Component props
interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AppointmentFormValues) => void;
  initialDate?: Date;
}

export function AppointmentForm({ open, onOpenChange, onSubmit, initialDate }: AppointmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time options
  const timeOptions = Array.from({ length: 24 }, (_, hour) => {
    // Morning times (8:00 AM to 11:30 AM)
    if (hour >= 8 && hour < 12) {
      return [
        `${hour}:00 AM`,
        `${hour}:15 AM`,
        `${hour}:30 AM`,
        `${hour}:45 AM`
      ];
    }
    // Noon (12:00 PM to 12:45 PM)
    else if (hour === 12) {
      return [
        "12:00 PM",
        "12:15 PM",
        "12:30 PM",
        "12:45 PM"
      ];
    }
    // Afternoon/Evening times (1:00 PM to 7:45 PM)
    else if (hour >= 13 && hour < 20) {
      const pmHour = hour - 12;
      return [
        `${pmHour}:00 PM`,
        `${pmHour}:15 PM`,
        `${pmHour}:30 PM`,
        `${pmHour}:45 PM`
      ];
    }
    return [];
  }).flat();

  // Duration options
  const durationOptions = [
    "30 minutes",
    "45 minutes",
    "50 minutes",
    "60 minutes",
    "75 minutes",
    "90 minutes",
    "120 minutes"
  ];

  // Form initialization
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      clientId: "",
      date: initialDate || new Date(),
      startTime: "9:00 AM",
      duration: "50 minutes",
      sessionType: SESSION_TYPES[0],
      medium: SESSION_MEDIUMS[0],
      status: "Scheduled",
      notes: ""
    }
  });

  const handleFormSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Calculate end time based on start time and duration
      const startTimeParts = data.startTime.split(/[: ]/);
      let hours = parseInt(startTimeParts[0], 10);
      const minutes = parseInt(startTimeParts[1], 10);
      const isPM = data.startTime.includes("PM") && hours < 12;
      
      if (isPM) {
        hours += 12;
      } else if (hours === 12 && data.startTime.includes("AM")) {
        hours = 0;
      }
      
      // Set the appointment date with correct time
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Parse duration to get minutes
      const durationMinutes = parseInt(data.duration.split(" ")[0], 10);
      
      // Calculate end time
      const endTime = new Date(appointmentDate.getTime() + durationMinutes * 60000);
      
      // Process the data, in a real app we would submit to the backend
      onSubmit({
        ...data,
        // Ensure we're using the date with the correct time
        date: appointmentDate
      });
      
      toast({
        title: "Appointment scheduled",
        description: `Appointment with ${mockClients.find(c => c.id.toString() === data.clientId)?.name} on ${format(appointmentDate, "MMMM d, yyyy")} at ${data.startTime}`,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for a client. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Client Selection */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              "pl-3 text-left font-normal flex justify-between items-center"
                            }
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map(duration => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Session Type */}
              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
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
              
              {/* Medium */}
              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Medium</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="flex items-center">
                          {field.value === "Telehealth" ? (
                            <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          )}
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SESSION_MEDIUMS.map(medium => (
                          <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SESSION_STATUS.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Notes */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes or preparation instructions for this appointment..."
                          {...field}
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Scheduling...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
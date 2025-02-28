import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Video, Building, Plus, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AppointmentForm } from "@/components/scheduling/AppointmentForm";
import { SetCalendarViewDialog, type CalendarViewSettings } from "@/components/scheduling/SetCalendarViewDialog";

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

// Mock appointment data
const mockAppointments = [
  {
    id: 1,
    clientName: "Emma Wilson",
    date: new Date(),
    startTime: "09:30",
    endTime: "10:20",
    type: "Individual Therapy",
    medium: "Telehealth",
    status: "Confirmed"
  },
  {
    id: 2,
    clientName: "Michael Chen",
    date: new Date(),
    startTime: "11:00",
    endTime: "11:50",
    type: "CBT Session",
    medium: "In-person",
    status: "Confirmed"
  },
  {
    id: 3,
    clientName: "Sophie Garcia",
    date: new Date(),
    startTime: "13:30",
    endTime: "14:50",
    type: "Family Therapy",
    medium: "Telehealth",
    status: "Pending"
  },
  {
    id: 4,
    clientName: "Alex Johnson",
    date: new Date(),
    startTime: "15:15",
    endTime: "16:05",
    type: "Individual Therapy",
    medium: "Telehealth",
    status: "Confirmed"
  },
  {
    id: 5,
    clientName: "Jamie Rodriguez",
    date: addDays(new Date(), 1),
    startTime: "10:00",
    endTime: "10:50",
    type: "Intake Assessment",
    medium: "Telehealth",
    status: "Confirmed"
  },
  {
    id: 6,
    clientName: "Robert Miller",
    date: addDays(new Date(), 1),
    startTime: "14:00",
    endTime: "14:50",
    type: "Individual Therapy",
    medium: "In-person",
    status: "Confirmed"
  },
  {
    id: 7,
    clientName: "Maria Lopez",
    date: addDays(new Date(), 2),
    startTime: "09:00",
    endTime: "09:50",
    type: "Individual Therapy",
    medium: "Telehealth",
    status: "Confirmed"
  },
  {
    id: 8,
    clientName: "David Thompson",
    date: addDays(new Date(), 3),
    startTime: "11:30",
    endTime: "12:20",
    type: "CBT Session",
    medium: "In-person",
    status: "Pending"
  }
];

const getTimeslotBackground = (status: string) => {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 border-green-200 text-green-800";
    case "Pending":
      return "bg-yellow-100 border-yellow-200 text-yellow-800";
    case "Cancelled":
      return "bg-red-100 border-red-200 text-red-800";
    default:
      return "bg-neutral-100 border-neutral-200 text-neutral-800";
  }
};

export default function Scheduling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);

  // Generate time slots for the schedule
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i; // Start at 8 AM
    return hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`;
  });

  // Generate days for week view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as start of week
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(app => isSameDay(app.date, date));
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const navigatePrevious = () => {
    if (view === "day") {
      setSelectedDate(subDays(selectedDate, 1));
    } else if (view === "week") {
      setSelectedDate(subWeeks(selectedDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === "day") {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (view === "week") {
      setSelectedDate(addWeeks(selectedDate, 1));
    }
  };

  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  
  const handleScheduleAppointment = () => {
    setIsAppointmentFormOpen(true);
  };
  
  // Type definition for the appointment form data
  type AppointmentFormData = {
    clientId: string;
    date: Date;
    startTime: string;
    duration: string;
    sessionType: string;
    medium: string;
    status: string;
    notes?: string;
  };
  
  const handleCreateAppointment = (formData: AppointmentFormData) => {
    // Generate a unique ID for the new appointment
    const newId = Math.max(...appointments.map(a => a.id)) + 1;
    
    // Extract hours and minutes from the time
    const startTimeMatch = formData.startTime.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!startTimeMatch || startTimeMatch.length < 4) {
      toast({
        title: "Invalid time format",
        description: "The time format is invalid. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    const hours = parseInt(startTimeMatch[1]);
    const minutes = parseInt(startTimeMatch[2]);
    const period = startTimeMatch[3];
    
    // Calculate duration in minutes
    const durationInMinutes = parseInt(formData.duration.split(' ')[0]);
    
    // Calculate end time (adding duration to start time)
    const startDate = new Date(formData.date);
    let startHours = hours;
    if (period === "PM" && hours < 12) startHours += 12;
    if (period === "AM" && hours === 12) startHours = 0;
    
    startDate.setHours(startHours, minutes);
    
    const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);
    
    // Format start and end times for display
    const startTimeFormatted = formData.startTime;
    const endTimeFormatted = format(endDate, "h:mm a").toUpperCase();
    
    // Create the new appointment object
    const newAppointment = {
      id: newId,
      clientName: mockClients.find(c => c.id.toString() === formData.clientId)?.name || "Unknown Client",
      date: formData.date,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      type: formData.sessionType,
      medium: formData.medium,
      status: formData.status
    };
    
    // Add the new appointment to the state
    setAppointments([...appointments, newAppointment]);
    
    toast({
      title: "Appointment Scheduled",
      description: `${newAppointment.type} with ${newAppointment.clientName} on ${format(newAppointment.date, "MMMM d")} at ${newAppointment.startTime}`,
    });
  };

  const handleAppointmentClick = (appointment: typeof mockAppointments[0]) => {
    toast({
      title: `${appointment.clientName} - ${appointment.type}`,
      description: `${format(appointment.date, "EEEE, MMMM d")} at ${appointment.startTime} (${appointment.medium})`,
    });
  };

  const handleConfirmAppointment = (appointmentId: number) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId ? { ...app, status: "Confirmed" } : app
    ));
    
    toast({
      title: "Appointment Confirmed",
      description: "The appointment has been confirmed.",
    });
  };

  const handleCancelAppointment = (appointmentId: number) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId ? { ...app, status: "Cancelled" } : app
    ));
    
    toast({
      title: "Appointment Cancelled",
      description: "The appointment has been cancelled.",
    });
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  const [isCalendarViewDialogOpen, setIsCalendarViewDialogOpen] = useState(false);
  const [calendarViewSettings, setCalendarViewSettings] = useState<CalendarViewSettings>({
    selectedClinicians: [9], // Default to Brenda Jean-Baptiste
    location: "All Locations",
    clinicianType: "All Clinicians",
    hideInactiveClinicians: true,
    hideMissedCancelled: false,
    showPatientInitials: true
  });
  
  const handleCalendarViewChange = (settings: CalendarViewSettings) => {
    setCalendarViewSettings(settings);
    // In a real app, this would filter appointments by clinician, etc.
  };
  
  const getMonthName = (date: Date) => {
    return format(date, "MMMM");
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Scheduling" />
        
        {/* Appointment Form Dialog */}
        <AppointmentForm 
          open={isAppointmentFormOpen}
          onOpenChange={setIsAppointmentFormOpen}
          onSubmit={handleCreateAppointment}
          initialDate={selectedDate}
        />
        
        {/* Calendar View Settings Dialog */}
        <SetCalendarViewDialog
          open={isCalendarViewDialogOpen}
          onOpenChange={setIsCalendarViewDialogOpen}
          onViewChange={handleCalendarViewChange}
        />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">
              {view === "week" 
                ? `Week of ${format(weekStart, "MMMM d, yyyy")}`
                : `${getMonthName(selectedDate)} ${format(selectedDate, "d")}, ${format(selectedDate, "yyyy")}`
              }
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCalendarViewDialogOpen(true)}
              >
                Set Calendar View
              </Button>
              <Button 
                onClick={handleScheduleAppointment}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>
          
          {/* Calendar Navigation */}
          <Card>
            <CardHeader className="pb-2 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={navigatePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium ml-2">
                    Week of {format(weekStart, "MMMM d, yyyy")}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    for Brenda Jean-Baptiste
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="text-gray-500">
                    Print
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-500"
                  >
                    Agenda
                  </Button>
                  <Button 
                    variant={view === "day" ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => setView("day")}
                  >
                    Day
                  </Button>
                  <Button 
                    variant={view === "week" ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => setView("week")}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={view === "month" ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => setView("month")}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {view === "day" ? (
                <div className="p-4">
                  <h2 className="text-xl font-medium mb-4">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
                  
                  {getAppointmentsForDay(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getAppointmentsForDay(selectedDate)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(appointment => (
                          <div 
                            key={appointment.id}
                            className={cn("p-3 border rounded-md cursor-pointer hover:shadow-sm transition-shadow", 
                              getTimeslotBackground(appointment.status)
                            )}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-neutral-700" />
                                  <span className="font-medium">
                                    {appointment.startTime} - {appointment.endTime}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold mt-1">{appointment.clientName}</h3>
                                <div className="flex items-center mt-1 text-sm">
                                  {appointment.medium === "Telehealth" ? (
                                    <Video className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Building className="h-3 w-3 mr-1" />
                                  )}
                                  <span>{appointment.medium} - {appointment.type}</span>
                                </div>
                              </div>
                              
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", {
                                  "bg-green-100 text-green-800 hover:bg-green-100": appointment.status === "Confirmed",
                                  "bg-yellow-100 text-yellow-800 hover:bg-yellow-100": appointment.status === "Pending",
                                  "bg-red-100 text-red-800 hover:bg-red-100": appointment.status === "Cancelled"
                                })}
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                            
                            {appointment.status === "Pending" && (
                              <div className="flex justify-end mt-2 gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmAppointment(appointment.id);
                                  }}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelAppointment(appointment.id);
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-500">
                      No appointments scheduled for this day.
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-4 border-r bg-neutral-50"></div>
                      {weekDays.map((day, i) => (
                        <div 
                          key={i} 
                          className={cn("p-4 text-center border-r", {
                            "bg-primary-50": isSameDay(day, new Date())
                          })}
                        >
                          <div className="font-medium">{format(day, "EEE")}</div>
                          <div className={cn("text-2xl", {
                            "text-primary-600 font-semibold": isSameDay(day, new Date())
                          })}>
                            {format(day, "d")}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {timeSlots.map((timeSlot, i) => (
                      <div key={i} className="grid grid-cols-8 border-b">
                        <div className="p-2 border-r bg-neutral-50 text-xs text-neutral-500 text-right">
                          {timeSlot}
                        </div>
                        
                        {weekDays.map((day, dayIndex) => {
                          const dayAppointments = getAppointmentsForDay(day);
                          const hourAppointments = dayAppointments.filter(app => {
                            const appHour = parseInt(app.startTime.split(":")[0], 10);
                            const slotHour = parseInt(timeSlot.split(":")[0], 10) + (timeSlot.includes("PM") && timeSlot.split(":")[0] !== "12" ? 12 : 0);
                            return appHour === slotHour;
                          });
                          
                          return (
                            <div key={dayIndex} className="p-1 border-r min-h-[60px] relative">
                              {hourAppointments.map(app => (
                                <div 
                                  key={app.id}
                                  className={cn("p-1 text-xs rounded mb-1 border cursor-pointer", 
                                    getTimeslotBackground(app.status)
                                  )}
                                  onClick={() => handleAppointmentClick(app)}
                                >
                                  <div className="font-medium">{app.startTime} - {app.clientName}</div>
                                  <div className="flex items-center mt-0.5">
                                    {app.medium === "Telehealth" ? (
                                      <Video className="h-3 w-3 mr-0.5" />
                                    ) : (
                                      <Building className="h-3 w-3 mr-0.5" />
                                    )}
                                    <span>{app.type}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Filter, 
  MapPin, 
  PlusCircle, 
  RefreshCw, 
  Users,
  Video,
  UserPlus
} from "lucide-react";
import { useCRM } from "@/hooks/use-crm";
import { format } from "date-fns";

export default function CRMEvents() {
  const { events, addEvent, deleteEvent, selectedTimeRange, setSelectedTimeRange } = useCRM();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Time range options
  const timeRangeOptions = {
    "week": "This Week",
    "month": "This Month",
    "quarter": "This Quarter",
    "year": "This Year"
  };
  
  // Separate events into categories based on status
  const upcomingEvents = events.filter(event => 
    event.status === "Upcoming"
  );
  
  const inProgressEvents = events.filter(event => 
    event.status === "In Progress"
  );
  
  const pastEvents = events.filter(event => 
    event.status === "Completed" || event.status === "Cancelled"
  );
  
  // Function to render appropriate icon based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "Webinar":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "Workshop":
        return <Users className="h-5 w-5 text-green-500" />;
      case "Conference":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "Open House":
        return <MapPin className="h-5 w-5 text-amber-500" />;
      case "Group Session":
        return <UserPlus className="h-5 w-5 text-indigo-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Function to get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "In Progress":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Completed":
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Events & Webinars" />
        
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Events & Webinars</h1>
              <p className="text-neutral-500 mt-1">
                Plan, promote, and manage events and webinars for your practice
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Event</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs gap-1.5"
                onClick={() => {
                  // Cycle through time ranges
                  const ranges: ("week" | "month" | "quarter" | "year")[] = ["week", "month", "quarter", "year"];
                  const currentIndex = ranges.indexOf(selectedTimeRange);
                  const nextIndex = (currentIndex + 1) % ranges.length;
                  setSelectedTimeRange(ranges[nextIndex]);
                }}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{timeRangeOptions[selectedTimeRange]}</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="upcoming" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="space-y-6"
          >
            <TabsList className="bg-neutral-100 p-1">
              <TabsTrigger 
                value="upcoming" 
                className="text-sm"
                data-count={upcomingEvents.length}
              >
                Upcoming Events
                <span className="ml-2 bg-primary-100 text-primary-800 rounded-full py-0.5 px-2 text-xs">
                  {upcomingEvents.length}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="inProgress" 
                className="text-sm"
                data-count={inProgressEvents.length}
              >
                In Progress
                <span className="ml-2 bg-green-100 text-green-800 rounded-full py-0.5 px-2 text-xs">
                  {inProgressEvents.length}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="text-sm"
                data-count={pastEvents.length}
              >
                Past Events
                <span className="ml-2 bg-neutral-100 text-neutral-800 rounded-full py-0.5 px-2 text-xs">
                  {pastEvents.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          {getEventIcon(event.type)}
                          <Badge 
                            variant="outline" 
                            className={getStatusBadgeClass(event.status)}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{event.name}</CardTitle>
                        <CardDescription>{event.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>
                              {event.registered} / {event.capacity} registered
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Edit
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                  <h2 className="text-xl font-medium mb-3">No Upcoming Events</h2>
                  <p className="text-neutral-500 max-w-md mx-auto mb-6">
                    Create a new event or webinar to engage with your clients and grow your practice.
                  </p>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inProgress" className="space-y-6">
              {inProgressEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          {getEventIcon(event.type)}
                          <Badge 
                            variant="outline" 
                            className={getStatusBadgeClass(event.status)}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{event.name}</CardTitle>
                        <CardDescription>{event.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>
                              {event.registered} / {event.capacity} registered
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Edit
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                  <h2 className="text-xl font-medium mb-3">No Events In Progress</h2>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    There are currently no events or webinars in progress.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-6">
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          {getEventIcon(event.type)}
                          <Badge 
                            variant="outline" 
                            className={getStatusBadgeClass(event.status)}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{event.name}</CardTitle>
                        <CardDescription>{event.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>
                              {event.attended || 0} / {event.registered} attended
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          View Report
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Duplicate
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                  <h2 className="text-xl font-medium mb-3">No Past Events</h2>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    You haven't conducted any events or webinars yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
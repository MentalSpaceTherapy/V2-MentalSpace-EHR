import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  Settings,
  User,
  UserPlus,
  Shield,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  MonitorPlay,
  CircleSlash,
  ScreenShare,
  Lock,
  Copy,
  Clipboard,
  Bell,
  BellRing,
  AlertCircle
} from "lucide-react";

import VideoCall from "@/components/telehealth/VideoCall";
import VideoControls from "@/components/telehealth/VideoControls";
import WaitingRoom from "@/components/telehealth/WaitingRoom";
import SessionNotes from "@/components/telehealth/SessionNotes";
import EncryptionBanner from "@/components/telehealth/EncryptionBanner";

// Mock data for upcoming sessions
const upcomingSessions = [
  {
    id: 1,
    clientName: "John Doe",
    clientId: 101,
    scheduledStartTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    duration: 50,
    sessionType: "Individual Therapy",
    status: "scheduled"
  },
  {
    id: 2,
    clientName: "Jane Smith",
    clientId: 102,
    scheduledStartTime: new Date(new Date().setHours(new Date().getHours() + 3)),
    duration: 50,
    sessionType: "CBT Session",
    status: "scheduled"
  },
  {
    id: 3,
    clientName: "Michael Johnson",
    clientId: 103,
    scheduledStartTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    duration: 50,
    sessionType: "Family Therapy",
    status: "scheduled"
  }
];

export default function Telehealth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("upcoming");
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isInSession, setIsInSession] = useState(false);
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  const [providerConnected, setProviderConnected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("zoom");
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [sessionNotes, setSessionNotes] = useState("");
  
  // For video call states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [callTime, setCallTime] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    // Reset session state when leaving active session
    return () => {
      if (isInSession) {
        handleEndCall();
      }
    };
  }, []);
  
  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInSession && !isWaitingRoom) {
      timer = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInSession, isWaitingRoom]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatSessionTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  const formatSessionDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleStartSession = (session: any) => {
    setActiveSession(session);
    setIsConnecting(true);
    
    // Simulate connecting to video provider
    setTimeout(() => {
      setIsConnecting(false);
      setIsInSession(true);
      setIsWaitingRoom(true);
      setParticipants(["Therapist (You)"]);
      
      toast({
        title: "Session Started",
        description: `You've joined the waiting room for ${session.clientName}.`,
      });
    }, 2000);
  };
  
  const handleAdmitClient = () => {
    setIsWaitingRoom(false);
    setParticipants(["Therapist (You)", activeSession.clientName]);
    
    toast({
      title: "Client Admitted",
      description: `${activeSession.clientName} has joined the session.`,
    });
  };
  
  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
  };
  
  const handleToggleVideo = () => {
    setIsVideoMuted(!isVideoMuted);
  };
  
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    
    if (!isScreenSharing) {
      toast({
        title: "Screen Sharing",
        description: "You are now sharing your screen."
      });
    }
  };
  
  const handleEndCall = () => {
    // Show confirmation dialog if in active session
    if (isInSession && !isWaitingRoom) {
      const confirmEnd = window.confirm("Are you sure you want to end this session?");
      if (!confirmEnd) return;
    }
    
    setIsInSession(false);
    setIsWaitingRoom(false);
    setCallTime(0);
    setSessionNotes("");
    setParticipants([]);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
    
    if (activeSession) {
      toast({
        title: "Session Ended",
        description: `Your session with ${activeSession.clientName} has ended.`,
      });
      setActiveSession(null);
    }
  };
  
  const handleSaveNotes = () => {
    if (!sessionNotes.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please enter session notes before saving.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate saving notes
    toast({
      title: "Notes Saved",
      description: "Your session notes have been saved successfully."
    });
  };
  
  const handleConnectProvider = () => {
    setIsConnecting(true);
    
    // Simulate connecting to the provider
    setTimeout(() => {
      setProviderConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Provider Connected",
        description: `Successfully connected to ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}.`,
      });
    }, 2000);
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  // If in an active session, show the telehealth interface
  if (isInSession) {
    return (
      <div className="h-screen flex flex-col bg-neutral-900">
        {/* Encryption Notice */}
        <EncryptionBanner enabled={encryptionEnabled} />
        
        {/* Main video area */}
        <div className="flex-1 flex">
          {isWaitingRoom ? (
            <WaitingRoom 
              session={activeSession}
              onAdmitClient={handleAdmitClient}
              onEndSession={handleEndCall}
            />
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative">
                <VideoCall 
                  isVideoMuted={isVideoMuted}
                  isScreenSharing={isScreenSharing}
                  clientName={activeSession.clientName}
                />
              </div>
              
              {/* Session info bar */}
              <div className="bg-neutral-800 text-white py-2 px-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatTime(callTime)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="bg-neutral-700">
                    <Lock className="h-3 w-3 mr-1" />
                    End-to-End Encrypted
                  </Badge>
                  <Badge variant="outline" className="bg-neutral-700">
                    <Users className="h-3 w-3 mr-1" />
                    {participants.length} Participants
                  </Badge>
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView(activeView === "call" ? "notes" : "call")}>
                    {activeView === "call" ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Session Notes
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Return to Call
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Controls */}
              <VideoControls 
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                isScreenSharing={isScreenSharing}
                onToggleAudio={handleToggleAudio}
                onToggleVideo={handleToggleVideo}
                onToggleScreenShare={handleToggleScreenShare}
                onEndCall={handleEndCall}
              />
            </div>
          )}
          
          {/* Side panel - only show when not in waiting room */}
          {!isWaitingRoom && activeView === "notes" && (
            <div className="w-96 bg-white border-l border-neutral-200 flex flex-col">
              <SessionNotes 
                session={activeSession}
                notes={sessionNotes}
                onChange={setSessionNotes}
                onSave={handleSaveNotes}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main telehealth dashboard
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Telehealth" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Provider Connection Status */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">Telehealth Provider</CardTitle>
                  <CardDescription>
                    Connect to a telehealth provider to start secure video sessions
                  </CardDescription>
                </div>
                {providerConnected && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Connected
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {!providerConnected ? (
                  <>
                    <div className="mb-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Not Connected</AlertTitle>
                        <AlertDescription>
                          You need to connect to a telehealth provider before you can start video sessions.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="provider">Select Provider</Label>
                        <Select
                          value={selectedProvider}
                          onValueChange={setSelectedProvider}
                        >
                          <SelectTrigger id="provider">
                            <SelectValue placeholder="Select Provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom for Healthcare</SelectItem>
                            <SelectItem value="doxy">Doxy.me</SelectItem>
                            <SelectItem value="teladoc">Teladoc</SelectItem>
                            <SelectItem value="vsee">VSee</SelectItem>
                            <SelectItem value="mentalspace">MentalSpace Telehealth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="encryption">End-to-End Encryption</Label>
                        <div className="flex items-center pt-2">
                          <Switch
                            id="encryption"
                            checked={encryptionEnabled}
                            onCheckedChange={setEncryptionEnabled}
                          />
                          <Label htmlFor="encryption" className="ml-2">
                            {encryptionEnabled ? "Enabled" : "Disabled"}
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleConnectProvider} 
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>Connecting...</>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Connect Provider
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-neutral-50">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="font-medium text-center">End-to-End Encryption</p>
                        <p className="text-sm text-neutral-500 text-center mt-1">Enabled</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-neutral-50">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                          <Video className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="font-medium text-center">Provider</p>
                        <p className="text-sm text-neutral-500 text-center mt-1">
                          {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-neutral-50">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                          <UserPlus className="h-6 w-6 text-amber-600" />
                        </div>
                        <p className="font-medium text-center">Max Participants</p>
                        <p className="text-sm text-neutral-500 text-center mt-1">25 participants</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setProviderConnected(false)}>
                        <CircleSlash className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Provider Settings
                      </Button>
                      <Button>
                        <MonitorPlay className="h-4 w-4 mr-2" />
                        Test Video Call
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full justify-start" disabled={!providerConnected}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Start Instant Meeting
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Manage Notifications
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Video Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Telehealth Sessions</CardTitle>
              <CardDescription>
                Sessions scheduled for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500">No upcoming sessions</p>
                  <Button className="mt-4" variant="outline">
                    Schedule a Session
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id} className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span>{session.clientName}</span>
                          <Badge className="ml-2">{session.sessionType}</Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatSessionDate(session.scheduledStartTime)}
                        </CardDescription>
                        <CardDescription className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatSessionTime(session.scheduledStartTime)} • {session.duration} minutes
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <Button 
                          className="w-full" 
                          onClick={() => handleStartSession(session)}
                          disabled={!providerConnected || isConnecting}
                        >
                          {isConnecting ? (
                            "Connecting..."
                          ) : (
                            <>
                              <Video className="h-4 w-4 mr-2" />
                              Start Session
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
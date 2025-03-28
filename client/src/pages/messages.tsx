import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MoreVertical, Loader2, Plus, Calendar, MessageSquarePlus, FileText, 
         UserRound, FileSpreadsheet, Clipboard, CheckCircle, Clock, Eye, AlertCircle, Trash2, 
         ChevronDown, Bookmark, MailQuestion, Archive, Bell, Settings } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, Client } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
         DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


// Client type with additional fields for UI
interface MessageClient {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
  unanswered?: boolean;
  dateOfBirth?: Date | null;
  phone?: string | null;
}

// Message type adjusted for UI
interface DisplayMessage {
  id: number;
  text: string;
  subject?: string;
  category?: string;
  sender: "client" | "therapist";
  timestamp: Date;
  isRead: boolean;
  attachments?: any[];
}

// Message types/categories
type MessageCategory = "Clinical" | "Billing" | "Administrative";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [filterOption, setFilterOption] = useState<string>("all"); // "all", "unread", "unanswered"
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // "all", "Clinical", "Billing", "Administrative"
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [hoverClientId, setHoverClientId] = useState<number | null>(null);
  const [newMessageData, setNewMessageData] = useState({
    clientId: "",
    subject: "",
    content: "",
    category: "Clinical" as MessageCategory
  });
  
  // Fetch therapist's clients
  const { data: clientsData, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Fetch all messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });
  
  // Fetch client-specific messages when a client is selected
  const { data: clientMessages, isLoading: clientMessagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/clients', selectedClientId, 'messages'],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const res = await fetch(`/api/clients/${selectedClientId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch client messages');
      return res.json();
    },
    enabled: !!selectedClientId,
  });
  
  // Create a message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { 
      clientId: number, 
      content: string, 
      subject?: string,
      category?: string,
      sender: "therapist" | "client",
      attachments?: any[]
    }) => {
      const res = await apiRequest('POST', '/api/messages', messageData);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      if (selectedClientId) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'messages'] });
      }
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent securely.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Message Failed",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest('PATCH', `/api/messages/${messageId}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      if (selectedClientId) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'messages'] });
      }
    }
  });
  
  // Format clients for display
  const [clients, setClients] = useState<MessageClient[]>([]);
  
  useEffect(() => {
    if (clientsData && messagesData) {
      // Group messages by client
      const messagesByClient: Record<number, Message[]> = {};
      
      (messagesData as Message[]).forEach((message: Message) => {
        if (!messagesByClient[message.clientId]) {
          messagesByClient[message.clientId] = [];
        }
        messagesByClient[message.clientId].push(message);
      });
      
      // Create client list with latest message info
      const clientList: MessageClient[] = (clientsData as Client[]).map((client: Client) => {
        const clientMessages = messagesByClient[client.id] || [];
        // Sort messages by createdAt date (newest first)
        clientMessages.sort((a: Message, b: Message) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const latestMessage = clientMessages[0];
        const unreadMessages = clientMessages.filter(m => !m.isRead && m.sender === "client");
        
        const unanswered = latestMessage ? latestMessage.sender === "client" : false;
        
        return {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          firstName: client.firstName,
          lastName: client.lastName,
          profileImage: DEFAULT_AVATAR,
          lastMessage: latestMessage ? latestMessage.content : "No messages yet",
          lastMessageTime: latestMessage ? new Date(latestMessage.createdAt) : new Date(),
          unread: unreadMessages.length > 0,
          unanswered,
          dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth) : null,
          phone: client.phone
        };
      });
      
      // Sort clients by last message time and unread status
      clientList.sort((a, b) => {
        // First by unread status
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        // Then by timestamp
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      });
      
      setClients(clientList);
      
      // If no client is selected and we have clients, select the first one
      if (clientList.length > 0 && selectedClientId === null) {
        setSelectedClientId(clientList[0].id);
      }
    }
  }, [clientsData, messagesData, selectedClientId]);
  
  // Format messages for the current conversation
  const currentConversation: DisplayMessage[] = clientMessages ? 
    (clientMessages as Message[]).map((message: Message) => {
      try {
        // Parse the content to extract subject if it's in the format "Subject: ... \n\n content"
        let subject = message.subject || "";
        let text = message.content;
        
        if (!subject && message.content) {
          // If there's no subject field but content has a "Subject:" line, extract it
          const subjectMatch = message.content.match(/^Subject:(.*?)(?:\n\n|\r\n\r\n)([\s\S]*)$/);
          if (subjectMatch) {
            subject = subjectMatch[1].trim();
            text = subjectMatch[2].trim();
          }
        }
        
        return {
          id: message.id,
          text: text,
          subject: subject,
          category: message.category || "Clinical", // Default to Clinical if not specified
          sender: message.sender as "client" | "therapist",
          timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
          isRead: message.isRead,
          attachments: message.attachments as any[] || []
        };
      } catch (e) {
        console.error("Error processing message:", e, message);
        return {
          id: message.id,
          text: message.content,
          category: "Clinical",
          sender: message.sender as "client" | "therapist",
          timestamp: new Date(),
          isRead: message.isRead
        };
      }
    }).sort((a, b) => {
      try {
        return a.timestamp.getTime() - b.timestamp.getTime();
      } catch (e) {
        console.error("Error sorting messages:", e);
        return 0;
      }
    }) : [];
  
  // Find the selected client
  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Determine if a client has unanswered messages
  const getUnansweredStatus = (clientId: number): boolean => {
    const clientMsgs = messagesData ? (messagesData as Message[]).filter(m => m.clientId === clientId) : [];
    if (clientMsgs.length === 0) return false;
    
    // Sort by time, newest first
    clientMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // If latest message is from client, it's unanswered
    return clientMsgs[0].sender === "client";
  };

  // Helper function to get category for client's latest message
  const getClientLatestMessageCategory = (clientId: number): string => {
    if (!messagesData) return "Clinical"; // Default
    
    const clientMsgs = (messagesData as Message[]).filter(m => m.clientId === clientId);
    if (clientMsgs.length === 0) return "Clinical";
    
    // Sort by time, newest first
    clientMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Return category of latest message or default to Clinical
    return clientMsgs[0].category || "Clinical";
  };
  
  // Filter clients based on search, filter option, and category
  const filteredClients = clients.filter(client => {
    // First apply search filter
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // Then apply read status filter
    const matchesStatus = 
      filterOption === "all" || 
      (filterOption === "unread" && client.unread) ||
      (filterOption === "unanswered" && client.unanswered);
    
    if (!matchesStatus) return false;
    
    // Then apply category filter
    if (selectedCategory === "all") return true;
    
    // Check if this client has a message in the selected category
    if (messagesData) {
      const clientMsgs = (messagesData as Message[]).filter(m => m.clientId === client.id);
      
      // If no messages, don't filter out - they'll appear in all categories
      if (clientMsgs.length === 0) return true;
      
      // Check if any messages have the selected category
      return clientMsgs.some(m => m.category === selectedCategory);
    }
    
    return true;
  });
  
  // Handle client selection
  const handleSelectClient = (clientId: number) => {
    setSelectedClientId(clientId);
    
    // Mark unread messages as read for this client
    if (clientMessages) {
      (clientMessages as Message[]).forEach((message: Message) => {
        if (!message.isRead && message.sender === "client") {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
  };
  
  // Current message category for quick replies
  const [currentMessageCategory, setCurrentMessageCategory] = useState<MessageCategory>("Clinical");
  
  // Handle message sending
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedClientId) return;
    
    sendMessageMutation.mutate({
      clientId: selectedClientId,
      content: messageText,
      category: currentMessageCategory,
      sender: "therapist"
    });
    
    // Clear input
    setMessageText("");
  };
  
  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    try {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      
      if (days < 1) {
        return format(date, "h:mm a");
      } else if (days < 2) {
        return "Yesterday";
      } else if (days < 7) {
        return format(date, "EEEE"); // Day name
      } else {
        return format(date, "MMM d");
      }
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Unknown";
    }
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Secure Messages" />
        
        <div className="h-[calc(100vh-64px)] bg-neutral-50">
          {/* Top-level Message Category Tabs */}
          <div className="p-3 bg-white border-b">
            <Tabs
              defaultValue="all"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full max-w-4xl mx-auto"
            >
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <UserRound className="h-4 w-4" />
                  <span>All Messages</span>
                </TabsTrigger>
                <TabsTrigger value="Clinical" className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-primary-500" />
                  <span>Clinical</span>
                </TabsTrigger>
                <TabsTrigger value="Billing" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  <span>Billing</span>
                </TabsTrigger>
                <TabsTrigger value="Administrative" className="flex items-center gap-1">
                  <Clipboard className="h-4 w-4 text-amber-500" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        
          <div className="flex h-[calc(100%-56px)]">
            {/* Client List Sidebar */}
            <div className="w-80 border-r bg-white">
              <div className="p-4 border-b">
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input 
                      placeholder="Search conversations..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    size="icon" 
                    className="h-10 w-10"
                    onClick={() => setNewMessageDialogOpen(true)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    size="sm" 
                    variant={filterOption === "all" ? "default" : "outline"} 
                    className={cn("text-xs flex-1 h-8", 
                      filterOption === "all" ? "bg-primary-500 hover:bg-primary-600" : "")}
                    onClick={() => setFilterOption("all")}
                  >
                    All
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterOption === "unread" ? "default" : "outline"} 
                    className={cn("text-xs flex-1 h-8", 
                      filterOption === "unread" ? "bg-primary-500 hover:bg-primary-600" : "")}
                    onClick={() => setFilterOption("unread")}
                  >
                    Unread
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterOption === "unanswered" ? "default" : "outline"} 
                    className={cn("text-xs flex-1 h-8", 
                      filterOption === "unanswered" ? "bg-primary-500 hover:bg-primary-600" : "")}
                    onClick={() => setFilterOption("unanswered")}
                  >
                    Unanswered
                  </Button>
                </div>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-69px)]">
                {clientsLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <TooltipProvider key={client.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={cn(
                              "p-4 border-b hover:bg-neutral-50 cursor-pointer relative",
                              selectedClientId === client.id && "bg-primary-50",
                              client.unread && "bg-blue-50"
                            )}
                            onClick={() => handleSelectClient(client.id)}
                            onMouseEnter={() => setHoverClientId(client.id)}
                            onMouseLeave={() => setHoverClientId(null)}
                          >
                            <div className="flex items-start">
                              <div className="relative">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={client.profileImage} alt={client.name} />
                                  <AvatarFallback>{client.firstName.charAt(0)}{client.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {client.unread && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-white" />
                                )}
                              </div>
                              
                              <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <Link to={`/clients/${client.id}`}>
                                    <h3 className={cn(
                                      "font-medium truncate text-primary-700 hover:underline",
                                      client.unread && "font-semibold"
                                    )}>
                                      {client.name}
                                    </h3>
                                  </Link>
                                  <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                                    {formatTimestamp(client.lastMessageTime)}
                                  </span>
                                </div>
                                <p className={cn(
                                  "text-sm truncate text-neutral-500 mt-1",
                                  client.unread && "text-neutral-800 font-medium"
                                )}>
                                  {client.lastMessage}
                                </p>
                              </div>
                            </div>
                            
                            {/* Client action buttons on hover */}
                            {hoverClientId === client.id && (
                              <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                                <div className="bg-white shadow-md rounded-md p-1 flex gap-1 border">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewMessageDialogOpen(true);
                                            setNewMessageData({
                                              ...newMessageData, 
                                              clientId: client.id.toString(),
                                              category: "Clinical" as MessageCategory
                                            });
                                          }}
                                        >
                                          <MessageSquarePlus className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p className="text-xs">New Message</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Navigate to scheduling with this client
                                            window.location.href = `/scheduling?client=${client.id}`;
                                          }}
                                        >
                                          <Calendar className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p className="text-xs">Schedule Session</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            {client.dateOfBirth && <p className="text-xs">DOB: {format(client.dateOfBirth, "MMM d, yyyy")}</p>}
                            {client.phone && <p className="text-xs">Phone: {client.phone}</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-neutral-500 text-center">
                      {clients.length === 0 ? "No clients found" : "No matching clients"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Message Content */}
            <div className="flex-1 flex flex-col">
              {/* Client Header */}
              {selectedClient && (
                <div className="border-b bg-white p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedClient.profileImage} alt={selectedClient.name} />
                      <AvatarFallback>{selectedClient.firstName.charAt(0)}{selectedClient.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="font-medium">{selectedClient.name}</h3>
                      <div className="flex items-center text-xs text-neutral-500">
                        <span className={cn(
                          "w-2 h-2 rounded-full mr-1.5",
                          selectedClient.unread ? "bg-green-500" : "bg-neutral-300"
                        )} />
                        {selectedClient.unread ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              )}
              
              {/* Message area */}
              {selectedClient ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-4 space-y-6">
                      {currentConversation
                        .filter(message => {
                          // If "all" is selected, show all messages
                          if (selectedCategory === "all") return true;
                          
                          // Filter by message category
                          return message.category === selectedCategory;
                        })
                        .map(message => (
                        <div 
                          key={message.id}
                          className={cn(
                            "flex",
                            message.sender === "therapist" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] p-3 rounded-lg",
                            message.sender === "therapist" 
                              ? "bg-primary-600 rounded-tr-none"
                              : "bg-blue-50 border border-blue-200 rounded-tl-none"
                          )}>
                            {/* Category badge - only shown for therapist messages */}
                            {message.sender === "therapist" && message.category && (
                              <div className="mb-1.5 flex justify-between items-center">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-[10px] px-1.5 py-0 font-normal text-white border-white/30",
                                    message.category === "Clinical" && "bg-primary-700/50",
                                    message.category === "Billing" && "bg-green-700/50",
                                    message.category === "Administrative" && "bg-amber-700/50"
                                  )}
                                >
                                  {message.category === "Clinical" && (
                                    <>
                                      <FileText className="mr-1 h-2.5 w-2.5" />
                                      Clinical
                                    </>
                                  )}
                                  {message.category === "Billing" && (
                                    <>
                                      <FileSpreadsheet className="mr-1 h-2.5 w-2.5" />
                                      Billing
                                    </>
                                  )}
                                  {message.category === "Administrative" && (
                                    <>
                                      <Clipboard className="mr-1 h-2.5 w-2.5" />
                                      Admin
                                    </>
                                  )}
                                </Badge>
                                {message.subject && (
                                  <span className="text-xs text-white/70 font-medium ml-2">
                                    {message.subject}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Message text */}
                            <p className={message.sender === "therapist" ? "text-white font-medium" : "text-black font-medium"}>
                              {message.text}
                            </p>
                            
                            {/* Timestamp */}
                            <div className={cn(
                              "text-xs mt-1 flex justify-between items-center",
                              message.sender === "therapist" ? "text-primary-100" : "text-blue-500"
                            )}>
                              <div>
                                {message.sender === "client" && !message.isRead && (
                                  <Badge variant="outline" className="mr-1.5 text-[10px] py-0 px-1 border-blue-300 text-blue-600 bg-blue-50">
                                    <Clock className="mr-1 h-2.5 w-2.5" />
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div>
                                {(() => {
                                  try {
                                    return format(message.timestamp, "h:mm a");
                                  } catch (e) {
                                    return "Unknown time";
                                  }
                                })()}
                                {message.sender === "therapist" && (
                                  <CheckCircle className="ml-1 inline-block h-3 w-3 text-primary-100" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    {/* Message category buttons */}
                    <div className="flex items-center justify-start space-x-2 mb-3">
                      <span className="text-xs text-neutral-500 mr-1">Category:</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-7 text-xs gap-1 py-0 px-2",
                          currentMessageCategory === "Clinical" && "bg-primary-50 border-primary-200 text-primary-700"
                        )}
                        onClick={() => setCurrentMessageCategory("Clinical")}
                      >
                        <FileText className="h-3.5 w-3.5 text-primary-500" />
                        Clinical
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-7 text-xs gap-1 py-0 px-2",
                          currentMessageCategory === "Billing" && "bg-green-50 border-green-200 text-green-700"
                        )}
                        onClick={() => setCurrentMessageCategory("Billing")}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />
                        Billing
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-7 text-xs gap-1 py-0 px-2",
                          currentMessageCategory === "Administrative" && "bg-amber-50 border-amber-200 text-amber-700"
                        )}
                        onClick={() => setCurrentMessageCategory("Administrative")}
                      >
                        <Clipboard className="h-3.5 w-3.5 text-amber-500" />
                        Admin
                      </Button>
                    </div>
                    
                    {/* Message input */}
                    <div className="flex items-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="mb-1.5">
                            <Paperclip className="h-5 w-5 text-neutral-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuLabel>Attachments</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Document</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Form</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <div className="flex-1 ml-2">
                        <textarea 
                          placeholder={`Type a ${currentMessageCategory.toLowerCase()} message...`}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px] py-3 px-4"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      
                      <Button 
                        className={cn(
                          "ml-2 h-10 w-10 rounded-full p-0",
                          currentMessageCategory === "Clinical" && "bg-primary-600 hover:bg-primary-700",
                          currentMessageCategory === "Billing" && "bg-green-600 hover:bg-green-700",
                          currentMessageCategory === "Administrative" && "bg-amber-600 hover:bg-amber-700"
                        )}
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-neutral-500 flex justify-between items-center mt-2">
                      <span>
                        Sending as: <span className="font-medium">{currentMessageCategory}</span>
                      </span>
                      <span>
                        All messages are encrypted end-to-end and HIPAA compliant
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-neutral-50">
                  <div className="text-center">
                    <p className="text-neutral-500">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* New Message Dialog */}
      <Dialog 
        open={newMessageDialogOpen} 
        onOpenChange={setNewMessageDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select 
                value={newMessageData.clientId}
                onValueChange={(value) => setNewMessageData({...newMessageData, clientId: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsData && clientsData
                    .filter(client => {
                      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
                      return fullName.includes(searchQuery.toLowerCase());
                    })
                    .map((client) => (
                      <SelectItem 
                        key={client.id} 
                        value={client.id.toString()}
                        className="flex items-center gap-2 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={DEFAULT_AVATAR} alt={`${client.firstName} ${client.lastName}`} />
                            <AvatarFallback>{client.firstName[0]}{client.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <span>{client.firstName} {client.lastName}</span>
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <RadioGroup 
                value={newMessageData.category} 
                onValueChange={(value) => setNewMessageData({
                  ...newMessageData, 
                  category: value as MessageCategory
                })}
                className="flex space-x-4 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Clinical" id="clinical" />
                  <Label htmlFor="clinical" className="flex items-center">
                    <FileText className="h-4 w-4 mr-1.5 text-primary-500" />
                    Clinical
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Billing" id="billing" />
                  <Label htmlFor="billing" className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-1.5 text-green-500" />
                    Billing
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Administrative" id="administrative" />
                  <Label htmlFor="administrative" className="flex items-center">
                    <Clipboard className="h-4 w-4 mr-1.5 text-amber-500" />
                    Administrative
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Brief message topic" 
                value={newMessageData.subject}
                onChange={(e) => setNewMessageData({...newMessageData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Type your secure message here" 
                rows={6}
                value={newMessageData.content}
                onChange={(e) => setNewMessageData({...newMessageData, content: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newMessageData.clientId && newMessageData.content) {
                  const content = newMessageData.subject 
                    ? `Subject: ${newMessageData.subject}\n\n${newMessageData.content}`
                    : newMessageData.content;
                  
                  sendMessageMutation.mutate({
                    clientId: parseInt(newMessageData.clientId),
                    content: content,
                    category: newMessageData.category,
                    subject: newMessageData.subject,
                    sender: "therapist"
                  });
                  
                  // Clear form and close dialog
                  setNewMessageData({
                    clientId: "",
                    subject: "",
                    content: "",
                    category: "Clinical" as MessageCategory
                  });
                  setNewMessageDialogOpen(false);
                  
                  // If this was the first message to this client, select them
                  if (selectedClientId !== parseInt(newMessageData.clientId)) {
                    setSelectedClientId(parseInt(newMessageData.clientId));
                  }
                }
              }}
              disabled={!newMessageData.clientId || !newMessageData.content}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
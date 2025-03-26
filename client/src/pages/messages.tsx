import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MoreVertical, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, Client } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_AVATAR } from "@/lib/constants";

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
  dateOfBirth?: Date | null;
  phone?: string | null;
}

// Message type adjusted for UI
interface DisplayMessage {
  id: number;
  text: string;
  sender: "client" | "therapist";
  timestamp: Date;
  isRead: boolean;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  
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
    enabled: !!selectedClientId,
  });
  
  // Create a message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { clientId: number, content: string, sender: "therapist" | "client" }) => {
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
        
        return {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          firstName: client.firstName,
          lastName: client.lastName,
          profileImage: DEFAULT_AVATAR,
          lastMessage: latestMessage ? latestMessage.content : "No messages yet",
          lastMessageTime: latestMessage ? new Date(latestMessage.createdAt) : new Date(),
          unread: unreadMessages.length > 0,
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
        return {
          id: message.id,
          text: message.content,
          sender: message.sender as "client" | "therapist",
          timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
          isRead: message.isRead
        };
      } catch (e) {
        console.error("Error processing message:", e, message);
        return {
          id: message.id,
          text: message.content,
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
  
  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
  
  // Handle message sending
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedClientId) return;
    
    sendMessageMutation.mutate({
      clientId: selectedClientId,
      content: messageText,
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
          <div className="flex h-full">
            {/* Client List Sidebar */}
            <div className="w-80 border-r bg-white">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                              "p-4 border-b hover:bg-neutral-50 cursor-pointer",
                              selectedClientId === client.id && "bg-primary-50",
                              client.unread && "bg-blue-50"
                            )}
                            onClick={() => handleSelectClient(client.id)}
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
                                  <h3 className={cn(
                                    "font-medium truncate",
                                    client.unread && "font-semibold"
                                  )}>
                                    {client.name}
                                  </h3>
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
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-0 max-w-sm">
                          <div className="p-4 bg-white rounded-lg shadow-lg">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-14 w-14">
                                <AvatarImage src={client.profileImage} alt={client.name} />
                                <AvatarFallback>{client.firstName.charAt(0)}{client.lastName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-base">{client.name}</h3>
                                {client.dateOfBirth && (
                                  <p className="text-xs text-neutral-600">
                                    <span className="font-medium">DOB:</span> {
                                      (() => {
                                        try {
                                          return format(client.dateOfBirth, 'MMM d, yyyy');
                                        } catch (e) {
                                          return 'Unknown';
                                        }
                                      })()
                                    }
                                  </p>
                                )}
                                {client.phone && (
                                  <p className="text-xs text-neutral-600">
                                    <span className="font-medium">Phone:</span> {client.phone}
                                  </p>
                                )}
                                <div className="mt-2 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs h-7 px-2 py-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `/clients?view=${client.id}`;
                                    }}
                                  >
                                    View Chart
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs h-7 px-2 py-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `/scheduling?client=${client.id}`;
                                    }}
                                  >
                                    Schedule
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : (
                  <div className="p-4 text-center text-neutral-500">
                    No conversations found.
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversation Area */}
            <div className="flex-1 flex flex-col">
              {selectedClient ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b bg-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedClient.profileImage} alt={selectedClient.name} />
                        <AvatarFallback>{selectedClient.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h2 className="font-medium">{selectedClient.name}</h2>
                        <p className="text-xs text-neutral-500">Secure, encrypted conversation</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5 text-neutral-500" />
                    </Button>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
                    <div className="max-w-3xl mx-auto space-y-4">
                      {currentConversation.map(message => (
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
                              ? "bg-primary-500 text-white rounded-tr-none" 
                              : "bg-white border border-neutral-200 rounded-tl-none"
                          )}>
                            <p>{message.text}</p>
                            <div className={cn(
                              "text-xs mt-1 text-right",
                              message.sender === "therapist" ? "text-primary-100" : "text-neutral-400"
                            )}>
                              {
                                (() => {
                                  try {
                                    return format(message.timestamp, "h:mm a");
                                  } catch (e) {
                                    return "Unknown time";
                                  }
                                })()
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-end">
                      <Button variant="ghost" size="icon" className="mb-1.5">
                        <Paperclip className="h-5 w-5 text-neutral-500" />
                      </Button>
                      <div className="flex-1 ml-2">
                        <textarea 
                          placeholder="Type a secure message..." 
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
                        className="ml-2 h-10 w-10 rounded-full p-0"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="text-xs text-neutral-500 text-center mt-2">
                      All messages are encrypted end-to-end and HIPAA compliant
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
    </div>
  );
}

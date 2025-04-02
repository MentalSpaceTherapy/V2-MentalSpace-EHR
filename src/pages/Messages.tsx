import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { format } from "date-fns";
import { Search, Send, Paperclip, MoreVertical, Loader2, Plus } from "lucide-react";

// Custom hooks for data fetching
import { useApi } from "../hooks/useApi";
import { queryKeys } from "../lib/queryClient";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/Tooltip";
import { VirtualList } from "../components/virtualization/VirtualList";

// Utils
import { cn } from "../utils/cn";
import { initPerformanceMonitoring } from "../utils/performance";

// Types
interface Client {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  phone?: string | null;
}

interface Message {
  id: number;
  clientId: number;
  content: string;
  sender: "client" | "therapist";
  isRead: boolean;
  createdAt: string;
}

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
  sender: "client" | "therapist";
  timestamp: Date;
  isRead: boolean;
}

const DEFAULT_AVATAR = "/assets/default-avatar.png";

// Init performance monitoring for this page
const performanceTools = initPerformanceMonitoring({
  debug: process.env.NODE_ENV === 'development'
});

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const api = useApi();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [filterOption, setFilterOption] = useState<string>("all"); // "all", "unread", "unanswered"
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    clientId: "",
    subject: "",
    content: ""
  });
  
  // Fetch therapist's clients using our custom hook
  const { data: clientsData, isLoading: clientsLoading } = api.fetch<{data: Client[]}>(
    '/api/clients',
    queryKeys.clients.list(),
  );
  
  // Fetch all messages
  const { data: messagesData, isLoading: messagesLoading } = api.fetch<{data: Message[]}>(
    '/api/messages',
    queryKeys.messages.list(),
    { enabled: !!user }
  );
  
  // Fetch client-specific messages when a client is selected
  const { data: clientMessages, isLoading: clientMessagesLoading } = api.fetch<{data: Message[]}>(
    `/api/clients/${selectedClientId}/messages`,
    [...queryKeys.clients.detail(selectedClientId!), 'messages'],
    { enabled: !!selectedClientId }
  );
  
  // Create a message mutation
  const sendMessageMutation = api.post<Message, { clientId: number, content: string, sender: "therapist" | "client" }>(
    '/api/messages',
    {
      onSuccess: () => {
        // Invalidate relevant queries to refresh data
        api.invalidate(queryKeys.messages.list());
        if (selectedClientId) {
          api.invalidate([...queryKeys.clients.detail(selectedClientId), 'messages']);
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
    }
  );
  
  // Mark message as read mutation
  const markAsReadMutation = api.patch<Message, number>(
    `/api/messages/:id/read`,
    {
      onMutate: async (messageId) => {
        // Optimistically update the message as read
        const messagesQueryKey = queryKeys.messages.list();
        const clientMessagesQueryKey = selectedClientId 
          ? [...queryKeys.clients.detail(selectedClientId), 'messages']
          : null;
          
        // Cancel any outgoing refetches to avoid overwriting our optimistic update
        await api.queryClient.cancelQueries({ queryKey: messagesQueryKey });
        if (clientMessagesQueryKey) {
          await api.queryClient.cancelQueries({ queryKey: clientMessagesQueryKey });
        }
        
        // Get current messages state
        const previousMessages = api.queryClient.getQueryData(messagesQueryKey);
        const previousClientMessages = clientMessagesQueryKey 
          ? api.queryClient.getQueryData(clientMessagesQueryKey)
          : null;
        
        // Helper to update a message in a list
        const updateMessageInList = (messagesList: any) => {
          if (!messagesList?.data) return messagesList;
          
          return {
            ...messagesList,
            data: messagesList.data.map((message: Message) => 
              message.id === messageId
                ? { ...message, isRead: true }
                : message
            )
          };
        };
        
        // Optimistically update
        if (previousMessages) {
          api.queryClient.setQueryData(messagesQueryKey, updateMessageInList(previousMessages));
        }
        
        if (previousClientMessages) {
          api.queryClient.setQueryData(clientMessagesQueryKey!, updateMessageInList(previousClientMessages));
        }
        
        // Return context for rollback
        return { previousMessages, previousClientMessages, clientMessagesQueryKey };
      },
      onError: (_err, _messageId, context: any) => {
        // Roll back updates if there was an error
        if (context.previousMessages) {
          api.queryClient.setQueryData(queryKeys.messages.list(), context.previousMessages);
        }
        
        if (context.previousClientMessages && context.clientMessagesQueryKey) {
          api.queryClient.setQueryData(context.clientMessagesQueryKey, context.previousClientMessages);
        }
      },
      onSettled: () => {
        // Refresh data after the mutation settles (success or error)
        api.invalidate(queryKeys.messages.list());
        if (selectedClientId) {
          api.invalidate([...queryKeys.clients.detail(selectedClientId), 'messages']);
        }
      }
    }
  );
  
  // Format clients for display
  const [clients, setClients] = useState<MessageClient[]>([]);
  
  useEffect(() => {
    const startTime = performance.now();
    
    if (clientsData?.data && messagesData?.data) {
      // Group messages by client
      const messagesByClient: Record<number, Message[]> = {};
      
      messagesData.data.forEach((message: Message) => {
        if (!messagesByClient[message.clientId]) {
          messagesByClient[message.clientId] = [];
        }
        messagesByClient[message.clientId].push(message);
      });
      
      // Create client list with latest message info
      const clientList: MessageClient[] = clientsData.data.map((client: Client) => {
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
      
      // Track performance
      const endTime = performance.now();
      performanceTools?.trackRender('MessagesDataProcessing', endTime - startTime);
    }
  }, [clientsData, messagesData, selectedClientId]);
  
  // Format messages for the current conversation
  const currentConversation: DisplayMessage[] = clientMessages?.data ? 
    clientMessages.data.map((message: Message) => {
      return {
        id: message.id,
        text: message.content,
        sender: message.sender as "client" | "therapist",
        timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
        isRead: message.isRead
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) : [];
  
  // Find the selected client
  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Filter clients based on search and filter option
  const filteredClients = clients.filter(client => {
    // First apply search filter
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // Then apply type filter
    if (filterOption === "all") return true;
    if (filterOption === "unread" && client.unread) return true;
    if (filterOption === "unanswered" && client.unanswered) return true;
    
    return filterOption === "all";
  });
  
  // Handle client selection
  const handleSelectClient = (clientId: number) => {
    const startTime = performance.now();
    
    setSelectedClientId(clientId);
    
    // Mark unread messages as read for this client
    if (clientMessages?.data) {
      clientMessages.data.forEach((message: Message) => {
        if (!message.isRead && message.sender === "client") {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
    
    const endTime = performance.now();
    performanceTools?.trackRender('ClientSelection', endTime - startTime);
  };
  
  // Handle message sending
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedClientId) return;
    
    const startTime = performance.now();
    
    sendMessageMutation.mutate({
      clientId: selectedClientId,
      content: messageText,
      sender: "therapist"
    });
    
    // Clear input
    setMessageText("");
    
    const endTime = performance.now();
    performanceTools?.trackApiRequest('sendMessage', endTime - startTime, true);
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

  // Handle sending a new message from dialog
  const handleSendNewMessage = () => {
    if (newMessageData.clientId && newMessageData.content) {
      const content = newMessageData.subject 
        ? `Subject: ${newMessageData.subject}\n\n${newMessageData.content}`
        : newMessageData.content;
      
      sendMessageMutation.mutate({
        clientId: parseInt(newMessageData.clientId),
        content: content,
        sender: "therapist"
      });
      
      // Clear form and close dialog
      setNewMessageData({
        clientId: "",
        subject: "",
        content: ""
      });
      setNewMessageDialogOpen(false);
      
      // If this was the first message to this client, select them
      if (selectedClientId !== parseInt(newMessageData.clientId)) {
        setSelectedClientId(parseInt(newMessageData.clientId));
      }
    }
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <div>Please sign in to access messages</div>;
  }

  // Render client list item
  const renderClientItem = (client: MessageClient) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "p-4 border-b hover:bg-neutral-50 cursor-pointer",
              selectedClientId === client.id && "bg-primary-50",
              client.unread && "bg-blue-50"
            )}
            onClick={() => handleSelectClient(client.id)}
            data-testid={`client-${client.id}`}
          >
            <div className="flex items-start">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={client.profileImage} alt={client.name} />
                  <AvatarFallback>{client.firstName.charAt(0)}{client.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                {client.unread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-white unread-indicator" />
                )}
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={cn(
                    "font-medium truncate client-name",
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
  );

  // Render message item
  const renderMessageItem = (message: DisplayMessage) => (
    <div 
      className={cn(
        "flex mb-4",
        message.sender === "therapist" ? "justify-end" : "justify-start"
      )}
      data-testid="message-item"
    >
      <div className={cn(
        "max-w-[80%] p-3 rounded-lg",
        message.sender === "therapist" 
          ? "bg-primary-600 rounded-tr-none"
          : "bg-blue-50 border border-blue-200 rounded-tl-none"
      )}>
        <p className={message.sender === "therapist" ? "text-white font-medium" : "text-black font-medium"}
          data-testid="message-content"
        >
          {message.text}
        </p>
        <div className={cn(
          "text-xs mt-1 text-right",
          message.sender === "therapist" ? "text-primary-100" : "text-blue-500"
        )}>
          {(() => {
            try {
              return format(message.timestamp, "h:mm a");
            } catch (e) {
              return "Unknown time";
            }
          })()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" data-testid="messages-page">
      <div className="flex-1">
        <div className="h-[calc(100vh-64px)] bg-neutral-50">
          <div className="flex h-full">
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
                      data-testid="search-input"
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
                  <VirtualList
                    items={filteredClients}
                    renderItem={renderClientItem}
                    estimatedItemHeight={72} // Approximate height of a client list item
                    overscan={5}
                    className="h-full"
                    data-testid="client-list"
                  />
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
                  <div className="flex-1 overflow-y-auto" data-testid="message-container">
                    <div className="max-w-3xl mx-auto p-4">
                      {clientMessagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                      ) : currentConversation.length > 0 ? (
                        <VirtualList
                          items={currentConversation}
                          renderItem={renderMessageItem}
                          estimatedItemHeight={80} // Approximate height of a message
                          overscan={5}
                          data-testid="message-list"
                        />
                      ) : (
                        <div className="text-center p-8 text-neutral-500">
                          No messages yet. Start the conversation!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-end">
                      <Button variant="ghost" size="icon" className="mb-1.5">
                        <Paperclip className="h-5 w-5 text-neutral-500" />
                      </Button>
                      <div className="flex-1 ml-2">
                        <Textarea 
                          placeholder="Type a secure message..." 
                          className="min-h-[60px] py-3 px-4"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          data-testid="message-input"
                        />
                      </div>
                      <Button 
                        className="ml-2 h-10 w-10 rounded-full p-0"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        data-testid="send-button"
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
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.data && clientsData.data.map((client: Client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              onClick={handleSendNewMessage}
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
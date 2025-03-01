import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip, MoreVertical } from "lucide-react";
import { format, subDays, subHours, subMinutes } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock messaging data
const mockClients = [
  {
    id: 1,
    name: "Sophie Garcia",
    profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "I have a question about my medication...",
    lastMessageTime: subHours(new Date(), 1),
    unread: true
  },
  {
    id: 2,
    name: "Michael Chen",
    profileImage: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "Thanks for the resources you shared last time.",
    lastMessageTime: subDays(new Date(), 1),
    unread: true
  },
  {
    id: 3,
    name: "Emma Wilson",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "I'm feeling much better this week!",
    lastMessageTime: subDays(new Date(), 2),
    unread: false
  },
  {
    id: 4,
    name: "David Thompson",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "See you at our next session.",
    lastMessageTime: subDays(new Date(), 3),
    unread: false
  },
  {
    id: 5,
    name: "Jamie Rodriguez",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "I completed the assessment form you sent.",
    lastMessageTime: subDays(new Date(), 5),
    unread: false
  }
];

const mockConversations: Record<number, Array<{id: number, text: string, sender: "client" | "therapist", timestamp: Date}>> = {
  1: [
    { id: 1, text: "Hello Dr. Johnson, I have a question about my medication.", sender: "client", timestamp: subHours(new Date(), 1) },
    { id: 2, text: "Hi Sophie, I'm available now. What questions do you have about your medication?", sender: "therapist", timestamp: subMinutes(new Date(), 55) },
    { id: 3, text: "I've been experiencing some side effects like dizziness and nausea. Is this normal?", sender: "client", timestamp: subMinutes(new Date(), 50) },
    { id: 4, text: "Some dizziness and nausea can be common side effects when first starting the medication. When did these symptoms begin?", sender: "therapist", timestamp: subMinutes(new Date(), 45) },
    { id: 5, text: "I started the medication about 3 days ago, and the symptoms started yesterday.", sender: "client", timestamp: subMinutes(new Date(), 40) },
    { id: 6, text: "I see. Often these side effects diminish after about a week as your body adjusts. If they're severe or worsening, we might need to consider adjustments. Are you able to eat and drink normally?", sender: "therapist", timestamp: subMinutes(new Date(), 35) },
    { id: 7, text: "I can eat, but I feel nauseous afterward. Drinking water seems fine.", sender: "client", timestamp: subMinutes(new Date(), 30) },
    { id: 8, text: "Try taking the medication with food if you aren't already, and make sure to stay hydrated. If the symptoms don't improve in the next 2-3 days or if they worsen, please let me know right away. We can discuss this further in our session tomorrow as well.", sender: "therapist", timestamp: subMinutes(new Date(), 25) },
    { id: 9, text: "I'll try that. Thank you for your help!", sender: "client", timestamp: subMinutes(new Date(), 20) },
    { id: 10, text: "You're welcome. Feel free to reach out if you have any other concerns before our session.", sender: "therapist", timestamp: subMinutes(new Date(), 15) }
  ],
  2: [
    { id: 1, text: "Hi Dr. Johnson, I wanted to thank you for the resources you shared in our last session.", sender: "client", timestamp: subDays(new Date(), 1) },
    { id: 2, text: "You're welcome, Michael. Have you had a chance to review them yet?", sender: "therapist", timestamp: subDays(new Date(), 1) },
    { id: 3, text: "Yes, I found the breathing exercises particularly helpful for managing anxiety.", sender: "client", timestamp: subDays(new Date(), 1) }
  ],
  3: [
    { id: 1, text: "Dr. Johnson, I wanted to let you know that I'm feeling much better this week!", sender: "client", timestamp: subDays(new Date(), 2) },
    { id: 2, text: "That's wonderful to hear, Emma! What do you think has contributed to the improvement?", sender: "therapist", timestamp: subDays(new Date(), 2) },
    { id: 3, text: "I've been consistent with the mindfulness practices and journaling you recommended.", sender: "client", timestamp: subDays(new Date(), 2) },
    { id: 4, text: "That's excellent. Consistency with those practices can make a big difference. I'm looking forward to discussing this more in our next session.", sender: "therapist", timestamp: subDays(new Date(), 2) }
  ]
};

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(1); // Default to first client
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [clients, setClients] = useState(mockClients);
  const [conversations, setConversations] = useState(mockConversations);
  
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const currentConversation = selectedClientId ? conversations[selectedClientId] || [] : [];
  
  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectClient = (clientId: number) => {
    setSelectedClientId(clientId);
    
    // Mark conversation as read
    setClients(clients.map(client => 
      client.id === clientId ? { ...client, unread: false } : client
    ));
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedClientId) return;
    
    const newMessage = {
      id: (currentConversation.length > 0 ? Math.max(...currentConversation.map(m => m.id)) : 0) + 1,
      text: messageText,
      sender: "therapist" as const,
      timestamp: new Date()
    };
    
    // Update conversation
    setConversations({
      ...conversations,
      [selectedClientId]: [...(conversations[selectedClientId] || []), newMessage]
    });
    
    // Update client's last message
    setClients(clients.map(client => 
      client.id === selectedClientId 
        ? { 
            ...client, 
            lastMessage: messageText, 
            lastMessageTime: new Date(),
            unread: false
          } 
        : client
    ));
    
    // Clear input
    setMessageText("");
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent securely.",
    });
  };

  const formatTimestamp = (date: Date) => {
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
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <div 
                      key={client.id}
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
                            <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
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
                              {format(message.timestamp, "h:mm a")}
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
                        <Input 
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
                          multiline
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

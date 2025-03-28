import { createContext, useContext, useState, ReactNode } from "react";

// Define types for our CRM data
export type Campaign = {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Social" | "Multi-channel";
  status: "Draft" | "Scheduled" | "Running" | "Completed" | "Paused";
  audience: string;
  performance: string;
  startDate: string;
  endDate?: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
};

export type MarketingEvent = {
  id: string;
  name: string;
  type: "Webinar" | "Workshop" | "Conference" | "Open House" | "Group Session";
  date: string;
  time: string;
  location: string;
  status: "Upcoming" | "In Progress" | "Completed" | "Cancelled";
  capacity: number;
  registered: number;
  attended?: number;
};

export type LeadSource = {
  name: string;
  value: number;
  percentage: number;
};

export type ClientSegment = {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: string[];
};

export type MarketingTemplate = {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  lastUsed?: string;
};

export type TimeRange = "week" | "month" | "quarter" | "year";

// CRM Context Type
interface CRMContextType {
  // Campaign data and methods
  campaigns: Campaign[];
  activeCampaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id">) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  // Leads & Clients
  leads: number;
  incrementLeads: (amount: number) => void;
  conversionRate: number;
  setConversionRate: (rate: number) => void;
  
  // Events 
  events: MarketingEvent[];
  addEvent: (event: Omit<MarketingEvent, "id">) => void;
  updateEvent: (id: string, event: Partial<MarketingEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Metrics
  selectedTimeRange: TimeRange;
  setSelectedTimeRange: (range: TimeRange) => void;
  
  // Referral sources 
  referralSources: LeadSource[];
  updateReferralSources: (sources: LeadSource[]) => void;
  
  // Client segments
  clientSegments: ClientSegment[];
  addClientSegment: (segment: Omit<ClientSegment, "id">) => void;
  updateClientSegment: (id: string, segment: Partial<ClientSegment>) => void;
  deleteClientSegment: (id: string) => void;
  
  // Marketing templates
  marketingTemplates: MarketingTemplate[];
  addMarketingTemplate: (template: Omit<MarketingTemplate, "id">) => void;
  updateMarketingTemplate: (id: string, template: Partial<MarketingTemplate>) => void;
  deleteMarketingTemplate: (id: string) => void;
}

// Sample data
const defaultCampaigns: Campaign[] = [
  {
    id: "camp1",
    name: "Summer Wellness Newsletter",
    type: "Email",
    status: "Running",
    audience: "All clients",
    performance: "45% open rate",
    startDate: "2024-06-01",
    stats: {
      sent: 250,
      opened: 112,
      clicked: 78,
      converted: 12
    }
  },
  {
    id: "camp2",
    name: "New Client Welcome Series",
    type: "Multi-channel",
    status: "Running",
    audience: "New clients",
    performance: "92% open rate",
    startDate: "2024-05-15",
    stats: {
      sent: 45,
      opened: 41,
      clicked: 38,
      converted: 35
    }
  },
  {
    id: "camp3",
    name: "Anxiety Workshop Promotion",
    type: "Email",
    status: "Running",
    audience: "Clients with anxiety",
    performance: "38% open rate",
    startDate: "2024-06-10",
    endDate: "2024-06-20",
    stats: {
      sent: 180,
      opened: 68,
      clicked: 42,
      converted: 18
    }
  },
  {
    id: "camp4",
    name: "Client Re-engagement",
    type: "SMS",
    status: "Running",
    audience: "Inactive clients",
    performance: "23% response rate",
    startDate: "2024-06-05",
    stats: {
      sent: 75,
      opened: 62,
      clicked: 23,
      converted: 11
    }
  },
  {
    id: "camp5",
    name: "Mindfulness Program",
    type: "Email",
    status: "Draft",
    audience: "All clients",
    performance: "Not started",
    startDate: "2024-07-10",
    stats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    }
  }
];

const defaultEvents: MarketingEvent[] = [
  {
    id: "evt1",
    name: "Stress Management Workshop",
    type: "Workshop",
    date: "2024-07-15",
    time: "18:00 - 20:00",
    location: "Online Zoom",
    status: "Upcoming",
    capacity: 50,
    registered: 32
  },
  {
    id: "evt2",
    name: "Mental Health Awareness Webinar",
    type: "Webinar",
    date: "2024-06-28",
    time: "12:00 - 13:00",
    location: "Online Zoom",
    status: "Upcoming",
    capacity: 100,
    registered: 78
  },
  {
    id: "evt3",
    name: "Therapy Open House",
    type: "Open House",
    date: "2024-07-10",
    time: "16:00 - 19:00",
    location: "Main Office",
    status: "Upcoming",
    capacity: 30,
    registered: 12
  },
  {
    id: "evt4",
    name: "Anxiety Support Group",
    type: "Group Session",
    date: "2024-06-20",
    time: "18:30 - 20:00",
    location: "Room 204",
    status: "Upcoming",
    capacity: 15,
    registered: 8
  }
];

const defaultReferralSources: LeadSource[] = [
  { name: "Website", value: 35, percentage: 35 },
  { name: "Healthcare Providers", value: 25, percentage: 25 },
  { name: "Social Media", value: 20, percentage: 20 },
  { name: "Client Referrals", value: 15, percentage: 15 },
  { name: "Other", value: 5, percentage: 5 }
];

const defaultClientSegments: ClientSegment[] = [
  {
    id: "seg1",
    name: "New Clients",
    description: "Clients who joined in the last 30 days",
    count: 12,
    criteria: ["join_date > 30 days ago"]
  },
  {
    id: "seg2",
    name: "Anxiety & Depression",
    description: "Clients seeking help with anxiety or depression",
    count: 28,
    criteria: ["diagnosis contains 'anxiety'", "diagnosis contains 'depression'"]
  },
  {
    id: "seg3",
    name: "Inactive (3+ months)",
    description: "Clients without sessions in 3+ months",
    count: 8,
    criteria: ["last_session < 90 days ago"]
  },
  {
    id: "seg4",
    name: "Telehealth Only",
    description: "Clients who prefer telehealth sessions",
    count: 35,
    criteria: ["preferred_medium = 'telehealth'"]
  }
];

const defaultMarketingTemplates: MarketingTemplate[] = [
  {
    id: "temp1",
    name: "Welcome Email Series (3)",
    type: "Email",
    subject: "Welcome to Mental Space",
    content: "Welcome email template with introduction to the practice...",
    lastUsed: "2024-06-01"
  },
  {
    id: "temp2",
    name: "Monthly Newsletter (5)",
    type: "Email",
    subject: "Your Monthly Mental Health Update",
    content: "Monthly newsletter template with mental health tips...",
    lastUsed: "2024-06-05"
  },
  {
    id: "temp3",
    name: "Event Promotion (2)",
    type: "Email",
    subject: "Join Our Upcoming Workshop",
    content: "Event promotion template with details and registration link...",
    lastUsed: "2024-05-20"
  },
  {
    id: "temp4",
    name: "Service Announcement (4)",
    type: "Email",
    subject: "New Services Available",
    content: "Announcement template for new services or features...",
    lastUsed: "2024-05-15"
  },
  {
    id: "temp5",
    name: "Seasonal Campaign (3)",
    type: "Email",
    subject: "Summer Wellness Tips",
    content: "Seasonal wellness tips and recommendations...",
    lastUsed: "2024-06-10"
  }
];

// Create the context
export const CRMContext = createContext<CRMContextType | null>(null);

// Create the provider
export function CRMProvider({ children }: { children: ReactNode }) {
  // State for campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  
  // State for events
  const [events, setEvents] = useState<MarketingEvent[]>(defaultEvents);
  
  // State for metrics
  const [leads, setLeads] = useState(28);
  const [conversionRate, setConversionRate] = useState(24.8);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("month");
  
  // State for referral sources
  const [referralSources, setReferralSources] = useState<LeadSource[]>(defaultReferralSources);
  
  // State for client segments
  const [clientSegments, setClientSegments] = useState<ClientSegment[]>(defaultClientSegments);
  
  // State for marketing templates
  const [marketingTemplates, setMarketingTemplates] = useState<MarketingTemplate[]>(defaultMarketingTemplates);
  
  // Campaign methods
  const addCampaign = (campaign: Omit<Campaign, "id">) => {
    const newCampaign = {
      ...campaign,
      id: `camp${campaigns.length + 1}`
    };
    setCampaigns([...campaigns, newCampaign]);
  };
  
  const updateCampaign = (id: string, campaignUpdate: Partial<Campaign>) => {
    setCampaigns(
      campaigns.map(campaign => 
        campaign.id === id ? { ...campaign, ...campaignUpdate } : campaign
      )
    );
  };
  
  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
  };
  
  // Event methods
  const addEvent = (event: Omit<MarketingEvent, "id">) => {
    const newEvent = {
      ...event,
      id: `evt${events.length + 1}`
    };
    setEvents([...events, newEvent]);
  };
  
  const updateEvent = (id: string, eventUpdate: Partial<MarketingEvent>) => {
    setEvents(
      events.map(event => 
        event.id === id ? { ...event, ...eventUpdate } : event
      )
    );
  };
  
  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };
  
  // Lead methods
  const incrementLeads = (amount: number) => {
    setLeads(prev => prev + amount);
  };
  
  // Referral sources methods
  const updateReferralSources = (sources: LeadSource[]) => {
    setReferralSources(sources);
  };
  
  // Client segment methods
  const addClientSegment = (segment: Omit<ClientSegment, "id">) => {
    const newSegment = {
      ...segment,
      id: `seg${clientSegments.length + 1}`
    };
    setClientSegments([...clientSegments, newSegment]);
  };
  
  const updateClientSegment = (id: string, segmentUpdate: Partial<ClientSegment>) => {
    setClientSegments(
      clientSegments.map(segment => 
        segment.id === id ? { ...segment, ...segmentUpdate } : segment
      )
    );
  };
  
  const deleteClientSegment = (id: string) => {
    setClientSegments(clientSegments.filter(segment => segment.id !== id));
  };
  
  // Marketing template methods
  const addMarketingTemplate = (template: Omit<MarketingTemplate, "id">) => {
    const newTemplate = {
      ...template,
      id: `temp${marketingTemplates.length + 1}`
    };
    setMarketingTemplates([...marketingTemplates, newTemplate]);
  };
  
  const updateMarketingTemplate = (id: string, templateUpdate: Partial<MarketingTemplate>) => {
    setMarketingTemplates(
      marketingTemplates.map(template => 
        template.id === id ? { ...template, ...templateUpdate } : template
      )
    );
  };
  
  const deleteMarketingTemplate = (id: string) => {
    setMarketingTemplates(marketingTemplates.filter(template => template.id !== id));
  };
  
  // Compute active campaigns
  const activeCampaigns = campaigns.filter(c => c.status === "Running");
  
  return (
    <CRMContext.Provider
      value={{
        campaigns,
        activeCampaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        
        leads,
        incrementLeads,
        conversionRate,
        setConversionRate,
        
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        
        selectedTimeRange,
        setSelectedTimeRange,
        
        referralSources,
        updateReferralSources,
        
        clientSegments,
        addClientSegment,
        updateClientSegment,
        deleteClientSegment,
        
        marketingTemplates,
        addMarketingTemplate,
        updateMarketingTemplate,
        deleteMarketingTemplate,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

// Hook for accessing CRM context
export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
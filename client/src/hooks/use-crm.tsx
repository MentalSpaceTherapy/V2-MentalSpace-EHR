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

export type ReferralPartner = {
  id: string;
  name: string;
  type: "Healthcare Provider" | "Community Organization" | "Former Client" | "Business" | "Educational Institution" | "Other";
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  partnerSince: string;
  activeStatus: "Active" | "Inactive" | "Potential";
  referralCount: number;
  conversionRate: number;
  notes?: string;
  lastContactDate?: string;
};

export type ContactHistory = {
  id: string;
  leadId: string;
  contactType: "Email" | "Phone" | "In-Person" | "Video" | "Text" | "Social Media";
  contactNumber: number; // 1st, 2nd, 3rd contact, etc.
  date: string;
  time: string;
  duration?: number;
  notes?: string;
  outcome: "Positive" | "Neutral" | "Negative" | "No Response";
  followUpDate?: string;
  followUpType?: string;
  completedBy: string;
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

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  notes?: string;
  dateAdded: string;
  lastContacted: string;
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
  
  // Referral partners
  referralPartners: ReferralPartner[];
  addReferralPartner: (partner: Omit<ReferralPartner, "id">) => void;
  updateReferralPartner: (id: string, partner: Partial<ReferralPartner>) => void;
  deleteReferralPartner: (id: string) => void;
  
  // Contact history
  contactHistory: ContactHistory[];
  addContactHistory: (contact: Omit<ContactHistory, "id">) => void;
  updateContactHistory: (id: string, contact: Partial<ContactHistory>) => void;
  deleteContactHistory: (id: string) => void;
  getLeadContactHistory: (leadId: string) => ContactHistory[];
  
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

const defaultReferralPartners: ReferralPartner[] = [
  {
    id: "partner1",
    name: "Oakwood Medical Center",
    type: "Healthcare Provider",
    contactPerson: "Dr. Sarah Johnson",
    email: "sjohnson@oakwoodmed.com",
    phone: "(555) 123-4567",
    address: "123 Oakwood Ave, Suite 300, Portland, OR 97205",
    partnerSince: "2023-04-15",
    activeStatus: "Active",
    referralCount: 18,
    conversionRate: 72.2,
    notes: "Primary care practice with focus on holistic health",
    lastContactDate: "2024-06-05"
  },
  {
    id: "partner2",
    name: "Riverdale Community Center",
    type: "Community Organization",
    contactPerson: "Michael Chen",
    email: "mchen@riverdalecommunity.org",
    phone: "(555) 234-5678",
    address: "456 Riverdale Blvd, Portland, OR 97215",
    partnerSince: "2023-08-22",
    activeStatus: "Active",
    referralCount: 12,
    conversionRate: 58.3,
    notes: "Community outreach programs for underserved populations",
    lastContactDate: "2024-05-28"
  },
  {
    id: "partner3",
    name: "Sunrise Wellness Group",
    type: "Healthcare Provider",
    contactPerson: "Dr. Emily Carter",
    email: "ecarter@sunrisewellness.com",
    phone: "(555) 345-6789",
    address: "789 Sunrise Lane, Portland, OR 97220",
    partnerSince: "2023-06-10",
    activeStatus: "Active",
    referralCount: 24,
    conversionRate: 83.3,
    notes: "Integrative medicine practice, frequent referrals for anxiety patients",
    lastContactDate: "2024-06-12"
  },
  {
    id: "partner4",
    name: "Portland State University",
    type: "Educational Institution",
    contactPerson: "Prof. James Wilson",
    email: "jwilson@psu.edu",
    phone: "(555) 456-7890",
    partnerSince: "2023-09-05",
    activeStatus: "Active",
    referralCount: 9,
    conversionRate: 66.7,
    notes: "Student counseling services overflow",
    lastContactDate: "2024-05-15"
  },
  {
    id: "partner5",
    name: "Harmony Wellness Spa",
    type: "Business",
    contactPerson: "Lisa Thompson",
    email: "lthompson@harmonywellness.com",
    phone: "(555) 567-8901",
    partnerSince: "2024-01-18",
    activeStatus: "Potential",
    referralCount: 2,
    conversionRate: 50.0,
    notes: "New partnership being developed",
    lastContactDate: "2024-06-01"
  }
];

const defaultContactHistory: ContactHistory[] = [
  {
    id: "contact1",
    leadId: "lead-1",
    contactType: "Email",
    contactNumber: 1,
    date: "2024-06-15",
    time: "10:30 AM",
    notes: "Initial outreach email introducing services",
    outcome: "Positive",
    followUpDate: "2024-06-17",
    followUpType: "Phone call",
    completedBy: "Sarah Williams"
  },
  {
    id: "contact2",
    leadId: "lead-1",
    contactType: "Phone",
    contactNumber: 2,
    date: "2024-06-17",
    time: "2:15 PM",
    duration: 12,
    notes: "Discussed service options, client expressed interest in anxiety treatment",
    outcome: "Positive",
    followUpDate: "2024-06-20",
    followUpType: "Video consultation",
    completedBy: "Sarah Williams"
  },
  {
    id: "contact3",
    leadId: "lead-1",
    contactType: "Video",
    contactNumber: 3,
    date: "2024-06-20",
    time: "11:00 AM",
    duration: 30,
    notes: "Initial consultation, discussed treatment plan",
    outcome: "Positive",
    followUpDate: "2024-06-27",
    followUpType: "First session",
    completedBy: "Dr. Jennifer Baker"
  },
  {
    id: "contact4",
    leadId: "lead-2",
    contactType: "Phone",
    contactNumber: 1,
    date: "2024-06-10",
    time: "9:45 AM",
    duration: 8,
    notes: "Client called inquiring about family therapy options",
    outcome: "Positive",
    followUpDate: "2024-06-12",
    followUpType: "Email with information",
    completedBy: "Michael Rodriguez"
  },
  {
    id: "contact5",
    leadId: "lead-2",
    contactType: "Email",
    contactNumber: 2,
    date: "2024-06-12",
    time: "3:30 PM",
    notes: "Sent detailed information about family therapy services and pricing",
    outcome: "Neutral",
    followUpDate: "2024-06-15",
    followUpType: "Phone call",
    completedBy: "Michael Rodriguez"
  },
  {
    id: "contact6",
    leadId: "lead-3",
    contactType: "Social Media",
    contactNumber: 1,
    date: "2024-06-05",
    time: "4:20 PM",
    notes: "Initial message through Instagram about depression services",
    outcome: "Positive",
    followUpDate: "2024-06-07",
    followUpType: "Phone call",
    completedBy: "Sarah Williams"
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
  
  // State for referral partners
  const [referralPartners, setReferralPartners] = useState<ReferralPartner[]>(defaultReferralPartners);
  
  // State for contact history
  const [contactHistory, setContactHistory] = useState<ContactHistory[]>(defaultContactHistory);
  
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
  
  // Referral partner methods
  const addReferralPartner = (partner: Omit<ReferralPartner, "id">) => {
    const newPartner = {
      ...partner,
      id: `partner${referralPartners.length + 1}`
    };
    setReferralPartners([...referralPartners, newPartner]);
  };
  
  const updateReferralPartner = (id: string, partnerUpdate: Partial<ReferralPartner>) => {
    setReferralPartners(
      referralPartners.map(partner => 
        partner.id === id ? { ...partner, ...partnerUpdate } : partner
      )
    );
  };
  
  const deleteReferralPartner = (id: string) => {
    setReferralPartners(referralPartners.filter(partner => partner.id !== id));
  };
  
  // Contact history methods
  const addContactHistory = (contact: Omit<ContactHistory, "id">) => {
    const newContact = {
      ...contact,
      id: `contact${contactHistory.length + 1}`
    };
    setContactHistory([...contactHistory, newContact]);
  };
  
  const updateContactHistory = (id: string, contactUpdate: Partial<ContactHistory>) => {
    setContactHistory(
      contactHistory.map(contact => 
        contact.id === id ? { ...contact, ...contactUpdate } : contact
      )
    );
  };
  
  const deleteContactHistory = (id: string) => {
    setContactHistory(contactHistory.filter(contact => contact.id !== id));
  };
  
  const getLeadContactHistory = (leadId: string) => {
    return contactHistory.filter(contact => contact.leadId === leadId)
      .sort((a, b) => a.contactNumber - b.contactNumber);
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
        
        referralPartners,
        addReferralPartner,
        updateReferralPartner,
        deleteReferralPartner,
        
        contactHistory,
        addContactHistory,
        updateContactHistory,
        deleteContactHistory,
        getLeadContactHistory,
        
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
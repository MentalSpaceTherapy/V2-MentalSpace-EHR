import { 
  users, clients, sessions, documentation, notifications, messages,
  leads, marketingCampaigns, marketingEvents, eventRegistrations, contactHistory, referralSources,
  documentTemplates, templateVersions,
  type User, type InsertUser,
  type Client, type InsertClient, type ExtendedClient,
  type Session, type InsertSession,
  type Documentation, type InsertDocumentation,
  type Notification, type InsertNotification,
  type Message, type InsertMessage,
  type Lead, type InsertLead,
  type MarketingCampaign, type InsertMarketingCampaign,
  type MarketingEvent, type InsertMarketingEvent,
  type EventRegistration, type InsertEventRegistration,
  type ContactHistoryRecord, type InsertContactHistory,
  type ReferralSource, type InsertReferralSource,
  type DocumentTemplate, type InsertDocumentTemplate,
  type TemplateVersion, type InsertTemplateVersion
} from "@shared/schema";
import session from "express-session";

// Storage interface with comprehensive CRUD methods for our EHR application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClients(therapistId?: number, status?: string): Promise<Client[]>;
  createClient(client: ExtendedClient): Promise<Client>;
  updateClient(id: number, client: Partial<ExtendedClient>): Promise<Client | undefined>;
  
  // Session/Appointment methods
  getSession(id: number): Promise<Session | undefined>;
  getSessions(filters?: {
    clientId?: number;
    therapistId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    reminderSent?: boolean;
    reminderTime?: { lte?: Date; gte?: Date };
    documentationStatus?: string;
    billingStatus?: string;
    externalCalendarType?: string;
  }): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // Documentation methods
  getDocument(id: number): Promise<Documentation | undefined>;
  getDocuments(filters?: {
    clientId?: number;
    therapistId?: number;
    sessionId?: number;
    type?: string;
    status?: string;
  }): Promise<Documentation[]>;
  createDocument(doc: InsertDocumentation): Promise<Documentation>;
  updateDocument(id: number, doc: Partial<InsertDocumentation>): Promise<Documentation | undefined>;
  
  // Notification methods
  getNotifications(userId: number, isRead?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Message methods
  getMessages(clientId: number, therapistId: number): Promise<Message[]>;
  getClientMessages(clientId: number): Promise<Message[]>;
  getTherapistMessages(therapistId: number): Promise<Message[]>;
  getUnreadMessages(therapistId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Lead management methods
  getLead(id: number): Promise<Lead | undefined>;
  getLeads(filters?: {
    assignedToId?: number;
    status?: string;
    stage?: string;
    source?: string;
    sourceId?: number;
  }): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  convertLeadToClient(leadId: number, clientData: ExtendedClient): Promise<{
    lead: Lead;
    client: Client;
  }>;
  
  // Marketing campaign methods
  getCampaign(id: number): Promise<MarketingCampaign | undefined>;
  getCampaigns(filters?: {
    createdById?: number;
    status?: string;
    type?: string;
  }): Promise<MarketingCampaign[]>;
  createCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign>;
  updateCampaign(id: number, campaign: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  updateCampaignStats(id: number, stats: Record<string, any>): Promise<MarketingCampaign | undefined>;
  
  // Marketing event methods
  getEvent(id: number): Promise<MarketingEvent | undefined>;
  getEvents(filters?: {
    createdById?: number;
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MarketingEvent[]>;
  createEvent(event: InsertMarketingEvent): Promise<MarketingEvent>;
  updateEvent(id: number, event: Partial<InsertMarketingEvent>): Promise<MarketingEvent | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event registration methods
  getEventRegistration(id: number): Promise<EventRegistration | undefined>;
  getEventRegistrations(filters?: {
    eventId?: number;
    leadId?: number;
    clientId?: number;
    email?: string;
    status?: string;
  }): Promise<EventRegistration[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: number, registration: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined>;
  deleteEventRegistration(id: number): Promise<boolean>;
  
  // Contact history methods
  getContactHistoryRecord(id: number): Promise<ContactHistoryRecord | undefined>;
  getContactHistory(filters?: {
    leadId?: number;
    clientId?: number;
    completedById?: number;
    contactType?: string;
    outcome?: string;
    startDate?: Date;
    endDate?: Date;
    campaignId?: number;
  }): Promise<ContactHistoryRecord[]>;
  createContactHistory(contactRecord: InsertContactHistory): Promise<ContactHistoryRecord>;
  updateContactHistory(id: number, contactRecord: Partial<InsertContactHistory>): Promise<ContactHistoryRecord | undefined>;
  deleteContactHistory(id: number): Promise<boolean>;
  
  // Referral source methods
  getReferralSource(id: number): Promise<ReferralSource | undefined>;
  getReferralSources(filters?: {
    type?: string;
    activeStatus?: string;
    createdById?: number;
  }): Promise<ReferralSource[]>;
  createReferralSource(source: InsertReferralSource): Promise<ReferralSource>;
  updateReferralSource(id: number, source: Partial<InsertReferralSource>): Promise<ReferralSource | undefined>;
  deleteReferralSource(id: number): Promise<boolean>;
  
  // Document template methods
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  getDocumentTemplates(filters?: {
    type?: string;
    status?: string;
    createdById?: number;
    isGlobal?: boolean;
    requiresApproval?: boolean;
    approvalStatus?: string;
    organizationId?: number;
  }): Promise<DocumentTemplate[]>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  updateDocumentTemplate(id: number, template: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined>;
  deleteDocumentTemplate(id: number): Promise<boolean>;
  
  // Template version methods
  getTemplateVersion(id: number): Promise<TemplateVersion | undefined>;
  getTemplateVersions(filters?: {
    templateId?: number;
    isLatest?: boolean;
    createdById?: number;
    approvalStatus?: string;
  }): Promise<TemplateVersion[]>;
  createTemplateVersion(version: InsertTemplateVersion): Promise<TemplateVersion>;
  updateTemplateVersion(id: number, version: Partial<InsertTemplateVersion>): Promise<TemplateVersion | undefined>;
  deleteTemplateVersion(id: number): Promise<boolean>;
  
  // Template version workflows
  setLatestTemplateVersion(templateId: number, versionId: number): Promise<DocumentTemplate>;
  approveTemplateVersion(versionId: number, approverId: number, notes?: string): Promise<TemplateVersion>;
  rejectTemplateVersion(versionId: number, approverId: number, reason: string): Promise<TemplateVersion>;
  
  // Session store for auth
  sessionStore: session.Store;
}

// Import the database storage implementation
import { DatabaseStorage } from './database-storage';

// Export an instance of the database storage
export const storage = new DatabaseStorage();
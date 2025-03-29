import { 
  users, clients, sessions, documentation, notifications, messages,
  leads, marketingCampaigns, marketingEvents, eventRegistrations, contactHistory, referralSources,
  documentTemplates, templateVersions, signatureRequests, signatureFields, signatureEvents,
  oauthStates,
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
  type TemplateVersion, type InsertTemplateVersion,
  type SignatureRequest, type InsertSignatureRequest,
  type SignatureField, type InsertSignatureField,
  type SignatureEvent, type InsertSignatureEvent,
  type OAuthState, type InsertOAuthState
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pkg from 'pg';
const { Pool } = pkg;

// Create a PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize the PostgreSQL session store
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClients(therapistId?: number, status?: string): Promise<Client[]> {
    const result = await db.select().from(clients);
    
    // Filter in memory to avoid typing issues
    let filteredClients = result;
    
    if (therapistId !== undefined) {
      filteredClients = filteredClients.filter(client => 
        client.primaryTherapistId === therapistId
      );
    }
    
    if (status !== undefined) {
      filteredClients = filteredClients.filter(client => 
        client.status === status
      );
    }
    
    return filteredClients;
  }

  async createClient(clientData: ExtendedClient): Promise<Client> {
    // Extract the base client fields
    const { 
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      insuranceProvider, insurancePolicyNumber, insuranceGroupNumber, insuranceCopay, insuranceDeductible,
      ...baseClientData 
    } = clientData;
    
    // Create the client record
    const [client] = await db.insert(clients).values(baseClientData).returning();
    
    return client;
  }

  async updateClient(id: number, clientData: Partial<ExtendedClient>): Promise<Client | undefined> {
    // Extract the base client fields
    const { 
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      insuranceProvider, insurancePolicyNumber, insuranceGroupNumber, insuranceCopay, insuranceDeductible,
      ...baseClientData 
    } = clientData;
    
    // Update the client record
    const [updatedClient] = await db
      .update(clients)
      .set(baseClientData)
      .where(eq(clients.id, id))
      .returning();
    
    return updatedClient;
  }

  // Session/Appointment methods
  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessions(filters?: {
    clientId?: number;
    therapistId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<Session[]> {
    const result = await db.select().from(sessions);
    
    // Filter in memory to avoid typing issues
    let filteredSessions = result;
    
    if (filters) {
      if (filters.clientId !== undefined) {
        filteredSessions = filteredSessions.filter(session => 
          session.clientId === filters.clientId
        );
      }
      
      if (filters.therapistId !== undefined) {
        filteredSessions = filteredSessions.filter(session => 
          session.therapistId === filters.therapistId
        );
      }
      
      if (filters.status !== undefined) {
        filteredSessions = filteredSessions.filter(session => 
          session.status === filters.status
        );
      }
      
      if (filters.startDate && filters.endDate) {
        filteredSessions = filteredSessions.filter(session => 
          session.startTime >= filters.startDate! && 
          session.startTime <= filters.endDate!
        );
      } else if (filters.startDate) {
        filteredSessions = filteredSessions.filter(session => 
          session.startTime >= filters.startDate!
        );
      } else if (filters.endDate) {
        filteredSessions = filteredSessions.filter(session => 
          session.startTime <= filters.endDate!
        );
      }
    }
    
    // Sort by date, most recent first
    return filteredSessions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(sessionData).returning();
    return session;
  }

  async updateSession(id: number, sessionData: Partial<InsertSession>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(sessionData)
      .where(eq(sessions.id, id))
      .returning();
    
    return updatedSession;
  }

  async deleteSession(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(sessions)
        .where(eq(sessions.id, id))
        .returning({ id: sessions.id });
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting session ${id}:`, error);
      return false;
    }
  }

  // Documentation methods
  async getDocument(id: number): Promise<Documentation | undefined> {
    const [document] = await db.select().from(documentation).where(eq(documentation.id, id));
    return document;
  }

  async getDocuments(filters?: {
    clientId?: number;
    therapistId?: number;
    sessionId?: number;
    type?: string;
    status?: string;
  }): Promise<Documentation[]> {
    const result = await db.select().from(documentation);
    
    // Filter in memory to avoid typing issues
    let filteredDocs = result;
    
    if (filters) {
      if (filters.clientId !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.clientId === filters.clientId
        );
      }
      
      if (filters.therapistId !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.therapistId === filters.therapistId
        );
      }
      
      if (filters.sessionId !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.sessionId === filters.sessionId
        );
      }
      
      if (filters.type !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.type === filters.type
        );
      }
      
      if (filters.status !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.status === filters.status
        );
      }
    }
    
    // Sort by date created, most recent first
    return filteredDocs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createDocument(docData: InsertDocumentation): Promise<Documentation> {
    const [document] = await db.insert(documentation).values(docData).returning();
    return document;
  }

  async updateDocument(id: number, docData: Partial<InsertDocumentation>): Promise<Documentation | undefined> {
    const [updatedDocument] = await db
      .update(documentation)
      .set(docData)
      .where(eq(documentation.id, id))
      .returning();
    
    return updatedDocument;
  }

  // Notification methods
  async getNotifications(userId: number, isRead?: boolean): Promise<Notification[]> {
    const result = await db.select().from(notifications);
    
    // Filter in memory to avoid typing issues
    let filteredNotifications = result.filter(notification => 
      notification.userId === userId
    );
    
    if (isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(notification => 
        notification.isRead === isRead
      );
    }
    
    // Sort by date created, most recent first
    return filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return updatedNotification;
  }

  // Message methods
  async getMessages(clientId: number, therapistId: number): Promise<Message[]> {
    const result = await db.select()
      .from(messages)
      .where(eq(messages.clientId, clientId) && eq(messages.therapistId, therapistId));
    
    // Sort by date created, most recent first
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getClientMessages(clientId: number): Promise<Message[]> {
    const result = await db.select()
      .from(messages)
      .where(eq(messages.clientId, clientId));
    
    // Sort by date created, most recent first
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTherapistMessages(therapistId: number): Promise<Message[]> {
    const result = await db.select()
      .from(messages)
      .where(eq(messages.therapistId, therapistId));
    
    // Sort by date created, most recent first
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUnreadMessages(therapistId: number): Promise<Message[]> {
    const result = await db.select()
      .from(messages)
      .where(eq(messages.therapistId, therapistId) && eq(messages.isRead, false));
    
    // Sort by date created, most recent first
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    
    return updatedMessage;
  }

  //----------------------
  // Lead Management Methods
  //----------------------
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeads(filters?: {
    assignedToId?: number;
    status?: string;
    stage?: string;
    source?: string;
    sourceId?: number;
  }): Promise<Lead[]> {
    const result = await db.select().from(leads);
    
    // Filter in memory to avoid typing issues
    let filteredLeads = result;
    
    if (filters) {
      if (filters.assignedToId !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.assignedToId === filters.assignedToId
        );
      }
      
      if (filters.status !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.status === filters.status
        );
      }
      
      if (filters.stage !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.stage === filters.stage
        );
      }
      
      if (filters.source !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.source === filters.source
        );
      }
      
      if (filters.sourceId !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.sourceId === filters.sourceId
        );
      }
    }
    
    // Sort by date, most recent first
    return filteredLeads.sort((a, b) => 
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
  }

  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(leadData).returning();
    return lead;
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set(leadData)
      .where(eq(leads.id, id))
      .returning();
    
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    try {
      await db.delete(leads).where(eq(leads.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting lead:", error);
      return false;
    }
  }

  async convertLeadToClient(leadId: number, clientData: ExtendedClient): Promise<{
    lead: Lead;
    client: Client;
  }> {
    // Get the lead
    const lead = await this.getLead(leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    // Create the client
    const client = await this.createClient(clientData);

    // Update the lead to mark as converted
    // We need to cast the update values to any because some properties might not be in the InsertLead type
    const updatedLead = await this.updateLead(leadId, {
      status: "converted",
      // These properties need to be cast since they're not in the insert schema
      conversionDate: new Date() as any,
      convertedToClientId: client.id as any
    });

    if (!updatedLead) {
      throw new Error(`Failed to update lead with ID ${leadId}`);
    }

    return {
      lead: updatedLead,
      client
    };
  }

  //----------------------
  // Marketing Campaign Methods
  //----------------------
  async getCampaign(id: number): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    return campaign;
  }

  async getCampaigns(filters?: {
    createdById?: number;
    status?: string;
    type?: string;
  }): Promise<MarketingCampaign[]> {
    const result = await db.select().from(marketingCampaigns);
    
    // Filter in memory to avoid typing issues
    let filteredCampaigns = result;
    
    if (filters) {
      if (filters.createdById !== undefined) {
        filteredCampaigns = filteredCampaigns.filter(campaign => 
          campaign.createdById === filters.createdById
        );
      }
      
      if (filters.status !== undefined) {
        filteredCampaigns = filteredCampaigns.filter(campaign => 
          campaign.status === filters.status
        );
      }
      
      if (filters.type !== undefined) {
        filteredCampaigns = filteredCampaigns.filter(campaign => 
          campaign.type === filters.type
        );
      }
    }
    
    // Sort by date, most recent first
    return filteredCampaigns.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCampaign(campaignData: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [campaign] = await db.insert(marketingCampaigns).values(campaignData).returning();
    return campaign;
  }

  async updateCampaign(id: number, campaignData: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(marketingCampaigns)
      .set(campaignData)
      .where(eq(marketingCampaigns.id, id))
      .returning();
    
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    try {
      await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return false;
    }
  }

  async updateCampaignStats(id: number, stats: Record<string, any>): Promise<MarketingCampaign | undefined> {
    // Get the current campaign
    const campaign = await this.getCampaign(id);
    if (!campaign) {
      return undefined;
    }

    // Merge the new stats with existing stats
    // Handle the case where campaign.stats might be null or undefined
    const existingStats = campaign.stats || {};
    const updatedStats = {
      ...existingStats,
      ...stats
    };

    // Update the campaign
    return this.updateCampaign(id, { stats: updatedStats });
  }

  //----------------------
  // Marketing Event Methods
  //----------------------
  async getEvent(id: number): Promise<MarketingEvent | undefined> {
    const [event] = await db.select().from(marketingEvents).where(eq(marketingEvents.id, id));
    return event;
  }

  async getEvents(filters?: {
    createdById?: number;
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MarketingEvent[]> {
    const result = await db.select().from(marketingEvents);
    
    // Filter in memory to avoid typing issues
    let filteredEvents = result;
    
    if (filters) {
      if (filters.createdById !== undefined) {
        filteredEvents = filteredEvents.filter(event => 
          event.createdById === filters.createdById
        );
      }
      
      if (filters.status !== undefined) {
        filteredEvents = filteredEvents.filter(event => 
          event.status === filters.status
        );
      }
      
      if (filters.type !== undefined) {
        filteredEvents = filteredEvents.filter(event => 
          event.type === filters.type
        );
      }
      
      if (filters.startDate && filters.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.date >= filters.startDate! && 
          event.date <= filters.endDate!
        );
      } else if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.date >= filters.startDate!
        );
      } else if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.date <= filters.endDate!
        );
      }
    }
    
    // Sort by date
    return filteredEvents.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createEvent(eventData: InsertMarketingEvent): Promise<MarketingEvent> {
    const [event] = await db.insert(marketingEvents).values(eventData).returning();
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertMarketingEvent>): Promise<MarketingEvent | undefined> {
    const [updatedEvent] = await db
      .update(marketingEvents)
      .set(eventData)
      .where(eq(marketingEvents.id, id))
      .returning();
    
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      await db.delete(marketingEvents).where(eq(marketingEvents.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  //----------------------
  // Event Registration Methods
  //----------------------
  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    const [registration] = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id));
    return registration;
  }

  async getEventRegistrations(filters?: {
    eventId?: number;
    leadId?: number;
    clientId?: number;
    email?: string;
    status?: string;
  }): Promise<EventRegistration[]> {
    const result = await db.select().from(eventRegistrations);
    
    // Filter in memory to avoid typing issues
    let filteredRegistrations = result;
    
    if (filters) {
      if (filters.eventId !== undefined) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.eventId === filters.eventId
        );
      }
      
      if (filters.leadId !== undefined) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.leadId === filters.leadId
        );
      }
      
      if (filters.clientId !== undefined) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.clientId === filters.clientId
        );
      }
      
      if (filters.email !== undefined) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.email === filters.email
        );
      }
      
      if (filters.status !== undefined) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.status === filters.status
        );
      }
    }
    
    // Sort by registration date, newest first
    return filteredRegistrations.sort((a, b) => 
      new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
    );
  }

  async createEventRegistration(registrationData: InsertEventRegistration): Promise<EventRegistration> {
    const [registration] = await db.insert(eventRegistrations).values(registrationData).returning();
    return registration;
  }

  async updateEventRegistration(id: number, registrationData: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined> {
    const [updatedRegistration] = await db
      .update(eventRegistrations)
      .set(registrationData)
      .where(eq(eventRegistrations.id, id))
      .returning();
    
    return updatedRegistration;
  }

  async deleteEventRegistration(id: number): Promise<boolean> {
    try {
      await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting event registration:", error);
      return false;
    }
  }

  //----------------------
  // Contact History Methods
  //----------------------
  async getContactHistoryRecord(id: number): Promise<ContactHistoryRecord | undefined> {
    const [record] = await db.select().from(contactHistory).where(eq(contactHistory.id, id));
    return record;
  }

  async getContactHistory(filters?: {
    leadId?: number;
    clientId?: number;
    completedById?: number;
    contactType?: string;
    outcome?: string;
    startDate?: Date;
    endDate?: Date;
    campaignId?: number;
  }): Promise<ContactHistoryRecord[]> {
    const result = await db.select().from(contactHistory);
    
    // Filter in memory to avoid typing issues
    let filteredRecords = result;
    
    if (filters) {
      if (filters.leadId !== undefined) {
        filteredRecords = filteredRecords.filter(record => 
          record.leadId === filters.leadId
        );
      }
      
      if (filters.clientId !== undefined) {
        filteredRecords = filteredRecords.filter(record => 
          record.clientId === filters.clientId
        );
      }
      
      if (filters.completedById !== undefined) {
        filteredRecords = filteredRecords.filter(record => 
          record.completedById === filters.completedById
        );
      }
      
      if (filters.contactType !== undefined) {
        filteredRecords = filteredRecords.filter(record => 
          record.contactType === filters.contactType
        );
      }
      
      if (filters.outcome !== undefined) {
        filteredRecords = filteredRecords.filter(record => 
          record.outcome === filters.outcome
        );
      }
      
      if (filters.campaignId !== undefined) {
        filteredRecords = filteredRecords.filter(record => 
          record.campaignId === filters.campaignId
        );
      }
      
      if (filters.startDate && filters.endDate) {
        filteredRecords = filteredRecords.filter(record => 
          record.date >= filters.startDate! && 
          record.date <= filters.endDate!
        );
      } else if (filters.startDate) {
        filteredRecords = filteredRecords.filter(record => 
          record.date >= filters.startDate!
        );
      } else if (filters.endDate) {
        filteredRecords = filteredRecords.filter(record => 
          record.date <= filters.endDate!
        );
      }
    }
    
    // Sort by date, most recent first
    return filteredRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createContactHistory(contactRecord: InsertContactHistory): Promise<ContactHistoryRecord> {
    const [record] = await db.insert(contactHistory).values(contactRecord).returning();
    return record;
  }

  async updateContactHistory(id: number, contactRecord: Partial<InsertContactHistory>): Promise<ContactHistoryRecord | undefined> {
    const [updatedRecord] = await db
      .update(contactHistory)
      .set(contactRecord)
      .where(eq(contactHistory.id, id))
      .returning();
    
    return updatedRecord;
  }

  async deleteContactHistory(id: number): Promise<boolean> {
    try {
      await db.delete(contactHistory).where(eq(contactHistory.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting contact history record:", error);
      return false;
    }
  }

  //----------------------
  // Referral Source Methods
  //----------------------
  async getReferralSource(id: number): Promise<ReferralSource | undefined> {
    const [source] = await db.select().from(referralSources).where(eq(referralSources.id, id));
    return source;
  }

  async getReferralSources(filters?: {
    type?: string;
    activeStatus?: string;
    createdById?: number;
  }): Promise<ReferralSource[]> {
    const result = await db.select().from(referralSources);
    
    // Filter in memory to avoid typing issues
    let filteredSources = result;
    
    if (filters) {
      if (filters.type !== undefined) {
        filteredSources = filteredSources.filter(source => 
          source.type === filters.type
        );
      }
      
      if (filters.activeStatus !== undefined) {
        filteredSources = filteredSources.filter(source => 
          source.activeStatus === filters.activeStatus
        );
      }
      
      if (filters.createdById !== undefined) {
        filteredSources = filteredSources.filter(source => 
          source.createdById === filters.createdById
        );
      }
    }
    
    // Sort by name
    return filteredSources.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createReferralSource(sourceData: InsertReferralSource): Promise<ReferralSource> {
    const [source] = await db.insert(referralSources).values(sourceData).returning();
    return source;
  }

  async updateReferralSource(id: number, sourceData: Partial<InsertReferralSource>): Promise<ReferralSource | undefined> {
    const [updatedSource] = await db
      .update(referralSources)
      .set(sourceData)
      .where(eq(referralSources.id, id))
      .returning();
    
    return updatedSource;
  }

  async deleteReferralSource(id: number): Promise<boolean> {
    try {
      await db.delete(referralSources).where(eq(referralSources.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting referral source:", error);
      return false;
    }
  }

  //----------------------
  // Document Template Methods
  //----------------------
  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
    return template;
  }

  async getDocumentTemplates(filters?: {
    type?: string;
    status?: string;
    createdById?: number;
    isGlobal?: boolean;
    requiresApproval?: boolean;
    approvalStatus?: string;
    organizationId?: number;
  }): Promise<DocumentTemplate[]> {
    const result = await db.select().from(documentTemplates);
    
    // Filter in memory to avoid typing issues
    let filteredTemplates = result;
    
    if (filters) {
      if (filters.type !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.type === filters.type
        );
      }
      
      if (filters.status !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.status === filters.status
        );
      }
      
      if (filters.createdById !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.createdById === filters.createdById
        );
      }
      
      if (filters.isGlobal !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.isGlobal === filters.isGlobal
        );
      }
      
      if (filters.requiresApproval !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.requiresApproval === filters.requiresApproval
        );
      }
      
      if (filters.approvalStatus !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.approvalStatus === filters.approvalStatus
        );
      }
      
      if (filters.organizationId !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.organizationId === filters.organizationId
        );
      }
    }
    
    // Sort by name
    return filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createDocumentTemplate(templateData: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [template] = await db.insert(documentTemplates).values(templateData).returning();
    return template;
  }

  async updateDocumentTemplate(id: number, templateData: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(documentTemplates)
      .set(templateData)
      .where(eq(documentTemplates.id, id))
      .returning();
    
    return updatedTemplate;
  }

  async deleteDocumentTemplate(id: number): Promise<boolean> {
    try {
      // First check if there are any template versions
      const versions = await db.select()
        .from(templateVersions)
        .where(eq(templateVersions.templateId, id));
      
      if (versions.length > 0) {
        // Delete all template versions first
        await db.delete(templateVersions).where(eq(templateVersions.templateId, id));
      }
      
      // Then delete the template
      await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting document template:", error);
      return false;
    }
  }

  //----------------------
  // Template Version Methods
  //----------------------
  async getTemplateVersion(id: number): Promise<TemplateVersion | undefined> {
    const [version] = await db.select().from(templateVersions).where(eq(templateVersions.id, id));
    return version;
  }

  async getTemplateVersions(filters?: {
    templateId?: number;
    isLatest?: boolean;
    createdById?: number;
    approvalStatus?: string;
  }): Promise<TemplateVersion[]> {
    const result = await db.select().from(templateVersions);
    
    // Filter in memory to avoid typing issues
    let filteredVersions = result;
    
    if (filters) {
      if (filters.templateId !== undefined) {
        filteredVersions = filteredVersions.filter(version => 
          version.templateId === filters.templateId
        );
      }
      
      if (filters.isLatest !== undefined) {
        filteredVersions = filteredVersions.filter(version => 
          version.isLatest === filters.isLatest
        );
      }
      
      if (filters.createdById !== undefined) {
        filteredVersions = filteredVersions.filter(version => 
          version.createdById === filters.createdById
        );
      }
      
      if (filters.approvalStatus !== undefined) {
        filteredVersions = filteredVersions.filter(version => 
          version.approvalStatus === filters.approvalStatus
        );
      }
    }
    
    // Sort by version number, highest first
    return filteredVersions.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async createTemplateVersion(versionData: InsertTemplateVersion): Promise<TemplateVersion> {
    // Get the template ID
    const templateId = versionData.templateId;
    
    // Find the latest version number for this template
    const existingVersions = await this.getTemplateVersions({ templateId });
    const versionNumber = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1 
      : 1;
    
    // If this is the first version, set it as the latest
    const isLatest = existingVersions.length === 0 || versionData.isLatest;
    
    // If we're setting this as the latest, unset all others
    if (isLatest && existingVersions.length > 0) {
      await db.update(templateVersions)
        .set({ isLatest: false })
        .where(eq(templateVersions.templateId, templateId));
    }
    
    // Create the new version
    const [version] = await db.insert(templateVersions)
      .values({
        ...versionData,
        versionNumber,
        isLatest
      })
      .returning();
    
    // Update the template's currentVersionId if this is latest
    if (isLatest) {
      await db.update(documentTemplates)
        .set({ currentVersionId: version.id })
        .where(eq(documentTemplates.id, templateId));
    }
    
    return version;
  }

  async updateTemplateVersion(id: number, versionData: Partial<InsertTemplateVersion>): Promise<TemplateVersion | undefined> {
    // Get the original version data
    const originalVersion = await this.getTemplateVersion(id);
    if (!originalVersion) {
      return undefined;
    }
    
    // If we're changing isLatest to true, update other versions
    if (versionData.isLatest === true && !originalVersion.isLatest) {
      await db.update(templateVersions)
        .set({ isLatest: false })
        .where(eq(templateVersions.templateId, originalVersion.templateId));
      
      // Update the template's currentVersionId
      await db.update(documentTemplates)
        .set({ currentVersionId: id })
        .where(eq(documentTemplates.id, originalVersion.templateId));
    }
    
    // Update the version
    const [updatedVersion] = await db
      .update(templateVersions)
      .set(versionData)
      .where(eq(templateVersions.id, id))
      .returning();
    
    return updatedVersion;
  }

  async deleteTemplateVersion(id: number): Promise<boolean> {
    try {
      // Get the version to check if it's the latest
      const version = await this.getTemplateVersion(id);
      if (!version) {
        return false;
      }
      
      // Delete the version
      await db.delete(templateVersions).where(eq(templateVersions.id, id));
      
      // If this was the latest version, update the template and set a new latest
      if (version.isLatest) {
        const remainingVersions = await this.getTemplateVersions({ 
          templateId: version.templateId 
        });
        
        if (remainingVersions.length > 0) {
          // Find the highest version number
          const latestVersion = remainingVersions.reduce((prev, current) => 
            (prev.versionNumber > current.versionNumber) ? prev : current
          );
          
          // Set as latest
          await db.update(templateVersions)
            .set({ isLatest: true })
            .where(eq(templateVersions.id, latestVersion.id));
          
          // Update the template's currentVersionId
          await db.update(documentTemplates)
            .set({ currentVersionId: latestVersion.id })
            .where(eq(documentTemplates.id, version.templateId));
        } else {
          // No versions left, set currentVersionId to null
          await db.update(documentTemplates)
            .set({ currentVersionId: null })
            .where(eq(documentTemplates.id, version.templateId));
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting template version:", error);
      return false;
    }
  }

  //----------------------
  // Template Version Workflows
  //----------------------
  async setLatestTemplateVersion(templateId: number, versionId: number): Promise<DocumentTemplate> {
    // Verify template and version exist
    const template = await this.getDocumentTemplate(templateId);
    const version = await this.getTemplateVersion(versionId);
    
    if (!template || !version || version.templateId !== templateId) {
      throw new Error("Invalid template or version ID");
    }
    
    // Update all versions to not be latest
    await db.update(templateVersions)
      .set({ isLatest: false })
      .where(eq(templateVersions.templateId, templateId));
    
    // Set the specified version as latest
    await db.update(templateVersions)
      .set({ isLatest: true })
      .where(eq(templateVersions.id, versionId));
    
    // Update the template's currentVersionId
    const [updatedTemplate] = await db.update(documentTemplates)
      .set({ 
        currentVersionId: versionId,
        updatedAt: new Date()
      })
      .where(eq(documentTemplates.id, templateId))
      .returning();
    
    return updatedTemplate;
  }

  async approveTemplateVersion(versionId: number, approverId: number, notes?: string): Promise<TemplateVersion> {
    // Get the version
    const version = await this.getTemplateVersion(versionId);
    if (!version) {
      throw new Error(`Template version with ID ${versionId} not found`);
    }
    
    // Update the version
    const [updatedVersion] = await db.update(templateVersions)
      .set({
        approvalStatus: "approved",
        approvedById: approverId,
        approvedAt: new Date(),
        notes: notes || version.notes
      })
      .where(eq(templateVersions.id, versionId))
      .returning();
    
    // Also update the template's approval status if needed
    const template = await this.getDocumentTemplate(version.templateId);
    if (template && template.approvalStatus !== "approved") {
      await db.update(documentTemplates)
        .set({
          approvalStatus: "approved",
          approvedById: approverId,
          approvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(documentTemplates.id, version.templateId));
    }
    
    return updatedVersion;
  }

  async rejectTemplateVersion(versionId: number, approverId: number, reason: string): Promise<TemplateVersion> {
    // Get the version
    const version = await this.getTemplateVersion(versionId);
    if (!version) {
      throw new Error(`Template version with ID ${versionId} not found`);
    }
    
    // Update the version
    const [updatedVersion] = await db.update(templateVersions)
      .set({
        approvalStatus: "rejected",
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: reason
      })
      .where(eq(templateVersions.id, versionId))
      .returning();
    
    // Also update the template's approval status
    await db.update(documentTemplates)
      .set({
        approvalStatus: "rejected",
        updatedAt: new Date()
      })
      .where(eq(documentTemplates.id, version.templateId));
    
    return updatedVersion;
  }

  //----------------------
  // E-Signature Request Methods
  //----------------------
  async getSignatureRequest(id: number): Promise<SignatureRequest | undefined> {
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.id, id));
    return request;
  }

  async getSignatureRequests(filters?: {
    documentId?: number;
    requestedById?: number;
    requestedForId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SignatureRequest[]> {
    const result = await db.select().from(signatureRequests);
    
    // Filter in memory to avoid typing issues
    let filteredRequests = result;
    
    if (filters) {
      if (filters.documentId !== undefined) {
        filteredRequests = filteredRequests.filter(req => 
          req.documentId === filters.documentId
        );
      }
      
      if (filters.requestedById !== undefined) {
        filteredRequests = filteredRequests.filter(req => 
          req.requestedById === filters.requestedById
        );
      }
      
      if (filters.requestedForId !== undefined) {
        filteredRequests = filteredRequests.filter(req => 
          req.requestedForId === filters.requestedForId
        );
      }
      
      if (filters.status !== undefined) {
        filteredRequests = filteredRequests.filter(req => 
          req.status === filters.status
        );
      }
      
      if (filters.startDate && filters.endDate) {
        filteredRequests = filteredRequests.filter(req => 
          req.requestedAt >= filters.startDate! && 
          req.requestedAt <= filters.endDate!
        );
      } else if (filters.startDate) {
        filteredRequests = filteredRequests.filter(req => 
          req.requestedAt >= filters.startDate!
        );
      } else if (filters.endDate) {
        filteredRequests = filteredRequests.filter(req => 
          req.requestedAt <= filters.endDate!
        );
      }
    }
    
    // Sort by date requested, most recent first
    return filteredRequests.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  async createSignatureRequest(request: InsertSignatureRequest): Promise<SignatureRequest> {
    // Generate a unique access URL if not provided
    const requestWithDefaults: InsertSignatureRequest = {
      ...request,
      // Generate a random access URL if not provided
      accessUrl: request.accessUrl || crypto.randomUUID(),
      status: request.status || "pending"
    };
    
    const [signatureRequest] = await db.insert(signatureRequests).values(requestWithDefaults).returning();
    return signatureRequest;
  }

  async updateSignatureRequest(id: number, requestData: Partial<InsertSignatureRequest>): Promise<SignatureRequest | undefined> {
    const [updatedRequest] = await db
      .update(signatureRequests)
      .set({
        ...requestData
      })
      .where(eq(signatureRequests.id, id))
      .returning();
    
    return updatedRequest;
  }

  async deleteSignatureRequest(id: number): Promise<boolean> {
    try {
      // First delete any associated fields
      await db.delete(signatureFields).where(eq(signatureFields.requestId, id));
      
      // Then delete any associated events
      await db.delete(signatureEvents).where(eq(signatureEvents.requestId, id));
      
      // Finally delete the request
      await db.delete(signatureRequests).where(eq(signatureRequests.id, id));
      
      return true;
    } catch (error) {
      console.error(`Error deleting signature request ${id}:`, error);
      return false;
    }
  }

  async getSignatureRequestByAccessUrl(accessUrl: string): Promise<SignatureRequest | undefined> {
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.accessUrl, accessUrl));
    return request;
  }

  async completeSignatureRequest(id: number): Promise<SignatureRequest> {
    const [updatedRequest] = await db
      .update(signatureRequests)
      .set({
        status: "completed",
        completedAt: new Date()
      })
      .where(eq(signatureRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Failed to complete signature request with ID ${id}`);
    }
    
    // Log the completion event
    await this.createSignatureEvent({
      requestId: id,
      eventType: "completed",
      metadata: { timestamp: new Date().toISOString() }
    });
    
    return updatedRequest;
  }

  async rejectSignatureRequest(id: number, rejectionReason: string): Promise<SignatureRequest> {
    const [updatedRequest] = await db
      .update(signatureRequests)
      .set({
        status: "rejected",
        rejectionReason,
        rejectedAt: new Date()
      })
      .where(eq(signatureRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Failed to reject signature request with ID ${id}`);
    }
    
    // Log the rejection event
    await this.createSignatureEvent({
      requestId: id,
      eventType: "rejected",
      metadata: { 
        timestamp: new Date().toISOString(),
        reason: rejectionReason
      }
    });
    
    return updatedRequest;
  }

  async incrementReminderCount(id: number): Promise<SignatureRequest> {
    // Get current reminder count
    const request = await this.getSignatureRequest(id);
    if (!request) {
      throw new Error(`Signature request with ID ${id} not found`);
    }
    
    const [updatedRequest] = await db
      .update(signatureRequests)
      .set({
        remindersSent: (request.remindersSent || 0) + 1,
        lastReminderSent: new Date()
      })
      .where(eq(signatureRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Failed to increment reminder count for signature request with ID ${id}`);
    }
    
    // Log the reminder event
    await this.createSignatureEvent({
      requestId: id,
      eventType: "reminder_sent",
      metadata: { 
        timestamp: new Date().toISOString(),
        reminderCount: updatedRequest.remindersSent
      }
    });
    
    return updatedRequest;
  }

  //----------------------
  // Signature Field Methods
  //----------------------
  async getSignatureField(id: number): Promise<SignatureField | undefined> {
    const [field] = await db.select().from(signatureFields).where(eq(signatureFields.id, id));
    return field;
  }

  async getSignatureFields(requestId: number): Promise<SignatureField[]> {
    const fields = await db.select().from(signatureFields).where(eq(signatureFields.requestId, requestId));
    
    // Sort by order field if available, otherwise by ID
    return fields.sort((a, b) => 
      (a.order !== null && b.order !== null) 
        ? a.order - b.order 
        : a.id - b.id
    );
  }

  async createSignatureField(field: InsertSignatureField): Promise<SignatureField> {
    const [signatureField] = await db.insert(signatureFields).values(field).returning();
    return signatureField;
  }

  async updateSignatureField(id: number, fieldData: Partial<InsertSignatureField>): Promise<SignatureField | undefined> {
    const [updatedField] = await db
      .update(signatureFields)
      .set({
        ...fieldData
      })
      .where(eq(signatureFields.id, id))
      .returning();
    
    return updatedField;
  }

  async deleteSignatureField(id: number): Promise<boolean> {
    try {
      await db.delete(signatureFields).where(eq(signatureFields.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting signature field ${id}:`, error);
      return false;
    }
  }

  //----------------------
  // Signature Event Methods
  //----------------------
  async getSignatureEvents(requestId: number): Promise<SignatureEvent[]> {
    const events = await db.select().from(signatureEvents).where(eq(signatureEvents.requestId, requestId));
    
    // Sort by timestamp, most recent first
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createSignatureEvent(event: InsertSignatureEvent): Promise<SignatureEvent> {
    const [signatureEvent] = await db.insert(signatureEvents).values(event).returning();
    return signatureEvent;
  }
  
  // OAuth state methods
  async createOAuthState(stateData: InsertOAuthState): Promise<OAuthState> {
    const [result] = await db.insert(oauthStates).values(stateData).returning();
    return result;
  }
  
  async getOAuthState(state: string): Promise<OAuthState | undefined> {
    const results = await db.select().from(oauthStates).where(eq(oauthStates.state, state));
    return results[0];
  }
  
  async validateAndUseOAuthState(state: string, service: string): Promise<boolean> {
    // Get the state record
    const stateRecord = await this.getOAuthState(state);
    
    // If it doesn't exist, is already used, or is expired, return false
    if (!stateRecord || 
        stateRecord.used || 
        stateRecord.service !== service || 
        stateRecord.expiresAt < new Date()) {
      return false;
    }
    
    // Mark as used
    await db.update(oauthStates)
      .set({ used: true })
      .where(eq(oauthStates.id, stateRecord.id));
    
    return true;
  }
}
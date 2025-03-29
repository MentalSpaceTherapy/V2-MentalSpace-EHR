import { 
  users, clients, sessions, documentation, notifications, messages,
  leads, marketingCampaigns, marketingEvents, eventRegistrations, contactHistory, referralSources,
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
  type ReferralSource, type InsertReferralSource
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
}
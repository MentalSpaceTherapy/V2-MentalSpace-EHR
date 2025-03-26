import { 
  users, clients, sessions, documentation, notifications, messages,
  type User, type InsertUser,
  type Client, type InsertClient, type ExtendedClient,
  type Session, type InsertSession,
  type Documentation, type InsertDocumentation,
  type Notification, type InsertNotification,
  type Message, type InsertMessage
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
}
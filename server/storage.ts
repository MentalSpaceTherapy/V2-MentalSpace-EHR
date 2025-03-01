import { 
  users, clients, sessions, documentation, notifications,
  type User, type InsertUser,
  type Client, type InsertClient, type ExtendedClient,
  type Session, type InsertSession,
  type Documentation, type InsertDocumentation,
  type Notification, type InsertNotification
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
  }): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined>;
  
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
  
  // Session store for auth
  sessionStore: session.Store;
}

// Import the database storage implementation
import { DatabaseStorage } from './database-storage';

// Export an instance of the database storage
export const storage = new DatabaseStorage();
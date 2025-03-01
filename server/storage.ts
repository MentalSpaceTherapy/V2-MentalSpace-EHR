import { 
  users, clients, sessions, documentation, notifications,
  type User, type InsertUser,
  type Client, type InsertClient, type ExtendedClient,
  type Session, type InsertSession,
  type Documentation, type InsertDocumentation,
  type Notification, type InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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

// Create a MemoryStore constructor by passing the session object
const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client & Partial<ExtendedClient>>;
  private sessions: Map<number, Session>;
  private documents: Map<number, Documentation>;
  private notifications: Map<number, Notification>;
  private clientId: number;
  private sessionId: number;
  private documentId: number;
  private notificationId: number;
  currentId: number; // For user IDs
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.sessions = new Map();
    this.documents = new Map();
    this.notifications = new Map();
    this.currentId = 1;
    this.clientId = 1;
    this.sessionId = 1;
    this.documentId = 1;
    this.notificationId = 1;
    
    // Setup in-memory session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add a sample user for development testing
    const sampleUser: InsertUser = {
      username: "therapist@mentalspace.com",
      password: "password123", // This will be hashed by auth.ts
      firstName: "Sarah",
      lastName: "Johnson",
      email: "therapist@mentalspace.com",
      role: "Therapist",
      licenseType: "LPC, LMHC",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    
    this.createUser(sampleUser)
      .then(user => {
        // Create some sample clients
        const sampleClient1: ExtendedClient = {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          dateOfBirth: new Date("1985-06-15"),
          address: "123 Main St, Anytown, USA",
          status: "active",
          primaryTherapistId: user.id,
          emergencyContactName: "Jane Doe",
          emergencyContactPhone: "555-987-6543",
          emergencyContactRelationship: "spouse",
          preferredPronouns: "he/him",
          administrativeSex: "male"
        };
        
        const sampleClient2: ExtendedClient = {
          firstName: "Emily",
          lastName: "Smith",
          email: "emily.smith@example.com",
          phone: "555-234-5678",
          dateOfBirth: new Date("1990-09-22"),
          address: "456 Oak Ave, Somewhere, USA",
          status: "active",
          primaryTherapistId: user.id,
          emergencyContactName: "Michael Smith",
          emergencyContactPhone: "555-876-5432",
          emergencyContactRelationship: "brother",
          preferredPronouns: "she/her",
          administrativeSex: "female"
        };
        
        return Promise.all([
          this.createClient(sampleClient1),
          this.createClient(sampleClient2),
          user
        ]);
      })
      .then(([client1, client2, user]) => {
        // Create some sample sessions
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const session1: InsertSession = {
          clientId: client1.id,
          therapistId: user.id,
          startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
          sessionType: "Individual",
          medium: "Telehealth",
          status: "scheduled",
          notes: "Initial assessment session"
        };
        
        const session2: InsertSession = {
          clientId: client2.id,
          therapistId: user.id,
          startTime: new Date(nextWeek.setHours(14, 0, 0, 0)),
          endTime: new Date(nextWeek.setHours(15, 0, 0, 0)),
          sessionType: "Individual",
          medium: "In-person",
          status: "scheduled",
          notes: "Follow-up session"
        };
        
        return Promise.all([
          this.createSession(session1),
          this.createSession(session2),
          client1,
          client2,
          user
        ]);
      })
      .then(([session1, session2, client1, client2, user]) => {
        // Create sample documentation
        const doc1: InsertDocumentation = {
          clientId: client1.id,
          therapistId: user.id,
          sessionId: session1.id,
          title: "Initial Assessment",
          content: "Client presented with symptoms of anxiety and depression...",
          type: "Intake Assessment",
          status: "draft",
          dueDate: new Date(session1.startTime.getTime() + 24 * 60 * 60 * 1000) // 1 day after session
        };
        
        const doc2: InsertDocumentation = {
          clientId: client1.id,
          therapistId: user.id,
          sessionId: null,
          title: "Treatment Plan",
          content: "Treatment goals include reducing anxiety symptoms...",
          type: "Treatment Plan",
          status: "draft",
          dueDate: new Date(session1.startTime.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days after session
        };
        
        // Create notifications
        const notification1: InsertNotification = {
          userId: user.id,
          title: "Documentation Due",
          message: "Initial Assessment for John Doe is due tomorrow",
          type: "Document",
          isRead: false,
          link: `/documentation?id=${client1.id}`
        };
        
        return Promise.all([
          this.createDocument(doc1),
          this.createDocument(doc2),
          this.createNotification(notification1)
        ]);
      })
      .catch(console.error);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // Create a user object with all required fields explicitly defined
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      role: insertUser.role,
      status: "active",
      licenseType: insertUser.licenseType ?? null,
      licenseNumber: insertUser.licenseNumber ?? null,
      licenseExpirationDate: insertUser.licenseExpirationDate ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClients(therapistId?: number, status?: string): Promise<Client[]> {
    let clients = Array.from(this.clients.values());
    
    if (therapistId) {
      clients = clients.filter(client => client.primaryTherapistId === therapistId);
    }
    
    if (status) {
      clients = clients.filter(client => client.status === status);
    }
    
    return clients;
  }
  
  async createClient(clientData: ExtendedClient): Promise<Client> {
    const id = this.clientId++;
    
    // First create the base Client object with required fields
    const baseClient: Client = {
      id,
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email || null,
      phone: clientData.phone || null,
      dateOfBirth: clientData.dateOfBirth || null,
      address: clientData.address || null,
      status: clientData.status || "active",
      primaryTherapistId: clientData.primaryTherapistId || null,
    };
    
    // Then merge with extended properties, but exclude ones that are already defined
    // in the base client to avoid the "specified more than once" error
    const { firstName, lastName, email, phone, dateOfBirth, address, status, primaryTherapistId, ...extendedProps } = clientData;
    
    // Create the final client object by combining base client with extended properties
    const client = { ...baseClient, ...extendedProps };
    
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<ExtendedClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  // Session/Appointment methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async getSessions(filters?: {
    clientId?: number;
    therapistId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<Session[]> {
    let sessions = Array.from(this.sessions.values());
    
    if (!filters) return sessions;
    
    if (filters.clientId) {
      sessions = sessions.filter(session => session.clientId === filters.clientId);
    }
    
    if (filters.therapistId) {
      sessions = sessions.filter(session => session.therapistId === filters.therapistId);
    }
    
    if (filters.startDate) {
      sessions = sessions.filter(session => session.startTime >= filters.startDate!);
    }
    
    if (filters.endDate) {
      sessions = sessions.filter(session => session.startTime <= filters.endDate!);
    }
    
    if (filters.status) {
      sessions = sessions.filter(session => session.status === filters.status);
    }
    
    return sessions;
  }
  
  async createSession(sessionData: InsertSession): Promise<Session> {
    const id = this.sessionId++;
    
    const session: Session = {
      id,
      clientId: sessionData.clientId,
      therapistId: sessionData.therapistId,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      sessionType: sessionData.sessionType,
      medium: sessionData.medium,
      status: sessionData.status || "scheduled",
      notes: sessionData.notes || null
    };
    
    this.sessions.set(id, session);
    return session;
  }
  
  async updateSession(id: number, sessionData: Partial<InsertSession>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionData };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Documentation methods
  async getDocument(id: number): Promise<Documentation | undefined> {
    return this.documents.get(id);
  }
  
  async getDocuments(filters?: {
    clientId?: number;
    therapistId?: number;
    sessionId?: number;
    type?: string;
    status?: string;
  }): Promise<Documentation[]> {
    let documents = Array.from(this.documents.values());
    
    if (!filters) return documents;
    
    if (filters.clientId) {
      documents = documents.filter(doc => doc.clientId === filters.clientId);
    }
    
    if (filters.therapistId) {
      documents = documents.filter(doc => doc.therapistId === filters.therapistId);
    }
    
    if (filters.sessionId) {
      documents = documents.filter(doc => doc.sessionId === filters.sessionId);
    }
    
    if (filters.type) {
      documents = documents.filter(doc => doc.type === filters.type);
    }
    
    if (filters.status) {
      documents = documents.filter(doc => doc.status === filters.status);
    }
    
    return documents;
  }
  
  async createDocument(docData: InsertDocumentation): Promise<Documentation> {
    const id = this.documentId++;
    
    const document: Documentation = {
      id,
      clientId: docData.clientId,
      therapistId: docData.therapistId,
      sessionId: docData.sessionId || null,
      title: docData.title,
      content: docData.content || null,
      type: docData.type,
      status: docData.status || "draft",
      createdAt: new Date(),
      dueDate: docData.dueDate || null,
      completedAt: null
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, docData: Partial<InsertDocumentation>): Promise<Documentation | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...docData };
    
    // If status changes to "complete", set the completedAt date
    if (docData.status === "complete" && document.status !== "complete") {
      updatedDocument.completedAt = new Date();
    }
    
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  // Notification methods
  async getNotifications(userId: number, isRead?: boolean): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    if (isRead !== undefined) {
      notifications = notifications.filter(notification => notification.isRead === isRead);
    }
    
    // Sort by creation date, newest first
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    
    const notification: Notification = {
      id,
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      isRead: notificationData.isRead || false,
      createdAt: new Date(),
      link: notificationData.link || null
    };
    
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return notification;
  }
}

export const storage = new MemStorage();
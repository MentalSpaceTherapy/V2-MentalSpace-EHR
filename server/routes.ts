import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertClientSchema, 
  insertSessionSchema, 
  insertDocumentationSchema, 
  insertNotificationSchema,
  insertMessageSchema,
  extendedClientSchema,
  insertLeadSchema,
  insertMarketingCampaignSchema,
  insertMarketingEventSchema,
  insertEventRegistrationSchema,
  insertContactHistorySchema,
  insertReferralSourceSchema
} from "@shared/schema";
import { z } from "zod";

// Define a type for authenticated user to avoid using AuthenticatedUser
type AuthenticatedUser = {
  id: number;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized - Not logged in" });
};

// Middleware to check if user has the correct role
const hasRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Not logged in" });
    }

    // Use type assertion for user since we verified isAuthenticated
    const user = req.user as AuthenticatedUser;
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (userRoles.includes(user.role)) {
      return next();
    }
    
    return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
  };
};

// Middleware to check if therapist has access to a specific client
const canAccessClient = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized - Not logged in" });
  }
  
  // Use type assertion for user since we verified isAuthenticated
  const user = req.user as AuthenticatedUser;
  
  const clientId = parseInt(req.params.id);
  const therapistId = user.id;
  
  // If user is an administrator, allow access without client assignment check
  if (user.role === "administrator") {
    return next();
  }
  
  try {
    // Check if the client exists and is assigned to this therapist
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    if (client.primaryTherapistId !== therapistId) {
      return res.status(403).json({ 
        message: "Forbidden - You don't have access to this client" 
      });
    }
    
    // If we get here, the therapist has access to this client
    return next();
  } catch (error) {
    return next(error);
  }
};

// Middleware to check if therapist has access to a client ID provided in request body or query
const canAccessClientId = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized - Not logged in" });
  }
  
  // Use type assertion for user since we verified isAuthenticated
  const user = req.user as AuthenticatedUser;
  
  // If user is an administrator, allow access without client assignment check
  if (user.role === "administrator") {
    return next();
  }
  
  // Get client ID from either request body, query params, or route params
  let clientId: number | undefined;
  
  if (req.body && req.body.clientId) {
    clientId = parseInt(req.body.clientId as string);
  } else if (req.query && req.query.clientId) {
    clientId = parseInt(req.query.clientId as string);
  } else if (req.params && req.params.clientId) {
    clientId = parseInt(req.params.clientId);
  }
  
  // If no client ID found, we can't check access so allow the request
  if (!clientId) {
    return next();
  }
  
  try {
    // Check if the client exists and is assigned to this therapist
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    if (client.primaryTherapistId !== user.id) {
      return res.status(403).json({ 
        message: "Forbidden - You don't have access to this client" 
      });
    }
    
    // If we get here, the therapist has access to this client
    return next();
  } catch (error) {
    return next(error);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Client routes
  app.get("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      let therapistId: number | undefined;
      const status = req.query.status as string | undefined;
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;

      // If user is not an administrator, they can only see their own clients
      if (user.role !== "administrator") {
        therapistId = user.id;
      } else if (req.query.therapistId) {
        // If admin and therapistId is provided, filter by that
        therapistId = parseInt(req.query.therapistId as string);
      }
      
      const clients = await storage.getClients(therapistId, status);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/clients/:id", isAuthenticated, canAccessClient, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      // Client existence is already checked in canAccessClient middleware
      res.json(client);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Validate request body against the extended client schema
      const validatedData = extendedClientSchema.parse(req.body);
      
      // If no primary therapist is set and user is a therapist, assign themselves
      if (!validatedData.primaryTherapistId && user.role === "therapist") {
        validatedData.primaryTherapistId = user.id;
      }
      
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/clients/:id", isAuthenticated, canAccessClient, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const id = parseInt(req.params.id);
      
      // Client existence is already checked in canAccessClient middleware
      
      // Partial validation of update data
      const validatedData = extendedClientSchema.partial().parse(req.body);
      
      // If user is not an administrator, they cannot reassign the client to another therapist
      if (user.role !== "administrator" && validatedData.primaryTherapistId && 
          validatedData.primaryTherapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You cannot reassign clients to other therapists" 
        });
      }
      
      const updatedClient = await storage.updateClient(id, validatedData);
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Session/Appointment routes
  app.get("/api/sessions", isAuthenticated, canAccessClientId, async (req, res, next) => {
    try {
      const filters: {
        clientId?: number;
        therapistId?: number;
        startDate?: Date;
        endDate?: Date;
        status?: string;
      } = {};
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Handle client ID filter with access control
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      // Handle therapist ID filter - if user isn't admin, they can only see their own sessions
      if (user.role !== "administrator") {
        filters.therapistId = user.id;
      } else if (req.query.therapistId) {
        // Admin can filter by specific therapist
        filters.therapistId = parseInt(req.query.therapistId as string);
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      const sessions = await storage.getSessions(filters);
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/sessions/:id", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user has access to this session (either admin or session therapist)
      if (user.role !== "administrator" && session.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You don't have access to this session" 
        });
      }
      
      res.json(session);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/sessions", isAuthenticated, canAccessClientId, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Validate request body
      const validatedData = insertSessionSchema.parse(req.body);
      
      // If therapist creating a session, ensure it's assigned to them
      if (user.role === "therapist" && validatedData.therapistId !== user.id) {
        validatedData.therapistId = user.id;
      }
      
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/sessions/:id", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const id = parseInt(req.params.id);
      
      // Validate the session exists
      const existingSession = await storage.getSession(id);
      if (!existingSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user has permission to modify this session
      if (user.role !== "administrator" && existingSession.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You don't have access to modify this session" 
        });
      }
      
      // Partial validation of update data
      const validatedData = insertSessionSchema.partial().parse(req.body);
      
      // Non-admins cannot reassign sessions to other therapists
      if (user.role !== "administrator" && validatedData.therapistId && 
          validatedData.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You cannot reassign sessions to other therapists" 
        });
      }
      
      const updatedSession = await storage.updateSession(id, validatedData);
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Documentation routes
  app.get("/api/documents", isAuthenticated, canAccessClientId, async (req, res, next) => {
    try {
      const filters: {
        clientId?: number;
        therapistId?: number;
        sessionId?: number;
        type?: string;
        status?: string;
      } = {};
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Handle client ID filter with access control
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      // Handle therapist ID filter - if user isn't admin, they can only see their own documents
      if (user.role !== "administrator") {
        filters.therapistId = user.id;
      } else if (req.query.therapistId) {
        // Admin can filter by specific therapist
        filters.therapistId = parseInt(req.query.therapistId as string);
      }
      
      if (req.query.sessionId) {
        filters.sessionId = parseInt(req.query.sessionId as string);
      }
      
      if (req.query.type) {
        filters.type = req.query.type as string;
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      const documents = await storage.getDocuments(filters);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/documents/:id", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has access to this document (either admin or document therapist)
      if (user.role !== "administrator" && document.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You don't have access to this document" 
        });
      }
      
      res.json(document);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/documents", isAuthenticated, canAccessClientId, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Validate request body
      const validatedData = insertDocumentationSchema.parse(req.body);
      
      // If therapist creating a document, ensure it's assigned to them
      if (user.role === "therapist" && validatedData.therapistId !== user.id) {
        validatedData.therapistId = user.id;
      }
      
      const document = await storage.createDocument(validatedData);
      
      // Create a notification for the therapist about the new document
      try {
        await storage.createNotification({
          userId: document.therapistId,
          title: "New Document Created",
          message: `A new ${document.type} document has been created.`,
          type: "Document",
          isRead: false,
          link: `/documentation?id=${document.id}`
        });
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
        // Don't block the document creation if notification fails
      }
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/documents/:id", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const id = parseInt(req.params.id);
      
      // Validate the document exists
      const existingDocument = await storage.getDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has permission to modify this document
      if (user.role !== "administrator" && existingDocument.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You don't have access to modify this document" 
        });
      }
      
      // Partial validation of update data
      const validatedData = insertDocumentationSchema.partial().parse(req.body);
      
      // Non-admins cannot reassign documents to other therapists
      if (user.role !== "administrator" && validatedData.therapistId && 
          validatedData.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You cannot reassign documents to other therapists" 
        });
      }
      
      const updatedDocument = await storage.updateDocument(id, validatedData);
      
      // If document status changed to complete, create a notification
      if (validatedData.status === "complete" && existingDocument.status !== "complete" && updatedDocument) {
        try {
          await storage.createNotification({
            userId: updatedDocument.therapistId,
            title: "Document Completed",
            message: `${updatedDocument.type} document has been completed.`,
            type: "Document",
            isRead: false,
            link: `/documentation?id=${updatedDocument.id}`
          });
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError);
          // Don't block the document update if notification fails
        }
      }
      
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res, next) => {
    try {
      const isRead = req.query.isRead !== undefined ? 
        req.query.isRead === "true" : undefined;
      
      // User is guaranteed to exist due to isAuthenticated middleware
      // but we'll add a type assertion to satisfy TypeScript
      const userId = (req.user as AuthenticatedUser).id;
      const notifications = await storage.getNotifications(userId, isRead);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/notifications", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertNotificationSchema.parse(req.body);
      
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });

  // Message routes
  app.get("/api/messages", isAuthenticated, canAccessClientId, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Check if we're filtering by client
      if (req.query.clientId) {
        const clientId = parseInt(req.query.clientId as string);
        const messages = await storage.getMessages(clientId, user.id);
        return res.json(messages);
      }
      
      // If not, return all messages for the therapist
      const messages = await storage.getTherapistMessages(user.id);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/messages/unread", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const messages = await storage.getUnreadMessages(user.id);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/clients/:clientId/messages", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const clientId = parseInt(req.params.clientId);
      
      // Validate the client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user has access to this client (either admin or client's therapist)
      if (user.role !== "administrator" && client.primaryTherapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You don't have access to this client's messages" 
        });
      }
      
      const messages = await storage.getMessages(clientId, user.id);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/messages", isAuthenticated, canAccessClientId, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Set therapist ID from authenticated user
      req.body.therapistId = user.id;
      
      // Validate request body
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Set sender as "therapist" if not provided
      if (!validatedData.sender) {
        validatedData.sender = "therapist";
      }
      
      const message = await storage.createMessage(validatedData);
      
      // Create a notification for the therapist if the message is from the client
      if (validatedData.sender === "client") {
        try {
          await storage.createNotification({
            userId: message.therapistId,
            title: "New Message",
            message: `You have a new message from your client.`,
            type: "Message",
            isRead: false,
            link: `/messages?clientId=${message.clientId}`
          });
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError);
          // Don't block the message creation if notification fails
        }
      }
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res, next) => {
    try {
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      const id = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if user has access to this message
      if (user.role !== "administrator" && message.therapistId !== user.id) {
        return res.status(403).json({ 
          message: "Forbidden - You don't have access to this message" 
        });
      }
      
      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  // Lead Management routes
  app.get("/api/leads", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        assignedToId?: number;
        status?: string;
        stage?: string;
        source?: string;
        sourceId?: number;
      } = {};
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not an admin, only show leads assigned to this user
      if (user.role !== "administrator") {
        filters.assignedToId = user.id;
      } else if (req.query.assignedToId) {
        // If admin and assignedToId is provided, filter by that
        filters.assignedToId = parseInt(req.query.assignedToId as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.stage) {
        filters.stage = req.query.stage as string;
      }
      
      if (req.query.source) {
        filters.source = req.query.source as string;
      }
      
      if (req.query.sourceId) {
        filters.sourceId = parseInt(req.query.sourceId as string);
      }
      
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/leads/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if lead is assigned to this user
      if (user.role !== "administrator" && lead.assignedToId !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this lead" });
      }
      
      res.json(lead);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/leads", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertLeadSchema.parse(req.body);
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If no assignedToId is set, assign to current user
      if (!validatedData.assignedToId) {
        validatedData.assignedToId = user.id;
      }
      
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/leads/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify lead exists
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if lead is assigned to this user
      if (user.role !== "administrator" && lead.assignedToId !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to modify this lead" });
      }
      
      // Partial validation of update data
      const validatedData = insertLeadSchema.partial().parse(req.body);
      
      // If user is not admin, they cannot reassign leads to other users
      if (user.role !== "administrator" && validatedData.assignedToId && 
          validatedData.assignedToId !== user.id) {
        return res.status(403).json({ message: "Forbidden - You cannot reassign leads to other users" });
      }
      
      const updatedLead = await storage.updateLead(id, validatedData);
      res.json(updatedLead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.delete("/api/leads/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify lead exists
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if lead is assigned to this user
      if (user.role !== "administrator" && lead.assignedToId !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to delete this lead" });
      }
      
      const deleted = await storage.deleteLead(id);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete lead" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/leads/:id/convert", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify lead exists
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if lead is assigned to this user
      if (user.role !== "administrator" && lead.assignedToId !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to convert this lead" });
      }
      
      // If already converted, return error
      if (lead.status === "converted") {
        return res.status(400).json({ message: "Lead has already been converted to a client" });
      }
      
      // Validate client data
      const validatedData = extendedClientSchema.parse(req.body);
      
      // Set primary therapist to current user if not provided
      if (!validatedData.primaryTherapistId) {
        validatedData.primaryTherapistId = user.id;
      }
      
      // Convert lead to client
      const result = await storage.convertLeadToClient(id, validatedData);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Marketing Campaign routes
  app.get("/api/campaigns", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        createdById?: number;
        status?: string;
        type?: string;
      } = {};
      
      if (req.query.createdById) {
        filters.createdById = parseInt(req.query.createdById as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.type) {
        filters.type = req.query.type as string;
      }
      
      const campaigns = await storage.getCampaigns(filters);
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/campaigns/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/campaigns", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertMarketingCampaignSchema.parse(req.body);
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Set created by to current user
      validatedData.createdById = user.id;
      
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/campaigns/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify campaign exists
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if campaign was created by this user
      if (user.role !== "administrator" && campaign.createdById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to modify this campaign" });
      }
      
      // Partial validation of update data
      const validatedData = insertMarketingCampaignSchema.partial().parse(req.body);
      
      const updatedCampaign = await storage.updateCampaign(id, validatedData);
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/campaigns/:id/stats", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify campaign exists
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if campaign was created by this user
      if (user.role !== "administrator" && campaign.createdById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to modify this campaign" });
      }
      
      // Validate that the request body is an object
      if (typeof req.body !== 'object' || req.body === null) {
        return res.status(400).json({ message: "Invalid stats data" });
      }
      
      const updatedCampaign = await storage.updateCampaignStats(id, req.body);
      
      if (!updatedCampaign) {
        return res.status(500).json({ message: "Failed to update campaign stats" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/campaigns/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify campaign exists
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if campaign was created by this user
      if (user.role !== "administrator" && campaign.createdById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to delete this campaign" });
      }
      
      const deleted = await storage.deleteCampaign(id);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete campaign" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Marketing Event routes
  app.get("/api/events", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        createdById?: number;
        status?: string;
        type?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};
      
      if (req.query.createdById) {
        filters.createdById = parseInt(req.query.createdById as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.type) {
        filters.type = req.query.type as string;
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/events/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/events", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertMarketingEventSchema.parse(req.body);
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Set created by to current user
      validatedData.createdById = user.id;
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/events/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify event exists
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if event was created by this user
      if (user.role !== "administrator" && event.createdById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to modify this event" });
      }
      
      // Partial validation of update data
      const validatedData = insertMarketingEventSchema.partial().parse(req.body);
      
      const updatedEvent = await storage.updateEvent(id, validatedData);
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.delete("/api/events/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify event exists
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if event was created by this user
      if (user.role !== "administrator" && event.createdById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to delete this event" });
      }
      
      const deleted = await storage.deleteEvent(id);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete event" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Event Registration routes
  app.get("/api/event-registrations", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        eventId?: number;
        leadId?: number;
        clientId?: number;
        email?: string;
        status?: string;
      } = {};
      
      if (req.query.eventId) {
        filters.eventId = parseInt(req.query.eventId as string);
      }
      
      if (req.query.leadId) {
        filters.leadId = parseInt(req.query.leadId as string);
      }
      
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      if (req.query.email) {
        filters.email = req.query.email as string;
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      const registrations = await storage.getEventRegistrations(filters);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/event-registrations", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertEventRegistrationSchema.parse(req.body);
      
      const registration = await storage.createEventRegistration(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/event-registrations/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify registration exists
      const registration = await storage.getEventRegistration(id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      // Partial validation of update data
      const validatedData = insertEventRegistrationSchema.partial().parse(req.body);
      
      const updatedRegistration = await storage.updateEventRegistration(id, validatedData);
      res.json(updatedRegistration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Contact History routes
  app.get("/api/contact-history", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        leadId?: number;
        clientId?: number;
        completedById?: number;
        contactType?: string;
        outcome?: string;
        startDate?: Date;
        endDate?: Date;
        campaignId?: number;
      } = {};
      
      if (req.query.leadId) {
        filters.leadId = parseInt(req.query.leadId as string);
      }
      
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      if (req.query.completedById) {
        filters.completedById = parseInt(req.query.completedById as string);
      } else {
        // Use type assertion for user since we verified isAuthenticated
        const user = req.user as AuthenticatedUser;
        if (user.role !== "administrator") {
          // Non-admins only see their own contact history by default
          filters.completedById = user.id;
        }
      }
      
      if (req.query.contactType) {
        filters.contactType = req.query.contactType as string;
      }
      
      if (req.query.outcome) {
        filters.outcome = req.query.outcome as string;
      }
      
      if (req.query.campaignId) {
        filters.campaignId = parseInt(req.query.campaignId as string);
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      const contacts = await storage.getContactHistory(filters);
      res.json(contacts);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/contact-history", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertContactHistorySchema.parse(req.body);
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Set completed by to current user if not provided
      if (!validatedData.completedById) {
        validatedData.completedById = user.id;
      }
      
      // Non-admins can only create contact records as themselves
      if (user.role !== "administrator" && validatedData.completedById !== user.id) {
        validatedData.completedById = user.id;
      }
      
      const contact = await storage.createContactHistory(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/contact-history/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify contact record exists
      const contact = await storage.getContactHistoryRecord(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact history record not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if contact was created by this user
      if (user.role !== "administrator" && contact.completedById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to modify this contact record" });
      }
      
      // Partial validation of update data
      const validatedData = insertContactHistorySchema.partial().parse(req.body);
      
      // Non-admins cannot change completedById
      if (user.role !== "administrator" && validatedData.completedById && validatedData.completedById !== user.id) {
        delete validatedData.completedById;
      }
      
      const updatedContact = await storage.updateContactHistory(id, validatedData);
      res.json(updatedContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Referral Source routes
  app.get("/api/referral-sources", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        type?: string;
        activeStatus?: string;
        createdById?: number;
      } = {};
      
      if (req.query.type) {
        filters.type = req.query.type as string;
      }
      
      if (req.query.activeStatus) {
        filters.activeStatus = req.query.activeStatus as string;
      }
      
      if (req.query.createdById) {
        filters.createdById = parseInt(req.query.createdById as string);
      }
      
      const sources = await storage.getReferralSources(filters);
      res.json(sources);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/referral-sources/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const source = await storage.getReferralSource(id);
      
      if (!source) {
        return res.status(404).json({ message: "Referral source not found" });
      }
      
      res.json(source);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/referral-sources", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertReferralSourceSchema.parse(req.body);
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // Set created by to current user
      validatedData.createdById = user.id;
      
      const source = await storage.createReferralSource(validatedData);
      res.status(201).json(source);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/referral-sources/:id", isAuthenticated, hasRole(["administrator", "therapist"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify source exists
      const source = await storage.getReferralSource(id);
      if (!source) {
        return res.status(404).json({ message: "Referral source not found" });
      }
      
      // Use type assertion for user since we verified isAuthenticated
      const user = req.user as AuthenticatedUser;
      
      // If not admin, check if source was created by this user
      if (user.role !== "administrator" && source.createdById !== user.id) {
        return res.status(403).json({ message: "Forbidden - You don't have access to modify this referral source" });
      }
      
      // Partial validation of update data
      const validatedData = insertReferralSourceSchema.partial().parse(req.body);
      
      const updatedSource = await storage.updateReferralSource(id, validatedData);
      res.json(updatedSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.delete("/api/referral-sources/:id", isAuthenticated, hasRole(["administrator"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify source exists
      const source = await storage.getReferralSource(id);
      if (!source) {
        return res.status(404).json({ message: "Referral source not found" });
      }
      
      // Only admins can delete referral sources (enforced by hasRole middleware)
      const deleted = await storage.deleteReferralSource(id);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete referral source" });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

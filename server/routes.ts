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
  extendedClientSchema
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

  const httpServer = createServer(app);

  return httpServer;
}

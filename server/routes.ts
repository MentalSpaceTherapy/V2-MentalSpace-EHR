import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertClientSchema, 
  insertSessionSchema, 
  insertDocumentationSchema, 
  insertNotificationSchema,
  extendedClientSchema
} from "@shared/schema";
import { z } from "zod";

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

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (userRoles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Client routes
  app.get("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      const therapistId = req.query.therapistId ? parseInt(req.query.therapistId as string) : undefined;
      const status = req.query.status as string | undefined;
      
      const clients = await storage.getClients(therapistId, status);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/clients/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body against the extended client schema
      const validatedData = extendedClientSchema.parse(req.body);
      
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
  
  app.patch("/api/clients/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate the client exists
      const existingClient = await storage.getClient(id);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Partial validation of update data
      const validatedData = extendedClientSchema.partial().parse(req.body);
      
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
  app.get("/api/sessions", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        clientId?: number;
        therapistId?: number;
        startDate?: Date;
        endDate?: Date;
        status?: string;
      } = {};
      
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      if (req.query.therapistId) {
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
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/sessions", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertSessionSchema.parse(req.body);
      
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
      const id = parseInt(req.params.id);
      
      // Validate the session exists
      const existingSession = await storage.getSession(id);
      if (!existingSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Partial validation of update data
      const validatedData = insertSessionSchema.partial().parse(req.body);
      
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
  app.get("/api/documents", isAuthenticated, async (req, res, next) => {
    try {
      const filters: {
        clientId?: number;
        therapistId?: number;
        sessionId?: number;
        type?: string;
        status?: string;
      } = {};
      
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      if (req.query.therapistId) {
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
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/documents", isAuthenticated, async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertDocumentationSchema.parse(req.body);
      
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
      const id = parseInt(req.params.id);
      
      // Validate the document exists
      const existingDocument = await storage.getDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Partial validation of update data
      const validatedData = insertDocumentationSchema.partial().parse(req.body);
      
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
      const userId = (req.user as Express.User).id;
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

  const httpServer = createServer(app);

  return httpServer;
}

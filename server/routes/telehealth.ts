import { Router, Request, Response } from "express";
import { telehealthService } from "../services/telehealth";
import { z } from "zod";
import crypto from "crypto";

// Define a type for authenticated user
type AuthenticatedUser = {
  id: number;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
};

// Create router
const router = Router();

// Define validation schemas
const sessionDetailsSchema = z.object({
  clientId: z.number(),
  sessionId: z.number().optional(),
  sessionType: z.string(),
  duration: z.number(),
  note: z.string().optional(),
});

/**
 * @route GET /api/telehealth/stats
 * @desc Get telehealth service statistics for admins
 * @access Private (Admin)
 */
router.get("/stats", (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = req.user as AuthenticatedUser;
  const isAdmin = user.role === "admin";
  
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized access - Admin only" });
  }
  
  const stats = {
    activeRooms: telehealthService.getActiveRooms(),
    activeUsers: telehealthService.getActiveUsers(),
  };
  
  return res.json(stats);
});

/**
 * @route POST /api/telehealth/session
 * @desc Create a new telehealth session
 * @access Private (Therapist)
 */
router.post("/session", (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = req.user as AuthenticatedUser;
    const isTherapist = user.role === "therapist";
    if (!isTherapist) {
      return res.status(403).json({ error: "Only therapists can create sessions" });
    }
    
    const validatedData = sessionDetailsSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validatedData.error.format(),
      });
    }
    
    // For now, just return the data. In a real implementation, you would save this to the database
    return res.status(201).json({
      success: true,
      message: "Telehealth session created",
      sessionInfo: {
        ...validatedData.data,
        therapistId: user.id,
        encryptionEnabled: true,
        createdAt: new Date(),
      }
    });
  } catch (error: any) {
    console.error("Error creating telehealth session:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/telehealth/session/:id
 * @desc Get telehealth session details
 * @access Private
 */
router.get("/session/:id", (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = req.user as AuthenticatedUser;
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }
    
    // For now, return session data for demonstration. In a real implementation, you would fetch this from the database
    const session = {
      id: sessionId,
      therapistId: 1,
      clientId: 2,
      sessionType: "Individual Therapy",
      duration: 50,
      scheduledStartTime: new Date(),
      status: "scheduled",
      encryptionEnabled: true
    };
    
    // Check if user has permission to view this session
    const isAuthorized = 
      user.id === session.therapistId || 
      user.id === session.clientId ||
      user.role === "admin";
      
    if (!isAuthorized) {
      return res.status(403).json({ error: "You don't have permission to view this session" });
    }
    
    return res.json(session);
  } catch (error: any) {
    console.error("Error fetching telehealth session:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * @route POST /api/telehealth/room
 * @desc Create a new telehealth room for video sessions
 * @access Private (Therapist)
 */
router.post("/room", (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = req.user as AuthenticatedUser;
    if (user.role !== "therapist" && user.role !== "admin") {
      return res.status(403).json({ error: "Only therapists can create telehealth rooms" });
    }
    
    const { roomName, clientId } = req.body;
    
    if (!roomName || typeof roomName !== 'string') {
      return res.status(400).json({ error: "Room name is required" });
    }
    
    // In a real implementation, you would check that the therapist has access to this client
    
    // Return room creation details
    return res.status(201).json({
      success: true,
      message: "Telehealth room created",
      room: {
        name: roomName,
        createdBy: user.id,
        clientId,
        createdAt: new Date(),
        encryptionEnabled: true,
        // In a real implementation, this would return the room ID from the telehealth service
        roomId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }
    });
  } catch (error: any) {
    console.error("Error creating telehealth room:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
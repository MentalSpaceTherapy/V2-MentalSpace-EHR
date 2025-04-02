import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { asyncHandler, createError, notFoundError, forbiddenError } from '../utils/error-handler';
import { insertSessionSchema } from '@shared/schema';
import { isAuthenticated, canAccessClientId } from '../middleware';

const router = Router();

// Type for authenticated user
interface AuthenticatedUser {
  id: number;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Get all sessions with filtering options
router.get('/', isAuthenticated, canAccessClientId, asyncHandler(async (req, res) => {
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
}));

// Get a specific session by ID
router.get('/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  const session = await storage.getSession(id);
  
  if (!session) {
    throw notFoundError('Session');
  }
  
  // Check if user has access to this session (either admin or session therapist)
  if (user.role !== "administrator" && session.therapistId !== user.id) {
    throw forbiddenError("You don't have permission to access this session");
  }
  
  res.json(session);
}));

// Create a new session
router.post('/', isAuthenticated, canAccessClientId, asyncHandler(async (req, res) => {
  const user = req.user as AuthenticatedUser;
  
  // Validate request body
  const validatedData = insertSessionSchema.parse(req.body);
  
  // If therapist creating a session, ensure it's assigned to them
  if (user.role === "therapist" && validatedData.therapistId !== user.id) {
    validatedData.therapistId = user.id;
  }
  
  // Check if calendar integration is requested
  const calendarType = req.body.calendarType as string | undefined;
  
  // Create the session
  const session = await storage.createSession(validatedData);
  
  // Optional: Implement calendar integration
  // if (calendarType && validatedData.externalCalendarType) {
  //   // Implement calendar integration logic here
  // }
  
  res.status(201).json(session);
}));

// Update a session
router.patch('/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  // Get the session to check ownership
  const session = await storage.getSession(id);
  
  if (!session) {
    throw notFoundError('Session');
  }
  
  // Check if user has permission to update this session
  if (user.role !== "administrator" && session.therapistId !== user.id) {
    throw forbiddenError("You don't have permission to update this session");
  }
  
  // Validate request body with partial schema
  const validatedData = insertSessionSchema.partial().parse(req.body);
  
  // Prevent reassigning session to another therapist unless administrator
  if (user.role !== "administrator" && validatedData.therapistId && 
      validatedData.therapistId !== user.id) {
    throw forbiddenError("You cannot reassign sessions to other therapists");
  }
  
  const updatedSession = await storage.updateSession(id, validatedData);
  
  if (!updatedSession) {
    throw notFoundError('Session');
  }
  
  res.json(updatedSession);
}));

// Delete a session
router.delete('/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  // Get the session to check ownership
  const session = await storage.getSession(id);
  
  if (!session) {
    throw notFoundError('Session');
  }
  
  // Check if user has permission to delete this session
  if (user.role !== "administrator" && session.therapistId !== user.id) {
    throw forbiddenError("You don't have permission to delete this session");
  }
  
  const success = await storage.deleteSession(id);
  
  if (!success) {
    throw createError("Failed to delete session", 500, "DELETE_FAILED");
  }
  
  res.status(204).end();
}));

export default router; 
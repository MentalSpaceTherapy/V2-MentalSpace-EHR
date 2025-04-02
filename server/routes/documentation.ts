import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { asyncHandler, createError, notFoundError, forbiddenError } from '../utils/error-handler';
import { insertDocumentationSchema } from '@shared/schema';
import { isAuthenticated, canAccessClient, canAccessClientId } from '../middleware';

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

// Get all documentation with filtering options
router.get('/', isAuthenticated, canAccessClientId, asyncHandler(async (req, res) => {
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
  
  // Handle therapist ID filter - if user isn't admin, they can only see their own documentation
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
}));

// Get specific documentation by ID
router.get('/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  const document = await storage.getDocument(id);
  
  if (!document) {
    throw notFoundError('Documentation');
  }
  
  // Check if user has access to this document (either admin or document creator)
  if (user.role !== "administrator" && document.therapistId !== user.id) {
    throw forbiddenError("You don't have permission to access this documentation");
  }
  
  res.json(document);
}));

// Create new documentation
router.post('/', isAuthenticated, canAccessClientId, asyncHandler(async (req, res) => {
  const user = req.user as AuthenticatedUser;
  
  // Validate request body
  const validatedData = insertDocumentationSchema.parse(req.body);
  
  // Ensure document is created by the authenticated user
  validatedData.therapistId = user.id;
  
  // Create the document
  const document = await storage.createDocument(validatedData);
  
  res.status(201).json(document);
}));

// Update documentation
router.patch('/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  // Get the document to check ownership
  const document = await storage.getDocument(id);
  
  if (!document) {
    throw notFoundError('Documentation');
  }
  
  // Check if document is already signed and locked
  if (document.status === "signed" && user.role !== "administrator") {
    throw forbiddenError("Cannot modify a signed document");
  }
  
  // Check if user has permission to update this document
  if (user.role !== "administrator" && document.therapistId !== user.id) {
    throw forbiddenError("You don't have permission to update this documentation");
  }
  
  // Validate request body with partial schema
  const validatedData = insertDocumentationSchema.partial().parse(req.body);
  
  // Prevent reassigning document to another therapist
  if (validatedData.therapistId && validatedData.therapistId !== document.therapistId && user.role !== "administrator") {
    throw forbiddenError("You cannot reassign documentation to other therapists");
  }
  
  const updatedDocument = await storage.updateDocument(id, validatedData);
  
  if (!updatedDocument) {
    throw notFoundError('Documentation');
  }
  
  res.json(updatedDocument);
}));

// Sign documentation
router.post('/:id/sign', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  // Get the document to check ownership
  const document = await storage.getDocument(id);
  
  if (!document) {
    throw notFoundError('Documentation');
  }
  
  // Check if document is already signed
  if (document.status === "signed") {
    throw createError("Document is already signed", 400, "ALREADY_SIGNED");
  }
  
  // Check if user has permission to sign this document
  if (document.therapistId !== user.id && user.role !== "supervisor" && user.role !== "administrator") {
    throw forbiddenError("You don't have permission to sign this documentation");
  }
  
  // Sign the document
  const signedDocument = await storage.updateDocument(id, {
    status: "signed",
    completedAt: new Date()
  } as any); // Type assertion to bypass strict typing, should be fixed in the schema
  
  if (!signedDocument) {
    throw createError("Failed to sign document", 500, "SIGN_FAILED");
  }
  
  res.json(signedDocument);
}));

// Delete documentation (admin only or draft documents)
router.delete('/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = req.user as AuthenticatedUser;
  
  // Get the document to check status and ownership
  const document = await storage.getDocument(id);
  
  if (!document) {
    throw notFoundError('Documentation');
  }
  
  // Only allow deletion of draft documents unless admin
  if (document.status !== "draft" && user.role !== "administrator") {
    throw forbiddenError("Only draft documents can be deleted");
  }
  
  // Check if user has permission to delete this document
  if (user.role !== "administrator" && document.therapistId !== user.id) {
    throw forbiddenError("You don't have permission to delete this documentation");
  }
  
  const success = await storage.deleteDocument(id);
  
  if (!success) {
    throw createError("Failed to delete documentation", 500, "DELETE_FAILED");
  }
  
  res.status(204).end();
}));

export default router; 
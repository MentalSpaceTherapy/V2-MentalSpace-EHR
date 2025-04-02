import { Request, Response, NextFunction } from 'express';
import { asyncHandler, forbiddenError, notFoundError } from '../utils/error-handler';
import { storage } from '../storage';

// Type for authenticated user
interface AuthenticatedUser {
  id: number;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Middleware to check if user has access to a specific client
 */
export const canAccessClient = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    throw forbiddenError("You must be authenticated to access client data");
  }
  
  const user = req.user as AuthenticatedUser;
  const clientId = parseInt(req.params.id);
  
  // Administrators can access all clients
  if (user.role === "administrator") {
    return next();
  }
  
  // Get the client
  const client = await storage.getClient(clientId);
  if (!client) {
    throw notFoundError('Client');
  }
  
  // Check if user is the primary therapist for this client
  if (client.primaryTherapistId === user.id) {
    return next();
  }
  
  // If not admin or primary therapist, access is denied
  throw forbiddenError("You don't have permission to access this client.");
});

/**
 * Middleware to check if user has access to a client ID provided in request body or query
 */
export const canAccessClientId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    throw forbiddenError("You must be authenticated to access client data");
  }
  
  const user = req.user as AuthenticatedUser;
  
  // Administrators can access all clients
  if (user.role === "administrator") {
    return next();
  }
  
  // Get client ID from request body or query
  let clientId: number | undefined;
  if (req.body && req.body.clientId) {
    clientId = parseInt(req.body.clientId);
  } else if (req.query && req.query.clientId) {
    clientId = parseInt(req.query.clientId as string);
  }
  
  // If no client ID provided, allow access (filtering will happen in the endpoint)
  if (!clientId) {
    return next();
  }
  
  // Get the client
  const client = await storage.getClient(clientId);
  if (!client) {
    throw notFoundError('Client');
  }
  
  // Check if user is the primary therapist for this client
  if (client.primaryTherapistId === user.id) {
    return next();
  }
  
  // If not admin or primary therapist, access is denied
  throw forbiddenError("You don't have permission to access this client.");
}); 
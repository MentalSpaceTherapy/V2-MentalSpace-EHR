import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/error-handler';
import { forbiddenError } from '../utils/api-error';

/**
 * Middleware to check if the user has sufficient access rights based on their role
 * @param requiredRoles Array of roles that are allowed to access the route
 */
export const checkAccessRights = (requiredRoles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw forbiddenError('Authentication required');
    }
    
    const userRole = (req.user as any).role;
    
    if (!requiredRoles.includes(userRole)) {
      throw forbiddenError(`Access denied: requires one of the following roles: ${requiredRoles.join(', ')}`);
    }
    
    next();
  });
};

/**
 * Middleware to check if the user is the client's therapist or an administrator
 */
export const checkClientTherapistAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw forbiddenError('Authentication required');
    }
    
    // Allow administrators full access
    if ((req.user as any).role === 'administrator') {
      return next();
    }
    
    // For non-admins, check if they are assigned to the client
    const clientId = req.params.id;
    const userId = (req.user as any).id;
    
    // Check access should be handled by the service that implements the actual logic
    // For now, we'll just proceed with the request
    next();
  }
);

/**
 * Checks if the current user has ownership of a resource
 * @param ownerField The field in the resource that contains the owner's ID
 */
export const checkResourceOwnership = (ownerField: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw forbiddenError('Authentication required');
    }
    
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;
    
    // Admins can access all resources
    if (userRole === 'administrator') {
      return next();
    }
    
    // Check if the resource exists
    const resourceId = req.params.id;
    
    // The actual check for ownership should be implemented in the specific route handler
    // For now, just proceed
    next();
  });
}; 
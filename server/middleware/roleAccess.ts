import { Request, Response, NextFunction } from 'express';
import { forbiddenError } from '../utils/error-handler';
import { logger } from '../logger';

// Type for authenticated user
interface AuthenticatedUser {
  id: number;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Define role hierarchy and permissions
export enum Role {
  ADMIN = 'administrator',
  PRACTICE_ADMIN = 'practice_administrator',
  ADMIN_CLINICIAN = 'admin_clinician',
  SUPERVISOR = 'supervisor',
  CLINICIAN = 'clinician',
  INTERN = 'intern',
  SCHEDULER = 'scheduler',
  BILLER = 'biller',
  USER = 'user'
}

// Define role hierarchy
const roleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 100,
  [Role.PRACTICE_ADMIN]: 90,
  [Role.ADMIN_CLINICIAN]: 80,
  [Role.SUPERVISOR]: 70,
  [Role.CLINICIAN]: 60,
  [Role.INTERN]: 50,
  [Role.SCHEDULER]: 40,
  [Role.BILLER]: 40,
  [Role.USER]: 10
};

/**
 * Check if a role is at least as powerful as the required role
 */
export const hasMinimumRole = (userRole: string, requiredRole: string): boolean => {
  // If the roles are directly equal, return true
  if (userRole === requiredRole) return true;
  
  // Check if the roles exist in our hierarchy
  const userRoleLevel = roleHierarchy[userRole as Role];
  const requiredRoleLevel = roleHierarchy[requiredRole as Role];
  
  // If either role is not in the hierarchy, do a direct comparison
  if (userRoleLevel === undefined || requiredRoleLevel === undefined) {
    return userRole === requiredRole;
  }
  
  // Otherwise, compare the levels
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Middleware to check if the user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    logger.audit.access('authenticate', 'anonymous', req.originalUrl, false, {
      ip: req.ip,
      method: req.method
    });
    
    return res.status(401).json({ 
      status: 'error',
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }
  
  const user = req.user as AuthenticatedUser;
  logger.audit.access('authenticate', user.id, req.originalUrl, true, {
    username: user.username,
    role: user.role,
    ip: req.ip,
    method: req.method
  });
  
  return next();
};

/**
 * Middleware to check if the user has the specified role(s)
 * @param roles Single role or array of allowed roles
 */
export const hasRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      logger.audit.access('role_check', 'anonymous', req.originalUrl, false, {
        requiredRoles: roles,
        ip: req.ip,
        method: req.method
      });
      
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    const user = req.user as AuthenticatedUser;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user's role is in the allowed roles list
    const hasPermission = allowedRoles.some(role => user.role === role);
    
    if (!hasPermission) {
      logger.audit.access('role_check', user.id, req.originalUrl, false, {
        username: user.username,
        userRole: user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        method: req.method
      });
      
      throw forbiddenError(`This action requires one of the following roles: ${allowedRoles.join(', ')}`);
    }
    
    logger.audit.access('role_check', user.id, req.originalUrl, true, {
      username: user.username,
      role: user.role,
      requiredRoles: allowedRoles,
      ip: req.ip,
      method: req.method
    });
    
    return next();
  };
};

/**
 * Middleware to check if the user has at least the minimum role level required
 * @param minimumRole The minimum role level required to access the resource
 */
export const hasMinimumRoleLevel = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      logger.audit.access('minimum_role_check', 'anonymous', req.originalUrl, false, {
        minimumRole,
        ip: req.ip,
        method: req.method
      });
      
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    const user = req.user as AuthenticatedUser;
    const hasPermission = hasMinimumRole(user.role, minimumRole);
    
    if (!hasPermission) {
      logger.audit.access('minimum_role_check', user.id, req.originalUrl, false, {
        username: user.username,
        userRole: user.role,
        minimumRole,
        ip: req.ip,
        method: req.method
      });
      
      throw forbiddenError(`This action requires at least ${minimumRole} role level`);
    }
    
    logger.audit.access('minimum_role_check', user.id, req.originalUrl, true, {
      username: user.username,
      role: user.role,
      minimumRole,
      ip: req.ip,
      method: req.method
    });
    
    return next();
  };
};

/**
 * Middleware to check if user is the owner of a resource or has sufficient role
 * @param getResourceOwnerId Function to get the owner ID from the request
 */
export const isOwnerOrHasRole = (getResourceOwnerId: (req: Request) => Promise<number | undefined>, minimumRole: Role = Role.ADMIN) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        logger.audit.access('ownership_check', 'anonymous', req.originalUrl, false, {
          ip: req.ip,
          method: req.method
        });
        
        return res.status(401).json({ 
          status: 'error',
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        });
      }
      
      const user = req.user as AuthenticatedUser;
      
      // Users with sufficient role bypass ownership check
      if (hasMinimumRole(user.role, minimumRole)) {
        logger.audit.access('ownership_check_bypassed', user.id, req.originalUrl, true, {
          username: user.username,
          role: user.role,
          minimumRole,
          ip: req.ip,
          method: req.method
        });
        
        return next();
      }
      
      // Get the resource owner ID
      const ownerId = await getResourceOwnerId(req);
      
      // If owner ID couldn't be determined, deny access
      if (ownerId === undefined) {
        logger.audit.access('ownership_check', user.id, req.originalUrl, false, {
          username: user.username,
          reason: 'Resource ownership could not be determined',
          ip: req.ip,
          method: req.method
        });
        
        throw forbiddenError("Resource ownership could not be determined");
      }
      
      // Check if the user owns the resource
      if (user.id === ownerId) {
        logger.audit.access('ownership_check', user.id, req.originalUrl, true, {
          username: user.username,
          ownerId,
          ip: req.ip,
          method: req.method
        });
        
        return next();
      }
      
      // If user is not the owner, deny access
      logger.audit.access('ownership_check', user.id, req.originalUrl, false, {
        username: user.username,
        role: user.role,
        ownerId,
        ip: req.ip,
        method: req.method
      });
      
      throw forbiddenError("You don't have permission to access this resource");
    } catch (error) {
      next(error);
    }
  };
}; 
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { asyncHandler } from '../utils/error-handler';
import { 
  resourceNotFoundError,
  forbiddenError,
  operationFailedError,
  validationError
} from '../utils/api-error';
import { 
  sendSuccess,
  sendCreated,
  sendUpdated,
  sendSuccessNoContent,
  sendPaginatedSuccess
} from '../utils/api-response';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { paginationSchema } from '../utils/pagination';
import { extendedClientSchema } from '../../shared/schema';
import { checkAccessRights } from '../middleware/access-control';

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

// Define query schema for clients listing with enhanced filtering
const clientsQuerySchema = z.object({
  therapistId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['active', 'inactive', 'onboarding', 'discharged', 'on-hold', 'all']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'dateOfBirth', 'status', 'lastAppointment']).optional().default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  tags: z.array(z.string()).optional(),
  assignedTeam: z.array(z.number()).optional(),
  ageRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  lastAppointmentRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional(),
  // Include pagination fields
  page: paginationSchema.shape.page,
  limit: paginationSchema.shape.limit
});

// Define param schema for client ID
const clientIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Client access control middleware
const checkClientAccess = asyncHandler(async (req, res, next) => {
  const user = req.user as AuthenticatedUser;
  const clientId = parseInt(req.params.id);
  
  // Admin has full access
  if (user.role === "administrator") {
    return next();
  }
  
  // For non-admins, check if they are assigned to this client
  const client = await storage.getClient(clientId);
  
  if (!client) {
    throw resourceNotFoundError('Client', clientId);
  }
  
  // Check if the user is the primary therapist
  if (client.primaryTherapistId === user.id) {
    return next();
  }
  
  // Check if the user is in the assigned team (if it exists)
  if (client.assignedTeam && Array.isArray(client.assignedTeam) && client.assignedTeam.includes(user.id)) {
    return next();
  }
  
  throw forbiddenError("You don't have permission to access this client");
});

// Get all clients with enhanced filtering options
router.get('/', 
  validateQuery(clientsQuerySchema),
  asyncHandler(async (req, res) => {
    // Extract pagination and filter parameters
    const { 
      page, 
      limit, 
      therapistId, 
      status, 
      search, 
      sortBy, 
      sortOrder,
      tags,
      assignedTeam,
      ageRange,
      lastAppointmentRange
    } = req.query as any;
    
    // Use type assertion for user since we verified isAuthenticated middleware runs before
    const user = req.user as AuthenticatedUser;

    // Prepare filters
    const filters: {
      therapistId?: number;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      tags?: string[];
      assignedTeam?: number[];
      ageRange?: { min?: number; max?: number };
      lastAppointmentRange?: { from?: string; to?: string };
    } = {};

    // Apply therapist filter based on user role
    if (user.role !== "administrator") {
      // Non-admins can only see their own clients or team-assigned clients
      filters.assignedTeam = [user.id];
    } else if (therapistId) {
      // Admins can filter by specific therapist
      filters.therapistId = therapistId;
    }
    
    // Apply other filters
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (search) {
      filters.search = search;
    }
    
    if (sortBy) {
      filters.sortBy = sortBy;
    }
    
    if (sortOrder) {
      filters.sortOrder = sortOrder;
    }
    
    if (tags && Array.isArray(tags) && tags.length > 0) {
      filters.tags = tags;
    }
    
    if (assignedTeam && Array.isArray(assignedTeam) && assignedTeam.length > 0) {
      filters.assignedTeam = assignedTeam;
    }
    
    if (ageRange) {
      filters.ageRange = ageRange;
    }
    
    if (lastAppointmentRange) {
      filters.lastAppointmentRange = lastAppointmentRange;
    }
    
    // Get paginated clients
    const result = await storage.getClients(filters, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20,
      offset: ((parseInt(page) || 1) - 1) * (parseInt(limit) || 20)
    });
    
    // Create pagination metadata
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / (parseInt(limit) || 20)),
      hasNextPage: (parseInt(page) || 1) < Math.ceil(result.total / (parseInt(limit) || 20)),
      hasPrevPage: (parseInt(page) || 1) > 1
    };
    
    // Send paginated response
    sendPaginatedSuccess(res, result.data, pagination, {
      filters
    });
  })
);

// Get a specific client by ID
router.get('/:id', 
  validateParams(clientIdSchema),
  checkClientAccess, // Apply access control
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Get the client
    const client = await storage.getClient(id);
    
    // Check if client exists
    if (!client) {
      throw resourceNotFoundError('Client', id);
    }
    
    // Send standardized response
    sendSuccess(res, client);
  })
);

// Create a new client
router.post('/', 
  validateBody(extendedClientSchema),
  asyncHandler(async (req, res) => {
    // Use type assertion for user
    const user = req.user as AuthenticatedUser;
    
    // Body is already validated by middleware
    const validatedData = req.body;
    
    // If no primary therapist is set and user is a therapist, assign themselves
    if (!validatedData.primaryTherapistId && user.role === "therapist") {
      validatedData.primaryTherapistId = user.id;
    }
    
    // Add to assigned team if not already in it
    if (!validatedData.assignedTeam) {
      validatedData.assignedTeam = [user.id];
    } else if (!validatedData.assignedTeam.includes(user.id)) {
      validatedData.assignedTeam.push(user.id);
    }
    
    // Add timestamps
    validatedData.createdAt = new Date();
    validatedData.updatedAt = new Date();
    
    const client = await storage.createClient(validatedData);
    
    // Log the client creation to the audit trail
    await storage.createAuditLogEntry({
      userId: user.id,
      action: 'client_create',
      entityType: 'client',
      entityId: client.id,
      details: `Client ${client.firstName} ${client.lastName} created`
    });
    
    // Send standardized response for resource creation
    sendCreated(res, client, 'Client created successfully');
  })
);

// Update a client
router.patch('/:id', 
  validateParams(clientIdSchema),
  checkClientAccess, // Apply access control
  validateBody(extendedClientSchema.partial()),
  asyncHandler(async (req, res) => {
    // Use type assertion for user
    const user = req.user as AuthenticatedUser;
    
    const id = parseInt(req.params.id);
    
    // Get client to validate existence and access rights
    const client = await storage.getClient(id);
    
    // Check if client exists
    if (!client) {
      throw resourceNotFoundError('Client', id);
    }
    
    // Body is already validated by middleware
    const validatedData = req.body;
    
    // If user is not an administrator, they cannot reassign the client to another therapist
    if (user.role !== "administrator" && validatedData.primaryTherapistId && 
        validatedData.primaryTherapistId !== user.id) {
      throw forbiddenError("You cannot reassign clients to other therapists");
    }
    
    // Update the timestamp
    validatedData.updatedAt = new Date();
    
    const updatedClient = await storage.updateClient(id, validatedData);
    
    // Log the client update to the audit trail
    await storage.createAuditLogEntry({
      userId: user.id,
      action: 'client_update',
      entityType: 'client',
      entityId: id,
      details: `Client ${client.firstName} ${client.lastName} updated`
    });
    
    // Send standardized response for updated resource
    sendUpdated(res, updatedClient, 'Client updated successfully');
  })
);

// Delete a client
router.delete('/:id', 
  validateParams(clientIdSchema),
  asyncHandler(async (req, res) => {
    // Use type assertion for user
    const user = req.user as AuthenticatedUser;
    
    // Only administrators can delete clients
    if (user.role !== "administrator") {
      throw forbiddenError("Only administrators can delete clients");
    }
    
    const id = parseInt(req.params.id);
    
    // Get client to validate existence
    const client = await storage.getClient(id);
    
    // Check if client exists
    if (!client) {
      throw resourceNotFoundError('Client', id);
    }
    
    // Delete the client
    const success = await storage.deleteClient(id);
    
    if (!success) {
      throw operationFailedError('deleteClient', 'could not complete the operation');
    }
    
    // Log the client deletion to the audit trail
    await storage.createAuditLogEntry({
      userId: user.id,
      action: 'client_delete',
      entityType: 'client',
      entityId: id,
      details: `Client ${client.firstName} ${client.lastName} deleted`
    });
    
    // Send standardized no content response
    sendSuccessNoContent(res);
  })
);

// Get client history/timeline
router.get('/:id/history', 
  validateParams(clientIdSchema),
  checkClientAccess, // Apply access control
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Get client to validate existence
    const client = await storage.getClient(id);
    
    // Check if client exists
    if (!client) {
      throw resourceNotFoundError('Client', id);
    }
    
    // Get client history
    const history = await storage.getClientHistory(id);
    
    // Send response
    sendSuccess(res, history);
  })
);

export default router; 
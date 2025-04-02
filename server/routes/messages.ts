import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { asyncHandler } from '../utils/error-handler';
import { 
  resourceNotFoundError,
  forbiddenError,
  operationFailedError
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
import { insertMessageSchema } from '@shared/schema';
import { isAuthenticated, canAccessClient } from '../middleware';

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

// Define query schema for messages filtering
const messagesQuerySchema = z.object({
  therapistId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  clientId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  isRead: z.string().optional().transform(val => val === 'true'),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  // Include pagination fields
  page: paginationSchema.shape.page,
  limit: paginationSchema.shape.limit
});

// Define param schema for client ID
const clientIdSchema = z.object({
  clientId: z.string().transform(val => parseInt(val))
});

// Define param schema for message ID
const messageIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Get all messages for the current user
router.get('/', 
  isAuthenticated, 
  validateQuery(messagesQuerySchema),
  asyncHandler(async (req, res) => {
    const user = req.user as AuthenticatedUser;
    
    // Extract pagination and filter parameters
    const { 
      page, limit, 
      therapistId, clientId, isRead, category, 
      search, startDate, endDate 
    } = req.query as any;
    
    // Prepare filters
    const filters: {
      therapistId: number;
      clientId?: number;
      isRead?: boolean;
      category?: string;
      search?: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      therapistId: user.id
    };
    
    // Admin can filter by therapist
    if (user.role === "administrator" && therapistId) {
      filters.therapistId = therapistId;
    }
    
    // Apply other filters
    if (clientId) {
      filters.clientId = clientId;
    }
    
    if (isRead !== undefined) {
      filters.isRead = isRead;
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (search) {
      filters.search = search;
    }
    
    if (startDate) {
      filters.startDate = startDate;
    }
    
    if (endDate) {
      filters.endDate = endDate;
    }
    
    // Get paginated messages
    const result = await storage.getMessages(filters, {
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

// Get messages for a specific client
router.get('/client/:clientId', 
  isAuthenticated, 
  validateParams(clientIdSchema),
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const user = req.user as AuthenticatedUser;
    const clientId = req.params.clientId as unknown as number; // Already validated and transformed
    const { page, limit } = req.query as any;
    
    // Check if client exists
    const client = await storage.getClient(clientId);
    if (!client) {
      throw resourceNotFoundError('Client', clientId);
    }
    
    // Check if user has permission to access client messages
    if (user.role !== "administrator" && client.primaryTherapistId !== user.id) {
      throw forbiddenError("You don't have permission to access this client's messages");
    }
    
    // Prepare filters
    const filters = { 
      clientId, 
      therapistId: user.id 
    };
    
    // Get paginated messages for this client
    const result = await storage.getMessages(filters, {
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
    
    // Send paginated response with client info
    sendPaginatedSuccess(res, result.data, pagination, {
      client: {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`
      }
    });
  })
);

// Get a specific message
router.get('/:id', 
  isAuthenticated, 
  validateParams(messageIdSchema),
  asyncHandler(async (req, res) => {
    const user = req.user as AuthenticatedUser;
    const messageId = req.params.id as unknown as number; // Already validated and transformed
    
    const message = await storage.getMessage(messageId);
    
    if (!message) {
      throw resourceNotFoundError('Message', messageId);
    }
    
    // Check if user has permission to access this message
    if (user.role !== "administrator" && message.therapistId !== user.id) {
      throw forbiddenError("You don't have permission to access this message");
    }
    
    // Send standardized response
    sendSuccess(res, message);
  })
);

// Send a message
router.post('/', 
  isAuthenticated, 
  validateBody(insertMessageSchema),
  asyncHandler(async (req, res) => {
    const user = req.user as AuthenticatedUser;
    
    // Body is already validated by middleware
    const validatedData = req.body;
    
    // Check if client exists
    const client = await storage.getClient(validatedData.clientId);
    if (!client) {
      throw resourceNotFoundError('Client', validatedData.clientId);
    }
    
    // Check if user has permission to send messages to this client
    if (user.role !== "administrator" && client.primaryTherapistId !== user.id) {
      throw forbiddenError("You don't have permission to send messages to this client");
    }
    
    // Set the therapist ID and sender
    validatedData.therapistId = user.id;
    validatedData.sender = "therapist";
    
    const message = await storage.createMessage(validatedData);
    
    // Send standardized response for created resource
    sendCreated(res, message, 'Message sent successfully');
  })
);

// Mark message as read
router.patch('/:id/read', 
  isAuthenticated, 
  validateParams(messageIdSchema),
  asyncHandler(async (req, res) => {
    const user = req.user as AuthenticatedUser;
    const messageId = req.params.id as unknown as number; // Already validated and transformed
    
    const message = await storage.getMessage(messageId);
    
    if (!message) {
      throw resourceNotFoundError('Message', messageId);
    }
    
    // Check if user has permission to update this message
    if (user.role !== "administrator" && message.therapistId !== user.id) {
      throw forbiddenError("You don't have permission to update this message");
    }
    
    // Check if message is already read
    if (message.isRead) {
      // Send standardized response with note in metadata
      return sendSuccess(res, message, 200, {
        note: 'Message was already marked as read'
      });
    }
    
    const updatedMessage = await storage.updateMessage(messageId, { isRead: true });
    
    if (!updatedMessage) {
      throw operationFailedError('markMessageAsRead', 'could not update the message');
    }
    
    // Send standardized response for updated resource
    sendUpdated(res, updatedMessage, 'Message marked as read');
  })
);

// Delete a message (admin only)
router.delete('/:id', 
  isAuthenticated, 
  validateParams(messageIdSchema),
  asyncHandler(async (req, res) => {
    const user = req.user as AuthenticatedUser;
    const messageId = req.params.id as unknown as number; // Already validated and transformed
    
    // Only administrators can delete messages
    if (user.role !== "administrator") {
      throw forbiddenError("Only administrators can delete messages");
    }
    
    const message = await storage.getMessage(messageId);
    
    if (!message) {
      throw resourceNotFoundError('Message', messageId);
    }
    
    const success = await storage.deleteMessage(messageId);
    
    if (!success) {
      throw operationFailedError('deleteMessage', 'could not delete the message');
    }
    
    // Send standardized no content response
    sendSuccessNoContent(res);
  })
);

export default router; 
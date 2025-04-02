import type { Express } from "express";
import { createServer, type Server } from "http";
import { logger } from "./logger";
import { setupAuth } from "./auth";
import { CalendarService } from "./services/calendar-service";
import { storage } from "./storage";
import { sendSuccess } from "./utils/api-response";

/**
 * This function registers legacy routes from the monolithic approach.
 * It is kept for backwards compatibility during the migration to modular routes.
 * 
 * New routes should be implemented as modular route files and registered
 * in server/routes/index.ts instead.
 * 
 * @deprecated This will be removed once the migration to modular routes is complete
 */
export async function registerLegacyRoutes(app: Express): Promise<Server> {
  logger.warn("Using legacy route registration. This should be migrated to modular routes.");
  
  // Temporary endpoint to get current hostname
  app.get('/api/check-hostname', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'] || 'localhost:3000';
    const fullUrl = `${protocol}://${host}`;
    
    sendSuccess(res, { 
      hostname: fullUrl,
      protocol,
      host
    }, 200, undefined, "Current hostname retrieved successfully");
  });
  
  // Initialize calendar service
  const calendarService = new CalendarService(storage);
  
  // Start a session reminder processor that runs every minute
  setInterval(async () => {
    try {
      const remindersSent = await calendarService.processSessionReminders();
      if (remindersSent > 0) {
        logger.info(`Processed ${remindersSent} session reminders`);
      }
    } catch (error) {
      logger.error(`Error processing session reminders: ${error}`);
    }
  }, 60 * 1000); // Run every minute
  
  return createServer(app);
} 
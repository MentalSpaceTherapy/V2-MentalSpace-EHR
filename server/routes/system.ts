import { Router, Request, Response } from "express";
import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/error-handler";

const router = Router();

/**
 * Get the current hostname information
 * @route GET /system/hostname
 */
router.get("/hostname", asyncHandler(async (req: Request, res: Response) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'] || 'localhost:3000';
  const fullUrl = `${protocol}://${host}`;
  
  sendSuccess(res, { 
    hostname: fullUrl,
    protocol,
    host,
    environment: process.env.NODE_ENV || 'development'
  }, 200, undefined, "Current hostname retrieved successfully");
}));

/**
 * Get system health information
 * @route GET /system/health
 */
router.get("/health", asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Basic health check - can be expanded to check database, cache, etc.
  const healthData = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown"
  };
  
  // Calculate response time
  const responseTime = Date.now() - startTime;
  
  sendSuccess(res, healthData, 200, {
    processingTimeMs: responseTime
  });
}));

export default router; 
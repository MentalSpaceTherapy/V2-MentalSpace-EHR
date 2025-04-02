import express from "express";
import session from "express-session";
import cors from "cors";
import { logger } from "./logger";
import { 
  errorHandler, 
  requestLogger, 
  notFoundHandler, 
  securityHeaders,
  isAuthenticated
} from "./middleware";
import { registerLegacyRoutes } from "./register-legacy-routes";
import { ApiError } from "./middleware/errorHandler";

// Import individual routers
import authRouter from "./routes/auth";
import clientsRouter from "./routes/clients";
import { protectedRouter } from "./routes/protected";
import { adminRouter } from "./routes/admin";
import systemRouter from "./routes/system";

// Import security service
import { securityService } from './security';

// Import security routes
import securityRoutes from './routes/security';

const app = express();

// Apply basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security headers
app.use(securityHeaders);

// Request logging middleware
app.use(requestLogger);

// CORS middleware - more secure configuration using env variables
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
};

app.use(cors(corsOptions));

// Session middleware - using the secret from environment variables
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // This fallback should never be used in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000') // Default to 24 hours
  }
}));

// Add security middleware
app.use(securityService.ipTrackingMiddleware);
app.use(securityService.preventParamPollutionMiddleware);
app.use(securityService.cleanupMiddleware);

// Mount API routes - these are the new modular routes
app.use("/api/auth", authRouter);
app.use("/api/clients", isAuthenticated, clientsRouter);
app.use("/api/protected", isAuthenticated, protectedRouter);
app.use("/api/admin", isAuthenticated, adminRouter);

// Register security routes
app.use('/api/security', securityRoutes);

// Register the system routes
app.use("/api/system", systemRouter);
logger.info("System routes registered successfully");

// Try to load new route modules if they exist
try {
  const sessionRouter = require('./routes/sessions').default;
  app.use("/api/sessions", isAuthenticated, sessionRouter);
  logger.info("Session routes registered successfully");
} catch (err) {
  logger.warn("Session routes not available, skipping");
}

try {
  const documentationRouter = require('./routes/documentation').default;
  app.use("/api/documentation", isAuthenticated, documentationRouter);
  logger.info("Documentation routes registered successfully");
} catch (err) {
  logger.warn("Documentation routes not available, skipping");
}

try {
  const messagesRouter = require('./routes/messages').default;
  app.use("/api/messages", isAuthenticated, messagesRouter);
  logger.info("Message routes registered successfully");
} catch (err) {
  logger.warn("Message routes not available, skipping");
}

// Register legacy routes from routes.ts for backwards compatibility
// DEPRECATED - These routes will be removed in a future version
logger.warn("Legacy routes are deprecated and will be removed in a future version. Please migrate to the new API endpoints.");
registerLegacyRoutes(app).then((server) => {
  logger.info("Legacy routes registered successfully");
}).catch(err => {
  logger.error(`Failed to register legacy routes: ${err.message}`);
});

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Error handling middleware - should be after all routes
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  logger.info(`Server running at http://127.0.0.1:${port}`);
  logger.info(`Frontend available at ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unexpected errors to prevent server from crashing
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  // Keep the process alive but log the error
});

process.on('unhandledRejection', (reason: any, promise) => {
  logger.error(`Unhandled Rejection at: ${JSON.stringify(promise)}, reason: ${reason}`);
  // Keep the process alive but log the error
});

export { app, server };

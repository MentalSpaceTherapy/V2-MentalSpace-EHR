import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { routes } from "./routes";
import { initializeTelehealthService } from "./services/telehealth";
import { initializeWebSocketServer } from "./services/websocket";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

// Initialize Vite in development mode
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "spa",
});

app.use(vite.middlewares);

// Initialize services
initializeTelehealthService();
initializeWebSocketServer();

// Start server
app.listen(port, "127.0.0.1", () => {
  logger.info(`Frontend available at http://127.0.0.1:${port}`);
});

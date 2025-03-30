import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "../shared/schema";

// Mock database connection for frontend-only mode
const pool = new Pool({
  connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
  max: 0, // Prevent actual connections
});

// Create a Drizzle instance
export const db = drizzle(pool, { schema });

// Healthcheck function to verify database connectivity
export async function dbHealthcheck() {
  return true; // Always return true in frontend-only mode
}
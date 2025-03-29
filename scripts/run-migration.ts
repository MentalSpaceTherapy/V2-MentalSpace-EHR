import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Database URL not found in environment variables");
  process.exit(1);
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Create the db instance
const db = drizzle(pool);

async function runMigration() {
  console.log("Starting database migration...");
  
  try {
    // Run migrations
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

runMigration().catch(console.error);
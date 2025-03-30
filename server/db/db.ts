// src/db/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://username:password@localhost:5432/mydatabase",
});

export const db = drizzle(pool, { schema });
import { db } from '../server/db';
import { messages } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    // Create the messages table directly
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" SERIAL PRIMARY KEY,
        "client_id" INTEGER NOT NULL REFERENCES "clients"("id"),
        "therapist_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "content" TEXT NOT NULL,
        "sender" TEXT NOT NULL,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "status" TEXT NOT NULL DEFAULT 'sent',
        "created_at" TIMESTAMP DEFAULT now() NOT NULL
      );
    `);
    
    console.log('Messages table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
}

main();
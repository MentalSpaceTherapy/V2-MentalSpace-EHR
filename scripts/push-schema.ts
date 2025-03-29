import { db } from '../server/db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function main() {
  try {
    console.log('Starting schema push...');
    
    // Create messages table if missing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" SERIAL PRIMARY KEY,
        "client_id" INTEGER NOT NULL REFERENCES "clients"("id"),
        "therapist_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "content" TEXT NOT NULL,
        "subject" TEXT,
        "category" TEXT DEFAULT 'Clinical',
        "sender" TEXT NOT NULL,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "status" TEXT NOT NULL DEFAULT 'sent',
        "created_at" TIMESTAMP DEFAULT now() NOT NULL,
        "attachments" JSONB DEFAULT '[]'
      );
    `);
    
    // Add password_hash column to users if not exists and handle existing users
    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;
      END IF;
        
      -- Update existing users with a temporary hash that will need to be changed on first login
      UPDATE "users" SET "password_hash" = 'TEMPORARY-HASH-' || "username" WHERE "password_hash" IS NULL;
        
      -- Now make it non-nullable, if it's not already
      IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='users' 
          AND column_name='password_hash' 
          AND is_nullable='YES'
      ) THEN
          ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
      END IF;
      END $$;
    `);

    // Add missing columns to leads table
    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='leads') THEN
        CREATE TABLE "leads" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "source" TEXT,
          "source_id" INTEGER,
          "status" TEXT DEFAULT 'new' NOT NULL,
          "notes" TEXT,
          "stage" TEXT DEFAULT 'inquiry' NOT NULL,
          "assigned_to_id" INTEGER REFERENCES "users"("id"),
          "date_added" TIMESTAMP DEFAULT now() NOT NULL,
          "last_contact_date" TIMESTAMP DEFAULT now() NOT NULL,
          "interested_services" JSONB DEFAULT '[]',
          "demographic_info" JSONB DEFAULT '{}',
          "conversion_date" TIMESTAMP,
          "converted_to_client_id" INTEGER REFERENCES "clients"("id"),
          "marketing_campaign_id" INTEGER,
          "lead_score" INTEGER DEFAULT 0,
          "conversion_probability" INTEGER DEFAULT 0,
          "last_activity_date" TIMESTAMP DEFAULT now(),
          "tags" TEXT[]
        );
      END IF;
      END $$;
    `);

    // Add CRM tables if they don't exist
    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='marketing_campaigns') THEN
        CREATE TABLE "marketing_campaigns" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "status" TEXT DEFAULT 'draft' NOT NULL,
          "description" TEXT,
          "audience" TEXT,
          "content" JSONB DEFAULT '{}',
          "start_date" TIMESTAMP,
          "end_date" TIMESTAMP,
          "created_by_id" INTEGER REFERENCES "users"("id") NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "tags" TEXT[],
          "stats" JSONB DEFAULT '{}'
        );
      END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='marketing_events') THEN
        CREATE TABLE "marketing_events" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "description" TEXT,
          "date" TIMESTAMP NOT NULL,
          "duration" INTEGER,
          "location" TEXT NOT NULL,
          "capacity" INTEGER DEFAULT 0,
          "status" TEXT DEFAULT 'upcoming' NOT NULL,
          "created_by_id" INTEGER REFERENCES "users"("id") NOT NULL,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL
        );
      END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='event_registrations') THEN
        CREATE TABLE "event_registrations" (
          "id" SERIAL PRIMARY KEY,
          "event_id" INTEGER REFERENCES "marketing_events"("id") NOT NULL,
          "lead_id" INTEGER REFERENCES "leads"("id"),
          "client_id" INTEGER REFERENCES "clients"("id"),
          "email" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "status" TEXT DEFAULT 'registered' NOT NULL,
          "registration_date" TIMESTAMP DEFAULT now() NOT NULL,
          "notes" TEXT
        );
      END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='contact_history') THEN
        CREATE TABLE "contact_history" (
          "id" SERIAL PRIMARY KEY,
          "lead_id" INTEGER REFERENCES "leads"("id"),
          "client_id" INTEGER REFERENCES "clients"("id"),
          "contact_type" TEXT NOT NULL,
          "direction" TEXT NOT NULL,
          "subject" TEXT,
          "content" TEXT,
          "contact_number" INTEGER DEFAULT 1,
          "date" TIMESTAMP DEFAULT now() NOT NULL,
          "duration" INTEGER,
          "notes" TEXT,
          "outcome" TEXT,
          "follow_up_date" TIMESTAMP,
          "follow_up_type" TEXT,
          "completed_by_id" INTEGER REFERENCES "users"("id") NOT NULL,
          "campaign_id" INTEGER REFERENCES "marketing_campaigns"("id")
        );
      END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='referral_sources') THEN
        CREATE TABLE "referral_sources" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "details" JSONB DEFAULT '{}',
          "active_since" TIMESTAMP DEFAULT now(),
          "active_status" TEXT DEFAULT 'active' NOT NULL,
          "contact_person" TEXT,
          "contact_email" TEXT,
          "contact_phone" TEXT,
          "notes" TEXT,
          "created_by_id" INTEGER REFERENCES "users"("id") NOT NULL,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL
        );
      END IF;
      END $$;
    `);
    
    console.log('Schema push completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
}

main();
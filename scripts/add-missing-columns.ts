// scripts/add-missing-columns.ts
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * This script adds missing columns to the database tables
 * that are defined in the schema but don't exist in the actual tables.
 */
async function addMissingColumns() {
  console.log('Starting to add missing columns...');
  
  try {
    // Add referral_source_id column to clients table if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='clients' 
          AND column_name='referral_source_id'
        ) THEN
          ALTER TABLE "clients" 
          ADD COLUMN "referral_source_id" INTEGER REFERENCES "referral_sources"("id");
          
          RAISE NOTICE 'Added referral_source_id column to clients table';
        ELSE
          RAISE NOTICE 'referral_source_id column already exists in clients table';
        END IF;
      END $$;
    `);
    
    // Add lead_id column to clients table if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='clients' 
          AND column_name='lead_id'
        ) THEN
          ALTER TABLE "clients" 
          ADD COLUMN "lead_id" INTEGER REFERENCES "leads"("id");
          
          RAISE NOTICE 'Added lead_id column to clients table';
        ELSE
          RAISE NOTICE 'lead_id column already exists in clients table';
        END IF;
      END $$;
    `);
    
    // Add referral_notes column to clients table if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='clients' 
          AND column_name='referral_notes'
        ) THEN
          ALTER TABLE "clients" 
          ADD COLUMN "referral_notes" TEXT;
          
          RAISE NOTICE 'Added referral_notes column to clients table';
        ELSE
          RAISE NOTICE 'referral_notes column already exists in clients table';
        END IF;
      END $$;
    `);
    
    // Add conversion_date column to clients table if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='clients' 
          AND column_name='conversion_date'
        ) THEN
          ALTER TABLE "clients" 
          ADD COLUMN "conversion_date" TIMESTAMP;
          
          RAISE NOTICE 'Added conversion_date column to clients table';
        ELSE
          RAISE NOTICE 'conversion_date column already exists in clients table';
        END IF;
      END $$;
    `);
    
    // Add original_marketing_campaign_id column to clients table if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='clients' 
          AND column_name='original_marketing_campaign_id'
        ) THEN
          ALTER TABLE "clients" 
          ADD COLUMN "original_marketing_campaign_id" INTEGER REFERENCES "marketing_campaigns"("id");
          
          RAISE NOTICE 'Added original_marketing_campaign_id column to clients table';
        ELSE
          RAISE NOTICE 'original_marketing_campaign_id column already exists in clients table';
        END IF;
      END $$;
    `);
    
    // Add referral_source_id column to marketing_campaigns table if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='marketing_campaigns' 
          AND column_name='referral_source_id'
        ) THEN
          ALTER TABLE "marketing_campaigns" 
          ADD COLUMN "referral_source_id" INTEGER REFERENCES "referral_sources"("id");
          
          RAISE NOTICE 'Added referral_source_id column to marketing_campaigns table';
        ELSE
          RAISE NOTICE 'referral_source_id column already exists in marketing_campaigns table';
        END IF;
      END $$;
    `);
    
    console.log('Successfully added all missing columns!');
  } catch (error) {
    console.error('Error adding missing columns:', error);
  }
}

// Run the function
addMissingColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
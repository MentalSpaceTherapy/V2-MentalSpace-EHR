-- Migration: add_client_fields
-- Created at: 2024-07-01T00:00:03.000Z
-- Description: Add additional client fields needed for comprehensive records

-- Add fields to clients table if they don't exist
DO $$
BEGIN
  -- Contact and demographic information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'city') THEN
    ALTER TABLE clients ADD COLUMN city VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'state') THEN
    ALTER TABLE clients ADD COLUMN state VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'zip_code') THEN
    ALTER TABLE clients ADD COLUMN zip_code VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'gender') THEN
    ALTER TABLE clients ADD COLUMN gender VARCHAR(50);
  END IF;
  
  -- Emergency contact information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'emergency_contact_name') THEN
    ALTER TABLE clients ADD COLUMN emergency_contact_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'emergency_contact_phone') THEN
    ALTER TABLE clients ADD COLUMN emergency_contact_phone VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'emergency_contact_relationship') THEN
    ALTER TABLE clients ADD COLUMN emergency_contact_relationship VARCHAR(100);
  END IF;
  
  -- Insurance information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'insurance_provider') THEN
    ALTER TABLE clients ADD COLUMN insurance_provider VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'insurance_policy_number') THEN
    ALTER TABLE clients ADD COLUMN insurance_policy_number VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'insurance_group_number') THEN
    ALTER TABLE clients ADD COLUMN insurance_group_number VARCHAR(100);
  END IF;
  
  -- Clinical information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'diagnosis') THEN
    ALTER TABLE clients ADD COLUMN diagnosis JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'medications') THEN
    ALTER TABLE clients ADD COLUMN medications JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'allergies') THEN
    ALTER TABLE clients ADD COLUMN allergies TEXT[];
  END IF;
  
  -- Administrative information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'referral_source') THEN
    ALTER TABLE clients ADD COLUMN referral_source VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'intake_date') THEN
    ALTER TABLE clients ADD COLUMN intake_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'discharge_date') THEN
    ALTER TABLE clients ADD COLUMN discharge_date DATE;
  END IF;
  
  -- Add indexes for performance
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_intake_date') THEN
    CREATE INDEX idx_clients_intake_date ON clients(intake_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_insurance_provider') THEN
    CREATE INDEX idx_clients_insurance_provider ON clients(insurance_provider);
  END IF;
END$$; 
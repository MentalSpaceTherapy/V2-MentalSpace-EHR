-- Migration: encrypt_sensitive_data
-- Created at: 2024-07-02T00:00:01.000Z
-- Description: Add encrypted columns for sensitive patient data

-- Add new columns to store encrypted data
DO $$
BEGIN
  -- Client table encryption fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'encrypted_ssn') THEN
    ALTER TABLE clients ADD COLUMN encrypted_ssn TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'encrypted_health_info') THEN
    ALTER TABLE clients ADD COLUMN encrypted_health_info JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'encrypted_payment_info') THEN
    ALTER TABLE clients ADD COLUMN encrypted_payment_info TEXT;
  END IF;
  
  -- Documentation encryption for sensitive clinical notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentation' AND column_name = 'encrypted_content') THEN
    ALTER TABLE documentation ADD COLUMN encrypted_content TEXT;
  END IF;
  
  -- Flag to indicate if content has been encrypted
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentation' AND column_name = 'is_encrypted') THEN
    ALTER TABLE documentation ADD COLUMN is_encrypted BOOLEAN DEFAULT false;
  END IF;
  
  -- Add encrypted field for messages that might contain PHI
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'encrypted_content') THEN
    ALTER TABLE messages ADD COLUMN encrypted_content TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_encrypted') THEN
    ALTER TABLE messages ADD COLUMN is_encrypted BOOLEAN DEFAULT false;
  END IF;
END$$;

-- Create a trigger to automatically encrypt sensitive documentation
CREATE OR REPLACE FUNCTION encrypt_documentation_content()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder - actual encryption is done in application code
  -- This trigger just sets the flag to remind the app to encrypt the content
  -- For actual encryption implementation, the app needs to implement it
  -- using proper key management
  IF NEW.content IS NOT NULL AND NEW.content != '' AND NOT NEW.is_encrypted THEN
    NEW.is_encrypted = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_encrypt_documentation_content'
  ) THEN
    CREATE TRIGGER trigger_encrypt_documentation_content
    BEFORE INSERT OR UPDATE ON documentation
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_documentation_content();
  END IF;
END$$;

-- Also for messages
CREATE OR REPLACE FUNCTION encrypt_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Same placeholder approach as for documentation
  IF NEW.content IS NOT NULL AND NEW.content != '' AND NOT NEW.is_encrypted THEN
    NEW.is_encrypted = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_encrypt_message_content'
  ) THEN
    CREATE TRIGGER trigger_encrypt_message_content
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_message_content();
  END IF;
END$$;

-- Add an audit table to track encryption operations
CREATE TABLE IF NOT EXISTS encryption_audit (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER NOT NULL,
  performed_by INTEGER REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_successful BOOLEAN NOT NULL,
  error_message TEXT
);

-- Create indexes for the audit table
CREATE INDEX IF NOT EXISTS idx_encryption_audit_record ON encryption_audit(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_encryption_audit_performed_by ON encryption_audit(performed_by);
CREATE INDEX IF NOT EXISTS idx_encryption_audit_date ON encryption_audit(performed_at); 
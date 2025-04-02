-- Migration: add_two_factor_auth
-- Created at: 2024-07-01T00:00:01.000Z
-- Description: Add two-factor authentication support

-- Create two_factor_auth table if it doesn't exist
CREATE TABLE IF NOT EXISTS two_factor_auth (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  recovery_codes TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  backup_codes_used INTEGER[] DEFAULT '{}'
);

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);

-- Add function to generate new backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(code_count INTEGER)
RETURNS TEXT[] AS $$
DECLARE
  codes TEXT[] := '{}';
  code TEXT;
  i INTEGER;
BEGIN
  FOR i IN 1..code_count LOOP
    -- Generate a random 8-character hexadecimal code
    code := encode(gen_random_bytes(4), 'hex');
    codes := array_append(codes, code);
  END LOOP;
  RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Add columns to track 2FA status in the users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_enabled') THEN
    ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_method') THEN
    ALTER TABLE users ADD COLUMN two_factor_method VARCHAR(20) DEFAULT 'none';
  END IF;
END $$;

-- Add audit table for tracking 2FA events
CREATE TABLE IF NOT EXISTS two_factor_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- setup, login, recovery, disable
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_two_factor_events_user_id ON two_factor_events(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_events_created_at ON two_factor_events(created_at);

-- Add comments to document the tables
COMMENT ON TABLE two_factor_auth IS 'Stores TOTP secrets and recovery codes for two-factor authentication';
COMMENT ON TABLE two_factor_events IS 'Audit log for two-factor authentication events';
COMMENT ON FUNCTION generate_backup_codes(INTEGER) IS 'Function to generate random backup codes for 2FA recovery'; 
-- Migration: add_password_reset
-- Created at: 2024-07-01T00:00:00.000Z
-- Description: Add password reset functionality tables and indexes

-- Create password_reset_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  used BOOLEAN DEFAULT false NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add function to auto-cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments to document the table and function
COMMENT ON TABLE password_reset_tokens IS 'Stores tokens for password reset functionality';
COMMENT ON FUNCTION cleanup_expired_password_reset_tokens() IS 'Cleanup function for removing expired password reset tokens';

-- Add columns to track password management in the users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_last_changed') THEN
    ALTER TABLE users ADD COLUMN password_last_changed TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_required') THEN
    ALTER TABLE users ADD COLUMN password_reset_required BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'previous_passwords') THEN
    ALTER TABLE users ADD COLUMN previous_passwords VARCHAR(255)[] DEFAULT '{}';
  END IF;
END $$; 
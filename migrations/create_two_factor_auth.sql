-- Create two_factor_auth table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(128) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_codes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure each user has only one 2FA record
  CONSTRAINT two_factor_auth_user_id_unique UNIQUE (user_id)
);

-- Add index for user_id for quick lookups
CREATE INDEX IF NOT EXISTS two_factor_auth_user_id_idx ON two_factor_auth (user_id);

-- Add index for enabled flag for quick filtering
CREATE INDEX IF NOT EXISTS two_factor_auth_enabled_idx ON two_factor_auth (enabled);

-- Add automatic update of updated_at column when a record is updated
CREATE OR REPLACE FUNCTION update_two_factor_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_two_factor_auth_updated_at
BEFORE UPDATE ON two_factor_auth
FOR EACH ROW
EXECUTE FUNCTION update_two_factor_auth_updated_at(); 
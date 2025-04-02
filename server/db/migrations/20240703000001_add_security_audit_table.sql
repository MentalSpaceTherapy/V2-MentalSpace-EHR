-- Migration: add_security_audit_table
-- Created at: 2024-07-03T00:00:01.000Z
-- Description: Adds a security audit table for tracking security events

-- Create a security_audit table to track security-related events
CREATE TABLE IF NOT EXISTS security_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45) NOT NULL, -- IPv6 can be up to 45 characters
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  severity VARCHAR(10) NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
  is_resolved BOOLEAN DEFAULT false,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON security_audit(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_timestamp ON security_audit(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_ip ON security_audit(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON security_audit(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_resolved ON security_audit(is_resolved);

-- Create login_attempts table to track failed login attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  success BOOLEAN DEFAULT false,
  attempt_count INTEGER DEFAULT 1
);

-- Create indexes for login_attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(timestamp);

-- Create a function to clean up old login attempts
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  -- Delete login attempts older than 7 days
  DELETE FROM login_attempts 
  WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'cleanup_login_attempts_job'
    AND n.nspname = 'cron'
  ) AND EXISTS (
    SELECT 1 FROM pg_catalog.pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Only create the job if pg_cron extension is available
    PERFORM cron.schedule(
      'cleanup_login_attempts_job',
      '0 2 * * *', -- Run at 2 AM every day
      'SELECT cleanup_old_login_attempts()'
    );
  END IF;
END $$;

-- Create a view for recent suspicious activity
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
  sa.id,
  sa.user_id,
  u.username,
  sa.action,
  sa.ip_address,
  sa.timestamp,
  sa.details,
  sa.severity
FROM 
  security_audit sa
LEFT JOIN 
  users u ON sa.user_id = u.id
WHERE 
  sa.severity IN ('MEDIUM', 'HIGH')
  AND sa.timestamp > NOW() - INTERVAL '7 days'
  AND sa.is_resolved = false
ORDER BY 
  sa.timestamp DESC; 
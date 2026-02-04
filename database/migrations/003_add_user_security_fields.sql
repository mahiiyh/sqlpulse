-- Add security fields to users table for account locking mechanism
-- Migration: 003_add_user_security_fields

-- Add failed_login_attempts column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add locked_until column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Create index for locked accounts query
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;

-- Update existing users to have 0 failed attempts
UPDATE users 
SET failed_login_attempts = 0 
WHERE failed_login_attempts IS NULL;

-- Add comment
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Timestamp until which the account is locked (NULL if not locked)';

-- Migration: Add login tracking and account lockout fields
-- Created: 2026-02-04
-- Purpose: Support account lockout after failed login attempts

BEGIN;

-- Add failed login attempts counter
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;

-- Add account lockout timestamp
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;

-- Add index for efficient lockout checks
CREATE INDEX IF NOT EXISTS idx_users_locked_until 
ON users(locked_until) 
WHERE locked_until IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for consecutive failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Account locked until this timestamp (NULL = not locked)';

COMMIT;

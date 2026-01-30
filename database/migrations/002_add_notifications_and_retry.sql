-- Migration: Add notification and retry configuration to schedules
-- Add retry attempt tracking to execution history

-- Add notification columns to schedules table
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_channel VARCHAR(50),
ADD COLUMN IF NOT EXISTS notification_config JSONB;

-- Add retry columns to schedules table
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS retry_delay_seconds INTEGER NOT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS exponential_backoff BOOLEAN NOT NULL DEFAULT false;

-- Add retry attempt tracking to execution_history table
ALTER TABLE execution_history
ADD COLUMN IF NOT EXISTS retry_attempt INTEGER NOT NULL DEFAULT 0;

-- Create index on notification_enabled for faster filtering
CREATE INDEX IF NOT EXISTS idx_schedules_notification_enabled ON schedules(notification_enabled);

-- Create index on retry_attempt for analytics
CREATE INDEX IF NOT EXISTS idx_execution_history_retry_attempt ON execution_history(retry_attempt);

-- Add comments for documentation
COMMENT ON COLUMN schedules.notification_enabled IS 'Whether notifications are enabled for this schedule';
COMMENT ON COLUMN schedules.notification_channel IS 'Notification channel: email, slack, or webhook';
COMMENT ON COLUMN schedules.notification_config IS 'JSON configuration for the notification channel';
COMMENT ON COLUMN schedules.max_retries IS 'Maximum number of retry attempts on failure';
COMMENT ON COLUMN schedules.retry_delay_seconds IS 'Delay between retry attempts in seconds';
COMMENT ON COLUMN schedules.exponential_backoff IS 'Whether to use exponential backoff for retries';
COMMENT ON COLUMN execution_history.retry_attempt IS 'Which retry attempt this execution represents (0 = first attempt)';

-- language: postgresql
-- @ts-nocheck
-- sqlfluff:disable
-- Initialize database schema for SQL Query Management Dashboard

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'read_only',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Database connections table
CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  database_name VARCHAR(200) NOT NULL,
  username VARCHAR(200) NOT NULL,
  encrypted_password TEXT NOT NULL,
  environment VARCHAR(50) NOT NULL DEFAULT 'dev',
  max_connections INTEGER DEFAULT 10,
  timeout_seconds INTEGER DEFAULT 30,
  connection_string TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sql_content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'other',
  database_type VARCHAR(50) NOT NULL,
  project_name VARCHAR(200),
  created_by INTEGER NOT NULL REFERENCES users(id),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_dangerous BOOLEAN NOT NULL DEFAULT FALSE,
  is_schedulable BOOLEAN NOT NULL DEFAULT TRUE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  execution_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Query versions table (for version control)
CREATE TABLE IF NOT EXISTS query_versions (
  id SERIAL PRIMARY KEY,
  query_id INTEGER NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  sql_content TEXT NOT NULL,
  change_description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_query_version UNIQUE (query_id, version_number)
);

-- Query tags table
CREATE TABLE IF NOT EXISTS query_tags (
  id SERIAL PRIMARY KEY,
  query_id INTEGER NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Query templates table
CREATE TABLE IF NOT EXISTS query_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sql_template TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  tags TEXT[] NOT NULL DEFAULT '{}',
  variables JSONB,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  query_id INTEGER NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  connection_id INTEGER NOT NULL REFERENCES connections(id),
  schedule_name VARCHAR(255) NOT NULL,
  description TEXT,
  schedule_type VARCHAR(50) NOT NULL,
  cron_expression VARCHAR(100),
  next_run_time TIMESTAMP,
  last_run_time TIMESTAMP,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  created_by INTEGER NOT NULL REFERENCES users(id),
  notification_enabled BOOLEAN DEFAULT FALSE,
  notification_channel VARCHAR(50),
  notification_config JSONB,
  max_retries INTEGER DEFAULT 0,
  retry_delay_seconds INTEGER DEFAULT 60,
  exponential_backoff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Schedule parameters table
CREATE TABLE IF NOT EXISTS schedule_parameters (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  parameter_name VARCHAR(200) NOT NULL,
  parameter_value TEXT,
  is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Execution history table
CREATE TABLE IF NOT EXISTS execution_history (
  id SERIAL PRIMARY KEY,
  query_id INTEGER NOT NULL REFERENCES queries(id),
  schedule_id INTEGER REFERENCES schedules(id),
  connection_id INTEGER NOT NULL REFERENCES connections(id),
  executed_by INTEGER REFERENCES users(id),
  execution_type VARCHAR(50) NOT NULL DEFAULT 'manual',
  executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  execution_time_ms INTEGER,
  rows_affected INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  parameters_used JSONB,
  retry_attempt INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notification channels table
CREATE TABLE IF NOT EXISTS notification_channels (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  channel_type VARCHAR(50) NOT NULL,
  config_json JSONB NOT NULL,
  notify_on_success BOOLEAN NOT NULL DEFAULT FALSE,
  notify_on_failure BOOLEAN NOT NULL DEFAULT TRUE,
  notify_on_condition TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_queries_created_by ON queries(created_by);
CREATE INDEX IF NOT EXISTS idx_queries_category ON queries(category);
CREATE INDEX IF NOT EXISTS idx_queries_database_type ON queries(database_type);

CREATE INDEX IF NOT EXISTS idx_query_versions_query_id ON query_versions(query_id);
CREATE INDEX IF NOT EXISTS idx_query_versions_created_at ON query_versions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_schedules_query_id ON schedules(query_id);
CREATE INDEX IF NOT EXISTS idx_schedules_connection_id ON schedules(connection_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON schedules(next_run_time) WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_execution_history_query_id ON execution_history(query_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_schedule_id ON execution_history(schedule_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_executed_at ON execution_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_execution_history_status ON execution_history(status);

CREATE INDEX IF NOT EXISTS idx_query_tags_query_id ON query_tags(query_id);
CREATE INDEX IF NOT EXISTS idx_query_tags_tag_name ON query_tags(tag_name);

CREATE INDEX IF NOT EXISTS idx_query_templates_created_by ON query_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_query_templates_category ON query_templates(category);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, timezone)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$3ghvCswj9LDVWckQEpzy2eKZNqtnbbGfyGgurbzqiqiSN/rvJqalS',
  'admin',
  'UTC'
) ON CONFLICT (email) DO NOTHING;

-- Create sample developer user (password: dev123)
INSERT INTO users (username, email, password_hash, role, timezone)
VALUES (
  'developer',
  'dev@example.com',
  '$2a$10$LNfOThwZNH8jjGpz9clTP.rOYyffTtWV5mnn2Y//Wh20u/zb4fMVi',
  'developer',
  'UTC'
) ON CONFLICT (email) DO NOTHING;

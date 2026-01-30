-- Migration: Add schedule dependencies
-- Enables schedules to depend on completion of other schedules

CREATE TABLE IF NOT EXISTS schedule_dependencies (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  depends_on_schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL DEFAULT 'wait_for_success',
  condition_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Prevent circular dependencies at database level
  CONSTRAINT no_self_dependency CHECK (schedule_id != depends_on_schedule_id),
  CONSTRAINT unique_dependency UNIQUE (schedule_id, depends_on_schedule_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_dependencies_schedule_id ON schedule_dependencies(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_dependencies_depends_on ON schedule_dependencies(depends_on_schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_dependencies_active ON schedule_dependencies(is_active);

-- Comments for documentation
COMMENT ON TABLE schedule_dependencies IS 'Defines dependencies between scheduled queries';
COMMENT ON COLUMN schedule_dependencies.schedule_id IS 'The schedule that has a dependency';
COMMENT ON COLUMN schedule_dependencies.depends_on_schedule_id IS 'The schedule that must complete first';
COMMENT ON COLUMN schedule_dependencies.dependency_type IS 'Type: wait_for_success, wait_for_completion, conditional';
COMMENT ON COLUMN schedule_dependencies.condition_config IS 'JSON configuration for conditional dependencies (e.g., row count thresholds)';

-- Example condition_config:
-- {"min_rows": 100, "max_duration_ms": 60000, "required_status": "success"}

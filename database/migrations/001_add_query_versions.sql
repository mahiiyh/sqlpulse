-- Add query_versions table for version control of queries
-- This table was missing from the initial schema but is referenced by the QueryVersion model

CREATE TABLE IF NOT EXISTS query_versions (
  id SERIAL PRIMARY KEY,
  query_id INTEGER NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  sql_content TEXT NOT NULL,
  change_description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Ensure unique version numbers per query
  CONSTRAINT unique_query_version UNIQUE (query_id, version_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_versions_query_id ON query_versions(query_id);
CREATE INDEX IF NOT EXISTS idx_query_versions_created_at ON query_versions(created_at DESC);

-- Add initial version for existing queries (if any exist without versions)
INSERT INTO query_versions (query_id, version_number, sql_content, change_description, created_by, created_at)
SELECT 
  q.id,
  1,
  q.sql_content,
  'Initial version (migrated)',
  q.created_by,
  q.created_at
FROM queries q
WHERE NOT EXISTS (
  SELECT 1 FROM query_versions qv WHERE qv.query_id = q.id
)
ON CONFLICT (query_id, version_number) DO NOTHING;

-- Add database_type column to query_templates table
ALTER TABLE query_templates 
ADD COLUMN IF NOT EXISTS database_type VARCHAR(50);

-- Set default for existing records
UPDATE query_templates 
SET database_type = 'postgresql' 
WHERE database_type IS NULL;

```
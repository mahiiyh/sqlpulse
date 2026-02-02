#!/bin/bash

# Script to apply database migrations
# This ensures the query_versions table is created before the application starts

set -e

echo "Applying database migrations..."

# Get database connection details from environment or use defaults
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sqlquery_db}"
DB_USER="${POSTGRES_USER:-sqlquery_user}"

# Apply migrations in order
echo "Creating query_versions table..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/database/migrations/001_add_query_versions.sql

echo "Applying notification and retry migration..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/database/migrations/002_add_notifications_and_retry.sql

echo "Applying schedule dependencies migration..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/database/migrations/003_add_schedule_dependencies.sql

echo "All migrations applied successfully!"

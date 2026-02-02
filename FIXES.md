# Internal Server Error Fixes

## Issues Identified and Fixed

### Query Creation/Update Issues

#### 1. Missing Database Table
**Problem:** The `query_versions` table was referenced in the `QueryVersion` model but never created in the database schema, causing foreign key constraint violations.

**Fix:** Created migration file `001_add_query_versions.sql` to create the table with proper constraints and indexes.

### 2. Race Conditions
**Problem:** Creating and updating queries involved multiple database operations without transactions, leading to:
- Partial data commits when errors occurred
- Race conditions when multiple requests arrived simultaneously
- Inconsistent state between `queries` and `query_versions` tables

**Fix:** 
- Wrapped `createQuery` and `updateQuery` operations in database transactions
- All related operations now commit or rollback together
- Added proper transaction rollback on errors

### 3. Insufficient Input Validation
**Problem:** Required fields weren't validated before database operations, causing cryptic Sequelize errors.

**Fix:**
- Added validation for required fields: `name`, `sql_content`, `category`, `database_type`
- Validate that `sql_content` is a non-empty string
- Return clear 400 errors for validation failures

### 4. Poor Error Handling
**Problem:** Generic error handling didn't distinguish between different types of database errors.

**Fix:** Enhanced error handler to specifically catch:
- `ValidationError` → 400 with field-specific error messages
- `UniqueConstraintError` → 409 for duplicate resources
- `ForeignKeyConstraintError` → 400 for invalid references
- `DatabaseError` → 500 with detailed logging
- Clear error messages returned to client

### 5. Import Inconsistency
**Problem:** `Query` model and `QueryVersion` model used different import styles for Sequelize connection.

**Fix:** Standardized to use `import sequelize from '../database/connection'`

### Scheduler Container Issues

#### 6. Scheduler Not Running
**Problem:** The scheduler container wasn't starting or was crashing due to:
- Missing `.env` file configuration in docker-compose
- Database authentication failures
- No retry logic for database connection failures
- Missing health checks and restart policy

**Fix:**
- Added `env_file: - .env` directive to both docker-compose files
- Updated DATABASE_URL to use environment variables: `postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}`
- Added connection retry logic with 5 attempts and 10-second delays
- Added health check endpoint on port 3002
- Set `restart: unless-stopped` policy
- Removed obsolete `version: '3.8'` from docker-compose files

## How to Apply Fixes

### Step 1: Apply Database Migration
```bash
# If using Docker:
docker-compose exec postgres psql -U sqlquery_user -d sqlquery_db -f /docker-entrypoint-initdb.d/migrations/001_add_query_versions.sql

# Or run directly:
psql -U sqlquery_user -d sqlquery_db -f database/migrations/001_add_query_versions.sql

# Or use the migration script:
chmod +x database/apply-migrations.sh
./database/apply-migrations.sh
```

### Step 2: Restart Backend
```bash
# If using Docker:
docker-compose restart backend

# Or if running locally:
cd backend
npm run dev
```

### Step 3: Restart Scheduler (if using Docker)
```bash
# Stop and recreate the scheduler with new configuration:
docker compose stop scheduler
docker compose rm -f scheduler
docker compose up -d scheduler

# Verify it's running:
docker compose ps scheduler
docker compose logs scheduler --tail=20
```

## Testing

Test the fixes by:

1. **Creating a new query:**
   ```bash
   curl -X POST http://localhost:3000/api/queries \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Query",
       "sql_content": "SELECT * FROM users",
       "category": "selects",
       "database_type": "postgresql"
     }'
   ```

2. **Updating a query:**
   ```bash
   curl -X PUT http://localhost:3000/api/queries/1 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "sql_content": "SELECT * FROM users WHERE id = 1",
       "change_description": "Added WHERE clause"
     }'
   ```

3. **Test validation errors:**
   ```bash
   # Missing required field
   curl -X POST http://localhost:3000/api/queries \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Query"
     }'
   
   # Should return 400 with clear error message
   ```

4. **Test scheduler:**
   ```bash
   # Check scheduler health
   curl http://localhost:3002/health
   
   # Should return: {"status":"ok","timestamp":"...","queue":{...}}
   
   # Check scheduler logs
   docker compose logs scheduler --tail=50
   ```

## Preventive Measures

To prevent similar issues in the future:

1. **Always use transactions** for multi-step database operations
2. **Validate inputs** before database operations
3. **Create migrations** before adding model references
4. **Test error scenarios** including validation failures and constraint violations
5. **Monitor logs** for database-related errors using the enhanced error handler
6. **Use .env files** for all environment-specific configuration
7. **Add health checks** to all services in docker-compose
8. **Implement retry logic** for critical connections

## Files Changed

- `database/migrations/001_add_query_versions.sql` (NEW)
- `database/init.sql` (MODIFIED - added query_versions table)
- `backend/src/controllers/query.controller.ts` (MODIFIED - transactions & validation)
- `backend/src/models/QueryVersion.ts` (MODIFIED - import fix)
- `backend/src/middleware/errorHandler.ts` (MODIFIED - enhanced error handling)
- `scheduler/src/index.ts` (MODIFIED - retry logic)
- `scheduler/src/services/scheduleManager.ts` (MODIFIED - connection retry)
- `docker-compose.yml` (MODIFIED - scheduler config & env file)
- `docker-compose.prod.yml` (MODIFIED - scheduler config & env file)
- `database/apply-migrations.sh` (NEW)

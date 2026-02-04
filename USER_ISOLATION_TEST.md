# User Data Isolation Testing Guide

## Overview
This document outlines how to test the user-level data isolation fix implemented in the `bugfix/user-data-isolation` branch.

## Issue Fixed
**CRITICAL SECURITY BUG**: Previously, all users could see and access each other's:
- Database connections
- Schedules  
- Queries (non-public)
- Query templates
- Execution history

## Solution Implemented
Added user-level filtering to all controllers:
- Each user sees only their own resources by default
- Public queries are visible to all users
- Admin users can see all resources with `?showAll=true` query parameter
- Ownership checks added to all create/update/delete/run operations

## Test Setup

### 1. Start Local Services
```bash
# Terminal 1: Start PostgreSQL (Neon in production, local for testing)
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### 2. Test Users
The database has 2 default users:

**Admin User:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

**Developer User:**
- Username: `developer`
- Email: `dev@example.com`
- Password: `dev123`
- Role: `developer`

## Test Cases

### Test 1: Connection Isolation
**Objective**: Verify users can only see their own database connections

1. **Login as admin** → Create a connection named "Admin DB"
2. **Logout and login as developer** → Create a connection named "Developer DB"
3. **Verify**:
   - Developer should only see "Developer DB" in connections list
   - Admin without `?showAll=true` should only see "Admin DB"
   - Admin with `?showAll=true` should see both connections

**API Test**:
```bash
# Get developer's connections (should see only Developer DB)
curl -H "Authorization: Bearer <dev_token>" http://localhost:8080/api/connections

# Get admin's connections (should see only Admin DB by default)
curl -H "Authorization: Bearer <admin_token>" http://localhost:8080/api/connections

# Get all connections (admin only)
curl -H "Authorization: Bearer <admin_token>" http://localhost:8080/api/connections?showAll=true
```

### Test 2: Schedule Isolation
**Objective**: Verify users can only see and manage their own schedules

1. **Login as admin** → Create a schedule "Admin Daily Report"
2. **Login as developer** → Create a schedule "Developer Backup"
3. **Verify**:
   - Developer should only see "Developer Backup"
   - Developer cannot run/edit/delete "Admin Daily Report" (should get 403)
   - Admin can see and manage all schedules with `?showAll=true`

**API Test**:
```bash
# Try to run admin's schedule as developer (should fail with 403)
curl -X POST -H "Authorization: Bearer <dev_token>" \
  http://localhost:8080/api/schedules/<admin_schedule_id>/run-now
```

### Test 3: Query Isolation
**Objective**: Verify query visibility based on ownership and public flag

1. **Login as admin** → Create private query "Admin Secret Query" (is_public=false)
2. **Login as admin** → Create public query "Admin Public Query" (is_public=true)
3. **Login as developer** → Create private query "Dev Private Query"
4. **Verify**:
   - Developer sees: "Dev Private Query" + "Admin Public Query"
   - Developer does NOT see: "Admin Secret Query"
   - Admin without `?showAll=true` sees: own queries + public queries
   - Admin with `?showAll=true` sees: ALL queries

**API Test**:
```bash
# Developer should see own + public queries
curl -H "Authorization: Bearer <dev_token>" http://localhost:8080/api/queries

# Admin should see all queries
curl -H "Authorization: Bearer <admin_token>" http://localhost:8080/api/queries?showAll=true
```

### Test 4: Query Template Isolation
**Objective**: Verify users can only see their own query templates

1. **Login as admin** → Create template "Admin Template"
2. **Login as developer** → Create template "Developer Template"
3. **Verify**:
   - Developer should only see "Developer Template"
   - Admin should only see "Admin Template" by default
   - Admin with `?showAll=true` should see both

### Test 5: Execution History Isolation
**Objective**: Verify users can only see their own query executions

1. **Login as admin** → Execute a query (creates execution history)
2. **Login as developer** → Execute a query
3. **Verify**:
   - Developer only sees their own execution in history
   - Admin only sees their own execution by default
   - Admin with `?showAll=true` sees all executions

**API Test**:
```bash
# Developer's execution history
curl -H "Authorization: Bearer <dev_token>" http://localhost:8080/api/history

# Admin's full execution history
curl -H "Authorization: Bearer <admin_token>" http://localhost:8080/api/history?showAll=true
```

### Test 6: Unauthorized Access (403 Errors)
**Objective**: Verify 403 errors when users try to access resources they don't own

Test these scenarios (all should return 403):
1. Developer tries to GET admin's connection by ID
2. Developer tries to UPDATE admin's schedule
3. Developer tries to DELETE admin's query
4. Developer tries to RUN admin's schedule
5. Developer tries to TEST admin's database connection

**API Test**:
```bash
# Should return 403 Forbidden
curl -H "Authorization: Bearer <dev_token>" \
  http://localhost:8080/api/connections/<admin_connection_id>

# Should return 403 Forbidden
curl -X DELETE -H "Authorization: Bearer <dev_token>" \
  http://localhost:8080/api/schedules/<admin_schedule_id>
```

## Expected Behavior Summary

| Resource | User View | Admin View (default) | Admin View (?showAll=true) |
|----------|-----------|----------------------|----------------------------|
| Connections | Own only | Own only | ALL |
| Schedules | Own only | Own only | ALL |
| Queries | Own + Public | Own + Public | ALL |
| Templates | Own only | Own only | ALL |
| Execution History | Own only | Own only | ALL |

## Admin Query Parameter
All endpoints support `?showAll=true` for admin users to see all resources:
- `GET /api/connections?showAll=true`
- `GET /api/schedules?showAll=true`
- `GET /api/queries?showAll=true`
- `GET /api/templates?showAll=true`
- `GET /api/history?showAll=true`

## Testing Checklist
- [ ] Connection isolation working
- [ ] Schedule isolation working
- [ ] Query isolation working (own + public)
- [ ] Template isolation working
- [ ] Execution history isolation working
- [ ] Admin can see all with `?showAll=true`
- [ ] 403 errors on unauthorized access attempts
- [ ] Run/update/delete operations blocked for non-owners
- [ ] Frontend shows only user's resources
- [ ] No errors in browser console or backend logs

## Production Deployment
After successful local testing:

```bash
# Merge to main
git checkout main
git merge bugfix/user-data-isolation

# Push to production
git push origin main

# Monitor Railway logs for any issues
```

## Database Schema Note
The database already has `created_by` fields on all necessary tables:
- `connections.created_by` → users(id)
- `schedules.created_by` → users(id)
- `queries.created_by` → users(id)
- `query_templates.created_by` → users(id)
- `execution_history.executed_by` → users(id)

**No database migrations needed** - this is purely a controller-level fix.

## Future Enhancements
1. **Groups/Teams**: Allow users to create groups and share resources within teams
2. **Sharing**: Allow users to explicitly share connections/queries with specific users
3. **Organization-level isolation**: Multi-tenant architecture for enterprise
4. **Audit logs**: Track who accessed what resources when

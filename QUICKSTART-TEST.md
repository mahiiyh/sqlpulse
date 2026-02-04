# 🚀 Quick Start: Testing User Isolation Locally

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Terminal/Command Line access

---

## Step 1: Start Docker Services

```bash
# Start Docker Desktop (if not running)

# Navigate to project root
cd "/Users/mahiiyh/Developer/SQL Query Management Dashboard"

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait 10 seconds for services to be healthy
sleep 10

# Verify services are running
docker-compose ps
```

**Expected Output:**
```
NAME                   STATUS      PORTS
sqlquery-postgres      Up          0.0.0.0:5432->5432/tcp
sqlquery-redis         Up          0.0.0.0:6379->6379/tcp
```

---

## Step 2: Start Backend Service

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Start backend in development mode
npm run dev
```

**Expected Output:**
```
🚀 Backend server running on 0.0.0.0:3001
Environment: development
Database connection established successfully
```

**Keep this terminal open** - the backend must stay running for tests.

---

## Step 3: Run User Isolation Tests

Open a **new terminal** and run:

```bash
# Navigate to project root
cd "/Users/mahiiyh/Developer/SQL Query Management Dashboard"

# Make test script executable
chmod +x test-user-isolation.sh

# Run the test script
./test-user-isolation.sh
```

### Test Menu Options:

**Option 4: Test connection isolation**
- Logs in as both admin and developer
- Shows each user's connections separately
- Verifies users can't see each other's connections
- Shows admin can use `?showAll=true` to see all

**Option 5: Test schedule isolation**
- Tests that each user only sees their own schedules
- Verifies admin override with `?showAll=true`

**Option 6: Test query isolation**
- Tests private vs. public query visibility
- Shows that users see their own + public queries
- Admin can see all with `?showAll=true`

---

## Step 4: Manual Testing (Optional)

### Create Test Data

```bash
# Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Login as developer
DEV_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"dev123"}' \
  | jq -r '.token')

# Create a connection as admin
curl -X POST http://localhost:3001/api/connections \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test Connection",
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database_name": "test_db",
    "username": "test_user",
    "password": "test_pass",
    "environment": "development"
  }'

# Create a connection as developer
curl -X POST http://localhost:3001/api/connections \
  -H "Authorization: Bearer $DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Developer Test Connection",
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database_name": "dev_db",
    "username": "dev_user",
    "password": "dev_pass",
    "environment": "development"
  }'
```

### Test Isolation

```bash
# Get admin's connections (should only see "Admin Test Connection")
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3001/api/connections | jq

# Get developer's connections (should only see "Developer Test Connection")
curl -s -H "Authorization: Bearer $DEV_TOKEN" \
  http://localhost:3001/api/connections | jq

# Developer tries to access admin's connection (should get 403)
ADMIN_CONN_ID=1  # Get actual ID from previous response
curl -s -H "Authorization: Bearer $DEV_TOKEN" \
  http://localhost:3001/api/connections/$ADMIN_CONN_ID | jq

# Admin with showAll=true (should see BOTH connections)
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3001/api/connections?showAll=true" | jq
```

---

## Expected Test Results

### ✅ PASS Criteria:

1. **User Isolation**
   - Admin only sees "Admin Test Connection"
   - Developer only sees "Developer Test Connection"

2. **Ownership Protection**
   - Developer gets 403 when accessing admin's connection
   - Admin gets 403 when accessing developer's connection (without showAll)

3. **Admin Override**
   - Admin with `?showAll=true` sees both connections
   - Non-admin cannot use `?showAll=true` (ignored)

4. **Queue Isolation**
   - Active jobs filtered by user
   - Failed jobs filtered by user

### ❌ FAIL Indicators:

- User sees connections/schedules/queries they didn't create
- User can modify/delete another user's resources
- Non-admin user can see all resources with `?showAll=true`
- 500 errors instead of 403 Forbidden

---

## Troubleshooting

### Port Already in Use
```bash
# If port 3001 is already in use
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis

# Test Redis connection
redis-cli ping
```

### Backend Won't Start
```bash
# Check .env file exists in backend directory
ls -la backend/.env

# Copy example if missing
cp backend/.env.example backend/.env

# Ensure DATABASE_URL is set
echo "DATABASE_URL=postgresql://sqlquery_user:sqlquery_pass@localhost:5432/sqlquery_db" >> backend/.env
```

---

## Cleanup After Testing

```bash
# Stop backend (Ctrl+C in backend terminal)

# Stop and remove Docker containers
docker-compose down

# Optional: Remove volumes (deletes all test data)
docker-compose down -v
```

---

## Next Steps After Successful Testing

1. **Review changes**: `git log --oneline -5`
2. **Check diff**: `git diff main...bugfix/user-data-isolation`
3. **Merge to main**: 
   ```bash
   git checkout main
   git merge bugfix/user-data-isolation
   git push origin main
   ```
4. **Deploy to Railway**: Auto-deploys on push to main
5. **Monitor production logs**: Check Railway dashboard for any issues

---

## Test Users Reference

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| admin@example.com | admin123 | admin | Full access, can use showAll=true |
| dev@example.com | dev123 | developer | Regular user, owns resources |

---

## Need Help?

- Check [BUGFIX-USER-ISOLATION.md](BUGFIX-USER-ISOLATION.md) for detailed documentation
- Check [USER_ISOLATION_TEST.md](USER_ISOLATION_TEST.md) for comprehensive test guide
- Run `./test-user-isolation.sh` for automated testing

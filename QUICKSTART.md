# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ Docker & Docker Compose (`docker --version`)
- ✅ Git (for version control)

## Installation Steps

### 1. Navigate to Project Directory
```bash
cd "SQL Query Management Dashboard"
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:
```bash
cp backend/.env.example backend/.env
```

**Important**: Update these values in `backend/.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-32-char-encryption-key!!
```

Generate secure keys:
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (must be exactly 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 3. Start with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend, Scheduler)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

**Services will be available at:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:3001
- 💾 PostgreSQL: localhost:5432
- 🚀 Redis: localhost:6379

### 4. Verify Installation

```bash
# Check backend health
curl http://localhost:3001/health

# Expected response: {"status":"ok","timestamp":"..."}
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 6. Login

Use the default credentials:

**Administrator Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Developer Account:**
- Email: `dev@example.com`
- Password: `dev123`

⚠️ **IMPORTANT**: Change these passwords immediately after first login!

## Alternative: Manual Installation (Without Docker)

### 1. Install Dependencies
```bash
# Install all workspace dependencies
npm run install-all
```

### 2. Start PostgreSQL
```bash
# Using Homebrew (macOS)
brew services start postgresql@14

# Or using Docker only for database
docker run -d --name postgres \
  -e POSTGRES_DB=sqlquery_db \
  -e POSTGRES_USER=sqlquery_user \
  -e POSTGRES_PASSWORD=sqlquery_pass \
  -p 5432:5432 \
  postgres:14-alpine
```

### 3. Initialize Database
```bash
# Create database and run init script
psql -U sqlquery_user -d sqlquery_db -f database/init.sql
```

### 4. Start Redis
```bash
# Using Homebrew (macOS)
brew services start redis

# Or using Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 5. Start Backend
```bash
cd backend
npm run dev
# Backend will run on http://localhost:3001
```

### 6. Start Scheduler (New Terminal)
```bash
cd scheduler
npm run dev
# Scheduler will connect to Redis and PostgreSQL
```

### 7. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

## First Steps After Login

### 1. Create a Database Connection
1. Navigate to **Connections** page
2. Click **"Add Connection"**
3. Fill in connection details:
   - Name: "My Development DB"
   - Type: Select your database type
   - Host: Your database host
   - Port: Database port
   - Database Name: Your database name
   - Username: Database username
   - Password: Database password
   - Environment: Select environment (Dev/QA/UAT/Production)
4. Click **"Test Connection"** to verify
5. Click **"Save"**

### 2. Create Your First Query
1. Navigate to **Query Library**
2. Click **"New Query"**
3. Enter query details:
   - Name: "Get Customer List"
   - Description: "Retrieves all active customers"
   - Category: Select category
   - Database Type: Match your connection
4. Write your SQL in the editor:
   ```sql
   SELECT * FROM customers WHERE status = 'active'
   ```
5. Click **"Save"**

### 3. Execute the Query
1. Click **"Execute"** button
2. View results in the results panel
3. Optionally export results to CSV/Excel

### 4. Schedule the Query (Optional)
1. Click **"Schedule"** button
2. Configure schedule:
   - Schedule Name: "Daily Customer Report"
   - Type: Daily
   - Time: 09:00 AM
   - Connection: Select your connection
3. Configure notifications (optional):
   - Add email notification
   - Choose "On Success" or "On Failure"
4. Click **"Save Schedule"**

## Useful Commands

### Docker Commands
```bash
# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f scheduler

# Rebuild after code changes
docker-compose up -d --build

# Remove all volumes (CAUTION: deletes data)
docker-compose down -v
```

### Database Commands
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U sqlquery_user -d sqlquery_db

# View all tables
\dt

# View schedules
SELECT * FROM schedules;

# View execution history
SELECT * FROM execution_history ORDER BY executed_at DESC LIMIT 10;
```

### Troubleshooting Commands
```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Check Docker logs
docker-compose logs --tail=100 -f

# Check backend logs
tail -f backend/logs/combined.log

# Restart everything
docker-compose restart
```

## Next Steps

1. ✅ Change default passwords
2. ✅ Add your production database connections
3. ✅ Import existing queries
4. ✅ Set up email notifications
5. ✅ Schedule your first automated query
6. ✅ Explore the dashboard and analytics

## Need Help?

- 📚 Full documentation: See [README.md](README.md)
- 🐛 Issues: Check logs with `docker-compose logs -f`
- 💬 Support: Create an issue on GitHub

---

**Happy Querying! 🎉**

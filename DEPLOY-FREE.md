# Free Deployment Guide - Render

Deploy SQLPulse completely **FREE** using Render's generous free tier.

## What's Included (FREE)

- ✅ PostgreSQL Database (free forever)
- ✅ Redis Cache (free forever)
- ✅ Backend API (free with auto-sleep)
- ✅ Scheduler (free with auto-sleep)
- ✅ Frontend (free with auto-sleep)
- ✅ Automatic SSL certificates
- ✅ Auto-deploy from GitHub
- ✅ Custom domains

**Note**: Free services sleep after 15 minutes of inactivity and wake up on first request (~30 seconds).

## Quick Start (5 minutes)

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### Step 2: Connect Your Repository

1. In Render Dashboard, click "New +"
2. Select "Blueprint"
3. Connect your GitHub account
4. Select the `sqlpulse` repository
5. Render will detect the `render.yaml` file automatically

### Step 3: Deploy

1. Click "Apply" to create all services
2. Render will automatically:
   - Create PostgreSQL database
   - Create Redis instance
   - Build and deploy backend
   - Build and deploy scheduler
   - Build and deploy frontend
3. Wait 5-10 minutes for initial deployment

### Step 4: Access Your App

1. Go to your services in Render Dashboard
2. Click on `sqlpulse-frontend`
3. Copy the URL (e.g., `https://sqlpulse-frontend.onrender.com`)
4. Open in browser
5. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
   - **Change password immediately!**

## Alternative: Manual Setup (If Blueprint Fails)

### Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `sqlpulse-postgres`
3. Database: `sqlquery_db`
4. User: `sqlquery_user`
5. Region: `Oregon (US West)`
6. Plan: **Free**
7. Click "Create Database"
8. Wait for database to be ready
9. Go to "Connect" tab → Copy "Internal Database URL"

### Create Redis

1. Click "New +" → "Redis"
2. Name: `sqlpulse-redis`
3. Region: `Oregon (US West)`
4. Plan: **Free**
5. Click "Create Redis"
6. Copy "Internal Redis URL"

### Deploy Backend

1. Click "New +" → "Web Service"
2. Connect repository: `sqlpulse`
3. Configuration:
   - Name: `sqlpulse-backend`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Docker`
   - Plan: **Free**
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=<from postgres internal URL>
   DB_PORT=5432
   DB_NAME=sqlquery_db
   DB_USER=sqlquery_user
   DB_PASSWORD=<from postgres>
   REDIS_HOST=<from redis internal URL>
   REDIS_PORT=6379
   JWT_SECRET=<generate random 32+ chars>
   ENCRYPTION_KEY=<generate exactly 32 chars>
   LOG_LEVEL=info
   ```
5. Health Check Path: `/api/health`
6. Click "Create Web Service"

### Deploy Scheduler

1. Click "New +" → "Web Service"
2. Same repository: `sqlpulse`
3. Configuration:
   - Name: `sqlpulse-scheduler`
   - Root Directory: `scheduler`
   - Same environment variables as backend
   - PORT=3002
   - Health Check Path: `/health`
   - Plan: **Free**
4. Click "Create Web Service"

### Deploy Frontend

1. Click "New +" → "Web Service"
2. Same repository: `sqlpulse`
3. Configuration:
   - Name: `sqlpulse-frontend`
   - Root Directory: `frontend`
   - Environment: `Docker`
   - Plan: **Free**
4. Add Environment Variable:
   ```
   VITE_API_BASE_URL=<your-backend-url>/api
   # Example: https://sqlpulse-backend.onrender.com/api
   ```
5. Health Check Path: `/`
6. Click "Create Web Service"

## Initialize Database

The database will auto-initialize from `init.sql` on first connection. To verify:

1. Go to PostgreSQL service in Render
2. Click "Connect" → "External Connection"
3. Use provided command or connect with any PostgreSQL client:
   ```bash
   psql <external-database-url>
   ```
4. Check tables:
   ```sql
   \dt
   ```
   Should see: users, queries, connections, schedules, query_templates, etc.

## Cost Breakdown

| Service | Cost |
|---------|------|
| PostgreSQL | **$0/month** (1GB storage, 1 million rows) |
| Redis | **$0/month** (25MB) |
| Backend | **$0/month** (sleeps after 15min) |
| Scheduler | **$0/month** (sleeps after 15min) |
| Frontend | **$0/month** (sleeps after 15min) |
| SSL | **$0/month** (included) |
| **Total** | **$0/month** ✨ |

## Limitations of Free Tier

1. **Services sleep after 15 minutes** of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - Subsequent requests are instant
   
2. **PostgreSQL limits**:
   - 1 GB storage
   - Expires after 90 days (just recreate, data exported)
   
3. **Redis limits**:
   - 25 MB memory
   - Expires after 90 days
   
4. **Build time**:
   - Initial build can take 5-10 minutes
   
5. **No custom domains** on completely free tier
   - Use: `your-app.onrender.com`
   - Custom domains available on paid tier ($7/month per service)

## Keep Services Awake (Optional)

To prevent sleeping, use a free uptime monitor:

1. **UptimeRobot** (free):
   - Sign up at https://uptimerobot.com
   - Add monitor for your frontend URL
   - Check every 5 minutes
   - Services stay awake during active hours

2. **Cron-job.org** (free):
   - Add HTTP request to your frontend
   - Run every 10 minutes

## Upgrade to Paid (Optional)

When ready to scale, upgrade individual services:

- **Starter Plan**: $7/month per service
  - No sleeping
  - More resources
  - Custom domains
  - Better for production

- **PostgreSQL Standard**: $7/month
  - 10 GB storage
  - No expiration
  - Automated backups

## Monitoring

### View Logs

1. Go to service in Render Dashboard
2. Click "Logs" tab
3. Real-time logs appear here

### Check Health

```bash
# Backend
curl https://your-backend.onrender.com/api/health

# Scheduler  
curl https://your-scheduler.onrender.com/health

# Frontend
curl https://your-frontend.onrender.com
```

### Metrics

1. Go to service in Dashboard
2. Click "Metrics" tab
3. See CPU, memory, response times

## Troubleshooting

### Service Won't Start

1. Check logs for errors
2. Verify environment variables are set correctly
3. Ensure database is connected and initialized
4. Check Dockerfile builds locally

### Database Connection Errors

1. Use **Internal Database URL** for services (not external)
2. Check database is in same region as services
3. Verify credentials in environment variables

### Frontend Can't Reach Backend

1. Check `VITE_API_BASE_URL` points to backend **external** URL
2. Include `/api` at the end
3. Use HTTPS (Render provides automatic SSL)

### Services Sleeping Too Often

1. Set up UptimeRobot to ping every 5-10 minutes
2. Or upgrade to paid plan ($7/month)

## Auto-Deploy Setup

Render automatically deploys when you push to `main` branch:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "your changes"
   git push origin main
   ```
3. Render detects push and redeploys automatically
4. Check deployment status in Dashboard

## Security Best Practices (Free Tier)

1. **Change default admin password** immediately
2. **Use strong secrets**:
   ```bash
   # Generate JWT_SECRET (32+ chars)
   openssl rand -base64 32
   
   # Generate ENCRYPTION_KEY (exactly 32 chars)
   openssl rand -base64 24
   ```
3. **Keep dependencies updated**
4. **Enable 2FA** on Render account
5. **Don't commit secrets** to Git

## Backup Your Data (Important!)

Free PostgreSQL expires after 90 days. Backup regularly:

```bash
# Download backup from Render Dashboard
# Or use pg_dump:
pg_dump <external-database-url> > backup_$(date +%Y%m%d).sql
```

## When to Upgrade

Consider paid plans when:

- ⚡ Need instant response (no sleeping)
- 📈 Database grows beyond 1GB
- 🌐 Want custom domain
- 👥 Have paying users
- 🔄 Need zero-downtime deploys

## Summary

**Render free tier is perfect for:**
- ✅ Learning and testing
- ✅ Side projects
- ✅ MVP/demos
- ✅ Low-traffic internal tools
- ✅ Portfolio projects

**Total setup time**: 5-10 minutes  
**Total cost**: $0/month  
**Perfect for**: Getting started!

🚀 **Ready to deploy? Go to https://render.com and click "Get Started for Free"**

## Support

- Render Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

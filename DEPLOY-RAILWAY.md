# Deploy to Railway - Quick Guide

This guide will help you deploy the SQL Query Management Dashboard to Railway.

## Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app with GitHub)

## Deployment Steps

### Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will create a new project

### Step 3: Add Services

You need to add 4 services manually:

#### A. PostgreSQL Database

1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Railway will automatically create the database
3. Note: Database URL will be available as `${{Postgres.DATABASE_URL}}`

#### B. Redis

1. Click "+ New" → "Database" → "Add Redis"
2. Railway will automatically create Redis
3. Note: Redis URL will be available as `${{Redis.REDIS_URL}}`

#### C. Backend Service

1. Click "+ New" → "GitHub Repo" → Select your repo
2. Click on the service → "Settings"
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `npm run start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=your-random-32-char-secret-here
   ENCRYPTION_KEY=your-random-32-char-key-here
   CORS_ORIGIN=${{Frontend.RAILWAY_STATIC_URL}}
   ```
6. Go to "Settings" → "Networking" → Enable "Public Networking"
7. Copy the public URL for use in frontend

#### D. Scheduler Service

1. Click "+ New" → "GitHub Repo" → Select your repo
2. Click on the service → "Settings"
3. Set **Root Directory**: `scheduler`
4. Set **Start Command**: `npm run start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   ENCRYPTION_KEY=${{Backend.ENCRYPTION_KEY}}
   ```

#### E. Frontend Service

1. Click "+ New" → "GitHub Repo" → Select your repo
2. Click on the service → "Settings"
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npm run preview`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
   (Replace with your actual backend URL from step C)
7. Go to "Settings" → "Networking" → Enable "Public Networking"
8. Copy the public URL - this is your app URL!

### Step 4: Initialize Database

After all services are deployed:

1. Click on Backend service → "Settings" → "Variables"
2. Click "+ Variable" and add a temporary one-time migration trigger:
   ```
   RUN_MIGRATIONS=true
   ```
3. The init.sql will run automatically on first connection

### Step 5: Access Your Application

1. Open the Frontend service public URL
2. Login with default credentials:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `admin123`

## Important Notes

### Costs
- Railway offers $5/month free credit
- PostgreSQL: ~$5/month
- Redis: ~$5/month  
- 3 Services: ~$15/month total
- **Total: ~$20/month (first month free with $5 credit)**

### Environment Variables to Generate

Generate secure random strings for:

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Encryption Key (32 characters exactly)
openssl rand -hex 16
```

### Service Dependencies

Make sure services start in this order:
1. PostgreSQL (takes 2-3 minutes)
2. Redis (takes 1-2 minutes)
3. Backend (waits for DB)
4. Scheduler (waits for DB)
5. Frontend (needs backend URL)

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is set correctly
- Check PostgreSQL service is running
- View logs: Click service → "Deployments" → Latest → "View Logs"

### Frontend can't connect to backend
- Make sure backend has "Public Networking" enabled
- Update VITE_API_URL with correct backend URL
- Redeploy frontend after changing environment variables

### Database connection errors
- Wait for PostgreSQL to fully start (2-3 minutes)
- Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Ensure backend service has DATABASE_URL variable

## Custom Domain (Optional)

1. Click Frontend service → "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your custom domain
4. Add CNAME record in your DNS:
   ```
   CNAME @ your-app.up.railway.app
   ```

## Updating Your App

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

All services will automatically rebuild and redeploy.

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Create an issue in your GitHub repo

# Deploy to Fly.io - Free Hosting Guide

Deploy your SQL Query Management Dashboard to Fly.io with external Supabase and Upstash.

## Prerequisites

- Supabase PostgreSQL database (already set up)
- Upstash Redis (already set up)
- Fly.io account (sign up at https://fly.io/app/sign-up - NO CARD REQUIRED)

## Installation

Install Fly CLI:
```bash
brew install flyctl
```

## Deployment Steps

### Step 1: Authenticate

```bash
flyctl auth login
```

This will open a browser for you to log in.

### Step 2: Deploy Backend

```bash
cd backend
flyctl launch --no-deploy

# Answer the prompts:
# - App name: sqlpulse-backend (or press enter to accept)
# - Region: Choose closest to your Supabase region
# - Setup PostgreSQL: NO (we're using Supabase)
# - Setup Redis: NO (we're using Upstash)
# - Deploy now: NO

# Set secrets (environment variables)
flyctl secrets set \
  DATABASE_URL="postgresql://postgres.exfzjebvwkbblnnrpccf:Msdac#47218@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres" \
  REDIS_URL="your-upstash-redis-url" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  ENCRYPTION_KEY="$(openssl rand -hex 16)"

# Deploy
flyctl deploy
```

### Step 3: Deploy Scheduler

```bash
cd ../scheduler
flyctl launch --no-deploy

# Answer the prompts:
# - App name: sqlpulse-scheduler
# - Region: Same as backend
# - Setup PostgreSQL: NO
# - Setup Redis: NO
# - Deploy now: NO

# Set secrets (use same values as backend)
flyctl secrets set \
  DATABASE_URL="postgresql://postgres.exfzjebvwkbblnnrpccf:Msdac#47218@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres" \
  REDIS_URL="your-upstash-redis-url" \
  ENCRYPTION_KEY="same-as-backend-encryption-key"

# Deploy
flyctl deploy
```

### Step 4: Deploy Frontend to Vercel

Since Fly.io is better for backend services, let's use Vercel for the frontend (free, no card):

```bash
cd ../frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# When prompted:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: sqlpulse-frontend
# - Directory: ./
# - Override settings: No

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://sqlpulse-backend.fly.dev/api
```

### Step 5: Update Backend CORS

Get your Vercel frontend URL (e.g., `https://sqlpulse-frontend.vercel.app`) and add it to backend:

```bash
cd ../backend
flyctl secrets set CORS_ORIGIN="https://sqlpulse-frontend.vercel.app"
```

## App URLs

- **Frontend**: `https://sqlpulse-frontend.vercel.app`
- **Backend**: `https://sqlpulse-backend.fly.dev`
- **Scheduler**: Runs in background

## Costs

- ✅ Fly.io: 3 shared-cpu-1x instances = **FREE**
- ✅ Vercel: Frontend hosting = **FREE**
- ✅ Supabase: 500MB database = **FREE**
- ✅ Upstash: 10K commands/day = **FREE**
- **Total: $0/month** 🎉

## Management Commands

### View logs
```bash
cd backend
flyctl logs

cd ../scheduler
flyctl logs
```

### Check status
```bash
flyctl status
```

### Scale instances
```bash
flyctl scale count 1  # Keep at 1 for free tier
```

### SSH into container
```bash
flyctl ssh console
```

### Update deployment
Just push to git and redeploy:
```bash
cd backend
flyctl deploy

cd ../scheduler
flyctl deploy
```

## Troubleshooting

### Backend won't start
```bash
cd backend
flyctl logs
flyctl secrets list  # Check if all secrets are set
```

### Check environment variables
```bash
flyctl secrets list
```

### Restart app
```bash
flyctl apps restart sqlpulse-backend
```

### Database connection issues
- Verify DATABASE_URL is correct
- Check if Supabase allows connections from Fly.io IPs
- Supabase → Project Settings → Database → Connection pooling should be enabled

## Default Login

- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`

## Custom Domain (Optional)

### For Frontend (Vercel)
```bash
vercel domains add yourdomain.com
# Follow DNS instructions
```

### For Backend (Fly.io)
```bash
cd backend
flyctl certs add api.yourdomain.com
# Add DNS record: CNAME api.yourdomain.com -> sqlpulse-backend.fly.dev
```

## Support

- Fly.io Docs: https://fly.io/docs/
- Vercel Docs: https://vercel.com/docs
- Community Forum: https://community.fly.io/

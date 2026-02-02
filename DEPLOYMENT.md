# SQLPulse Deployment Guide

This guide covers deploying SQLPulse to various cloud platforms.

## Prerequisites

- Docker and Docker Compose installed
- Git repository pushed to GitHub
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Deployment Options

### 1. DigitalOcean (Recommended for beginners)

**Cost**: ~$12-24/month for basic droplet + $5/month for managed PostgreSQL

#### Setup Steps:

1. **Create a DigitalOcean Account**
   - Sign up at https://www.digitalocean.com

2. **Create a Droplet**
   ```bash
   # Choose:
   - Ubuntu 22.04 LTS
   - Basic plan ($12/month - 2GB RAM)
   - Add SSH key for secure access
   ```

3. **Create Managed Database** (Recommended)
   ```bash
   # Choose:
   - PostgreSQL 14
   - Basic plan ($15/month)
   - Same datacenter as droplet
   ```

4. **Set up Container Registry**
   - Go to Container Registry in DigitalOcean dashboard
   - Create a new registry named `sqlpulse`

5. **Configure GitHub Secrets**
   ```
   DIGITALOCEAN_ACCESS_TOKEN=your_do_token
   DROPLET_HOST=your_droplet_ip
   DROPLET_USERNAME=root
   DROPLET_SSH_KEY=your_private_ssh_key
   PRODUCTION_DOMAIN=your-domain.com
   VITE_API_BASE_URL=https://your-domain.com/api
   ```

6. **SSH into Droplet and Install Docker**
   ```bash
   ssh root@your_droplet_ip
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   apt-get update
   apt-get install docker-compose-plugin
   
   # Install doctl
   cd ~
   wget https://github.com/digitalocean/doctl/releases/download/v1.98.1/doctl-1.98.1-linux-amd64.tar.gz
   tar xf doctl-*.tar.gz
   mv doctl /usr/local/bin
   ```

7. **Authenticate doctl**
   ```bash
   doctl auth init
   # Enter your DigitalOcean access token
   ```

8. **Create deployment directory**
   ```bash
   mkdir -p /opt/sqlpulse
   cd /opt/sqlpulse
   
   # Copy docker-compose.prod.yml to server
   # Update with your database credentials
   ```

9. **Configure Environment Variables**
   ```bash
   # Create .env file
   cat > .env << 'EOF'
   # Database (use managed database connection string)
   DB_HOST=your-managed-db-host
   DB_PORT=25060
   DB_NAME=sqlquery_db
   DB_USER=doadmin
   DB_PASSWORD=your_db_password
   
   # Security
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ENCRYPTION_KEY=your-32-char-encryption-key-here
   
   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379
   
   # Frontend
   VITE_API_BASE_URL=https://your-domain.com/api
   EOF
   ```

10. **Deploy**
   - Push to main branch triggers automatic deployment via GitHub Actions
   - Or manually: `docker compose -f docker-compose.prod.yml up -d`

11. **Set up Nginx with SSL**
   ```bash
   # Install Certbot
   apt-get install certbot python3-certbot-nginx
   
   # Get SSL certificate
   certbot --nginx -d your-domain.com
   ```

### 2. AWS ECS (For enterprise/scalable deployments)

**Cost**: Variable, ~$50-200/month depending on usage

#### Setup Steps:

1. **Create AWS Account**
   - Sign up at https://aws.amazon.com

2. **Create ECR Repositories**
   ```bash
   aws ecr create-repository --repository-name sqlpulse-backend
   aws ecr create-repository --repository-name sqlpulse-scheduler
   aws ecr create-repository --repository-name sqlpulse-frontend
   ```

3. **Create RDS PostgreSQL Database**
   ```bash
   # Use AWS Console to create:
   - PostgreSQL 14
   - db.t3.micro (free tier eligible)
   - Enable auto-scaling
   ```

4. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name sqlpulse-cluster
   ```

5. **Configure GitHub Secrets**
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   PRODUCTION_DOMAIN=your-domain.com
   VITE_API_BASE_URL=https://your-domain.com/api
   ```

6. **Create Task Definition**
   - Define containers for backend, scheduler, frontend
   - Set environment variables
   - Configure networking

7. **Deploy via GitHub Actions**
   - Push to main branch triggers deployment
   - GitHub Actions workflow: `.github/workflows/deploy-aws.yml`

### 3. Railway (Easiest - One-click deploy)

**Cost**: ~$20-40/month with included PostgreSQL

#### Setup Steps:

1. **Sign up at Railway.app**
   - https://railway.app

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your SQLPulse repository

3. **Add PostgreSQL**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically sets DATABASE_URL

4. **Add Redis**
   - Click "+ New"
   - Select "Database" → "Redis"

5. **Configure Services**
   - Add three services: backend, scheduler, frontend
   - Set root directory for each:
     - Backend: `/backend`
     - Scheduler: `/scheduler`
     - Frontend: `/frontend`

6. **Set Environment Variables**
   ```
   # Backend & Scheduler (set on both)
   JWT_SECRET=your-super-secret-jwt-key
   ENCRYPTION_KEY=your-32-char-key
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   
   # Frontend
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   ```

7. **Deploy**
   - Railway auto-deploys on push to main
   - Or use Railway CLI: `railway up`

8. **Get Railway Token for CI/CD**
   ```bash
   railway login
   railway tokens
   # Copy token to GitHub secret: RAILWAY_TOKEN
   ```

### 4. Docker Compose on VPS (Manual, full control)

**Cost**: ~$5-20/month (VPS providers like Linode, Vultr, Hetzner)

1. **Get a VPS**
   - 2GB RAM minimum
   - Ubuntu 22.04 recommended

2. **Install Dependencies**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com | sh
   
   # Install Docker Compose
   apt-get install docker-compose-plugin
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/sqlpulse.git
   cd sqlpulse
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

5. **Start Services**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

6. **Set up Reverse Proxy**
   ```bash
   # Install Nginx
   apt-get install nginx
   
   # Configure as reverse proxy to port 80 (nginx container)
   # Set up SSL with Certbot
   ```

## Post-Deployment

### 1. Database Initialization
```bash
# The database should auto-initialize from init.sql
# Verify tables exist:
docker compose exec postgres psql -U sqlquery_user -d sqlquery_db -c "\dt"
```

### 2. Create Admin User
```bash
# Default admin account:
# Username: admin
# Password: admin123
# 
# IMPORTANT: Change this immediately after first login!
```

### 3. Configure Monitoring
```bash
# Set up monitoring for:
- Container health (docker ps)
- Log aggregation (ELK stack, Datadog, etc.)
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
```

### 4. Set up Backups
```bash
# Automated PostgreSQL backups
# Example cron job:
0 2 * * * docker compose exec postgres pg_dump -U sqlquery_user sqlquery_db > /backup/sqlquery_$(date +\%Y\%m\%d).sql
```

### 5. Security Checklist
- [ ] Change default admin password
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Set strong ENCRYPTION_KEY (exactly 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (only ports 80, 443, 22)
- [ ] Set up fail2ban for SSH protection
- [ ] Enable database encryption at rest
- [ ] Regular security updates

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl https://your-domain.com/api/health

# Scheduler health
curl https://your-domain.com:3002/health

# Check all containers
docker compose ps
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail 100 backend
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Or use zero-downtime update:
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend
```

### Database Backup
```bash
# Manual backup
docker compose exec postgres pg_dump -U sqlquery_user sqlquery_db > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U sqlquery_user sqlquery_db < backup_20260202.sql
```

## Troubleshooting

### Services not starting
```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs backend

# Restart service
docker compose restart backend
```

### Database connection issues
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U sqlquery_user -d sqlquery_db -c "SELECT version();"
```

### High memory usage
```bash
# Check resource usage
docker stats

# Limit container resources in docker-compose.prod.yml
```

## Cost Optimization

1. **Use managed databases** for production (automatic backups, scaling)
2. **Start small** - upgrade as needed
3. **Use CDN** for static assets (CloudFlare is free)
4. **Enable compression** in Nginx
5. **Monitor usage** and optimize queries
6. **Use reserved instances** on AWS for 40-60% savings

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/sqlpulse/issues
- Documentation: https://github.com/yourusername/sqlpulse/wiki
- Security: See SECURITY.md

## Quick Command Reference

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart a service
docker compose -f docker-compose.prod.yml restart backend

# Update and redeploy
git pull && docker compose -f docker-compose.prod.yml up -d --build

# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U sqlquery_user sqlquery_db > backup.sql

# Clean up unused images/containers
docker system prune -a
```

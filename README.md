# SQLPulse - Real-time SQL Query Management & Automation

<div align="center">
  
![SQLPulse](https://img.shields.io/badge/SQLPulse-SQL%20Management-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)
  
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)

**Real-time SQL workflow monitoring with intelligent query management and automation**

[Live Demo](https://sqlpulse.pages.dev) • [Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🌐 Production Deployment

**Live Application:** https://sqlpulse.pages.dev

**Infrastructure:**
- 🎨 **Frontend**: Cloudflare Pages (Global CDN)
- ⚡ **Backend API**: Railway (Auto-scaling)
- ⏰ **Scheduler**: Railway (Background jobs)
- 🗄️ **Database**: Neon PostgreSQL (Serverless)
- 🔄 **Cache**: Railway Redis
- 🚀 **CI/CD**: GitHub Actions (Auto-deploy on push)

---

## ✨ Features

### 📚 Query Management
- **Query Library**: Store and categorize SQL queries with rich metadata
- **Advanced Search**: Filter by category, tags, author, database type, and more
- **Query Editor**: Full-featured SQL editor with Monaco (VS Code editor)
  - Syntax highlighting for multiple database types
  - Auto-completion and IntelliSense
  - Query formatting and beautification
  - Parameter support with placeholders
- **Version Control**: Track query changes and maintain history
- **Query Collections**: Organize queries into folders and collections
- **Favorites**: Quick access to frequently used queries

### 🔌 Database Connection Management
- Support for multiple database types:
  - SQL Server
  - MySQL
  - PostgreSQL
  - Oracle (with additional setup)
- Secure credential storage with AES-256 encryption
- Connection testing and validation
- Environment tagging (Dev, QA, UAT, Production)
- Connection pooling configuration

### ⚡ Query Execution
- Execute queries with real-time parameter input
- Live execution progress tracking
- Detailed execution metrics (time, rows affected)
- Result preview with pagination
- Export results to CSV, Excel, JSON
- Transaction support with commit/rollback
- Dry-run mode for dangerous operations

### ⏰ Scheduling & Automation (Core Feature)

#### Schedule Types
- **One-time**: Execute at specific date/time
- **Daily**: Every N days at specific time
- **Weekly**: Select days of week
- **Monthly**: Specific date or last day of month
- **Hourly**: Every N hours
- **Custom**: Full cron expression support

#### Advanced Features
- Visual cron expression builder
- Timezone support for global teams
- Dynamic parameters (@TODAY, @YESTERDAY, etc.)
- Job dependencies and chains
- Retry logic with exponential backoff
- Priority-based queue management
- Concurrent execution limits

### 📊 Monitoring & Analytics
- Real-time dashboard with key metrics
- Live job execution monitor
- Execution history and audit trail
- Performance analytics and trends
- Success/failure rate tracking
- Query performance comparison
- Scheduled job calendar view

### 🔔 Notifications
Support for multiple channels:
- Email (SMTP)
- Slack
- Microsoft Teams
- Discord
- Custom Webhooks
- SMS (via Twilio)

Trigger notifications on:
- Success
- Failure
- Specific conditions (row count, duration)
- Daily summary reports

### 🔐 Security
- JWT-based authentication
- Role-based access control (RBAC)
  - Admin
  - Developer
  - Analyst
  - Scheduler
  - Read-Only
- Encrypted credential storage
- Audit trail for all operations
- Production database protection
- Query approval workflow

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│  - Dashboard, Query Editor, etc.    │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│       Backend API (Express)          │
│  - Authentication, CRUD, Execution  │
└──────────┬──────────┬────────────────┘
           │          │
           ▼          ▼
    ┌──────────┐  ┌──────────┐
    │PostgreSQL│  │  Redis   │
    │ (App DB) │  │ (Queue)  │
    └──────────┘  └─────┬────┘
                        │
              ┌─────────▼─────────┐
              │ Scheduler Worker  │
              │  - Job Processing │
              │  - Query Execution│
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │  Target Databases │
              │ (SQL Server, etc.)│
              └───────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Monaco Editor** for SQL editing
- **Zustand** for state management
- **React Query** for data fetching
- **React Router** for navigation
- **Recharts** for analytics visualization

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Sequelize** ORM for database operations
- **JWT** for authentication
- **bcrypt** for password hashing
- **Winston** for logging

### Scheduler
- **Bull** queue with **Redis**
- **node-cron** for scheduling
- **Multiple database drivers** (mssql, mysql2, pg, oracledb)

### Database
- **PostgreSQL 14+** for application data
- **Redis 7+** for job queue and caching

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** for reverse proxy

## 📦 Quick Start

### Option 1: Local Development (Docker)

```bash
# Clone the repository
git clone https://github.com/yourusername/sqlpulse.git
cd sqlpulse

# Start all services with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:3000
```

**Default credentials:**
- Username: `admin`
- Password: `admin123`
- ⚠️ Change immediately after first login!

### Option 2: Manual Setup

**Prerequisites:** Node.js 18+, PostgreSQL 14+, Redis 7+

```bash
# Install dependencies
npm run install-all

# Set up environment variables
cp backend/.env.example backend/.env
cp scheduler/.env.example scheduler/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your database credentials

# Start PostgreSQL and Redis (or use Docker)
docker-compose up -d postgres redis

# Run database migrations
cd backend && npm run migrate

# Start all services
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

---

## 🚀 Deployment

### Production Deployment (Current Setup)

**Automated CI/CD Pipeline:**
1. Push code to `main` branch
2. GitHub Actions automatically:
   - Runs tests and builds
   - Deploys frontend to Cloudflare Pages
   - Deploys backend to Railway
   - Deploys scheduler to Railway

**Manual Deployment:**

See [CUSTOM-DOMAIN-SETUP.md](CUSTOM-DOMAIN-SETUP.md) for detailed deployment guide including:
- Custom domain configuration
- SSL setup
- Environment variables
- Database migrations
- Monitoring setup

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose (recommended)
- PostgreSQL 14+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
```bash
cd "SQL Query Management Dashboard"
```

2. **Create environment files**
```bash
# Backend
cp backend/.env.example backend/.env

# Edit backend/.env and update:
# - JWT_SECRET (use a strong random string)
# - ENCRYPTION_KEY (exactly 32 characters for AES-256)
# - SMTP credentials (if using email notifications)
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Check service health**
```bash
docker-compose ps
docker-compose logs -f
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

### Option 2: Manual Installation

1. **Install dependencies for all services**
```bash
npm run install-all
```

2. **Set up PostgreSQL database**
```bash
# Create database
createdb sqlquery_db

# Run initialization script
psql -U postgres -d sqlquery_db -f database/init.sql
```

3. **Start Redis**
```bash
redis-server
```

4. **Configure environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env

# Update DATABASE_URL, REDIS_URL, JWT_SECRET, ENCRYPTION_KEY
```

5. **Start all services**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Scheduler
cd scheduler
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

## 🎯 Quick Start

### Default Credentials
After installation, log in with:
- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Change the default password immediately after first login!**

### Creating Your First Query

1. **Add a Database Connection**
   - Navigate to "Connections"
   - Click "Add Connection"
   - Fill in connection details
   - Test connection
   - Save

2. **Create a Query**
   - Navigate to "Query Library"
   - Click "New Query"
   - Enter query name and description
   - Write your SQL in the editor
   - Select database type and connection
   - Save

3. **Execute the Query**
   - Click "Execute" button
   - Enter parameter values (if any)
   - View results

4. **Schedule the Query**
   - Click "Schedule" button
   - Choose schedule type
   - Configure frequency
   - Set notifications
   - Enable schedule

## 📖 User Guide

### Dashboard
The dashboard provides an at-a-glance view:
- Execution statistics (today, this week, this month)
- Success/failure rates
- Currently running jobs
- Upcoming scheduled executions (next 6 hours)
- Recent query executions
- Favorite queries

### Query Library
Browse and manage all your queries:
- **Search & Filter**: By category, tags, database type, author
- **Sort**: By name, created date, execution count, etc.
- **Quick Actions**: Execute, edit, schedule, favorite, delete
- **Bulk Operations**: Export, duplicate, share

### Query Editor
Powerful SQL editing experience:
- **Syntax Highlighting**: Language-specific
- **Auto-complete**: Table and column suggestions
- **Format**: Beautify SQL code
- **Parameters**: Use @ParamName placeholders
- **Execute**: Run with parameter input
- **Save Versions**: Track changes over time

### Schedule Manager
Comprehensive scheduling interface:
- **Calendar View**: See all scheduled queries
- **List View**: Detailed schedule information
- **Create Schedule**: Step-by-step wizard
- **Manage Schedules**: Enable/disable, edit, delete, run now
- **Monitor**: Real-time execution status

### Execution History
Complete audit trail:
- **Filter**: By date range, query, status, user
- **View Details**: Parameters, execution time, rows affected
- **Re-execute**: Run again with same or different parameters
- **Export Results**: Download previous execution results
- **Analyze Trends**: Performance over time

### Connection Management
Secure database credentials:
- **Add/Edit**: Configure connection details
- **Test**: Verify connectivity before saving
- **Status**: View active connections
- **Permissions**: Control user access

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/sqlquery_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-character-encryption-key
QUERY_TIMEOUT_SECONDS=300
MAX_CONCURRENT_EXECUTIONS=10
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### Notification Configuration

#### Email (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourcompany.com
```

#### Slack Webhook
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 🔐 Security Best Practices

1. **Change Default Credentials**: Immediately after installation
2. **Use Strong Secrets**: Generate random JWT_SECRET and ENCRYPTION_KEY
3. **Enable HTTPS**: In production, always use HTTPS
4. **Restrict Database Access**: Use read-only users for SELECT queries
5. **Review Dangerous Queries**: Implement approval workflow for UPDATE/DELETE
6. **Monitor Audit Logs**: Regularly review execution history
7. **Limit Connection Access**: Use RBAC to control who can access what
8. **Backup Regularly**: Automated backups of application database
9. **Update Dependencies**: Keep packages up to date

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# Check all services
docker-compose ps
```

### Logs
```bash
# View all logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f scheduler

# Backend logs (manual)
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Queue Monitoring
Access Bull Dashboard (optional):
```bash
npm install -g bull-board
bull-board
```

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Update all environment variables
- [ ] Change default admin password
- [ ] Configure HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Review security settings
- [ ] Test all critical paths
- [ ] Set up log aggregation
- [ ] Configure resource limits
- [ ] Plan for horizontal scaling

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Scheduler Workers
To handle more scheduled queries, scale the scheduler service:
```bash
docker-compose up -d --scale scheduler=3
```

## 🧪 Development

### Project Structure
```
sql-query-dashboard/
├── backend/               # Express API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Entry point
│   └── package.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── lib/           # API client, utilities
│   │   └── main.tsx       # Entry point
│   └── package.json
├── scheduler/             # Background worker
│   ├── src/
│   │   ├── services/      # Scheduling logic
│   │   ├── utils/         # Utilities
│   │   └── index.ts       # Entry point
│   └── package.json
├── database/              # Database scripts
│   └── init.sql           # Schema initialization
├── docker-compose.yml     # Development setup
└── README.md             # This file
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Lint
npm run lint

# Format
npm run format
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

Full API documentation is available at:
- Development: http://localhost:3001/api-docs
- Swagger/OpenAPI spec: `/api-docs/swagger.json`

### Key Endpoints

#### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

#### Queries
```
GET    /api/queries
POST   /api/queries
GET    /api/queries/:id
PUT    /api/queries/:id
DELETE /api/queries/:id
POST   /api/queries/:id/execute
GET    /api/queries/search
```

#### Schedules
```
GET    /api/schedules
POST   /api/schedules
GET    /api/schedules/:id
PUT    /api/schedules/:id
DELETE /api/schedules/:id
POST   /api/schedules/:id/enable
POST   /api/schedules/:id/disable
POST   /api/schedules/:id/run-now
GET    /api/schedules/upcoming
```

## 🐛 Troubleshooting

### Common Issues

**Problem**: Cannot connect to database
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string in .env
cat backend/.env | grep DATABASE_URL

# Test connection
docker-compose exec postgres psql -U sqlquery_user -d sqlquery_db
```

**Problem**: Scheduler not executing jobs
```bash
# Check Redis is running
docker-compose ps redis

# Check scheduler logs
docker-compose logs -f scheduler

# Verify schedules are enabled
docker-compose exec postgres psql -U sqlquery_user -d sqlquery_db \
  -c "SELECT id, schedule_name, is_enabled, next_run_time FROM schedules;"
```

**Problem**: Frontend not connecting to backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Check VITE_API_URL in frontend/.env
cat frontend/.env

# Check browser console for errors
```

## � Documentation

- 🏗️ [Architecture & Project Structure](ARCHITECTURE.md) - System design and folder structure
- 🌐 [Custom Domain Setup](CUSTOM-DOMAIN-SETUP.md) - Production deployment with custom domain
- 🔒 [Security Policy](SECURITY.md) - Security best practices
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute
- 📝 [Changelog](CHANGELOG.md) - Version history

## 🐛 Troubleshooting

### Common Issues

**Problem**: Cannot connect to database
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U sqlquery_user -d sqlquery_db
```

**Problem**: Scheduler not executing jobs
```bash
# Check Redis is running
docker-compose ps redis

# Check scheduler logs
docker-compose logs -f scheduler
```

**Problem**: Frontend not connecting to backend
```bash
# Check backend health
curl http://localhost:3001/api/health

# Check VITE_API_BASE_URL in frontend/.env
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 🐛 [Report bugs](https://github.com/yourusername/sqlpulse/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/yourusername/sqlpulse/issues/new?template=feature_request.md)
- ❓ [Ask questions](https://github.com/yourusername/sqlpulse/issues/new?template=question.md)
- 🔒 Security issues: See [SECURITY.md](SECURITY.md)

---

**Made with ❤️ for database administrators, analysts, and developers**

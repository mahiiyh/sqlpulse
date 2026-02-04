# Project Structure

> ⚠️ **Security Note**: This document describes the technical architecture of SQLPulse. For security considerations and best practices, please review [SECURITY.md](SECURITY.md) before deploying.

SQLPulse is organized as a monorepo with separate frontend, backend, and scheduler services.

```
sqlpulse/
├── .github/
│   ├── workflows/
│   │   ├── ci-cd.yml              # Main CI/CD pipeline (tests, builds)
│   │   ├── deploy-cloudflare.yml  # Frontend deployment to Cloudflare Pages
│   │   └── deploy-railway.yml     # Backend & Scheduler deployment to Railway
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── frontend/                       # React + TypeScript + Vite
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components (Dashboard, QueryEditor, etc.)
│   │   ├── lib/                   # API client and utilities
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── types/                 # TypeScript type definitions
│   │   └── App.tsx               # Main app component
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                        # Express + TypeScript + Sequelize
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── models/                # Database models (Sequelize)
│   │   ├── routes/                # API route definitions
│   │   ├── middleware/            # Auth, error handling, logging
│   │   ├── services/              # Business logic (queryExecutor, queue, notifications)
│   │   ├── workers/               # Bull queue workers
│   │   ├── utils/                 # Helper functions
│   │   ├── database/              # Database connection and migrations
│   │   └── index.ts               # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── scheduler/                      # Background job scheduler
│   ├── src/
│   │   ├── services/              # Schedule manager, query executor
│   │   ├── utils/                 # Logger, query parameters
│   │   └── index.ts               # Scheduler entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── init.sql                   # Database initialization script
│
├── nginx/
│   └── nginx.conf                 # Nginx reverse proxy config
│
├── docker-compose.yml             # Local development setup
├── docker-compose.prod.yml        # Production Docker setup (optional)
├── package.json                   # Root package.json (npm workspaces)
├── README.md                      # Main documentation
├── CONTRIBUTING.md                # Contribution guidelines
├── SECURITY.md                    # Security policy
├── CHANGELOG.md                   # Version history
└── LICENSE                        # MIT License
```

## Service Architecture

```
┌─────────────────────────────────────┐
│   Frontend (React + Vite)           │
│   Deployed on: Cloudflare Pages     │
│   (or any static hosting)           │
└──────────────┬──────────────────────┘
               │ HTTPS/REST API
┌──────────────▼────────────────────── ┐
│   Backend API (Express + TypeScript) │
│   Deployed on: Railway / Heroku      │
│   / any Node.js hosting              │
└──────────┬──────────┬────────────────┘
           │          │
           ▼          ▼
    ┌──────────┐  ┌──────────┐
    │PostgreSQL│  │  Redis   │
    │ (Cloud)  │  │ (Cloud)  │
    └──────────┘  └─────┬────┘
                        │
              ┌─────────▼─────────┐
              │ Scheduler Service │
              │ (Background Jobs) │
              └───────────────────┘
```

## Key Directories

### Frontend (`/frontend`)
- **Components**: Reusable UI components (Logo, Sidebar, Modal, etc.)
- **Pages**: Full page views (Dashboard, QueryEditor, Schedules, etc.)
- **Lib**: API client using fetch/axios
- **Hooks**: Custom hooks for state management
- **Build Output**: `dist/` (deployed to Cloudflare Pages)

### Backend (`/backend`)
- **Controllers**: Handle HTTP requests, call services
- **Models**: Sequelize ORM models (User, Query, Schedule, etc.)
- **Routes**: Express route definitions with middleware
- **Services**: Core business logic (query execution, notifications)
- **Workers**: Bull queue workers for async job processing
- **Middleware**: Authentication (JWT), error handling

### Scheduler (`/scheduler`)
- **Services**: Schedule manager, dependency checker, query executor
- **Index**: Main scheduler loop using node-cron
- **Purpose**: Runs scheduled queries at specified times

## Configuration Files

- **`.env`**: Local development environment variables (gitignored)
- **`.env.example`**: Template for environment variables
- **`docker-compose.yml`**: Local development with all services
- **`docker-compose.prod.yml`**: Production-ready Docker setup
- **`Dockerfile`**: Individual service Docker images
- **`tsconfig.json`**: TypeScript configuration
- **`vite.config.ts`**: Vite build configuration

## Deployment Flow

### Automatic (CI/CD)

1. **Developer pushes to `main` branch**
2. **GitHub Actions triggers:**
   - `ci-cd.yml`: Runs tests and builds
   - `deploy-cloudflare.yml`: Deploys frontend if frontend/* changes
   - `deploy-railway.yml`: Deploys backend/scheduler if backend/* or scheduler/* changes
3. **Services auto-deploy to production**

### Manual

```bash
# Deploy frontend
cd frontend
npm run build
# Manually upload to Cloudflare Pages

# Deploy backend/scheduler
railway up --service backend
railway up --service scheduler
```

## Data Flow

1. **User Action** → Frontend sends HTTP request
2. **Backend API** → Validates, processes, interacts with database
3. **Queue System** → Async jobs added to Bull queue (Redis)
4. **Workers** → Process jobs (query execution, notifications)
5. **Scheduler** → Triggers scheduled queries at specified times
6. **Database** → Stores all application and execution data

## Environment Variables

> ⚠️ **Security Warning**: Never commit `.env` files to version control. Always use strong, randomly generated secrets in production.

### Frontend
- `VITE_API_BASE_URL`: Backend API endpoint

### Backend
- `DATABASE_URL`: PostgreSQL connection string (use SSL in production: `?sslmode=require`)
- `REDIS_URL`: Redis connection string (use password authentication)
- `JWT_SECRET`: Secret for JWT token signing (min 32 characters, randomly generated)
- `ENCRYPTION_KEY`: AES-256 encryption key (exactly 32 characters)
- `JWT_EXPIRES_IN`: Token expiry duration (default: 7d, recommend shorter for production)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `QUERY_TIMEOUT_SECONDS`: Max query execution time (default: 300)
- `MAX_CONCURRENT_EXECUTIONS`: Concurrent query limit (default: 10)

**Generate Secure Secrets:**
```bash
# JWT Secret (32+ characters)
openssl rand -base64 48

# Encryption Key (exactly 32 characters)
openssl rand -base64 32 | cut -c1-32
```

### Scheduler
- Same as backend (shares database and Redis)

## Development Workflow

1. **Local Development**: Use `docker-compose up -d` for all services
2. **Make Changes**: Edit code in respective service directory
3. **Test Locally**: `npm run dev` in each service
4. **Commit**: Follow conventional commits
5. **Push to GitHub**: CI/CD automatically tests and deploys

## Testing

- **Unit Tests**: `npm test` in each service directory
- **Integration Tests**: Defined in CI/CD pipeline
- **E2E Tests**: TODO - Cypress/Playwright

## Monitoring

- **Frontend**: Cloudflare Web Analytics
- **Backend**: Railway built-in metrics
- **Database**: Neon dashboard
- **Logs**: Railway logs viewer

## Security

### Authentication & Authorization
- **Frontend**: JWT tokens stored in httpOnly cookies (recommended) or localStorage
- **Backend**: JWT verification middleware on all protected endpoints
- **RBAC**: Role-based access control with permission matrix
  - Admin: Full access to all features
  - Developer: Query management, execution, scheduling
  - Analyst: Query execution only (read operations)
  - Scheduler: Schedule management only
  - Read-Only: View-only access

### Data Encryption
- **At Rest**: Database credentials encrypted with AES-256-CBC
- **In Transit**: HTTPS/TLS for all API communication
- **Database**: SSL/TLS connections to target databases (configurable)
- **Passwords**: Bcrypt hashing with 10 salt rounds

### API Security
- **Authentication**: JWT tokens with configurable expiry (default: 7 days)
- **Rate Limiting**: Prevents brute force and DoS attacks
  - Login endpoint: 5 attempts per 15 minutes
  - API endpoints: 100 requests per 15 minutes per user
- **CORS**: Configured to allow only trusted origins
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Sequelize ORM

### Credential Management
- **Environment Variables**: Sensitive data stored in `.env` (never committed)
- **Encryption Key**: Required for encrypting/decrypting database credentials
- **Secrets Rotation**: Manual process (key rotation requires re-encryption)

### Audit & Logging
- **Execution History**: All query executions logged with user, timestamp, parameters
- **Authentication Logs**: Login attempts, failures, logouts
- **Permission Changes**: Admin actions logged
- **Error Logging**: Winston logger with file and console transports
- **Log Retention**: Configurable (recommend 90 days minimum)

### Security Limitations
> ⚠️ **Important**: Please review these limitations:

1. **No Built-in MFA**: Multi-factor authentication not implemented
2. **Token Revocation**: No centralized token blacklist (tokens valid until expiry)
3. **Query Content**: No built-in query whitelisting or DLP
4. **Database Permissions**: Relies on database-level access controls
5. **Network Security**: Application-level security only (no VPN/network segmentation)

For comprehensive security guidance, see [SECURITY.md](SECURITY.md).

# Project Structure

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
├── CUSTOM-DOMAIN-SETUP.md        # Custom domain setup guide
├── SECURITY.md                    # Security policy
├── CHANGELOG.md                   # Version history
└── LICENSE                        # MIT License
```

## Service Architecture

```
┌─────────────────────────────────────┐
│   Frontend (React + Vite)           │
│   Deployed on: Cloudflare Pages     │
│   URL: sqlpulse.mahiiyh.me          │
└──────────────┬──────────────────────┘
               │ HTTPS/REST API
┌──────────────▼──────────────────────┐
│   Backend API (Express + TypeScript)│
│   Deployed on: Railway               │
│   URL: backend-production-*.railway │
└──────────┬──────────┬────────────────┘
           │          │
           ▼          ▼
    ┌──────────┐  ┌──────────┐
    │  Neon DB │  │  Redis   │
    │PostgreSQL│  │ Railway  │
    └──────────┘  └─────┬────┘
                        │
              ┌─────────▼─────────┐
              │ Scheduler Service │
              │ Deployed: Railway │
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

### Frontend
- `VITE_API_BASE_URL`: Backend API endpoint

### Backend
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `REDIS_URL`: Redis connection string (Railway)
- `JWT_SECRET`: Secret for JWT token signing
- `ENCRYPTION_KEY`: AES-256 encryption key (32 chars)
- `PORT`: Server port (default: 3001)

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

- **Frontend**: Environment variables at build time
- **Backend**: JWT authentication, encrypted credentials
- **Database**: SSL/TLS connections, Neon security features
- **Secrets**: Managed via GitHub Secrets + Railway environment variables

# 🏗️ Architecture Documentation

## System Overview

SQL Query Management Dashboard is a full-stack web application designed to manage, execute, and schedule SQL queries across multiple database systems. The architecture follows a microservices approach with three main services:

1. **Frontend** - React-based user interface
2. **Backend API** - Express REST API server
3. **Scheduler Worker** - Background job processing service

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                   │
│  - Routes /api/* to Backend                                  │
│  - Routes /* to Frontend                                     │
│  - SSL Termination                                           │
│  - Load Balancing                                            │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Frontend (React)        │   │   Backend API (Express)   │
│                           │   │                           │
│  - React 18 + TypeScript  │   │  - REST API Endpoints     │
│  - Tailwind CSS           │   │  - Authentication (JWT)   │
│  - Monaco Editor          │   │  - RBAC Middleware        │
│  - Zustand (State)        │   │  - Query Execution        │
│  - React Query (Data)     │   │  - Connection Management  │
│  - React Router           │   │  - Schedule Management    │
└───────────────────────────┘   └──────────┬───────────────┘
                                           │
                    ┌──────────────────────┼───────────────────┐
                    │                      │                   │
                    ▼                      ▼                   ▼
         ┌────────────────────┐  ┌─────────────────┐  ┌─────────────┐
         │  PostgreSQL (App)  │  │  Redis (Queue)  │  │  Winston    │
         │                    │  │                 │  │  (Logging)  │
         │  - Users           │  │  - Bull Queue   │  └─────────────┘
         │  - Connections     │  │  - Job Data     │
         │  - Queries         │  │  - Worker State │
         │  - Schedules       │  └────────┬────────┘
         │  - Execution Logs  │           │
         └────────────────────┘           │
                    ▲                     │
                    │                     │
                    │                     ▼
                    │           ┌─────────────────────────┐
                    │           │  Scheduler Worker       │
                    │           │                         │
                    │           │  - Poll for due jobs    │
                    │           │  - Execute queries      │
                    │           │  - Handle retries       │
                    │           │  - Send notifications   │
                    │           │  - Update history       │
                    └───────────┤  - Calculate next runs  │
                                └────────┬────────────────┘
                                         │
                         ┌───────────────┼────────────────┐
                         │               │                │
                         ▼               ▼                ▼
                ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
                │ SQL Server  │  │   MySQL      │  │ PostgreSQL   │
                │ (Target DB) │  │ (Target DB)  │  │ (Target DB)  │
                └─────────────┘  └──────────────┘  └──────────────┘
```

## Technology Stack

### Frontend Layer
```
React 18 (UI Framework)
  ├── TypeScript (Type Safety)
  ├── Tailwind CSS (Styling)
  ├── Monaco Editor (SQL Editing)
  ├── Zustand (State Management)
  ├── React Query (Server State)
  ├── React Router (Navigation)
  ├── Axios (HTTP Client)
  └── Recharts (Visualization)
```

### Backend Layer
```
Node.js + Express (API Server)
  ├── TypeScript (Type Safety)
  ├── Sequelize (ORM)
  ├── JWT (Authentication)
  ├── bcrypt (Password Hashing)
  ├── Winston (Logging)
  ├── Helmet (Security Headers)
  ├── CORS (Cross-Origin)
  └── Compression (Response Compression)
```

### Scheduler Layer
```
Node.js Worker
  ├── Bull (Job Queue)
  ├── node-cron (Scheduling)
  ├── Database Drivers:
  │   ├── mssql (SQL Server)
  │   ├── mysql2 (MySQL)
  │   ├── pg (PostgreSQL)
  │   └── oracledb (Oracle)
  └── Notification Services:
      ├── Nodemailer (Email)
      └── Axios (Webhooks)
```

### Data Layer
```
PostgreSQL 14+ (Application Database)
  └── Stores: Users, Queries, Schedules, Connections, Execution History

Redis 7+ (Queue & Cache)
  └── Bull Job Queue
```

## Component Architecture

### Frontend Components

```
src/
├── pages/              # Route-level components
│   ├── Dashboard.tsx       # Home dashboard
│   ├── Login.tsx          # Authentication
│   ├── QueryLibrary.tsx   # Query list
│   ├── QueryEditor.tsx    # Query CRUD
│   ├── Schedules.tsx      # Schedule management
│   ├── Connections.tsx    # DB connections
│   └── ExecutionHistory.tsx # Audit logs
│
├── components/         # Reusable components
│   ├── Layout.tsx         # App layout
│   ├── QueryCard.tsx      # Query display
│   ├── ScheduleForm.tsx   # Schedule creation
│   ├── CronBuilder.tsx    # Visual cron editor
│   └── DataTable.tsx      # Results display
│
├── stores/            # Zustand stores
│   ├── authStore.ts       # Auth state
│   ├── queryStore.ts      # Query state
│   └── scheduleStore.ts   # Schedule state
│
├── lib/               # Utilities
│   ├── api.ts            # API client
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
│
└── types/             # TypeScript types
    └── index.ts
```

### Backend Structure

```
src/
├── index.ts           # Entry point
│
├── controllers/       # Request handlers
│   ├── auth.controller.ts
│   ├── query.controller.ts
│   ├── schedule.controller.ts
│   ├── connection.controller.ts
│   └── execution.controller.ts
│
├── models/            # Sequelize models
│   ├── User.ts
│   ├── Query.ts
│   ├── Schedule.ts
│   ├── Connection.ts
│   ├── ExecutionHistory.ts
│   └── index.ts           # Model associations
│
├── routes/            # API routes
│   ├── auth.routes.ts
│   ├── query.routes.ts
│   ├── schedule.routes.ts
│   ├── connection.routes.ts
│   ├── execution.routes.ts
│   └── index.ts           # Route aggregator
│
├── middleware/        # Express middleware
│   ├── auth.ts            # JWT verification
│   ├── errorHandler.ts    # Error handling
│   └── validation.ts      # Request validation
│
├── services/          # Business logic
│   ├── queryExecutor.ts   # Query execution
│   ├── notificationService.ts # Notifications
│   └── exportService.ts   # Result export
│
├── utils/             # Utilities
│   ├── logger.ts          # Winston logger
│   ├── encryption.ts      # AES encryption
│   └── database.ts        # DB utilities
│
└── database/          # DB management
    ├── connection.ts      # Sequelize config
    ├── migrate.ts         # Migrations
    └── seed.ts            # Seed data
```

### Scheduler Structure

```
src/
├── index.ts           # Worker entry point
│
├── services/          # Core services
│   ├── scheduleManager.ts # Schedule scanning
│   ├── queryExecutor.ts   # Query execution
│   └── notificationManager.ts # Notifications
│
└── utils/             # Utilities
    └── logger.ts          # Winston logger
```

## Data Flow

### Query Execution Flow

```
1. User Action
   └─> Click "Execute" in UI

2. Frontend
   └─> POST /api/queries/:id/execute
       └─> Send query ID + parameters

3. Backend API
   ├─> Validate user permissions
   ├─> Fetch query and connection
   ├─> Decrypt connection credentials
   ├─> Create execution history record
   └─> Execute query on target DB
       ├─> SQL Server: mssql driver
       ├─> MySQL: mysql2 driver
       └─> PostgreSQL: pg driver

4. Database Execution
   └─> Return results + metadata

5. Backend Processing
   ├─> Store results (if configured)
   ├─> Update execution history
   ├─> Calculate execution time
   └─> Return response to frontend

6. Frontend Display
   ├─> Show results in table
   ├─> Display execution metrics
   └─> Enable export options
```

### Scheduled Query Flow

```
1. Schedule Creation
   └─> User creates schedule via UI
       └─> POST /api/schedules
           └─> Store in database with next_run_time

2. Scheduler Worker (Every minute)
   └─> Scan for due schedules
       └─> SELECT * FROM schedules 
           WHERE is_enabled = true 
           AND next_run_time <= NOW()

3. Job Queue
   └─> Add job to Bull queue
       └─> Redis stores job data
           └─> {scheduleId, queryId, connectionId, params}

4. Worker Process
   ├─> Pick job from queue
   ├─> Fetch query SQL
   ├─> Fetch connection details
   ├─> Decrypt credentials
   ├─> Execute query
   ├─> Handle results
   │   ├─> Store to file system
   │   ├─> Export to S3/Azure
   │   └─> Send via email
   ├─> Send notifications
   │   ├─> Email (SMTP)
   │   ├─> Slack (Webhook)
   │   └─> Teams (Webhook)
   ├─> Update execution history
   └─> Calculate next run time

5. Error Handling
   ├─> Retry on failure (exponential backoff)
   ├─> Send failure notification
   └─> Log error details
```

## Database Schema

### Core Tables

```sql
users
├── id (PK)
├── username
├── email
├── password_hash
├── role (enum: admin, developer, analyst, scheduler, read_only)
└── timezone

connections
├── id (PK)
├── name
├── type (enum: sqlserver, mysql, postgresql, oracle)
├── host
├── port
├── database_name
├── username
├── encrypted_password (AES-256)
├── environment (enum: dev, qa, uat, production)
└── created_by (FK -> users.id)

queries
├── id (PK)
├── name
├── description
├── sql_content
├── category (enum)
├── database_type
├── is_public
├── is_dangerous
├── is_schedulable
└── created_by (FK -> users.id)

schedules
├── id (PK)
├── query_id (FK -> queries.id)
├── connection_id (FK -> connections.id)
├── schedule_name
├── schedule_type (enum: one_time, daily, weekly, monthly, hourly, cron)
├── cron_expression
├── next_run_time
├── last_run_time
├── is_enabled
└── created_by (FK -> users.id)

execution_history
├── id (PK)
├── query_id (FK -> queries.id)
├── schedule_id (FK -> schedules.id, nullable)
├── connection_id (FK -> connections.id)
├── executed_by (FK -> users.id, nullable)
├── execution_type (enum: manual, scheduled)
├── executed_at
├── completed_at
├── execution_time_ms
├── rows_affected
├── status (enum: pending, running, success, failed, cancelled)
├── error_message
└── parameters_used (JSONB)
```

## Security Architecture

### Authentication Flow

```
1. User Login
   └─> POST /api/auth/login {email, password}

2. Backend Verification
   ├─> Find user by email
   ├─> Compare password with bcrypt
   └─> Generate JWT token
       └─> Payload: {id, email, role}
       └─> Sign with JWT_SECRET
       └─> Expiry: 7 days (configurable)

3. Frontend Storage
   └─> Store token in Zustand (persisted to localStorage)

4. Subsequent Requests
   └─> Include token in Authorization header
       └─> "Bearer <token>"

5. Backend Middleware
   ├─> Verify JWT signature
   ├─> Check token expiry
   ├─> Fetch user from database
   └─> Attach user to req.user
```

### Authorization Layers

```
1. Route-Level Protection
   └─> authenticate middleware
       └─> Requires valid JWT

2. Role-Based Access
   └─> authorize(...roles) middleware
       └─> Checks user.role against allowed roles

3. Resource-Level Protection
   └─> Controller logic
       └─> Verify ownership or public access
```

### Credential Encryption

```
1. Connection Creation
   └─> User enters password
       └─> Backend encrypts with AES-256
           └─> Key: ENCRYPTION_KEY from env
           └─> Store encrypted_password in DB

2. Query Execution
   └─> Fetch connection
       └─> Decrypt password
           └─> Use for database connection
           └─> Never return decrypted password to frontend
```

## Scalability Considerations

### Horizontal Scaling

```
Frontend
└─> Deploy multiple instances behind load balancer
    └─> Stateless (all state in API/localStorage)

Backend API
├─> Deploy multiple instances
├─> Load balance with Nginx/HAProxy
└─> Stateless (JWT auth, no session storage)

Scheduler Worker
├─> Deploy multiple workers
├─> Bull queue handles job distribution
└─> Redis ensures no duplicate processing
```

### Database Scaling

```
PostgreSQL (Application DB)
├─> Read replicas for query history
├─> Connection pooling (20 connections)
└─> Regular vacuum and reindex

Redis (Queue)
├─> Redis Cluster for high availability
└─> Persistence enabled (AOF + RDB)
```

### Performance Optimizations

```
Frontend
├─> Code splitting
├─> Lazy loading
├─> React.memo for expensive components
└─> Virtual scrolling for large lists

Backend
├─> Database query optimization
├─> Indexes on frequently queried fields
├─> Response compression
├─> API rate limiting
└─> Result caching

Scheduler
├─> Batch job processing
├─> Concurrent execution limits
├─> Efficient cron calculation
└─> Result streaming for large datasets
```

## Monitoring & Observability

### Logging Strategy

```
Backend & Scheduler
└─> Winston Logger
    ├─> Console (development)
    ├─> File (combined.log, error.log)
    └─> Format: JSON with timestamp, level, message, metadata

Log Levels:
├─> error: Critical failures
├─> warn: Recoverable issues
├─> info: Important events
└─> debug: Detailed debugging
```

### Health Checks

```
GET /health
└─> Returns: {status: "ok", timestamp: "..."}

Checks:
├─> Database connectivity
├─> Redis connectivity
└─> Worker heartbeat
```

### Metrics (Planned)

```
Application Metrics
├─> Query execution count
├─> Execution success/failure rate
├─> Average execution time
├─> Active schedules
├─> Queue depth
└─> Worker count

System Metrics
├─> CPU usage
├─> Memory usage
├─> Database connections
└─> Redis memory
```

## Deployment Architecture

### Development (Docker Compose)

```yaml
services:
  - postgres (PostgreSQL 14)
  - redis (Redis 7)
  - backend (Node.js API)
  - scheduler (Worker)
  - frontend (Vite dev server)
  - nginx (Reverse proxy)
```

### Production (Recommended)

```
Kubernetes Cluster
├─> Frontend Deployment (3 replicas)
├─> Backend Deployment (5 replicas)
├─> Scheduler Deployment (3 replicas)
├─> PostgreSQL StatefulSet (with backups)
├─> Redis Cluster (3 nodes)
└─> Nginx Ingress Controller

External Services
├─> Cloud SQL / RDS (managed PostgreSQL)
├─> ElastiCache / Redis Cloud
├─> S3 / Azure Blob (result storage)
└─> CloudWatch / Datadog (monitoring)
```

## Future Enhancements

1. **Real-time Features**
   - WebSocket for live execution updates
   - Real-time dashboard metrics

2. **Advanced Scheduling**
   - DAG-based job dependencies
   - Conditional execution logic
   - Dynamic resource allocation

3. **Enhanced Security**
   - OAuth 2.0 / SSO integration
   - 2FA support
   - Audit log viewer

4. **Collaboration**
   - Query comments and discussions
   - Team workspaces
   - Approval workflows

5. **AI/ML Integration**
   - Query optimization suggestions
   - Anomaly detection
   - Predictive scheduling

---

**Document Version**: 1.0  
**Last Updated**: January 30, 2026

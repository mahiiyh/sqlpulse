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

[Features](#-features) • [User Guide](#-user-guide) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

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
- **JWT-based authentication** with secure token management
- **Role-based access control (RBAC)** with principle of least privilege
  - Admin: Full system access
  - Developer: Query creation and scheduling
  - Analyst: Query execution only
  - Read-Only: View-only access (default for new users)
  - See [USER_ACCESS.md](USER_ACCESS.md) for detailed role permissions
- **AES-256 encrypted credential storage** for all database connections
- **New users default to Read-Only** for security (contact admin for upgrade)
- **Complete audit trail** for all operations and data access
- **Production database protection** with read-only mode enforcement
- **Query approval workflow** for destructive operations (UPDATE/DELETE/DROP)
- **Rate limiting** on all API endpoints to prevent abuse
- **SQL injection prevention** through parameterized queries
- **Input validation and sanitization** on all user inputs

> ⚠️ **Security Notice**: This application handles sensitive database credentials and can execute arbitrary SQL queries. Ensure proper access controls, use strong passwords, and follow security best practices outlined in [SECURITY.md](SECURITY.md).

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Dashboard, Query Editor, etc.    │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│       Backend API (Express)         │
│  - Authentication, CRUD, Execution  │
└──────────┬──────────┬───────────────┘
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

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

> **Note**: Please review [SECURITY.md](SECURITY.md) before contributing security-related changes.

## 📝 API Documentation

Full API documentation is available at `/api-docs` when running the backend server.

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

## 📚 Documentation

- 🏗️ [Architecture & Project Structure](ARCHITECTURE.md) - System design and folder structure
- 🔒 [Security Policy](SECURITY.md) - Security best practices and reporting
- 👥 [User Access & Roles](USER_ACCESS.md) - Role permissions and upgrade requests
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- 📝 [Changelog](CHANGELOG.md) - Version history and updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, feedback, or issues, please use GitHub Issues.

> ⚠️ **IMPORTANT**: For security vulnerabilities, **DO NOT** create a public issue. Instead, follow the responsible disclosure process outlined in [SECURITY.md](SECURITY.md).

---

## ⚠️ Disclaimer

This is a personal project for SQL query management and automation. Use at your own risk.

- **Database Access**: This application can execute arbitrary SQL queries on connected databases. Ensure proper access controls and permissions.
- **Production Use**: Thoroughly test in a non-production environment before deploying to production.
- **Data Security**: You are responsible for securing database credentials, configuring authentication, and following security best practices.
- **No Warranty**: This software is provided "as is" without warranty of any kind. See [LICENSE](LICENSE) for details.

---

**Made with ❤️ for database administrators, analysts, and developers**
 `/api-docs` when running the backend server.� Documentation

- 🏗️ [Architecture & Project Structure](ARCHITECTURE.md) - System design and folder structure
- 🔒 [Security Policy](SECURITY.md) - Security best practices and reporting
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- 📝 [Changelog](CHANGELOG.md) - Version history and updates
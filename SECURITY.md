# Security Policy

## 🛡️ Security

We take the security of SQLPulse seriously. If you believe you have found a security vulnerability, please report it to us as described below.

## 📢 Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@sqlpulse.com** (or your configured email)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

This information will help us triage your report more quickly.

## 🔒 Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Security Best Practices

### For Administrators

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, randomly generated secrets:
     ```bash
     # Generate JWT_SECRET
     openssl rand -base64 32
     
     # Generate ENCRYPTION_KEY (exactly 32 characters)
     openssl rand -base64 32 | cut -c1-32
     ```

2. **Default Credentials**
   - Change the default admin password immediately after first login
   - Default credentials:
     - Email: admin@example.com
     - Password: admin123 (CHANGE THIS!)

3. **Database Security**
   - Use strong passwords for database users
   - Restrict database access to application servers only
   - Enable SSL/TLS for database connections in production
   - Regularly update PostgreSQL and Redis

4. **Network Security**
   - Use HTTPS in production (configure reverse proxy with SSL)
   - Restrict API access using CORS settings
   - Use firewall rules to limit access to services
   - Consider using a VPN for sensitive database access

5. **Authentication & Authorization**
   - JWT tokens expire after 7 days by default
   - Implement role-based access control (RBAC)
   - Monitor failed login attempts
   - Implement rate limiting on authentication endpoints

6. **Data Encryption**
   - Database credentials are encrypted using AES-256
   - Ensure `ENCRYPTION_KEY` is kept secure and backed up
   - Never share encryption keys between environments

### For Developers

1. **Code Security**
   - Never hardcode secrets in code
   - Use parameterized queries to prevent SQL injection
   - Validate and sanitize all user inputs
   - Implement proper error handling without exposing sensitive information

2. **Dependencies**
   - Regularly update dependencies: `npm audit fix`
   - Review security advisories: `npm audit`
   - Use `package-lock.json` to ensure consistent installations

3. **Logging**
   - Never log sensitive information (passwords, tokens, API keys)
   - Sanitize logs before external transmission
   - Implement log rotation and retention policies

4. **API Security**
   - All API endpoints require JWT authentication (except /auth/login and /auth/register)
   - Implement rate limiting on all endpoints
   - Validate request payloads against schemas
   - Use HTTPS in production

## 🔐 Security Features

SQLPulse implements several security measures:

1. **Authentication**
   - JWT-based authentication with configurable expiry
   - Bcrypt password hashing (10 rounds)
   - Role-based access control (RBAC)

2. **Data Protection**
   - AES-256 encryption for database credentials
   - Environment-based configuration
   - Secure session management

3. **Database Security**
   - Parameterized queries (Sequelize ORM)
   - Connection pooling with limits
   - Encrypted password storage

4. **API Security**
   - JWT token verification middleware
   - CORS configuration
   - Request validation
   - Error handling without information leakage

## 🎯 Known Security Considerations

1. **Query Execution Risk**
   - Users with query execution permissions can run arbitrary SQL
   - Implement connection-level permissions carefully
   - Consider using read-only database connections for analysts
   - Audit query executions regularly

2. **Scheduled Query Risk**
   - Scheduled queries run automatically without human oversight
   - Review and approve scheduled queries before activation
   - Monitor execution logs for suspicious activity
   - Implement approval workflow for sensitive schedules

3. **Export Functionality**
   - Query results can be exported to CSV/Excel/JSON
   - Large result sets may impact performance
   - Implement export size limits
   - Monitor export activity for data exfiltration

## 📋 Security Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS/SSL
- [ ] Restrict database access
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable rate limiting
- [ ] Review and limit user permissions
- [ ] Configure backup strategy
- [ ] Test disaster recovery procedures
- [ ] Document security procedures
- [ ] Train team on security best practices

## 🔄 Security Updates

We will announce security updates through:

- GitHub Security Advisories
- Release notes (CHANGELOG.md)
- Email notifications (if configured)

Subscribe to repository notifications to stay informed.

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

## 📞 Contact

For security-related questions or concerns, contact:
- Email: security@sqlpulse.com
- GitHub Security Advisories: https://github.com/yourusername/sqlpulse/security/advisories

Thank you for helping keep SQLPulse and its users safe!

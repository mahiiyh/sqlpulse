# Post-Deployment Monitoring Checklist
**Deployment Date:** February 4, 2026  
**Branch:** bugfix/user-data-isolation → main  
**Status:** 🚀 DEPLOYED TO PRODUCTION

---

## ⚠️ Immediate Actions (First Hour)

### 1. Check Deployment Status
- [ ] ✅ Backend deployed (sqlpulse Production - 1 minute ago)
- [ ] ⚠️ Check respectful-rebirth deployment failure
- [ ] Verify all services are running (backend, frontend, scheduler)
- [ ] Check Docker containers: `docker ps`

### 2. Database Verification
```bash
# Verify login tracking columns exist
PGPASSWORD=sqlquery_pass psql -h localhost -U sqlquery_user -d sqlquery_db -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('failed_login_attempts', 'locked_until');"

# Check if team tables exist (if using teams feature)
PGPASSWORD=sqlquery_pass psql -h localhost -U sqlquery_user -d sqlquery_db -c "\dt teams*"
```
- [ ] Users table has new columns
- [ ] Teams tables created (if needed)

### 3. Test Core Authentication
```bash
# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_'$(date +%s)'","email":"test'$(date +%s)'@test.com","password":"SecurePass123!@#"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"correctpassword"}'

# Test rate limiting (try 6 times with wrong password)
for i in {1..6}; do 
  echo "Attempt $i:"
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpass"}'
  echo ""
  sleep 1
done
```
- [ ] Registration works
- [ ] Login works
- [ ] Rate limiting triggers after 5 attempts
- [ ] Account lockout works

### 4. Monitor Error Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Check for errors
grep -i "error\|fail\|exception" /tmp/backend.log | tail -20
```
- [ ] No critical errors in logs
- [ ] Authentication endpoints responding
- [ ] Database connections stable

### 5. Test User Isolation
```bash
# Create two users and verify isolation
# User 1 creates query -> User 2 shouldn't see it
./test-user-isolation.sh
```
- [ ] User A cannot access User B's queries
- [ ] User A cannot access User B's connections
- [ ] User A cannot access User B's schedules

---

## 📊 Monitoring (First 24 Hours)

### Hour 1-2: Critical Period
- [ ] Check error rate every 15 minutes
- [ ] Monitor failed login attempts
- [ ] Watch for 500 errors
- [ ] Verify user registration working
- [ ] Check memory/CPU usage

### Hour 3-8: Active Monitoring
- [ ] Check error logs every hour
- [ ] Monitor database performance
- [ ] Watch for user complaints
- [ ] Verify scheduled queries running
- [ ] Check Redis queue health

### Hour 9-24: Standard Monitoring
- [ ] Check error logs every 4 hours
- [ ] Monitor user feedback
- [ ] Track failed login patterns
- [ ] Verify no data loss
- [ ] Check backup completion

---

## 🔍 Key Metrics to Watch

### Authentication Metrics
```sql
-- Check failed login attempts
SELECT email, failed_login_attempts, locked_until 
FROM users 
WHERE failed_login_attempts > 0 
ORDER BY failed_login_attempts DESC;

-- Count locked accounts
SELECT COUNT(*) as locked_accounts 
FROM users 
WHERE locked_until > NOW();

-- Recent registrations
SELECT COUNT(*) as new_users 
FROM users 
WHERE created_at > NOW() - INTERVAL '1 hour';
```

### Application Health
```bash
# Backend health
curl http://localhost:3001/api/health

# Response time
curl -w "@-" -o /dev/null -s http://localhost:3001/api/health <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### Database Performance
```sql
-- Slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## 🚨 Alert Thresholds

### Immediate Action Required
- ❌ Backend down (health check fails)
- ❌ Database connection errors
- ❌ 500 error rate > 5%
- ❌ Response time > 5 seconds
- ❌ Cannot login/register

### Investigate Soon
- ⚠️ Failed login rate > 20% of attempts
- ⚠️ 10+ locked accounts
- ⚠️ Error rate > 1%
- ⚠️ Response time > 2 seconds
- ⚠️ Memory usage > 80%

### Monitor
- 📊 Failed login attempts increasing
- 📊 New registrations spike/drop
- 📊 Query execution time increase
- 📊 Redis queue backing up

---

## 🐛 Common Issues & Solutions

### Issue: "Authentication required" on health endpoint
**Solution:** Fixed in this deployment (added public /api/health)
```bash
# Verify fix
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Issue: Users getting locked out unexpectedly
**Check:**
```sql
SELECT email, failed_login_attempts, locked_until 
FROM users 
WHERE locked_until > NOW();
```
**Solution:** Reset lockout manually if legitimate user
```sql
UPDATE users 
SET failed_login_attempts = 0, locked_until = NULL 
WHERE email = 'user@example.com';
```

### Issue: Rate limiting too aggressive
**Symptoms:** Legitimate users getting 429 errors
**Solution:** Adjust in `backend/src/routes/auth.routes.ts`:
```typescript
// Current: 5 attempts per 15 minutes
// Consider: 10 attempts per 15 minutes for testing
windowMs: 15 * 60 * 1000,
max: 10  // Increase if needed
```

### Issue: User can see other users' data
**This is critical - investigate immediately:**
```bash
# Run isolation test
./test-user-isolation.sh

# Check query controller
grep "WHERE.*user_id" backend/src/controllers/query.controller.ts
```

---

## 📋 Rollback Procedure

### If Critical Issues Found:

1. **Immediate Rollback**
```bash
# Stop services
pkill -f nodemon
pkill -f "npm run dev"

# Revert code
git revert HEAD --no-edit
git push origin main

# Restore database (if needed)
PGPASSWORD=sqlquery_pass psql -h localhost -U sqlquery_user -d sqlquery_db < backup_pre_deployment.sql

# Restart services
cd backend && npm run dev &
```

2. **Notify Users**
- Post status update
- Explain issue found
- Provide timeline for resolution

3. **Document Issues**
- What went wrong
- Why it wasn't caught
- How to prevent next time

---

## ✅ Success Criteria (After 24 Hours)

- [ ] No critical errors in logs
- [ ] Authentication working for all users
- [ ] User isolation confirmed working
- [ ] No data loss or corruption
- [ ] Failed login tracking working
- [ ] Account lockout working correctly
- [ ] Rate limiting not blocking legitimate users
- [ ] All scheduled queries running
- [ ] No performance degradation
- [ ] Positive or neutral user feedback

---

## 📝 Post-Deployment Report Template

After 24 hours, document:

```markdown
## Deployment Report: User Isolation & Security Hardening

**Deployment Date:** [Date]
**Monitoring Period:** 24 hours

### Metrics
- Total API requests: [count]
- Error rate: [percentage]
- Failed login attempts: [count]
- Locked accounts: [count]
- New registrations: [count]
- Average response time: [ms]

### Issues Found
1. [Issue description]
   - Impact: [High/Medium/Low]
   - Resolution: [What was done]

### User Feedback
- [Summary of user reports]

### Performance Impact
- CPU: [Before vs After]
- Memory: [Before vs After]
- Response time: [Before vs After]

### Recommendations
1. [Any adjustments needed]
2. [Future improvements]

### Conclusion
✅ Deployment successful / ⚠️ Issues found / ❌ Rollback required
```

---

## 🔗 Useful Commands Reference

```bash
# Check backend status
lsof -i:3001

# View recent errors
tail -100 /tmp/backend.log | grep -i error

# Test health endpoint
watch -n 5 'curl -s http://localhost:3001/api/health | jq'

# Monitor database
PGPASSWORD=sqlquery_pass psql -h localhost -U sqlquery_user -d sqlquery_db \
  -c "SELECT NOW(), count(*) FROM pg_stat_activity;"

# Check Redis
redis-cli ping

# Monitor Docker containers
watch -n 5 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

---

**Remember:** This is a production system with live users. Better to be overly cautious than to miss a critical issue.

**On-Call Contact:** [Your contact info]
**Escalation:** [Manager/Team lead contact]

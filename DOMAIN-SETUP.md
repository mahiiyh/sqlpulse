# SQLPulse Domain Setup Guide

## Current Status
- ✅ Frontend deployed: https://sqlpulse.pages.dev
- ✅ Backend deployed: https://backend-production-1cc3.up.railway.app
- ⏳ Domain registered: sqlpulse.io (pending nameserver setup)

## Step 1: Fix Nameservers (CRITICAL - Do This First!)

### 1.1 Get Cloudflare Nameservers
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **sqlpulse.io**
3. Go to **DNS** tab or **Overview** page
4. Find your assigned nameservers (looks like):
   ```
   name1.cloudflare.com
   name2.cloudflare.com
   ```

### 1.2 Update at Your Domain Registrar
1. Log into where you bought sqlpulse.io
2. Find **Nameservers** or **DNS Management**
3. Change from default to **Custom Nameservers**
4. Enter both Cloudflare nameservers
5. Save changes
6. **Wait**: 15min-24hrs for propagation

### 1.3 Verify Status
- Return to Cloudflare Dashboard
- Wait for status to change from "Invalid nameservers" to "Active"
- You'll receive an email when it's ready

---

## Step 2: Connect sqlpulse.io to Cloudflare Pages

### 2.1 Add Custom Domain to Frontend
1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** → Your project (sqlpulse frontend)
3. Go to **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `sqlpulse.io`
6. Click **Continue**
7. Cloudflare will automatically add DNS records ✅

### 2.2 Add www Subdomain (Optional)
1. Same process, enter: `www.sqlpulse.io`
2. Cloudflare adds CNAME record automatically
3. Redirects www → sqlpulse.io

---

## Step 3: Configure Backend Subdomain (api.sqlpulse.io)

### 3.1 Add DNS Record for API
1. In Cloudflare Dashboard → sqlpulse.io → **DNS**
2. Click **Add record**
3. Configure:
   ```
   Type: CNAME
   Name: api
   Target: backend-production-1cc3.up.railway.app
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```
4. Click **Save**

### 3.2 Add Custom Domain in Railway
1. Go to [Railway Dashboard](https://railway.app/)
2. Click your backend project
3. Go to **Settings** → **Networking**
4. Click **Add Custom Domain**
5. Enter: `api.sqlpulse.io`
6. Railway will verify DNS (takes 1-5 minutes)
7. SSL certificate auto-generated ✅

---

## Step 4: Update Frontend API URL

### 4.1 Update GitHub Secrets
1. Go to: https://github.com/mahiiyh/sqlpulse/settings/secrets/actions
2. Edit `VITE_API_URL`
3. Change value to: `https://api.sqlpulse.io/api`
4. Save

### 4.2 Update Cloudflare Pages Environment Variable
1. Cloudflare Pages Dashboard → Your project
2. Go to **Settings** → **Environment variables**
3. Add/Update:
   ```
   VITE_API_URL = https://api.sqlpulse.io/api
   ```
4. Save and redeploy

### 4.3 Commit & Push (Optional - for local builds)
Update `.env.example` files to document the new URL:
```bash
# frontend/.env.example
VITE_API_URL=https://api.sqlpulse.io/api
```

---

## Step 5: Test & Verify

### 5.1 Check DNS Propagation
```bash
# Check if DNS is resolving
dig sqlpulse.io
dig api.sqlpulse.io

# Or use online tool
# https://www.whatsmydns.net/#A/sqlpulse.io
```

### 5.2 Test Frontend
1. Visit: https://sqlpulse.io
2. Should load landing page ✅
3. Click "Get Started" → Login page
4. No "https" warnings ✅

### 5.3 Test Backend API
```bash
# Test API endpoint
curl https://api.sqlpulse.io/api/health

# Should return: {"status":"ok"}
```

### 5.4 Test Login
1. Go to: https://sqlpulse.io/login
2. Enter credentials: `admin@example.com` / `admin123`
3. Should redirect to dashboard ✅
4. Check browser console - no CORS errors ✅

---

## Troubleshooting

### ❌ "Invalid nameservers" persists
**Solution**: Wait 24 hours or contact your domain registrar to verify nameserver change was saved

### ❌ DNS not resolving
**Solution**: 
```bash
# Clear DNS cache (Mac)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Wait 5-10 minutes and try again
```

### ❌ CORS errors on login
**Solution**: Backend needs to allow https://sqlpulse.io origin
1. Check backend CORS configuration
2. Add `https://sqlpulse.io` to allowed origins
3. Redeploy backend

### ❌ SSL certificate errors
**Solution**: Wait 5-10 minutes for Cloudflare to issue certificate automatically

### ❌ 404 on refresh
**Solution**: Cloudflare Pages should handle this automatically via `_redirects` or SPA config

---

## Final Checklist

- [ ] Nameservers updated at registrar
- [ ] Nameserver status shows "Active" in Cloudflare
- [ ] sqlpulse.io added to Cloudflare Pages
- [ ] api.sqlpulse.io DNS record created (CNAME)
- [ ] api.sqlpulse.io added to Railway
- [ ] Frontend VITE_API_URL updated to https://api.sqlpulse.io/api
- [ ] Frontend redeployed with new API URL
- [ ] https://sqlpulse.io loads landing page
- [ ] https://sqlpulse.io/login works
- [ ] Login successful and redirects to dashboard
- [ ] No SSL warnings or CORS errors

---

## Timeline Estimates

| Task | Time |
|------|------|
| Update nameservers | 5 minutes |
| DNS propagation | 15min - 24hrs |
| Add domain to Cloudflare Pages | 2 minutes |
| Configure backend subdomain | 5 minutes |
| Update environment variables | 5 minutes |
| SSL certificate provisioning | 5-10 minutes |
| **Total** | ~30 minutes + propagation wait |

---

## Support

- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Railway Docs: https://docs.railway.app/reference/custom-domains
- DNS Propagation Checker: https://www.whatsmydns.net/

## Quick Reference

**Current URLs:**
- Frontend (temp): https://sqlpulse.pages.dev
- Backend (temp): https://backend-production-1cc3.up.railway.app

**Target URLs:**
- Frontend: https://sqlpulse.io
- Backend: https://api.sqlpulse.io
- API Base: https://api.sqlpulse.io/api

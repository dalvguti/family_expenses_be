# Quick Fix for ERR_CONNECTION_REFUSED on cPanel

## Immediate Steps to Fix

### 1. Use the Correct Entry File

In cPanel → Setup Node.js App:

**Change this:**
```
Application startup file: server.js ❌
```

**To this:**
```
Application startup file: server-cpanel.js ✅
```

**Why?** `server.js` uses custom ports and HTTPS which cPanel doesn't support. `server-cpanel.js` is configured specifically for cPanel.

### 2. Remove PORT Environment Variable

In cPanel → Setup Node.js App → Environment variables:

**Remove or don't set:**
```
PORT=5000 ❌
HTTPS_PORT=5443 ❌
USE_HTTPS=true ❌
```

**Why?** cPanel automatically assigns a port and handles it via reverse proxy.

### 3. Set These Environment Variables Only

```
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_database_name
DB_USER=your_cpanel_database_user
DB_PASSWORD=your_database_password
```

### 4. Restart the Application

1. Click "Stop Application"
2. Wait 5 seconds
3. Click "Start Application"
4. Check status shows "Running"

### 5. Test the API

Replace with your actual domain:

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Or open in browser
https://yourdomain.com/api/health
```

## If Still Not Working

### Check 1: Application is Running

- Go to cPanel → Setup Node.js App
- Status should be green "Running"
- If red/stopped, check error logs at bottom

### Check 2: Application URL is Correct

**Your configuration should show:**
```
Application URL: yourdomain.com/api
or
Application URL: api.yourdomain.com
```

**Must match how you're accessing it:**
```
Accessing: https://yourdomain.com/api/health
Then Application URL: yourdomain.com/api ✅

Accessing: https://api.yourdomain.com/api/health
Then Application URL: api.yourdomain.com ✅
```

### Check 3: Dependencies Are Installed

In cPanel → Setup Node.js App:
1. Click "Run NPM Install" button
2. Wait for it to complete
3. Restart application

### Check 4: Database Credentials

**Common mistake:** Forgetting cPanel username prefix

**Wrong:**
```env
DB_NAME=family_expenses ❌
DB_USER=appuser ❌
```

**Correct (with cPanel prefix):**
```env
DB_NAME=cpanelusername_family_expenses ✅
DB_USER=cpanelusername_appuser ✅
```

**How to find your prefix:**
- Go to cPanel → MySQL Databases
- Your database name shown will include the prefix
- Example: `myuser_family_expenses` → prefix is `myuser_`

### Check 5: View Application Logs

In cPanel Node.js App interface:
1. Scroll to bottom
2. Click "Show Logs" or check the log section
3. Look for error messages

**Common errors:**

```
"Cannot find module" → Run NPM Install
"ECONNREFUSED" to MySQL → Check DB credentials
"EADDRINUSE" → App may already be running, restart it
"ER_ACCESS_DENIED" → Wrong database password
```

## Most Common Solution

**The #1 fix for ERR_CONNECTION_REFUSED:**

1. **Change startup file to `server-cpanel.js`**
2. **Remove PORT environment variable**
3. **Restart application**
4. **Test: `https://yourdomain.com/api/health`**

This solves 90% of cPanel deployment issues!

## Alternative: Use Subdomain (Easier)

Instead of `yourdomain.com/api`, use a subdomain:

1. **Create subdomain in cPanel:**
   - Go to Domains → Subdomains
   - Create: `api.yourdomain.com`
   - Point to your app folder

2. **In Setup Node.js App:**
   ```
   Application URL: api.yourdomain.com
   ```

3. **Install SSL:**
   - cPanel → SSL/TLS Status
   - Run AutoSSL for the subdomain

4. **Test:**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

Subdomains often work better than subdirectories on cPanel!

## Still Having Issues?

**Provide these details:**

1. **Hosting Provider:** _________________
2. **cPanel Version:** _________________
3. **Application Status in cPanel:** Running / Stopped / Error
4. **Error in Logs:** (copy/paste the error)
5. **Application URL configured:** _________________
6. **URL you're trying to access:** _________________
7. **Database host:** localhost / other
8. **Node.js version in cPanel:** _________________

**Common hosting providers and their quirks:**

- **Hostgator:** Usually works well, use subdomain
- **Bluehost:** May need to enable Node.js in hosting settings
- **GoDaddy:** Limited Node.js support, consider alternatives
- **SiteGround:** Good Node.js support, use their guides
- **A2 Hosting:** Excellent Node.js support
- **Namecheap:** Check if your plan supports Node.js apps

## Emergency Workaround

If you need the API working immediately while troubleshooting cPanel:

**Deploy to free hosting temporarily:**

### Railway.app (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd marriage_billing_backend
railway init

# Add MySQL database
railway add

# Deploy
railway up

# Get URL
railway domain
```

### Render.com

1. Push code to GitHub
2. Go to render.com
3. New → Web Service
4. Connect repository
5. Add MySQL database
6. Deploy

Both provide free HTTPS and are Node.js-native!

---

**The key takeaway:** cPanel has specific requirements for Node.js apps. Use `server-cpanel.js`, let cPanel manage ports, and ensure your Application URL configuration matches how you're accessing the API.


# cPanel Deployment - Quick Checklist

**Fix ERR_CONNECTION_REFUSED in 5 minutes!**

## ✅ Step-by-Step Checklist

### Step 1: Upload server-cpanel.js
- [ ] Upload `server-cpanel.js` to your cPanel application folder
- [ ] Ensure it's in the root of your backend folder

### Step 2: Configure Node.js App in cPanel

Go to cPanel → **Setup Node.js App** → Click on your app (or create new)

- [ ] **Application root:** `family-expenses-api` (or your folder name)
- [ ] **Application startup file:** `server-cpanel.js` ✅ (NOT server.js)
- [ ] **Application mode:** Production
- [ ] **Node.js version:** 14.x or higher (latest available)
- [ ] **Application URL:** `yourdomain.com` or `api.yourdomain.com`

### Step 3: Set Environment Variables

In the same Node.js App page, scroll to **Environment variables**:

**Add these (click "Add Variable" for each):**

- [ ] `NODE_ENV` = `production`
- [ ] `DB_HOST` = `localhost`
- [ ] `DB_PORT` = `3306`
- [ ] `DB_NAME` = `your_cpanel_db_name` (with cPanel prefix!)
- [ ] `DB_USER` = `your_cpanel_db_user` (with cPanel prefix!)
- [ ] `DB_PASSWORD` = `your_db_password`

**OPTIONAL (HTTPS - usually not needed):**
- [ ] `USE_HTTPS` = `false` (Leave disabled - cPanel handles SSL by default)
- [ ] `HTTPS_PORT` = `5443` (Only if using direct HTTPS)
- [ ] `SSL_CERT_PATH` = `/path/to/cert.crt` (Only if using direct HTTPS)
- [ ] `SSL_KEY_PATH` = `/path/to/key.key` (Only if using direct HTTPS)

**⚠️ Important:**
- Most cPanel setups handle SSL at Apache/nginx level - you DON'T need to enable HTTPS in Node.js
- Only set USE_HTTPS=true if your hosting provider specifically requires it
- Default is recommended: Let cPanel handle SSL (USE_HTTPS=false or not set)

**Click "Save" after adding all variables**

### Step 4: Verify Database

Go to cPanel → **MySQL Databases**:

- [ ] Database exists (note the full name with prefix)
- [ ] User exists (note the full name with prefix)
- [ ] User has "All Privileges" on the database

**Copy the exact database name and user name shown in cPanel!**

Example:
```
Database: myusername_family_expenses
User: myusername_appuser
```

### Step 5: Install Dependencies

In Setup Node.js App page:

- [ ] Click **"Run NPM Install"** button
- [ ] Wait until it says "Completed" (may take 2-3 minutes)
- [ ] Check for any error messages

### Step 6: Start/Restart Application

- [ ] Click **"Stop Application"** (if running)
- [ ] Wait 5 seconds
- [ ] Click **"Start Application"**
- [ ] Status should show **"Running"** in green

### Step 7: Check Logs

Scroll to bottom of the Node.js App page:

- [ ] Look for "Server is running on port X"
- [ ] Look for "MySQL Connected"
- [ ] Check for any red error messages

**If you see errors, note them down!**

### Step 8: Test Your API

**Replace `yourdomain.com` with your actual domain:**

```bash
# Option 1: Use browser
https://yourdomain.com/api/health

# Option 2: Use curl
curl https://yourdomain.com/api/health
```

**Expected result:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "MySQL"
}
```

## ✅ If It Works Now

Update your frontend API URL:

**File:** `marriage_billing/src/services/api.js`

```javascript
const API_BASE_URL = 'https://yourdomain.com/api';
```

Then rebuild and redeploy your frontend!

## ❌ If Still Not Working

### Most Likely Issues:

#### Issue A: Wrong Application Startup File
**Fix:** Change to `server-cpanel.js` in cPanel settings

#### Issue B: Database Connection Failed
**Symptoms:** App starts but API returns database errors

**Check:**
1. Database name includes cPanel username prefix
2. User name includes cPanel username prefix
3. Password is correct
4. User has privileges on the database

**Test database connection:**
```bash
# In cPanel Terminal or SSH
mysql -u your_cpanel_db_user -p -h localhost
# Enter password
# If it connects, credentials are correct
```

#### Issue C: Application URL Mismatch
**Fix:** Make sure Application URL in cPanel matches your domain exactly

**Examples:**
```
Correct configurations:
Application URL: api.yourdomain.com
Access at: https://api.yourdomain.com/api/health

Application URL: yourdomain.com/api  
Access at: https://yourdomain.com/api/health

Application URL: yourdomain.com
Access at: https://yourdomain.com/api/health
```

#### Issue D: SSL Not Configured
**Fix:** Install SSL certificate

1. Go to cPanel → SSL/TLS Status
2. Click "Run AutoSSL" or install Let's Encrypt
3. Wait for SSL to be issued
4. Test with `https://` (not `http://`)

#### Issue E: Node.js Not Supported by Your Plan
**Symptoms:** Can't find "Setup Node.js App" in cPanel

**Solutions:**
1. Contact hosting provider to enable Node.js
2. Upgrade to a plan that supports Node.js
3. Use alternative hosting (Railway, Render, Heroku)

## Quick Test Script

Save this as `test-connection.js` in your backend folder:

```javascript
// test-connection.js
require('dotenv').config();

console.log('Testing configuration...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Database connection successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

Run it in cPanel Terminal:
```bash
cd ~/family-expenses-api
node test-connection.js
```

## Need More Help?

**Share these details:**

1. Screenshot of your cPanel Node.js App configuration
2. Error messages from the application logs
3. Your hosting provider name
4. The exact URL you're trying to access
5. Database credentials format (with sensitive parts hidden)

**Quick support:**
- Full guide: `CPANEL_DEPLOYMENT_GUIDE.md`
- Troubleshooting: See application logs in cPanel

---

**90% of issues are fixed by:**
1. Using `server-cpanel.js` as startup file
2. Not setting PORT environment variable
3. Using correct database names (with cPanel prefix)


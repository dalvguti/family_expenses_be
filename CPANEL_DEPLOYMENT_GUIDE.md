# cPanel Deployment Guide for Node.js API

## ⚠️ Common Issue: ERR_CONNECTION_REFUSED

This error typically occurs when:
1. The Node.js app isn't properly configured in cPanel
2. The port binding is incorrect
3. The application URL is misconfigured
4. The app startup failed

## Step-by-Step cPanel Deployment

### Prerequisites

1. **Check cPanel Node.js Support:**
   - Log in to cPanel
   - Look for "Setup Node.js App" in Software section
   - If not available, contact your hosting provider

2. **Check Node.js Version:**
   - Your app requires Node.js v14 or higher
   - Verify cPanel supports this version

### Step 1: Upload Your Application

#### Option A: File Manager

1. **Compress your backend folder:**
   ```bash
   # On your local machine, exclude node_modules
   # Create a zip without node_modules and .env
   ```

2. **Upload to cPanel:**
   - Go to cPanel → File Manager
   - Navigate to your desired directory (e.g., `~/family-expenses-api`)
   - Upload and extract the zip file

#### Option B: Git (Recommended)

1. **In cPanel Git Version Control:**
   - Go to cPanel → Git Version Control
   - Clone your repository
   - Or create repo and push your code

2. **Or use SSH/Terminal:**
   ```bash
   cd ~/
   git clone your-repo-url family-expenses-api
   cd family-expenses-api
   ```

### Step 2: Set Up Node.js Application in cPanel

1. **Go to "Setup Node.js App":**
   - Find it in cPanel Software section

2. **Create Application:**
   - Click "Create Application"

3. **Configure Application Settings:**
   ```
   Node.js version: 14.x or higher (latest available)
   Application mode: Production
   Application root: family-expenses-api (or your folder name)
   Application URL: api.yourdomain.com or yourdomain.com/api
   Application startup file: server-cpanel.js (or server.js)
   ```

4. **Important Settings:**
   - **Application root:** Path to your backend folder
   - **Application startup file:** `server-cpanel.js` (use the cPanel-specific version)
   - **Application URL:** The subdomain or path where API will be accessible

### Step 3: Configure Environment Variables

In the cPanel Node.js App interface:

1. **Scroll to "Environment variables" section**

2. **Add these variables:**
   ```
   NODE_ENV=production
   
   DB_HOST=localhost (or your cPanel MySQL host)
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_cpanel_mysql_user
   DB_PASSWORD=your_mysql_password
   
   # Port is usually auto-assigned by cPanel
   # Don't set PORT unless instructed
   ```

3. **Click "Save"**

### Step 4: Set Up MySQL Database

1. **Create Database:**
   - Go to cPanel → MySQL Databases
   - Create new database (e.g., `cpanel_user_family_expenses`)
   - Note: cPanel prefixes database names with your username

2. **Create Database User:**
   - Create new MySQL user
   - Set a strong password
   - Note: cPanel prefixes usernames with your username

3. **Grant Privileges:**
   - Add user to database
   - Grant "All Privileges"

4. **Note Credentials:**
   ```
   DB_HOST: localhost (or provided hostname)
   DB_NAME: cpanel_user_family_expenses (with prefix)
   DB_USER: cpanel_user_appuser (with prefix)
   DB_PASSWORD: your_password
   ```

### Step 5: Install Dependencies

In cPanel Node.js App interface:

1. **Click "Run NPM Install"** button
   - This installs all dependencies from package.json
   - Wait for it to complete (may take a few minutes)

2. **Or use Terminal (if available):**
   ```bash
   cd ~/family-expenses-api
   npm install --production
   ```

### Step 6: Start the Application

1. **In cPanel Node.js App:**
   - Click "Start Application" or "Restart Application"
   - Check the status - should show "Running"

2. **Check Logs:**
   - View application logs for any errors
   - Look for "Server is running on port X"

### Step 7: Test Your API

1. **Test the health endpoint:**
   ```bash
   curl https://yourdomain.com/api/health
   # or
   curl https://api.yourdomain.com/api/health
   ```

2. **Expected Response:**
   ```json
   {
     "status": "OK",
     "message": "Server is running",
     "database": "MySQL"
   }
   ```

## Troubleshooting ERR_CONNECTION_REFUSED

### Issue 1: Application Not Started

**Check:**
- Go to cPanel → Setup Node.js App
- Verify app status is "Running"
- If "Stopped", click "Start Application"

**Solution:**
```bash
# In cPanel Terminal or SSH
cd ~/family-expenses-api
npm install
# Then restart app in cPanel interface
```

### Issue 2: Wrong Port Configuration

**Problem:** cPanel assigns a random port and uses reverse proxy

**Solution:**
- ✅ Use `server-cpanel.js` instead of `server.js`
- ✅ DON'T hardcode ports in your app
- ✅ Use `process.env.PORT` (cPanel sets this automatically)
- ✅ Listen on `0.0.0.0` not `localhost`

**Update your package.json:**
```json
{
  "scripts": {
    "start": "node server-cpanel.js"
  }
}
```

### Issue 3: Application URL Misconfigured

**Check:**
- In cPanel Node.js App settings
- Verify "Application URL" matches your domain/subdomain

**Common configurations:**
```
Option 1: Subdomain
Application URL: api.yourdomain.com

Option 2: Subdirectory
Application URL: yourdomain.com/api

Option 3: Main domain
Application URL: yourdomain.com
```

### Issue 4: Firewall or Security

**cPanel may block:**
- External database connections
- Certain ports
- Outbound connections

**Solutions:**
- Use `localhost` for database (same server)
- Don't specify custom ports
- Check with hosting provider about firewall rules

### Issue 5: Dependencies Not Installed

**Symptoms:**
- App won't start
- Error in logs about missing modules

**Solution:**
```bash
# SSH or Terminal in cPanel
cd ~/family-expenses-api
rm -rf node_modules package-lock.json
npm install --production
```

Then restart app in cPanel interface.

### Issue 6: Database Connection Failed

**Check:**
- Database exists and is accessible
- Username/password are correct (with cPanel prefix)
- Database host is correct (usually `localhost`)

**Test connection:**
```bash
# In cPanel Terminal
mysql -u your_cpanel_db_user -p -h localhost
# Enter password when prompted
```

**Update .env or cPanel environment variables:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpanel_user_family_expenses
DB_USER=cpanel_user_appuser
DB_PASSWORD=your_actual_password
```

### Issue 7: .htaccess Configuration

If using subdirectory (e.g., yourdomain.com/api):

**Create/update .htaccess in public_html:**
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://127.0.0.1:CPANEL_PORT/api/$1 [P,L]
```

Replace `CPANEL_PORT` with the actual port shown in cPanel Node.js App interface.

### Issue 8: Application Logs Show Errors

**View logs in cPanel:**
1. Setup Node.js App → Your App
2. Scroll to bottom for error logs
3. Look for specific error messages

**Common errors and solutions:**

**"Cannot find module":**
```bash
npm install --production
```

**"EADDRINUSE":**
- Port already in use
- Restart the app in cPanel

**"ER_ACCESS_DENIED":**
- Wrong database credentials
- Update environment variables

**"MODULE_NOT_FOUND":**
- Missing dependencies
- Run `npm install`

## cPanel-Specific Configuration

### File Structure for cPanel

```
~/family-expenses-api/
├── server-cpanel.js      ← Use this as entry point
├── server.js             ← Keep for local development
├── package.json
├── controllers/
├── models/
├── routes/
├── config/
└── node_modules/
```

### Recommended package.json Scripts

```json
{
  "scripts": {
    "start": "node server-cpanel.js",
    "start:local": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Environment Variables in cPanel

**In Setup Node.js App → Environment variables:**

```
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_user_dbname
DB_USER=your_cpanel_user_dbuser
DB_PASSWORD=your_db_password
```

**Important Notes:**
- ❌ Don't set `PORT` - cPanel assigns this automatically
- ❌ Don't use `USE_HTTPS=true` - cPanel handles SSL
- ✅ Use your cPanel-provided database credentials
- ✅ Database names include your cPanel username prefix

## Alternative: Using Passenger

Some cPanel hosts use Passenger instead of native Node.js setup.

### Create passenger_start.js

```javascript
const app = require('./server-cpanel.js');
// Passenger will handle the port automatically
```

### Create .htaccess

```apache
PassengerEnabled On
PassengerAppType node
PassengerStartupFile server-cpanel.js
```

## DNS and Domain Configuration

### Option 1: Subdomain (Recommended)

1. **Create subdomain in cPanel:**
   - Go to Domains → Subdomains
   - Create: `api.yourdomain.com`
   - Document Root: `/home/username/family-expenses-api`

2. **Configure Node.js App:**
   - Application URL: `api.yourdomain.com`

3. **SSL Certificate:**
   - Go to SSL/TLS Status
   - Install SSL for subdomain (Let's Encrypt)

### Option 2: Subdirectory

1. **Application URL:** `yourdomain.com/api`

2. **Update .htaccess in public_html:**
   ```apache
   RewriteEngine On
   RewriteRule ^api/(.*)$ /[path-to-node-app]/server-cpanel.js/$1 [L]
   ```

## Testing the Deployment

### 1. Check Application Status

In cPanel → Setup Node.js App:
- Status should be "Running" (green)
- Note the assigned port (for reference only)

### 2. Test Endpoints

```bash
# Health check
curl https://yourdomain.com/api/health

# List users
curl https://yourdomain.com/api/users

# Check if database is connected
# Should return data, not connection errors
```

### 3. Check Application Logs

In cPanel Node.js App interface:
- Scroll to "Logs" section
- Look for startup messages
- Check for any error messages

### 4. Common Success Indicators

**Console output should show:**
```
Server is running on port [assigned_port]
Environment: production
MySQL Connected: localhost
Database synchronized
Database: MySQL
```

## Quick Fixes Checklist

- [ ] Application status is "Running" in cPanel
- [ ] Dependencies installed (`node_modules` exists)
- [ ] Environment variables set in cPanel (not .env file)
- [ ] Database exists and credentials are correct
- [ ] Application URL matches your domain/subdomain
- [ ] Using `server-cpanel.js` as startup file
- [ ] SSL certificate installed for your domain
- [ ] Not trying to use custom ports (5000, 5443)

## Performance Optimization for cPanel

### 1. Use Production Mode

```env
NODE_ENV=production
```

### 2. Optimize Database Queries

Already configured with connection pooling in `config/database.js`

### 3. Enable Compression

The app already uses Express, consider adding compression:

```bash
npm install compression
```

Then in server-cpanel.js:
```javascript
const compression = require('compression');
app.use(compression());
```

### 4. Set Memory Limits (if cPanel allows)

In Node.js App settings:
```
Memory limit: 512 (or as allowed by your plan)
```

## Security for Production

### 1. Environment Variables

✅ Set in cPanel interface (not .env file)
✅ Never commit credentials to Git

### 2. CORS Configuration

Update for your specific domain:

```javascript
// In server-cpanel.js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

### 3. Database Security

- ✅ Use strong passwords
- ✅ Limit database user privileges
- ✅ Use cPanel's remote MySQL only if needed

### 4. HTTPS/SSL

- ✅ Install SSL certificate in cPanel
- ✅ Force HTTPS in your domain settings
- ✅ cPanel handles SSL termination automatically

## Frontend Configuration Update

After successful deployment, update your frontend:

**File:** `marriage_billing/src/services/api.js`

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com/api';
```

Or if using subdirectory:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://yourdomain.com/api';
```

## Alternative Hosting Solutions

If cPanel continues to have issues, consider these alternatives:

### 1. Heroku (Free Tier Available)
- Better Node.js support
- Automatic deployments
- Built-in MySQL add-ons

### 2. Railway (Free Tier Available)
- Excellent Node.js support
- Automatic SSL
- Easy database setup

### 3. Render (Free Tier Available)
- Native Node.js support
- Automatic deployments from Git
- Free PostgreSQL/MySQL

### 4. DigitalOcean App Platform
- $5/month for basic apps
- Full Node.js support
- Managed databases available

### 5. AWS Elastic Beanstalk
- Scalable solution
- Full control
- Free tier available

## Getting Help from Your Hosting Provider

If still having issues, contact support with:

```
Subject: Node.js Application ERR_CONNECTION_REFUSED

Details:
- Application type: Node.js Express API
- Entry file: server-cpanel.js
- Dependencies: Express, MySQL2, Sequelize, CORS
- Node.js version needed: 14+
- Error: ERR_CONNECTION_REFUSED when accessing API

Question: 
How should I configure the Node.js application to work with your cPanel setup?
Do I need to use a specific port or configuration?
Is there a specific Application URL format I should use?
```

## Diagnostic Commands

If you have SSH access:

```bash
# Check if Node.js is available
node --version

# Check if app files exist
ls -la ~/family-expenses-api

# Check if dependencies are installed
ls -la ~/family-expenses-api/node_modules

# Try running manually (troubleshooting)
cd ~/family-expenses-api
node server-cpanel.js
# Press Ctrl+C to stop

# Check running Node processes
ps aux | grep node

# Check if MySQL is accessible
mysql -u your_user -p -h localhost
```

## Final Checklist

### Before Contacting Support

- [ ] Node.js App is created in cPanel
- [ ] Application status shows "Running"
- [ ] All environment variables are set
- [ ] MySQL database exists with correct credentials
- [ ] Dependencies installed (node_modules folder exists)
- [ ] Using server-cpanel.js as startup file
- [ ] Application URL matches your intended domain
- [ ] SSL certificate is installed
- [ ] Checked application logs for specific errors

### If Still Not Working

**Most likely causes on cPanel:**

1. **Hosting plan doesn't support Node.js apps**
   - Solution: Upgrade plan or switch to Node.js-friendly host

2. **Port configuration mismatch**
   - Solution: Let cPanel assign port automatically (don't set PORT env var)

3. **Application URL not properly routed**
   - Solution: Use subdomain instead of subdirectory

4. **Database connection refused**
   - Solution: Use `localhost` not `127.0.0.1` or external IP

5. **Permissions issues**
   - Solution: Set proper file permissions (755 for directories, 644 for files)

## Recommended cPanel Setup (Simplified)

**Best practice for cPanel:**

1. **Use subdomain:** `api.yourdomain.com`
2. **Let cPanel manage ports** - Don't set PORT
3. **Use server-cpanel.js** - Simplified version without HTTPS
4. **Set all config in cPanel** - Not in .env file
5. **Install SSL via cPanel** - Let's Encrypt AutoSSL
6. **Monitor via cPanel interface** - Check logs regularly

## Quick Fix for ERR_CONNECTION_REFUSED

**Try these in order:**

1. **Restart the application:**
   - cPanel → Setup Node.js App → Click "Restart"

2. **Reinstall dependencies:**
   - Click "Run NPM Install"
   - Wait for completion
   - Restart app

3. **Check application URL:**
   - Should match exactly what you're trying to access
   - Include protocol (http/https)

4. **Verify domain DNS:**
   - Subdomain may take time to propagate
   - Test with main domain first

5. **Check startup file:**
   - Use `server-cpanel.js`
   - Not `server.js` (that's for local dev with HTTPS)

6. **Review error logs:**
   - Check cPanel Node.js App logs
   - Look for specific error messages

7. **Contact hosting support:**
   - They can check if Node.js apps are properly enabled
   - They can verify your configuration

## Success Indicators

When properly deployed, you should see:

**In cPanel Node.js App:**
- ✅ Status: Running
- ✅ No errors in logs
- ✅ Port assigned (automatic)

**When testing API:**
- ✅ `curl https://yourdomain.com/api/health` returns JSON
- ✅ No connection refused errors
- ✅ Database queries work

**Application logs show:**
- ✅ "Server is running on port X"
- ✅ "MySQL Connected: localhost"
- ✅ "Environment: production"

---

**Need more help?** Share:
1. Your cPanel hosting provider name
2. Error messages from cPanel logs
3. Screenshots of your Node.js App configuration
4. The exact URL you're trying to access


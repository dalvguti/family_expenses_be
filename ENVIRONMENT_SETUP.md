# Environment Setup for Backend (MySQL)

## Required Environment Variables

Create a `.env` file in the root of the `marriage_billing_backend` directory with the following variables:

```env
PORT=5000
NODE_ENV=development

# HTTPS Configuration (Optional)
USE_HTTPS=false
HTTPS_PORT=5443
SSL_CERT_PATH=./certs/server.crt
SSL_KEY_PATH=./certs/server.key

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=root
DB_PASSWORD=your_password_here
```

## Environment Variable Descriptions

### PORT
- **Type:** Number
- **Default:** 5000
- **Description:** The port on which the HTTP server will run
- **Example:** `PORT=5000`

### NODE_ENV
- **Type:** String
- **Default:** development
- **Options:** `development`, `production`, `test`
- **Description:** Environment mode for the application

### HTTPS Configuration

#### USE_HTTPS
- **Type:** Boolean
- **Default:** false
- **Description:** Enable/disable HTTPS server
- **Example:** `USE_HTTPS=true`
- **Note:** When enabled, both HTTP and HTTPS servers will run simultaneously

#### HTTPS_PORT
- **Type:** Number
- **Default:** 5443
- **Description:** The port on which the HTTPS server will run
- **Example:** `HTTPS_PORT=5443` or `HTTPS_PORT=443` (requires admin privileges)

#### SSL_CERT_PATH
- **Type:** String
- **Default:** `./certs/server.crt`
- **Description:** Path to SSL certificate file
- **Example:** `SSL_CERT_PATH=/path/to/certificate.crt`

#### SSL_KEY_PATH
- **Type:** String
- **Default:** `./certs/server.key`
- **Description:** Path to SSL private key file
- **Example:** `SSL_KEY_PATH=/path/to/private.key`

### MySQL Configuration

#### DB_HOST
- **Type:** String
- **Default:** localhost
- **Description:** MySQL server host address

**Options:**

**Local MySQL:**
```env
DB_HOST=localhost
```

**Remote MySQL:**
```env
DB_HOST=192.168.1.100
```

**Cloud MySQL (e.g., PlanetScale, AWS RDS):**
```env
DB_HOST=your-mysql-host.cloud.com
```

#### DB_PORT
- **Type:** Number
- **Default:** 3306
- **Description:** MySQL server port
- **Example:** `DB_PORT=3306`

#### DB_NAME
- **Type:** String
- **Default:** family_expenses
- **Description:** Name of the MySQL database
- **Example:** `DB_NAME=family_expenses`

#### DB_USER
- **Type:** String
- **Default:** root
- **Description:** MySQL username
- **Example:** `DB_USER=root` or `DB_USER=family_app`

#### DB_PASSWORD
- **Type:** String
- **Default:** (empty)
- **Description:** MySQL user password
- **Example:** `DB_PASSWORD=your_secure_password`

## MySQL Setup

### Option A: Local MySQL Installation

#### Windows

1. **Download MySQL:**
   - Visit https://dev.mysql.com/downloads/installer/
   - Download MySQL Installer
   - Run the installer and choose "Developer Default"

2. **During Installation:**
   - Set root password (remember this!)
   - Keep default port 3306
   - Configure Windows Service to start automatically

3. **Create Database:**
   ```bash
   # Open MySQL Command Line Client
   mysql -u root -p
   ```
   
   ```sql
   CREATE DATABASE family_expenses;
   SHOW DATABASES;
   EXIT;
   ```

4. **Start MySQL Service:**
   ```bash
   # As Administrator
   net start MySQL80
   ```

#### macOS

1. **Install with Homebrew:**
   ```bash
   brew install mysql
   ```

2. **Start MySQL:**
   ```bash
   brew services start mysql
   ```

3. **Secure Installation:**
   ```bash
   mysql_secure_installation
   ```

4. **Create Database:**
   ```bash
   mysql -u root -p
   ```
   
   ```sql
   CREATE DATABASE family_expenses;
   ```

#### Linux (Ubuntu/Debian)

1. **Install MySQL:**
   ```bash
   sudo apt update
   sudo apt install mysql-server
   ```

2. **Start MySQL:**
   ```bash
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

3. **Secure Installation:**
   ```bash
   sudo mysql_secure_installation
   ```

4. **Create Database:**
   ```bash
   sudo mysql -u root -p
   ```
   
   ```sql
   CREATE DATABASE family_expenses;
   ```

### Option B: Cloud MySQL (PlanetScale, AWS RDS, etc.)

#### PlanetScale (Free Tier Available)

1. Create account at https://planetscale.com
2. Create a new database
3. Get connection details
4. Update .env:
   ```env
   DB_HOST=your-db.planetscale.cloud
   DB_PORT=3306
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
   ```

#### AWS RDS

1. Create MySQL instance in AWS RDS
2. Note the endpoint URL
3. Update .env with RDS credentials

### Option C: Docker

```bash
# Run MySQL in Docker
docker run -d \
  --name mysql-family-expenses \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=family_expenses \
  mysql:8.0

# Your .env would be:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=root
DB_PASSWORD=your_password
```

## Creating a Dedicated MySQL User (Recommended)

Instead of using root, create a dedicated user:

```sql
-- Connect as root
mysql -u root -p

-- Create user
CREATE USER 'family_app'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON family_expenses.* TO 'family_app'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'family_app'@'localhost';

EXIT;
```

Then update your `.env`:
```env
DB_USER=family_app
DB_PASSWORD=secure_password_here
```

## HTTPS Setup

### Development Environment (Self-Signed Certificates)

For local development, you can generate self-signed SSL certificates:

```bash
# Generate self-signed certificates
npm run generate-certs

# Enable HTTPS in .env
USE_HTTPS=true
HTTPS_PORT=5443
```

**After generating certificates:**

1. Start your server:
   ```bash
   npm start
   ```

2. Access your API:
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:5443`

3. **Browser Security Warning:**
   - Self-signed certificates will show a security warning
   - Click "Advanced" → "Proceed to localhost" (safe for development)
   - This is normal for self-signed certificates

### Production Environment (Valid SSL Certificates)

For production, use certificates from a trusted Certificate Authority (CA):

#### Option A: Let's Encrypt (Free)

```bash
# Install certbot
# Ubuntu/Debian
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update .env
USE_HTTPS=true
HTTPS_PORT=443
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Option B: Cloud Provider Certificates

**AWS Certificate Manager (ACM):**
- Use with Load Balancer or CloudFront
- Certificates managed automatically
- No need to set SSL paths in application

**Cloudflare:**
- Provides SSL/TLS encryption
- Set up in Cloudflare dashboard
- Application can run HTTP behind Cloudflare proxy

**Heroku:**
- Automatic SSL on paid plans
- No additional configuration needed

#### Option C: Purchase SSL Certificate

1. Purchase from provider (DigiCert, Comodo, etc.)
2. Download certificate and private key
3. Upload to your server
4. Update .env with file paths

### Certificate File Permissions (Linux/macOS)

```bash
# Set secure permissions
chmod 600 /path/to/private.key
chmod 644 /path/to/certificate.crt

# Ensure proper ownership
chown root:root /path/to/private.key
chown root:root /path/to/certificate.crt
```

### Testing HTTPS Connection

```bash
# Test HTTPS endpoint
curl -k https://localhost:5443/api/health

# Expected response:
# {"status":"OK","message":"Server is running","database":"MySQL","protocol":"https","secure":true}
```

### HTTPS Best Practices

1. **Never commit certificates to Git:**
   - Already in `.gitignore`
   - Keep private keys secret

2. **Use strong encryption:**
   - Minimum TLS 1.2
   - RSA 2048-bit or higher
   - Self-signed: 4096-bit recommended

3. **Certificate renewal:**
   - Let's Encrypt: Auto-renew every 90 days
   - Purchased: Renew before expiration
   - Set up renewal reminders

4. **Redirect HTTP to HTTPS in production:**
   ```javascript
   // Add to server.js for production
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (!req.secure) {
         return res.redirect('https://' + req.headers.host + req.url);
       }
       next();
     });
   }
   ```

5. **Use reverse proxy for production:**
   - Nginx or Apache for SSL termination
   - Better performance and security
   - Example Nginx config:
     ```nginx
     server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/cert.crt;
       ssl_certificate_key /path/to/key.key;
       
       location / {
         proxy_pass http://localhost:5000;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
       }
     }
     ```

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit .env file:**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Use strong passwords:**
   ```env
   # ❌ Weak
   DB_PASSWORD=123456
   
   # ✅ Strong
   DB_PASSWORD=kJ8#mP2$nQ7@vR5
   ```

3. **Different credentials per environment:**
   - Development: Local MySQL
   - Production: Secure cloud database

4. **Limit user privileges:**
   - Don't use root in production
   - Create users with minimal required permissions

## Verifying Configuration

### Test Database Connection

```bash
# Test MySQL connection
mysql -h localhost -P 3306 -u root -p

# Or with your custom user
mysql -h localhost -P 3306 -u family_app -p
```

### Test Application Connection

```bash
# Start the server
npm run dev

# You should see:
# Server is running on port 5000
# MySQL Connected: localhost
# Database synchronized
# Environment: development
# Database: MySQL
```

## Troubleshooting

### Issue: Access Denied

**Error:** `ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'`

**Solutions:**
1. Verify password is correct
2. Check user exists:
   ```sql
   SELECT user, host FROM mysql.user;
   ```
3. Reset password if needed:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   ```

### Issue: Cannot Connect

**Error:** `ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
1. Ensure MySQL is running:
   ```bash
   # Windows
   net start MySQL80
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mysql
   ```

2. Check if port 3306 is listening:
   ```bash
   # Windows
   netstat -an | findstr 3306
   
   # macOS/Linux
   netstat -an | grep 3306
   ```

### Issue: Database Does Not Exist

**Error:** `ER_BAD_DB_ERROR: Unknown database 'family_expenses'`

**Solution:**
```sql
CREATE DATABASE family_expenses;
```

### Issue: Table Already Exists

**Error:** `ER_TABLE_EXISTS_ERROR`

**Solution:**
- Application uses `sync({ alter: true })` which modifies existing tables
- To start fresh:
  ```sql
  DROP DATABASE family_expenses;
  CREATE DATABASE family_expenses;
  ```

### Issue: Environment Variables Not Loading

**Verify .env file location:**
- Must be in root of `marriage_billing_backend/`
- Must be named exactly `.env`

**Check for syntax errors:**
```env
# ✅ Correct
DB_HOST=localhost

# ❌ Incorrect (spaces around =)
DB_HOST = localhost
```

## Production Deployment

### Heroku with ClearDB/JawsDB

```bash
# Add ClearDB addon
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL

# Parse URL and set env vars
heroku config:set DB_HOST=your-host
heroku config:set DB_USER=your-user
heroku config:set DB_PASSWORD=your-password
heroku config:set DB_NAME=your-database
heroku config:set NODE_ENV=production
```

### Railway

1. Add MySQL service in Railway
2. Copy credentials from Railway dashboard
3. Set environment variables in Railway settings

### AWS

1. Create RDS MySQL instance
2. Configure security groups
3. Set environment variables in deployment platform

## Quick Reference

| Environment | Configuration |
|-------------|--------------|
| Local Development | Local MySQL, root user |
| Staging | Cloud MySQL, dedicated user |
| Production | Cloud MySQL, strict permissions |

### Example Configurations

**Local Development:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=root
DB_PASSWORD=local_dev_password
```

**Cloud Production:**
```env
DB_HOST=prod-mysql.cloud.com
DB_PORT=3306
DB_NAME=family_expenses_prod
DB_USER=prod_app_user
DB_PASSWORD=super_secure_password_here
```

---

**Remember:** Always keep your database credentials secure and never share them publicly! 🔒

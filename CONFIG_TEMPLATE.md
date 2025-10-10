# MySQL Configuration Template

## Quick Setup

### Step 1: Create Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE family_expenses;

-- (Optional) Create dedicated user
CREATE USER 'family_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON family_expenses.* TO 'family_app'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT user FROM mysql.user;

EXIT;
```

### Step 2: Create .env File

Copy this to `marriage_billing_backend/.env` and fill in YOUR credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
# ⚠️ REPLACE THESE WITH YOUR ACTUAL CREDENTIALS ⚠️
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=root
DB_PASSWORD=your_mysql_password_here
```

## Configuration Options

### Local MySQL (Default)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=root
DB_PASSWORD=your_password
```

### Remote MySQL
```env
DB_HOST=192.168.1.100
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=family_app
DB_PASSWORD=secure_password
```

### Cloud MySQL (PlanetScale)
```env
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

### Cloud MySQL (AWS RDS)
```env
DB_HOST=your-instance.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=admin
DB_PASSWORD=your_rds_password
```

### Docker MySQL
```bash
# Run MySQL in Docker
docker run -d \
  --name family-expenses-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=family_expenses \
  -e MYSQL_USER=family_app \
  -e MYSQL_PASSWORD=apppassword \
  mysql:8.0
```

```env
# .env for Docker
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=family_app
DB_PASSWORD=apppassword
```

## Verification

### Test MySQL Connection
```bash
mysql -h localhost -P 3306 -u root -p
```

### Test Application
```bash
# Start backend
npm run dev

# Expected output:
# Server is running on port 5000
# MySQL Connected: localhost
# Database synchronized
# Environment: development
# Database: MySQL
```

### Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","message":"Server is running","database":"MySQL"}
```

### Check Tables
```sql
USE family_expenses;

-- Show all tables
SHOW TABLES;
-- Expected: expenses, users

-- Check expenses structure
DESCRIBE expenses;

-- Check users structure
DESCRIBE users;

-- View data
SELECT * FROM expenses;
SELECT * FROM users;
```

## Common Passwords Issues

### MySQL Root Password Not Set
```bash
# Set or reset root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Forgot MySQL Password
```bash
# Stop MySQL
# Windows: net stop MySQL80
# macOS: brew services stop mysql
# Linux: sudo systemctl stop mysql

# Start in safe mode and reset
# (Search for "reset MySQL root password" for your OS)
```

### Access Denied Error
```sql
-- Check user privileges
SHOW GRANTS FOR 'root'@'localhost';

-- Grant all privileges
GRANT ALL PRIVILEGES ON family_expenses.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Security Best Practices

### 1. Use Strong Passwords
```env
# ❌ Weak
DB_PASSWORD=123456

# ✅ Strong
DB_PASSWORD=kJ8#mP2$nQ7@vR5!eW9
```

### 2. Create Dedicated User (Production)
```sql
-- Don't use root in production
CREATE USER 'prod_app'@'%' IDENTIFIED BY 'very_secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON family_expenses.* TO 'prod_app'@'%';
FLUSH PRIVILEGES;
```

### 3. Restrict Host Access
```sql
-- Only allow localhost
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';

-- Allow specific IP
CREATE USER 'app_user'@'192.168.1.100' IDENTIFIED BY 'password';

-- Allow any host (less secure)
CREATE USER 'app_user'@'%' IDENTIFIED BY 'password';
```

### 4. Never Commit .env
The `.env` file is already in `.gitignore`. Keep it that way!

## Quick Command Reference

```bash
# Start MySQL
# Windows: net start MySQL80
# macOS:   brew services start mysql
# Linux:   sudo systemctl start mysql

# Stop MySQL
# Windows: net stop MySQL80
# macOS:   brew services stop mysql
# Linux:   sudo systemctl stop mysql

# MySQL CLI
mysql -u root -p                          # Connect as root
mysql -h localhost -u root -p             # Specify host
mysql -h localhost -P 3306 -u root -p     # Specify host and port

# Show MySQL version
mysql --version

# Show running processes
# Windows: tasklist | findstr mysql
# macOS:   ps aux | grep mysql
# Linux:   ps aux | grep mysql
```

## Troubleshooting Checklist

- [ ] MySQL is installed
- [ ] MySQL service is running
- [ ] Database 'family_expenses' exists
- [ ] MySQL user exists with correct password
- [ ] User has proper privileges
- [ ] .env file exists in backend root
- [ ] .env has correct credentials
- [ ] Port 3306 is not blocked
- [ ] No firewall blocking connection

---

**Ready to go!** Start your backend with `npm run dev` 🚀


# Family Expense Tracker - Backend API

Backend API for the Family Expense Tracker application built with Node.js, Express, and MySQL.

## Features

- RESTful API for expense management
- User management
- Monthly and yearly reports
- Statistics and analytics
- MySQL database with Sequelize ORM
- HTTPS support with SSL/TLS encryption
- Category management with status tracking

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a MySQL database:
```sql
CREATE DATABASE family_expenses;
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

# HTTPS Configuration (Optional)
USE_HTTPS=false
HTTPS_PORT=5443

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_expenses
DB_USER=root
DB_PASSWORD=your_password_here
```

4. **(Optional) Enable HTTPS for local development:**
```bash
# Generate self-signed certificates
npm run generate-certs

# Then update .env:
USE_HTTPS=true
```

5. Start MySQL server:
```bash
# Windows
net start MySQL80

# macOS/Linux
sudo systemctl start mysql
```

6. Run the server:
```bash
# Development mode (auto-creates tables)
npm run dev

# Production mode
npm start
```

The server will automatically create the necessary tables on first run.

**Access Points:**
- HTTP: `http://localhost:5000/api/health`
- HTTPS (if enabled): `https://localhost:5443/api/health`

## Database Configuration

### Environment Variables

#### Server Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `USE_HTTPS` | Enable HTTPS server | `false` |
| `HTTPS_PORT` | HTTPS server port | `5443` |
| `SSL_CERT_PATH` | SSL certificate path | `./certs/server.crt` |
| `SSL_KEY_PATH` | SSL private key path | `./certs/server.key` |

#### Database Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host address | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `family_expenses` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `` |

### Table Structure

The application will automatically create these tables:

#### expenses
- `id` - INT (Primary Key, Auto Increment)
- `description` - VARCHAR(255)
- `amount` - DECIMAL(10,2)
- `category` - VARCHAR(255)
- `date` - DATETIME
- `paidBy` - VARCHAR(255)
- `createdAt` - DATETIME
- `updatedAt` - DATETIME

#### users
- `id` - INT (Primary Key, Auto Increment)
- `name` - VARCHAR(255)
- `email` - VARCHAR(255) (Unique)
- `role` - ENUM('member', 'admin')
- `createdAt` - DATETIME
- `updatedAt` - DATETIME

## API Endpoints

### Expenses

- `GET /api/expenses` - Get all expenses (supports filtering)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics

#### Query Parameters for GET /api/expenses:
- `category` - Filter by category
- `paidBy` - Filter by person
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `limit` - Limit results
- `sort` - Sort results (e.g., "-date" for descending)

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reports

- `GET /api/reports/monthly?year=2024&month=10` - Get monthly report
- `GET /api/reports/yearly?year=2024` - Get yearly report

### Health Check

- `GET /api/health` - Check server status

## Data Models

### Expense Model
```javascript
{
  id: Integer (auto-generated),
  description: String (required),
  amount: Decimal (required, min: 0),
  category: String (required),
  date: Date (required),
  paidBy: String (required),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### User Model
```javascript
{
  id: Integer (auto-generated),
  name: String (required),
  email: String (required, unique),
  role: Enum ['member', 'admin'],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Success Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

## MySQL Configuration Tips

### Creating a Database User

```sql
-- Create user
CREATE USER 'family_app'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON family_expenses.* TO 'family_app'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

### Connection Pooling

The application uses connection pooling with these settings:
- Max connections: 5
- Min connections: 0
- Acquire timeout: 30 seconds
- Idle timeout: 10 seconds

### Development vs Production

- **Development**: Tables are automatically created/updated (sync with alter)
- **Production**: Use migrations for database changes

## Troubleshooting

### Cannot connect to MySQL

**Error:** `ER_ACCESS_DENIED_ERROR`
- Check DB_USER and DB_PASSWORD in .env
- Verify MySQL user has proper permissions

**Error:** `ECONNREFUSED`
- Ensure MySQL server is running
- Check DB_HOST and DB_PORT values

### Table creation issues

- Ensure the database exists
- Check user has CREATE TABLE privileges
- Review console logs for specific errors

## Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "generate-certs": "node generate-certs.js",
  "seed:categories": "node seedCategories.js",
  "seed:users": "node seedUsers.js",
  "seed:all": "node seedUsers.js && node seedCategories.js"
}
```

## HTTPS Setup

### For Local Development
- **Quick Start:** [HTTPS_SETUP_GUIDE.md](./HTTPS_SETUP_GUIDE.md)
- **Full Documentation:** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

**Quick Setup:**
```bash
npm run generate-certs
# Update .env: USE_HTTPS=true
npm start
```

### For cPanel Deployment
- **cPanel Guide:** [HTTPS_CPANEL_GUIDE.md](./HTTPS_CPANEL_GUIDE.md)
- **Note:** Most cPanel setups handle SSL automatically - you typically don't need to enable HTTPS in Node.js

**cPanel HTTPS (usually not needed):**
```env
# Leave disabled - cPanel handles SSL
USE_HTTPS=false
```

Only enable if your hosting provider specifically requires it.

## License

ISC

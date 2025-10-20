const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MySQL
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes (public)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (require authentication)
const { authenticate } = require('./middleware/auth');

app.use('/api/expenses', authenticate, require('./routes/expenses'));
app.use('/api/users', authenticate, require('./routes/users'));
app.use('/api/reports', authenticate, require('./routes/reports'));
app.use('/api/categories', authenticate, require('./routes/categories'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    database: 'MySQL',
    protocol: req.protocol,
    secure: req.secure,
    host: req.get('host'),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root route for cPanel app check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Family Expense Tracker API',
    version: '2.0.0',
    authentication: 'JWT',
    endpoints: {
      health: '/api/health',
      // Public
      login: '/api/auth/login',
      register: '/api/auth/register',
      // Protected (require authentication)
      expenses: '/api/expenses',
      users: '/api/users',
      categories: '/api/categories',
      reports: '/api/reports'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// cPanel uses a virtual port system - listen on the port provided by the environment
// or fallback to the PORT env variable
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// IMPORTANT FOR cPanel USERS:
// Most cPanel setups handle SSL/HTTPS at the Apache/nginx level via reverse proxy.
// You typically DON'T need to enable HTTPS here.
// Only enable USE_HTTPS if:
// 1. You have direct SSL certificates for your Node.js app
// 2. You're NOT using cPanel's reverse proxy
// 3. Your hosting provider specifically instructed you to handle SSL in Node.js

// Start HTTP server (required)
try {
  http.createServer(app).listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: MySQL`);
    console.log(`Listening on: 0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error('⚠️  Failed to start HTTP server:', error.message);
}

// Start HTTPS server (optional - usually not needed on cPanel)
if (USE_HTTPS) {
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'server.crt');
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'server.key');

  // Check if SSL certificates exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
        console.log(`SSL Certificate: ${certPath}`);
        console.log(`SSL Key: ${keyPath}`);
        console.log(`⚠️  Note: cPanel usually handles SSL via reverse proxy.`);
        console.log(`   Make sure this configuration doesn't conflict with cPanel's SSL setup.`);
      });
    } catch (error) {
      console.error('⚠️  Failed to start HTTPS server:', error.message);
      console.error('   Continuing with HTTP only...');
    }
  } else {
    console.warn('⚠️  HTTPS is enabled but SSL certificates not found!');
    console.warn(`Looking for:`);
    console.warn(`  - Certificate: ${certPath}`);
    console.warn(`  - Key: ${keyPath}`);
    console.warn(`Run 'npm run generate-certs' to create self-signed certificates for development`);
    console.warn(`Or disable HTTPS by removing USE_HTTPS environment variable`);
  }
} else {
  console.log('ℹ️  HTTPS is disabled (recommended for cPanel)');
  console.log('   cPanel handles SSL via reverse proxy at Apache/nginx level');
  console.log('   Set USE_HTTPS=true in environment variables if you need direct HTTPS support');
}

// Export for cPanel
module.exports = app;


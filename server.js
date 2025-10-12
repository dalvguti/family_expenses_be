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

// Routes
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/categories', require('./routes/categories'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    database: 'MySQL',
    protocol: req.protocol,
    secure: req.secure
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

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Start HTTP server
http.createServer(app).listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: MySQL`);
});

// Start HTTPS server if enabled
if (USE_HTTPS) {
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'server.crt');
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'server.key');

  // Check if SSL certificates exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
      console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
      console.log(`SSL Certificate: ${certPath}`);
      console.log(`SSL Key: ${keyPath}`);
    });
  } else {
    console.warn('⚠️  HTTPS is enabled but SSL certificates not found!');
    console.warn(`Looking for:`);
    console.warn(`  - Certificate: ${certPath}`);
    console.warn(`  - Key: ${keyPath}`);
    console.warn(`Run 'npm run generate-certs' to create self-signed certificates for development`);
  }
} else {
  console.log('ℹ️  HTTPS is disabled. Set USE_HTTPS=true in .env to enable HTTPS');
}

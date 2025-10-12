const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database: MySQL`);
  console.log(`Listening on: 0.0.0.0:${PORT}`);
});

// Export for cPanel
module.exports = app;


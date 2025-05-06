require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// ======================
// 1. Middleware Setup
// ======================
app.use(cors({
  origin: true, // Allows all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Increased for video uploads
app.use(express.urlencoded({ extended: true }));

// ======================
// 2. Route Imports
// ======================
const videoRoutes = require('./routes/videos');
const authRoutes = require('./routes/auth'); // New auth routes

// ======================
// 3. Route Middleware
// ======================
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes); // Add authentication routes

// ======================
// 4. Health Check
// ======================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    services: {
      database: 'connected', // You'll add DB checks later
      redis: 'connected'
    }
  });
});

// ======================
// 5. Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  
  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      errors: err.errors.map(e => ({
        param: e.path,
        message: e.message,
        type: e.type
      }))
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ======================
// 6. Server Startup
// ======================
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
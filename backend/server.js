// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { requestLogger } = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');



// backend/server.js (production additions)

const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize app
const app = express();

// Compression
app.use(compression());

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Production logging
if (process.env.NODE_ENV === 'production') {
  app.use(require('morgan')('combined'));
}

// Import routes
const uploadRoutes = require('./src/routes/upload');
const analysisRoutes = require('./src/routes/analysis');

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Malware Detection Backend Server    ║
║                                        ║
║   Status: Running                      ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
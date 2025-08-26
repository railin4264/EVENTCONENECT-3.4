require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Import configurations
const connectDB = require('./config/database');
const { logger } = require('./utils/logger');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');
const rateLimits = require('./middleware/rateLimitMiddleware');

// Import routes
const {
  authRoutes,
  userRoutes,
  eventRoutes,
  tribeRoutes,
  notificationRoutes,
  themeRoutes,
  aiRecommendationRoutes,
  gamificationRoutes,
} = require('./routes');

// ==========================================
// APPLICATION SETUP
// ==========================================

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ==========================================
// DATABASE CONNECTION
// ==========================================

connectDB();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Helmet for security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:19006', // Expo development
      process.env.CLIENT_URL,
      process.env.WEB_URL,
      process.env.MOBILE_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// XSS protection
app.use(xss());

// NoSQL injection protection
app.use(mongoSanitize());

// HTTP Parameter Pollution protection
app.use(hpp());

// ==========================================
// GENERAL MIDDLEWARE
// ==========================================

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan('combined'));
}

// Global rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000, // Limit each IP to 1000 requests per windowMs in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path.startsWith('/health/');
  }
}));

// Speed limiting for consecutive requests
app.use(slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
}));

// ==========================================
// SOCKET.IO SETUP
// ==========================================

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined personal room`);
  });

  // Join event room
  socket.on('joinEvent', (eventId) => {
    socket.join(`event_${eventId}`);
    logger.info(`Socket ${socket.id} joined event ${eventId}`);
  });

  // Leave event room
  socket.on('leaveEvent', (eventId) => {
    socket.leave(`event_${eventId}`);
    logger.info(`Socket ${socket.id} left event ${eventId}`);
  });

  // Handle real-time event updates
  socket.on('eventUpdate', (data) => {
    socket.to(`event_${data.eventId}`).emit('eventUpdated', data);
  });

  // Handle real-time notifications
  socket.on('sendNotification', (data) => {
    socket.to(`user_${data.userId}`).emit('notification', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// ==========================================
// HEALTH CHECK ROUTES
// ==========================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0'
  });
});

app.get('/health/database', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.status(dbState === 1 ? 200 : 503).json({
      success: dbState === 1,
      database: {
        status: states[dbState],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health/system', (req, res) => {
  const os = require('os');
  
  res.status(200).json({
    success: true,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        total: os.totalmem(),
        free: os.freemem()
      },
      loadAverage: os.loadavg()
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication routes
app.use('/api/auth', rateLimits.auth, authRoutes);

// User routes
app.use('/api/users', rateLimits.general, userRoutes);

// Event routes
app.use('/api/events', eventRoutes); // Rate limits applied per route

// Tribe routes
app.use('/api/tribes', rateLimits.general, tribeRoutes);

// Notification routes
app.use('/api/notifications', rateLimits.general, notificationRoutes);

// Theme routes
app.use('/api/themes', rateLimits.general, themeRoutes);

// AI Recommendations routes
app.use('/api/ai', aiRecommendationRoutes); // Rate limits applied per route

// Gamification routes
app.use('/api/gamification', gamificationRoutes); // Rate limits applied per route

// ==========================================
// API DOCUMENTATION ROUTE
// ==========================================

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventConnect API',
    version: process.env.APP_VERSION || '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      tribes: '/api/tribes',
      notifications: '/api/notifications',
      themes: '/api/themes',
      ai: '/api/ai',
      gamification: '/api/gamification'
    },
    health: {
      server: '/health',
      database: '/health/database',
      system: '/health/system'
    }
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// ==========================================
// SERVER STARTUP
// ==========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`
🚀 EventConnect Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📝 API Documentation: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
⚡ Socket.IO: Enabled
🔒 Security: Enhanced
🎯 Ready to handle requests!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };

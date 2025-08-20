const compression = require('compression');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const socketIo = require('socket.io');

const http = require('http');
const path = require('path');
require('dotenv').config();

// Import configurations
const config = require('./config');
const database = require('./database/connection');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const validationMiddleware = require('./middleware/validation');

// Import routes
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const blockchainRoutes = require('./routes/blockchain');
const eventRoutes = require('./routes/events');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const tribeRoutes = require('./routes/tribes');
const userRoutes = require('./routes/users');

// Import services
const aiService = require('./services/aiService');
const blockchainService = require('./services/blockchainService');
const eventService = require('./services/eventService');
const notificationService = require('./services/notificationService');
const logger = require('./utils/logger');
const redis = require('./utils/redis');

// Import AI and Blockchain
require('./ai/dnaAnalyzer');
require('./ai/recommendationEngine');
require('./blockchain/web3Config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
  },
});

// Global middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'ws:'],
      },
    },
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

// Session configuration with Redis
const redisStore = new RedisStore({
  client: redis,
  prefix: 'eventconnect:session:',
});

app.use(
  session({
    store: redisStore,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.version,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware.requireAuth, userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tribes', authMiddleware.requireAuth, tribeRoutes);
app.use('/api/ai', authMiddleware.requireAuth, aiRoutes);
app.use('/api/blockchain', authMiddleware.requireAuth, blockchainRoutes);
app.use('/api/payments', authMiddleware.requireAuth, paymentRoutes);
app.use('/api/notifications', authMiddleware.requireAuth, notificationRoutes);

// Universal DNA API
app.get('/api/dna/profile', authMiddleware.requireAuth, async (req, res) => {
  try {
    const userDNA = await aiService.analyzeUserDNA(req.user.id);
    res.json({
      success: true,
      data: userDNA,
    });
  } catch (error) {
    logger.error('DNA Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing user DNA',
    });
  }
});

// Universal Tribes API
app.get(
  '/api/tribes/universal',
  authMiddleware.requireAuth,
  async (req, res) => {
    try {
      const tribes = await eventService.getUniversalTribes(req.user.id);
      res.json({
        success: true,
        data: tribes,
      });
    } catch (error) {
      logger.error('Universal Tribes Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching universal tribes',
      });
    }
  }
);

// Universal AI Guide API
app.get(
  '/api/ai/recommendations',
  authMiddleware.requireAuth,
  async (req, res) => {
    try {
      const recommendations = await aiService.getPersonalizedRecommendations(
        req.user.id
      );
      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      logger.error('AI Recommendations Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recommendations',
      });
    }
  }
);

// Universal Pulse API
app.get('/api/pulse/events', authMiddleware.requireAuth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    const pulseEvents = await eventService.getPulseEvents(
      req.user.id,
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius)
    );
    res.json({
      success: true,
      data: pulseEvents,
    });
  } catch (error) {
    logger.error('Pulse Events Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pulse events',
    });
  }
});

// Socket.IO for real-time features
io.on('connection', socket => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their tribes
  socket.on('join-tribes', async userId => {
    try {
      const userTribes = await eventService.getUserTribes(userId);
      userTribes.forEach(tribe => {
        socket.join(`tribe:${tribe.id}`);
      });
      logger.info(`User ${userId} joined ${userTribes.length} tribes`);
    } catch (error) {
      logger.error('Socket join tribes error:', error);
    }
  });

  // Handle event creation
  socket.on('create-event', async eventData => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      io.to(`tribe:${eventData.tribeId}`).emit('event-created', newEvent);
      logger.info(`Event created: ${newEvent.id}`);
    } catch (error) {
      logger.error('Socket create event error:', error);
      socket.emit('event-error', { message: 'Error creating event' });
    }
  });

  // Handle real-time messaging
  socket.on('send-message', async messageData => {
    try {
      const message = await eventService.saveMessage(messageData);
      io.to(`tribe:${messageData.tribeId}`).emit('new-message', message);
    } catch (error) {
      logger.error('Socket message error:', error);
    }
  });

  // Handle location updates
  socket.on('update-location', async locationData => {
    try {
      await eventService.updateUserLocation(locationData.userId, locationData);
      // Emit to nearby users
      const nearbyUsers = await eventService.getNearbyUsers(locationData);
      nearbyUsers.forEach(user => {
        io.to(`user:${user.id}`).emit('user-nearby', locationData);
      });
    } catch (error) {
      logger.error('Socket location error:', error);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
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

// Start server
const PORT = config.port || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 EventConnect Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📱 API Documentation: http://localhost:${PORT}/api/docs`);
});

module.exports = { app, server, io };

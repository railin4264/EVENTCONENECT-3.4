const http = require('http');
const path = require('path');

const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoose = require('mongoose');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const socketIo = require('socket.io');
const xss = require('xss-clean');

// Load environment variables
require('dotenv').config();

// Import configurations
const { database, redis: redisConfig, socket } = require('./config');

// Import middleware
const {
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
  gracefulShutdown,
} = require('./middleware/errorHandler');

// Import routes
const {
  authRoutes,
  eventRoutes,
  tribeRoutes,
  postRoutes,
  reviewRoutes,
  chatRoutes,
  notificationRoutes,
  searchRoutes,
  userRoutes,
  locationRoutes,
  watchlistRoutes,
} = require('./routes');

// Create Express app
const app = express();
const server = http.createServer(app);

// Habilitar trust proxy para que cookies secure funcionen detrás de proxy
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize socket manager
socket.initialize(server, { io });

// Connect external services (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  database.connectDB().catch(err => {
    console.warn('⚠️ MongoDB no disponible:', err.message);
    console.log('🔄 Aplicación iniciando sin MongoDB');
  });

  // Connect to Redis
  redisConfig.connect().catch(err => {
    console.warn('⚠️ Redis no disponible:', err.message);
    console.log('🔄 Aplicación iniciando sin Redis');
  });
}

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
});
app.use('/api/', limiter);

// Speed limiting
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: () => 500, // Fixed function format for v2
  validate: { delayMs: false }, // Disable warning
});
app.use('/api/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisConfig.isConnected() ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tribes', tribeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/watchlist', watchlistRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

// Socket.IO connection handling
io.on('connection', socket => {
  console.log('Usuario conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Start server (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📱 Entorno: ${process.env.NODE_ENV}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;

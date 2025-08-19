const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const compression = require('compression');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const tribeRoutes = require('./routes/tribes');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');

const { authenticateSocket } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: 500
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(limiter);
app.use(speedLimiter);
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xss());
app.use(mongoSanitize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tribes', tribeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.userId);
  
  // Join user to their personal room
  socket.join(`user:${socket.userId}`);
  
  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, message, type } = data;
      // Save message to database and emit to chat room
      io.to(`chat:${chatId}`).emit('new_message', {
        chatId,
        message,
        userId: socket.userId,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  });
  
  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat:${chatId}`);
  });
  
  // Leave chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat:${chatId}`);
  });
  
  // Handle typing indicators
  socket.on('typing_start', (chatId) => {
    socket.to(`chat:${chatId}`).emit('user_typing', {
      userId: socket.userId,
      chatId
    });
  });
  
  socket.on('typing_stop', (chatId) => {
    socket.to(`chat:${chatId}`).emit('user_stop_typing', {
      userId: socket.userId,
      chatId
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.userId);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
})
.catch((err) => {
  console.error('❌ Error conectando a MongoDB:', err);
  process.exit(1);
});

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('❌ Error de Redis:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Conectado a Redis');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    mongoose.connection.close();
    redisClient.quit();
    process.exit(0);
  });
});

module.exports = { app, server, io, redisClient };
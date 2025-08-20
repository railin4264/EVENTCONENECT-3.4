const socketIo = require('socket.io');

const jwt = require('./jwt');
const redis = require('./redis');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // userId -> Set of socketIds
    this.roomUsers = new Map(); // roomId -> Set of userIds
    this.userRooms = new Map(); // userId -> Set of roomIds
  }

  // Initialize Socket.IO
  initialize(server, options = {}) {
    try {
      const defaultOptions = {
        cors: {
          origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e6,
        allowRequest: (req, callback) => {
          // Allow all requests for now, can be customized later
          callback(null, true);
        },
      };

      this.io = socketIo(server, { ...defaultOptions, ...options });

      // Set up middleware
      this.setupMiddleware();

      // Set up event handlers
      this.setupEventHandlers();

      console.log('🚀 Socket.IO inicializado correctamente');

      return this.io;
    } catch (error) {
      console.error('❌ Error inicializando Socket.IO:', error);
      throw error;
    }
  }

  // Setup middleware
  setupMiddleware() {
    try {
      // Authentication middleware
      this.io.use(async (socket, next) => {
        try {
          const token =
            socket.handshake.auth.token ||
            socket.handshake.headers.authorization;

          if (!token) {
            // Allow connection without token for public events
            socket.isAuthenticated = false;
            return next();
          }

          // Remove 'Bearer ' prefix if present
          const cleanToken = token.replace('Bearer ', '');

          try {
            const decoded = jwt.verifyAccessToken(cleanToken);
            socket.userId = decoded.userId || decoded.id;
            socket.user = decoded;
            socket.isAuthenticated = true;

            // Store user connection info
            this.addUserConnection(socket.userId, socket.id);

            next();
          } catch (error) {
            console.warn('⚠️ Token inválido en Socket.IO:', error.message);
            socket.isAuthenticated = false;
            next();
          }
        } catch (error) {
          console.error('❌ Error en middleware de Socket.IO:', error);
          socket.isAuthenticated = false;
          next();
        }
      });

      // Rate limiting middleware
      this.io.use((socket, next) => {
        try {
          const clientId = socket.handshake.address;
          const now = Date.now();

          // Simple rate limiting - can be enhanced with Redis
          if (!socket.rateLimit) {
            socket.rateLimit = {
              count: 0,
              resetTime: now + 60000, // 1 minute
            };
          }

          if (now > socket.rateLimit.resetTime) {
            socket.rateLimit.count = 0;
            socket.rateLimit.resetTime = now + 60000;
          }

          socket.rateLimit.count++;

          if (socket.rateLimit.count > 100) {
            // 100 events per minute
            console.warn(`⚠️ Rate limit excedido para cliente: ${clientId}`);
            return next(new Error('Rate limit excedido'));
          }

          next();
        } catch (error) {
          console.error('❌ Error en rate limiting de Socket.IO:', error);
          next();
        }
      });

      console.log('✅ Middleware de Socket.IO configurado');
    } catch (error) {
      console.error('❌ Error configurando middleware de Socket.IO:', error);
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    try {
      this.io.on('connection', socket => {
        console.log(`🔌 Nuevo cliente conectado: ${socket.id}`);

        // Handle authentication
        if (socket.isAuthenticated) {
          console.log(`👤 Usuario autenticado conectado: ${socket.userId}`);
          this.handleAuthenticatedConnection(socket);
        } else {
          console.log(`👤 Cliente anónimo conectado: ${socket.id}`);
          this.handleAnonymousConnection(socket);
        }

        // Handle disconnection
        socket.on('disconnect', reason => {
          console.log(
            `🔌 Cliente desconectado: ${socket.id}, Razón: ${reason}`
          );
          this.handleDisconnection(socket);
        });

        // Handle errors
        socket.on('error', error => {
          console.error(`❌ Error en socket ${socket.id}:`, error);
        });

        // Handle custom events
        this.handleCustomEvents(socket);
      });

      console.log('✅ Event handlers de Socket.IO configurados');
    } catch (error) {
      console.error(
        '❌ Error configurando event handlers de Socket.IO:',
        error
      );
    }
  }

  // Handle authenticated connection
  handleAuthenticatedConnection(socket) {
    try {
      // Join user's personal room
      const userRoom = `user:${socket.userId}`;
      socket.join(userRoom);
      this.addUserToRoom(socket.userId, userRoom);

      // Join user's event rooms
      this.joinUserEventRooms(socket);

      // Join user's tribe rooms
      this.joinUserTribeRooms(socket);

      // Send welcome message
      socket.emit('welcome', {
        message: 'Bienvenido a EventConnect',
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });

      // Notify other users about new connection
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Usuario ${socket.userId} configurado correctamente`);
    } catch (error) {
      console.error('❌ Error manejando conexión autenticada:', error);
    }
  }

  // Handle anonymous connection
  handleAnonymousConnection(socket) {
    try {
      // Join public rooms
      socket.join('public');

      // Send limited welcome message
      socket.emit('welcome_anonymous', {
        message: 'Bienvenido a EventConnect (modo anónimo)',
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Cliente anónimo ${socket.id} configurado correctamente`);
    } catch (error) {
      console.error('❌ Error manejando conexión anónima:', error);
    }
  }

  // Handle disconnection
  handleDisconnection(socket) {
    try {
      if (socket.isAuthenticated && socket.userId) {
        // Remove user connection info
        this.removeUserConnection(socket.userId, socket.id);

        // Notify other users about disconnection
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });

        // Leave all rooms
        this.leaveAllUserRooms(socket.userId);

        console.log(`✅ Usuario ${socket.userId} desconectado correctamente`);
      } else {
        console.log(
          `✅ Cliente anónimo ${socket.id} desconectado correctamente`
        );
      }
    } catch (error) {
      console.error('❌ Error manejando desconexión:', error);
    }
  }

  // Handle custom events
  handleCustomEvents(socket) {
    try {
      // Join event room
      socket.on('join_event', data => {
        this.handleJoinEvent(socket, data);
      });

      // Leave event room
      socket.on('leave_event', data => {
        this.handleLeaveEvent(socket, data);
      });

      // Join tribe room
      socket.on('join_tribe', data => {
        this.handleJoinTribe(socket, data);
      });

      // Leave tribe room
      socket.on('leave_tribe', data => {
        this.handleLeaveTribe(socket, data);
      });

      // Send message to room
      socket.on('send_message', data => {
        this.handleSendMessage(socket, data);
      });

      // Typing indicator
      socket.on('typing_start', data => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', data => {
        this.handleTypingStop(socket, data);
      });

      // User activity
      socket.on('user_activity', data => {
        this.handleUserActivity(socket, data);
      });

      // Location update
      socket.on('location_update', data => {
        this.handleLocationUpdate(socket, data);
      });

      // Notification preferences
      socket.on('notification_preferences', data => {
        this.handleNotificationPreferences(socket, data);
      });

      console.log('✅ Eventos personalizados de Socket.IO configurados');
    } catch (error) {
      console.error(
        '❌ Error configurando eventos personalizados de Socket.IO:',
        error
      );
    }
  }

  // Handle join event
  handleJoinEvent(socket, data) {
    try {
      if (!socket.isAuthenticated) {
        socket.emit('error', {
          message: 'Debes estar autenticado para unirte a eventos',
        });
        return;
      }

      const { eventId } = data;
      if (!eventId) {
        socket.emit('error', { message: 'ID de evento requerido' });
        return;
      }

      const eventRoom = `event:${eventId}`;
      socket.join(eventRoom);
      this.addUserToRoom(socket.userId, eventRoom);

      // Notify other users in the event
      socket.to(eventRoom).emit('user_joined_event', {
        userId: socket.userId,
        eventId,
        timestamp: new Date().toISOString(),
      });

      socket.emit('joined_event', {
        eventId,
        message: 'Te has unido al evento',
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Usuario ${socket.userId} se unió al evento ${eventId}`);
    } catch (error) {
      console.error('❌ Error manejando unión a evento:', error);
      socket.emit('error', { message: 'Error al unirse al evento' });
    }
  }

  // Handle leave event
  handleLeaveEvent(socket, data) {
    try {
      if (!socket.isAuthenticated) {
        socket.emit('error', {
          message: 'Debes estar autenticado para dejar eventos',
        });
        return;
      }

      const { eventId } = data;
      if (!eventId) {
        socket.emit('error', { message: 'ID de evento requerido' });
        return;
      }

      const eventRoom = `event:${eventId}`;
      socket.leave(eventRoom);
      this.removeUserFromRoom(socket.userId, eventRoom);

      // Notify other users in the event
      socket.to(eventRoom).emit('user_left_event', {
        userId: socket.userId,
        eventId,
        timestamp: new Date().toISOString(),
      });

      socket.emit('left_event', {
        eventId,
        message: 'Has dejado el evento',
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Usuario ${socket.userId} dejó el evento ${eventId}`);
    } catch (error) {
      console.error('❌ Error manejando salida de evento:', error);
      socket.emit('error', { message: 'Error al dejar el evento' });
    }
  }

  // Handle join tribe
  handleJoinTribe(socket, data) {
    try {
      if (!socket.isAuthenticated) {
        socket.emit('error', {
          message: 'Debes estar autenticado para unirte a tribus',
        });
        return;
      }

      const { tribeId } = data;
      if (!tribeId) {
        socket.emit('error', { message: 'ID de tribu requerido' });
        return;
      }

      const tribeRoom = `tribe:${tribeId}`;
      socket.join(tribeRoom);
      this.addUserToRoom(socket.userId, tribeRoom);

      // Notify other users in the tribe
      socket.to(tribeRoom).emit('user_joined_tribe', {
        userId: socket.userId,
        tribeId,
        timestamp: new Date().toISOString(),
      });

      socket.emit('joined_tribe', {
        tribeId,
        message: 'Te has unido a la tribu',
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Usuario ${socket.userId} se unió a la tribu ${tribeId}`);
    } catch (error) {
      console.error('❌ Error manejando unión a tribu:', error);
      socket.emit('error', { message: 'Error al unirse a la tribu' });
    }
  }

  // Handle leave tribe
  handleLeaveTribe(socket, data) {
    try {
      if (!socket.isAuthenticated) {
        socket.emit('error', {
          message: 'Debes estar autenticado para dejar tribus',
        });
        return;
      }

      const { tribeId } = data;
      if (!tribeId) {
        socket.emit('error', { message: 'ID de tribu requerido' });
        return;
      }

      const tribeRoom = `tribe:${tribeId}`;
      socket.leave(tribeRoom);
      this.removeUserFromRoom(socket.userId, tribeRoom);

      // Notify other users in the tribe
      socket.to(tribeRoom).emit('user_left_tribe', {
        userId: socket.userId,
        tribeId,
        timestamp: new Date().toISOString(),
      });

      socket.emit('left_tribe', {
        tribeId,
        message: 'Has dejado la tribu',
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Usuario ${socket.userId} dejó la tribu ${tribeId}`);
    } catch (error) {
      console.error('❌ Error manejando salida de tribu:', error);
      socket.emit('error', { message: 'Error al dejar la tribu' });
    }
  }

  // Handle send message
  handleSendMessage(socket, data) {
    try {
      if (!socket.isAuthenticated) {
        socket.emit('error', {
          message: 'Debes estar autenticado para enviar mensajes',
        });
        return;
      }

      const { roomId, message, type = 'text' } = data;
      if (!roomId || !message) {
        socket.emit('error', { message: 'Room ID y mensaje son requeridos' });
        return;
      }

      const messageData = {
        userId: socket.userId,
        username: socket.user.username || 'Usuario',
        message,
        type,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      };

      // Broadcast message to room
      socket.to(roomId).emit('new_message', messageData);

      // Send confirmation to sender
      socket.emit('message_sent', {
        ...messageData,
        status: 'sent',
      });

      console.log(`✅ Mensaje enviado por ${socket.userId} en ${roomId}`);
    } catch (error) {
      console.error('❌ Error manejando envío de mensaje:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  }

  // Handle typing start
  handleTypingStart(socket, data) {
    try {
      if (!socket.isAuthenticated) return;

      const { roomId } = data;
      if (!roomId) return;

      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username || 'Usuario',
        roomId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error manejando inicio de escritura:', error);
    }
  }

  // Handle typing stop
  handleTypingStop(socket, data) {
    try {
      if (!socket.isAuthenticated) return;

      const { roomId } = data;
      if (!roomId) return;

      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.userId,
        username: socket.user.username || 'Usuario',
        roomId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error manejando parada de escritura:', error);
    }
  }

  // Handle user activity
  handleUserActivity(socket, data) {
    try {
      if (!socket.isAuthenticated) return;

      const { activity, details } = data;

      // Store user activity in Redis for analytics
      this.storeUserActivity(socket.userId, activity, details);

      // Broadcast to relevant rooms if needed
      if (activity === 'online' || activity === 'away') {
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status: activity,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('❌ Error manejando actividad del usuario:', error);
    }
  }

  // Handle location update
  handleLocationUpdate(socket, data) {
    try {
      if (!socket.isAuthenticated) return;

      const { latitude, longitude, accuracy } = data;

      // Store user location in Redis
      this.storeUserLocation(socket.userId, { latitude, longitude, accuracy });

      // Broadcast to nearby users if needed
      this.broadcastLocationToNearbyUsers(socket.userId, {
        latitude,
        longitude,
        accuracy,
      });
    } catch (error) {
      console.error('❌ Error manejando actualización de ubicación:', error);
    }
  }

  // Handle notification preferences
  handleNotificationPreferences(socket, data) {
    try {
      if (!socket.isAuthenticated) return;

      const { preferences } = data;

      // Store notification preferences in Redis
      this.storeNotificationPreferences(socket.userId, preferences);

      socket.emit('preferences_updated', {
        message: 'Preferencias de notificación actualizadas',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error manejando preferencias de notificación:', error);
      socket.emit('error', { message: 'Error al actualizar preferencias' });
    }
  }

  // Utility methods for managing connections and rooms
  addUserConnection(userId, socketId) {
    try {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(socketId);
      this.connectedUsers.set(socketId, userId);
    } catch (error) {
      console.error('❌ Error agregando conexión de usuario:', error);
    }
  }

  removeUserConnection(userId, socketId) {
    try {
      if (this.userSockets.has(userId)) {
        this.userSockets.get(userId).delete(socketId);
        if (this.userSockets.get(userId).size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.connectedUsers.delete(socketId);
    } catch (error) {
      console.error('❌ Error removiendo conexión de usuario:', error);
    }
  }

  addUserToRoom(userId, roomId) {
    try {
      if (!this.roomUsers.has(roomId)) {
        this.roomUsers.set(roomId, new Set());
      }
      this.roomUsers.get(roomId).add(userId);

      if (!this.userRooms.has(userId)) {
        this.userRooms.set(userId, new Set());
      }
      this.userRooms.get(userId).add(roomId);
    } catch (error) {
      console.error('❌ Error agregando usuario a sala:', error);
    }
  }

  removeUserFromRoom(userId, roomId) {
    try {
      if (this.roomUsers.has(roomId)) {
        this.roomUsers.get(roomId).delete(userId);
        if (this.roomUsers.get(roomId).size === 0) {
          this.roomUsers.delete(roomId);
        }
      }

      if (this.userRooms.has(userId)) {
        this.userRooms.get(userId).delete(roomId);
        if (this.userRooms.get(userId).size === 0) {
          this.userRooms.delete(userId);
        }
      }
    } catch (error) {
      console.error('❌ Error removiendo usuario de sala:', error);
    }
  }

  leaveAllUserRooms(userId) {
    try {
      if (this.userRooms.has(userId)) {
        const rooms = Array.from(this.userRooms.get(userId));
        rooms.forEach(roomId => {
          this.removeUserFromRoom(userId, roomId);
        });
      }
    } catch (error) {
      console.error('❌ Error dejando todas las salas del usuario:', error);
    }
  }

  // Join user's event rooms (simplified)
  joinUserEventRooms(socket) {
    try {
      // In a real implementation, you would fetch user's events from database
      // For now, we'll just log this action
      console.log(
        `📅 Preparando para unir usuario ${socket.userId} a salas de eventos`
      );
    } catch (error) {
      console.error('❌ Error uniendo usuario a salas de eventos:', error);
    }
  }

  // Join user's tribe rooms (simplified)
  joinUserTribeRooms(socket) {
    try {
      // In a real implementation, you would fetch user's tribes from database
      // For now, we'll just log this action
      console.log(
        `👥 Preparando para unir usuario ${socket.userId} a salas de tribus`
      );
    } catch (error) {
      console.error('❌ Error uniendo usuario a salas de tribus:', error);
    }
  }

  // Store user activity in Redis
  async storeUserActivity(userId, activity, details) {
    try {
      const key = `user_activity:${userId}`;
      const activityData = {
        activity,
        details,
        timestamp: new Date().toISOString(),
      };

      await redis.lpush(key, activityData);
      await redis.ltrim(key, 0, 99); // Keep only last 100 activities
    } catch (error) {
      console.error('❌ Error almacenando actividad del usuario:', error);
    }
  }

  // Store user location in Redis
  async storeUserLocation(userId, location) {
    try {
      const key = `user_location:${userId}`;
      const locationData = {
        ...location,
        timestamp: new Date().toISOString(),
      };

      await redis.setEx(key, 300, locationData); // Expire in 5 minutes
    } catch (error) {
      console.error('❌ Error almacenando ubicación del usuario:', error);
    }
  }

  // Store notification preferences in Redis
  async storeNotificationPreferences(userId, preferences) {
    try {
      const key = `user_notification_prefs:${userId}`;
      await redis.setEx(key, 86400, preferences); // Expire in 24 hours
    } catch (error) {
      console.error(
        '❌ Error almacenando preferencias de notificación:',
        error
      );
    }
  }

  // Broadcast location to nearby users (simplified)
  broadcastLocationToNearbyUsers(userId, location) {
    try {
      // In a real implementation, you would find nearby users and broadcast to them
      // For now, we'll just log this action
      console.log(`📍 Ubicación de usuario ${userId} actualizada:`, location);
    } catch (error) {
      console.error(
        '❌ Error transmitiendo ubicación a usuarios cercanos:',
        error
      );
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    try {
      return this.connectedUsers.size;
    } catch (error) {
      console.error(
        '❌ Error obteniendo conteo de usuarios conectados:',
        error
      );
      return 0;
    }
  }

  // Get room users count
  getRoomUsersCount(roomId) {
    try {
      return this.roomUsers.has(roomId) ? this.roomUsers.get(roomId).size : 0;
    } catch (error) {
      console.error('❌ Error obteniendo conteo de usuarios en sala:', error);
      return 0;
    }
  }

  // Get user's active rooms
  getUserActiveRooms(userId) {
    try {
      return this.userRooms.has(userId)
        ? Array.from(this.userRooms.get(userId))
        : [];
    } catch (error) {
      console.error('❌ Error obteniendo salas activas del usuario:', error);
      return [];
    }
  }

  // Send notification to user
  sendNotificationToUser(userId, notification) {
    try {
      if (this.userSockets.has(userId)) {
        const socketIds = Array.from(this.userSockets.get(userId));
        socketIds.forEach(socketId => {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('notification', notification);
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error enviando notificación al usuario:', error);
      return false;
    }
  }

  // Broadcast to all users
  broadcastToAll(event, data) {
    try {
      if (this.io) {
        this.io.emit(event, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error transmitiendo a todos los usuarios:', error);
      return false;
    }
  }

  // Broadcast to room
  broadcastToRoom(roomId, event, data) {
    try {
      if (this.io) {
        this.io.to(roomId).emit(event, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error transmitiendo a sala:', error);
      return false;
    }
  }

  // Get Socket.IO instance
  getIO() {
    return this.io;
  }

  // Close Socket.IO
  close() {
    try {
      if (this.io) {
        this.io.close();
        console.log('🔌 Socket.IO cerrado correctamente');
      }
    } catch (error) {
      console.error('❌ Error cerrando Socket.IO:', error);
    }
  }
}

// Create and export Socket manager instance
const socketManager = new SocketManager();

module.exports = socketManager;

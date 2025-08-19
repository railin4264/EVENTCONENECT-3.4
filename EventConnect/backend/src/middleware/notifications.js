const Notification = require('../models/Notification');
const User = require('../models/User');
const redisClient = require('../config/redis');

// WebSocket connection manager
class WebSocketManager {
  constructor() {
    this.connections = new Map(); // userId -> socket
    this.rooms = new Map(); // roomId -> Set of socketIds
    this.socketRooms = new Map(); // socketId -> Set of roomIds
  }

  // Add connection
  addConnection(userId, socket) {
    this.connections.set(userId, socket);
    
    // Join user's personal room
    this.joinRoom(userId, socket.id);
    
    console.log(`🔌 Usuario ${userId} conectado. Total conexiones: ${this.connections.size}`);
  }

  // Remove connection
  removeConnection(userId) {
    const socket = this.connections.get(userId);
    if (socket) {
      // Leave all rooms
      const userRooms = this.socketRooms.get(socket.id) || new Set();
      userRooms.forEach(roomId => {
        this.leaveRoom(roomId, socket.id);
      });
      
      // Remove from connections
      this.connections.delete(userId);
      this.socketRooms.delete(socket.id);
      
      console.log(`🔌 Usuario ${userId} desconectado. Total conexiones: ${this.connections.size}`);
    }
  }

  // Join room
  joinRoom(roomId, socketId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId).add(socketId);
    
    if (!this.socketRooms.has(socketId)) {
      this.socketRooms.set(socketId, new Set());
    }
    
    this.socketRooms.get(socketId).add(roomId);
    
    console.log(`🚪 Socket ${socketId} se unió a la sala ${roomId}`);
  }

  // Leave room
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    const userRooms = this.socketRooms.get(socketId);
    if (userRooms) {
      userRooms.delete(roomId);
      if (userRooms.size === 0) {
        this.socketRooms.delete(socketId);
      }
    }
    
    console.log(`🚪 Socket ${socketId} salió de la sala ${roomId}`);
  }

  // Get user's socket
  getUserSocket(userId) {
    return this.connections.get(userId);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connections.has(userId);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connections.size;
  }

  // Get room members count
  getRoomMembersCount(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.size : 0;
  }

  // Broadcast to room
  broadcastToRoom(roomId, event, data) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.forEach(socketId => {
        // Find socket by ID (this would need to be implemented based on your socket library)
        // For now, we'll use the stored socket references
        this.connections.forEach((socket, userId) => {
          if (socket.id === socketId) {
            socket.emit(event, data);
          }
        });
      });
    }
  }

  // Send to specific user
  sendToUser(userId, event, data) {
    const socket = this.getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  // Broadcast to all users
  broadcastToAll(event, data) {
    this.connections.forEach(socket => {
      socket.emit(event, data);
    });
  }

  // Get connection stats
  getStats() {
    return {
      totalConnections: this.connections.size,
      totalRooms: this.rooms.size,
      totalSocketRooms: this.socketRooms.size
    };
  }
}

// Create global WebSocket manager instance
const wsManager = new WebSocketManager();

// Notification service
class NotificationService {
  constructor() {
    this.wsManager = wsManager;
  }

  // Create notification
  async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();
      
      // Send real-time notification if user is online
      if (this.wsManager.isUserOnline(data.recipient)) {
        this.wsManager.sendToUser(data.recipient, 'newNotification', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          createdAt: notification.createdAt
        });
      }
      
      // Store in Redis for offline users
      await this.storeOfflineNotification(data.recipient, notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Store offline notification in Redis
  async storeOfflineNotification(userId, notification) {
    try {
      const key = `offline_notifications:${userId}`;
      const existingNotifications = await redisClient.get(key) || [];
      
      existingNotifications.push({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt
      });
      
      // Keep only last 50 notifications
      if (existingNotifications.length > 50) {
        existingNotifications.splice(0, existingNotifications.length - 50);
      }
      
      await redisClient.set(key, existingNotifications, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {
      console.error('Error storing offline notification:', error);
    }
  }

  // Get offline notifications for user
  async getOfflineNotifications(userId) {
    try {
      const key = `offline_notifications:${userId}`;
      const notifications = await redisClient.get(key) || [];
      
      // Clear offline notifications after retrieving
      await redisClient.del(key);
      
      return notifications;
    } catch (error) {
      console.error('Error getting offline notifications:', error);
      return [];
    }
  }

  // Send event notification
  async sendEventNotification(eventId, type, recipients, data = {}) {
    try {
      const notifications = [];
      
      for (const recipientId of recipients) {
        const notificationData = {
          recipient: recipientId,
          type: `event_${type}`,
          title: this.getEventNotificationTitle(type),
          message: this.getEventNotificationMessage(type, data),
          data: {
            event: eventId,
            ...data
          },
          category: 'events'
        };
        
        const notification = await this.createNotification(notificationData);
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error('Error sending event notifications:', error);
      throw error;
    }
  }

  // Send tribe notification
  async sendTribeNotification(tribeId, type, recipients, data = {}) {
    try {
      const notifications = [];
      
      for (const recipientId of recipients) {
        const notificationData = {
          recipient: recipientId,
          type: `tribe_${type}`,
          title: this.getTribeNotificationTitle(type),
          message: this.getTribeNotificationMessage(type, data),
          data: {
            tribe: tribeId,
            ...data
          },
          category: 'tribes'
        };
        
        const notification = await this.createNotification(notificationData);
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error('Error sending tribe notifications:', error);
      throw error;
    }
  }

  // Send social notification
  async sendSocialNotification(type, recipientId, senderId, data = {}) {
    try {
      const notificationData = {
        recipient: recipientId,
        sender: senderId,
        type: `social_${type}`,
        title: this.getSocialNotificationTitle(type),
        message: this.getSocialNotificationMessage(type, data),
        data: {
          user: senderId,
          ...data
        },
        category: 'social'
      };
      
      const notification = await this.createNotification(notificationData);
      return notification;
    } catch (error) {
      console.error('Error sending social notification:', error);
      throw error;
    }
  }

  // Send chat notification
  async sendChatNotification(chatId, senderId, recipientId, message) {
    try {
      const notificationData = {
        recipient: recipientId,
        sender: senderId,
        type: 'chat_message',
        title: 'Nuevo mensaje',
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        data: {
          chat: chatId,
          message: message,
          sender: senderId
        },
        category: 'chat'
      };
      
      const notification = await this.createNotification(notificationData);
      return notification;
    } catch (error) {
      console.error('Error sending chat notification:', error);
      throw error;
    }
  }

  // Get notification titles
  getEventNotificationTitle(type) {
    const titles = {
      invite: 'Invitación a evento',
      update: 'Evento actualizado',
      reminder: 'Recordatorio de evento',
      cancelled: 'Evento cancelado',
      joined: 'Nuevo asistente',
      left: 'Asistente canceló'
    };
    
    return titles[type] || 'Notificación de evento';
  }

  getEventNotificationMessage(type, data) {
    const messages = {
      invite: `${data.eventTitle || 'Un evento'} te ha invitado`,
      update: `${data.eventTitle || 'Un evento'} ha sido actualizado`,
      reminder: `Recordatorio: ${data.eventTitle || 'tu evento'} comienza pronto`,
      cancelled: `${data.eventTitle || 'Un evento'} ha sido cancelado`,
      joined: `${data.userName || 'Alguien'} se unió a ${data.eventTitle || 'tu evento'}`,
      left: `${data.userName || 'Alguien'} canceló asistencia a ${data.eventTitle || 'tu evento'}`
    };
    
    return messages[type] || 'Tienes una notificación de evento';
  }

  getTribeNotificationTitle(type) {
    const titles = {
      invite: 'Invitación a tribu',
      update: 'Tribu actualizada',
      joined: 'Nuevo miembro',
      left: 'Miembro salió'
    };
    
    return titles[type] || 'Notificación de tribu';
  }

  getTribeNotificationMessage(type, data) {
    const messages = {
      invite: `${data.tribeName || 'Una tribu'} te ha invitado`,
      update: `${data.tribeName || 'Una tribu'} ha sido actualizada`,
      joined: `${data.userName || 'Alguien'} se unió a ${data.tribeName || 'tu tribu'}`,
      left: `${data.userName || 'Alguien'} salió de ${data.tribeName || 'tu tribu'}`
    };
    
    return messages[type] || 'Tienes una notificación de tribu';
  }

  getSocialNotificationTitle(type) {
    const titles = {
      follow: 'Nuevo seguidor',
      like: 'Nueva reacción',
      comment: 'Nuevo comentario',
      mention: 'Te mencionaron'
    };
    
    return titles[type] || 'Notificación social';
  }

  getSocialNotificationMessage(type, data) {
    const messages = {
      follow: `${data.userName || 'Alguien'} comenzó a seguirte`,
      like: `${data.userName || 'Alguien'} reaccionó a tu contenido`,
      comment: `${data.userName || 'Alguien'} comentó en tu contenido`,
      mention: `${data.userName || 'Alguien'} te mencionó`
    };
    
    return messages[type] || 'Tienes una notificación social';
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        throw new Error('Notificación no encontrada');
      }
      
      if (notification.recipient.toString() !== userId.toString()) {
        throw new Error('No autorizado para marcar esta notificación');
      }
      
      notification.status = 'read';
      notification.readAt = new Date();
      await notification.save();
      
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, status: 'unread' },
        { status: 'read', readAt: new Date() }
      );
      
      return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, status, category, type } = options;
      const skip = (page - 1) * limit;
      
      const query = { recipient: userId };
      
      if (status) query.status = status;
      if (category) query.category = category;
      if (type) query.type = type;
      
      const notifications = await Notification.find(query)
        .populate('sender', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Notification.countDocuments(query);
      
      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        throw new Error('Notificación no encontrada');
      }
      
      if (notification.recipient.toString() !== userId.toString()) {
        throw new Error('No autorizado para eliminar esta notificación');
      }
      
      await notification.remove();
      
      return { success: true, message: 'Notificación eliminada' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification stats
  async getNotificationStats(userId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { recipient: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const result = {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0
      };
      
      stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

// Create global notification service instance
const notificationService = new NotificationService();

// WebSocket middleware
const webSocketMiddleware = (io) => {
  return (req, res, next) => {
    req.io = io;
    req.wsManager = wsManager;
    req.notificationService = notificationService;
    next();
  };
};

// Export all notification and WebSocket functionality
module.exports = {
  wsManager,
  notificationService,
  webSocketMiddleware,
  WebSocketManager,
  NotificationService
};
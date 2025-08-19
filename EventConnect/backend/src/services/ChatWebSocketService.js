const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { redis } = require('../config');

class ChatWebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // userId -> Set of socketIds
    this.roomMembers = new Map(); // roomId -> Set of userIds
    this.typingUsers = new Map(); // roomId -> Set of userIds
    this.messageQueue = new Map(); // userId -> Array of pending messages
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e8, // 100MB
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startCleanupInterval();
    
    console.log('🚀 Chat WebSocket Service inicializado');
  }

  setupMiddleware() {
    // Middleware de autenticación
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Token de autenticación requerido'));
        }

        const cleanToken = token.replace('Bearer ', '');
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Verificar si el usuario existe y está activo
        const user = await User.findById(decoded.id).select('_id username firstName lastName avatar status');
        
        if (!user || user.status !== 'active') {
          return next(new Error('Usuario no válido o inactivo'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Error en autenticación WebSocket:', error);
        next(new Error('Autenticación fallida'));
      }
    });

    // Middleware de rate limiting
    this.io.use((socket, next) => {
      const userId = socket.userId;
      const now = Date.now();
      
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      
      const userSockets = this.userSockets.get(userId);
      if (userSockets.size >= 5) { // Máximo 5 conexiones por usuario
        return next(new Error('Demasiadas conexiones simultáneas'));
      }
      
      next();
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 Usuario conectado: ${socket.user.username} (${socket.userId})`);
      
      this.handleConnection(socket);
      this.setupSocketEventHandlers(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    
    // Agregar usuario a la lista de conectados
    this.connectedUsers.set(userId, socket.id);
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    
    // Actualizar estado del usuario
    this.updateUserStatus(userId, 'online');
    
    // Unir a salas de chat existentes
    this.joinUserToExistingRooms(socket);
    
    // Enviar mensajes en cola
    this.sendQueuedMessages(userId);
    
    // Notificar a otros usuarios
    this.notifyUserStatusChange(userId, 'online');
  }

  async joinUserToExistingRooms(socket) {
    try {
      const userId = socket.userId;
      
      // Buscar chats del usuario
      const chats = await Chat.find({
        participants: userId,
        status: 'active'
      }).select('_id type');
      
      for (const chat of chats) {
        const roomId = `chat_${chat._id}`;
        socket.join(roomId);
        
        if (!this.roomMembers.has(roomId)) {
          this.roomMembers.set(roomId, new Set());
        }
        this.roomMembers.get(roomId).add(userId);
        
        console.log(`🏠 Usuario ${userId} unido a sala ${roomId}`);
      }
    } catch (error) {
      console.error('Error uniendo usuario a salas existentes:', error);
    }
  }

  setupSocketEventHandlers(socket) {
    // Manejar desconexión
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Unirse a chat
    socket.on('join_chat', (data) => {
      this.handleJoinChat(socket, data);
    });

    // Salir de chat
    socket.on('leave_chat', (data) => {
      this.handleLeaveChat(socket, data);
    });

    // Enviar mensaje
    socket.on('send_message', (data) => {
      this.handleSendMessage(socket, data);
    });

    // Indicador de escritura
    socket.on('typing_start', (data) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data) => {
      this.handleTypingStop(socket, data);
    });

    // Marcar mensaje como leído
    socket.on('mark_read', (data) => {
      this.handleMarkRead(socket, data);
    });

    // Reaccionar a mensaje
    socket.on('react_to_message', (data) => {
      this.handleMessageReaction(socket, data);
    });

    // Pin/Unpin mensaje
    socket.on('pin_message', (data) => {
      this.handlePinMessage(socket, data);
    });

    // Buscar en chat
    socket.on('search_messages', (data) => {
      this.handleSearchMessages(socket, data);
    });

    // Crear chat
    socket.on('create_chat', (data) => {
      this.handleCreateChat(socket, data);
    });

    // Invitar usuario a chat
    socket.on('invite_user', (data) => {
      this.handleInviteUser(socket, data);
    });

    // Remover usuario de chat
    socket.on('remove_user', (data) => {
      this.handleRemoveUser(socket, data);
    });

    // Actualizar configuración de chat
    socket.on('update_chat_settings', (data) => {
      this.handleUpdateChatSettings(socket, data);
    });

    // Heartbeat para mantener conexión
    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  handleDisconnection(socket) {
    const userId = socket.userId;
    console.log(`👋 Usuario desconectado: ${socket.user.username} (${userId})`);
    
    // Remover socket de la lista del usuario
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(socket.id);
      
      // Si no hay más sockets para este usuario, marcarlo como offline
      if (this.userSockets.get(userId).size === 0) {
        this.connectedUsers.delete(userId);
        this.updateUserStatus(userId, 'offline');
        this.notifyUserStatusChange(userId, 'offline');
      }
    }
    
    // Salir de todas las salas
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
        this.removeUserFromRoom(room, userId);
      }
    });
  }

  async handleJoinChat(socket, data) {
    try {
      const { chatId } = data;
      const userId = socket.userId;
      
      // Verificar que el usuario puede acceder al chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId,
        status: 'active'
      });
      
      if (!chat) {
        socket.emit('error', { message: 'Chat no encontrado o acceso denegado' });
        return;
      }
      
      const roomId = `chat_${chatId}`;
      socket.join(roomId);
      
      if (!this.roomMembers.has(roomId)) {
        this.roomMembers.set(roomId, new Set());
      }
      this.roomMembers.get(roomId).add(userId);
      
      // Notificar a otros usuarios en el chat
      socket.to(roomId).emit('user_joined_chat', {
        chatId,
        user: {
          _id: socket.user._id,
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          avatar: socket.user.avatar
        }
      });
      
      console.log(`🏠 Usuario ${userId} unido a chat ${chatId}`);
    } catch (error) {
      console.error('Error uniendo usuario a chat:', error);
      socket.emit('error', { message: 'Error uniéndose al chat' });
    }
  }

  async handleLeaveChat(socket, data) {
    try {
      const { chatId } = data;
      const userId = socket.userId;
      
      const roomId = `chat_${chatId}`;
      socket.leave(roomId);
      
      this.removeUserFromRoom(roomId, userId);
      
      // Notificar a otros usuarios
      socket.to(roomId).emit('user_left_chat', {
        chatId,
        userId
      });
      
      console.log(`🚪 Usuario ${userId} salió del chat ${chatId}`);
    } catch (error) {
      console.error('Error saliendo del chat:', error);
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { chatId, content, type = 'text', replyTo = null, attachments = [] } = data;
      const userId = socket.userId;
      
      // Verificar que el usuario puede enviar mensajes en este chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId,
        status: 'active'
      });
      
      if (!chat) {
        socket.emit('error', { message: 'Chat no encontrado o acceso denegado' });
        return;
      }
      
      // Crear mensaje
      const message = {
        sender: userId,
        content,
        type,
        replyTo,
        attachments,
        timestamp: new Date(),
        readBy: [userId]
      };
      
      // Agregar mensaje al chat
      chat.messages.push(message);
      await chat.save();
      
      // Preparar mensaje para envío
      const messageData = {
        _id: message._id,
        chatId,
        sender: {
          _id: socket.user._id,
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          avatar: socket.user.avatar
        },
        content,
        type,
        replyTo,
        attachments,
        timestamp: message.timestamp,
        readBy: [userId]
      };
      
      // Enviar mensaje a todos en el chat
      const roomId = `chat_${chatId}`;
      this.io.to(roomId).emit('new_message', messageData);
      
      // Notificar a usuarios offline
      this.notifyOfflineUsers(chatId, messageData);
      
      // Actualizar último mensaje del chat
      chat.lastMessage = message;
      chat.lastActivity = new Date();
      await chat.save();
      
      console.log(`💬 Mensaje enviado en chat ${chatId} por usuario ${userId}`);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      socket.emit('error', { message: 'Error enviando mensaje' });
    }
  }

  async handleTypingStart(socket, data) {
    try {
      const { chatId } = data;
      const userId = socket.userId;
      
      const roomId = `chat_${chatId}`;
      
      if (!this.typingUsers.has(roomId)) {
        this.typingUsers.set(roomId, new Set());
      }
      
      this.typingUsers.get(roomId).add(userId);
      
      // Notificar a otros usuarios
      socket.to(roomId).emit('user_typing', {
        chatId,
        userId,
        username: socket.user.username
      });
    } catch (error) {
      console.error('Error manejando inicio de escritura:', error);
    }
  }

  async handleTypingStop(socket, data) {
    try {
      const { chatId } = data;
      const userId = socket.userId;
      
      const roomId = `chat_${chatId}`;
      
      if (this.typingUsers.has(roomId)) {
        this.typingUsers.get(roomId).delete(userId);
        
        // Si no hay nadie escribiendo, notificar
        if (this.typingUsers.get(roomId).size === 0) {
          socket.to(roomId).emit('user_stopped_typing', {
            chatId,
            userId
          });
        }
      }
    } catch (error) {
      console.error('Error manejando fin de escritura:', error);
    }
  }

  async handleMarkRead(socket, data) {
    try {
      const { chatId, messageIds } = data;
      const userId = socket.userId;
      
      // Marcar mensajes como leídos en la base de datos
      await Chat.updateMany(
        {
          _id: chatId,
          'messages._id': { $in: messageIds }
        },
        {
          $addToSet: {
            'messages.$.readBy': userId
          }
        }
      );
      
      // Notificar a otros usuarios
      const roomId = `chat_${chatId}`;
      socket.to(roomId).emit('messages_read', {
        chatId,
        messageIds,
        userId
      });
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  async handleMessageReaction(socket, data) {
    try {
      const { chatId, messageId, reaction } = data;
      const userId = socket.userId;
      
      // Actualizar reacción en la base de datos
      const chat = await Chat.findById(chatId);
      const message = chat.messages.id(messageId);
      
      if (message) {
        if (!message.reactions) {
          message.reactions = new Map();
        }
        
        message.reactions.set(userId, reaction);
        await chat.save();
        
        // Notificar a otros usuarios
        const roomId = `chat_${chatId}`;
        this.io.to(roomId).emit('message_reaction', {
          chatId,
          messageId,
          userId,
          reaction
        });
      }
    } catch (error) {
      console.error('Error manejando reacción a mensaje:', error);
    }
  }

  async handlePinMessage(socket, data) {
    try {
      const { chatId, messageId, pin } = data;
      const userId = socket.userId;
      
      // Verificar permisos (solo moderadores y propietarios pueden pin/unpin)
      const chat = await Chat.findById(chatId);
      const isModerator = chat.moderators?.includes(userId) || chat.owner?.toString() === userId;
      
      if (!isModerator) {
        socket.emit('error', { message: 'No tienes permisos para pin/unpin mensajes' });
        return;
      }
      
      // Actualizar estado del pin
      if (pin) {
        chat.pinnedMessages = chat.pinnedMessages || [];
        if (!chat.pinnedMessages.includes(messageId)) {
          chat.pinnedMessages.push(messageId);
        }
      } else {
        chat.pinnedMessages = chat.pinnedMessages?.filter(id => id.toString() !== messageId) || [];
      }
      
      await chat.save();
      
      // Notificar a todos en el chat
      const roomId = `chat_${chatId}`;
      this.io.to(roomId).emit('message_pin_updated', {
        chatId,
        messageId,
        pinned: pin
      });
    } catch (error) {
      console.error('Error manejando pin/unpin de mensaje:', error);
      socket.emit('error', { message: 'Error actualizando pin del mensaje' });
    }
  }

  async handleSearchMessages(socket, data) {
    try {
      const { chatId, query, limit = 50 } = data;
      const userId = socket.userId;
      
      // Verificar acceso al chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });
      
      if (!chat) {
        socket.emit('error', { message: 'Chat no encontrado o acceso denegado' });
        return;
      }
      
      // Buscar mensajes
      const searchResults = chat.messages
        .filter(message => 
          message.content.toLowerCase().includes(query.toLowerCase()) ||
          message.sender.toString() === query
        )
        .slice(-limit)
        .map(message => ({
          _id: message._id,
          content: message.content,
          type: message.type,
          sender: message.sender,
          timestamp: message.timestamp
        }));
      
      socket.emit('search_results', {
        chatId,
        query,
        results: searchResults
      });
    } catch (error) {
      console.error('Error buscando mensajes:', error);
      socket.emit('error', { message: 'Error en búsqueda de mensajes' });
    }
  }

  async handleCreateChat(socket, data) {
    try {
      const { type, participants, name, description, isPrivate } = data;
      const userId = socket.userId;
      
      // Crear nuevo chat
      const chat = new Chat({
        type,
        participants: [...participants, userId],
        name: type === 'group' ? name : undefined,
        description: type === 'group' ? description : undefined,
        isPrivate,
        owner: type === 'group' ? userId : undefined,
        status: 'active'
      });
      
      await chat.save();
      
      // Unir a la sala del nuevo chat
      const roomId = `chat_${chat._id}`;
      socket.join(roomId);
      
      if (!this.roomMembers.has(roomId)) {
        this.roomMembers.set(roomId, new Set());
      }
      this.roomMembers.get(roomId).add(userId);
      
      // Notificar a otros participantes
      for (const participantId of participants) {
        if (this.connectedUsers.has(participantId)) {
          this.io.to(this.connectedUsers.get(participantId)).emit('chat_created', {
            chat: {
              _id: chat._id,
              type,
              name,
              description,
              participants: chat.participants,
              owner: chat.owner
            }
          });
        }
      }
      
      socket.emit('chat_created_success', {
        chat: {
          _id: chat._id,
          type,
          name,
          description,
          participants: chat.participants,
          owner: chat.owner
        }
      });
      
      console.log(`✨ Nuevo chat creado: ${chat._id} por usuario ${userId}`);
    } catch (error) {
      console.error('Error creando chat:', error);
      socket.emit('error', { message: 'Error creando chat' });
    }
  }

  async handleInviteUser(socket, data) {
    try {
      const { chatId, userId: invitedUserId } = data;
      const inviterId = socket.userId;
      
      // Verificar permisos
      const chat = await Chat.findById(chatId);
      const canInvite = chat.owner?.toString() === inviterId || 
                       chat.moderators?.includes(inviterId) ||
                       chat.type === 'private';
      
      if (!canInvite) {
        socket.emit('error', { message: 'No tienes permisos para invitar usuarios' });
        return;
      }
      
      // Agregar usuario al chat
      if (!chat.participants.includes(invitedUserId)) {
        chat.participants.push(invitedUserId);
        await chat.save();
        
        // Notificar al usuario invitado
        if (this.connectedUsers.has(invitedUserId)) {
          this.io.to(this.connectedUsers.get(invitedUserId)).emit('invited_to_chat', {
            chatId,
            inviter: {
              _id: socket.user._id,
              username: socket.user.username
            }
          });
        }
        
        // Notificar a otros en el chat
        const roomId = `chat_${chatId}`;
        this.io.to(roomId).emit('user_invited', {
          chatId,
          invitedUserId,
          inviterId
        });
      }
    } catch (error) {
      console.error('Error invitando usuario:', error);
      socket.emit('error', { message: 'Error invitando usuario' });
    }
  }

  async handleRemoveUser(socket, data) {
    try {
      const { chatId, userId: removedUserId } = data;
      const removerId = socket.userId;
      
      // Verificar permisos
      const chat = await Chat.findById(chatId);
      const canRemove = chat.owner?.toString() === removerId || 
                       chat.moderators?.includes(removerId);
      
      if (!canRemove) {
        socket.emit('error', { message: 'No tienes permisos para remover usuarios' });
        return;
      }
      
      // Remover usuario del chat
      chat.participants = chat.participants.filter(id => id.toString() !== removedUserId);
      await chat.save();
      
      // Remover de la sala
      this.removeUserFromRoom(`chat_${chatId}`, removedUserId);
      
      // Notificar al usuario removido
      if (this.connectedUsers.has(removedUserId)) {
        this.io.to(this.connectedUsers.get(removedUserId)).emit('removed_from_chat', {
          chatId,
          removerId
        });
      }
      
      // Notificar a otros en el chat
      const roomId = `chat_${chatId}`;
      this.io.to(roomId).emit('user_removed', {
        chatId,
        removedUserId,
        removerId
      });
    } catch (error) {
      console.error('Error removiendo usuario:', error);
      socket.emit('error', { message: 'Error removiendo usuario' });
    }
  }

  async handleUpdateChatSettings(socket, data) {
    try {
      const { chatId, settings } = data;
      const userId = socket.userId;
      
      // Verificar permisos
      const chat = await Chat.findById(chatId);
      const canUpdate = chat.owner?.toString() === userId || 
                       chat.moderators?.includes(userId);
      
      if (!canUpdate) {
        socket.emit('error', { message: 'No tienes permisos para actualizar configuración' });
        return;
      }
      
      // Actualizar configuración
      Object.assign(chat, settings);
      await chat.save();
      
      // Notificar a todos en el chat
      const roomId = `chat_${chatId}`;
      this.io.to(roomId).emit('chat_settings_updated', {
        chatId,
        settings,
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error actualizando configuración del chat:', error);
      socket.emit('error', { message: 'Error actualizando configuración' });
    }
  }

  // Funciones auxiliares
  removeUserFromRoom(roomId, userId) {
    if (this.roomMembers.has(roomId)) {
      this.roomMembers.get(roomId).delete(userId);
      
      if (this.roomMembers.get(roomId).size === 0) {
        this.roomMembers.delete(roomId);
      }
    }
  }

  async updateUserStatus(userId, status) {
    try {
      await User.findByIdAndUpdate(userId, { status });
      
      // Cachear en Redis
      await redis.hset(`user:${userId}`, 'status', status);
      await redis.expire(`user:${userId}`, 3600); // 1 hora
    } catch (error) {
      console.error('Error actualizando estado del usuario:', error);
    }
  }

  notifyUserStatusChange(userId, status) {
    // Notificar a usuarios que tienen al usuario en sus contactos
    this.io.emit('user_status_changed', {
      userId,
      status
    });
  }

  async notifyOfflineUsers(chatId, messageData) {
    try {
      const chat = await Chat.findById(chatId).populate('participants', 'username');
      
      for (const participant of chat.participants) {
        const participantId = participant._id.toString();
        
        // Si el usuario no está conectado, agregar mensaje a la cola
        if (!this.connectedUsers.has(participantId)) {
          if (!this.messageQueue.has(participantId)) {
            this.messageQueue.set(participantId, []);
          }
          
          this.messageQueue.get(participantId).push(messageData);
          
          // Limitar cola a 100 mensajes
          if (this.messageQueue.get(participantId).length > 100) {
            this.messageQueue.get(participantId).shift();
          }
        }
      }
    } catch (error) {
      console.error('Error notificando usuarios offline:', error);
    }
  }

  async sendQueuedMessages(userId) {
    try {
      if (this.messageQueue.has(userId)) {
        const messages = this.messageQueue.get(userId);
        
        for (const message of messages) {
          // Enviar mensaje al usuario
          const socketId = this.connectedUsers.get(userId);
          if (socketId) {
            this.io.to(socketId).emit('queued_message', message);
          }
        }
        
        // Limpiar cola
        this.messageQueue.delete(userId);
      }
    } catch (error) {
      console.error('Error enviando mensajes en cola:', error);
    }
  }

  startCleanupInterval() {
    // Limpiar usuarios desconectados cada 5 minutos
    setInterval(() => {
      this.cleanupDisconnectedUsers();
    }, 5 * 60 * 1000);
  }

  async cleanupDisconnectedUsers() {
    try {
      const now = Date.now();
      const disconnectedUsers = [];
      
      for (const [userId, socketId] of this.connectedUsers.entries()) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (!socket || !socket.connected) {
          disconnectedUsers.push(userId);
        }
      }
      
      for (const userId of disconnectedUsers) {
        this.connectedUsers.delete(userId);
        this.updateUserStatus(userId, 'offline');
        this.notifyUserStatusChange(userId, 'offline');
      }
      
      if (disconnectedUsers.length > 0) {
        console.log(`🧹 Limpiados ${disconnectedUsers.length} usuarios desconectados`);
      }
    } catch (error) {
      console.error('Error en limpieza de usuarios desconectados:', error);
    }
  }

  // Funciones públicas para uso externo
  sendNotificationToUser(userId, notification) {
    if (this.connectedUsers.has(userId)) {
      const socketId = this.connectedUsers.get(userId);
      this.io.to(socketId).emit('notification', notification);
    }
  }

  sendNotificationToChat(chatId, notification) {
    const roomId = `chat_${chatId}`;
    this.io.to(roomId).emit('chat_notification', notification);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getRoomMembers(roomId) {
    return this.roomMembers.get(roomId) || new Set();
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Limpiar recursos
  cleanup() {
    if (this.io) {
      this.io.close();
    }
    
    this.connectedUsers.clear();
    this.userSockets.clear();
    this.roomMembers.clear();
    this.typingUsers.clear();
    this.messageQueue.clear();
    
    console.log('🧹 Chat WebSocket Service limpiado');
  }
}

module.exports = ChatWebSocketService;
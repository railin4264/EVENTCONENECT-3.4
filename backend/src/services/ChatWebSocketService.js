const { redis } = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { Chat, User, Event, Tribe } = require('../models');

/**
 * WebSocket service for real-time chat functionality
 */
class ChatWebSocketService {
  constructor(io) {
    this.io = io;
    this.activeConnections = new Map();
    this.userRooms = new Map();
    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', socket => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new WebSocket connection
   * @param {object} socket - Socket instance
   */
  handleConnection(socket) {
    console.log(`Nueva conexión de chat: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-personal-room', async userId => {
      try {
        await this.joinPersonalRoom(socket, userId);
      } catch (error) {
        console.error('Error joining personal room:', error);
        socket.emit('error', { message: 'Error al unirse a la sala personal' });
      }
    });

    // Join event chat room
    socket.on('join-event-room', async data => {
      try {
        await this.joinEventRoom(socket, data.eventId, data.userId);
      } catch (error) {
        console.error('Error joining event room:', error);
        socket.emit('error', {
          message: 'Error al unirse a la sala del evento',
        });
      }
    });

    // Join tribe chat room
    socket.on('join-tribe-room', async data => {
      try {
        await this.joinTribeRoom(socket, data.tribeId, data.userId);
      } catch (error) {
        console.error('Error joining tribe room:', error);
        socket.emit('error', {
          message: 'Error al unirse a la sala de la tribu',
        });
      }
    });

    // Handle new message
    socket.on('send-message', async messageData => {
      try {
        await this.handleNewMessage(socket, messageData);
      } catch (error) {
        console.error('Error handling new message:', error);
        socket.emit('error', { message: 'Error al enviar mensaje' });
      }
    });

    // Handle typing indicator
    socket.on('typing', async data => {
      try {
        await this.handleTypingIndicator(socket, data);
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    // Handle message reactions
    socket.on('react-to-message', async data => {
      try {
        await this.handleMessageReaction(socket, data);
      } catch (error) {
        console.error('Error handling message reaction:', error);
        socket.emit('error', { message: 'Error al reaccionar al mensaje' });
      }
    });

    // Handle message deletion
    socket.on('delete-message', async data => {
      try {
        await this.handleMessageDeletion(socket, data);
      } catch (error) {
        console.error('Error handling message deletion:', error);
        socket.emit('error', { message: 'Error al eliminar mensaje' });
      }
    });

    // Handle message editing
    socket.on('edit-message', async data => {
      try {
        await this.handleMessageEdit(socket, data);
      } catch (error) {
        console.error('Error handling message edit:', error);
        socket.emit('error', { message: 'Error al editar mensaje' });
      }
    });

    // Handle user status updates
    socket.on('update-status', async data => {
      try {
        await this.handleStatusUpdate(socket, data);
      } catch (error) {
        console.error('Error handling status update:', error);
      }
    });

    // Handle file sharing
    socket.on('share-file', async data => {
      try {
        await this.handleFileShare(socket, data);
      } catch (error) {
        console.error('Error handling file share:', error);
        socket.emit('error', { message: 'Error al compartir archivo' });
      }
    });

    // Handle voice messages
    socket.on('send-voice-message', async data => {
      try {
        await this.handleVoiceMessage(socket, data);
      } catch (error) {
        console.error('Error handling voice message:', error);
        socket.emit('error', { message: 'Error al enviar mensaje de voz' });
      }
    });

    // Handle video calls
    socket.on('start-video-call', async data => {
      try {
        await this.handleVideoCallStart(socket, data);
      } catch (error) {
        console.error('Error handling video call start:', error);
        socket.emit('error', { message: 'Error al iniciar videollamada' });
      }
    });

    // Handle call acceptance
    socket.on('accept-call', async data => {
      try {
        await this.handleCallAcceptance(socket, data);
      } catch (error) {
        console.error('Error handling call acceptance:', error);
        socket.emit('error', { message: 'Error al aceptar llamada' });
      }
    });

    // Handle call rejection
    socket.on('reject-call', async data => {
      try {
        await this.handleCallRejection(socket, data);
      } catch (error) {
        console.error('Error handling call rejection:', error);
      }
    });

    // Handle call end
    socket.on('end-call', async data => {
      try {
        await this.handleCallEnd(socket, data);
      } catch (error) {
        console.error('Error handling call end:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Join user to their personal chat room
   * @param {object} socket - Socket instance
   * @param {string} userId - User ID
   */
  async joinPersonalRoom(socket, userId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Join personal room
      const personalRoom = `personal:${userId}`;
      socket.join(personalRoom);
      this.activeConnections.set(socket.id, userId);
      this.userRooms.set(userId, personalRoom);

      // Send confirmation
      socket.emit('joined-room', {
        room: personalRoom,
        type: 'personal',
        message: 'Conectado a sala personal',
      });

      // Update user status
      await this.updateUserStatus(userId, 'online');
      this.broadcastUserStatus(userId, 'online');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Join event chat room
   * @param {object} socket - Socket instance
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   */
  async joinEventRoom(socket, eventId, userId) {
    try {
      // Verify event exists and user has access
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      // Check if user is attending or hosting the event
      const hasAccess =
        event.attendees.includes(userId) || event.host.toString() === userId;
      if (!hasAccess) {
        throw new AppError('No tienes acceso a este evento', 403);
      }

      // Join event room
      const eventRoom = `event:${eventId}`;
      socket.join(eventRoom);
      this.activeConnections.set(socket.id, userId);

      // Send confirmation
      socket.emit('joined-room', {
        room: eventRoom,
        type: 'event',
        eventId,
        message: 'Conectado a sala del evento',
      });

      // Notify other users in the room
      socket.to(eventRoom).emit('user-joined', {
        userId,
        username: (await User.findById(userId)).username,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Join tribe chat room
   * @param {object} socket - Socket instance
   * @param {string} tribeId - Tribe ID
   * @param {string} userId - User ID
   */
  async joinTribeRoom(socket, tribeId, userId) {
    try {
      // Verify tribe exists and user is a member
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if user is a member
      const isMember = tribe.members.includes(userId);
      if (!isMember) {
        throw new AppError('No eres miembro de esta tribu', 403);
      }

      // Join tribe room
      const tribeRoom = `tribe:${tribeId}`;
      socket.join(tribeRoom);
      this.activeConnections.set(socket.id, userId);

      // Send confirmation
      socket.emit('joined-room', {
        room: tribeRoom,
        type: 'tribe',
        tribeId,
        message: 'Conectado a sala de la tribu',
      });

      // Notify other users in the room
      socket.to(tribeRoom).emit('user-joined', {
        userId,
        username: (await User.findById(userId)).username,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle new message from user
   * @param {object} socket - Socket instance
   * @param {object} messageData - Message data
   */
  async handleNewMessage(socket, messageData) {
    try {
      const { content, room, type, userId, eventId, tribeId } = messageData;

      // Validate message data
      if (!content || !room || !type || !userId) {
        throw new AppError('Datos del mensaje incompletos', 400);
      }

      // Create message object
      const message = {
        id: Date.now().toString(),
        content,
        sender: userId,
        room,
        type,
        timestamp: new Date(),
        eventId,
        tribeId,
      };

      // Save message to database
      const savedMessage = await this.saveMessage(message);

      // Broadcast message to room
      this.io.to(room).emit('new-message', savedMessage);

      // Update last activity
      await this.updateLastActivity(room, type, eventId, tribeId);

      // Send confirmation to sender
      socket.emit('message-sent', {
        messageId: savedMessage.id,
        timestamp: savedMessage.timestamp,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle typing indicator
   * @param {object} socket - Socket instance
   * @param {object} data - Typing data
   */
  async handleTypingIndicator(socket, data) {
    try {
      const { room, userId, isTyping } = data;

      if (!room || !userId) {
        return;
      }

      // Broadcast typing indicator to room
      socket.to(room).emit('user-typing', {
        userId,
        isTyping,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  }

  /**
   * Handle message reaction
   * @param {object} socket - Socket instance
   * @param {object} data - Reaction data
   */
  async handleMessageReaction(socket, data) {
    try {
      const { messageId, reaction, userId, room } = data;

      // Validate reaction data
      if (!messageId || !reaction || !userId) {
        throw new AppError('Datos de reacción incompletos', 400);
      }

      // Save reaction to database
      const savedReaction = await this.saveMessageReaction(
        messageId,
        reaction,
        userId
      );

      // Broadcast reaction to room
      this.io.to(room).emit('message-reaction', {
        messageId,
        reaction: savedReaction,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle message deletion
   * @param {object} socket - Socket instance
   * @param {object} data - Deletion data
   */
  async handleMessageDeletion(socket, data) {
    try {
      const { messageId, userId, room } = data;

      // Validate deletion data
      if (!messageId || !userId) {
        throw new AppError('Datos de eliminación incompletos', 400);
      }

      // Check if user can delete the message
      const canDelete = await this.canDeleteMessage(messageId, userId);
      if (!canDelete) {
        throw new AppError('No puedes eliminar este mensaje', 403);
      }

      // Delete message from database
      await this.deleteMessage(messageId);

      // Broadcast deletion to room
      this.io.to(room).emit('message-deleted', {
        messageId,
        deletedBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle message editing
   * @param {object} socket - Socket instance
   * @param {object} data - Edit data
   */
  async handleMessageEdit(socket, data) {
    try {
      const { messageId, newContent, userId, room } = data;

      // Validate edit data
      if (!messageId || !newContent || !userId) {
        throw new AppError('Datos de edición incompletos', 400);
      }

      // Check if user can edit the message
      const canEdit = await this.canEditMessage(messageId, userId);
      if (!canEdit) {
        throw new AppError('No puedes editar este mensaje', 403);
      }

      // Update message in database
      const updatedMessage = await this.updateMessage(messageId, newContent);

      // Broadcast update to room
      this.io.to(room).emit('message-edited', {
        messageId,
        newContent,
        editedBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle user status update
   * @param {object} socket - Socket instance
   * @param {object} data - Status data
   */
  async handleStatusUpdate(socket, data) {
    try {
      const { status, userId } = data;

      if (!status || !userId) {
        return;
      }

      // Update user status
      await this.updateUserStatus(userId, status);

      // Broadcast status to all connected users
      this.broadcastUserStatus(userId, status);
    } catch (error) {
      console.error('Error handling status update:', error);
    }
  }

  /**
   * Handle file sharing
   * @param {object} socket - Socket instance
   * @param {object} data - File data
   */
  async handleFileShare(socket, data) {
    try {
      const { file, room, userId, type, eventId, tribeId } = data;

      // Validate file data
      if (!file || !room || !userId) {
        throw new AppError('Datos del archivo incompletos', 400);
      }

      // Process and save file
      const savedFile = await this.processAndSaveFile(file, userId);

      // Create file message
      const fileMessage = {
        id: Date.now().toString(),
        type: 'file',
        file: savedFile,
        sender: userId,
        room,
        timestamp: new Date(),
        eventId,
        tribeId,
      };

      // Save file message to database
      const savedMessage = await this.saveMessage(fileMessage);

      // Broadcast file message to room
      this.io.to(room).emit('new-file-message', savedMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle voice message
   * @param {object} socket - Socket instance
   * @param {object} data - Voice message data
   */
  async handleVoiceMessage(socket, data) {
    try {
      const { audioData, room, userId, eventId, tribeId } = data;

      // Validate voice message data
      if (!audioData || !room || !userId) {
        throw new AppError('Datos del mensaje de voz incompletos', 400);
      }

      // Process and save audio
      const savedAudio = await this.processAndSaveAudio(audioData, userId);

      // Create voice message
      const voiceMessage = {
        id: Date.now().toString(),
        type: 'voice',
        audio: savedAudio,
        sender: userId,
        room,
        timestamp: new Date(),
        eventId,
        tribeId,
      };

      // Save voice message to database
      const savedMessage = await this.saveMessage(voiceMessage);

      // Broadcast voice message to room
      this.io.to(room).emit('new-voice-message', savedMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle video call start
   * @param {object} socket - Socket instance
   * @param {object} data - Call data
   */
  async handleVideoCallStart(socket, data) {
    try {
      const { targetUserId, userId, room } = data;

      // Validate call data
      if (!targetUserId || !userId) {
        throw new AppError('Datos de llamada incompletos', 400);
      }

      // Check if target user is online
      const targetSocket = this.getUserSocket(targetUserId);
      if (!targetSocket) {
        throw new AppError('Usuario no está en línea', 400);
      }

      // Create call session
      const callSession = await this.createCallSession(
        userId,
        targetUserId,
        room
      );

      // Send call request to target user
      targetSocket.emit('incoming-call', {
        callerId: userId,
        callerName: (await User.findById(userId)).username,
        callId: callSession.id,
        timestamp: new Date(),
      });

      // Send confirmation to caller
      socket.emit('call-initiated', {
        callId: callSession.id,
        targetUserId,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle call acceptance
   * @param {object} socket - Socket instance
   * @param {object} data - Acceptance data
   */
  async handleCallAcceptance(socket, data) {
    try {
      const { callId, userId } = data;

      // Validate acceptance data
      if (!callId || !userId) {
        throw new AppError('Datos de aceptación incompletos', 400);
      }

      // Update call session
      const callSession = await this.updateCallSession(callId, 'accepted');

      // Notify caller that call was accepted
      const callerSocket = this.getUserSocket(callSession.callerId);
      if (callerSocket) {
        callerSocket.emit('call-accepted', {
          callId,
          acceptedBy: userId,
          timestamp: new Date(),
        });
      }

      // Send confirmation to acceptor
      socket.emit('call-accepted-confirmation', {
        callId,
        timestamp: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle call rejection
   * @param {object} socket - Socket instance
   * @param {object} data - Rejection data
   */
  async handleCallRejection(socket, data) {
    try {
      const { callId, userId, reason } = data;

      // Validate rejection data
      if (!callId || !userId) {
        throw new AppError('Datos de rechazo incompletos', 400);
      }

      // Update call session
      const callSession = await this.updateCallSession(
        callId,
        'rejected',
        reason
      );

      // Notify caller that call was rejected
      const callerSocket = this.getUserSocket(callSession.callerId);
      if (callerSocket) {
        callerSocket.emit('call-rejected', {
          callId,
          rejectedBy: userId,
          reason,
          timestamp: new Date(),
        });
      }

      // Send confirmation to rejector
      socket.emit('call-rejected-confirmation', {
        callId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error handling call rejection:', error);
    }
  }

  /**
   * Handle call end
   * @param {object} socket - Socket instance
   * @param {object} data - End call data
   */
  async handleCallEnd(socket, data) {
    try {
      const { callId, userId } = data;

      // Validate end call data
      if (!callId || !userId) {
        throw new AppError('Datos de fin de llamada incompletos', 400);
      }

      // Update call session
      const callSession = await this.updateCallSession(callId, 'ended');

      // Notify all participants that call ended
      const participants = [callSession.callerId, callSession.targetId];
      participants.forEach(participantId => {
        const participantSocket = this.getUserSocket(participantId);
        if (participantSocket) {
          participantSocket.emit('call-ended', {
            callId,
            endedBy: userId,
            timestamp: new Date(),
          });
        }
      });
    } catch (error) {
      console.error('Error handling call end:', error);
    }
  }

  /**
   * Handle user disconnection
   * @param {object} socket - Socket instance
   */
  handleDisconnection(socket) {
    try {
      const userId = this.activeConnections.get(socket.id);
      if (userId) {
        // Update user status
        this.updateUserStatus(userId, 'offline');
        this.broadcastUserStatus(userId, 'offline');

        // Remove from active connections
        this.activeConnections.delete(socket.id);
        this.userRooms.delete(userId);

        console.log(`Usuario desconectado: ${userId}`);
      }
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  }

  /**
   * Get socket for a specific user
   * @param {string} userId - User ID
   * @returns {object} Socket instance or null
   */
  getUserSocket(userId) {
    for (const [socketId, connectedUserId] of this.activeConnections) {
      if (connectedUserId === userId) {
        return this.io.sockets.sockets.get(socketId);
      }
    }
    return null;
  }

  /**
   * Update user status
   * @param {string} userId - User ID
   * @param {string} status - User status
   */
  async updateUserStatus(userId, status) {
    try {
      await User.findByIdAndUpdate(userId, { status });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  /**
   * Broadcast user status to all connected users
   * @param {string} userId - User ID
   * @param {string} status - User status
   */
  broadcastUserStatus(userId, status) {
    this.io.emit('user-status-update', {
      userId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Save message to database
   * @param {object} message - Message object
   * @returns {object} Saved message
   */
  async saveMessage(message) {
    try {
      // This would typically save to a Chat model
      // For now, return the message with a timestamp
      return {
        ...message,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new AppError(`Error al guardar mensaje: ${error.message}`, 500);
    }
  }

  /**
   * Save message reaction to database
   * @param {string} messageId - Message ID
   * @param {string} reaction - Reaction type
   * @param {string} userId - User ID
   * @returns {object} Saved reaction
   */
  async saveMessageReaction(messageId, reaction, userId) {
    try {
      // This would typically save to a database
      // For now, return the reaction data
      return {
        messageId,
        reaction,
        userId,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new AppError(`Error al guardar reacción: ${error.message}`, 500);
    }
  }

  /**
   * Check if user can delete a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @returns {boolean} Whether user can delete the message
   */
  async canDeleteMessage(messageId, userId) {
    try {
      // This would typically check permissions in database
      // For now, return true for demonstration
      return true;
    } catch (error) {
      console.error('Error checking delete permission:', error);
      return false;
    }
  }

  /**
   * Delete message from database
   * @param {string} messageId - Message ID
   */
  async deleteMessage(messageId) {
    try {
      // This would typically delete from database
      console.log(`Message ${messageId} deleted`);
    } catch (error) {
      throw new AppError(`Error al eliminar mensaje: ${error.message}`, 500);
    }
  }

  /**
   * Check if user can edit a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @returns {boolean} Whether user can edit the message
   */
  async canEditMessage(messageId, userId) {
    try {
      // This would typically check permissions in database
      // For now, return true for demonstration
      return true;
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  }

  /**
   * Update message in database
   * @param {string} messageId - Message ID
   * @param {string} newContent - New message content
   * @returns {object} Updated message
   */
  async updateMessage(messageId, newContent) {
    try {
      // This would typically update in database
      // For now, return the updated message data
      return {
        id: messageId,
        content: newContent,
        updatedAt: new Date(),
      };
    } catch (error) {
      throw new AppError(`Error al actualizar mensaje: ${error.message}`, 500);
    }
  }

  /**
   * Process and save file
   * @param {object} file - File data
   * @param {string} userId - User ID
   * @returns {object} Saved file info
   */
  async processAndSaveFile(file, userId) {
    try {
      // This would typically process and save file
      // For now, return the file info
      return {
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: userId,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new AppError(`Error al procesar archivo: ${error.message}`, 500);
    }
  }

  /**
   * Process and save audio
   * @param {object} audioData - Audio data
   * @param {string} userId - User ID
   * @returns {object} Saved audio info
   */
  async processAndSaveAudio(audioData, userId) {
    try {
      // This would typically process and save audio
      // For now, return the audio info
      return {
        duration: audioData.duration,
        format: audioData.format,
        uploadedBy: userId,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new AppError(`Error al procesar audio: ${error.message}`, 500);
    }
  }

  /**
   * Create call session
   * @param {string} callerId - Caller ID
   * @param {string} targetId - Target user ID
   * @param {string} room - Room ID
   * @returns {object} Call session
   */
  async createCallSession(callerId, targetId, room) {
    try {
      // This would typically create a call session in database
      // For now, return the session data
      return {
        id: Date.now().toString(),
        callerId,
        targetId,
        room,
        status: 'initiated',
        createdAt: new Date(),
      };
    } catch (error) {
      throw new AppError(
        `Error al crear sesión de llamada: ${error.message}`,
        500
      );
    }
  }

  /**
   * Update call session
   * @param {string} callId - Call ID
   * @param {string} status - New status
   * @param {string} reason - Reason for status change
   * @returns {object} Updated call session
   */
  async updateCallSession(callId, status, reason = null) {
    try {
      // This would typically update in database
      // For now, return the updated session data
      return {
        id: callId,
        status,
        reason,
        updatedAt: new Date(),
      };
    } catch (error) {
      throw new AppError(
        `Error al actualizar sesión de llamada: ${error.message}`,
        500
      );
    }
  }

  /**
   * Update last activity for a room
   * @param {string} room - Room ID
   * @param {string} type - Room type
   * @param {string} eventId - Event ID (if applicable)
   * @param {string} tribeId - Tribe ID (if applicable)
   */
  async updateLastActivity(room, type, eventId, tribeId) {
    try {
      // This would typically update last activity in database
      console.log(`Last activity updated for room: ${room}`);
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }
}

module.exports = ChatWebSocketService;

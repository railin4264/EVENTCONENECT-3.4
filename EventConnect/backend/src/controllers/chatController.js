const Chat = require('../models/Chat');
const User = require('../models/User');
const Event = require('../models/Event');
const Tribe = require('../models/Tribe');
const { validationResult } = require('express-validator');

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      sort = 'lastMessage.timestamp',
      order = 'desc'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const chats = await Chat.findUserChats(req.user.id, options);
    const total = await Chat.countDocuments({ 'participants.user': req.user.id, status: 'active' });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo chats del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.user', 'username firstName lastName avatar')
      .populate('messages.sender', 'username firstName lastName avatar')
      .populate('pinnedMessages.message', 'content sender createdAt')
      .populate('eventChat.event', 'title dateTime location')
      .populate('tribeChat.tribe', 'name description images');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Mark messages as read for this user
    await chat.markAsRead(req.user.id);

    res.json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Error obteniendo chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create or get private chat
// @route   POST /api/chat/private
// @access  Private
const createPrivateChat = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { otherUserId } = req.body;

    // Check if user is trying to chat with themselves
    if (otherUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes crear un chat contigo mismo'
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Check if private chat already exists
    let chat = await Chat.findPrivateChat(req.user.id, otherUserId);

    if (!chat) {
      // Create new private chat
      chat = new Chat({
        type: 'private',
        privateChat: {
          user1: req.user.id,
          user2: otherUserId
        },
        participants: [
          {
            user: req.user.id,
            role: 'member',
            isActive: true
          },
          {
            user: otherUserId,
            role: 'member',
            isActive: true
          }
        ]
      });

      await chat.save();
    }

    // Populate chat for response
    await chat.populate('participants.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Error creando chat privado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      participants,
      isPublic = false,
      maxParticipants = 100
    } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de participantes es requerida'
      });
    }

    // Add creator to participants
    const allParticipants = [...new Set([req.user.id, ...participants])];

    // Check if participants exist
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'Uno o más usuarios no encontrados'
      });
    }

    // Create group chat
    const chat = new Chat({
      type: 'group',
      name,
      description,
      groupChat: {
        creator: req.user.id,
        admins: [req.user.id],
        isPublic,
        maxParticipants
      },
      participants: allParticipants.map(userId => ({
        user: userId,
        role: userId === req.user.id ? 'admin' : 'member',
        isActive: true
      }))
    });

    await chat.save();

    // Populate chat for response
    await chat.populate('participants.user', 'username firstName lastName avatar');
    await chat.populate('groupChat.creator', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Chat grupal creado exitosamente',
      data: { chat }
    });

  } catch (error) {
    console.error('Error creando chat grupal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { content, type = 'text', media, replyTo } = req.body;
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id && p.isActive
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Check if user is muted
    const participant = chat.participants.find(p => p.user.toString() === req.user.id);
    if (participant && participant.isMuted) {
      return res.status(403).json({
        success: false,
        message: 'Estás silenciado en este chat'
      });
    }

    // Check slow mode
    if (chat.settings.moderation.slowMode && chat.settings.moderation.slowModeInterval > 0) {
      const lastMessage = chat.messages
        .filter(m => m.sender.toString() === req.user.id)
        .sort((a, b) => b.createdAt - a.createdAt)[0];

      if (lastMessage) {
        const timeSinceLastMessage = Date.now() - lastMessage.createdAt.getTime();
        if (timeSinceLastMessage < chat.settings.moderation.slowModeInterval * 1000) {
          return res.status(429).json({
            success: false,
            message: 'Modo lento activado. Espera antes de enviar otro mensaje'
          });
        }
      }
    }

    // Add message to chat
    await chat.addMessage(req.user.id, content, type, media);

    // Populate message for response
    const lastMessage = chat.messages[chat.messages.length - 1];
    await lastMessage.populate('sender', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: { message: lastMessage }
    });

  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:id/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      before,
      after
    } = req.query;

    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Build query for messages
    let query = { _id: { $in: chat.messages } };
    
    if (before) {
      query.createdAt = { ...query.createdAt, $lt: new Date(before) };
    }
    if (after) {
      query.createdAt = { ...query.createdAt, $gt: new Date(after) };
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Chat.aggregate([
      { $match: { _id: chat._id } },
      { $unwind: '$messages' },
      { $replaceRoot: { newRoot: '$messages' } },
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      { $unwind: '$sender' },
      {
        $project: {
          _id: 1,
          content: 1,
          type: 1,
          media: 1,
          createdAt: 1,
          isEdited: 1,
          editedAt: 1,
          'sender._id': 1,
          'sender.username': 1,
          'sender.firstName': 1,
          'sender.lastName': 1,
          'sender.avatar': 1
        }
      }
    ]);

    const total = chat.messages.length;

    // Mark messages as read for this user
    await chat.markAsRead(req.user.id);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo mensajes del chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Edit message
// @route   PUT /api/chat/:id/messages/:messageId
// @access  Private
const editMessage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { content } = req.body;
    const { id: chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Edit message
    await chat.editMessage(messageId, req.user.id, content);

    res.json({
      success: true,
      message: 'Mensaje editado exitosamente'
    });

  } catch (error) {
    console.error('Error editando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/:id/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { id: chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Delete message
    await chat.deleteMessage(messageId, req.user.id);

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/:id/messages/:messageId/reactions
// @access  Private
const addReaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { emoji } = req.body;
    const { id: chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Add reaction
    await chat.addReaction(messageId, req.user.id, emoji);

    res.json({
      success: true,
      message: 'Reacción agregada exitosamente'
    });

  } catch (error) {
    console.error('Error agregando reacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Pin/Unpin message
// @route   POST /api/chat/:id/messages/:messageId/pin
// @access  Private
const togglePinMessage = async (req, res) => {
  try {
    const { id: chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Check if user is admin/moderator for group chats
    if (chat.type === 'group') {
      const participant = chat.participants.find(p => p.user.toString() === req.user.id);
      if (!participant || (participant.role !== 'admin' && participant.role !== 'moderator')) {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores y moderadores pueden fijar mensajes'
        });
      }
    }

    // Toggle pin
    await chat.pinMessage(messageId, req.user.id);

    res.json({
      success: true,
      message: 'Estado de fijación del mensaje actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error fijando/desfijando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add participant to group chat
// @route   POST /api/chat/:id/participants
// @access  Private
const addParticipant = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { userId, role = 'member' } = req.body;
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if chat is group type
    if (chat.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden agregar participantes a chats grupales'
      });
    }

    // Check if user is admin
    const isAdmin = chat.participants.some(
      p => p.user.toString() === req.user.id && p.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden agregar participantes'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Check if user is already participant
    const isAlreadyParticipant = chat.participants.some(
      p => p.user.toString() === userId
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es participante del chat'
      });
    }

    // Check max participants
    if (chat.participants.length >= chat.groupChat.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'El chat ha alcanzado el límite máximo de participantes'
      });
    }

    // Add participant
    await chat.addParticipant(userId, role);

    // Populate chat for response
    await chat.populate('participants.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Participante agregado exitosamente',
      data: { chat }
    });

  } catch (error) {
    console.error('Error agregando participante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove participant from group chat
// @route   DELETE /api/chat/:id/participants/:userId
// @access  Private
const removeParticipant = async (req, res) => {
  try {
    const { id: chatId, userId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if chat is group type
    if (chat.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden remover participantes de chats grupales'
      });
    }

    // Check if user is admin
    const isAdmin = chat.participants.some(
      p => p.user.toString() === req.user.id && p.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden remover participantes'
      });
    }

    // Check if trying to remove admin
    const participantToRemove = chat.participants.find(p => p.user.toString() === userId);
    if (participantToRemove && participantToRemove.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No se puede remover a un administrador'
      });
    }

    // Remove participant
    await chat.removeParticipant(userId);

    res.json({
      success: true,
      message: 'Participante removido exitosamente'
    });

  } catch (error) {
    console.error('Error removiendo participante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Leave group chat
// @route   POST /api/chat/:id/leave
// @access  Private
const leaveChat = async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'No eres participante de este chat'
      });
    }

    // Check if user is the only admin
    if (chat.type === 'group') {
      const admins = chat.participants.filter(p => p.role === 'admin');
      const isOnlyAdmin = admins.length === 1 && admins[0].user.toString() === req.user.id;

      if (isOnlyAdmin) {
        return res.status(400).json({
          success: false,
          message: 'No puedes dejar el chat siendo el único administrador'
        });
      }
    }

    // Remove participant
    await chat.removeParticipant(req.user.id);

    res.json({
      success: true,
      message: 'Has dejado el chat exitosamente'
    });

  } catch (error) {
    console.error('Error dejando chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat settings
// @route   GET /api/chat/:id/settings
// @access  Private
const getChatSettings = async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    res.json({
      success: true,
      data: { settings: chat.settings }
    });

  } catch (error) {
    console.error('Error obteniendo configuración del chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update chat settings
// @route   PUT /api/chat/:id/settings
// @access  Private
const updateChatSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const chatId = req.params.id;
    const updateFields = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is admin
    const isAdmin = chat.participants.some(
      p => p.user.toString() === req.user.id && p.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden actualizar la configuración'
      });
    }

    // Update settings
    Object.assign(chat.settings, updateFields);
    await chat.save();

    res.json({
      success: true,
      message: 'Configuración del chat actualizada exitosamente',
      data: { settings: chat.settings }
    });

  } catch (error) {
    console.error('Error actualizando configuración del chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserChats,
  getChat,
  createPrivateChat,
  createGroupChat,
  sendMessage,
  getChatMessages,
  editMessage,
  deleteMessage,
  addReaction,
  togglePinMessage,
  addParticipant,
  removeParticipant,
  leaveChat,
  getChatSettings,
  updateChatSettings
};
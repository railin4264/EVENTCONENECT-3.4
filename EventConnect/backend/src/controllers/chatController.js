const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { validateChatMessage } = require('../middleware/validation');
const { Chat, User, Event, Tribe } = require('../models');

class ChatController {
  // Create new chat
  createChat = asyncHandler(async (req, res, next) => {
    try {
      const chatData = req.body;
      const userId = req.user.id;

      // Add creator information
      chatData.creator = userId;
      chatData.participants = [userId];
      chatData.status = 'active';

      // Validate chat type and participants
      if (chatData.type === 'private') {
        if (!chatData.participants || chatData.participants.length !== 2) {
          throw new AppError(
            'Los chats privados deben tener exactamente 2 participantes',
            400
          );
        }

        // Check if private chat already exists between these users
        const existingChat = await Chat.findOne({
          type: 'private',
          participants: { $all: chatData.participants },
          status: 'active',
        });

        if (existingChat) {
          return res.status(200).json({
            success: true,
            message: 'Chat privado ya existe',
            data: { chat: existingChat },
          });
        }
      } else if (chatData.type === 'group') {
        if (!chatData.name) {
          throw new AppError('Los chats grupales deben tener un nombre', 400);
        }
        if (!chatData.participants || chatData.participants.length < 3) {
          throw new AppError(
            'Los chats grupales deben tener al menos 3 participantes',
            400
          );
        }
      } else if (chatData.type === 'event') {
        if (!chatData.event) {
          throw new AppError(
            'Los chats de evento deben especificar el evento',
            400
          );
        }

        // Verify event exists and user is attending
        const event = await Event.findById(chatData.event);
        if (!event) {
          throw new AppError('Evento no encontrado', 404);
        }
        if (!event.attendees.includes(userId)) {
          throw new AppError(
            'Solo puedes crear chats para eventos a los que asistas',
            403
          );
        }

        // Check if event chat already exists
        const existingEventChat = await Chat.findOne({
          type: 'event',
          event: chatData.event,
          status: 'active',
        });

        if (existingEventChat) {
          return res.status(200).json({
            success: true,
            message: 'Chat de evento ya existe',
            data: { chat: existingEventChat },
          });
        }
      } else if (chatData.type === 'tribe') {
        if (!chatData.tribe) {
          throw new AppError(
            'Los chats de tribu deben especificar la tribu',
            400
          );
        }

        // Verify tribe exists and user is member
        const tribe = await Tribe.findById(chatData.tribe);
        if (!tribe) {
          throw new AppError('Tribu no encontrada', 404);
        }
        if (!tribe.members.includes(userId)) {
          throw new AppError(
            'Solo puedes crear chats para tribus de las que seas miembro',
            403
          );
        }

        // Check if tribe chat already exists
        const existingTribeChat = await Chat.findOne({
          type: 'tribe',
          tribe: chatData.tribe,
          status: 'active',
        });

        if (existingTribeChat) {
          return res.status(200).json({
            success: true,
            message: 'Chat de tribu ya existe',
            data: { chat: existingTribeChat },
          });
        }
      }

      // Create chat
      const chat = new Chat(chatData);
      await chat.save();

      // Populate chat data
      await chat.populate('creator', 'username firstName lastName avatar');
      await chat.populate('participants', 'username firstName lastName avatar');
      if (chat.event) await chat.populate('event', 'title startDate endDate');
      if (chat.tribe) await chat.populate('tribe', 'name category');

      res.status(201).json({
        success: true,
        message: 'Chat creado exitosamente',
        data: { chat },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user's chats
  getUserChats = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { type, page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {
        participants: userId,
        status: 'active',
      };

      if (type && type !== 'all') {
        query.type = type;
      }

      const chats = await Chat.find(query)
        .populate('creator', 'username firstName lastName avatar')
        .populate('participants', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate')
        .populate('tribe', 'name category')
        .populate('lastMessage.author', 'username firstName lastName avatar')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Chat.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          chats,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get chat by ID
  getChatById = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const chat = await Chat.findById(chatId)
        .populate('creator', 'username firstName lastName avatar')
        .populate('participants', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate')
        .populate('tribe', 'name category')
        .populate(
          'pinnedMessages.author',
          'username firstName lastName avatar'
        );

      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      // Check if user is participant
      if (!chat.participants.some(p => p._id.toString() === userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      res.status(200).json({
        success: true,
        data: { chat },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get chat messages
  getChatMessages = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50, before } = req.query;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = { chat: chatId, status: 'active' };
      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await Chat.aggregate([
        { $match: { _id: chatId } },
        { $unwind: '$messages' },
        { $match: { 'messages.status': 'active' } },
        { $sort: { 'messages.createdAt': -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'messages.author',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $unwind: '$author',
        },
        {
          $project: {
            _id: '$messages._id',
            content: '$messages.content',
            type: '$messages.type',
            media: '$messages.media',
            author: {
              _id: '$author._id',
              username: '$author.username',
              firstName: '$author.firstName',
              lastName: '$author.lastName',
              avatar: '$author.avatar',
            },
            createdAt: '$messages.createdAt',
            updatedAt: '$messages.updatedAt',
            isEdited: '$messages.isEdited',
            isPinned: '$messages.isPinned',
            reactions: '$messages.reactions',
          },
        },
        { $sort: { createdAt: 1 } },
      ]);

      const total = await Chat.aggregate([
        { $match: { _id: chatId } },
        { $unwind: '$messages' },
        { $match: { 'messages.status': 'active' } },
        { $count: 'total' },
      ]);

      const totalMessages = total.length > 0 ? total[0].total : 0;
      const totalPages = Math.ceil(totalMessages / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total: totalMessages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Send message
  sendMessage = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { content, type = 'text', media, replyTo } = req.body;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      // Check if chat is active
      if (chat.status !== 'active') {
        throw new AppError('No puedes enviar mensajes a un chat inactivo', 400);
      }

      // Create message
      const message = {
        author: userId,
        content,
        type,
        media: media || [],
        replyTo: replyTo || null,
        createdAt: new Date(),
        status: 'active',
      };

      // Add message to chat
      chat.messages.push(message);
      chat.lastMessage = message;
      chat.lastMessageAt = new Date();
      chat.messageCount = (chat.messageCount || 0) + 1;

      // Update participant activity
      if (!chat.participantActivity) {
        chat.participantActivity = {};
      }
      chat.participantActivity[userId] = {
        lastSeen: new Date(),
        lastMessageAt: new Date(),
      };

      await chat.save();

      // Populate message data
      await chat.populate(
        'messages.author',
        'username firstName lastName avatar'
      );
      const newMessage = chat.messages[chat.messages.length - 1];

      res.status(201).json({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: { message: newMessage },
      });
    } catch (error) {
      next(error);
    }
  });

  // Update message
  updateMessage = asyncHandler(async (req, res, next) => {
    try {
      const { chatId, messageId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      // Find message
      const message = chat.messages.id(messageId);
      if (!message) {
        throw new AppError('Mensaje no encontrado', 404);
      }

      // Check ownership
      if (message.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para editar este mensaje', 403);
      }

      // Check if message can be edited (within 15 minutes)
      const minutesSinceCreation =
        (Date.now() - message.createdAt.getTime()) / (1000 * 60);
      if (minutesSinceCreation > 15 && req.user.role !== 'admin') {
        throw new AppError(
          'Solo puedes editar mensajes durante los primeros 15 minutos',
          400
        );
      }

      // Update message
      message.content = content;
      message.updatedAt = new Date();
      message.isEdited = true;

      await chat.save();

      // Populate message author
      await chat.populate(
        'messages.author',
        'username firstName lastName avatar'
      );

      res.status(200).json({
        success: true,
        message: 'Mensaje actualizado exitosamente',
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete message
  deleteMessage = asyncHandler(async (req, res, next) => {
    try {
      const { chatId, messageId } = req.params;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      // Find message
      const message = chat.messages.id(messageId);
      if (!message) {
        throw new AppError('Mensaje no encontrado', 404);
      }

      // Check ownership or admin
      if (message.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para eliminar este mensaje',
          403
        );
      }

      // Soft delete message
      message.status = 'deleted';
      message.deletedAt = new Date();
      message.deletedBy = userId;

      await chat.save();

      res.status(200).json({
        success: true,
        message: 'Mensaje eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Pin/unpin message
  togglePinMessage = asyncHandler(async (req, res, next) => {
    try {
      const { chatId, messageId } = req.params;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      // Check if user is creator or admin
      if (chat.creator.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'Solo el creador del chat o administradores pueden fijar mensajes',
          403
        );
      }

      // Find message
      const message = chat.messages.id(messageId);
      if (!message) {
        throw new AppError('Mensaje no encontrado', 404);
      }

      // Toggle pin status
      message.isPinned = !message.isPinned;
      message.pinnedAt = message.isPinned ? new Date() : undefined;
      message.pinnedBy = message.isPinned ? userId : undefined;

      // Update pinned messages array
      if (message.isPinned) {
        if (!chat.pinnedMessages) {
          chat.pinnedMessages = [];
        }
        chat.pinnedMessages.push(messageId);
      } else {
        chat.pinnedMessages = chat.pinnedMessages.filter(
          id => id.toString() !== messageId
        );
      }

      await chat.save();

      res.status(200).json({
        success: true,
        message: message.isPinned
          ? 'Mensaje fijado exitosamente'
          : 'Mensaje desfijado exitosamente',
        data: { isPinned: message.isPinned },
      });
    } catch (error) {
      next(error);
    }
  });

  // Add/remove reaction to message
  toggleReaction = asyncHandler(async (req, res, next) => {
    try {
      const { chatId, messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      // Find message
      const message = chat.messages.id(messageId);
      if (!message) {
        throw new AppError('Mensaje no encontrado', 404);
      }

      // Initialize reactions if not exists
      if (!message.reactions) {
        message.reactions = [];
      }

      // Find existing reaction
      const existingReaction = message.reactions.find(
        r => r.user.toString() === userId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        message.reactions = message.reactions.filter(
          r => !(r.user.toString() === userId && r.emoji === emoji)
        );
      } else {
        // Add reaction
        message.reactions.push({
          user: userId,
          emoji,
          createdAt: new Date(),
        });
      }

      await chat.save();

      res.status(200).json({
        success: true,
        message: existingReaction ? 'Reacción removida' : 'Reacción agregada',
        data: {
          reactions: message.reactions,
          hasReacted: !existingReaction,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Mark chat as read
  markChatAsRead = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      // Update participant activity
      if (!chat.participantActivity) {
        chat.participantActivity = {};
      }

      chat.participantActivity[userId] = {
        lastSeen: new Date(),
        lastReadAt: new Date(),
      };

      await chat.save();

      res.status(200).json({
        success: true,
        message: 'Chat marcado como leído',
      });
    } catch (error) {
      next(error);
    }
  });

  // Add participant to chat
  addParticipant = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { userId: newParticipantId } = req.body;
      const currentUserId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      // Check permissions
      if (
        chat.creator.toString() !== currentUserId &&
        req.user.role !== 'admin'
      ) {
        throw new AppError(
          'No tienes permisos para agregar participantes',
          403
        );
      }

      // Check if user is already a participant
      if (chat.participants.includes(newParticipantId)) {
        throw new AppError('El usuario ya es participante del chat', 400);
      }

      // Add participant
      chat.participants.push(newParticipantId);
      await chat.save();

      // Populate chat data
      await chat.populate('participants', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Participante agregado exitosamente',
        data: { chat },
      });
    } catch (error) {
      next(error);
    }
  });

  // Remove participant from chat
  removeParticipant = asyncHandler(async (req, res, next) => {
    try {
      const { chatId, participantId } = req.params;
      const currentUserId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      // Check permissions
      if (
        chat.creator.toString() !== currentUserId &&
        req.user.role !== 'admin'
      ) {
        throw new AppError(
          'No tienes permisos para remover participantes',
          403
        );
      }

      // Check if user is trying to remove themselves
      if (participantId === currentUserId) {
        throw new AppError('No puedes removerte a ti mismo del chat', 400);
      }

      // Check if user is a participant
      if (!chat.participants.includes(participantId)) {
        throw new AppError('El usuario no es participante del chat', 400);
      }

      // Remove participant
      chat.participants = chat.participants.filter(
        id => id.toString() !== participantId
      );
      await chat.save();

      // Populate chat data
      await chat.populate('participants', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Participante removido exitosamente',
        data: { chat },
      });
    } catch (error) {
      next(error);
    }
  });

  // Leave chat
  leaveChat = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      // Check if user is a participant
      if (!chat.participants.includes(userId)) {
        throw new AppError('No eres participante de este chat', 400);
      }

      // Check if user is creator
      if (chat.creator.toString() === userId) {
        throw new AppError(
          'El creador no puede dejar el chat. Transfiere la propiedad o elimina el chat',
          400
        );
      }

      // Remove participant
      chat.participants = chat.participants.filter(
        id => id.toString() !== userId
      );
      await chat.save();

      res.status(200).json({
        success: true,
        message: 'Has dejado el chat exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete chat
  deleteChat = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      // Check permissions
      if (chat.creator.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar este chat', 403);
      }

      // Soft delete chat
      chat.status = 'deleted';
      chat.deletedAt = new Date();
      chat.deletedBy = userId;
      await chat.save();

      res.status(200).json({
        success: true,
        message: 'Chat eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Search messages in chat
  searchChatMessages = asyncHandler(async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { query, page = 1, limit = 20 } = req.body;
      const userId = req.user.id;

      // Verify user has access to chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new AppError('Chat no encontrado', 404);
      }

      if (!chat.participants.includes(userId)) {
        throw new AppError('No tienes acceso a este chat', 403);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Search messages
      const messages = await Chat.aggregate([
        { $match: { _id: chatId } },
        { $unwind: '$messages' },
        {
          $match: {
            'messages.status': 'active',
            'messages.content': { $regex: query, $options: 'i' },
          },
        },
        { $sort: { 'messages.createdAt': -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'messages.author',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $unwind: '$author',
        },
        {
          $project: {
            _id: '$messages._id',
            content: '$messages.content',
            type: '$messages.type',
            author: {
              _id: '$author._id',
              username: '$author.username',
              firstName: '$author.firstName',
              lastName: '$author.lastName',
              avatar: '$author.avatar',
            },
            createdAt: '$messages.createdAt',
          },
        },
      ]);

      const total = await Chat.aggregate([
        { $match: { _id: chatId } },
        { $unwind: '$messages' },
        {
          $match: {
            'messages.status': 'active',
            'messages.content': { $regex: query, $options: 'i' },
          },
        },
        { $count: 'total' },
      ]);

      const totalMessages = total.length > 0 ? total[0].total : 0;
      const totalPages = Math.ceil(totalMessages / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total: totalMessages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = new ChatController();

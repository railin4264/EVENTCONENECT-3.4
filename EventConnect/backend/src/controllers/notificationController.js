const { Notification, User, Event, Tribe, Post } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { notificationService } = require('../middleware/notifications');

class NotificationController {
  // Create notification
  createNotification = asyncHandler(async (req, res, next) => {
    try {
      const notificationData = req.body;
      const userId = req.user.id;

      // Validate notification data
      if (!notificationData.recipients || !notificationData.type) {
        throw new AppError('Destinatarios y tipo de notificación son requeridos', 400);
      }

      // Check if user has permission to send notifications
      if (req.user.role !== 'admin' && !notificationData.recipients.includes(userId)) {
        throw new AppError('No tienes permisos para enviar notificaciones a otros usuarios', 403);
      }

      const notifications = [];

      // Create notification for each recipient
      for (const recipientId of notificationData.recipients) {
        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          continue; // Skip non-existent users
        }

        // Check recipient's notification preferences
        const userPreferences = recipient.notificationPreferences || {};
        const typePreferences = userPreferences[notificationData.type] || {};
        
        if (typePreferences.enabled === false) {
          continue; // Skip if user has disabled this notification type
        }

        // Create notification object
        const notification = new Notification({
          recipient: recipientId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          channels: typePreferences.channels || ['in_app'],
          priority: notificationData.priority || 'normal',
          category: notificationData.category || 'general',
          sender: userId,
          status: 'pending'
        });

        notifications.push(notification);
      }

      // Save all notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      // Send real-time notifications
      for (const notification of notifications) {
        await notificationService.sendNotificationToUser(notification.recipient, notification);
      }

      res.status(201).json({
        success: true,
        message: `${notifications.length} notificaciones creadas exitosamente`,
        data: { notifications }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user notifications
  getUserNotifications = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { 
        type, 
        status, 
        category, 
        page = 1, 
        limit = 20,
        unreadOnly = false 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = { recipient: userId };
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (category) query.category = category;
      if (unreadOnly === 'true') query.readAt = { $exists: false };

      const notifications = await Notification.find(query)
        .populate('sender', 'username firstName lastName avatar')
        .populate('recipient', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Notification.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Get unread count
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        readAt: { $exists: false }
      });

      res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          },
          unreadCount
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get notification by ID
  getNotificationById = asyncHandler(async (req, res, next) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId)
        .populate('sender', 'username firstName lastName avatar')
        .populate('recipient', 'username firstName lastName avatar');

      if (!notification) {
        throw new AppError('Notificación no encontrada', 404);
      }

      // Check ownership
      if (notification.recipient.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes acceso a esta notificación', 403);
      }

      res.status(200).json({
        success: true,
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  });

  // Mark notification as read
  markAsRead = asyncHandler(async (req, res, next) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new AppError('Notificación no encontrada', 404);
      }

      // Check ownership
      if (notification.recipient.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes acceso a esta notificación', 403);
      }

      // Mark as read
      notification.readAt = new Date();
      notification.status = 'read';
      await notification.save();

      res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      next(error);
    }
  });

  // Mark multiple notifications as read
  markMultipleAsRead = asyncHandler(async (req, res, next) => {
    try {
      const { notificationIds } = req.body;
      const userId = req.user.id;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        throw new AppError('IDs de notificaciones son requeridos', 400);
      }

      // Verify ownership and update
      const result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          recipient: userId
        },
        {
          readAt: new Date(),
          status: 'read'
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notificaciones marcadas como leídas`
      });
    } catch (error) {
      next(error);
    }
  });

  // Mark all notifications as read
  markAllAsRead = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { type, category } = req.query;

      // Build query
      const query = { 
        recipient: userId,
        readAt: { $exists: false }
      };
      
      if (type) query.type = type;
      if (category) query.category = category;

      const result = await Notification.updateMany(
        query,
        {
          readAt: new Date(),
          status: 'read'
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notificaciones marcadas como leídas`
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete notification
  deleteNotification = asyncHandler(async (req, res, next) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new AppError('Notificación no encontrada', 404);
      }

      // Check ownership
      if (notification.recipient.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar esta notificación', 403);
      }

      // Soft delete
      notification.status = 'deleted';
      notification.deletedAt = new Date();
      notification.deletedBy = userId;
      await notification.save();

      res.status(200).json({
        success: true,
        message: 'Notificación eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete multiple notifications
  deleteMultipleNotifications = asyncHandler(async (req, res, next) => {
    try {
      const { notificationIds } = req.body;
      const userId = req.user.id;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        throw new AppError('IDs de notificaciones son requeridos', 400);
      }

      // Verify ownership and soft delete
      const result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          recipient: userId
        },
        {
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: userId
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notificaciones eliminadas exitosamente`
      });
    } catch (error) {
      next(error);
    }
  });

  // Get notification preferences
  getNotificationPreferences = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('notificationPreferences');
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const preferences = user.notificationPreferences || {};

      res.status(200).json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      next(error);
    }
  });

  // Update notification preferences
  updateNotificationPreferences = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        throw new AppError('Preferencias de notificación son requeridas', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Update preferences
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...preferences
      };

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Preferencias de notificación actualizadas exitosamente',
        data: { preferences: user.notificationPreferences }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get notification statistics
  getNotificationStats = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get counts by type
      const typeStats = await Notification.aggregate([
        { $match: { recipient: userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            read: { $sum: { $cond: [{ $exists: ['$readAt'] }, 1, 0] } },
            unread: { $sum: { $cond: [{ $exists: ['$readAt'] }, 0, 1] } }
          }
        }
      ]);

      // Get counts by category
      const categoryStats = await Notification.aggregate([
        { $match: { recipient: userId } },
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            read: { $sum: { $cond: [{ $exists: ['$readAt'] }, 1, 0] } },
            unread: { $sum: { $cond: [{ $exists: ['$readAt'] }, 0, 1] } }
          }
        }
      ]);

      // Get total counts
      const totalStats = await Notification.aggregate([
        { $match: { recipient: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            read: { $sum: { $cond: [{ $exists: ['$readAt'] }, 1, 0] } },
            unread: { $sum: { $cond: [{ $exists: ['$readAt'] }, 0, 1] } }
          }
        }
      ]);

      const stats = {
        byType: typeStats,
        byCategory: categoryStats,
        total: totalStats[0] || { total: 0, read: 0, unread: 0 }
      };

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  });

  // Send event invitation notification
  sendEventInvitation = asyncHandler(async (req, res, next) => {
    try {
      const { eventId, recipientIds, message } = req.body;
      const userId = req.user.id;

      // Verify event exists and user is host
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== userId) {
        throw new AppError('Solo el anfitrión puede enviar invitaciones', 403);
      }

      // Create notifications
      const notifications = [];
      for (const recipientId of recipientIds) {
        const notification = new Notification({
          recipient: recipientId,
          type: 'event_invitation',
          title: `Invitación a ${event.title}`,
          message: message || `Has sido invitado a ${event.title}`,
          data: {
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.startDate,
            hostId: userId,
            hostName: req.user.firstName + ' ' + req.user.lastName
          },
          channels: ['in_app', 'email'],
          priority: 'high',
          category: 'events',
          sender: userId,
          status: 'pending'
        });

        notifications.push(notification);
      }

      // Save notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      // Send real-time notifications
      for (const notification of notifications) {
        await notificationService.sendNotificationToUser(notification.recipient, notification);
      }

      res.status(201).json({
        success: true,
        message: `${notifications.length} invitaciones enviadas exitosamente`,
        data: { notifications }
      });
    } catch (error) {
      next(error);
    }
  });

  // Send tribe invitation notification
  sendTribeInvitation = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId, recipientIds, message } = req.body;
      const userId = req.user.id;

      // Verify tribe exists and user is admin/moderator
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      const isAdmin = tribe.admins.includes(userId);
      const isModerator = tribe.moderators.includes(userId);
      
      if (!isAdmin && !isModerator) {
        throw new AppError('Solo administradores y moderadores pueden enviar invitaciones', 403);
      }

      // Create notifications
      const notifications = [];
      for (const recipientId of recipientIds) {
        const notification = new Notification({
          recipient: recipientId,
          type: 'tribe_invitation',
          title: `Invitación a ${tribe.name}`,
          message: message || `Has sido invitado a unirte a ${tribe.name}`,
          data: {
            tribeId: tribe._id,
            tribeName: tribe.name,
            tribeCategory: tribe.category,
            inviterId: userId,
            inviterName: req.user.firstName + ' ' + req.user.lastName
          },
          channels: ['in_app', 'email'],
          priority: 'normal',
          category: 'tribes',
          sender: userId,
          status: 'pending'
        });

        notifications.push(notification);
      }

      // Save notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      // Send real-time notifications
      for (const notification of notifications) {
        await notificationService.sendNotificationToUser(notification.recipient, notification);
      }

      res.status(201).json({
        success: true,
        message: `${notifications.length} invitaciones enviadas exitosamente`,
        data: { notifications }
      });
    } catch (error) {
      next(error);
    }
  });

  // Send friend request notification
  sendFriendRequest = asyncHandler(async (req, res, next) => {
    try {
      const { recipientId, message } = req.body;
      const userId = req.user.id;

      // Check if user is trying to send request to themselves
      if (recipientId === userId) {
        throw new AppError('No puedes enviar una solicitud de amistad a ti mismo', 400);
      }

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Check if notification already exists
      const existingNotification = await Notification.findOne({
        sender: userId,
        recipient: recipientId,
        type: 'friend_request',
        status: { $nin: ['deleted', 'rejected'] }
      });

      if (existingNotification) {
        throw new AppError('Ya has enviado una solicitud de amistad a este usuario', 400);
      }

      // Create notification
      const notification = new Notification({
        recipient: recipientId,
        type: 'friend_request',
        title: 'Nueva solicitud de amistad',
        message: message || `${req.user.firstName} ${req.user.lastName} quiere ser tu amigo`,
        data: {
          senderId: userId,
          senderName: req.user.firstName + ' ' + req.user.lastName,
          senderUsername: req.user.username,
          senderAvatar: req.user.avatar
        },
        channels: ['in_app', 'email'],
        priority: 'normal',
        category: 'social',
        sender: userId,
        status: 'pending'
      });

      await notification.save();

      // Send real-time notification
      await notificationService.sendNotificationToUser(recipientId, notification);

      res.status(201).json({
        success: true,
        message: 'Solicitud de amistad enviada exitosamente',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  });

  // Send post mention notification
  sendPostMention = asyncHandler(async (req, res, next) => {
    try {
      const { postId, mentionedUserIds } = req.body;
      const userId = req.user.id;

      // Verify post exists and user is author
      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      if (post.author.toString() !== userId) {
        throw new AppError('Solo el autor puede mencionar usuarios', 403);
      }

      // Create notifications
      const notifications = [];
      for (const mentionedUserId of mentionedUserIds) {
        const notification = new Notification({
          recipient: mentionedUserId,
          type: 'post_mention',
          title: 'Mencionado en un post',
          message: `${req.user.firstName} ${req.user.lastName} te mencionó en un post`,
          data: {
            postId: post._id,
            postContent: post.content.substring(0, 100) + '...',
            authorId: userId,
            authorName: req.user.firstName + ' ' + req.user.lastName,
            authorUsername: req.user.username
          },
          channels: ['in_app'],
          priority: 'normal',
          category: 'social',
          sender: userId,
          status: 'pending'
        });

        notifications.push(notification);
      }

      // Save notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      // Send real-time notifications
      for (const notification of notifications) {
        await notificationService.sendNotificationToUser(notification.recipient, notification);
      }

      res.status(201).json({
        success: true,
        message: `${notifications.length} notificaciones de mención enviadas`,
        data: { notifications }
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = new NotificationController();
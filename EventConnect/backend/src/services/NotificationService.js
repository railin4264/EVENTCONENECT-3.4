const { Notification, User, Event, Tribe, Post } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { redis } = require('../config');
const { notificationService: wsNotificationService } = require('../middleware/notifications');

class NotificationService {
  /**
   * Send notification to one or multiple users
   */
  async sendNotification(notificationData) {
    try {
      const { recipients, type, title, message, data, priority = 'normal', channels = ['in_app'] } = notificationData;

      if (!recipients || recipients.length === 0) {
        throw new AppError('Se requieren destinatarios para la notificación', 400);
      }

      const notifications = [];
      const now = new Date();

      for (const recipientId of recipients) {
        // Check user notification preferences
        const user = await User.findById(recipientId).select('notificationPreferences');
        if (!user) continue;

        const preferences = user.notificationPreferences || {};
        const typeEnabled = preferences[type] !== false; // Default to true if not set

        if (!typeEnabled) continue;

        // Create notification record
        const notification = new Notification({
          recipient: recipientId,
          type,
          title,
          message,
          data,
          priority,
          channels,
          status: 'pending',
          scheduledFor: now
        });

        notifications.push(notification);
      }

      if (notifications.length === 0) {
        return { sent: 0, skipped: 0 };
      }

      // Save notifications to database
      await Notification.insertMany(notifications);

      // Send real-time notifications
      const realTimeResults = await this.sendRealTimeNotifications(notifications);

      // Send push notifications if enabled
      const pushResults = await this.sendPushNotifications(notifications);

      // Send email notifications if enabled
      const emailResults = await this.sendEmailNotifications(notifications);

      // Update notification status
      await this.updateNotificationStatus(notifications.map(n => n._id), 'delivered');

      return {
        sent: notifications.length,
        skipped: recipients.length - notifications.length,
        realTime: realTimeResults,
        push: pushResults,
        email: emailResults
      };

    } catch (error) {
      throw new AppError(`Error al enviar notificación: ${error.message}`, 500);
    }
  }

  /**
   * Send event invitation notification
   */
  async sendEventInvitation(eventId, hostId, recipientIds, message = '') {
    try {
      const event = await Event.findById(eventId).populate('host', 'username avatar');
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      const notificationData = {
        recipients: recipientIds,
        type: 'event_invitation',
        title: `Invitación a evento: ${event.title}`,
        message: message || `Te han invitado a ${event.title}`,
        data: {
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.startDate,
          eventLocation: event.location,
          hostId: event.host._id,
          hostName: event.host.username,
          hostAvatar: event.host.avatar
        },
        priority: 'high',
        channels: ['in_app', 'push', 'email']
      };

      return await this.sendNotification(notificationData);

    } catch (error) {
      throw new AppError(`Error al enviar invitación: ${error.message}`, 500);
    }
  }

  /**
   * Send tribe invitation notification
   */
  async sendTribeInvitation(tribeId, creatorId, recipientIds, message = '') {
    try {
      const tribe = await Tribe.findById(tribeId).populate('creator', 'username avatar');
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      const notificationData = {
        recipients: recipientIds,
        type: 'tribe_invitation',
        title: `Invitación a tribu: ${tribe.name}`,
        message: message || `Te han invitado a unirte a ${tribe.name}`,
        data: {
          tribeId: tribe._id,
          tribeName: tribe.name,
          tribeDescription: tribe.description,
          creatorId: tribe.creator._id,
          creatorName: tribe.creator.username,
          creatorAvatar: tribe.creator.avatar
        },
        priority: 'normal',
        channels: ['in_app', 'push']
      };

      return await this.sendNotification(notificationData);

    } catch (error) {
      throw new AppError(`Error al enviar invitación a tribu: ${error.message}`, 500);
    }
  }

  /**
   * Send friend request notification
   */
  async sendFriendRequest(senderId, recipientId, message = '') {
    try {
      const sender = await User.findById(senderId).select('username avatar');
      if (!sender) {
        throw new AppError('Usuario remitente no encontrado', 404);
      }

      const notificationData = {
        recipients: [recipientId],
        type: 'friend_request',
        title: 'Nueva solicitud de amistad',
        message: message || `${sender.username} quiere ser tu amigo`,
        data: {
          senderId: sender._id,
          senderName: sender.username,
          senderAvatar: sender.avatar
        },
        priority: 'normal',
        channels: ['in_app', 'push']
      };

      return await this.sendNotification(notificationData);

    } catch (error) {
      throw new AppError(`Error al enviar solicitud de amistad: ${error.message}`, 500);
    }
  }

  /**
   * Send post mention notification
   */
  async sendPostMention(postId, authorId, mentionedUserIds) {
    try {
      const post = await Post.findById(postId).populate('author', 'username avatar');
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      const notificationData = {
        recipients: mentionedUserIds,
        type: 'post_mention',
        title: 'Mencionado en un post',
        message: `${post.author.username} te mencionó en un post`,
        data: {
          postId: post._id,
          postContent: post.content.substring(0, 100),
          authorId: post.author._id,
          authorName: post.author.username,
          authorAvatar: post.author.avatar
        },
        priority: 'low',
        channels: ['in_app', 'push']
      };

      return await this.sendNotification(notificationData);

    } catch (error) {
      throw new AppError(`Error al enviar notificación de mención: ${error.message}`, 500);
    }
  }

  /**
   * Send event reminder notifications
   */
  async sendEventReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find events starting tomorrow
      const upcomingEvents = await Event.find({
        startDate: { $gte: tomorrow, $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) },
        status: 'active'
      }).populate('attendees', 'notificationPreferences');

      const reminderNotifications = [];

      for (const event of upcomingEvents) {
        for (const attendee of event.attendees) {
          const preferences = attendee.notificationPreferences || {};
          if (preferences.event_reminders !== false) {
            reminderNotifications.push({
              recipients: [attendee._id],
              type: 'event_reminder',
              title: `Recordatorio: ${event.title} mañana`,
              message: `Tu evento ${event.title} comienza mañana a las ${event.startDate.toLocaleTimeString()}`,
              data: {
                eventId: event._id,
                eventTitle: event.title,
                eventDate: event.startDate,
                eventLocation: event.location
              },
              priority: 'high',
              channels: ['in_app', 'push', 'email']
            });
          }
        }
      }

      // Send all reminder notifications
      let totalSent = 0;
      for (const notification of reminderNotifications) {
        const result = await this.sendNotification(notification);
        totalSent += result.sent;
      }

      return { totalEvents: upcomingEvents.length, totalReminders: totalSent };

    } catch (error) {
      throw new AppError(`Error al enviar recordatorios: ${error.message}`, 500);
    }
  }

  /**
   * Get notification analytics for a user
   */
  async getNotificationAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = this.getDateFromRange(timeRange);
      
      const notifications = await Notification.find({
        recipient: userId,
        createdAt: { $gte: startDate }
      });

      const analytics = {
        total: notifications.length,
        byType: {},
        byStatus: {},
        byPriority: {},
        byChannel: {},
        engagement: {
          opened: 0,
          clicked: 0,
          dismissed: 0
        },
        timeDistribution: this.getTimeDistribution(notifications),
        topTypes: this.getTopNotificationTypes(notifications)
      };

      notifications.forEach(notification => {
        // Count by type
        analytics.byType[notification.type] = (analytics.byType[notification.type] || 0) + 1;
        
        // Count by status
        analytics.byStatus[notification.status] = (analytics.byStatus[notification.status] || 0) + 1;
        
        // Count by priority
        analytics.byPriority[notification.priority] = (analytics.byPriority[notification.priority] || 0) + 1;
        
        // Count by channel
        notification.channels.forEach(channel => {
          analytics.byChannel[channel] = (analytics.byChannel[channel] || 0) + 1;
        });

        // Engagement metrics
        if (notification.openedAt) analytics.engagement.opened++;
        if (notification.clickedAt) analytics.engagement.clicked++;
        if (notification.dismissedAt) analytics.engagement.dismissed++;
      });

      // Calculate engagement rates
      analytics.engagement.openRate = (analytics.engagement.opened / analytics.total) * 100;
      analytics.engagement.clickRate = (analytics.engagement.clicked / analytics.total) * 100;
      analytics.engagement.dismissRate = (analytics.engagement.dismissed / analytics.total) * 100;

      return analytics;

    } catch (error) {
      throw new AppError(`Error al obtener analytics: ${error.message}`, 500);
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(userId, preferences) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Validate preferences
      const validPreferences = this.validatePreferences(preferences);
      
      // Update user preferences
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...validPreferences
      };

      await user.save();

      // Cache preferences for quick access
      await redis.set(`user:preferences:${userId}`, JSON.stringify(user.notificationPreferences), 3600);

      return user.notificationPreferences;

    } catch (error) {
      throw new AppError(`Error al actualizar preferencias: ${error.message}`, 500);
    }
  }

  /**
   * Bulk send notifications (for system announcements)
   */
  async sendBulkNotification(notificationData, userFilter = {}) {
    try {
      // Find users based on filter
      const users = await User.find(userFilter).select('_id notificationPreferences');
      
      if (users.length === 0) {
        return { sent: 0, skipped: 0 };
      }

      const recipientIds = users
        .filter(user => {
          const preferences = user.notificationPreferences || {};
          return preferences[notificationData.type] !== false;
        })
        .map(user => user._id);

      if (recipientIds.length === 0) {
        return { sent: 0, skipped: users.length };
      }

      // Send notifications in batches to avoid memory issues
      const batchSize = 100;
      let totalSent = 0;

      for (let i = 0; i < recipientIds.length; i += batchSize) {
        const batch = recipientIds.slice(i, i + batchSize);
        const batchData = { ...notificationData, recipients: batch };
        
        const result = await this.sendNotification(batchData);
        totalSent += result.sent;
      }

      return { sent: totalSent, skipped: users.length - totalSent };

    } catch (error) {
      throw new AppError(`Error al enviar notificaciones masivas: ${error.message}`, 500);
    }
  }

  // Helper methods
  async sendRealTimeNotifications(notifications) {
    try {
      let sent = 0;
      for (const notification of notifications) {
        const isOnline = await wsNotificationService.isUserOnline(notification.recipient);
        if (isOnline) {
          await wsNotificationService.sendToUser(notification.recipient, 'notification', notification);
          sent++;
        }
      }
      return { sent, total: notifications.length };
    } catch (error) {
      console.error('Error sending real-time notifications:', error);
      return { sent: 0, total: notifications.length, error: error.message };
    }
  }

  async sendPushNotifications(notifications) {
    try {
      // Implementation for push notifications
      // This would integrate with FCM, APNS, or other push services
      return { sent: 0, total: notifications.length };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return { sent: 0, total: notifications.length, error: error.message };
    }
  }

  async sendEmailNotifications(notifications) {
    try {
      // Implementation for email notifications
      // This would integrate with email services like SendGrid, AWS SES, etc.
      return { sent: 0, total: notifications.length };
    } catch (error) {
      console.error('Error sending email notifications:', error);
      return { sent: 0, total: notifications.length, error: error.message };
    }
  }

  async updateNotificationStatus(notificationIds, status) {
    try {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { 
          status,
          deliveredAt: status === 'delivered' ? new Date() : undefined
        }
      );
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  }

  getDateFromRange(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  getTimeDistribution(notifications) {
    const distribution = {};
    notifications.forEach(notification => {
      const hour = notification.createdAt.getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    return distribution;
  }

  getTopNotificationTypes(notifications) {
    const typeCount = {};
    notifications.forEach(notification => {
      typeCount[notification.type] = (typeCount[notification.type] || 0) + 1;
    });

    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  validatePreferences(preferences) {
    const validPreferences = {};
    const validTypes = [
      'event_invitation', 'tribe_invitation', 'friend_request', 'post_mention',
      'event_reminder', 'event_update', 'tribe_update', 'system_announcement'
    ];

    const validChannels = ['in_app', 'push', 'email', 'sms'];

    Object.keys(preferences).forEach(key => {
      if (validTypes.includes(key) || validChannels.includes(key)) {
        validPreferences[key] = preferences[key];
      }
    });

    return validPreferences;
  }
}

module.exports = new NotificationService();
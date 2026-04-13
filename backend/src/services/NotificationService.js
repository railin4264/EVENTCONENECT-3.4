const { googleMaps } = require('../config');
const { redis } = require('../config');
const Chat = require('../models/Chat');
const Event = require('../models/Event');
const InAppNotification = require('../models/InAppNotification');
const ScheduledNotification = require('../models/ScheduledNotification');
const Tribe = require('../models/Tribe');
const User = require('../models/User');

/**
 * Servicio de notificaciones para EventConnect
 */
class NotificationService {
  /**
   * Constructor del servicio de notificaciones
   */
  constructor() {
    this.notificationTypes = {
      EVENT_INVITE: 'event_invite',
      EVENT_REMINDER: 'event_reminder',
      EVENT_UPDATE: 'event_update',
      EVENT_CANCELLED: 'event_cancelled',
      TRIBE_INVITE: 'tribe_invite',
      TRIBE_UPDATE: 'tribe_update',
      NEW_MESSAGE: 'new_message',
      MENTION: 'mention',
      LIKE: 'like',
      COMMENT: 'comment',
      FOLLOW: 'follow',
      SYSTEM: 'system',
      SECURITY: 'security',
      PROMOTIONAL: 'promotional',
    };

    this.priorityLevels = {
      LOW: 'low',
      NORMAL: 'normal',
      HIGH: 'high',
      URGENT: 'urgent',
    };

    this.channels = {
      PUSH: 'push',
      EMAIL: 'email',
      SMS: 'sms',
      IN_APP: 'in_app',
    };
  }

  // Enviar notificación push
  /**
   *
   * @param userId
   * @param notification
   */
  async sendPushNotification(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.pushTokens || user.pushTokens.length === 0) {
        console.log(`Usuario ${userId} no tiene tokens de push`);
        return false;
      }

      const results = await Promise.allSettled(
        user.pushTokens.map(token => this.sendToExpo(token, notification))
      );

      const successful = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const failed = results.filter(
        result => result.status === 'rejected'
      ).length;

      console.log(
        `Push notifications enviadas: ${successful} exitosas, ${failed} fallidas`
      );

      // Limpiar tokens inválidos
      if (failed > 0) {
        await this.cleanInvalidPushTokens(userId, results);
      }

      return successful > 0;
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      return false;
    }
  }

  // Enviar a Expo Push Service
  /**
   *
   * @param pushToken
   * @param notification
   */
  async sendToExpo(pushToken, notification) {
    try {
      const message = {
        to: pushToken,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'normal',
        channelId: notification.channelId || 'default',
        badge: notification.badge,
        categoryId: notification.categoryId,
        mutableContent: notification.mutableContent || false,
        subtitle: notification.subtitle,
        ttl: notification.ttl || 86400, // 24 horas
        expiration: notification.expiration,
        ...this.buildNotificationOptions(notification),
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.data && result.data.status === 'error') {
        throw new Error(result.data.message);
      }

      return result;
    } catch (error) {
      console.error('Error enviando a Expo:', error);
      throw error;
    }
  }

  // Construir opciones de notificación
  /**
   *
   * @param notification
   */
  buildNotificationOptions(notification) {
    const options = {};

    // Sonidos personalizados
    if (notification.sound === 'custom') {
      options.sound = notification.customSound;
    }

    // Vibración personalizada
    if (notification.vibrate) {
      options.vibrate = notification.vibrate;
    }

    // Imagen de notificación
    if (notification.image) {
      options.image = notification.image;
    }

    // Acciones personalizadas
    if (notification.actions) {
      options.actions = notification.actions;
    }

    // Configuración de Android
    if (notification.android) {
      options.android = {
        channelId: notification.android.channelId || 'default',
        priority: notification.android.priority || 'normal',
        sound: notification.android.sound,
        vibrate: notification.android.vibrate,
        icon: notification.android.icon,
        color: notification.android.color,
        sticky: notification.android.sticky || false,
        ...notification.android,
      };
    }

    // Configuración de iOS
    if (notification.ios) {
      options.ios = {
        sound: notification.ios.sound,
        badge: notification.ios.badge,
        categoryId: notification.ios.categoryId,
        threadId: notification.ios.threadId,
        ...notification.ios,
      };
    }

    return options;
  }

  // Limpiar tokens de push inválidos
  /**
   *
   * @param userId
   * @param results
   */
  async cleanInvalidPushTokens(userId, results) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const invalidTokens = [];
      results.forEach((result, index) => {
        if (
          result.status === 'rejected' ||
          (result.status === 'fulfilled' &&
            result.value.data &&
            result.value.data.status === 'error')
        ) {
          invalidTokens.push(user.pushTokens[index]);
        }
      });

      if (invalidTokens.length > 0) {
        user.pushTokens = user.pushTokens.filter(
          token => !invalidTokens.includes(token)
        );
        await user.save();
        console.log(
          `Tokens inválidos limpiados para usuario ${userId}: ${invalidTokens.length}`
        );
      }
    } catch (error) {
      console.error('Error limpiando tokens inválidos:', error);
    }
  }

  // Enviar notificación por email
  /**
   *
   * @param userId
   * @param notification
   */
  async sendEmailNotification(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.email) {
        console.log(`Usuario ${userId} no tiene email`);
        return false;
      }

      // Aquí implementarías el envío de email
      // Por ejemplo, usando Nodemailer, SendGrid, etc.
      console.log(`Email enviado a ${user.email}: ${notification.title}`);

      return true;
    } catch (error) {
      console.error('Error enviando notificación por email:', error);
      return false;
    }
  }

  // Enviar notificación por SMS
  /**
   *
   * @param userId
   * @param notification
   */
  async sendSMSNotification(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.phone) {
        console.log(`Usuario ${userId} no tiene teléfono`);
        return false;
      }

      // Aquí implementarías el envío de SMS
      // Por ejemplo, usando Twilio, AWS SNS, etc.
      console.log(`SMS enviado a ${user.phone}: ${notification.body}`);

      return true;
    } catch (error) {
      console.error('Error enviando notificación por SMS:', error);
      return false;
    }
  }

  // Enviar notificación in-app
  /**
   *
   * @param userId
   * @param notification
   */
  async sendInAppNotification(userId, notification) {
    try {
      // Guardar notificación en la base de datos
      const inAppNotification = new InAppNotification({
        userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        priority: notification.priority,
        read: false,
        createdAt: new Date(),
      });

      await inAppNotification.save();

      // Enviar por WebSocket si el usuario está conectado
      // Esto se maneja en el ChatWebSocketService

      return true;
    } catch (error) {
      console.error('Error enviando notificación in-app:', error);
      return false;
    }
  }

  // Enviar notificación por múltiples canales
  /**
   *
   * @param userId
   * @param notification
   * @param channels
   */
  async sendMultiChannelNotification(
    userId,
    notification,
    channels = ['push', 'in_app']
  ) {
    try {
      const results = {};

      for (const channel of channels) {
        switch (channel) {
          case 'push':
            results.push = await this.sendPushNotification(
              userId,
              notification
            );
            break;
          case 'email':
            results.email = await this.sendEmailNotification(
              userId,
              notification
            );
            break;
          case 'sms':
            results.sms = await this.sendSMSNotification(userId, notification);
            break;
          case 'in_app':
            results.in_app = await this.sendInAppNotification(
              userId,
              notification
            );
            break;
        }
      }

      return results;
    } catch (error) {
      console.error('Error enviando notificación multi-canal:', error);
      return {};
    }
  }

  // Notificaciones de eventos
  /**
   *
   * @param userId
   * @param eventId
   * @param inviterId
   */
  async sendEventInvite(userId, eventId, inviterId) {
    try {
      const [user, event, inviter] = await Promise.all([
        User.findById(userId),
        Event.findById(eventId),
        User.findById(inviterId),
      ]);

      if (!user || !event || !inviter) {
        throw new Error('Usuario, evento o invitador no encontrado');
      }

      const notification = {
        type: this.notificationTypes.EVENT_INVITE,
        title: 'Invitación a Evento',
        body: `${inviter.firstName} te ha invitado a "${event.title}"`,
        data: {
          eventId: event._id,
          inviterId: inviter._id,
          eventTitle: event.title,
          eventDate: event.startDate,
        },
        priority: this.priorityLevels.HIGH,
        categoryId: 'event',
        sound: 'default',
        badge: 1,
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando invitación a evento:', error);
      return false;
    }
  }

  /**
   *
   * @param userId
   * @param eventId
   * @param minutesBefore
   */
  async sendEventReminder(userId, eventId, minutesBefore = 60) {
    try {
      const [user, event] = await Promise.all([
        User.findById(userId),
        Event.findById(eventId),
      ]);

      if (!user || !event) {
        throw new Error('Usuario o evento no encontrado');
      }

      const notification = {
        type: this.notificationTypes.EVENT_REMINDER,
        title: 'Recordatorio de Evento',
        body: `"${event.title}" comienza en ${minutesBefore} minutos`,
        data: {
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.startDate,
          minutesBefore,
        },
        priority: this.priorityLevels.HIGH,
        categoryId: 'reminder',
        sound: 'default',
        badge: 1,
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando recordatorio de evento:', error);
      return false;
    }
  }

  /**
   *
   * @param userId
   * @param eventId
   * @param updateType
   */
  async sendEventUpdate(userId, eventId, updateType) {
    try {
      const [user, event] = await Promise.all([
        User.findById(userId),
        Event.findById(eventId),
      ]);

      if (!user || !event) {
        throw new Error('Usuario o evento no encontrado');
      }

      const updateMessages = {
        date: 'La fecha del evento ha cambiado',
        location: 'La ubicación del evento ha cambiado',
        cancelled: 'El evento ha sido cancelado',
        details: 'Los detalles del evento han sido actualizados',
      };

      const notification = {
        type: this.notificationTypes.EVENT_UPDATE,
        title: 'Evento Actualizado',
        body: updateMessages[updateType] || 'El evento ha sido actualizado',
        data: {
          eventId: event._id,
          eventTitle: event.title,
          updateType,
        },
        priority: this.priorityLevels.NORMAL,
        categoryId: 'event',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando actualización de evento:', error);
      return false;
    }
  }

  // Notificaciones de tribus
  /**
   *
   * @param userId
   * @param tribeId
   * @param inviterId
   */
  async sendTribeInvite(userId, tribeId, inviterId) {
    try {
      const [user, tribe, inviter] = await Promise.all([
        User.findById(userId),
        Tribe.findById(tribeId),
        User.findById(inviterId),
      ]);

      if (!user || !tribe || !inviter) {
        throw new Error('Usuario, tribu o invitador no encontrado');
      }

      const notification = {
        type: this.notificationTypes.TRIBE_INVITE,
        title: 'Invitación a Tribu',
        body: `${inviter.firstName} te ha invitado a unirte a "${tribe.name}"`,
        data: {
          tribeId: tribe._id,
          inviterId: inviter._id,
          tribeName: tribe.name,
        },
        priority: this.priorityLevels.HIGH,
        categoryId: 'tribe',
        sound: 'default',
        badge: 1,
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando invitación a tribu:', error);
      return false;
    }
  }

  // Notificaciones de chat
  /**
   *
   * @param userId
   * @param chatId
   * @param senderId
   * @param messagePreview
   */
  async sendNewMessageNotification(userId, chatId, senderId, messagePreview) {
    try {
      const [user, sender] = await Promise.all([
        User.findById(userId),
        User.findById(senderId),
      ]);

      if (!user || !sender) {
        throw new Error('Usuario o remitente no encontrado');
      }

      const notification = {
        type: this.notificationTypes.NEW_MESSAGE,
        title: `Nuevo mensaje de ${sender.firstName}`,
        body: messagePreview,
        data: {
          chatId,
          senderId: sender._id,
          senderName: sender.firstName,
          messagePreview,
        },
        priority: this.priorityLevels.NORMAL,
        categoryId: 'chat',
        sound: 'default',
        badge: 1,
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación de nuevo mensaje:', error);
      return false;
    }
  }

  // Notificaciones de menciones
  /**
   *
   * @param userId
   * @param mentionedBy
   * @param context
   * @param contextId
   */
  async sendMentionNotification(userId, mentionedBy, context, contextId) {
    try {
      const [user, mentionedByUser] = await Promise.all([
        User.findById(userId),
        User.findById(mentionedBy),
      ]);

      if (!user || !mentionedByUser) {
        throw new Error('Usuario no encontrado');
      }

      const notification = {
        type: this.notificationTypes.MENTION,
        title: 'Mencionado en EventConnect',
        body: `${mentionedByUser.firstName} te ha mencionado en ${context}`,
        data: {
          mentionedBy: mentionedByUser._id,
          mentionedByName: mentionedByUser.firstName,
          context,
          contextId,
        },
        priority: this.priorityLevels.NORMAL,
        categoryId: 'social',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación de mención:', error);
      return false;
    }
  }

  // Notificaciones de likes
  /**
   *
   * @param userId
   * @param likedBy
   * @param contentType
   * @param contentId
   */
  async sendLikeNotification(userId, likedBy, contentType, contentId) {
    try {
      const [user, likedByUser] = await Promise.all([
        User.findById(userId),
        User.findById(likedBy),
      ]);

      if (!user || !likedByUser) {
        throw new Error('Usuario no encontrado');
      }

      const notification = {
        type: this.notificationTypes.LIKE,
        title: 'Nuevo like',
        body: `${likedByUser.firstName} le dio like a tu ${contentType}`,
        data: {
          likedBy: likedByUser._id,
          likedByName: likedByUser.firstName,
          contentType,
          contentId,
        },
        priority: this.priorityLevels.LOW,
        categoryId: 'social',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación de like:', error);
      return false;
    }
  }

  // Notificaciones de comentarios
  /**
   *
   * @param userId
   * @param commentedBy
   * @param contentType
   * @param contentId
   * @param commentPreview
   */
  async sendCommentNotification(
    userId,
    commentedBy,
    contentType,
    contentId,
    commentPreview
  ) {
    try {
      const [user, commentedByUser] = await Promise.all([
        User.findById(userId),
        User.findById(commentedBy),
      ]);

      if (!user || !commentedByUser) {
        throw new Error('Usuario no encontrado');
      }

      const notification = {
        type: this.notificationTypes.COMMENT,
        title: 'Nuevo comentario',
        body: `${commentedByUser.firstName} comentó: "${commentPreview}"`,
        data: {
          commentedBy: commentedByUser._id,
          commentedByName: commentedByUser.firstName,
          contentType,
          contentId,
          commentPreview,
        },
        priority: this.priorityLevels.NORMAL,
        categoryId: 'social',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación de comentario:', error);
      return false;
    }
  }

  // Notificaciones de seguimiento
  /**
   *
   * @param userId
   * @param followedBy
   */
  async sendFollowNotification(userId, followedBy) {
    try {
      const [user, followedByUser] = await Promise.all([
        User.findById(userId),
        User.findById(followedBy),
      ]);

      if (!user || !followedByUser) {
        throw new Error('Usuario no encontrado');
      }

      const notification = {
        type: this.notificationTypes.FOLLOW,
        title: 'Nuevo seguidor',
        body: `${followedByUser.firstName} comenzó a seguirte`,
        data: {
          followedBy: followedByUser._id,
          followedByName: followedByUser.firstName,
        },
        priority: this.priorityLevels.LOW,
        categoryId: 'social',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación de seguimiento:', error);
      return false;
    }
  }

  // Notificaciones del sistema
  /**
   *
   * @param userId
   * @param title
   * @param body
   * @param data
   */
  async sendSystemNotification(userId, title, body, data = {}) {
    try {
      const notification = {
        type: this.notificationTypes.SYSTEM,
        title,
        body,
        data,
        priority: this.priorityLevels.NORMAL,
        categoryId: 'system',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación del sistema:', error);
      return false;
    }
  }

  // Notificaciones de seguridad
  /**
   *
   * @param userId
   * @param title
   * @param body
   * @param data
   */
  async sendSecurityNotification(userId, title, body, data = {}) {
    try {
      const notification = {
        type: this.notificationTypes.SECURITY,
        title,
        body,
        data,
        priority: this.priorityLevels.HIGH,
        categoryId: 'security',
        sound: 'default',
        badge: 1,
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación de seguridad:', error);
      return false;
    }
  }

  // Notificaciones promocionales
  /**
   *
   * @param userId
   * @param title
   * @param body
   * @param data
   */
  async sendPromotionalNotification(userId, title, body, data = {}) {
    try {
      const notification = {
        type: this.notificationTypes.PROMOTIONAL,
        title,
        body,
        data,
        priority: this.priorityLevels.LOW,
        categoryId: 'promotional',
        sound: 'default',
      };

      return await this.sendMultiChannelNotification(userId, notification);
    } catch (error) {
      console.error('Error enviando notificación promocional:', error);
      return false;
    }
  }

  // Enviar notificación masiva
  /**
   *
   * @param userIds
   * @param notification
   * @param channels
   */
  async sendBulkNotification(
    userIds,
    notification,
    channels = ['push', 'in_app']
  ) {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId =>
          this.sendMultiChannelNotification(userId, notification, channels)
        )
      );

      const successful = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const failed = results.filter(
        result => result.status === 'rejected'
      ).length;

      console.log(
        `Notificaciones masivas enviadas: ${successful} exitosas, ${failed} fallidas`
      );

      return {
        total: userIds.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          userId: userIds[index],
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason : null,
        })),
      };
    } catch (error) {
      console.error('Error enviando notificaciones masivas:', error);
      return {
        total: userIds.length,
        successful: 0,
        failed: userIds.length,
        error: error.message,
      };
    }
  }

  // Programar notificación
  /**
   *
   * @param userId
   * @param notification
   * @param scheduledTime
   */
  async scheduleNotification(userId, notification, scheduledTime) {
    try {
      const scheduledNotification = new ScheduledNotification({
        userId,
        notification,
        scheduledTime,
        status: 'pending',
      });

      await scheduledNotification.save();

      // Aquí implementarías un job scheduler (como Bull, Agenda, etc.)
      // para ejecutar la notificación en el tiempo programado

      return scheduledNotification._id;
    } catch (error) {
      console.error('Error programando notificación:', error);
      return null;
    }
  }

  // Cancelar notificación programada
  /**
   *
   * @param notificationId
   */
  async cancelScheduledNotification(notificationId) {
    try {
      const scheduledNotification =
        await ScheduledNotification.findById(notificationId);
      if (scheduledNotification) {
        scheduledNotification.status = 'cancelled';
        await scheduledNotification.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelando notificación programada:', error);
      return false;
    }
  }

  // Obtener estadísticas de notificaciones
  /**
   *
   * @param userId
   * @param timeRange
   */
  async getNotificationStats(userId, timeRange = '7d') {
    try {
      const startDate = new Date();
      switch (timeRange) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const stats = await InAppNotification.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            read: { $sum: { $cond: ['$read', 1, 0] } },
            unread: { $sum: { $cond: ['$read', 0, 1] } },
          },
        },
      ]);

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      return [];
    }
  }

  // Marcar notificación como leída
  /**
   *
   * @param notificationId
   */
  async markNotificationAsRead(notificationId) {
    try {
      const notification = await InAppNotification.findById(notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
        await notification.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      return false;
    }
  }

  // Marcar todas las notificaciones como leídas
  /**
   *
   * @param userId
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const result = await InAppNotification.updateMany(
        { userId, read: false },
        { read: true, readAt: new Date() }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error(
        'Error marcando todas las notificaciones como leídas:',
        error
      );
      return 0;
    }
  }

  // Limpiar notificaciones antiguas
  /**
   *
   * @param daysOld
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await InAppNotification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true,
      });

      console.log(`Notificaciones antiguas limpiadas: ${result.deletedCount}`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;

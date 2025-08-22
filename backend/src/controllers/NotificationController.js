const { redis } = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { InAppNotification, ScheduledNotification, User } = require('../models');
const NotificationService = require('../services/NotificationService');

/**
 *
 */
class NotificationController {
  /**
   *
   */
  constructor() {
    this.notificationService = new NotificationService();
  }

  // ==================== NOTIFICACIONES IN-APP ====================

  // Obtener notificaciones in-app del usuario
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getInAppNotifications(req, res, next) {
    try {
      const { page = 1, limit = 20, type, priority, read } = req.query;
      const userId = req.user.id;

      const query = { userId };

      // Filtros opcionales
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (read !== undefined) query.read = read === 'true';

      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        InAppNotification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'firstName lastName avatar'),
        InAppNotification.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo notificaciones', 500));
    }
  }

  // Obtener notificaciones no leídas
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getUnreadNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50 } = req.query;

      const notifications = await InAppNotification.findUnreadByUser(
        userId,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length,
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo notificaciones no leídas', 500));
    }
  }

  // Obtener estadísticas de notificaciones
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getNotificationStats(req, res, next) {
    try {
      const userId = req.user.id;
      const { timeRange = '7d' } = req.query;

      const stats = await InAppNotification.getNotificationStats(
        userId,
        timeRange
      );

      res.json({
        success: true,
        data: {
          stats,
          timeRange,
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo estadísticas', 500));
    }
  }

  // Marcar notificación como leída
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async markNotificationAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await InAppNotification.findOne({ _id: id, userId });
      if (!notification) {
        return next(new AppError('Notificación no encontrada', 404));
      }

      await notification.markAsRead();

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: { notification },
      });
    } catch (error) {
      next(new AppError('Error marcando notificación como leída', 500));
    }
  }

  // Marcar todas las notificaciones como leídas
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async markAllNotificationsAsRead(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await InAppNotification.markAllAsReadByUser(userId);

      res.json({
        success: true,
        message: `${result.modifiedCount} notificaciones marcadas como leídas`,
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      next(new AppError('Error marcando notificaciones como leídas', 500));
    }
  }

  // Eliminar notificación
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await InAppNotification.findOneAndDelete({
        _id: id,
        userId,
      });
      if (!notification) {
        return next(new AppError('Notificación no encontrada', 404));
      }

      res.json({
        success: true,
        message: 'Notificación eliminada',
        data: { notification },
      });
    } catch (error) {
      next(new AppError('Error eliminando notificación', 500));
    }
  }

  // Eliminar todas las notificaciones del usuario
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async deleteAllNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { read } = req.query;

      const query = { userId };
      if (read !== undefined) {
        query.read = read === 'true';
      }

      const result = await InAppNotification.deleteMany(query);

      res.json({
        success: true,
        message: `${result.deletedCount} notificaciones eliminadas`,
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      next(new AppError('Error eliminando notificaciones', 500));
    }
  }

  // ==================== NOTIFICACIONES PROGRAMADAS ====================

  // Obtener notificaciones programadas del usuario
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getScheduledNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, limit = 50 } = req.query;

      const query = { userId };
      if (status) query.status = status;

      const notifications = await ScheduledNotification.find(query)
        .sort({ scheduledTime: 1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length,
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo notificaciones programadas', 500));
    }
  }

  // Programar notificación
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async scheduleNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const notificationData = req.body;

      const scheduledNotification = new ScheduledNotification({
        userId,
        ...notificationData,
      });

      await scheduledNotification.save();

      res.status(201).json({
        success: true,
        message: 'Notificación programada exitosamente',
        data: { scheduledNotification },
      });
    } catch (error) {
      next(new AppError('Error programando notificación', 500));
    }
  }

  // Actualizar notificación programada
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateScheduledNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const scheduledNotification = await ScheduledNotification.findOne({
        _id: id,
        userId,
      });
      if (!scheduledNotification) {
        return next(new AppError('Notificación programada no encontrada', 404));
      }

      // Solo permitir actualizar si está pendiente
      if (scheduledNotification.status !== 'pending') {
        return next(
          new AppError(
            'No se puede actualizar una notificación ya procesada',
            400
          )
        );
      }

      Object.assign(scheduledNotification, updateData);
      await scheduledNotification.save();

      res.json({
        success: true,
        message: 'Notificación programada actualizada',
        data: { scheduledNotification },
      });
    } catch (error) {
      next(new AppError('Error actualizando notificación programada', 500));
    }
  }

  // Cancelar notificación programada
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async cancelScheduledNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const scheduledNotification = await ScheduledNotification.findOne({
        _id: id,
        userId,
      });
      if (!scheduledNotification) {
        return next(new AppError('Notificación programada no encontrada', 404));
      }

      await scheduledNotification.cancel();

      res.json({
        success: true,
        message: 'Notificación programada cancelada',
        data: { scheduledNotification },
      });
    } catch (error) {
      next(new AppError('Error cancelando notificación programada', 500));
    }
  }

  // Cancelar todas las notificaciones programadas del usuario
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async cancelAllScheduledNotifications(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await ScheduledNotification.cancelByUser(userId);

      res.json({
        success: true,
        message: `${result.modifiedCount} notificaciones programadas canceladas`,
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      next(new AppError('Error cancelando notificaciones programadas', 500));
    }
  }

  // ==================== PREFERENCIAS DE USUARIO ====================

  // Obtener preferencias de notificaciones del usuario
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getUserPreferences(req, res, next) {
    try {
      const userId = req.user.id;

      // Intentar obtener del cache primero
      const cached = await redis.get(`user:preferences:${userId}`);
      if (cached) {
        return res.json({
          success: true,
          data: { preferences: JSON.parse(cached) },
        });
      }

      const user = await User.findById(userId).select(
        'notificationPreferences'
      );
      if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
      }

      const preferences =
        user.notificationPreferences || this.getDefaultPreferences();

      // Cachear por 1 hora
      await redis.set(
        `user:preferences:${userId}`,
        JSON.stringify(preferences),
        3600
      );

      res.json({
        success: true,
        data: { preferences },
      });
    } catch (error) {
      next(new AppError('Error obteniendo preferencias', 500));
    }
  }

  // Actualizar preferencias de notificaciones
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateUserPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
      }

      // Fusionar con preferencias existentes
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...updateData,
      };

      await user.save();

      // Actualizar cache
      await redis.set(
        `user:preferences:${userId}`,
        JSON.stringify(user.notificationPreferences),
        3600
      );

      res.json({
        success: true,
        message: 'Preferencias actualizadas',
        data: { preferences: user.notificationPreferences },
      });
    } catch (error) {
      next(new AppError('Error actualizando preferencias', 500));
    }
  }

  // ==================== TOKENS DE PUSH ====================

  // Registrar token de push
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async registerPushToken(req, res, next) {
    try {
      const userId = req.user.id;
      const { token, platform, deviceId, appVersion, osVersion } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
      }

      // Verificar si el token ya existe
      const existingToken = user.pushTokens.find(t => t.token === token);
      if (existingToken) {
        // Actualizar información del dispositivo
        Object.assign(existingToken, {
          platform,
          deviceId,
          appVersion,
          osVersion,
          lastUsed: new Date(),
        });
      } else {
        // Agregar nuevo token
        user.pushTokens.push({
          token,
          platform,
          deviceId,
          appVersion,
          osVersion,
          registeredAt: new Date(),
          lastUsed: new Date(),
        });
      }

      await user.save();

      res.json({
        success: true,
        message: 'Token de push registrado',
        data: { tokenCount: user.pushTokens.length },
      });
    } catch (error) {
      next(new AppError('Error registrando token de push', 500));
    }
  }

  // Desregistrar token de push
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async unregisterPushToken(req, res, next) {
    try {
      const userId = req.user.id;
      const { token } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
      }

      user.pushTokens = user.pushTokens.filter(t => t.token !== token);
      await user.save();

      res.json({
        success: true,
        message: 'Token de push desregistrado',
        data: { tokenCount: user.pushTokens.length },
      });
    } catch (error) {
      next(new AppError('Error desregistrando token de push', 500));
    }
  }

  // Obtener tokens de push del usuario
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getPushTokens(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('pushTokens');
      if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
      }

      res.json({
        success: true,
        data: {
          tokens: user.pushTokens,
          count: user.pushTokens.length,
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo tokens de push', 500));
    }
  }

  // ==================== NOTIFICACIONES DEL SISTEMA ====================

  // Obtener notificaciones del sistema
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getSystemNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;

      const notifications = await InAppNotification.find({
        userId,
        type: 'system',
        status: { $in: ['sent', 'delivered'] },
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length,
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo notificaciones del sistema', 500));
    }
  }

  // Enviar notificación del sistema
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async broadcastSystemNotification(req, res, next) {
    try {
      const {
        title,
        body,
        recipients,
        data,
        priority,
        channels,
        scheduledFor,
        expiresAt,
      } = req.body;

      let userIds = [];

      if (Array.isArray(recipients)) {
        userIds = recipients;
      } else if (recipients === 'all') {
        const users = await User.find({}).select('_id');
        userIds = users.map(u => u._id);
      } else if (recipients === 'online') {
        // Implementar lógica para usuarios online
        userIds = await this.getOnlineUserIds();
      } else if (recipients === 'active') {
        // Implementar lógica para usuarios activos
        userIds = await this.getActiveUserIds();
      }

      if (userIds.length === 0) {
        return next(new AppError('No se encontraron destinatarios', 400));
      }

      let results;
      if (scheduledFor) {
        // Programar notificación
        const scheduledNotifications = userIds.map(userId => ({
          userId,
          notification: {
            type: 'system',
            title,
            body,
            data,
            priority,
            channels,
          },
          scheduledTime: new Date(scheduledFor),
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          metadata: {
            source: 'system',
            createdBy: req.user.id,
          },
        }));

        await ScheduledNotification.insertMany(scheduledNotifications);
        results = { scheduled: scheduledNotifications.length };
      } else {
        // Enviar inmediatamente
        results = await this.notificationService.sendBulkNotification(userIds, {
          type: 'system',
          title,
          body,
          data,
          priority,
          channels,
        });
      }

      res.json({
        success: true,
        message: 'Notificación del sistema enviada',
        data: results,
      });
    } catch (error) {
      next(new AppError('Error enviando notificación del sistema', 500));
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get notification statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getNotificationStats(req, res) {
    try {
      const { _userId, _timeRange } = req.query;
      // Implementation for notification statistics
      res.json({ success: true, data: {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get notification analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getNotificationAnalytics(req, res) {
    try {
      const { _userId, _timeRange } = req.query;
      // Implementation for notification analytics
      res.json({ success: true, data: {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get notification trends
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getNotificationTrends(req, res) {
    try {
      const { _userId, _timeRange } = req.query;
      // Implementation for notification trends
      res.json({ success: true, data: {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get notification insights
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getNotificationInsights(req, res) {
    try {
      const { _userId, _timeRange } = req.query;
      // Implementation for notification insights
      res.json({ success: true, data: {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Obtener métricas de engagement
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getEngagementMetrics(req, res, next) {
    try {
      const userId = req.user.id;
      const { timeRange = '30d' } = req.query;

      // Implementar métricas de engagement más detalladas
      const engagement = {
        timeToRead: await this.calculateAverageTimeToRead(userId, timeRange),
        timeToClick: await this.calculateAverageTimeToClick(userId, timeRange),
        responseRate: await this.calculateResponseRate(userId, timeRange),
        retentionImpact: await this.calculateRetentionImpact(userId, timeRange),
      };

      res.json({
        success: true,
        data: {
          engagement,
          timeRange,
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo métricas de engagement', 500));
    }
  }

  // ==================== ADMIN ====================

  // Obtener todas las notificaciones (admin)
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getAllNotifications(req, res, next) {
    try {
      const { page = 1, limit = 50, type, status, userId } = req.query;

      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (userId) query.userId = userId;

      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        InAppNotification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'firstName lastName email'),
        InAppNotification.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo notificaciones', 500));
    }
  }

  // Obtener notificaciones de un usuario específico (admin)
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getUserNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        InAppNotification.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        InAppNotification.countDocuments({ userId }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      next(new AppError('Error obteniendo notificaciones del usuario', 500));
    }
  }

  // Enviar notificación como admin
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async sendAdminNotification(req, res, next) {
    try {
      const { userIds, notification } = req.body;

      const results = await this.notificationService.sendBulkNotification(
        userIds,
        notification
      );

      res.json({
        success: true,
        message: 'Notificación enviada',
        data: results,
      });
    } catch (error) {
      next(new AppError('Error enviando notificación', 500));
    }
  }

  // Limpiar notificaciones antiguas (admin)
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async cleanupOldNotifications(req, res, next) {
    try {
      const { daysOld = 30 } = req.query;

      const result = await InAppNotification.cleanupOldNotifications(
        parseInt(daysOld)
      );

      res.json({
        success: true,
        message: `${result} notificaciones antiguas eliminadas`,
        data: { deletedCount: result },
      });
    } catch (error) {
      next(new AppError('Error limpiando notificaciones', 500));
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  // Obtener preferencias por defecto
  /**
   *
   */
  getDefaultPreferences() {
    return {
      push: {
        enabled: true,
        types: {
          event_invite: true,
          event_reminder: true,
          event_update: true,
          event_cancelled: true,
          tribe_invite: true,
          tribe_update: true,
          new_message: true,
          mention: true,
          like: true,
          comment: true,
          follow: true,
          system: true,
          security: true,
          promotional: false,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        },
      },
      email: {
        enabled: true,
        types: {
          event_invite: true,
          event_reminder: true,
          event_update: true,
          event_cancelled: true,
          tribe_invite: true,
          tribe_update: true,
          new_message: false,
          mention: true,
          like: false,
          comment: false,
          follow: false,
          system: true,
          security: true,
          promotional: false,
        },
        frequency: 'immediate',
      },
      sms: {
        enabled: false,
        types: {
          event_reminder: true,
          security: true,
        },
      },
      in_app: {
        enabled: true,
        types: {
          event_invite: true,
          event_reminder: true,
          event_update: true,
          event_cancelled: true,
          tribe_invite: true,
          tribe_update: true,
          new_message: true,
          mention: true,
          like: true,
          comment: true,
          follow: true,
          system: true,
          security: true,
          promotional: true,
        },
        sound: true,
        vibration: true,
        badge: true,
      },
    };
  }

  // Obtener IDs de usuarios online
  /**
   *
   */
  async getOnlineUserIds() {
    // Implementar lógica para obtener usuarios online
    // Por ejemplo, usando Redis o WebSocket connections
    return [];
  }

  // Obtener IDs de usuarios activos
  /**
   *
   */
  async getActiveUserIds() {
    // Implementar lógica para obtener usuarios activos
    // Por ejemplo, usuarios que han usado la app en las últimas 24h
    const activeUsers = await User.find({
      lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).select('_id');

    return activeUsers.map(u => u._id);
  }

  // Calcular tiempo promedio para leer
  /**
   *
   * @param userId
   * @param timeRange
   */
  async calculateAverageTimeToRead(userId, timeRange) {
    // Implementar cálculo de tiempo promedio para leer notificaciones
    return 0;
  }

  // Calcular tiempo promedio para hacer clic
  /**
   *
   * @param userId
   * @param timeRange
   */
  async calculateAverageTimeToClick(userId, timeRange) {
    // Implementar cálculo de tiempo promedio para hacer clic
    return 0;
  }

  // Calcular tasa de respuesta
  /**
   *
   * @param userId
   * @param timeRange
   */
  async calculateResponseRate(userId, timeRange) {
    // Implementar cálculo de tasa de respuesta
    return 0;
  }

  // Calcular impacto en retención
  /**
   *
   * @param userId
   * @param timeRange
   */
  async calculateRetentionImpact(userId, timeRange) {
    // Implementar cálculo de impacto en retención
    return 0;
  }
}

module.exports = NotificationController;

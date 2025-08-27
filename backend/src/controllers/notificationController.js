const { User, Notification } = require('../models');
const { logger } = require('../utils/logger');

class NotificationController {
  // ==========================================
  // NOTIFICACIONES IN-APP
  // ==========================================

  async getInAppNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error obteniendo notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo notificaciones',
        error: error.message,
      });
    }
  }

  async getUnreadNotifications(req, res) {
    try {
      const userId = req.user.id;

      const unreadCount = await Notification.countDocuments({
        userId,
        read: false,
      });

      res.json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      logger.error('Error obteniendo notificaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo notificaciones no leídas',
        error: error.message,
      });
    }
  }

  async getNotificationStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = {
        total: await Notification.countDocuments({ userId }),
        unread: await Notification.countDocuments({ userId, read: false }),
        read: await Notification.countDocuments({ userId, read: true }),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de notificaciones',
        error: error.message,
      });
    }
  }

  async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notification,
      });
    } catch (error) {
      logger.error('Error marcando notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error marcando notificación como leída',
        error: error.message,
      });
    }
  }

  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.updateMany(
        { userId, read: false },
        { read: true, readAt: new Date() }
      );

      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
      });
    } catch (error) {
      logger.error('Error marcando todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error marcando todas las notificaciones como leídas',
        error: error.message,
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente',
      });
    } catch (error) {
      logger.error('Error eliminando notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando notificación',
        error: error.message,
      });
    }
  }

  async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;

      await Notification.deleteMany({ userId });

      res.json({
        success: true,
        message: 'Todas las notificaciones eliminadas exitosamente',
      });
    } catch (error) {
      logger.error('Error eliminando todas las notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando todas las notificaciones',
        error: error.message,
      });
    }
  }

  // ==========================================
  // NOTIFICACIONES PROGRAMADAS
  // ==========================================

  async getScheduledNotifications(req, res) {
    try {
      const userId = req.user.id;

      const scheduledNotifications = await Notification.find({
        userId,
        scheduled: true,
        scheduledAt: { $gt: new Date() },
      }).sort({ scheduledAt: 1 });

      res.json({
        success: true,
        data: scheduledNotifications,
      });
    } catch (error) {
      logger.error('Error obteniendo notificaciones programadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo notificaciones programadas',
        error: error.message,
      });
    }
  }

  async scheduleNotification(req, res) {
    try {
      const userId = req.user.id;
      const { title, message, scheduledAt, type } = req.body;

      const notification = new Notification({
        userId,
        title,
        message,
        type: type || 'reminder',
        scheduled: true,
        scheduledAt: new Date(scheduledAt),
        createdAt: new Date(),
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Notificación programada exitosamente',
        data: notification,
      });
    } catch (error) {
      logger.error('Error programando notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error programando notificación',
        error: error.message,
      });
    }
  }

  async updateScheduledNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId, scheduled: true },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación programada no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Notificación programada actualizada exitosamente',
        data: notification,
      });
    } catch (error) {
      logger.error('Error actualizando notificación programada:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando notificación programada',
        error: error.message,
      });
    }
  }

  async cancelScheduledNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId,
        scheduled: true,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación programada no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Notificación programada cancelada exitosamente',
      });
    } catch (error) {
      logger.error('Error cancelando notificación programada:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelando notificación programada',
        error: error.message,
      });
    }
  }

  async cancelAllScheduledNotifications(req, res) {
    try {
      const userId = req.user.id;

      await Notification.deleteMany({
        userId,
        scheduled: true,
      });

      res.json({
        success: true,
        message: 'Todas las notificaciones programadas canceladas exitosamente',
      });
    } catch (error) {
      logger.error('Error cancelando todas las notificaciones programadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelando todas las notificaciones programadas',
        error: error.message,
      });
    }
  }

  // ==========================================
  // PREFERENCIAS DE NOTIFICACIONES
  // ==========================================

  async getUserPreferences(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('notificationPreferences');
      const preferences = user?.notificationPreferences || {
        email: true,
        push: true,
        inApp: true,
        marketing: false,
        events: true,
        reminders: true,
      };

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      logger.error('Error obteniendo preferencias de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo preferencias de notificaciones',
        error: error.message,
      });
    }
  }

  async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { notificationPreferences: preferences },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Preferencias actualizadas exitosamente',
        data: updatedUser.notificationPreferences,
      });
    } catch (error) {
      logger.error('Error actualizando preferencias de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando preferencias de notificaciones',
        error: error.message,
      });
    }
  }

  // ==========================================
  // TOKENS DE PUSH
  // ==========================================

  async registerPushToken(req, res) {
    try {
      const userId = req.user.id;
      const { token, platform } = req.body;

      const user = await User.findById(userId);
      if (!user.pushTokens) {
        user.pushTokens = [];
      }

      // Evitar duplicados
      if (!user.pushTokens.includes(token)) {
        user.pushTokens.push(token);
        await user.save();
      }

      res.json({
        success: true,
        message: 'Token de push registrado exitosamente',
      });
    } catch (error) {
      logger.error('Error registrando token de push:', error);
      res.status(500).json({
        success: false,
        message: 'Error registrando token de push',
        error: error.message,
      });
    }
  }

  async unregisterPushToken(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.params;

      await User.findByIdAndUpdate(userId, {
        $pull: { pushTokens: token },
      });

      res.json({
        success: true,
        message: 'Token de push eliminado exitosamente',
      });
    } catch (error) {
      logger.error('Error eliminando token de push:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando token de push',
        error: error.message,
      });
    }
  }

  async getPushTokens(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('pushTokens');
      const tokens = user?.pushTokens || [];

      res.json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      logger.error('Error obteniendo tokens de push:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tokens de push',
        error: error.message,
      });
    }
  }

  // ==========================================
  // NOTIFICACIONES DEL SISTEMA
  // ==========================================

  async getSystemNotifications(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ type: 'system' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments({ type: 'system' });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error obteniendo notificaciones del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo notificaciones del sistema',
        error: error.message,
      });
    }
  }

  async broadcastSystemNotification(req, res) {
    try {
      const { title, message, targetUsers } = req.body;

      // Crear notificación del sistema
      const notification = new Notification({
        title,
        message,
        type: 'system',
        broadcast: true,
        targetUsers: targetUsers || 'all',
        createdAt: new Date(),
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Notificación del sistema enviada exitosamente',
        data: notification,
      });
    } catch (error) {
      logger.error('Error enviando notificación del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación del sistema',
        error: error.message,
      });
    }
  }

  // ==========================================
  // MÉTODOS ADICIONALES - ANALYTICS Y ADMIN
  // ==========================================

  async getNotificationAnalytics(req, res) {
    try {
      const userId = req.user.id;

      const analytics = {
        totalSent: await Notification.countDocuments({ userId }),
        totalRead: await Notification.countDocuments({ userId, read: true }),
        totalUnread: await Notification.countDocuments({ userId, read: false }),
        readRate: 0,
        averageResponseTime: 0,
      };

      if (analytics.totalSent > 0) {
        analytics.readRate = (analytics.totalRead / analytics.totalSent) * 100;
      }

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Error obteniendo analytics de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo analytics de notificaciones',
        error: error.message,
      });
    }
  }

  async getEngagementMetrics(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const metrics = {
        notificationsReceived: await Notification.countDocuments({
          userId,
          createdAt: { $gte: startDate },
        }),
        notificationsRead: await Notification.countDocuments({
          userId,
          read: true,
          readAt: { $gte: startDate },
        }),
        averageReadTime: 0,
      };

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Error obteniendo métricas de engagement:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo métricas de engagement',
        error: error.message,
      });
    }
  }

  async getAllNotifications(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments();

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error obteniendo todas las notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo todas las notificaciones',
        error: error.message,
      });
    }
  }

  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error obteniendo notificaciones del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo notificaciones del usuario',
        error: error.message,
      });
    }
  }

  async sendAdminNotification(req, res) {
    try {
      const { title, message, targetUsers, type } = req.body;

      const notification = new Notification({
        title,
        message,
        type: type || 'admin',
        broadcast: true,
        targetUsers: targetUsers || 'all',
        createdAt: new Date(),
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Notificación administrativa enviada exitosamente',
        data: notification,
      });
    } catch (error) {
      logger.error('Error enviando notificación administrativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación administrativa',
        error: error.message,
      });
    }
  }

  async cleanupOldNotifications(req, res) {
    try {
      const { days = 90 } = req.query;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true,
      });

      res.json({
        success: true,
        message: `Limpieza completada: ${result.deletedCount} notificaciones eliminadas`,
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      logger.error('Error limpiando notificaciones antiguas:', error);
      res.status(500).json({
        success: false,
        message: 'Error limpiando notificaciones antiguas',
        error: error.message,
      });
    }
  }
}

module.exports = new NotificationController();
const { User, Notification } = require('../models');

class NotificationController {
  
  // ==========================================
  // NOTIFICACIONES IN-APP
  // ==========================================
  
  async getInAppNotifications(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await Notification.find({ 
        recipient: userId,
        type: 'in-app'
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.json({
        success: true,
        data: { notifications }
      });
    } catch (error) {
      console.error('Error getting in-app notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getUnreadNotifications(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await Notification.find({ 
        recipient: userId,
        read: false,
        type: 'in-app'
      })
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: { notifications }
      });
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getNotificationStats(req, res) {
    try {
      const userId = req.user.id;
      const total = await Notification.countDocuments({ 
        recipient: userId,
        type: 'in-app'
      });
      const unread = await Notification.countDocuments({ 
        recipient: userId,
        read: false,
        type: 'in-app'
      });

      res.json({
        success: true,
        data: {
          total,
          unread,
          read: total - unread
        }
      });
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: userId },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: { notification }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date() }
      );

      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        recipient: userId
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación eliminada'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;

      await Notification.deleteMany({ recipient: userId });

      res.json({
        success: true,
        message: 'Todas las notificaciones eliminadas'
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // NOTIFICACIONES PROGRAMADAS
  // ==========================================
  
  async getScheduledNotifications(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await Notification.find({ 
        recipient: userId,
        type: 'scheduled',
        scheduledFor: { $gte: new Date() }
      })
        .sort({ scheduledFor: 1 })
        .lean();

      res.json({
        success: true,
        data: { notifications }
      });
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async scheduleNotification(req, res) {
    try {
      const userId = req.user.id;
      const notificationData = req.body;

      const notification = new Notification({
        ...notificationData,
        recipient: userId,
        type: 'scheduled',
        createdAt: new Date()
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Notificación programada exitosamente',
        data: { notification }
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateScheduledNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: userId, type: 'scheduled' },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación programada no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación programada actualizada',
        data: { notification }
      });
    } catch (error) {
      console.error('Error updating scheduled notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async cancelScheduledNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        recipient: userId,
        type: 'scheduled'
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación programada no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación programada cancelada'
      });
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async cancelAllScheduledNotifications(req, res) {
    try {
      const userId = req.user.id;

      await Notification.deleteMany({ 
        recipient: userId,
        type: 'scheduled'
      });

      res.json({
        success: true,
        message: 'Todas las notificaciones programadas canceladas'
      });
    } catch (error) {
      console.error('Error canceling all scheduled notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
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

      res.json({
        success: true,
        data: {
          preferences: user.notificationPreferences || {}
        }
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { notificationPreferences: preferences } },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Preferencias actualizadas',
        data: {
          preferences: user.notificationPreferences
        }
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
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

      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $addToSet: { 
            'notificationPreferences.pushTokens': { token, platform }
          }
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Token de push registrado',
        data: {
          pushTokens: user.notificationPreferences.pushTokens
        }
      });
    } catch (error) {
      console.error('Error registering push token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async unregisterPushToken(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $pull: { 
            'notificationPreferences.pushTokens': { token }
          }
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Token de push eliminado',
        data: {
          pushTokens: user.notificationPreferences.pushTokens
        }
      });
    } catch (error) {
      console.error('Error unregistering push token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPushTokens(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('notificationPreferences.pushTokens');

      res.json({
        success: true,
        data: {
          pushTokens: user.notificationPreferences?.pushTokens || []
        }
      });
    } catch (error) {
      console.error('Error getting push tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // NOTIFICACIONES DEL SISTEMA
  // ==========================================
  
  async getSystemNotifications(req, res) {
    try {
      const notifications = await Notification.find({ 
        type: 'system',
        isActive: true
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      res.json({
        success: true,
        data: { notifications }
      });
    } catch (error) {
      console.error('Error getting system notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async broadcastSystemNotification(req, res) {
    try {
      const { title, message, recipients, type } = req.body;

      const notifications = recipients.map(userId => ({
        recipient: userId,
        title,
        message,
        type: 'system',
        isActive: true,
        createdAt: new Date()
      }));

      await Notification.insertMany(notifications);

      res.json({
        success: true,
        message: 'Notificación del sistema enviada',
        data: {
          sentCount: notifications.length
        }
      });
    } catch (error) {
      console.error('Error broadcasting system notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new NotificationController();
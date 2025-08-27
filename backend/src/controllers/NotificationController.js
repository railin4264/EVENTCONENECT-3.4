const { User, Notification, InAppNotification } = require('../models');
const NotificationService = require('../services/NotificationService');

// Extend existing controller with enhanced push notifications
class EnhancedNotificationController {
  // ==========================================
  // CONFIGURAR NOTIFICACIONES PUSH VISUALES
  // ==========================================

  async updatePushSettings(req, res) {
    try {
      const userId = req.user.id;
      const {
        enabled,
        richNotifications,
        actionButtons,
        grouping,
        locationBased,
        customSounds,
        quietHours,
        categories,
      } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'notificationPreferences.push.enabled': enabled,
            'notificationPreferences.push.richNotifications': richNotifications,
            'notificationPreferences.push.actionButtons': actionButtons,
            'notificationPreferences.push.grouping': grouping,
            'notificationPreferences.push.locationBased': locationBased,
            'notificationPreferences.push.customSounds': customSounds,
            'notificationPreferences.push.quietHours': quietHours,
            'notificationPreferences.push.categories': categories,
          },
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Configuración de notificaciones push actualizada',
        data: {
          pushSettings: user.notificationPreferences.push,
        },
      });
    } catch (error) {
      console.error('Error updating push settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // ENVIAR NOTIFICACIÓN PUSH ENRIQUECIDA
  // ==========================================

  async sendRichPushNotification(req, res) {
    try {
      const {
        userId,
        title,
        body,
        data,
        image,
        actions,
        category,
        sound,
        badge,
        priority,
        groupId,
        locationTrigger,
      } = req.body;

      // Validar usuario
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Verificar preferencias de usuario
      const pushPrefs = user.notificationPreferences?.push;
      if (!pushPrefs?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Notificaciones push deshabilitadas para este usuario',
        });
      }

      // Verificar categoría específica
      if (
        category &&
        pushPrefs.categories &&
        !pushPrefs.categories[category]?.enabled
      ) {
        return res.status(400).json({
          success: false,
          message: `Notificaciones de categoría ${category} deshabilitadas`,
        });
      }

      // Verificar horas silenciosas
      if (this.isInQuietHours(pushPrefs.quietHours)) {
        return res.status(400).json({
          success: false,
          message: 'Usuario en horas silenciosas',
        });
      }

      // Construir notificación enriquecida
      const richNotification = {
        to: user.pushTokens.map(token => token.token),
        title,
        body,
        data: {
          ...data,
          category,
          timestamp: new Date().toISOString(),
          userId,
        },
        android: {
          priority: priority || 'high',
          notification: {
            channelId: category || 'default',
            color: '#06b6d4',
            sound: sound || 'default',
            largeIcon: image,
            style: image
              ? {
                  type: 'bigPicture',
                  picture: image,
                }
              : undefined,
            actions: actions || [],
          },
          data: {
            groupId: groupId || category,
            ...data,
          },
        },
        ios: {
          aps: {
            alert: {
              title,
              body,
            },
            badge: badge || 1,
            sound: sound || 'default',
            category: category || 'default',
            'mutable-content': 1,
            'content-available': 1,
          },
          data: {
            image,
            actions: JSON.stringify(actions || []),
            groupId: groupId || category,
            ...data,
          },
        },
        web: {
          notification: {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            image,
            badge: '/icons/badge-72x72.png',
            tag: groupId || category,
            data: {
              actions: actions || [],
              ...data,
            },
            actions:
              actions?.map(action => ({
                action: action.id,
                title: action.title,
                icon: action.icon,
              })) || [],
          },
        },
      };

      // Enviar notificación
      const result = await NotificationService.sendRichPushNotification(
        user.pushTokens,
        richNotification
      );

      // Guardar en base de datos
      const notification = new Notification({
        userId,
        type: category || 'general',
        title,
        message: body,
        data: {
          ...data,
          image,
          actions,
          groupId,
        },
        deliveryMethod: ['push'],
        status: result.success ? 'sent' : 'failed',
        metadata: {
          pushResult: result,
          richContent: true,
          platform: 'all',
        },
      });

      await notification.save();

      res.json({
        success: true,
        message: 'Notificación push enriquecida enviada',
        data: {
          notificationId: notification._id,
          deliveryResult: result,
          recipients: user.pushTokens.length,
        },
      });
    } catch (error) {
      console.error('Error sending rich push notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // NOTIFICACIONES GRUPALES
  // ==========================================

  async sendGroupedNotification(req, res) {
    try {
      const {
        groupId,
        title,
        body,
        data,
        participants,
        category,
        collapseKey,
        summaryText,
      } = req.body;

      const results = [];

      for (const userId of participants) {
        const user = await User.findById(userId);
        if (!user || !user.notificationPreferences?.push?.enabled) {
          continue;
        }

        // Construir notificación grupal
        const groupNotification = {
          to: user.pushTokens.map(token => token.token),
          title,
          body,
          data: {
            ...data,
            groupId,
            userId,
          },
          android: {
            collapseKey: collapseKey || groupId,
            notification: {
              channelId: category || 'group',
              tag: groupId,
              group: groupId,
              groupSummary: participants.indexOf(userId) === 0,
              summaryText:
                summaryText || `${participants.length} participantes`,
            },
          },
          ios: {
            aps: {
              'thread-id': groupId,
              'summary-arg': user.firstName,
              'summary-arg-count': participants.length,
            },
          },
          web: {
            notification: {
              tag: groupId,
              renotify: true,
              data: {
                groupId,
                totalMembers: participants.length,
              },
            },
          },
        };

        const result = await NotificationService.sendRichPushNotification(
          user.pushTokens,
          groupNotification
        );

        results.push({
          userId,
          success: result.success,
          details: result,
        });
      }

      res.json({
        success: true,
        message: 'Notificaciones grupales enviadas',
        data: {
          groupId,
          totalRecipients: participants.length,
          successfulDeliveries: results.filter(r => r.success).length,
          results,
        },
      });
    } catch (error) {
      console.error('Error sending grouped notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // NOTIFICACIONES BASADAS EN UBICACIÓN
  // ==========================================

  async sendLocationBasedNotification(req, res) {
    try {
      const {
        center,
        radius,
        title,
        body,
        data,
        category,
        excludeUserIds = [],
      } = req.body;

      // Encontrar usuarios en el área
      const usersInArea = await User.find({
        _id: { $nin: excludeUserIds },
        'notificationPreferences.push.enabled': true,
        'notificationPreferences.push.locationBased': true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: center,
            },
            $maxDistance: radius,
          },
        },
      });

      const results = [];

      for (const user of usersInArea) {
        const locationNotification = {
          to: user.pushTokens.map(token => token.token),
          title,
          body,
          data: {
            ...data,
            locationBased: true,
            userLocation: user.location.coordinates,
            distance: this.calculateDistance(center, user.location.coordinates),
          },
          android: {
            notification: {
              channelId: category || 'location',
              icon: 'ic_location',
              color: '#06b6d4',
            },
          },
          ios: {
            aps: {
              category: category || 'location',
              'loc-key': 'LOCATION_NOTIFICATION_BODY',
              'loc-args': [title],
            },
          },
        };

        const result = await NotificationService.sendRichPushNotification(
          user.pushTokens,
          locationNotification
        );

        results.push({
          userId: user._id,
          distance: this.calculateDistance(center, user.location.coordinates),
          success: result.success,
        });
      }

      res.json({
        success: true,
        message: 'Notificaciones basadas en ubicación enviadas',
        data: {
          center,
          radius,
          usersFound: usersInArea.length,
          successfulDeliveries: results.filter(r => r.success).length,
          results,
        },
      });
    } catch (error) {
      console.error('Error sending location-based notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // ANALYTICS DE NOTIFICACIONES
  // ==========================================

  async getNotificationAnalytics(req, res) {
    try {
      const { timeframe = '7d', category, userId } = req.query;

      const startDate = this.getStartDate(timeframe);
      const filter = {
        createdAt: { $gte: startDate },
      };

      if (category) filter.type = category;
      if (userId) filter.userId = userId;

      const analytics = await Notification.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              type: '$type',
              status: '$status',
            },
            count: { $sum: 1 },
            deliveryMethods: { $push: '$deliveryMethod' },
          },
        },
        {
          $group: {
            _id: { date: '$_id.date', type: '$_id.type' },
            total: { $sum: '$count' },
            sent: {
              $sum: {
                $cond: [{ $eq: ['$_id.status', 'sent'] }, '$count', 0],
              },
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$_id.status', 'failed'] }, '$count', 0],
              },
            },
            delivered: {
              $sum: {
                $cond: [{ $eq: ['$_id.status', 'delivered'] }, '$count', 0],
              },
            },
            opened: {
              $sum: {
                $cond: [{ $eq: ['$_id.status', 'opened'] }, '$count', 0],
              },
            },
          },
        },
        { $sort: { '_id.date': 1, '_id.type': 1 } },
      ]);

      res.json({
        success: true,
        data: {
          timeframe,
          analytics,
          summary: {
            totalNotifications: analytics.reduce(
              (sum, item) => sum + item.total,
              0
            ),
            deliveryRate: this.calculateDeliveryRate(analytics),
            openRate: this.calculateOpenRate(analytics),
          },
        },
      });
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  isInQuietHours(quietHours) {
    if (!quietHours?.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1[1] * Math.PI) / 180;
    const φ2 = (point2[1] * Math.PI) / 180;
    const Δφ = ((point2[1] - point1[1]) * Math.PI) / 180;
    const Δλ = ((point2[0] - point1[0]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  getStartDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  calculateDeliveryRate(analytics) {
    const total = analytics.reduce((sum, item) => sum + item.total, 0);
    const delivered = analytics.reduce((sum, item) => sum + item.delivered, 0);
    return total > 0 ? Math.round((delivered / total) * 100) : 0;
  }

  calculateOpenRate(analytics) {
    const delivered = analytics.reduce((sum, item) => sum + item.delivered, 0);
    const opened = analytics.reduce((sum, item) => sum + item.opened, 0);
    return delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
  }
}

module.exports = new EnhancedNotificationController();

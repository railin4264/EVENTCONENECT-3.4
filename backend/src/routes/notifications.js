const express = require('express');

const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimitMiddleware');

// Rutas para notificaciones in-app
router.get('/in-app', authenticateToken, notificationController.getInAppNotifications);
router.get(
  '/in-app/unread',
  authenticateToken,
  notificationController.getUnreadNotifications
);
router.get(
  '/in-app/stats',
  authenticateToken,
  notificationController.getNotificationStats
);
router.patch(
  '/in-app/:id/read',
  authenticateToken,
  notificationController.markNotificationAsRead
);
router.patch(
  '/in-app/read-all',
  authenticateToken,
  notificationController.markAllNotificationsAsRead
);
router.delete(
  '/in-app/:id',
  authenticateToken,
  notificationController.deleteNotification
);
router.delete(
  '/in-app',
  authenticateToken,
  notificationController.deleteAllNotifications
);

// Rutas para notificaciones programadas
router.get(
  '/scheduled',
  authenticateToken,
  notificationController.getScheduledNotifications
);
router.post(
  '/scheduled',
  authenticateToken,
  generalLimiter,
  notificationController.scheduleNotification
);
router.patch(
  '/scheduled/:id',
  authenticateToken,
  generalLimiter,
  notificationController.updateScheduledNotification
);
router.delete(
  '/scheduled/:id',
  authenticateToken,
  notificationController.cancelScheduledNotification
);
router.delete(
  '/scheduled',
  authenticateToken,
  notificationController.cancelAllScheduledNotifications
);

// Rutas para preferencias de notificaciones
router.get('/preferences', authenticateToken, notificationController.getUserPreferences);
router.patch(
  '/preferences',
  authenticateToken,
  generalLimiter,
  notificationController.updateUserPreferences
);

// Rutas para tokens de push
router.post(
  '/push-token',
  authenticateToken,
  generalLimiter,
  notificationController.registerPushToken
);
router.delete(
  '/push-token/:token',
  authenticateToken,
  notificationController.unregisterPushToken
);
router.get('/push-tokens', authenticateToken, notificationController.getPushTokens);

// Rutas para notificaciones del sistema
router.get('/system', authenticateToken, notificationController.getSystemNotifications);
router.post(
  '/system/broadcast',
  authenticateToken,
  generalLimiter,
  notificationController.broadcastSystemNotification
);

// Rutas para analytics de notificaciones
router.get(
  '/analytics',
  authenticateToken,
  notificationController.getNotificationAnalytics
);
router.get(
  '/analytics/engagement',
  authenticateToken,
  notificationController.getEngagementMetrics
);

// Rutas para gestión de notificaciones (admin)
router.get('/admin/all', authenticateToken, notificationController.getAllNotifications);
router.get(
  '/admin/users/:userId',
  authenticateToken,
  notificationController.getUserNotifications
);
router.post(
  '/admin/send',
  authenticateToken,
  notificationController.sendAdminNotification
);
router.delete(
  '/admin/cleanup',
  authenticateToken,
  notificationController.cleanupOldNotifications
);

module.exports = router;

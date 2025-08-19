const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validators = require('../validators');
const { notificationController } = require('../controllers');

// Rutas para notificaciones in-app
router.get('/in-app', protect, notificationController.getInAppNotifications);
router.get('/in-app/unread', protect, notificationController.getUnreadNotifications);
router.get('/in-app/stats', protect, notificationController.getNotificationStats);
router.patch('/in-app/:id/read', protect, notificationController.markNotificationAsRead);
router.patch('/in-app/read-all', protect, notificationController.markAllNotificationsAsRead);
router.delete('/in-app/:id', protect, notificationController.deleteNotification);
router.delete('/in-app', protect, notificationController.deleteAllNotifications);

// Rutas para notificaciones programadas
router.get('/scheduled', protect, notificationController.getScheduledNotifications);
router.post('/scheduled', protect, validators.validateScheduledNotification, notificationController.scheduleNotification);
router.patch('/scheduled/:id', protect, validators.validateScheduledNotification, notificationController.updateScheduledNotification);
router.delete('/scheduled/:id', protect, notificationController.cancelScheduledNotification);
router.delete('/scheduled', protect, notificationController.cancelAllScheduledNotifications);

// Rutas para preferencias de notificaciones
router.get('/preferences', protect, notificationController.getUserPreferences);
router.patch('/preferences', protect, validators.validateUserPreferences, notificationController.updateUserPreferences);

// Rutas para tokens de push
router.post('/push-token', protect, validators.validatePushToken, notificationController.registerPushToken);
router.delete('/push-token/:token', protect, notificationController.unregisterPushToken);
router.get('/push-tokens', protect, notificationController.getPushTokens);

// Rutas para notificaciones del sistema
router.get('/system', protect, notificationController.getSystemNotifications);
router.post('/system/broadcast', protect, validators.validateSystemNotification, notificationController.broadcastSystemNotification);

// Rutas para analytics de notificaciones
router.get('/analytics', protect, notificationController.getNotificationAnalytics);
router.get('/analytics/engagement', protect, notificationController.getEngagementMetrics);

// Rutas para gestión de notificaciones (admin)
router.get('/admin/all', protect, notificationController.getAllNotifications);
router.get('/admin/users/:userId', protect, notificationController.getUserNotifications);
router.post('/admin/send', protect, notificationController.sendAdminNotification);
router.delete('/admin/cleanup', protect, notificationController.cleanupOldNotifications);

module.exports = router;
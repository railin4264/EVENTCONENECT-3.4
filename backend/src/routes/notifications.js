const express = require('express');

const router = express.Router();
const { notificationController } = require('../controllers');
const { protect } = require('../middleware/auth');

// Rutas para notificaciones push
router.patch('/push-settings', protect, notificationController.updatePushSettings);
router.post('/push/rich', protect, notificationController.sendRichPushNotification);
router.post('/push/grouped', protect, notificationController.sendGroupedNotification);
router.post('/push/location', protect, notificationController.sendLocationBasedNotification);

// Rutas para analytics
router.get('/analytics', protect, notificationController.getNotificationAnalytics);

module.exports = router;

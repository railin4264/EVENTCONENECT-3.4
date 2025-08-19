const express = require('express');
const router = express.Router();
const { notificationController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');
const { 
  validateSearch,
  validatePagination 
} = require('../middleware/validation');
const { cache } = require('../middleware/cache');

// All notification routes require authentication
router.use(protect);

// Notification management
router.get('/', validatePagination, cache(180), notificationController.getUserNotifications);
router.get('/:notificationId', cache(300), notificationController.getNotificationById);
router.post('/', notificationController.createNotification);

// Notification interactions
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-multiple', notificationController.markMultipleAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);
router.delete('/multiple', notificationController.deleteMultipleNotifications);

// Notification preferences
router.get('/preferences', notificationController.getNotificationPreferences);
router.put('/preferences', notificationController.updateNotificationPreferences);

// Notification statistics
router.get('/stats/analytics', notificationController.getNotificationStats);

// Special notification types
router.post('/event-invitation', notificationController.sendEventInvitation);
router.post('/tribe-invitation', notificationController.sendTribeInvitation);
router.post('/friend-request', notificationController.sendFriendRequest);
router.post('/post-mention', notificationController.sendPostMention);

// Admin routes
router.get('/admin/analytics', adminOnly, validateSearch, notificationController.getNotificationStats);

module.exports = router;
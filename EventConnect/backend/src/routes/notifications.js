const express = require('express');
const { body, query, param } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createNotificationValidation = [
  body('recipient')
    .isMongoId()
    .withMessage('ID de destinatario inválido'),
  body('sender')
    .optional()
    .isMongoId()
    .withMessage('ID de remitente inválido'),
  body('type')
    .isIn([
      'event_invite', 'event_update', 'event_reminder', 'event_cancelled',
      'tribe_invite', 'tribe_update', 'tribe_reminder',
      'social_follow', 'social_like', 'social_comment', 'social_mention',
      'chat_message', 'chat_invite',
      'review_received', 'review_response',
      'system_update', 'system_maintenance', 'system_announcement',
      'badge_earned', 'achievement_unlocked',
      'marketplace_order', 'marketplace_update',
      'test'
    ])
    .withMessage('Tipo de notificación inválido'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Los datos deben ser un objeto'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridad inválida'),
  body('category')
    .optional()
    .isIn(['events', 'tribes', 'social', 'chat', 'reviews', 'system', 'badges', 'marketplace'])
    .withMessage('Categoría inválida'),
  body('channels')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Los canales deben ser un array con máximo 4 elementos'),
  body('channels.*')
    .isIn(['in_app', 'push', 'email', 'sms'])
    .withMessage('Canal inválido'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Fecha de programación inválida'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración inválida')
];

const updateNotificationValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Los datos deben ser un objeto'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridad inválida'),
  body('category')
    .optional()
    .isIn(['events', 'tribes', 'social', 'chat', 'reviews', 'system', 'badges', 'marketplace'])
    .withMessage('Categoría inválida'),
  body('channels')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Los canales deben ser un array con máximo 4 elementos'),
  body('channels.*')
    .isIn(['in_app', 'push', 'email', 'sms'])
    .withMessage('Canal inválido'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Fecha de programación inválida'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración inválida')
];

const sendBulkValidation = [
  body('recipients')
    .isArray({ min: 1, max: 1000 })
    .withMessage('Los destinatarios deben ser un array con entre 1 y 1000 elementos'),
  body('recipients.*')
    .isMongoId()
    .withMessage('ID de destinatario inválido'),
  body('sender')
    .optional()
    .isMongoId()
    .withMessage('ID de remitente inválido'),
  body('type')
    .isIn([
      'event_invite', 'event_update', 'event_reminder', 'event_cancelled',
      'tribe_invite', 'tribe_update', 'tribe_reminder',
      'social_follow', 'social_like', 'social_comment', 'social_mention',
      'chat_message', 'chat_invite',
      'review_received', 'review_response',
      'system_update', 'system_maintenance', 'system_announcement',
      'badge_earned', 'achievement_unlocked',
      'marketplace_order', 'marketplace_update',
      'test'
    ])
    .withMessage('Tipo de notificación inválido'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Los datos deben ser un objeto'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridad inválida'),
  body('category')
    .optional()
    .isIn(['events', 'tribes', 'social', 'chat', 'reviews', 'system', 'badges', 'marketplace'])
    .withMessage('Categoría inválida'),
  body('channels')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Los canales deben ser un array con máximo 4 elementos'),
  body('channels.*')
    .isIn(['in_app', 'push', 'email', 'sms'])
    .withMessage('Canal inválido'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Fecha de programación inválida'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración inválida')
];

const updateSettingsValidation = [
  body('email')
    .optional()
    .isBoolean()
    .withMessage('email debe ser un valor booleano'),
  body('push')
    .optional()
    .isBoolean()
    .withMessage('push debe ser un valor booleano'),
  body('sms')
    .optional()
    .isBoolean()
    .withMessage('sms debe ser un valor booleano'),
  body('inApp')
    .optional()
    .isBoolean()
    .withMessage('inApp debe ser un valor booleano'),
  body('categories')
    .optional()
    .isObject()
    .withMessage('categories debe ser un objeto'),
  body('categories.events')
    .optional()
    .isBoolean()
    .withMessage('categories.events debe ser un valor booleano'),
  body('categories.tribes')
    .optional()
    .isBoolean()
    .withMessage('categories.tribes debe ser un valor booleano'),
  body('categories.social')
    .optional()
    .isBoolean()
    .withMessage('categories.social debe ser un valor booleano'),
  body('categories.chat')
    .optional()
    .isBoolean()
    .withMessage('categories.chat debe ser un valor booleano'),
  body('categories.system')
    .optional()
    .isBoolean()
    .withMessage('categories.system debe ser un valor booleano')
];

const testNotificationValidation = [
  body('channel')
    .optional()
    .isIn(['in_app', 'push', 'email', 'sms'])
    .withMessage('Canal inválido')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),
  query('status')
    .optional()
    .isIn(['unread', 'read', 'archived', 'all'])
    .withMessage('Estado inválido'),
  query('category')
    .optional()
    .isIn(['events', 'tribes', 'social', 'chat', 'reviews', 'system', 'badges', 'marketplace'])
    .withMessage('Categoría inválida'),
  query('type')
    .optional()
    .isIn([
      'event_invite', 'event_update', 'event_reminder', 'event_cancelled',
      'tribe_invite', 'tribe_update', 'tribe_reminder',
      'social_follow', 'social_like', 'social_comment', 'social_mention',
      'chat_message', 'chat_invite',
      'review_received', 'review_response',
      'system_update', 'system_maintenance', 'system_announcement',
      'badge_earned', 'achievement_unlocked',
      'marketplace_order', 'marketplace_update',
      'test'
    ])
    .withMessage('Tipo inválido'),
  query('sort')
    .optional()
    .isIn(['createdAt', 'priority', 'status'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido')
];

const analyticsQueryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida'),
  query('category')
    .optional()
    .isIn(['events', 'tribes', 'social', 'chat', 'reviews', 'system', 'badges', 'marketplace'])
    .withMessage('Categoría inválida'),
  query('type')
    .optional()
    .isIn([
      'event_invite', 'event_update', 'event_reminder', 'event_cancelled',
      'tribe_invite', 'tribe_update', 'tribe_reminder',
      'social_follow', 'social_like', 'social_comment', 'social_mention',
      'chat_message', 'chat_invite',
      'review_received', 'review_response',
      'system_update', 'system_maintenance', 'system_announcement',
      'badge_earned', 'achievement_unlocked',
      'marketplace_order', 'marketplace_update',
      'test'
    ])
    .withMessage('Tipo inválido')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de notificación inválido')
];

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', queryValidation, notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/:id', paramValidation, notificationController.getNotification);
router.put('/:id/read', paramValidation, notificationController.markNotificationAsRead);
router.put('/read-all', notificationController.markAllNotificationsAsRead);
router.put('/:id/archive', paramValidation, notificationController.archiveNotification);
router.put('/:id/unarchive', paramValidation, notificationController.unarchiveNotification);
router.delete('/:id', paramValidation, notificationController.deleteNotification);

// Settings routes
router.get('/settings', notificationController.getNotificationSettings);
router.put('/settings', updateSettingsValidation, notificationController.updateNotificationSettings);

// Test route
router.post('/test', testNotificationValidation, notificationController.testNotification);

// Admin/System routes (require admin privileges)
router.post('/', adminOnly, createNotificationValidation, notificationController.createNotification);
router.put('/:id', adminOnly, paramValidation, updateNotificationValidation, notificationController.updateNotification);
router.post('/bulk', adminOnly, sendBulkValidation, notificationController.sendBulkNotifications);
router.get('/analytics/overview', adminOnly, analyticsQueryValidation, notificationController.getNotificationAnalytics);

module.exports = router;
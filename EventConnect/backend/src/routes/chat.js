const express = require('express');
const { body, query, param } = require('express-validator');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createPrivateChatValidation = [
  body('otherUserId')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];

const createGroupChatValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('participants')
    .isArray({ min: 1, max: 100 })
    .withMessage('Los participantes deben ser un array con entre 1 y 100 elementos'),
  body('participants.*')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 2, max: 1000 })
    .withMessage('El máximo de participantes debe estar entre 2 y 1000')
];

const sendMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido debe tener entre 1 y 5000 caracteres'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'audio', 'file', 'location', 'event', 'tribe'])
    .withMessage('Tipo de mensaje inválido'),
  body('media')
    .optional()
    .isObject()
    .withMessage('Media debe ser un objeto'),
  body('media.url')
    .optional()
    .isURL()
    .withMessage('URL del archivo inválida'),
  body('media.alt')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El texto alternativo no puede exceder 200 caracteres'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array con 2 elementos [longitud, latitud]'),
  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Las coordenadas deben estar entre -180 y 180'),
  body('replyTo.message')
    .optional()
    .isMongoId()
    .withMessage('ID de mensaje inválido'),
  body('replyTo.content')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El contenido de respuesta no puede exceder 200 caracteres')
];

const editMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido debe tener entre 1 y 5000 caracteres')
];

const addReactionValidation = [
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('El emoji debe tener entre 1 y 10 caracteres')
];

const addParticipantValidation = [
  body('userId')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('role')
    .optional()
    .isIn(['member', 'moderator', 'admin'])
    .withMessage('Rol inválido')
];

const updateSettingsValidation = [
  body('notifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('enabled debe ser un valor booleano'),
  body('notifications.sound')
    .optional()
    .isBoolean()
    .withMessage('sound debe ser un valor booleano'),
  body('notifications.vibration')
    .optional()
    .isBoolean()
    .withMessage('vibration debe ser un valor booleano'),
  body('privacy.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano'),
  body('privacy.allowInvites')
    .optional()
    .isBoolean()
    .withMessage('allowInvites debe ser un valor booleano'),
  body('privacy.allowMedia')
    .optional()
    .isBoolean()
    .withMessage('allowMedia debe ser un valor booleano'),
  body('privacy.allowLinks')
    .optional()
    .isBoolean()
    .withMessage('allowLinks debe ser un valor booleano'),
  body('moderation.slowMode')
    .optional()
    .isBoolean()
    .withMessage('slowMode debe ser un valor booleano'),
  body('moderation.slowModeInterval')
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage('El intervalo del modo lento debe estar entre 0 y 3600 segundos'),
  body('moderation.profanityFilter')
    .optional()
    .isBoolean()
    .withMessage('profanityFilter debe ser un valor booleano'),
  body('moderation.autoModeration')
    .optional()
    .isBoolean()
    .withMessage('autoModeration debe ser un valor booleano')
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
  query('type')
    .optional()
    .isIn(['private', 'group', 'event', 'tribe'])
    .withMessage('Tipo de chat inválido'),
  query('sort')
    .optional()
    .isIn(['lastMessage.timestamp', 'createdAt', 'name'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido')
];

const messageQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),
  query('before')
    .optional()
    .isISO8601()
    .withMessage('Fecha "antes" inválida'),
  query('after')
    .optional()
    .isISO8601()
    .withMessage('Fecha "después" inválida')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de chat inválido'),
  param('messageId')
    .isMongoId()
    .withMessage('ID de mensaje inválido'),
  param('userId')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];

// All routes require authentication
router.use(protect);

// Chat management
router.get('/', queryValidation, chatController.getUserChats);
router.get('/:id', paramValidation, chatController.getChat);

// Chat creation
router.post('/private', createPrivateChatValidation, chatController.createPrivateChat);
router.post('/group', createGroupChatValidation, chatController.createGroupChat);

// Messaging
router.post('/:id/messages', paramValidation, upload.single('media'), sendMessageValidation, chatController.sendMessage);
router.get('/:id/messages', paramValidation, messageQueryValidation, chatController.getChatMessages);
router.put('/:id/messages/:messageId', paramValidation, editMessageValidation, chatController.editMessage);
router.delete('/:id/messages/:messageId', paramValidation, chatController.deleteMessage);

// Message interactions
router.post('/:id/messages/:messageId/reactions', paramValidation, addReactionValidation, chatController.addReaction);
router.post('/:id/messages/:messageId/pin', paramValidation, chatController.togglePinMessage);

// Participant management
router.post('/:id/participants', paramValidation, addParticipantValidation, chatController.addParticipant);
router.delete('/:id/participants/:userId', paramValidation, chatController.removeParticipant);

// Chat actions
router.post('/:id/leave', paramValidation, chatController.leaveChat);

// Settings
router.get('/:id/settings', paramValidation, chatController.getChatSettings);
router.put('/:id/settings', paramValidation, updateSettingsValidation, chatController.updateChatSettings);

module.exports = router;
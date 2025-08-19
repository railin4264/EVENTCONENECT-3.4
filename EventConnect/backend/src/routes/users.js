const express = require('express');
const { body, query, param } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede exceder 500 caracteres'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'prefer-not-to-say'])
    .withMessage('Género inválido'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array con 2 elementos [longitud, latitud]'),
  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Las coordenadas deben estar entre -180 y 180'),
  body('location.address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La calle no puede exceder 200 caracteres'),
  body('location.address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  body('location.address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El estado no puede exceder 100 caracteres'),
  body('location.address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El país no puede exceder 100 caracteres'),
  body('location.address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('El código postal no puede exceder 20 caracteres'),
  body('interests')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Los intereses deben ser un array con máximo 10 elementos'),
  body('interests.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada interés debe tener entre 1 y 50 caracteres'),
  body('socialLinks.facebook')
    .optional()
    .isURL()
    .withMessage('URL de Facebook inválida'),
  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('URL de Twitter inválida'),
  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('URL de Instagram inválida'),
  body('socialLinks.linkedin')
    .optional()
    .isURL()
    .withMessage('URL de LinkedIn inválida'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('URL del sitio web inválida')
];

const updatePreferencesValidation = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('notifications.email debe ser un valor booleano'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('notifications.push debe ser un valor booleano'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('notifications.sms debe ser un valor booleano'),
  body('notifications.inApp')
    .optional()
    .isBoolean()
    .withMessage('notifications.inApp debe ser un valor booleano'),
  body('notifications.categories.events')
    .optional()
    .isBoolean()
    .withMessage('notifications.categories.events debe ser un valor booleano'),
  body('notifications.categories.tribes')
    .optional()
    .isBoolean()
    .withMessage('notifications.categories.tribes debe ser un valor booleano'),
  body('notifications.categories.social')
    .optional()
    .isBoolean()
    .withMessage('notifications.categories.social debe ser un valor booleano'),
  body('notifications.categories.chat')
    .optional()
    .isBoolean()
    .withMessage('notifications.categories.chat debe ser un valor booleano'),
  body('notifications.categories.system')
    .optional()
    .isBoolean()
    .withMessage('notifications.categories.system debe ser un valor booleano'),
  body('privacy.profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Visibilidad de perfil inválida'),
  body('privacy.eventVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Visibilidad de eventos inválida'),
  body('privacy.tribeVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Visibilidad de tribus inválida'),
  body('privacy.chatVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Visibilidad de chat inválida'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Tema inválido'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('El idioma debe tener entre 2 y 5 caracteres'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda debe tener 3 caracteres')
];

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida para eliminar la cuenta')
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
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),
  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),
  query('sort')
    .optional()
    .isIn(['username', 'recent', 'popular', 'relevance'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido')
];

const searchQueryValidation = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),
  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),
  query('sort')
    .optional()
    .isIn(['username', 'recent', 'popular', 'relevance'])
    .withMessage('Ordenamiento inválido')
];

const userQueryValidation = [
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
    .isIn(['all', 'hosted', 'attending'])
    .withMessage('Tipo inválido')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];

// Public routes
router.get('/search', searchQueryValidation, userController.searchUsers);
router.get('/:id', paramValidation, userController.getUserProfile);
router.get('/:id/followers', paramValidation, queryValidation, userController.getUserFollowers);
router.get('/:id/following', paramValidation, queryValidation, userController.getUserFollowing);
router.get('/:id/events', paramValidation, userQueryValidation, userController.getUserEvents);
router.get('/:id/tribes', paramValidation, userQueryValidation, userController.getUserTribes);
router.get('/:id/posts', paramValidation, queryValidation, userController.getUserPosts);
router.get('/:id/badges', paramValidation, userController.getUserBadges);

// Protected routes
router.use(protect);

router.get('/me', userController.getCurrentUser);
router.put('/me', upload.single('avatar'), updateProfileValidation, userController.updateProfile);
router.put('/me/preferences', updatePreferencesValidation, userController.updatePreferences);
router.delete('/me', deleteAccountValidation, userController.deleteAccount);

// Social interactions
router.post('/:id/follow', paramValidation, userController.followUser);
router.delete('/:id/follow', paramValidation, userController.unfollowUser);

module.exports = router;
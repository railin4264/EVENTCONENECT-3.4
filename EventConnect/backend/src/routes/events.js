const express = require('express');
const { body, query, param } = require('express-validator');
const eventController = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),
  body('category')
    .isIn([
      'music', 'sports', 'technology', 'art', 'food', 'travel', 'education',
      'business', 'health', 'fitness', 'gaming', 'reading', 'photography',
      'cooking', 'dancing', 'writing', 'volunteering', 'outdoors', 'fashion',
      'networking', 'workshop', 'conference', 'festival', 'party', 'community',
      'family', 'kids', 'pets', 'charity', 'online', 'other'
    ])
    .withMessage('Categoría inválida'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La subcategoría no puede exceder 100 caracteres'),
  body('dateTime.start')
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  body('dateTime.end')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((end, { req }) => {
      if (end && new Date(end) <= new Date(req.body.dateTime.start)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array con 2 elementos [longitud, latitud]'),
  body('location.coordinates.*')
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
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero mayor a 0'),
  body('price.type')
    .optional()
    .isIn(['free', 'paid'])
    .withMessage('Tipo de precio inválido'),
  body('price.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto no puede ser negativo'),
  body('price.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda debe tener 3 caracteres'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Los tags deben ser un array con máximo 10 elementos'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  body('requirements.minAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad mínima debe estar entre 0 y 120'),
  body('requirements.maxAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad máxima debe estar entre 0 y 120')
    .custom((maxAge, { req }) => {
      if (maxAge && req.body.requirements?.minAge && maxAge < req.body.requirements.minAge) {
        throw new Error('La edad máxima debe ser mayor o igual a la edad mínima');
      }
      return true;
    }),
  body('requirements.gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'any'])
    .withMessage('Género inválido'),
  body('features.isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual debe ser un valor booleano'),
  body('features.isFamilyFriendly')
    .optional()
    .isBoolean()
    .withMessage('isFamilyFriendly debe ser un valor booleano'),
  body('features.isAccessible')
    .optional()
    .isBoolean()
    .withMessage('isAccessible debe ser un valor booleano'),
  body('features.isPetFriendly')
    .optional()
    .isBoolean()
    .withMessage('isPetFriendly debe ser un valor booleano'),
  body('features.hasChat')
    .optional()
    .isBoolean()
    .withMessage('hasChat debe ser un valor booleano'),
  body('virtualDetails.platform')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La plataforma virtual no puede exceder 100 caracteres'),
  body('virtualDetails.link')
    .optional()
    .isURL()
    .withMessage('Link virtual inválido'),
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'friends_only', 'invite_only'])
    .withMessage('Visibilidad inválida')
];

const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),
  body('category')
    .optional()
    .isIn([
      'music', 'sports', 'technology', 'art', 'food', 'travel', 'education',
      'business', 'health', 'fitness', 'gaming', 'reading', 'photography',
      'cooking', 'dancing', 'writing', 'volunteering', 'outdoors', 'fashion',
      'networking', 'workshop', 'conference', 'festival', 'party', 'community',
      'family', 'kids', 'pets', 'charity', 'online', 'other'
    ])
    .withMessage('Categoría inválida'),
  body('dateTime.start')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  body('dateTime.end')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((end, { req }) => {
      if (end && req.body.dateTime?.start && new Date(end) <= new Date(req.body.dateTime.start)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed', 'archived'])
    .withMessage('Estado inválido')
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
    .isIn([
      'music', 'sports', 'technology', 'art', 'food', 'travel', 'education',
      'business', 'health', 'fitness', 'gaming', 'reading', 'photography',
      'cooking', 'dancing', 'writing', 'volunteering', 'outdoors', 'fashion',
      'networking', 'workshop', 'conference', 'festival', 'party', 'community',
      'family', 'kids', 'pets', 'charity', 'online', 'other'
    ])
    .withMessage('Categoría inválida'),
  query('date')
    .optional()
    .isIn(['today', 'tomorrow', 'this-week', 'this-month', 'upcoming', 'past'])
    .withMessage('Filtro de fecha inválido'),
  query('price')
    .optional()
    .isIn(['free', 'paid', 'any'])
    .withMessage('Filtro de precio inválido'),
  query('location')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('La distancia debe estar entre 0 y 1000 km'),
  query('sort')
    .optional()
    .isIn(['date', 'distance', 'popularity', 'price', 'relevance'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de evento inválido')
];

// Public routes
router.get('/', queryValidation, eventController.getEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/trending', eventController.getTrendingEvents);
router.get('/nearby', eventController.getNearbyEvents);
router.get('/search', eventController.searchEvents);
router.get('/categories', eventController.getEventCategories);
router.get('/:id', paramValidation, eventController.getEvent);
router.get('/:id/attendees', paramValidation, eventController.getEventAttendees);

// Protected routes
router.use(protect);

router.post('/', upload.array('images', 10), createEventValidation, eventController.createEvent);
router.put('/:id', paramValidation, upload.array('images', 10), updateEventValidation, eventController.updateEvent);
router.delete('/:id', paramValidation, eventController.deleteEvent);
router.post('/:id/join', paramValidation, eventController.joinEvent);
router.delete('/:id/leave', paramValidation, eventController.leaveEvent);
router.post('/:id/like', paramValidation, eventController.toggleEventLike);
router.post('/:id/share', paramValidation, eventController.shareEvent);
router.post('/:id/save', paramValidation, eventController.toggleEventSave);
router.post('/:id/check-in', paramValidation, eventController.checkInEvent);
router.post('/:id/check-out', paramValidation, eventController.checkOutEvent);

// Host/Admin only routes
router.put('/:id/status', paramValidation, eventController.updateEventStatus);
router.put('/:id/visibility', paramValidation, eventController.updateEventVisibility);
router.post('/:id/cohosts', paramValidation, eventController.addCohost);
router.delete('/:id/cohosts/:cohostId', paramValidation, eventController.removeCohost);
router.put('/:id/attendees/:attendeeId/status', paramValidation, eventController.updateAttendeeStatus);
router.delete('/:id/attendees/:attendeeId', paramValidation, eventController.removeAttendee);

// Analytics routes (Host/Admin only)
router.get('/:id/analytics', paramValidation, eventController.getEventAnalytics);
router.get('/:id/insights', paramValidation, eventController.getEventInsights);

// Recurring events
router.post('/:id/recurring', paramValidation, eventController.createRecurringEvents);
router.get('/:id/recurring', paramValidation, eventController.getRecurringEvents);

// Waitlist management
router.post('/:id/waitlist', paramValidation, eventController.addToWaitlist);
router.delete('/:id/waitlist', paramValidation, eventController.removeFromWaitlist);
router.get('/:id/waitlist', paramValidation, eventController.getWaitlist);

// Event templates
router.post('/templates', eventController.createEventTemplate);
router.get('/templates', eventController.getEventTemplates);
router.get('/templates/:id', eventController.getEventTemplate);
router.put('/templates/:id', eventController.updateEventTemplate);
router.delete('/templates/:id', eventController.deleteEventTemplate);

module.exports = router;
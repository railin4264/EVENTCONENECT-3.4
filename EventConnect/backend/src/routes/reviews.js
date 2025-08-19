const express = require('express');
const { body, query, param } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('host')
    .isMongoId()
    .withMessage('ID de anfitrión inválido'),
  body('event')
    .optional()
    .isMongoId()
    .withMessage('ID de evento inválido'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('El contenido debe tener entre 10 y 2000 caracteres'),
  body('categories')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Las categorías deben ser un array con máximo 5 elementos'),
  body('categories.*')
    .isIn([
      'punctuality', 'communication', 'organization', 'atmosphere',
      'value', 'safety', 'accessibility', 'cleanliness', 'friendliness',
      'knowledge', 'creativity', 'flexibility', 'professionalism'
    ])
    .withMessage('Categoría inválida'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous debe ser un valor booleano')
];

const updateReviewValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('El contenido debe tener entre 10 y 2000 caracteres'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),
  body('categories')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Las categorías deben ser un array con máximo 5 elementos'),
  body('categories.*')
    .isIn([
      'punctuality', 'communication', 'organization', 'atmosphere',
      'value', 'safety', 'accessibility', 'cleanliness', 'friendliness',
      'knowledge', 'creativity', 'flexibility', 'professionalism'
    ])
    .withMessage('Categoría inválida')
];

const reportReviewValidation = [
  body('reason')
    .isIn([
      'inappropriate_content', 'spam', 'fake_review', 'harassment',
      'hate_speech', 'violence', 'copyright_violation', 'other'
    ])
    .withMessage('Razón de reporte inválida'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
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
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),
  query('sort')
    .optional()
    .isIn(['createdAt', 'rating', 'helpful', 'relevance'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de review inválido'),
  param('userId')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  param('eventId')
    .isMongoId()
    .withMessage('ID de evento inválido')
];

// Public routes
router.get('/user/:userId', paramValidation, queryValidation, reviewController.getUserReviews);
router.get('/event/:eventId', paramValidation, queryValidation, reviewController.getEventReviews);
router.get('/stats/overview', reviewController.getReviewStats);
router.get('/:id', paramValidation, reviewController.getReview);

// Protected routes
router.use(protect);

router.post('/', createReviewValidation, reviewController.createReview);
router.put('/:id', paramValidation, updateReviewValidation, reviewController.updateReview);
router.delete('/:id', paramValidation, reviewController.deleteReview);

// User-specific routes
router.get('/my-reviews', queryValidation, reviewController.getMyReviews);

// Social interactions
router.post('/:id/like', paramValidation, reviewController.toggleReviewLike);

// Moderation
router.post('/:id/report', paramValidation, reportReviewValidation, reviewController.reportReview);

module.exports = router;
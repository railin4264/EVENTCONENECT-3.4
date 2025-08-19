const express = require('express');
const { body, query, param } = require('express-validator');
const postController = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('type')
    .isIn(['text', 'image', 'video', 'link', 'event', 'tribe', 'poll', 'article'])
    .withMessage('Tipo de post inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('El contenido debe tener entre 1 y 10000 caracteres'),
  body('media')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Los archivos multimedia deben ser un array con máximo 10 elementos'),
  body('media.*.type')
    .isIn(['image', 'video', 'audio', 'document'])
    .withMessage('Tipo de archivo inválido'),
  body('media.*.url')
    .isURL()
    .withMessage('URL del archivo inválida'),
  body('media.*.alt')
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
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Los tags deben ser un array con máximo 20 elementos'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  body('mentions')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Las menciones deben ser un array con máximo 50 elementos'),
  body('mentions.*')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('relatedEvent')
    .optional()
    .isMongoId()
    .withMessage('ID de evento inválido'),
  body('relatedTribe')
    .optional()
    .isMongoId()
    .withMessage('ID de tribu inválido'),
  body('poll.question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('La pregunta de la encuesta debe tener entre 1 y 200 caracteres'),
  body('poll.options')
    .optional()
    .isArray({ min: 2, max: 10 })
    .withMessage('Las opciones de la encuesta deben ser un array con entre 2 y 10 elementos'),
  body('poll.options.*.text')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cada opción debe tener entre 1 y 100 caracteres'),
  body('poll.isMultipleChoice')
    .optional()
    .isBoolean()
    .withMessage('isMultipleChoice debe ser un valor booleano'),
  body('poll.endsAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin de encuesta inválida'),
  body('link.url')
    .optional()
    .isURL()
    .withMessage('URL del enlace inválida'),
  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'tribe_only', 'private'])
    .withMessage('Visibilidad inválida'),
  body('audience.tribes')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Las tribus de audiencia deben ser un array con máximo 20 elementos'),
  body('audience.tribes.*')
    .isMongoId()
    .withMessage('ID de tribu inválido'),
  body('audience.specificUsers')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Los usuarios específicos deben ser un array con máximo 50 elementos'),
  body('audience.specificUsers.*')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Fecha de programación inválida')
];

const updatePostValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('El contenido debe tener entre 1 y 10000 caracteres'),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Los tags deben ser un array con máximo 20 elementos'),
  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'tribe_only', 'private'])
    .withMessage('Visibilidad inválida')
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
    .isIn(['text', 'image', 'video', 'link', 'event', 'tribe', 'poll', 'article'])
    .withMessage('Tipo de post inválido'),
  query('filter')
    .optional()
    .isIn(['all', 'events', 'tribes', 'following', 'trending', 'nearby'])
    .withMessage('Filtro inválido'),
  query('sort')
    .optional()
    .isIn(['recent', 'popular', 'trending', 'relevance'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido'),
  query('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  query('hashtags')
    .optional()
    .isArray()
    .withMessage('Los hashtags deben ser un array'),
  query('location')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('La distancia debe estar entre 0 y 1000 km')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de post inválido')
];

// Public routes
router.get('/', queryValidation, postController.getPosts);
router.get('/trending', postController.getTrendingPosts);
router.get('/nearby', postController.getNearbyPosts);
router.get('/search', postController.searchPosts);
router.get('/tags', postController.getPopularTags);
router.get('/hashtags', postController.getPopularHashtags);
router.get('/:id', paramValidation, postController.getPost);
router.get('/:id/comments', paramValidation, postController.getPostComments);

// Protected routes
router.use(protect);

router.post('/', upload.array('media', 10), createPostValidation, postController.createPost);
router.put('/:id', paramValidation, upload.array('media', 10), updatePostValidation, postController.updatePost);
router.delete('/:id', paramValidation, postController.deletePost);

// Social interactions
router.post('/:id/like', paramValidation, postController.togglePostLike);
router.post('/:id/share', paramValidation, postController.sharePost);
router.post('/:id/save', paramValidation, postController.togglePostSave);

// Comments
router.post('/:id/comments', paramValidation, postController.addComment);
router.put('/:id/comments/:commentId', paramValidation, postController.updateComment);
router.delete('/:id/comments/:commentId', paramValidation, postController.deleteComment);
router.post('/:id/comments/:commentId/like', paramValidation, postController.toggleCommentLike);

// Replies
router.post('/:id/comments/:commentId/replies', paramValidation, postController.addReply);
router.put('/:id/comments/:commentId/replies/:replyIndex', paramValidation, postController.updateReply);
router.delete('/:id/comments/:commentId/replies/:replyIndex', paramValidation, postController.deleteReply);
router.post('/:id/comments/:commentId/replies/:replyIndex/like', paramValidation, postController.toggleReplyLike);

// Polls
router.post('/:id/polls/vote', paramValidation, postController.voteInPoll);
router.get('/:id/polls/results', paramValidation, postController.getPollResults);

// User-specific routes
router.get('/user/me', postController.getMyPosts);
router.get('/user/saved', postController.getSavedPosts);
router.get('/user/:userId', postController.getUserPosts);

// Moderation
router.post('/:id/report', paramValidation, postController.reportPost);
router.put('/:id/moderate', paramValidation, postController.moderatePost);

// Analytics (Author/Admin only)
router.get('/:id/analytics', paramValidation, postController.getPostAnalytics);

// Scheduled posts
router.get('/scheduled', postController.getScheduledPosts);
router.put('/:id/schedule', paramValidation, postController.schedulePost);
router.put('/:id/unschedule', paramValidation, postController.unschedulePost);

// Post templates
router.post('/templates', postController.createPostTemplate);
router.get('/templates', postController.getPostTemplates);
router.get('/templates/:id', postController.getPostTemplate);
router.put('/templates/:id', postController.updatePostTemplate);
router.delete('/templates/:id', postController.deletePostTemplate);

// Bulk operations
router.post('/bulk/delete', postController.bulkDeletePosts);
router.post('/bulk/moderate', postController.bulkModeratePosts);

module.exports = router;
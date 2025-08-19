const express = require('express');
const { body, query, param } = require('express-validator');
const tribeController = require('../controllers/tribeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createTribeValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),
  body('category')
    .isIn([
      'music', 'sports', 'technology', 'art', 'food', 'travel', 'education',
      'business', 'health', 'fitness', 'gaming', 'reading', 'photography',
      'cooking', 'dancing', 'writing', 'volunteering', 'outdoors', 'fashion',
      'networking', 'professional', 'hobby', 'support', 'local', 'online', 'other'
    ])
    .withMessage('Categoría inválida'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La subcategoría no puede exceder 100 caracteres'),
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
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Los tags deben ser un array con máximo 10 elementos'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  body('rules')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Las reglas deben ser un array con máximo 20 elementos'),
  body('rules.*.title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título de la regla debe tener entre 1 y 100 caracteres'),
  body('rules.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción de la regla no puede exceder 500 caracteres'),
  body('settings.privacy')
    .optional()
    .isIn(['public', 'private', 'secret'])
    .withMessage('Privacidad inválida'),
  body('settings.membership')
    .optional()
    .isIn(['open', 'approval_required', 'invite_only'])
    .withMessage('Tipo de membresía inválido'),
  body('settings.postApproval')
    .optional()
    .isBoolean()
    .withMessage('postApproval debe ser un valor booleano'),
  body('settings.chatEnabled')
    .optional()
    .isBoolean()
    .withMessage('chatEnabled debe ser un valor booleano'),
  body('settings.eventCreation')
    .optional()
    .isIn(['all_members', 'admins_only', 'moderators_and_admins'])
    .withMessage('Permiso de creación de eventos inválido')
];

const updateTribeValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
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
      'networking', 'professional', 'hobby', 'support', 'local', 'online', 'other'
    ])
    .withMessage('Categoría inválida'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'suspended'])
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
      'networking', 'professional', 'hobby', 'support', 'local', 'online', 'other'
    ])
    .withMessage('Categoría inválida'),
  query('privacy')
    .optional()
    .isIn(['public', 'private', 'secret'])
    .withMessage('Privacidad inválida'),
  query('membership')
    .optional()
    .isIn(['open', 'approval_required', 'invite_only'])
    .withMessage('Tipo de membresía inválido'),
  query('location')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('La distancia debe estar entre 0 y 1000 km'),
  query('sort')
    .optional()
    .isIn(['name', 'members', 'created', 'popularity', 'relevance'])
    .withMessage('Ordenamiento inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de tribu inválido')
];

// Public routes
router.get('/', queryValidation, tribeController.getTribes);
router.get('/featured', tribeController.getFeaturedTribes);
router.get('/popular', tribeController.getPopularTribes);
router.get('/nearby', tribeController.getNearbyTribes);
router.get('/search', tribeController.searchTribes);
router.get('/categories', tribeController.getTribeCategories);
router.get('/:id', paramValidation, tribeController.getTribe);
router.get('/:id/members', paramValidation, tribeController.getTribeMembers);
router.get('/:id/events', paramValidation, tribeController.getTribeEvents);
router.get('/:id/discussions', paramValidation, tribeController.getTribeDiscussions);
router.get('/:id/resources', paramValidation, tribeController.getTribeResources);

// Protected routes
router.use(protect);

router.post('/', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), createTribeValidation, tribeController.createTribe);
router.put('/:id', paramValidation, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateTribeValidation, tribeController.updateTribe);
router.delete('/:id', paramValidation, tribeController.deleteTribe);

// Membership routes
router.post('/:id/join', paramValidation, tribeController.joinTribe);
router.delete('/:id/leave', paramValidation, tribeController.leaveTribe);
router.post('/:id/request', paramValidation, tribeController.requestToJoinTribe);
router.put('/:id/requests/:requestId', paramValidation, tribeController.respondToJoinRequest);
router.get('/:id/requests', paramValidation, tribeController.getJoinRequests);

// Social interactions
router.post('/:id/like', paramValidation, tribeController.toggleTribeLike);
router.post('/:id/share', paramValidation, tribeController.shareTribe);
router.post('/:id/save', paramValidation, tribeController.toggleTribeSave);

// Admin/Moderator routes
router.post('/:id/members/:memberId/role', paramValidation, tribeController.updateMemberRole);
router.delete('/:id/members/:memberId', paramValidation, tribeController.removeMember);
router.post('/:id/members/:memberId/ban', paramValidation, tribeController.banMember);
router.post('/:id/members/:memberId/unban', paramValidation, tribeController.unbanMember);
router.post('/:id/members/:memberId/mute', paramValidation, tribeController.muteMember);
router.post('/:id/members/:memberId/unmute', paramValidation, tribeController.unmuteMember);

// Rules management
router.post('/:id/rules', paramValidation, tribeController.addRule);
router.put('/:id/rules/:ruleId', paramValidation, tribeController.updateRule);
router.delete('/:id/rules/:ruleId', paramValidation, tribeController.removeRule);

// Discussions
router.post('/:id/discussions', paramValidation, tribeController.createDiscussion);
router.put('/:id/discussions/:discussionId', paramValidation, tribeController.updateDiscussion);
router.delete('/:id/discussions/:discussionId', paramValidation, tribeController.deleteDiscussion);
router.post('/:id/discussions/:discussionId/comments', paramValidation, tribeController.addDiscussionComment);
router.put('/:id/discussions/:discussionId/comments/:commentId', paramValidation, tribeController.updateDiscussionComment);
router.delete('/:id/discussions/:discussionId/comments/:commentId', paramValidation, tribeController.deleteDiscussionComment);

// Resources
router.post('/:id/resources', paramValidation, upload.array('files', 10), tribeController.addResource);
router.put('/:id/resources/:resourceId', paramValidation, tribeController.updateResource);
router.delete('/:id/resources/:resourceId', paramValidation, tribeController.removeResource);

// Settings
router.put('/:id/settings', paramValidation, tribeController.updateTribeSettings);
router.get('/:id/settings', paramValidation, tribeController.getTribeSettings);

// Analytics (Admin only)
router.get('/:id/analytics', paramValidation, tribeController.getTribeAnalytics);
router.get('/:id/insights', paramValidation, tribeController.getTribeInsights);

// Invitations
router.post('/:id/invite', paramValidation, tribeController.inviteToTribe);
router.get('/:id/invitations', paramValidation, tribeController.getTribeInvitations);
router.put('/:id/invitations/:invitationId', paramValidation, tribeController.respondToInvitation);
router.delete('/:id/invitations/:invitationId', paramValidation, tribeController.cancelInvitation);

// Tribe templates
router.post('/templates', tribeController.createTribeTemplate);
router.get('/templates', tribeController.getTribeTemplates);
router.get('/templates/:id', tribeController.getTribeTemplate);
router.put('/templates/:id', tribeController.updateTribeTemplate);
router.delete('/templates/:id', tribeController.deleteTribeTemplate);

module.exports = router;
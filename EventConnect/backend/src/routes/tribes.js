const express = require('express');

const router = express.Router();
const { tribeController } = require('../controllers');
const {
  protect,
  optionalAuth,
  ownerOrAdmin,
  moderatorOrAdmin,
} = require('../middleware/auth');
const { cache } = require('../middleware/cache');
const { uploadTribeImages } = require('../middleware/upload');
const {
  validateTribeCreation,
  validateTribeUpdate,
  validateSearch,
  validatePagination,
} = require('../middleware/validation');

// Public routes (with optional auth)
router.get(
  '/',
  optionalAuth,
  validatePagination,
  cache(300),
  tribeController.getTribes
);
router.get(
  '/trending',
  optionalAuth,
  cache(180),
  tribeController.getTrendingTribes
);
router.get(
  '/nearby',
  optionalAuth,
  validateSearch,
  cache(180),
  tribeController.getNearbyTribes
);
router.get(
  '/search',
  optionalAuth,
  validateSearch,
  validatePagination,
  cache(180),
  tribeController.searchTribes
);
router.get('/:tribeId', optionalAuth, cache(300), tribeController.getTribeById);

// Protected routes
router.use(protect);

router.post('/', validateTribeCreation, tribeController.createTribe);
router.put(
  '/:tribeId',
  ownerOrAdmin('creator'),
  validateTribeUpdate,
  tribeController.updateTribe
);
router.delete(
  '/:tribeId',
  ownerOrAdmin('creator'),
  tribeController.deleteTribe
);

// Tribe interactions
router.post('/:tribeId/join', tribeController.joinTribe);
router.delete('/:tribeId/leave', tribeController.leaveTribe);
router.post('/:tribeId/request-join', tribeController.requestJoinTribe);
router.post(
  '/:tribeId/join-request/:requestId',
  moderatorOrAdmin,
  tribeController.handleJoinRequest
);

// Tribe management
router.get('/user/tribes', tribeController.getUserTribes);
router.get('/:tribeId/members', tribeController.getTribeMembers);
router.get(
  '/:tribeId/posts',
  validatePagination,
  cache(180),
  tribeController.getTribePosts
);

// Moderator/Admin routes
router.post(
  '/:tribeId/moderators/:userId',
  ownerOrAdmin('creator'),
  tribeController.addModerator
);
router.delete(
  '/:tribeId/moderators/:userId',
  ownerOrAdmin('creator'),
  tribeController.removeModerator
);

// Image management
router.post(
  '/:tribeId/images',
  ownerOrAdmin('creator'),
  uploadTribeImages,
  tribeController.uploadTribeImages
);
router.delete(
  '/:tribeId/images/:imageId',
  ownerOrAdmin('creator'),
  tribeController.deleteTribeImage
);

module.exports = router;

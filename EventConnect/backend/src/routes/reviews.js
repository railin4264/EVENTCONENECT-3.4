const express = require('express');

const router = express.Router();
const { reviewController } = require('../controllers');
const {
  protect,
  optionalAuth,
  ownerOrAdmin,
  adminOnly,
  moderatorOrAdmin,
} = require('../middleware/auth');
const { cache } = require('../middleware/cache');
const {
  validateReviewCreation,
  validateReviewUpdate,
  validateReplyCreation,
  validateReplyUpdate,
  validateSearch,
  validatePagination,
} = require('../middleware/validation');

// Public routes (with optional auth)
router.get(
  '/',
  optionalAuth,
  validatePagination,
  cache(300),
  reviewController.getReviews
);
router.get(
  '/search',
  optionalAuth,
  validateSearch,
  validatePagination,
  cache(180),
  reviewController.searchReviews
);
router.get(
  '/:reviewId',
  optionalAuth,
  cache(300),
  reviewController.getReviewById
);

// Host-specific reviews
router.get(
  '/host/:hostId',
  optionalAuth,
  validatePagination,
  cache(300),
  reviewController.getHostReviews
);
router.get(
  '/event/:eventId',
  optionalAuth,
  validatePagination,
  cache(300),
  reviewController.getEventReviews
);

// Protected routes
router.use(protect);

router.post('/', validateReviewCreation, reviewController.createReview);
router.put(
  '/:reviewId',
  ownerOrAdmin('reviewer'),
  validateReviewUpdate,
  reviewController.updateReview
);
router.delete(
  '/:reviewId',
  ownerOrAdmin('reviewer'),
  reviewController.deleteReview
);

// Review interactions
router.post('/:reviewId/helpful', reviewController.markReviewHelpful);

// Replies
router.post(
  '/:reviewId/replies',
  validateReplyCreation,
  reviewController.addReply
);
router.put(
  '/:reviewId/replies/:replyId',
  ownerOrAdmin('author'),
  validateReplyUpdate,
  reviewController.updateReply
);
router.delete(
  '/:reviewId/replies/:replyId',
  ownerOrAdmin('author'),
  reviewController.deleteReply
);

// User reviews
router.get('/user/reviews', reviewController.getUserReviews);

// Moderation routes (Admin/Moderator only)
router.put(
  '/:reviewId/moderate',
  moderatorOrAdmin,
  reviewController.moderateReview
);
router.put('/:reviewId/verify', adminOnly, reviewController.verifyReview);
router.post('/:reviewId/flag', reviewController.flagReview);

// Admin routes
router.get(
  '/admin/pending',
  adminOnly,
  validatePagination,
  reviewController.getPendingReviews
);

module.exports = router;

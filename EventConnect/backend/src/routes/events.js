const express = require('express');

const router = express.Router();
const { eventController } = require('../controllers');
const { protect, optionalAuth, ownerOrAdmin } = require('../middleware/auth');
const { cache } = require('../middleware/cache');
const { uploadEventImages } = require('../middleware/upload');
const {
  validateEventCreation,
  validateEventUpdate,
  validateSearch,
  validatePagination,
} = require('../middleware/validation');

// Public routes (with optional auth)
router.get(
  '/',
  optionalAuth,
  validatePagination,
  cache(300),
  eventController.getEvents
);
router.get(
  '/trending',
  optionalAuth,
  cache(180),
  eventController.getTrendingEvents
);
router.get(
  '/nearby',
  optionalAuth,
  validateSearch,
  cache(180),
  eventController.getNearbyEvents
);
router.get(
  '/search',
  optionalAuth,
  validateSearch,
  validatePagination,
  cache(180),
  eventController.searchEvents
);
router.get('/:eventId', optionalAuth, cache(300), eventController.getEventById);

// Protected routes
router.use(protect);

router.post('/', validateEventCreation, eventController.createEvent);
router.put(
  '/:eventId',
  ownerOrAdmin('host'),
  validateEventUpdate,
  eventController.updateEvent
);
router.delete('/:eventId', ownerOrAdmin('host'), eventController.deleteEvent);

// Event interactions
router.post('/:eventId/join', eventController.joinEvent);
router.delete('/:eventId/leave', eventController.leaveEvent);
router.post('/:eventId/like', eventController.toggleLike);

// Event management
router.get('/user/events', eventController.getUserEvents);
router.get(
  '/:eventId/stats',
  ownerOrAdmin('host'),
  eventController.getEventStats
);

// Image management
router.post(
  '/:eventId/images',
  ownerOrAdmin('host'),
  uploadEventImages,
  eventController.uploadEventImages
);
router.delete(
  '/:eventId/images/:imageId',
  ownerOrAdmin('host'),
  eventController.deleteEventImage
);

module.exports = router;

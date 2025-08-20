const express = require('express');

const router = express.Router();
const { searchController } = require('../controllers');
const { protect, optionalAuth } = require('../middleware/auth');
const { cache } = require('../middleware/cache');
const {
  validateSearch,
  validatePagination,
} = require('../middleware/validation');

// Public routes (with optional auth)
router.get(
  '/suggestions',
  optionalAuth,
  cache(180),
  searchController.getSearchSuggestions
);
router.get(
  '/trending',
  optionalAuth,
  cache(300),
  searchController.getTrendingSearches
);

// Protected routes
router.use(protect);

// Global search
router.post(
  '/global',
  validateSearch,
  validatePagination,
  cache(180),
  searchController.globalSearch
);

// Search analytics (user-specific)
router.get('/analytics', validateSearch, searchController.getSearchAnalytics);

module.exports = router;

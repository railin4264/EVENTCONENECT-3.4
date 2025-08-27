// ==========================================
// ROUTES INDEX - EVENT CONNECT BACKEND
// ==========================================

const aiRecommendationRoutes = require('./aiRecommendations');
const analyticsRoutes = require('./analytics');
const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const eventRoutes = require('./events');
const gamificationRoutes = require('./gamification');
const locationRoutes = require('./location');
const mockRoutes = require('./mock');
const notificationRoutes = require('./notifications');
const postRoutes = require('./posts');
const reviewRoutes = require('./reviews');
const searchRoutes = require('./search');
const themeRoutes = require('./themes');
const tribeRoutes = require('./tribes');
const userRoutes = require('./users');
const watchlistRoutes = require('./watchlist');

module.exports = {
  authRoutes,
  userRoutes,
  eventRoutes,
  tribeRoutes,
  notificationRoutes,
  themeRoutes,
  aiRecommendationRoutes,
  analyticsRoutes,
  gamificationRoutes,
  chatRoutes,
  locationRoutes,
  mockRoutes,
  postRoutes,
  reviewRoutes,
  searchRoutes,
  watchlistRoutes,
};

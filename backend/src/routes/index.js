const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const eventRoutes = require('./events');
const locationRoutes = require('./location');
const notificationRoutes = require('./notifications');
const postRoutes = require('./posts');
const reviewRoutes = require('./reviews');
const searchRoutes = require('./search');
const tribeRoutes = require('./tribes');
const userRoutes = require('./users');
const watchlistRoutes = require('./watchlist');

// Nuevas rutas para funcionalidades futuras
const recommendationRoutes = require('./recommendations');
const gamificationRoutes = require('./gamification');

module.exports = {
  authRoutes,
  eventRoutes,
  tribeRoutes,
  postRoutes,
  reviewRoutes,
  chatRoutes,
  notificationRoutes,
  searchRoutes,
  userRoutes,
  locationRoutes,
  watchlistRoutes,
  recommendationRoutes,
  gamificationRoutes,
};

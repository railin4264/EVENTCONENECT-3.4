// ==========================================
// ROUTES INDEX - EVENT CONNECT BACKEND
// ==========================================

const aiRecommendationRoutes = require('./aiRecommendations');
const authRoutes = require('./auth');
const eventRoutes = require('./events');
const gamificationRoutes = require('./gamification');
const notificationRoutes = require('./notifications');
const themeRoutes = require('./themes');
const tribeRoutes = require('./tribes');
const userRoutes = require('./users');

module.exports = {
  authRoutes,
  userRoutes,
  eventRoutes,
  tribeRoutes,
  notificationRoutes,
  themeRoutes,
  aiRecommendationRoutes,
  gamificationRoutes,
};

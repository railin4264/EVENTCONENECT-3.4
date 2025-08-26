// ==========================================
// ROUTES INDEX - EVENT CONNECT BACKEND
// ==========================================

const authRoutes = require('./auth');
const userRoutes = require('./users');
const eventRoutes = require('./events');
const tribeRoutes = require('./tribes');
const notificationRoutes = require('./notifications');
const themeRoutes = require('./themes');
const aiRecommendationRoutes = require('./aiRecommendations');
const gamificationRoutes = require('./gamification');

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
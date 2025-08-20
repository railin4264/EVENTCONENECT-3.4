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
};

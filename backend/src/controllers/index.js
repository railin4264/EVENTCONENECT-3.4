const authController = require('./authController');
const chatController = require('./chatController');
const eventController = require('./eventController');
const notificationController = require('./NotificationController');
const postController = require('./postController');
const reviewController = require('./reviewController');
const searchController = require('./searchController');
const tribeController = require('./tribeController');
const userController = require('./userController');
const themeController = require('./themeController');
const aiRecommendationsController = require('./aiRecommendationsController');
const gamificationController = require('./gamificationController');

module.exports = {
  authController,
  eventController,
  tribeController,
  postController,
  reviewController,
  chatController,
  notificationController,
  searchController,
  userController,
  themeController,
  aiRecommendationsController,
  gamificationController,
};

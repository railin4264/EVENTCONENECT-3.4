const authController = require('./authController');
const chatController = require('./chatController');
const eventController = require('./eventController');
const notificationController = require('./NotificationController');
const postController = require('./postController');
const reviewController = require('./reviewController');
const { SearchService } = require('../services');
const tribeController = require('./tribeController');
const userController = require('./userController');

module.exports = {
  authController,
  eventController,
  tribeController,
  postController,
  reviewController,
  chatController,
  notificationController,
  searchController: new SearchService(),
  userController,
};

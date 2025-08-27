const { SearchService } = require('../services');

const authController = require('./authController');
const chatController = require('./chatController');
const eventController = require('./eventController');
const NotificationController = require('./NotificationController');
const postController = require('./postController');
const reviewController = require('./reviewController');
const tribeController = require('./tribeController');
const userController = require('./userController');

module.exports = {
  authController,
  eventController,
  tribeController,
  postController,
  reviewController,
  chatController,
  notificationController: NotificationController,
  searchController: new SearchService(),
  userController,
};

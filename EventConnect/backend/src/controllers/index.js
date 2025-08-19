const authController = require('./authController');
const eventController = require('./eventController');
const tribeController = require('./tribeController');
const postController = require('./postController');
const reviewController = require('./reviewController');
const chatController = require('./chatController');
const notificationController = require('./NotificationController');
const searchController = require('./searchController');
const userController = require('./userController');

module.exports = {
  authController,
  eventController,
  tribeController,
  postController,
  reviewController,
  chatController,
  notificationController: new notificationController(),
  searchController,
  userController
};
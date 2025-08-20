// Import all models
const Chat = require('./Chat');
const Event = require('./Event');
const InAppNotification = require('./InAppNotification');
const Notification = require('./Notification');
const Post = require('./Post');
const Review = require('./Review');
const ScheduledNotification = require('./ScheduledNotification');
const Tribe = require('./Tribe');
const User = require('./User');

// Export all models
module.exports = {
  User,
  Event,
  Tribe,
  Post,
  Chat,
  Notification,
  Review,
  InAppNotification,
  ScheduledNotification,
};

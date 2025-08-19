// Import all models
const User = require('./User');
const Event = require('./Event');
const Tribe = require('./Tribe');
const Post = require('./Post');
const Chat = require('./Chat');
const Notification = require('./Notification');
const Review = require('./Review');
const InAppNotification = require('./InAppNotification');
const ScheduledNotification = require('./ScheduledNotification');

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
  ScheduledNotification
};
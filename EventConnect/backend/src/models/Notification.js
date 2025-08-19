const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El destinatario de la notificación es requerido']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      // Event notifications
      'event_invite', 'event_reminder', 'event_update', 'event_cancelled',
      'event_joined', 'event_left', 'event_full', 'event_starting_soon',
      
      // Tribe notifications
      'tribe_invite', 'tribe_joined', 'tribe_left', 'tribe_role_changed',
      'tribe_event_created', 'tribe_discussion_started',
      
      // Social notifications
      'new_follower', 'new_following', 'post_liked', 'post_commented',
      'post_shared', 'comment_liked', 'comment_replied', 'mention',
      
      // Chat notifications
      'new_message', 'message_reaction', 'chat_invite', 'chat_role_changed',
      
      // Review notifications
      'new_review', 'review_liked', 'review_replied',
      
      // System notifications
      'welcome', 'account_verified', 'password_changed', 'security_alert',
      'maintenance', 'update_available', 'feature_announcement',
      
      // Badge notifications
      'badge_earned', 'level_up', 'achievement_unlocked',
      
      // Marketplace notifications
      'order_placed', 'order_confirmed', 'order_shipped', 'order_delivered',
      'payment_received', 'payment_failed', 'refund_processed'
    ],
    required: [true, 'El tipo de notificación es requerido']
  },
  title: {
    type: String,
    required: [true, 'El título de la notificación es requerido'],
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  message: {
    type: String,
    required: [true, 'El mensaje de la notificación es requerido'],
    maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres']
  },
  data: {
    // Event-related data
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    eventTitle: String,
    eventDate: Date,
    
    // Tribe-related data
    tribe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe'
    },
    tribeName: String,
    
    // Post-related data
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    postContent: String,
    
    // Chat-related data
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },
    messageContent: String,
    
    // User-related data
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userAvatar: String,
    
    // Review-related data
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    rating: Number,
    
    // Badge-related data
    badge: {
      name: String,
      description: String,
      icon: String
    },
    
    // Generic data
    url: String,
    action: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: ['event', 'tribe', 'social', 'chat', 'review', 'system', 'badge', 'marketplace'],
    required: true
  },
  channels: [{
    type: String,
    enum: ['in_app', 'push', 'email', 'sms'],
    default: ['in_app']
  }],
  status: {
    type: String,
    enum: ['unread', 'read', 'archived', 'deleted'],
    default: 'unread'
  },
  readAt: Date,
  archivedAt: Date,
  deletedAt: Date,
  
  // Push notification specific fields
  push: {
    title: String,
    body: String,
    icon: String,
    badge: Number,
    sound: String,
    clickAction: String,
    data: mongoose.Schema.Types.Mixed
  },
  
  // Email notification specific fields
  email: {
    subject: String,
    template: String,
    variables: mongoose.Schema.Types.Mixed,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date
  },
  
  // SMS notification specific fields
  sms: {
    message: String,
    sentAt: Date,
    deliveredAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  },
  
  // Delivery tracking
  delivery: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      failed: { type: Boolean, default: false },
      failureReason: String
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      opened: { type: Boolean, default: false },
      openedAt: Date,
      failed: { type: Boolean, default: false },
      failureReason: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      failed: { type: Boolean, default: false },
      failureReason: String
    }
  },
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Analytics
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    actions: { type: Number, default: 0 },
    timeToRead: Number, // milliseconds
    timeToAction: Number // milliseconds
  },
  
  // Grouping and threading
  groupId: String, // For grouping related notifications
  threadId: String, // For threading notifications
  isGrouped: { type: Boolean, default: false },
  
  // Moderation
  isApproved: { type: Boolean, default: true },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ groupId: 1 });
notificationSchema.index({ threadId: 1 });
notificationSchema.index({ 'data.event': 1 });
notificationSchema.index({ 'data.tribe': 1 });
notificationSchema.index({ 'data.post': 1 });
notificationSchema.index({ 'data.chat': 1 });

// Virtuals
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

notificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledFor && this.scheduledFor > new Date();
});

notificationSchema.virtual('canSend').get(function() {
  return !this.isExpired && (!this.isScheduled || this.scheduledFor <= new Date());
});

notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Methods
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.status = 'unread';
  this.readAt = undefined;
  return this.save();
};

notificationSchema.methods.archive = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

notificationSchema.methods.unarchive = function() {
  this.status = 'read';
  this.archivedAt = undefined;
  return this.save();
};

notificationSchema.methods.softDelete = function() {
  this.status = 'deleted';
  this.deletedAt = new Date();
  return this.save();
};

notificationSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

notificationSchema.methods.updateDeliveryStatus = function(channel, status, additionalData = {}) {
  if (this.delivery[channel]) {
    Object.assign(this.delivery[channel], additionalData);
    
    if (status === 'sent') {
      this.delivery[channel].sent = true;
      this.delivery[channel].sentAt = new Date();
    } else if (status === 'delivered') {
      this.delivery[channel].delivered = true;
      this.delivery[channel].deliveredAt = new Date();
    } else if (status === 'failed') {
      this.delivery[channel].failed = true;
      this.delivery[channel].failureReason = additionalData.reason || 'Unknown error';
    }
  }
  
  return this.save();
};

notificationSchema.methods.trackImpression = function() {
  this.analytics.impressions += 1;
  return this.save();
};

notificationSchema.methods.trackClick = function() {
  this.analytics.clicks += 1;
  return this.save();
};

notificationSchema.methods.trackAction = function() {
  this.analytics.actions += 1;
  return this.save();
};

notificationSchema.methods.trackTimeToRead = function(readTime) {
  this.analytics.timeToRead = readTime;
  return this.save();
};

notificationSchema.methods.trackTimeToAction = function(actionTime) {
  this.analytics.timeToAction = actionTime;
  return this.save();
};

// Static methods
notificationSchema.statics.findByRecipient = function(recipientId, options = {}) {
  const {
    status = 'unread',
    category,
    type,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;
  
  const query = { recipient: recipientId, status };
  
  if (category) query.category = category;
  if (type) query.type = type;
  
  return this.find(query)
    .populate('sender', 'username firstName lastName avatar')
    .populate('data.event', 'title dateTime')
    .populate('data.tribe', 'name')
    .populate('data.post', 'content')
    .populate('data.user', 'username firstName lastName avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

notificationSchema.statics.findUnreadCount = function(recipientId, category = null) {
  const query = { recipient: recipientId, status: 'unread' };
  if (category) query.category = category;
  
  return this.countDocuments(query);
};

notificationSchema.statics.markAllAsRead = function(recipientId, category = null) {
  const query = { recipient: recipientId, status: 'unread' };
  if (category) query.category = category;
  
  return this.updateMany(query, {
    status: 'read',
    readAt: new Date()
  });
};

notificationSchema.statics.findScheduled = function() {
  return this.find({
    scheduledFor: { $lte: new Date() },
    status: 'unread'
  });
};

notificationSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: 'unread'
  });
};

notificationSchema.statics.findByType = function(type, limit = 100) {
  return this.find({ type })
    .populate('recipient', 'username email')
    .populate('sender', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

notificationSchema.statics.findByCategory = function(category, limit = 100) {
  return this.find({ category })
    .populate('recipient', 'username email')
    .populate('sender', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    status: { $in: ['read', 'archived'] }
  });
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set category based on type if not provided
  if (!this.category) {
    if (this.type.startsWith('event_')) {
      this.category = 'event';
    } else if (this.type.startsWith('tribe_')) {
      this.category = 'tribe';
    } else if (this.type.startsWith('post_') || this.type.includes('follower') || this.type.includes('mention')) {
      this.category = 'social';
    } else if (this.type.startsWith('chat_') || this.type.includes('message')) {
      this.category = 'chat';
    } else if (this.type.includes('review')) {
      this.category = 'review';
    } else if (this.type.includes('badge') || this.type.includes('achievement')) {
      this.category = 'badge';
    } else if (this.type.includes('order') || this.type.includes('payment')) {
      this.category = 'marketplace';
    } else {
      this.category = 'system';
    }
  }
  
  // Set default channels if not provided
  if (!this.channels || this.channels.length === 0) {
    this.channels = ['in_app'];
  }
  
  // Set default priority based on type
  if (!this.priority) {
    if (this.type.includes('urgent') || this.type.includes('security')) {
      this.priority = 'urgent';
    } else if (this.type.includes('reminder') || this.type.includes('starting_soon')) {
      this.priority = 'high';
    } else if (this.type.includes('welcome') || this.type.includes('achievement')) {
      this.priority = 'normal';
    } else {
      this.priority = 'low';
    }
  }
  
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
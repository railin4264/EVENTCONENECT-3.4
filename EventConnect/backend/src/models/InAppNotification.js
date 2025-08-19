const mongoose = require('mongoose');

const inAppNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'event_invite',
      'event_reminder',
      'event_update',
      'event_cancelled',
      'tribe_invite',
      'tribe_update',
      'new_message',
      'mention',
      'like',
      'comment',
      'follow',
      'system',
      'security',
      'promotional'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  categoryId: {
    type: String,
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: {
    type: Date
  },
  dismissed: {
    type: Boolean,
    default: false
  },
  dismissedAt: {
    type: Date
  },
  actionTaken: {
    type: String,
    enum: ['viewed', 'joined', 'declined', 'replied', 'shared', 'saved']
  },
  actionTakenAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: true
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  deliveryAttempts: {
    type: Number,
    default: 0
  },
  lastDeliveryAttempt: {
    type: Date
  },
  deliveryError: {
    type: String
  },
  channels: [{
    type: String,
    enum: ['push', 'email', 'sms', 'in_app'],
    default: ['in_app']
  }],
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'event', 'tribe', 'chat', 'automated']
    },
    campaign: String,
    segment: String,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
inAppNotificationSchema.index({ userId: 1, createdAt: -1 });
inAppNotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
inAppNotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
inAppNotificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });
inAppNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
inAppNotificationSchema.index({ scheduledFor: 1, status: 1 });

// Métodos de instancia
inAppNotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

inAppNotificationSchema.methods.markAsClicked = function() {
  this.clicked = true;
  this.clickedAt = new Date();
  return this.save();
};

inAppNotificationSchema.methods.markAsDismissed = function() {
  this.dismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

inAppNotificationSchema.methods.takeAction = function(action) {
  this.actionTaken = action;
  this.actionTakenAt = new Date();
  return this.save();
};

inAppNotificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

inAppNotificationSchema.methods.isScheduled = function() {
  return this.scheduledFor && new Date() < this.scheduledFor;
};

// Métodos estáticos
inAppNotificationSchema.statics.findUnreadByUser = function(userId, limit = 50) {
  return this.find({
    userId,
    read: false,
    status: { $in: ['sent', 'delivered'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

inAppNotificationSchema.statics.findByUserAndType = function(userId, type, limit = 50) {
  return this.find({
    userId,
    type,
    status: { $in: ['sent', 'delivered'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

inAppNotificationSchema.statics.findHighPriorityByUser = function(userId, limit = 20) {
  return this.find({
    userId,
    priority: { $in: ['high', 'urgent'] },
    read: false,
    status: { $in: ['sent', 'delivered'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

inAppNotificationSchema.statics.markAllAsReadByUser = function(userId) {
  return this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
};

inAppNotificationSchema.statics.cleanupOldNotifications = function(userId, daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    userId,
    read: true,
    createdAt: { $lt: cutoffDate }
  });
};

inAppNotificationSchema.statics.getNotificationStats = function(userId, timeRange = '7d') {
  const startDate = new Date();
  switch (timeRange) {
    case '24h':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        read: { $sum: { $cond: ['$read', 1, 0] } },
        unread: { $sum: { $cond: ['$read', 0, 1] } },
        clicked: { $sum: { $cond: ['$clicked', 1, 0] } },
        dismissed: { $sum: { $cond: ['$dismissed', 1, 0] } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Middleware pre-save
inAppNotificationSchema.pre('save', function(next) {
  // Establecer fecha de expiración por defecto (7 días)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  // Validar que la notificación no esté expirada
  if (this.isExpired()) {
    this.status = 'expired';
  }
  
  next();
});

// Virtuals
inAppNotificationSchema.virtual('isUnread').get(function() {
  return !this.read;
});

inAppNotificationSchema.virtual('isHighPriority').get(function() {
  return this.priority === 'high' || this.priority === 'urgent';
});

inAppNotificationSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60));
});

inAppNotificationSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60));
});

inAppNotificationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('InAppNotification', inAppNotificationSchema);
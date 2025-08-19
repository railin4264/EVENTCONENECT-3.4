const mongoose = require('mongoose');

const scheduledNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  notification: {
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
      ]
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
    sound: {
      type: String,
      default: 'default'
    },
    badge: {
      type: Number,
      default: 1
    },
    channels: [{
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      default: ['push', 'in_app']
    }],
    android: {
      channelId: String,
      priority: String,
      sound: String,
      vibrate: [Number],
      icon: String,
      color: String,
      sticky: Boolean
    },
    ios: {
      sound: String,
      badge: Number,
      categoryId: String,
      threadId: String
    }
  },
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled', 'expired'],
    default: 'pending',
    index: true
  },
  executionAttempts: {
    type: Number,
    default: 0
  },
  maxExecutionAttempts: {
    type: Number,
    default: 3
  },
  lastExecutionAttempt: {
    type: Date
  },
  executionError: {
    type: String
  },
  executedAt: {
    type: Date
  },
  result: {
    success: Boolean,
    channels: {
      push: Boolean,
      email: Boolean,
      sms: Boolean,
      in_app: Boolean
    },
    error: String
  },
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    dayOfMonth: Number,
    monthOfYear: Number,
    endDate: Date,
    maxOccurrences: Number,
    currentOccurrence: {
      type: Number,
      default: 0
    }
  },
  conditions: {
    userOnline: {
      type: Boolean,
      default: false
    },
    userActive: {
      type: Boolean,
      default: false
    },
    timeWindow: {
      start: String, // HH:mm format
      end: String    // HH:mm format
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    userPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'event', 'tribe', 'chat', 'automated', 'manual']
    },
    campaign: String,
    segment: String,
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    batchId: String,
    priority: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
scheduledNotificationSchema.index({ scheduledTime: 1, status: 1 });
scheduledNotificationSchema.index({ userId: 1, scheduledTime: 1 });
scheduledNotificationSchema.index({ status: 1, scheduledTime: 1 });
scheduledNotificationSchema.index({ 'recurrence.enabled': 1, scheduledTime: 1 });
scheduledNotificationSchema.index({ batchId: 1 });

// Métodos de instancia
scheduledNotificationSchema.methods.isReadyToExecute = function() {
  return this.status === 'pending' && 
         new Date() >= this.scheduledTime &&
         this.executionAttempts < this.maxExecutionAttempts;
};

scheduledNotificationSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  this.lastExecutionAttempt = new Date();
  this.executionAttempts += 1;
  return this.save();
};

scheduledNotificationSchema.methods.markAsSent = function(result) {
  this.status = 'sent';
  this.executedAt = new Date();
  this.result = result;
  return this.save();
};

scheduledNotificationSchema.methods.markAsFailed = function(error) {
  this.status = this.executionAttempts >= this.maxExecutionAttempts ? 'failed' : 'pending';
  this.lastExecutionAttempt = new Date();
  this.executionError = error;
  return this.save();
};

scheduledNotificationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

scheduledNotificationSchema.methods.expire = function() {
  this.status = 'expired';
  return this.save();
};

scheduledNotificationSchema.methods.calculateNextExecution = function() {
  if (!this.recurrence.enabled) {
    return null;
  }

  const now = new Date();
  let nextTime = new Date(this.scheduledTime);

  switch (this.recurrence.pattern) {
    case 'daily':
      nextTime.setDate(nextTime.getDate() + this.recurrence.interval);
      break;
    
    case 'weekly':
      nextTime.setDate(nextTime.getDate() + (7 * this.recurrence.interval));
      break;
    
    case 'monthly':
      nextTime.setMonth(nextTime.getMonth() + this.recurrence.interval);
      break;
    
    case 'yearly':
      nextTime.setFullYear(nextTime.getFullYear() + this.recurrence.interval);
      break;
    
    case 'custom':
      // Implementar lógica personalizada según daysOfWeek, dayOfMonth, etc.
      if (this.recurrence.daysOfWeek && this.recurrence.daysOfWeek.length > 0) {
        const currentDay = nextTime.getDay();
        const nextDay = this.recurrence.daysOfWeek.find(day => day > currentDay);
        if (nextDay !== undefined) {
          nextTime.setDate(nextTime.getDate() + (nextDay - currentDay));
        } else {
          nextTime.setDate(nextTime.getDate() + (7 - currentDay + this.recurrence.daysOfWeek[0]));
        }
      }
      break;
  }

  // Verificar límites de recurrencia
  if (this.recurrence.endDate && nextTime > this.recurrence.endDate) {
    return null;
  }

  if (this.recurrence.maxOccurrences && 
      this.recurrence.currentOccurrence >= this.recurrence.maxOccurrences) {
    return null;
  }

  return nextTime;
};

scheduledNotificationSchema.methods.shouldExecuteNow = function() {
  if (this.status !== 'pending') {
    return false;
  }

  const now = new Date();
  
  // Verificar si es hora de ejecutar
  if (now < this.scheduledTime) {
    return false;
  }

  // Verificar condiciones de usuario
  if (this.conditions.userOnline && !this.isUserOnline()) {
    return false;
  }

  if (this.conditions.userActive && !this.isUserActive()) {
    return false;
  }

  // Verificar ventana de tiempo
  if (this.conditions.timeWindow) {
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: this.conditions.timezone || 'UTC' 
    });
    
    if (currentTime < this.conditions.timeWindow.start || 
        currentTime > this.conditions.timeWindow.end) {
      return false;
    }
  }

  return true;
};

// Métodos estáticos
scheduledNotificationSchema.statics.findReadyToExecute = function(limit = 100) {
  const now = new Date();
  return this.find({
    status: 'pending',
    scheduledTime: { $lte: now },
    executionAttempts: { $lt: '$maxExecutionAttempts' }
  })
  .sort({ scheduledTime: 1, priority: -1 })
  .limit(limit);
};

scheduledNotificationSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ userId })
  .sort({ scheduledTime: 1 })
  .limit(limit);
};

scheduledNotificationSchema.statics.findPendingByUser = function(userId, limit = 50) {
  return this.find({
    userId,
    status: 'pending'
  })
  .sort({ scheduledTime: 1 })
  .limit(limit);
};

scheduledNotificationSchema.statics.cancelByUser = function(userId) {
  return this.updateMany(
    { userId, status: 'pending' },
    { status: 'cancelled' }
  );
};

scheduledNotificationSchema.statics.cancelByBatch = function(batchId) {
  return this.updateMany(
    { batchId, status: 'pending' },
    { status: 'cancelled' }
  );
};

scheduledNotificationSchema.statics.cleanupExpired = function() {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días
  
  return this.deleteMany({
    $or: [
      { status: 'expired' },
      { status: 'failed' },
      { status: 'cancelled' },
      { scheduledTime: { $lt: cutoffDate } }
    ]
  });
};

// Middleware pre-save
scheduledNotificationSchema.pre('save', function(next) {
  // Validar que la fecha programada esté en el futuro
  if (this.scheduledTime <= new Date()) {
    this.status = 'expired';
  }
  
  // Validar límites de recurrencia
  if (this.recurrence.enabled) {
    if (this.recurrence.endDate && this.scheduledTime > this.recurrence.endDate) {
      this.status = 'expired';
    }
    
    if (this.recurrence.maxOccurrences && 
        this.recurrence.currentOccurrence >= this.recurrence.maxOccurrences) {
      this.status = 'expired';
    }
  }
  
  next();
});

// Virtuals
scheduledNotificationSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.scheduledTime;
});

scheduledNotificationSchema.virtual('timeUntilExecution').get(function() {
  if (this.status !== 'pending') return 0;
  return Math.max(0, this.scheduledTime.getTime() - Date.now());
});

scheduledNotificationSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && 
         this.executionAttempts < this.maxExecutionAttempts;
});

module.exports = mongoose.model('ScheduledNotification', scheduledNotificationSchema);
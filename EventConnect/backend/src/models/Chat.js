const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El remitente del mensaje es requerido'],
    },
    content: {
      type: String,
      required: [true, 'El contenido del mensaje es requerido'],
      maxlength: [5000, 'El mensaje no puede exceder 5000 caracteres'],
    },
    type: {
      type: String,
      enum: [
        'text',
        'image',
        'video',
        'audio',
        'file',
        'location',
        'event',
        'tribe',
      ],
      default: 'text',
    },
    media: {
      url: String,
      alt: String,
      thumbnail: String,
      duration: Number, // for video/audio
      size: Number,
      mimeType: String,
      filename: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    relatedTribe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe',
    },
    replyTo: {
      message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group', 'event', 'tribe'],
      required: [true, 'El tipo de chat es requerido'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'El nombre del chat no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    avatar: {
      url: String,
      alt: String,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['member', 'moderator', 'admin'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastSeen: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
        isBlocked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // For private chats, only 2 participants
    privateChat: {
      user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    // For group chats
    groupChat: {
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      admins: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      moderators: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      inviteCode: String,
      isPublic: { type: Boolean, default: false },
      maxParticipants: { type: Number, default: 100 },
    },
    // For event chats
    eventChat: {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
      },
      isActive: { type: Boolean, default: true },
      autoJoin: { type: Boolean, default: true },
    },
    // For tribe chats
    tribeChat: {
      tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
        required: true,
      },
      isActive: { type: Boolean, default: true },
      autoJoin: { type: Boolean, default: true },
    },
    messages: [messageSchema],
    pinnedMessages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message',
        },
        pinnedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        pinnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      notifications: {
        enabled: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
        vibration: { type: Boolean, default: true },
      },
      privacy: {
        isPublic: { type: Boolean, default: false },
        allowInvites: { type: Boolean, default: true },
        allowMedia: { type: Boolean, default: true },
        allowLinks: { type: Boolean, default: true },
      },
      moderation: {
        slowMode: { type: Boolean, default: false },
        slowModeInterval: { type: Number, default: 0 }, // seconds
        profanityFilter: { type: Boolean, default: false },
        autoModeration: { type: Boolean, default: false },
      },
    },
    stats: {
      totalMessages: { type: Number, default: 0 },
      totalParticipants: { type: Number, default: 0 },
      activeParticipants: { type: Number, default: 0 },
      lastActivity: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted', 'suspended'],
      default: 'active',
    },
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
chatSchema.index({ 'privateChat.user1': 1, 'privateChat.user2': 1 });
chatSchema.index({ 'eventChat.event': 1 });
chatSchema.index({ 'tribeChat.tribe': 1 });

// Virtuals
chatSchema.virtual('participantsCount').get(function () {
  return this.participants.filter(p => p.isActive).length;
});

chatSchema.virtual('unreadCount').get(function () {
  return userId => {
    const participant = this.participants.find(
      p => p.user.toString() === userId.toString()
    );
    if (!participant) return 0;

    const lastSeen = participant.lastSeen || new Date(0);
    return this.messages.filter(
      m =>
        m.createdAt > lastSeen &&
        m.sender.toString() !== userId.toString() &&
        !m.isDeleted
    ).length;
  };
});

chatSchema.virtual('isPrivate').get(function () {
  return this.type === 'private';
});

chatSchema.virtual('isGroup').get(function () {
  return this.type === 'group';
});

chatSchema.virtual('isEventChat').get(function () {
  return this.type === 'event';
});

chatSchema.virtual('isTribeChat').get(function () {
  return this.type === 'tribe';
});

// Methods
chatSchema.methods.addParticipant = function (userId, role = 'member') {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (existingParticipant) {
    existingParticipant.role = role;
    existingParticipant.isActive = true;
    existingParticipant.lastSeen = new Date();
  } else {
    this.participants.push({
      user: userId,
      role,
      isActive: true,
    });
  }

  this.stats.totalParticipants = this.participants.filter(
    p => p.isActive
  ).length;
  this.stats.activeParticipants = this.participants.filter(
    p => p.isActive
  ).length;

  return this.save();
};

chatSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );

  this.stats.totalParticipants = this.participants.filter(
    p => p.isActive
  ).length;
  this.stats.activeParticipants = this.participants.filter(
    p => p.isActive
  ).length;

  return this.save();
};

chatSchema.methods.updateParticipantRole = function (userId, newRole) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.role = newRole;
  }

  return this.save();
};

chatSchema.methods.addMessage = function (
  senderId,
  content,
  type = 'text',
  media = null
) {
  const message = {
    sender: senderId,
    content,
    type,
    media,
    readBy: [
      {
        user: senderId,
        readAt: new Date(),
      },
    ],
  };

  this.messages.push(message);
  this.stats.totalMessages = this.messages.length;
  this.stats.lastActivity = new Date();

  // Update last message
  this.lastMessage = {
    content: content.length > 100 ? `${content.substring(0, 100)}...` : content,
    sender: senderId,
    timestamp: new Date(),
    type,
  };

  // Mark as read for sender
  this.markAsRead(senderId);

  return this.save();
};

chatSchema.methods.markAsRead = function (userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.lastSeen = new Date();

    // Mark all messages as read
    this.messages.forEach(message => {
      if (
        !message.readBy.some(read => read.user.toString() === userId.toString())
      ) {
        message.readBy.push({
          user: userId,
          readAt: new Date(),
        });
      }
    });
  }

  return this.save();
};

chatSchema.methods.markMessageAsRead = function (messageId, userId) {
  const message = this.messages.id(messageId);
  if (
    message &&
    !message.readBy.some(read => read.user.toString() === userId.toString())
  ) {
    message.readBy.push({
      user: userId,
      readAt: new Date(),
    });
  }

  return this.save();
};

chatSchema.methods.editMessage = function (messageId, userId, newContent) {
  const message = this.messages.id(messageId);
  if (message && message.sender.toString() === userId.toString()) {
    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
  }

  return this.save();
};

chatSchema.methods.deleteMessage = function (messageId, userId) {
  const message = this.messages.id(messageId);
  if (message && message.sender.toString() === userId.toString()) {
    message.isDeleted = true;
    message.deletedAt = new Date();
  }

  return this.save();
};

chatSchema.methods.addReaction = function (messageId, userId, emoji) {
  const message = this.messages.id(messageId);
  if (message) {
    const existingReaction = message.reactions.find(
      r => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if same emoji
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        user: userId,
        emoji,
      });
    }
  }

  return this.save();
};

chatSchema.methods.pinMessage = function (messageId, userId) {
  const message = this.messages.id(messageId);
  if (message) {
    const existingPin = this.pinnedMessages.find(
      p => p.message.toString() === messageId.toString()
    );

    if (existingPin) {
      // Unpin message
      this.pinnedMessages = this.pinnedMessages.filter(
        p => p.message.toString() !== messageId.toString()
      );
    } else {
      // Pin message
      this.pinnedMessages.push({
        message: messageId,
        pinnedBy: userId,
      });
    }
  }

  return this.save();
};

chatSchema.methods.muteParticipant = function (userId, mutedBy) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.isMuted = !participant.isMuted;
  }

  return this.save();
};

chatSchema.methods.blockParticipant = function (userId, blockedBy) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.isBlocked = !participant.isBlocked;
  }

  return this.save();
};

// Static methods
chatSchema.statics.findPrivateChat = function (user1Id, user2Id) {
  return this.findOne({
    type: 'private',
    $or: [
      { 'privateChat.user1': user1Id, 'privateChat.user2': user2Id },
      { 'privateChat.user1': user2Id, 'privateChat.user2': user1Id },
    ],
  });
};

chatSchema.statics.findUserChats = function (userId, limit = 20) {
  return this.find({
    'participants.user': userId,
    status: 'active',
  })
    .populate('participants.user', 'username firstName lastName avatar')
    .populate('lastMessage.sender', 'username firstName lastName avatar')
    .sort({ 'lastMessage.timestamp': -1 })
    .limit(limit);
};

chatSchema.statics.findEventChat = function (eventId) {
  return this.findOne({
    type: 'event',
    'eventChat.event': eventId,
    status: 'active',
  });
};

chatSchema.statics.findTribeChat = function (tribeId) {
  return this.findOne({
    type: 'tribe',
    'tribeChat.tribe': tribeId,
    status: 'active',
  });
};

// Pre-save middleware
chatSchema.pre('save', function (next) {
  // Ensure private chats have exactly 2 participants
  if (this.type === 'private' && this.participants.length > 2) {
    return next(
      new Error('Los chats privados solo pueden tener 2 participantes')
    );
  }

  // Update stats
  this.stats.totalParticipants = this.participants.filter(
    p => p.isActive
  ).length;
  this.stats.activeParticipants = this.participants.filter(
    p => p.isActive
  ).length;
  this.stats.totalMessages = this.messages.length;

  next();
});

module.exports = mongoose.model('Chat', chatSchema);

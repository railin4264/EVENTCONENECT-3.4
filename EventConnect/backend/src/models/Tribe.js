const mongoose = require('mongoose');

const tribeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la tribu es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción de la tribu es requerida'],
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  category: {
    type: String,
    required: [true, 'La categoría de la tribu es requerida'],
    enum: [
      'music', 'sports', 'technology', 'art', 'food', 'travel', 'education',
      'business', 'health', 'fitness', 'gaming', 'reading', 'photography',
      'cooking', 'dancing', 'writing', 'volunteering', 'outdoors', 'fashion',
      'networking', 'professional', 'hobby', 'cultural', 'spiritual', 'political',
      'environmental', 'social', 'creative', 'academic', 'entrepreneurial'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'La subcategoría no puede exceder 50 caracteres']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El creador de la tribu es requerido']
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active'
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    isVirtual: {
      type: Boolean,
      default: false
    }
  },
  images: {
    avatar: {
      url: String,
      alt: String
    },
    banner: {
      url: String,
      alt: String
    },
    gallery: [{
      url: String,
      alt: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Cada tag no puede exceder 30 caracteres']
  }],
  rules: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'El título de la regla no puede exceder 100 caracteres']
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'La descripción de la regla no puede exceder 500 caracteres']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  settings: {
    privacy: {
      type: String,
      enum: ['public', 'private', 'secret'],
      default: 'public'
    },
    membership: {
      type: String,
      enum: ['open', 'approval_required', 'invite_only'],
      default: 'open'
    },
    posting: {
      type: String,
      enum: ['all_members', 'moderators_only', 'admins_only'],
      default: 'all_members'
    },
    events: {
      type: String,
      enum: ['all_members', 'moderators_only', 'admins_only'],
      default: 'all_members'
    }
  },
  stats: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalDiscussions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  social: {
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    shares: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      platform: String,
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    views: {
      type: Number,
      default: 0
    }
  },
  features: {
    hasEvents: { type: Boolean, default: true },
    hasDiscussions: { type: Boolean, default: true },
    hasResources: { type: Boolean, default: false },
    hasMarketplace: { type: Boolean, default: false },
    hasNewsletter: { type: Boolean, default: false },
    hasAnalytics: { type: Boolean, default: false }
  },
  resources: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'El título del recurso no puede exceder 200 caracteres']
    },
    description: String,
    type: {
      type: String,
      enum: ['document', 'link', 'video', 'audio', 'image'],
      required: true
    },
    url: String,
    file: {
      filename: String,
      size: Number,
      mimeType: String
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    downloads: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true }
  }],
  discussions: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'El título de la discusión no puede exceder 200 caracteres']
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'El contenido no puede exceder 5000 caracteres']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    views: { type: Number, default: 0 }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  moderation: {
    isApproved: { type: Boolean, default: true },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    lastModeratedAt: Date,
    lastModeratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
tribeSchema.index({ location: '2dsphere' });
tribeSchema.index({ creator: 1 });
tribeSchema.index({ category: 1 });
tribeSchema.index({ status: 1 });
tribeSchema.index({ tags: 1 });
tribeSchema.index({ createdAt: -1 });
tribeSchema.index({ 'members.user': 1 });

// Virtuals
tribeSchema.virtual('membersCount').get(function() {
  return this.members.filter(m => m.status === 'active').length;
});

tribeSchema.virtual('adminsCount').get(function() {
  return this.admins.length + 1; // +1 for creator
});

tribeSchema.virtual('moderatorsCount').get(function() {
  return this.moderators.length;
});

tribeSchema.virtual('likesCount').get(function() {
  return this.social.likes.length;
});

tribeSchema.virtual('sharesCount').get(function() {
  return this.social.shares.length;
});

tribeSchema.virtual('isMember').get(function() {
  return (userId) => this.members.some(m => 
    m.user.toString() === userId.toString() && m.status === 'active'
  );
});

tribeSchema.virtual('isAdmin').get(function() {
  return (userId) => this.creator.toString() === userId.toString() || 
                     this.admins.some(a => a.toString() === userId.toString());
});

tribeSchema.virtual('isModerator').get(function() {
  return (userId) => this.isAdmin(userId) || 
                     this.moderators.some(m => m.toString() === userId.toString());
});

// Methods
tribeSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  
  if (existingMember) {
    existingMember.role = role;
    existingMember.status = 'active';
  } else {
    this.members.push({
      user: userId,
      role,
      status: 'active'
    });
  }
  
  this.stats.totalMembers = this.members.filter(m => m.status === 'active').length;
  return this.save();
};

tribeSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.stats.totalMembers = this.members.filter(m => m.status === 'active').length;
  return this.save();
};

tribeSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.role = newRole;
  }
  return this.save();
};

tribeSchema.methods.addAdmin = function(userId) {
  if (!this.admins.includes(userId)) {
    this.admins.push(userId);
  }
  return this.save();
};

tribeSchema.methods.removeAdmin = function(userId) {
  this.admins = this.admins.filter(a => a.toString() !== userId.toString());
  return this.save();
};

tribeSchema.methods.addModerator = function(userId) {
  if (!this.moderators.includes(userId)) {
    this.moderators.push(userId);
  }
  return this.save();
};

tribeSchema.methods.removeModerator = function(userId) {
  this.moderators = this.moderators.filter(m => m.toString() !== userId.toString());
  return this.save();
};

tribeSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.social.likes.findIndex(l => l.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.social.likes.splice(likeIndex, 1);
  } else {
    this.social.likes.push({ user: userId });
  }
  
  return this.save();
};

tribeSchema.methods.addShare = function(userId, platform) {
  this.social.shares.push({
    user: userId,
    platform,
    sharedAt: new Date()
  });
  
  return this.save();
};

tribeSchema.methods.incrementViews = function() {
  this.social.views += 1;
  return this.save();
};

tribeSchema.methods.addRule = function(title, description) {
  this.rules.push({
    title,
    description,
    isActive: true
  });
  return this.save();
};

tribeSchema.methods.updateRule = function(ruleId, updates) {
  const rule = this.rules.id(ruleId);
  if (rule) {
    Object.assign(rule, updates);
  }
  return this.save();
};

tribeSchema.methods.removeRule = function(ruleId) {
  this.rules = this.rules.filter(r => r._id.toString() !== ruleId.toString());
  return this.save();
};

// Static methods
tribeSchema.statics.findNearby = function(coordinates, maxDistance = 10000, limit = 20) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active',
    'settings.privacy': { $ne: 'secret' }
  })
  .populate('creator', 'username firstName lastName avatar')
  .limit(limit);
};

tribeSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category,
    status: 'active',
    'settings.privacy': { $ne: 'secret' }
  })
  .populate('creator', 'username firstName lastName avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

tribeSchema.statics.findByCreator = function(creatorId, limit = 20) {
  return this.find({
    $or: [
      { creator: creatorId },
      { admins: creatorId },
      { moderators: creatorId }
    ],
    status: 'active'
  })
  .populate('creator', 'username firstName lastName avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

tribeSchema.statics.findPopular = function(limit = 20) {
  return this.find({
    status: 'active',
    'settings.privacy': { $ne: 'secret' }
  })
  .populate('creator', 'username firstName lastName avatar')
  .sort({ 'stats.totalMembers': -1, 'social.likes': -1 })
  .limit(limit);
};

// Pre-save middleware
tribeSchema.pre('save', function(next) {
  // Ensure creator is in admins list
  if (this.creator && !this.admins.includes(this.creator)) {
    this.admins.push(this.creator);
  }
  
  // Update stats
  this.stats.totalMembers = this.members.filter(m => m.status === 'active').length;
  this.stats.activeMembers = this.members.filter(m => m.status === 'active').length;
  
  next();
});

module.exports = mongoose.model('Tribe', tribeSchema);
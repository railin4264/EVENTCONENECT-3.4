const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El revisor es requerido'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'El evento es requerido'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El anfitrión es requerido'],
    },
    rating: {
      type: Number,
      required: [true, 'La calificación es requerida'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
    },
    comment: {
      type: String,
      required: [true, 'El comentario es requerido'],
      trim: true,
      minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
      maxlength: [1000, 'El comentario no puede exceder 1000 caracteres'],
    },
    categories: [
      {
        category: {
          type: String,
          enum: [
            'organization',
            'communication',
            'punctuality',
            'venue',
            'content',
            'atmosphere',
            'value',
            'accessibility',
            'safety',
            'overall',
          ],
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, 'Cada tag no puede exceder 30 caracteres'],
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ['attendance', 'photo', 'checkin', 'manual'],
      default: 'attendance',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    helpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        helpfulAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notHelpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notHelpfulAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replies: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, 'La respuesta no puede exceder 500 caracteres'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isOfficial: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'pending',
    },
    moderation: {
      moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      moderatedAt: Date,
      moderationReason: String,
      moderationNotes: String,
    },
    flags: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          enum: [
            'inappropriate',
            'spam',
            'fake',
            'harassment',
            'offensive',
            'irrelevant',
            'duplicate',
            'other',
          ],
          required: true,
        },
        description: String,
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
          default: 'pending',
        },
      },
    ],
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      helpfulScore: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ event: 1 });
reviewSchema.index({ host: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ 'categories.category': 1, 'categories.rating': 1 });

// Virtuals
reviewSchema.virtual('helpfulCount').get(function () {
  return this.helpful.length;
});

reviewSchema.virtual('notHelpfulCount').get(function () {
  return this.notHelpful.length;
});

reviewSchema.virtual('repliesCount').get(function () {
  return this.replies.length;
});

reviewSchema.virtual('flagsCount').get(function () {
  return this.flags.length;
});

reviewSchema.virtual('averageCategoryRating').get(function () {
  if (!this.categories || this.categories.length === 0) {
    return this.rating;
  }

  const totalRating = this.categories.reduce((sum, cat) => sum + cat.rating, 0);
  return totalRating / this.categories.length;
});

reviewSchema.virtual('isHelpful').get(function () {
  return userId =>
    this.helpful.some(h => h.user.toString() === userId.toString());
});

reviewSchema.virtual('isNotHelpful').get(function () {
  return userId =>
    this.notHelpful.some(h => h.user.toString() === userId.toString());
});

reviewSchema.virtual('isFlagged').get(function () {
  return userId =>
    this.flags.some(f => f.user.toString() === userId.toString());
});

// Methods
reviewSchema.methods.markHelpful = async function (userId) {
  // Remove from not helpful if present
  this.notHelpful = this.notHelpful.filter(
    h => h.user.toString() !== userId.toString()
  );

  // Add to helpful if not present
  if (!this.helpful.some(h => h.user.toString() === userId.toString())) {
    this.helpful.push({ user: userId });
  }

  // Update helpful score
  this.analytics.helpfulScore = this.helpful.length - this.notHelpful.length;

  return this.save();
};

reviewSchema.methods.markNotHelpful = async function (userId) {
  // Remove from helpful if present
  this.helpful = this.helpful.filter(
    h => h.user.toString() !== userId.toString()
  );

  // Add to not helpful if not present
  if (!this.notHelpful.some(h => h.user.toString() === userId.toString())) {
    this.notHelpful.push({ user: userId });
  }

  // Update helpful score
  this.analytics.helpfulScore = this.helpful.length - this.notHelpful.length;

  return this.save();
};

reviewSchema.methods.addReply = async function (
  authorId,
  content,
  isOfficial = false
) {
  this.replies.push({
    author: authorId,
    content,
    isOfficial,
  });

  return this.save();
};

reviewSchema.methods.flagReview = async function (
  userId,
  reason,
  description = ''
) {
  // Check if user already flagged
  if (this.flags.some(f => f.user.toString() === userId.toString())) {
    throw new Error('Ya has reportado esta reseña');
  }

  this.flags.push({
    user: userId,
    reason,
    description,
  });

  return this.save();
};

reviewSchema.methods.verifyReview = async function (
  verifiedBy,
  method = 'manual'
) {
  this.isVerified = true;
  this.verificationMethod = method;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();

  return this.save();
};

reviewSchema.methods.moderateReview = async function (
  moderatedBy,
  status,
  reason = '',
  notes = ''
) {
  this.status = status;
  this.moderation.moderatedBy = moderatedBy;
  this.moderation.moderatedAt = new Date();
  this.moderation.moderationReason = reason;
  this.moderation.moderationNotes = notes;

  return this.save();
};

reviewSchema.methods.incrementViews = async function () {
  this.analytics.views += 1;
  return this.save();
};

// Static methods
reviewSchema.statics.findByEvent = function (eventId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    status = 'approved',
  } = options;
  const skip = (page - 1) * limit;

  const query = { event: eventId, status };
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('reviewer', 'username firstName lastName avatar')
    .populate('replies.author', 'username firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.findByHost = function (hostId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    status = 'approved',
  } = options;
  const skip = (page - 1) * limit;

  const query = { host: hostId, status };
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('reviewer', 'username firstName lastName avatar')
    .populate('event', 'title category')
    .populate('replies.author', 'username firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.findByReviewer = function (reviewerId, options = {}) {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = options;
  const skip = (page - 1) * limit;

  const query = { reviewer: reviewerId };
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('event', 'title category')
    .populate('host', 'username firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.findVerified = function (options = {}) {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = options;
  const skip = (page - 1) * limit;

  const query = { isVerified: true, status: 'approved' };
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('reviewer', 'username firstName lastName avatar')
    .populate('event', 'title category')
    .populate('host', 'username firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.findByRating = function (rating, options = {}) {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = options;
  const skip = (page - 1) * limit;

  const query = { rating, status: 'approved' };
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('reviewer', 'username firstName lastName avatar')
    .populate('event', 'title category')
    .populate('host', 'username firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.findByCategory = function (category, options = {}) {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = options;
  const skip = (page - 1) * limit;

  const query = {
    'categories.category': category,
    status: 'approved',
    'categories.rating': { $gte: 4 }, // Only positive reviews for category
  };
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('reviewer', 'username firstName lastName avatar')
    .populate('event', 'title category')
    .populate('host', 'username firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getHostStats = async function (hostId) {
  const stats = await this.aggregate([
    { $match: { host: mongoose.Types.ObjectId(hostId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating',
        },
        categoryRatings: {
          $push: '$categories',
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {},
    };
  }

  const stat = stats[0];
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  stat.ratingDistribution.forEach(rating => {
    ratingDistribution[rating]++;
  });

  // Calculate category averages
  const categoryRatings = {};
  stat.categoryRatings.forEach(categories => {
    categories.forEach(cat => {
      if (!categoryRatings[cat.category]) {
        categoryRatings[cat.category] = { total: 0, count: 0 };
      }
      categoryRatings[cat.category].total += cat.rating;
      categoryRatings[cat.category].count += 1;
    });
  });

  const categoryAverages = {};
  Object.keys(categoryRatings).forEach(category => {
    categoryAverages[category] =
      categoryRatings[category].total / categoryRatings[category].count;
  });

  return {
    totalReviews: stat.totalReviews,
    averageRating: Math.round(stat.averageRating * 10) / 10,
    ratingDistribution,
    categoryAverages,
  };
};

reviewSchema.statics.getEventStats = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating',
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const stat = stats[0];
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  stat.ratingDistribution.forEach(rating => {
    ratingDistribution[rating]++;
  });

  return {
    totalReviews: stat.totalReviews,
    averageRating: Math.round(stat.averageRating * 10) / 10,
    ratingDistribution,
  };
};

// Pre-save middleware
reviewSchema.pre('save', function (next) {
  // Update helpful score
  if (this.isModified('helpful') || this.isModified('notHelpful')) {
    this.analytics.helpfulScore = this.helpful.length - this.notHelpful.length;
  }

  // Set status to approved if verified
  if (this.isVerified && this.status === 'pending') {
    this.status = 'approved';
  }

  next();
});

// Pre-remove middleware
reviewSchema.pre('remove', async function (next) {
  try {
    // Update event average rating
    const Event = require('./Event');
    await Event.findByIdAndUpdate(this.event, {
      $pull: { reviews: this._id },
    });

    // Recalculate event average rating
    const eventStats = await this.constructor.getEventStats(this.event);
    await Event.findByIdAndUpdate(this.event, {
      averageRating: eventStats.averageRating,
      totalReviews: eventStats.totalReviews,
    });

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

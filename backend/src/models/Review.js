const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Información básica
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Tipo de reseña
    reviewType: {
      type: String,
      enum: ['event', 'organizer', 'venue', 'user'],
      required: true,
    },

    // Referencias según el tipo
    targetEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: function () {
        return this.reviewType === 'event';
      },
    },

    targetOrganizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.reviewType === 'organizer';
      },
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.reviewType === 'user';
      },
    },

    targetVenue: {
      type: String,
      required: function () {
        return this.reviewType === 'venue';
      },
    },

    // Calificaciones específicas
    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      // Para eventos
      organization: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.reviewType === 'event';
        },
      },

      contentQuality: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.reviewType === 'event';
        },
      },

      venue: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.reviewType === 'event';
        },
      },

      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
      required() { return this.reviewType === 'event'; }
    },
      },

      // Para organizadores
      communication: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.reviewType === 'organizer';
        },
      },

      reliability: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.reviewType === 'organizer';
        },
      },

      eventQuality: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.reviewType === 'organizer';
        },
      },
    },

    // Contenido de la reseña
    content: {
      title: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true,
      },

      description: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true,
      },

      pros: [
        {
          type: String,
          maxlength: 200,
        },
      ],

      cons: [
        {
          type: String,
          maxlength: 200,
        },
      ],

      recommendations: {
        type: String,
        maxlength: 500,
      },
    },

    // Información adicional
    attendedDate: {
      type: Date,
      required: function () {
        return this.reviewType === 'event';
      },
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verificationMethod: {
      type: String,
      enum: [
        'attendance_confirmed',
        'manual_verification',
        'photo_proof',
        'automated',
      ],
      required: function () {
        return this.verified;
      },
    },

    // Interacciones sociales
    helpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reported: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          enum: ['spam', 'fake', 'inappropriate', 'offensive', 'other'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Estado de moderación
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending',
      },

      moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      moderatedAt: Date,

      reason: String,

      autoModerated: {
        type: Boolean,
        default: false,
      },
    },

    // Analytics
    analytics: {
      views: {
        type: Number,
        default: 0,
      },

      helpfulCount: {
        type: Number,
        default: 0,
      },

      reportsCount: {
        type: Number,
        default: 0,
      },

      engagementScore: {
        type: Number,
        default: 0,
      },
    },

    // Metadatos
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    language: {
      type: String,
      default: 'es',
    },

    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web',
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES =====
reviewSchema.index({ targetEvent: 1, createdAt: -1 });
reviewSchema.index({ targetOrganizer: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ reviewType: 1, 'ratings.overall': -1 });
reviewSchema.index({ 'moderation.status': 1, createdAt: -1 });
reviewSchema.index({ verified: 1, 'ratings.overall': -1 });

// ===== VIRTUAL PROPERTIES =====
reviewSchema.virtual('helpfulPercentage').get(function () {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.helpfulCount / this.analytics.views) * 100;
});

reviewSchema.virtual('isRecent').get(function () {
  const daysSinceCreation =
    (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 30;
});

reviewSchema.virtual('averageRating').get(function () {
  const ratings = Object.values(this.ratings).filter(
    rating => typeof rating === 'number'
  );
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// ===== METHODS =====
reviewSchema.methods.markAsHelpful = function (userId) {
  const existingHelpful = this.helpful.find(
    h => h.user.toString() === userId.toString()
  );

  if (existingHelpful) {
    // Remove helpful mark
    this.helpful = this.helpful.filter(
      h => h.user.toString() !== userId.toString()
    );
    this.analytics.helpfulCount = Math.max(0, this.analytics.helpfulCount - 1);
    return { action: 'removed', helpful: false };
  } else {
    // Add helpful mark
    this.helpful.push({ user: userId });
    this.analytics.helpfulCount += 1;
    return { action: 'added', helpful: true };
  }
};

reviewSchema.methods.reportReview = function (userId, reason) {
  const existingReport = this.reported.find(
    r => r.user.toString() === userId.toString()
  );

  if (existingReport) {
    return { success: false, message: 'Ya has reportado esta reseña' };
  }

  this.reported.push({ user: userId, reason });
  this.analytics.reportsCount += 1;

  // Auto-flag if too many reports
  if (this.analytics.reportsCount >= 3) {
    this.moderation.status = 'flagged';
    this.moderation.autoModerated = true;
  }

  return { success: true, message: 'Reseña reportada exitosamente' };
};

reviewSchema.methods.calculateEngagementScore = function () {
  const helpfulWeight = 3;
  const viewWeight = 1;
  const recentnessWeight = 2;

  let score = 0;
  score += this.analytics.helpfulCount * helpfulWeight;
  score += this.analytics.views * viewWeight;

  // Bonus for recent reviews
  const daysSinceCreation =
    (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 7) {
    score += 10 * recentnessWeight;
  } else if (daysSinceCreation <= 30) {
    score += 5 * recentnessWeight;
  }

  // Penalty for reported reviews
  score -= this.analytics.reportsCount * 5;

  return Math.max(0, score);
};

// ===== STATICS =====
reviewSchema.statics.getAverageRating = async function (targetId, reviewType) {
  const query = {};
  query[`target${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}`] =
    targetId;
  query['moderation.status'] = 'approved';

  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        averageOverall: { $avg: '$ratings.overall' },
        count: { $sum: 1 },
        ratings: { $push: '$ratings' },
      },
    },
  ]);

  if (result.length === 0) {
    return { average: 0, count: 0, breakdown: {} };
  }

  const data = result[0];

  // Calculate breakdown for each rating type
  const breakdown = {};
  if (data.ratings.length > 0) {
    const firstRating = data.ratings[0];
    for (const key in firstRating) {
      if (typeof firstRating[key] === 'number') {
        const values = data.ratings
          .map(r => r[key])
          .filter(v => v !== undefined);
        breakdown[key] =
          values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }
  }

  return {
    average: Math.round(data.averageOverall * 10) / 10,
    count: data.count,
    breakdown,
  };
};

reviewSchema.statics.getRatingDistribution = async function (
  targetId,
  reviewType
) {
  const query = {};
  query[`target${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}`] =
    targetId;
  query['moderation.status'] = 'approved';

  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$ratings.overall',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.forEach(item => {
    distribution[item._id] = item.count;
  });

  return distribution;
};

reviewSchema.statics.canUserReview = async function (
  userId,
  targetId,
  reviewType
) {
  // Check if user already reviewed
  const query = {
    reviewer: userId,
    reviewType
  };
  query[`target${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}`] =
    targetId;

  const existingReview = await this.findOne(query);
  if (existingReview) {
    return { canReview: false, reason: 'Ya has reseñado este elemento' };
  }

  // Additional checks based on review type
  if (reviewType === 'event') {
    const Event = mongoose.model('Event');
    const event = await Event.findById(targetId);

    if (!event) {
      return { canReview: false, reason: 'Evento no encontrado' };
    }

    // Check if user attended the event
    const attended = event.attendees.some(
      a => a.userId.toString() === userId.toString() && a.status === 'confirmed'
    );

    if (!attended) {
      return {
        canReview: false,
        reason: 'Solo puedes reseñar eventos a los que asististe',
      };
    }

    // Check if event has already happened
    if (event.endDate > new Date()) {
      return {
        canReview: false,
        reason: 'Solo puedes reseñar eventos que ya hayan terminado',
      };
    }
  }

  return { canReview: true };
};

// ===== PRE-SAVE HOOKS =====
reviewSchema.pre('save', function (next) {
  // Calculate engagement score
  this.analytics.engagementScore = this.calculateEngagementScore();

  // Auto-approve reviews from verified users with good reputation
  if (this.isNew && this.moderation.status === 'pending') {
    // Auto-approve logic here
    // For now, keeping manual approval
  }

  next();
});

// ===== POST-SAVE HOOKS =====
reviewSchema.post('save', async (doc) => {
  // Update target's rating cache
  try {
    const Model = doc.constructor;
    const ratingData = await Model.getAverageRating(
      doc[
        `target${doc.reviewType.charAt(0).toUpperCase() + doc.reviewType.slice(1)}`
      ],
      doc.reviewType
    );

    // Update the target model's rating
    if (doc.reviewType === 'event') {
      const Event = mongoose.model('Event');
      await Event.findByIdAndUpdate(doc.targetEvent, {
        'stats.averageRating': ratingData.average,
        'stats.reviewCount': ratingData.count,
      });
    } else if (doc.reviewType === 'organizer' || doc.reviewType === 'user') {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(doc.targetOrganizer || doc.targetUser, {
        'stats.averageRating': ratingData.average,
        'stats.reviewCount': ratingData.count,
      });
    }
  } catch (error) {
    console.error('Error updating rating cache:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

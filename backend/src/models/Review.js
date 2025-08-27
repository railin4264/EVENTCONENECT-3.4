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
        required: function () {
          return this.reviewType === 'event';
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
      moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      moderatedAt: {
        type: Date,
      },
      moderationNotes: {
        type: String,
        maxlength: 500,
      },
    },

    // Metadatos
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    // Estadísticas
    viewCount: {
      type: Number,
      default: 0,
    },

    shareCount: {
      type: Number,
      default: 0,
    },

    // Tags para búsqueda
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Configuración de privacidad
    isPublic: {
      type: Boolean,
      default: true,
    },

    allowComments: {
      type: Boolean,
      default: true,
    },

    // Información de ubicación
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
    },

    // Configuración de notificaciones
    notifyOnHelpful: {
      type: Boolean,
      default: true,
    },

    notifyOnComments: {
      type: Boolean,
      default: true,
    },

    // Información de SEO
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        maxlength: 160,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // Configuración de monetización
    monetization: {
      isSponsored: {
        type: Boolean,
        default: false,
      },
      sponsorInfo: {
        sponsorName: String,
        sponsorLogo: String,
        sponsorshipType: {
          type: String,
          enum: ['paid', 'gifted', 'affiliate', 'partnership'],
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ reviewType: 1, targetEvent: 1 });
reviewSchema.index({ reviewType: 1, targetOrganizer: 1 });
reviewSchema.index({ reviewType: 1, targetUser: 1 });
reviewSchema.index({ 'ratings.overall': -1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ 'moderation.status': 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ tags: 1 });
reviewSchema.index({ 'location.coordinates': '2dsphere' });

// Virtuals
reviewSchema.virtual('helpfulCount').get(function () {
  return this.helpful ? this.helpful.length : 0;
});

reviewSchema.virtual('reportedCount').get(function () {
  return this.reported ? this.reported.length : 0;
});

reviewSchema.virtual('averageRating').get(function () {
  if (!this.ratings) return 0;
  
  const ratings = Object.values(this.ratings).filter(rating => 
    typeof rating === 'number' && rating > 0
  );
  
  if (ratings.length === 0) return 0;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

reviewSchema.virtual('isVerified').get(function () {
  return this.verified === true;
});

reviewSchema.virtual('isModerated').get(function () {
  return this.moderation && this.moderation.status !== 'pending';
});

// Middleware
reviewSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

reviewSchema.pre('save', function (next) {
  // Auto-generar tags basados en el contenido
  if (this.isModified('content.title') || this.isModified('content.description')) {
    const text = `${this.content.title} ${this.content.description}`.toLowerCase();
    const commonTags = ['evento', 'organizador', 'lugar', 'experiencia', 'recomendado'];
    
    this.tags = commonTags.filter(tag => text.includes(tag));
  }
  next();
});

// Métodos estáticos
reviewSchema.statics.findByType = function (type, limit = 10) {
  return this.find({ reviewType: type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reviewer', 'name avatar')
    .populate('targetEvent', 'title image')
    .populate('targetOrganizer', 'name avatar');
};

reviewSchema.statics.findVerified = function () {
  return this.find({ verified: true })
    .sort({ createdAt: -1 })
    .populate('reviewer', 'name avatar');
};

reviewSchema.statics.findByRating = function (minRating = 4) {
  return this.find({ 'ratings.overall': { $gte: minRating } })
    .sort({ 'ratings.overall': -1 })
    .populate('reviewer', 'name avatar');
};

// Métodos de instancia
reviewSchema.methods.addHelpful = function (userId) {
  if (!this.helpful.some(h => h.user.toString() === userId.toString())) {
    this.helpful.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

reviewSchema.methods.removeHelpful = function (userId) {
  this.helpful = this.helpful.filter(h => h.user.toString() !== userId.toString());
  return this.save();
};

reviewSchema.methods.report = function (userId, reason) {
  if (!this.reported.some(r => r.user.toString() === userId.toString())) {
    this.reported.push({ user: userId, reason });
    return this.save();
  }
  return Promise.resolve(this);
};

reviewSchema.methods.moderate = function (status, moderatorId, notes = '') {
  this.moderation = {
    status,
    moderator: moderatorId,
    moderatedAt: new Date(),
    moderationNotes: notes,
  };
  return this.save();
};

reviewSchema.methods.verify = function (method = 'manual_verification') {
  this.verified = true;
  this.verificationMethod = method;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);

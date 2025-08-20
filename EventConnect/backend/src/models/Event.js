const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del evento es requerido'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción del evento es requerida'],
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    category: {
      type: String,
      required: [true, 'La categoría del evento es requerida'],
      enum: [
        'music',
        'sports',
        'technology',
        'art',
        'food',
        'travel',
        'education',
        'business',
        'health',
        'fitness',
        'gaming',
        'reading',
        'photography',
        'cooking',
        'dancing',
        'writing',
        'volunteering',
        'outdoors',
        'fashion',
        'networking',
        'workshop',
        'conference',
        'party',
        'meetup',
        'concert',
        'festival',
        'exhibition',
        'seminar',
        'webinar',
        'competition',
        'charity',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: [50, 'La subcategoría no puede exceder 50 caracteres'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El anfitrión del evento es requerido'],
    },
    cohosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Las coordenadas del evento son requeridas'],
        validate: {
          validator(v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: 'Coordenadas inválidas',
        },
      },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: String,
      },
      venue: {
        name: String,
        description: String,
        capacity: Number,
        amenities: [String],
      },
    },
    dateTime: {
      start: {
        type: Date,
        required: [true, 'La fecha y hora de inicio es requerida'],
      },
      end: {
        type: Date,
        required: [true, 'La fecha y hora de fin es requerida'],
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'La capacidad del evento es requerida'],
      min: [1, 'La capacidad debe ser al menos 1'],
      max: [10000, 'La capacidad no puede exceder 10000'],
    },
    currentAttendees: {
      type: Number,
      default: 0,
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['confirmed', 'pending', 'declined', 'maybe'],
          default: 'pending',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        rsvpDate: Date,
      },
    ],
    waitlist: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    price: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'El precio no puede ser negativo'],
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'MXN', 'ARS', 'CLP', 'COP', 'PEN'],
      },
      type: {
        type: String,
        enum: ['free', 'paid', 'donation', 'membership'],
        default: 'free',
      },
      earlyBird: {
        amount: Number,
        validUntil: Date,
      },
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, 'Cada tag no puede exceder 30 caracteres'],
      },
    ],
    requirements: {
      age: {
        min: { type: Number, min: 0 },
        max: { type: Number, max: 120 },
      },
      skills: [String],
      equipment: [String],
      dressCode: String,
    },
    features: {
      isVirtual: { type: Boolean, default: false },
      isHybrid: { type: Boolean, default: false },
      hasLivestream: { type: Boolean, default: false },
      hasRecording: { type: Boolean, default: false },
      isRecurring: { type: Boolean, default: false },
      isPrivate: { type: Boolean, default: false },
      requiresApproval: { type: Boolean, default: false },
    },
    virtualDetails: {
      platform: String,
      meetingLink: String,
      meetingId: String,
      password: String,
      instructions: String,
    },
    recurring: {
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      },
      interval: Number,
      endDate: Date,
      exceptions: [Date],
    },
    social: {
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      shares: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          platform: String,
          sharedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      views: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'tribe_only', 'invite_only'],
      default: 'public',
    },
    moderation: {
      isApproved: { type: Boolean, default: false },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      rejectionReason: String,
    },
    analytics: {
      totalRegistrations: { type: Number, default: 0 },
      totalCheckins: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
eventSchema.index({ location: '2dsphere' });
eventSchema.index({ host: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'dateTime.start': 1 });
eventSchema.index({ 'dateTime.end': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdAt: -1 });

// Virtuals
eventSchema.virtual('isFull').get(function () {
  return this.currentAttendees >= this.capacity;
});

eventSchema.virtual('availableSpots').get(function () {
  return Math.max(0, this.capacity - this.currentAttendees);
});

eventSchema.virtual('isUpcoming').get(function () {
  return this.dateTime.start > new Date();
});

eventSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return this.dateTime.start <= now && this.dateTime.end >= now;
});

eventSchema.virtual('isPast').get(function () {
  return this.dateTime.end < new Date();
});

eventSchema.virtual('duration').get(function () {
  return this.dateTime.end - this.dateTime.start;
});

eventSchema.virtual('likesCount').get(function () {
  return this.social.likes.length;
});

eventSchema.virtual('sharesCount').get(function () {
  return this.social.shares.length;
});

// Methods
eventSchema.methods.addAttendee = function (userId, status = 'pending') {
  const existingAttendee = this.attendees.find(
    a => a.user.toString() === userId.toString()
  );

  if (existingAttendee) {
    existingAttendee.status = status;
    existingAttendee.rsvpDate = new Date();
  } else {
    this.attendees.push({
      user: userId,
      status,
      rsvpDate: new Date(),
    });
  }

  if (status === 'confirmed') {
    this.currentAttendees = Math.min(this.currentAttendees + 1, this.capacity);
  }

  return this.save();
};

eventSchema.methods.removeAttendee = function (userId) {
  const attendeeIndex = this.attendees.findIndex(
    a => a.user.toString() === userId.toString()
  );

  if (attendeeIndex > -1) {
    const attendee = this.attendees[attendeeIndex];
    if (attendee.status === 'confirmed') {
      this.currentAttendees = Math.max(0, this.currentAttendees - 1);
    }
    this.attendees.splice(attendeeIndex, 1);
  }

  return this.save();
};

eventSchema.methods.addToWaitlist = function (userId) {
  const existingWaitlist = this.waitlist.find(
    w => w.user.toString() === userId.toString()
  );
  if (!existingWaitlist) {
    this.waitlist.push({ user: userId });
  }
  return this.save();
};

eventSchema.methods.removeFromWaitlist = function (userId) {
  this.waitlist = this.waitlist.filter(
    w => w.user.toString() !== userId.toString()
  );
  return this.save();
};

eventSchema.methods.toggleLike = function (userId) {
  const likeIndex = this.social.likes.findIndex(
    l => l.user.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    this.social.likes.splice(likeIndex, 1);
  } else {
    this.social.likes.push({ user: userId });
  }

  return this.save();
};

eventSchema.methods.addShare = function (userId, platform) {
  this.social.shares.push({
    user: userId,
    platform,
    sharedAt: new Date(),
  });

  return this.save();
};

eventSchema.methods.incrementViews = function () {
  this.social.views += 1;
  return this.save();
};

// Static methods
eventSchema.statics.findNearby = function (
  coordinates,
  maxDistance = 10000,
  limit = 20
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'published',
    'dateTime.start': { $gte: new Date() },
  })
    .populate('host', 'username firstName lastName avatar')
    .limit(limit);
};

eventSchema.statics.findByCategory = function (category, limit = 20) {
  return this.find({
    category,
    status: 'published',
    'dateTime.start': { $gte: new Date() },
  })
    .populate('host', 'username firstName lastName avatar')
    .sort({ 'dateTime.start': 1 })
    .limit(limit);
};

eventSchema.statics.findUpcoming = function (limit = 20) {
  return this.find({
    status: 'published',
    'dateTime.start': { $gte: new Date() },
  })
    .populate('host', 'username firstName lastName avatar')
    .sort({ 'dateTime.start': 1 })
    .limit(limit);
};

eventSchema.statics.findByHost = function (hostId, limit = 20) {
  return this.find({
    host: hostId,
    status: { $in: ['published', 'completed'] },
  })
    .populate('host', 'username firstName lastName avatar')
    .sort({ 'dateTime.start': -1 })
    .limit(limit);
};

// Pre-save middleware
eventSchema.pre('save', function (next) {
  // Ensure end date is after start date
  if (this.dateTime.end <= this.dateTime.start) {
    return next(
      new Error('La fecha de fin debe ser posterior a la fecha de inicio')
    );
  }

  // Ensure capacity is positive
  if (this.capacity <= 0) {
    return next(new Error('La capacidad debe ser mayor a 0'));
  }

  // Ensure current attendees doesn't exceed capacity
  if (this.currentAttendees > this.capacity) {
    this.currentAttendees = this.capacity;
  }

  next();
});

module.exports = mongoose.model('Event', eventSchema);

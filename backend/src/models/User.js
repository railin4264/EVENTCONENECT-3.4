const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
      maxlength: [30, 'El nombre de usuario no puede exceder 30 caracteres'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'El nombre de usuario solo puede contener letras, números y guiones bajos',
      ],
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es requerido'],
      trim: true,
      maxlength: [50, 'El apellido no puede exceder 50 caracteres'],
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'La biografía no puede exceder 500 caracteres'],
      default: '',
    },
    // Fecha de nacimiento se vuelve opcional para soportar registros y pruebas que no la incluyan.
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      // Permitimos registrar la dirección como cadena simple para flexibilidad.
      address: {
        type: String,
      },
    },
    // Intereses del usuario. Se permite cualquier string para flexibilidad y futuras categorías.
    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    // Calificación promedio del usuario (0-5).
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'public',
        },
        locationSharing: { type: Boolean, default: true },
        activityVisibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'public',
        },
      },
      language: { type: String, default: 'es' },
      timezone: { type: String, default: 'UTC' },
    },
    stats: {
      eventsAttended: { type: Number, default: 0 },
      eventsHosted: { type: Number, default: 0 },
      tribesJoined: { type: Number, default: 0 },
      tribesCreated: { type: Number, default: 0 },
      postsCreated: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
    },
    badges: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        device: String,
        ip: String,
      },
    ],
    pushTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        platform: {
          type: String,
          enum: ['ios', 'android', 'web'],
          required: true,
        },
        deviceId: String,
        appVersion: String,
        osVersion: String,
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        lastUsed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notificationPreferences: {
      push: {
        enabled: { type: Boolean, default: true },
        types: {
          event_invite: { type: Boolean, default: true },
          event_reminder: { type: Boolean, default: true },
          event_update: { type: Boolean, default: true },
          event_cancelled: { type: Boolean, default: true },
          tribe_invite: { type: Boolean, default: true },
          tribe_update: { type: Boolean, default: true },
          new_message: { type: Boolean, default: true },
          mention: { type: Boolean, default: true },
          like: { type: Boolean, default: true },
          comment: { type: Boolean, default: true },
          follow: { type: Boolean, default: true },
          system: { type: Boolean, default: true },
          security: { type: Boolean, default: true },
          promotional: { type: Boolean, default: false },
        },
        quietHours: {
          enabled: { type: Boolean, default: false },
          start: { type: String, default: '22:00' },
          end: { type: String, default: '08:00' },
          timezone: { type: String, default: 'UTC' },
        },
      },
      email: {
        enabled: { type: Boolean, default: true },
        types: {
          event_invite: { type: Boolean, default: true },
          event_reminder: { type: Boolean, default: true },
          event_update: { type: Boolean, default: true },
          event_cancelled: { type: Boolean, default: true },
          tribe_invite: { type: Boolean, default: true },
          tribe_update: { type: Boolean, default: true },
          new_message: { type: Boolean, default: false },
          mention: { type: Boolean, default: true },
          like: { type: Boolean, default: false },
          comment: { type: Boolean, default: false },
          follow: { type: Boolean, default: false },
          system: { type: Boolean, default: true },
          security: { type: Boolean, default: true },
          promotional: { type: Boolean, default: false },
        },
        frequency: {
          type: String,
          enum: ['immediate', 'hourly', 'daily', 'weekly'],
          default: 'immediate',
        },
      },
      sms: {
        enabled: { type: Boolean, default: false },
        types: {
          event_reminder: { type: Boolean, default: true },
          security: { type: Boolean, default: true },
        },
      },
      in_app: {
        enabled: { type: Boolean, default: true },
        types: {
          event_invite: { type: Boolean, default: true },
          event_reminder: { type: Boolean, default: true },
          event_update: { type: Boolean, default: true },
          event_cancelled: { type: Boolean, default: true },
          tribe_invite: { type: Boolean, default: true },
          tribe_update: { type: Boolean, default: true },
          new_message: { type: Boolean, default: true },
          mention: { type: Boolean, default: true },
          like: { type: Boolean, default: true },
          comment: { type: Boolean, default: true },
          follow: { type: Boolean, default: true },
          system: { type: Boolean, default: true },
          security: { type: Boolean, default: true },
          promotional: { type: Boolean, default: true },
        },
        sound: { type: Boolean, default: true },
        vibration: { type: Boolean, default: true },
        badge: { type: Boolean, default: true },
      },
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    // Client-synced watchlist with last-write-wins
    watchlist: {
      type: [
        new mongoose.Schema(
          {
            id: { type: String, required: true },
            updatedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    watchlistUpdatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateRefreshToken = function (
  device = 'unknown',
  ip = 'unknown'
) {
  const token = require('crypto').randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  this.refreshTokens.push({
    token,
    expiresAt,
    device,
    ip,
  });

  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  return token;
};

userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
};

userSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > now);
};

userSchema.methods.addBadge = function (
  badgeType,
  badgeName,
  badgeDescription,
  badgeIcon
) {
  const existingBadge = this.badges.find(badge => badge.type === badgeType);
  if (!existingBadge) {
    this.badges.push({
      type: badgeType,
      name: badgeName,
      description: badgeDescription,
      icon: badgeIcon,
    });
  }
};

userSchema.methods.updateStats = function (field, increment = 1) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += increment;
  }
};

// Pre-save middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Evitar doble hash: si la contraseña ya parece un hash de bcrypt (comienza con "$2" y tiene longitud 60), no la volvemos a cifrar.
  if (typeof this.password === 'string' && this.password.startsWith('$2') && this.password.length === 60) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function (next) {
  this.cleanExpiredTokens();
  next();
});

// Static methods
userSchema.statics.findNearby = function (coordinates, maxDistance = 10000) {
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
  });
};

userSchema.statics.findByInterests = function (interests) {
  return this.find({
    interests: { $in: interests },
  });
};

module.exports = mongoose.model('User', userSchema);
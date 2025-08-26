const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'events',      // Relacionado con eventos
      'social',      // Relacionado con interacciones sociales
      'tribes',      // Relacionado con tribus/comunidades
      'exploration', // Relacionado con descubrimiento
      'creation',    // Relacionado con crear contenido
      'streak',      // Relacionado con rachas de actividad
      'special',     // Logros especiales/estacionales
      'milestone'    // Logros de hitos importantes
    ]
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard', 'legendary']
  },
  requirements: {
    type: {
      type: String,
      required: true,
      enum: [
        'count',           // Alcanzar cierto número
        'streak',          // Mantener racha
        'unique',          // Hacer algo único
        'time_based',      // Basado en tiempo
        'combination',     // Combinación de factores
        'percentage'       // Alcanzar cierto porcentaje
      ]
    },
    target: {
      type: Number,
      required: true
    },
    metric: {
      type: String,
      required: true,
      // Ejemplos: 'events_attended', 'events_created', 'tribes_joined', etc.
    },
    timeframe: {
      type: String,
      enum: ['day', 'week', 'month', 'year', 'all_time'],
      default: 'all_time'
    },
    additional: {
      // Requisitos adicionales específicos
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  rewards: {
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    badges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }],
    unlocks: [{
      type: String,
      // Ejemplos: 'special_theme', 'premium_feature', 'exclusive_content'
    }],
    title: {
      type: String,
      // Título especial que se otorga
    }
  },
  prerequisites: [{
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    required: {
      type: Boolean,
      default: true
    }
  }],
  isSecret: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  seasonalInfo: {
    isSeasonalAndActive: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    season: String
  },
  stats: {
    totalEarned: {
      type: Number,
      default: 0
    },
    firstEarnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    firstEarnedAt: Date,
    averageTimeToComplete: Number, // En días
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// ===== INDEXES =====
achievementSchema.index({ category: 1, difficulty: 1 });
achievementSchema.index({ isActive: 1, order: 1 });
achievementSchema.index({ 'requirements.metric': 1 });
achievementSchema.index({ 'seasonalInfo.isSeasonalAndActive': 1, 'seasonalInfo.endDate': 1 });

// ===== METHODS =====
achievementSchema.methods.checkEligibility = function(userStats, userAchievements) {
  // Verificar prerrequisitos
  for (const prereq of this.prerequisites) {
    const hasPrerequisite = userAchievements.some(
      achievement => achievement.achievementId.toString() === prereq.achievementId.toString()
    );
    if (prereq.required && !hasPrerequisite) {
      return { eligible: false, reason: 'Prerequisites not met' };
    }
  }

  // Verificar si ya lo tiene
  const alreadyHas = userAchievements.some(
    achievement => achievement.achievementId.toString() === this._id.toString()
  );
  if (alreadyHas) {
    return { eligible: false, reason: 'Already earned' };
  }

  // Verificar si está activo
  if (!this.isActive) {
    return { eligible: false, reason: 'Achievement not active' };
  }

  // Verificar fecha estacional
  if (this.seasonalInfo?.isSeasonalAndActive) {
    const now = new Date();
    if (now < this.seasonalInfo.startDate || now > this.seasonalInfo.endDate) {
      return { eligible: false, reason: 'Seasonal achievement not in season' };
    }
  }

  return { eligible: true };
};

achievementSchema.methods.calculateProgress = function(userStats) {
  const metric = this.requirements.metric;
  const target = this.requirements.target;
  
  let currentValue = 0;
  
  // Obtener valor actual basado en la métrica
  switch (metric) {
    case 'events_attended':
      currentValue = userStats.eventsAttended || 0;
      break;
    case 'events_created':
      currentValue = userStats.eventsHosted || 0;
      break;
    case 'tribes_joined':
      currentValue = userStats.tribesJoined || 0;
      break;
    case 'tribes_created':
      currentValue = userStats.tribesCreated || 0;
      break;
    case 'friends_made':
      currentValue = userStats.friendsCount || 0;
      break;
    case 'posts_created':
      currentValue = userStats.postsCreated || 0;
      break;
    case 'consecutive_days':
      currentValue = userStats.currentStreak || 0;
      break;
    case 'total_experience':
      currentValue = userStats.totalExperience || 0;
      break;
    default:
      currentValue = userStats[metric] || 0;
  }

  const progress = Math.min((currentValue / target) * 100, 100);
  const completed = progress >= 100;

  return {
    current: currentValue,
    target,
    progress,
    completed,
    remaining: Math.max(target - currentValue, 0)
  };
};

// ===== STATICS =====
achievementSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ order: 1, difficulty: 1 });
};

achievementSchema.statics.getSeasonalAchievements = function() {
  const now = new Date();
  return this.find({
    'seasonalInfo.isSeasonalAndActive': true,
    'seasonalInfo.startDate': { $lte: now },
    'seasonalInfo.endDate': { $gte: now },
    isActive: true
  });
};

achievementSchema.statics.getEligibleAchievements = function(userStats, userAchievements) {
  return this.find({ isActive: true }).then(achievements => {
    return achievements.filter(achievement => {
      const eligibility = achievement.checkEligibility(userStats, userAchievements);
      return eligibility.eligible;
    });
  });
};

module.exports = mongoose.model('Achievement', achievementSchema);

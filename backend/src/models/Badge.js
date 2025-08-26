const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 300
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'events',      // Badges relacionados con eventos
      'social',      // Badges sociales
      'tribes',      // Badges de tribus
      'streak',      // Badges de rachas
      'special',     // Badges especiales
      'seasonal',    // Badges estacionales
      'rare',        // Badges raros
      'achievement'  // Badges otorgados por logros
    ]
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
  },
  unlockCondition: {
    type: String,
    required: true,
    enum: [
      'achievement',     // Se otorga al completar un logro
      'milestone',       // Se otorga al alcanzar un hito
      'event',          // Se otorga por participar en evento específico
      'manual',         // Se otorga manualmente
      'time_based',     // Se otorga basado en tiempo
      'special_action'  // Se otorga por acción especial
    ]
  },
  unlockCriteria: {
    // Criterios específicos para desbloquear el badge
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stackable: {
    type: Boolean,
    default: false // Si se puede ganar múltiples veces
  },
  maxStack: {
    type: Number,
    default: 1,
    min: 1
  },
  displayInfo: {
    color: {
      type: String,
      default: '#06b6d4'
    },
    backgroundColor: {
      type: String,
      default: '#1e293b'
    },
    glowEffect: {
      type: Boolean,
      default: false
    },
    animation: {
      type: String,
      enum: ['none', 'pulse', 'glow', 'float', 'spin'],
      default: 'none'
    }
  },
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
    season: String,
    event: String // Evento especial asociado
  },
  stats: {
    totalEarned: {
      type: Number,
      default: 0
    },
    uniqueOwners: {
      type: Number,
      default: 0
    },
    firstEarnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    firstEarnedAt: Date,
    rarityScore: {
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
badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ isActive: 1, order: 1 });
badgeSchema.index({ unlockCondition: 1 });
badgeSchema.index({ 'seasonalInfo.isSeasonalAndActive': 1, 'seasonalInfo.endDate': 1 });
badgeSchema.index({ 'stats.rarityScore': -1 });

// ===== VIRTUAL PROPERTIES =====
badgeSchema.virtual('isRare').get(function() {
  return ['rare', 'epic', 'legendary'].includes(this.rarity);
});

badgeSchema.virtual('displayRarity').get(function() {
  const rarityLabels = {
    'common': 'Común',
    'uncommon': 'Poco Común',
    'rare': 'Raro',
    'epic': 'Épico',
    'legendary': 'Legendario'
  };
  return rarityLabels[this.rarity] || this.rarity;
});

// ===== METHODS =====
badgeSchema.methods.canBeEarned = function(user, context = {}) {
  // Verificar si está activo
  if (!this.isActive) {
    return { canEarn: false, reason: 'Badge not active' };
  }

  // Verificar fecha estacional
  if (this.seasonalInfo?.isSeasonalAndActive) {
    const now = new Date();
    if (now < this.seasonalInfo.startDate || now > this.seasonalInfo.endDate) {
      return { canEarn: false, reason: 'Seasonal badge not in season' };
    }
  }

  // Verificar si ya lo tiene (para badges no stackeables)
  if (!this.stackable) {
    const userBadge = user.badges?.find(
      badge => badge.badgeId.toString() === this._id.toString()
    );
    if (userBadge) {
      return { canEarn: false, reason: 'Badge already earned' };
    }
  } else {
    // Para badges stackeables, verificar el límite
    const userBadge = user.badges?.find(
      badge => badge.badgeId.toString() === this._id.toString()
    );
    if (userBadge && userBadge.count >= this.maxStack) {
      return { canEarn: false, reason: 'Maximum stack reached' };
    }
  }

  // Verificar criterios específicos basados en el tipo
  return this.checkUnlockCriteria(user, context);
};

badgeSchema.methods.checkUnlockCriteria = function(user, context) {
  switch (this.unlockCondition) {
    case 'achievement':
      // Verificar si el logro asociado está completado
      const achievementId = this.unlockCriteria.achievementId;
      const hasAchievement = user.achievements?.some(
        achievement => achievement.achievementId.toString() === achievementId
      );
      return { 
        canEarn: hasAchievement, 
        reason: hasAchievement ? null : 'Required achievement not completed' 
      };

    case 'milestone':
      // Verificar si se alcanzó el hito
      const metric = this.unlockCriteria.metric;
      const target = this.unlockCriteria.target;
      const currentValue = user.stats?.[metric] || 0;
      return { 
        canEarn: currentValue >= target, 
        reason: currentValue >= target ? null : `Need ${target - currentValue} more ${metric}` 
      };

    case 'event':
      // Verificar participación en evento específico
      const eventId = this.unlockCriteria.eventId || context.eventId;
      const attendedEvents = user.stats?.attendedEvents || [];
      return { 
        canEarn: attendedEvents.includes(eventId), 
        reason: attendedEvents.includes(eventId) ? null : 'Must attend specific event' 
      };

    case 'time_based':
      // Verificar criterios basados en tiempo
      const timeMetric = this.unlockCriteria.timeMetric;
      const timeTarget = this.unlockCriteria.timeTarget;
      
      if (timeMetric === 'account_age') {
        const accountAge = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24); // días
        return { 
          canEarn: accountAge >= timeTarget, 
          reason: accountAge >= timeTarget ? null : `Account must be ${timeTarget} days old` 
        };
      }
      
      return { canEarn: false, reason: 'Time criteria not met' };

    case 'special_action':
      // Criterios especiales definidos en unlockCriteria
      return this.evaluateSpecialCriteria(user, context);

    case 'manual':
      // Se otorga manualmente
      return { canEarn: true };

    default:
      return { canEarn: false, reason: 'Unknown unlock condition' };
  }
};

badgeSchema.methods.evaluateSpecialCriteria = function(user, context) {
  const criteria = this.unlockCriteria;
  
  // Ejemplo: Badge por primera vez
  if (criteria.type === 'first_time') {
    const action = criteria.action;
    const firstTimeActions = user.stats?.firstTimeActions || {};
    return { 
      canEarn: !firstTimeActions[action], 
      reason: firstTimeActions[action] ? 'Already performed this action' : null 
    };
  }
  
  // Ejemplo: Badge por combo/combinación
  if (criteria.type === 'combo') {
    const requiredActions = criteria.actions || [];
    const userActions = context.recentActions || [];
    const hasCombo = requiredActions.every(action => userActions.includes(action));
    return { 
      canEarn: hasCombo, 
      reason: hasCombo ? null : 'Required action combo not completed' 
    };
  }
  
  return { canEarn: false, reason: 'Special criteria not met' };
};

badgeSchema.methods.calculateRarityScore = function() {
  const baseScores = {
    'common': 10,
    'uncommon': 25,
    'rare': 50,
    'epic': 75,
    'legendary': 100
  };
  
  let score = baseScores[this.rarity] || 0;
  
  // Ajustar basado en estadísticas
  const totalUsers = 10000; // En un sistema real, esto vendría de stats globales
  const ownershipPercentage = (this.stats.uniqueOwners / totalUsers) * 100;
  
  // Más raro si menos gente lo tiene
  if (ownershipPercentage < 1) score += 20;
  else if (ownershipPercentage < 5) score += 10;
  else if (ownershipPercentage < 10) score += 5;
  
  // Más raro si es estacional y ya no está disponible
  if (this.seasonalInfo?.isSeasonalAndActive && new Date() > this.seasonalInfo.endDate) {
    score += 15;
  }
  
  return Math.min(score, 100);
};

// ===== STATICS =====
badgeSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ order: 1, rarity: 1 });
};

badgeSchema.statics.getRareAndAbove = function() {
  return this.find({ 
    rarity: { $in: ['rare', 'epic', 'legendary'] }, 
    isActive: true 
  }).sort({ 'stats.rarityScore': -1 });
};

badgeSchema.statics.getEarnableBadges = function(user, context = {}) {
  return this.find({ isActive: true }).then(badges => {
    return badges.filter(badge => {
      const eligibility = badge.canBeEarned(user, context);
      return eligibility.canEarn;
    });
  });
};

// ===== PRE-SAVE HOOK =====
badgeSchema.pre('save', function(next) {
  // Calcular rarityScore antes de guardar
  this.stats.rarityScore = this.calculateRarityScore();
  next();
});

module.exports = mongoose.model('Badge', badgeSchema);

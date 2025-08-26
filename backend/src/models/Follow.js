const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // Usuario que sigue
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Usuario que es seguido
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tipo de seguimiento
  followType: {
    type: String,
    enum: ['user', 'organizer', 'tribe'],
    default: 'user'
  },
  
  // Estado del seguimiento
  status: {
    type: String,
    enum: ['active', 'muted', 'blocked'],
    default: 'active'
  },
  
  // Configuraciones de notificaciones
  notifications: {
    newEvents: {
      type: Boolean,
      default: true
    },
    eventUpdates: {
      type: Boolean,
      default: true
    },
    posts: {
      type: Boolean,
      default: false
    },
    achievements: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadatos de la relación
  source: {
    type: String,
    enum: ['manual', 'suggestion', 'event_attendance', 'mutual_friends', 'import'],
    default: 'manual'
  },
  
  // Información del contexto donde se siguió
  context: {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    tribeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe'
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Analytics de la relación
  analytics: {
    interactionCount: {
      type: Number,
      default: 0
    },
    lastInteraction: Date,
    eventsAttendedTogether: {
      type: Number,
      default: 0
    },
    mutualConnections: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// ===== INDEXES =====
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1, status: 1, createdAt: -1 });
followSchema.index({ following: 1, status: 1, createdAt: -1 });
followSchema.index({ followType: 1, status: 1 });

// ===== VIRTUAL PROPERTIES =====
followSchema.virtual('isRecent').get(function() {
  const daysSinceFollow = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceFollow <= 7;
});

followSchema.virtual('engagementLevel').get(function() {
  if (this.analytics.interactionCount === 0) return 'none';
  if (this.analytics.interactionCount < 5) return 'low';
  if (this.analytics.interactionCount < 20) return 'medium';
  return 'high';
});

// ===== STATIC METHODS =====
followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
    status: 'active'
  });
  return !!follow;
};

followSchema.statics.getFollowCounts = async function(userId) {
  const [followersCount, followingCount] = await Promise.all([
    this.countDocuments({ following: userId, status: 'active' }),
    this.countDocuments({ follower: userId, status: 'active' })
  ]);
  
  return {
    followers: followersCount,
    following: followingCount
  };
};

followSchema.statics.getFollowers = async function(userId, options = {}) {
  const { limit = 20, skip = 0, sort = '-createdAt' } = options;
  
  return this.find({ following: userId, status: 'active' })
    .populate('follower', 'firstName lastName username avatar stats')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

followSchema.statics.getFollowing = async function(userId, options = {}) {
  const { limit = 20, skip = 0, sort = '-createdAt' } = options;
  
  return this.find({ follower: userId, status: 'active' })
    .populate('following', 'firstName lastName username avatar stats')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

followSchema.statics.getMutualFollows = async function(userId1, userId2) {
  // Obtener a quién siguen ambos usuarios
  const [user1Following, user2Following] = await Promise.all([
    this.find({ follower: userId1, status: 'active' }).select('following'),
    this.find({ follower: userId2, status: 'active' }).select('following')
  ]);
  
  const user1FollowingIds = user1Following.map(f => f.following.toString());
  const user2FollowingIds = user2Following.map(f => f.following.toString());
  
  const mutualIds = user1FollowingIds.filter(id => user2FollowingIds.includes(id));
  
  if (mutualIds.length === 0) return [];
  
  // Obtener información de los usuarios mutuos
  const User = mongoose.model('User');
  return User.find({ _id: { $in: mutualIds } })
    .select('firstName lastName username avatar')
    .limit(10)
    .lean();
};

followSchema.statics.getSuggestedFollows = async function(userId, options = {}) {
  const { limit = 10 } = options;
  
  try {
    // Obtener usuarios que sigue actualmente
    const currentFollowing = await this.find({ 
      follower: userId, 
      status: 'active' 
    }).select('following');
    
    const followingIds = currentFollowing.map(f => f.following.toString());
    followingIds.push(userId); // Excluir al usuario mismo
    
    // Buscar usuarios con intereses similares
    const User = mongoose.model('User');
    const currentUser = await User.findById(userId).select('interests location');
    
    if (!currentUser) return [];
    
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $nin: followingIds.map(id => new mongoose.Types.ObjectId(id)) },
          interests: { $in: currentUser.interests }
        }
      },
      {
        $addFields: {
          commonInterests: {
            $size: {
              $setIntersection: ['$interests', currentUser.interests]
            }
          }
        }
      },
      {
        $match: { commonInterests: { $gte: 1 } }
      },
      {
        $sort: { 
          commonInterests: -1, 
          'stats.eventsHosted': -1,
          'stats.averageRating': -1 
        }
      },
      { $limit: limit },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          avatar: 1,
          stats: 1,
          commonInterests: 1,
          interests: 1
        }
      }
    ]);
    
    return suggestions;
  } catch (error) {
    console.error('Error getting suggested follows:', error);
    return [];
  }
};

followSchema.statics.followUser = async function(followerId, followingId, options = {}) {
  const { 
    source = 'manual', 
    context = {},
    notifications = {} 
  } = options;
  
  // Verificar que no sea el mismo usuario
  if (followerId.toString() === followingId.toString()) {
    return { success: false, message: 'No puedes seguirte a ti mismo' };
  }
  
  // Verificar si ya existe la relación
  const existingFollow = await this.findOne({
    follower: followerId,
    following: followingId
  });
  
  if (existingFollow) {
    if (existingFollow.status === 'active') {
      return { success: false, message: 'Ya sigues a este usuario' };
    } else {
      // Reactivar seguimiento
      existingFollow.status = 'active';
      existingFollow.notifications = { ...existingFollow.notifications, ...notifications };
      await existingFollow.save();
      
      await this.updateFollowCounts(followerId, followingId, 'follow');
      
      return { 
        success: true, 
        message: 'Usuario seguido nuevamente',
        follow: existingFollow 
      };
    }
  }
  
  // Crear nueva relación de seguimiento
  const follow = new this({
    follower: followerId,
    following: followingId,
    source,
    context,
    notifications: {
      newEvents: true,
      eventUpdates: true,
      posts: false,
      achievements: false,
      ...notifications
    }
  });
  
  await follow.save();
  await this.updateFollowCounts(followerId, followingId, 'follow');
  
  return { 
    success: true, 
    message: 'Usuario seguido exitosamente',
    follow 
  };
};

followSchema.statics.unfollowUser = async function(followerId, followingId) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
    status: 'active'
  });
  
  if (!follow) {
    return { success: false, message: 'No sigues a este usuario' };
  }
  
  follow.status = 'blocked'; // Cambiar estado en lugar de eliminar
  await follow.save();
  
  await this.updateFollowCounts(followerId, followingId, 'unfollow');
  
  return { 
    success: true, 
    message: 'Dejaste de seguir al usuario' 
  };
};

followSchema.statics.updateFollowCounts = async function(followerId, followingId, action) {
  const User = mongoose.model('User');
  const increment = action === 'follow' ? 1 : -1;
  
  await Promise.all([
    // Actualizar contador de following del follower
    User.findByIdAndUpdate(followerId, {
      $inc: { 'stats.followingCount': increment }
    }),
    // Actualizar contador de followers del following
    User.findByIdAndUpdate(followingId, {
      $inc: { 'stats.followersCount': increment }
    })
  ]);
};

followSchema.statics.getFollowActivity = async function(userId, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  // Obtener actividad de las personas que sigue
  const following = await this.find({ follower: userId, status: 'active' })
    .select('following');
  
  const followingIds = following.map(f => f.following);
  
  if (followingIds.length === 0) return [];
  
  // Obtener actividad reciente de eventos
  const Event = mongoose.model('Event');
  const recentActivity = await Event.find({
    organizer: { $in: followingIds },
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Últimos 7 días
  })
  .populate('organizer', 'firstName lastName username avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
  
  return recentActivity.map(event => ({
    type: 'new_event',
    user: event.organizer,
    event: {
      id: event._id,
      title: event.title,
      startDate: event.startDate
    },
    timestamp: event.createdAt
  }));
};

// ===== INSTANCE METHODS =====
followSchema.methods.updateNotificationSettings = function(settings) {
  this.notifications = { ...this.notifications, ...settings };
  return this.save();
};

followSchema.methods.recordInteraction = function() {
  this.analytics.interactionCount += 1;
  this.analytics.lastInteraction = new Date();
  return this.save();
};

// ===== PRE-SAVE HOOKS =====
followSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Calcular conexiones mutuas
    const mutualFollows = await this.constructor.getMutualFollows(
      this.follower, 
      this.following
    );
    this.analytics.mutualConnections = mutualFollows.length;
  }
  next();
});

// ===== POST-SAVE HOOKS =====
followSchema.post('save', async function(doc) {
  // Crear notificación para el usuario seguido
  try {
    const Notification = mongoose.model('Notification');
    
    if (doc.isNew && doc.status === 'active') {
      await Notification.create({
        recipient: doc.following,
        type: 'new_follower',
        data: {
          followerId: doc.follower,
          source: doc.source
        },
        priority: 'low'
      });
    }
  } catch (error) {
    console.error('Error creating follow notification:', error);
  }
});

module.exports = mongoose.model('Follow', followSchema);

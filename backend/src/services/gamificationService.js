const User = require('../models/User');
const Event = require('../models/Event');
const cache = require('../config/cache');

// ===== CONFIGURACIÓN DE LOGROS =====
const ACHIEVEMENTS = [
  {
    id: 'first_event',
    title: 'Primer Paso',
    description: 'Asististe a tu primer evento',
    icon: '🎉',
    points: 10,
    category: 'events',
    rarity: 'common',
    requirements: { eventsAttended: 1 }
  },
  {
    id: 'event_enthusiast',
    title: 'Entusiasta de Eventos',
    description: 'Asiste a 5 eventos',
    icon: '🎪',
    points: 50,
    category: 'events',
    rarity: 'common',
    requirements: { eventsAttended: 5 }
  },
  {
    id: 'social_butterfly',
    title: 'Mariposa Social',
    description: 'Asiste a 5 eventos en un mes',
    icon: '🦋',
    points: 75,
    category: 'social',
    rarity: 'rare',
    requirements: { eventsAttendedThisMonth: 5 }
  },
  {
    id: 'event_creator',
    title: 'Creador de Experiencias',
    description: 'Organiza tu primer evento',
    icon: '🎨',
    points: 25,
    category: 'creation',
    rarity: 'common',
    requirements: { eventsCreated: 1 }
  },
  {
    id: 'super_host',
    title: 'Super Anfitrión',
    description: 'Organiza 10 eventos exitosos',
    icon: '⭐',
    points: 300,
    category: 'creation',
    rarity: 'epic',
    requirements: { eventsCreated: 10 }
  }
];

// ===== CONFIGURACIÓN DE NIVELES =====
const USER_LEVELS = [
  { level: 1, title: 'Explorador', pointsRequired: 0, benefits: ['Acceso básico'] },
  { level: 2, title: 'Participante', pointsRequired: 50, benefits: ['Crear eventos', 'Unirse a tribus'] },
  { level: 3, title: 'Entusiasta', pointsRequired: 150, benefits: ['Eventos destacados', 'Invitaciones exclusivas'] },
  { level: 5, title: 'Influencer', pointsRequired: 400, benefits: ['Verificación', 'Analytics avanzados'] },
  { level: 10, title: 'Embajador', pointsRequired: 1000, benefits: ['Programa beta', 'Soporte prioritario'] },
  { level: 20, title: 'Leyenda', pointsRequired: 2500, benefits: ['Acceso VIP', 'Eventos exclusivos'] }
];

// ===== SERVICIO DE GAMIFICACIÓN =====
class GamificationService {
  /**
   * Obtiene perfil completo de gamificación del usuario
   */
  static async getUserGamificationProfile(userId) {
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const stats = this.calculateUserStats(user);
      const availableAchievements = await this.getAvailableAchievements(userId);
      const unlockedAchievements = await this.getUnlockedAchievements(userId);

      return {
        user: {
          id: userId,
          level: stats.level,
          totalPoints: stats.totalPoints,
          pointsToNextLevel: stats.pointsToNextLevel,
          progressPercent: stats.progressPercent
        },
        achievements: {
          unlocked: unlockedAchievements,
          available: availableAchievements,
          total: ACHIEVEMENTS.length,
          completionRate: (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
        },
        stats: {
          eventsAttended: user.stats?.eventsAttended || 0,
          eventsCreated: user.stats?.eventsCreated || 0,
          tribesJoined: user.stats?.tribesJoined || 0,
          totalInteractions: user.stats?.totalInteractions || 0
        }
      };

    } catch (error) {
      console.error('Error obteniendo perfil de gamificación:', error);
      throw error;
    }
  }

  /**
   * Procesa una acción del usuario y otorga puntos/logros
   */
  static async processUserAction(userId, action, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      let pointsEarned = 0;
      const newAchievements = [];
      let levelUp = false;
      let newLevel = null;

      // Calcular puntos por acción
      switch (action) {
        case 'attended_event':
          pointsEarned = 10;
          user.stats = user.stats || {};
          user.stats.eventsAttended = (user.stats.eventsAttended || 0) + 1;
          user.stats.eventsAttendedThisMonth = (user.stats.eventsAttendedThisMonth || 0) + 1;
          break;
        case 'created_event':
          pointsEarned = 25;
          user.stats = user.stats || {};
          user.stats.eventsCreated = (user.stats.eventsCreated || 0) + 1;
          break;
        case 'joined_tribe':
          pointsEarned = 15;
          user.stats = user.stats || {};
          user.stats.tribesJoined = (user.stats.tribesJoined || 0) + 1;
          break;
        case 'early_join':
          pointsEarned = 5;
          break;
        case 'shared_event':
          pointsEarned = 3;
          user.stats = user.stats || {};
          user.stats.totalShares = (user.stats.totalShares || 0) + 1;
          break;
      }

      // Actualizar puntos totales
      const oldTotalPoints = user.gamification?.totalPoints || 0;
      const newTotalPoints = oldTotalPoints + pointsEarned;
      
      user.gamification = user.gamification || {};
      user.gamification.totalPoints = newTotalPoints;

      // Verificar cambio de nivel
      const oldLevel = this.calculateLevel(oldTotalPoints);
      const currentLevel = this.calculateLevel(newTotalPoints);
      
      if (currentLevel.level > oldLevel.level) {
        levelUp = true;
        newLevel = currentLevel;
      }

      // Verificar logros desbloqueados
      const unlockedAchievements = await this.checkAchievements(user, action, data);
      
      if (unlockedAchievements.length > 0) {
        user.gamification.achievements = user.gamification.achievements || [];
        unlockedAchievements.forEach(achievement => {
          user.gamification.achievements.push({
            achievementId: achievement.id,
            unlockedAt: new Date(),
            points: achievement.points
          });
          newAchievements.push(achievement);
        });

        // Puntos adicionales por logros
        const achievementPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
        user.gamification.totalPoints += achievementPoints;
        pointsEarned += achievementPoints;
      }

      // Guardar usuario actualizado
      await user.save();

      // Invalidar caché
      await cache.delete(`user:${userId}`);
      await cache.deletePattern(`gamification:${userId}:*`);

      return {
        pointsEarned,
        newAchievements,
        levelUp,
        newLevel,
        totalPoints: user.gamification.totalPoints,
        currentLevel: this.calculateLevel(user.gamification.totalPoints)
      };

    } catch (error) {
      console.error('Error procesando acción de usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica logros desbloqueados por una acción
   */
  static async checkAchievements(user, action, data = {}) {
    const unlockedAchievements = [];
    const userAchievements = user.gamification?.achievements?.map(a => a.achievementId) || [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip si ya está desbloqueado
      if (userAchievements.includes(achievement.id)) continue;

      // Verificar requisitos
      let requirementsMet = false;
      
      if (achievement.requirements.eventsAttended) {
        requirementsMet = (user.stats?.eventsAttended || 0) >= achievement.requirements.eventsAttended;
      }
      
      if (achievement.requirements.eventsAttendedThisMonth) {
        requirementsMet = (user.stats?.eventsAttendedThisMonth || 0) >= achievement.requirements.eventsAttendedThisMonth;
      }
      
      if (achievement.requirements.eventsCreated) {
        requirementsMet = (user.stats?.eventsCreated || 0) >= achievement.requirements.eventsCreated;
      }

      if (requirementsMet) {
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Calcula nivel del usuario basado en puntos
   */
  static calculateLevel(totalPoints) {
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= USER_LEVELS[i].pointsRequired) {
        return USER_LEVELS[i];
      }
    }
    return USER_LEVELS[0];
  }

  /**
   * Calcula estadísticas del usuario
   */
  static calculateUserStats(user) {
    const totalPoints = user.gamification?.totalPoints || 0;
    const currentLevel = this.calculateLevel(totalPoints);
    
    // Encontrar siguiente nivel
    const nextLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    const nextLevel = nextLevelIndex < USER_LEVELS.length ? USER_LEVELS[nextLevelIndex] : null;
    
    const pointsToNext = nextLevel ? nextLevel.pointsRequired - totalPoints : 0;
    const progressPercent = nextLevel ? 
      Math.round(((totalPoints - currentLevel.pointsRequired) / (nextLevel.pointsRequired - currentLevel.pointsRequired)) * 100) : 100;

    return {
      level: currentLevel,
      totalPoints,
      pointsToNextLevel: pointsToNext,
      progressPercent: Math.max(0, Math.min(100, progressPercent))
    };
  }

  /**
   * Obtiene logros disponibles para desbloquear
   */
  static async getAvailableAchievements(userId) {
    try {
      const user = await User.findById(userId).lean();
      const unlockedIds = user.gamification?.achievements?.map(a => a.achievementId) || [];
      
      return ACHIEVEMENTS
        .filter(achievement => !unlockedIds.includes(achievement.id))
        .map(achievement => ({
          ...achievement,
          progress: this.calculateAchievementProgress(user, achievement)
        }));

    } catch (error) {
      console.error('Error obteniendo logros disponibles:', error);
      return [];
    }
  }

  /**
   * Obtiene logros desbloqueados
   */
  static async getUnlockedAchievements(userId) {
    try {
      const user = await User.findById(userId).lean();
      const unlockedIds = user.gamification?.achievements?.map(a => a.achievementId) || [];
      
      return ACHIEVEMENTS
        .filter(achievement => unlockedIds.includes(achievement.id))
        .map(achievement => {
          const userAchievement = user.gamification.achievements.find(a => a.achievementId === achievement.id);
          return {
            ...achievement,
            unlockedAt: userAchievement.unlockedAt
          };
        });

    } catch (error) {
      console.error('Error obteniendo logros desbloqueados:', error);
      return [];
    }
  }

  /**
   * Calcula progreso hacia un logro específico
   */
  static calculateAchievementProgress(user, achievement) {
    const requirements = achievement.requirements;
    
    if (requirements.eventsAttended) {
      return {
        current: user.stats?.eventsAttended || 0,
        target: requirements.eventsAttended
      };
    }
    
    if (requirements.eventsAttendedThisMonth) {
      return {
        current: user.stats?.eventsAttendedThisMonth || 0,
        target: requirements.eventsAttendedThisMonth
      };
    }
    
    if (requirements.eventsCreated) {
      return {
        current: user.stats?.eventsCreated || 0,
        target: requirements.eventsCreated
      };
    }

    return { current: 0, target: 1 };
  }

  /**
   * Obtiene leaderboard de usuarios
   */
  static async getLeaderboard(options = {}) {
    const {
      timeframe = 'all',
      limit = 50,
      includeCurrentUser = false,
      currentUserId
    } = options;

    try {
      const cacheKey = `leaderboard:${timeframe}:${limit}`;
      const cached = await cache.get(cacheKey);
      if (cached && !includeCurrentUser) {
        return cached;
      }

      // Query base
      let query = {
        'gamification.totalPoints': { $gt: 0 }
      };

      // Filtro por timeframe
      if (timeframe === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query['gamification.lastActivityAt'] = { $gte: weekAgo };
      } else if (timeframe === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query['gamification.lastActivityAt'] = { $gte: monthAgo };
      }

      const users = await User.find(query)
        .select('firstName lastName avatar gamification stats')
        .sort({ 'gamification.totalPoints': -1 })
        .limit(limit)
        .lean();

      // Calcular posiciones
      const leaderboard = users.map((user, index) => ({
        ...user,
        rank: index + 1,
        level: this.calculateLevel(user.gamification?.totalPoints || 0)
      }));

      // Incluir usuario actual si no está en el top
      if (includeCurrentUser && currentUserId) {
        const currentUserInTop = leaderboard.find(u => u._id.toString() === currentUserId);
        
        if (!currentUserInTop) {
          const currentUser = await User.findById(currentUserId)
            .select('firstName lastName avatar gamification stats')
            .lean();
          
          if (currentUser) {
            // Calcular posición real del usuario
            const currentUserRank = await User.countDocuments({
              'gamification.totalPoints': { $gt: currentUser.gamification?.totalPoints || 0 }
            }) + 1;
            
            const currentUserData = {
              ...currentUser,
              rank: currentUserRank,
              level: this.calculateLevel(currentUser.gamification?.totalPoints || 0),
              isCurrentUser: true
            };
            
            return {
              leaderboard,
              currentUser: currentUserData
            };
          }
        }
      }

      // Guardar en caché por 5 minutos
      if (!includeCurrentUser) {
        await cache.set(cacheKey, leaderboard, 5 * 60);
      }

      return { leaderboard };

    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas globales de gamificación
   */
  static async getGlobalGamificationStats() {
    try {
      const cacheKey = 'gamification:global:stats';
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Estadísticas generales
      const totalUsers = await User.countDocuments({});
      const activeUsers = await User.countDocuments({
        'gamification.totalPoints': { $gt: 0 }
      });

      // Distribución de niveles
      const levelDistribution = await User.aggregate([
        { $match: { 'gamification.totalPoints': { $exists: true } } },
        {
          $addFields: {
            level: {
              $switch: {
                branches: [
                  { case: { $lt: ['$gamification.totalPoints', 50] }, then: 1 },
                  { case: { $lt: ['$gamification.totalPoints', 150] }, then: 2 },
                  { case: { $lt: ['$gamification.totalPoints', 400] }, then: 3 },
                  { case: { $lt: ['$gamification.totalPoints', 1000] }, then: 5 },
                  { case: { $lt: ['$gamification.totalPoints', 2500] }, then: 10 }
                ],
                default: 20
              }
            }
          }
        },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // Distribución de logros
      const achievementStats = {};
      for (const achievement of ACHIEVEMENTS) {
        const unlockedCount = await User.countDocuments({
          'gamification.achievements.achievementId': achievement.id
        });
        
        achievementStats[achievement.id] = {
          achievement,
          unlockedCount,
          unlockedPercentage: activeUsers > 0 ? (unlockedCount / activeUsers) * 100 : 0
        };
      }

      // Top usuarios
      const topUsers = await User.find({
        'gamification.totalPoints': { $gt: 0 }
      })
      .select('firstName lastName avatar gamification')
      .sort({ 'gamification.totalPoints': -1 })
      .limit(10)
      .lean();

      const stats = {
        totalUsers,
        activeUsers,
        engagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        levelDistribution,
        achievementStats,
        topUsers: topUsers.map(user => ({
          ...user,
          level: this.calculateLevel(user.gamification?.totalPoints || 0)
        })),
        lastUpdated: new Date().toISOString()
      };

      // Guardar en caché por 15 minutos
      await cache.set(cacheKey, stats, 15 * 60);

      return stats;

    } catch (error) {
      console.error('Error obteniendo estadísticas globales:', error);
      throw error;
    }
  }

  /**
   * Obtiene progreso de un logro específico
   */
  static async getAchievementProgress(userId, achievementId) {
    try {
      const user = await User.findById(userId).lean();
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      
      if (!achievement) {
        throw new Error('Logro no encontrado');
      }

      const progress = this.calculateAchievementProgress(user, achievement);
      const isUnlocked = user.gamification?.achievements?.some(a => a.achievementId === achievementId);

      return {
        achievement,
        progress,
        isUnlocked,
        unlockedAt: isUnlocked ? 
          user.gamification.achievements.find(a => a.achievementId === achievementId).unlockedAt : null
      };

    } catch (error) {
      console.error('Error obteniendo progreso de logro:', error);
      throw error;
    }
  }

  /**
   * Simula acción de usuario (solo para desarrollo)
   */
  static async simulateUserAction(userId, action, data = {}) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Simulación solo disponible en desarrollo');
    }

    return this.processUserAction(userId, action, data);
  }

  /**
   * Obtiene logros del usuario con filtros
   */
  static async getUserAchievements(userId, filters = {}) {
    try {
      const { category, rarity } = filters;
      
      let achievements = ACHIEVEMENTS;
      
      if (category) {
        achievements = achievements.filter(a => a.category === category);
      }
      
      if (rarity) {
        achievements = achievements.filter(a => a.rarity === rarity);
      }

      const user = await User.findById(userId).lean();
      const unlockedIds = user.gamification?.achievements?.map(a => a.achievementId) || [];

      return {
        available: achievements.filter(a => !unlockedIds.includes(a.id)),
        unlocked: achievements.filter(a => unlockedIds.includes(a.id))
      };

    } catch (error) {
      console.error('Error obteniendo logros de usuario:', error);
      throw error;
    }
  }

  /**
   * Resetea stats de gamificación (solo desarrollo)
   */
  static async resetUserGamification(userId) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Reset solo disponible en desarrollo');
    }

    try {
      await User.findByIdAndUpdate(userId, {
        $unset: {
          'gamification': 1,
          'stats.eventsAttended': 1,
          'stats.eventsCreated': 1,
          'stats.tribesJoined': 1
        }
      });

      // Limpiar caché
      await cache.deletePattern(`gamification:${userId}:*`);
      await cache.delete(`user:${userId}`);

      return { message: 'Gamificación reseteada exitosamente' };

    } catch (error) {
      console.error('Error reseteando gamificación:', error);
      throw error;
    }
  }
}

module.exports = GamificationService;
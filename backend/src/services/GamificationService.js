const User = require('../models/User');
const Event = require('../models/Event');

class GamificationService {
  // Obtener progreso del usuario
  static async getUserProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        level: user.level || 1,
        experience: user.experience || 0,
        achievements: user.achievements || [],
        badges: user.badges || [],
        points: user.points || 0
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {
        level: 1,
        experience: 0,
        achievements: [],
        badges: [],
        points: 0
      };
    }
  }

  // Obtener logros disponibles
  static async getAvailableAchievements(userId) {
    try {
      // Logros básicos del sistema
      const achievements = [
        {
          id: 'first_event',
          name: 'Primer Evento',
          description: 'Crea tu primer evento',
          points: 100,
          icon: '🎉'
        },
        {
          id: 'event_organizer',
          name: 'Organizador',
          description: 'Organiza 5 eventos',
          points: 500,
          icon: '🏆'
        },
        {
          id: 'social_butterfly',
          name: 'Mariposa Social',
          description: 'Únete a 10 tribus',
          points: 300,
          icon: '🦋'
        }
      ];

      return achievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Obtener ranking del usuario
  static async getUserRanking(userId) {
    try {
      const users = await User.find().sort({ points: -1 }).limit(100);
      const userIndex = users.findIndex(user => user._id.toString() === userId);
      
      return {
        position: userIndex + 1,
        totalUsers: users.length,
        topUsers: users.slice(0, 10).map(user => ({
          id: user._id,
          name: user.name,
          points: user.points || 0,
          level: user.level || 1
        }))
      };
    } catch (error) {
      console.error('Error getting user ranking:', error);
      return {
        position: 999,
        totalUsers: 0,
        topUsers: []
      };
    }
  }

  // Obtener progreso de logros del usuario
  static async getUserAchievementProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const achievements = await this.getAvailableAchievements(userId);
      const userAchievements = user.achievements || [];

      return achievements.map(achievement => ({
        ...achievement,
        unlocked: userAchievements.includes(achievement.id),
        unlockedAt: userAchievements.includes(achievement.id) ? new Date() : null
      }));
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  }

  // Obtener categorías de logros
  static async getAchievementCategories() {
    return [
      {
        id: 'events',
        name: 'Eventos',
        description: 'Logros relacionados con eventos',
        icon: '📅'
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Logros relacionados con interacciones sociales',
        icon: '👥'
      },
      {
        id: 'exploration',
        name: 'Exploración',
        description: 'Logros relacionados con explorar la plataforma',
        icon: '🔍'
      }
    ];
  }

  // Verificar si puede reclamar un logro
  static async canClaimAchievement(userId, achievementId) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const achievements = user.achievements || [];
      return !achievements.includes(achievementId);
    } catch (error) {
      console.error('Error checking achievement claim:', error);
      return false;
    }
  }

  // Reclamar un logro
  static async claimAchievement(userId, achievementId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const achievements = user.achievements || [];
      if (achievements.includes(achievementId)) {
        throw new Error('Logro ya reclamado');
      }

      // Agregar logro
      user.achievements = [...achievements, achievementId];
      
      // Agregar puntos (ejemplo básico)
      const achievementPoints = 100; // Puntos por defecto
      user.points = (user.points || 0) + achievementPoints;
      
      await user.save();

      return {
        success: true,
        message: 'Logro reclamado exitosamente',
        pointsEarned: achievementPoints,
        totalPoints: user.points
      };
    } catch (error) {
      console.error('Error claiming achievement:', error);
      throw error;
    }
  }

  // Agregar experiencia al usuario
  static async addExperience(userId, data) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const { amount, source, description } = data;
      
      // Agregar experiencia
      user.experience = (user.experience || 0) + amount;
      
      // Calcular nivel (ejemplo básico: 100 exp por nivel)
      const newLevel = Math.floor(user.experience / 100) + 1;
      const levelUp = newLevel > (user.level || 1);
      
      if (levelUp) {
        user.level = newLevel;
        user.points = (user.points || 0) + (newLevel * 50); // Bonus por subir de nivel
      }

      await user.save();

      return {
        success: true,
        experienceAdded: amount,
        totalExperience: user.experience,
        levelUp,
        newLevel: user.level,
        pointsEarned: levelUp ? newLevel * 50 : 0,
        totalPoints: user.points
      };
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  // Obtener información del nivel
  static async getLevelInfo(levelNumber) {
    const baseExp = 100;
    const expForLevel = levelNumber * baseExp;
    const expForNextLevel = (levelNumber + 1) * baseExp;
    
    return {
      level: levelNumber,
      experienceRequired: expForLevel,
      experienceForNextLevel: expForNextLevel,
      progress: 0, // Se calcularía con la exp actual del usuario
      rewards: {
        points: levelNumber * 50,
        badges: levelNumber % 5 === 0 ? [`level_${levelNumber}`] : []
      }
    };
  }

  // Mostrar badge en perfil
  static async showcaseBadge(userId, badgeId, showcase) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (showcase) {
        user.showcasedBadges = user.showcasedBadges || [];
        if (!user.showcasedBadges.includes(badgeId)) {
          user.showcasedBadges.push(badgeId);
        }
      } else {
        user.showcasedBadges = user.showcasedBadges || [];
        user.showcasedBadges = user.showcasedBadges.filter(id => id !== badgeId);
      }

      await user.save();

      return {
        success: true,
        message: showcase ? 'Badge agregado al perfil' : 'Badge removido del perfil',
        showcasedBadges: user.showcasedBadges
      };
    } catch (error) {
      console.error('Error showcasing badge:', error);
      throw error;
    }
  }

  // Obtener leaderboards
  static async getLeaderboards(options = {}) {
    try {
      const { category = 'general', limit = 10 } = options;
      
      let query = {};
      let sort = {};

      switch (category) {
        case 'events':
          sort = { 'stats.eventsCreated': -1 };
          break;
        case 'social':
          sort = { 'stats.tribesJoined': -1 };
          break;
        case 'experience':
          sort = { experience: -1 };
          break;
        default:
          sort = { points: -1 };
      }

      const users = await User.find(query).sort(sort).limit(limit);

      return users.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        level: user.level || 1,
        points: user.points || 0,
        experience: user.experience || 0,
        stats: user.stats || {}
      }));
    } catch (error) {
      console.error('Error getting leaderboards:', error);
      return [];
    }
  }

  // Obtener rankings del usuario
  static async getUserRankings(userId) {
    try {
      const rankings = {};
      
      // Ranking general por puntos
      const generalRanking = await this.getLeaderboards({ category: 'general', limit: 100 });
      const userGeneralIndex = generalRanking.findIndex(user => user.id.toString() === userId);
      rankings.general = userGeneralIndex + 1;

      // Ranking por eventos
      const eventsRanking = await this.getLeaderboards({ category: 'events', limit: 100 });
      const userEventsIndex = eventsRanking.findIndex(user => user.id.toString() === userId);
      rankings.events = userEventsIndex + 1;

      // Ranking por experiencia
      const expRanking = await this.getLeaderboards({ category: 'experience', limit: 100 });
      const userExpIndex = expRanking.findIndex(user => user.id.toString() === userId);
      rankings.experience = userExpIndex + 1;

      return rankings;
    } catch (error) {
      console.error('Error getting user rankings:', error);
      return {
        general: 999,
        events: 999,
        experience: 999
      };
    }
  }

  // Obtener desafíos activos
  static async getActiveChallenges(userId) {
    try {
      // Desafíos básicos del sistema
      const challenges = [
        {
          id: 'weekly_events',
          name: 'Eventos Semanales',
          description: 'Crea 3 eventos esta semana',
          type: 'weekly',
          points: 200,
          progress: 0,
          target: 3,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'social_networker',
          name: 'Conectador Social',
          description: 'Únete a 5 tribus nuevas',
          type: 'ongoing',
          points: 150,
          progress: 0,
          target: 5,
          expiresAt: null
        }
      ];

      return challenges;
    } catch (error) {
      console.error('Error getting active challenges:', error);
      return [];
    }
  }

  // Unirse a un desafío
  static async joinChallenge(userId, challengeId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const userChallenges = user.challenges || [];
      if (userChallenges.includes(challengeId)) {
        throw new Error('Ya estás participando en este desafío');
      }

      user.challenges = [...userChallenges, challengeId];
      await user.save();

      return {
        success: true,
        message: 'Te has unido al desafío exitosamente',
        challengeId
      };
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  // Obtener recompensas disponibles
  static async getAvailableRewards(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const rewards = [
        {
          id: 'profile_customization',
          name: 'Personalización de Perfil',
          description: 'Desbloquea opciones avanzadas de personalización',
          type: 'feature',
          pointsRequired: 500,
          available: (user.points || 0) >= 500
        },
        {
          id: 'premium_badges',
          name: 'Badges Premium',
          description: 'Acceso a badges exclusivos',
          type: 'cosmetic',
          pointsRequired: 1000,
          available: (user.points || 0) >= 1000
        }
      ];

      return rewards;
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  // Reclamar una recompensa
  static async claimReward(userId, rewardId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const rewards = await this.getAvailableRewards(userId);
      const reward = rewards.find(r => r.id === rewardId);

      if (!reward) {
        throw new Error('Recompensa no encontrada');
      }

      if (!reward.available) {
        throw new Error('No tienes suficientes puntos para esta recompensa');
      }

      if (user.points < reward.pointsRequired) {
        throw new Error('Puntos insuficientes');
      }

      // Descontar puntos
      user.points -= reward.pointsRequired;
      
      // Agregar recompensa a usuario
      user.rewards = user.rewards || [];
      user.rewards.push({
        id: rewardId,
        claimedAt: new Date(),
        type: reward.type
      });

      await user.save();

      return {
        success: true,
        message: 'Recompensa reclamada exitosamente',
        reward,
        pointsSpent: reward.pointsRequired,
        remainingPoints: user.points
      };
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  // Obtener estadísticas de gamificación
  static async getGamificationStats(options = {}) {
    try {
      const { userId, period = 'all' } = options;
      
      let query = {};
      if (userId) {
        query._id = userId;
      }

      const users = await User.find(query);
      
      const stats = {
        totalUsers: users.length,
        averageLevel: 0,
        averageExperience: 0,
        averagePoints: 0,
        totalAchievements: 0,
        topAchievement: null,
        levelDistribution: {},
        activeUsers: 0
      };

      if (users.length > 0) {
        const totalLevel = users.reduce((sum, user) => sum + (user.level || 1), 0);
        const totalExp = users.reduce((sum, user) => sum + (user.experience || 0), 0);
        const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);

        stats.averageLevel = Math.round(totalLevel / users.length);
        stats.averageExperience = Math.round(totalExp / users.length);
        stats.averagePoints = Math.round(totalPoints / users.length);

        // Distribución de niveles
        users.forEach(user => {
          const level = user.level || 1;
          stats.levelDistribution[level] = (stats.levelDistribution[level] || 0) + 1;
        });

        // Usuarios activos (con experiencia > 0)
        stats.activeUsers = users.filter(user => (user.experience || 0) > 0).length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting gamification stats:', error);
      return {
        totalUsers: 0,
        averageLevel: 1,
        averageExperience: 0,
        averagePoints: 0,
        totalAchievements: 0,
        topAchievement: null,
        levelDistribution: {},
        activeUsers: 0
      };
    }
  }
}

module.exports = GamificationService;
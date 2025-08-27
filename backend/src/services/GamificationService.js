const { User, Achievement, Badge, Leaderboard, UserProgress } = require('../models');

class GamificationService {
  
  // Obtener progreso del usuario
  static async getUserProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const experience = user.experience || 0;
      const level = Math.floor(experience / 100) + 1;
      const nextLevelExperience = level * 100;
      const progressToNextLevel = experience % 100;
      const totalPoints = user.totalPoints || 0;

      return {
        level,
        experience,
        nextLevelExperience,
        progressToNextLevel,
        totalPoints,
        achievementCompletion: 0,
        rareBadges: 0,
        currentStreak: 0,
        availableRewards: [],
        claimedRewards: []
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Obtener logros disponibles
  static async getAvailableAchievements(userId) {
    try {
      const achievements = await Achievement.find().limit(10);
      return achievements;
    } catch (error) {
      console.error('Error getting available achievements:', error);
      return [];
    }
  }

  // Obtener ranking del usuario
  static async getUserRanking(userId) {
    try {
      return {
        global: 0,
        local: 0,
        category: 0
      };
    } catch (error) {
      console.error('Error getting user ranking:', error);
      return { global: 0, local: 0, category: 0 };
    }
  }

  // Obtener progreso de logros del usuario
  static async getUserAchievementProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      return user.achievements || [];
    } catch (error) {
      console.error('Error getting user achievement progress:', error);
      return [];
    }
  }

  // Obtener progreso de badges del usuario
  static async getUserBadgeProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      return user.badges || [];
    } catch (error) {
      console.error('Error getting user badge progress:', error);
      return [];
    }
  }

  // Obtener logros por categoría
  static async getAchievementsByCategory(category) {
    try {
      const achievements = await Achievement.find({ category }).sort({ difficulty: 1 });
      return achievements;
    } catch (error) {
      console.error('Error getting achievements by category:', error);
      return [];
    }
  }

  // Obtener badges por tipo
  static async getBadgesByType(type) {
    try {
      const badges = await Badge.find({ type }).sort({ rarity: 1 });
      return badges;
    } catch (error) {
      console.error('Error getting badges by type:', error);
      return [];
    }
  }

  // Obtener leaderboards
  static async getLeaderboards(category = 'global', limit = 10) {
    try {
      const leaderboard = await Leaderboard.findOne({ category })
        .populate('rankings.userId', 'username avatar stats')
        .sort({ 'rankings.score': -1 })
        .limit(limit);

      return leaderboard ? leaderboard.rankings : [];
    } catch (error) {
      console.error('Error getting leaderboards:', error);
      return [];
    }
  }

  // Obtener rankings del usuario
  static async getUserRankings(userId) {
    try {
      const globalRanking = await Leaderboard.findOne({ category: 'global' });
      const localRanking = await Leaderboard.findOne({ category: 'local' });
      const categoryRanking = await Leaderboard.findOne({ category: 'category' });

      const findUserRank = (leaderboard) => {
        if (!leaderboard) return 0;
        const userRank = leaderboard.rankings.find(r => r.userId.toString() === userId);
        return userRank ? userRank.rank : 0;
      };

      return {
        global: findUserRank(globalRanking),
        local: findUserRank(localRanking),
        category: findUserRank(categoryRanking)
      };
    } catch (error) {
      console.error('Error getting user rankings:', error);
      return { global: 0, local: 0, category: 0 };
    }
  }

  // Obtener desafíos disponibles
  static async getAvailableChallenges(userId) {
    try {
      return [];
    } catch (error) {
      console.error('Error getting available challenges:', error);
      return [];
    }
  }

  // Obtener misiones del usuario
  static async getUserMissions(userId) {
    try {
      return [];
    } catch (error) {
      console.error('Error getting user missions:', error);
      return [];
    }
  }

  // Obtener recompensas disponibles
  static async getAvailableRewards(userId) {
    try {
      return [];
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  // Obtener recompensas reclamadas
  static async getClaimedRewards(userId) {
    try {
      return [];
    } catch (error) {
      console.error('Error getting claimed rewards:', error);
      return [];
    }
  }

  // Obtener estadísticas de gamificación
  static async getGamificationStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      return {
        totalExperience: user.experience || 0,
        totalPoints: user.totalPoints || 0,
        achievementsEarned: (user.achievements || []).length,
        badgesEarned: (user.badges || []).length,
        currentStreak: 0,
        longestStreak: 0,
        eventsAttended: user.stats?.eventsAttended || 0,
        eventsCreated: user.stats?.eventsHosted || 0,
        tribesJoined: user.stats?.tribesJoined || 0
      };
    } catch (error) {
      console.error('Error getting gamification stats:', error);
      return null;
    }
  }
}

module.exports = GamificationService;

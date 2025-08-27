const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const Event = require('../models/Event');
const Tribe = require('../models/Tribe');
const User = require('../models/User');
const { logger } = require('../utils/logger');

/**
 *
 */
class GamificationService {
  /**
   * Calcular puntos por acción
   * @param action
   * @param metadata
   */
  static calculatePoints(action, metadata = {}) {
    const pointValues = {
      // Eventos
      event_created: 100,
      event_attended: 50,
      event_hosted: 200,
      event_shared: 10,
      event_reviewed: 25,

      // Tribus
      tribe_joined: 30,
      tribe_created: 150,
      tribe_post_created: 20,
      tribe_contribution: 15,

      // Social
      profile_completed: 50,
      photo_uploaded: 10,
      review_written: 25,
      comment_posted: 5,
      like_given: 1,
      share_made: 5,

      // Engagement
      daily_login: 5,
      weekly_active: 25,
      monthly_active: 100,
      streak_7_days: 50,
      streak_30_days: 200,

      // Especiales
      first_event: 500,
      first_tribe: 300,
      milestone_100_points: 50,
      milestone_500_points: 100,
      milestone_1000_points: 200,
      milestone_5000_points: 500,
    };

    let points = pointValues[action] || 0;

    // Multiplicadores por metadata
    if (metadata.quality === 'high') points *= 1.5;
    if (metadata.engagement > 10) points *= 1.2;
    if (metadata.isWeekend) points *= 1.1;

    return Math.round(points);
  }

  /**
   * Asignar puntos a un usuario
   * @param userId
   * @param action
   * @param metadata
   */
  static async assignPoints(userId, action, metadata = {}) {
    try {
      const points = this.calculatePoints(action, metadata);

      if (points <= 0) {
        logger.warn(`No points calculated for action: ${action}`);
        return { success: false, points: 0 };
      }

      const user = await User.findById(userId);
      if (!user) {
        logger.error(`User not found for points assignment: ${userId}`);
        return { success: false, points: 0 };
      }

      // Actualizar puntos del usuario
      const previousPoints = user.stats?.points || 0;
      const newPoints = previousPoints + points;

      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.points': points },
        $set: { 'stats.lastActivity': new Date() },
      });

      // Verificar logros
      const achievements = await this.checkAchievements(
        userId,
        newPoints,
        action
      );

      // Verificar badges
      const badges = await this.checkBadges(userId, action, metadata);

      logger.info(
        `Points assigned to user ${userId}: ${points} for action ${action}`
      );

      return {
        success: true,
        points,
        previousPoints,
        newPoints,
        achievements,
        badges,
      };
    } catch (error) {
      logger.error('Error assigning points:', error);
      return { success: false, points: 0, error: error.message };
    }
  }

  /**
   * Verificar logros del usuario
   * @param userId
   * @param totalPoints
   * @param action
   */
  static async checkAchievements(userId, totalPoints, action) {
    try {
      const user = await User.findById(userId);
      const achievements = [];

      // Logros basados en puntos
      const pointMilestones = [100, 500, 1000, 2500, 5000, 10000];

      for (const milestone of pointMilestones) {
        if (
          totalPoints >= milestone &&
          !user.achievements?.includes(`points_${milestone}`)
        ) {
          const achievement = await this.createAchievement(
            userId,
            `points_${milestone}`,
            {
              title: `${milestone} Puntos`,
              description: `Has alcanzado ${milestone} puntos`,
              points: milestone * 0.1,
            }
          );

          if (achievement) achievements.push(achievement);
        }
      }

      // Logros basados en acciones
      const actionAchievements = {
        event_created: {
          title: 'Organizador',
          description: 'Has creado tu primer evento',
        },
        tribe_created: {
          title: 'Líder de Tribu',
          description: 'Has creado tu primera tribu',
        },
        event_attended: {
          title: 'Asistente',
          description: 'Has asistido a tu primer evento',
        },
        review_written: {
          title: 'Crítico',
          description: 'Has escrito tu primera reseña',
        },
      };

      if (actionAchievements[action] && !user.achievements?.includes(action)) {
        const achievement = await this.createAchievement(userId, action, {
          title: actionAchievements[action].title,
          description: actionAchievements[action].description,
          points: 50,
        });

        if (achievement) achievements.push(achievement);
      }

      return achievements;
    } catch (error) {
      logger.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Verificar badges del usuario
   * @param userId
   * @param action
   * @param metadata
   */
  static async checkBadges(userId, action, metadata = {}) {
    try {
      const user = await User.findById(userId);
      const badges = [];

      // Badges basados en actividad
      // const activityBadges = {
      //   daily_login: {
      //     title: 'Consistente',
      //     description: 'Login diario por 7 días',
      //   },
      //   event_hosted: {
      //     title: 'Anfitrión',
      //     description: 'Has organizado 5 eventos',
      //   },
      //   tribe_contribution: {
      //     title: 'Colaborador',
      //     description: 'Has contribuido 10 veces a tribus',
      //   },
      // }; // Variable no utilizada

      // Verificar badges específicos
      if (action === 'daily_login') {
        const loginStreak = await this.calculateLoginStreak(userId);
        if (loginStreak >= 7 && !user.badges?.includes('daily_login_7')) {
          const badge = await this.createBadge(userId, 'daily_login_7', {
            title: 'Consistente',
            description: 'Login diario por 7 días',
            icon: 'calendar-check',
          });

          if (badge) badges.push(badge);
        }
      }

      if (action === 'event_hosted') {
        const hostedEvents = await Event.countDocuments({ hostId: userId });
        if (hostedEvents >= 5 && !user.badges?.includes('event_host_5')) {
          const badge = await this.createBadge(userId, 'event_host_5', {
            title: 'Anfitrión',
            description: 'Has organizado 5 eventos',
            icon: 'star',
          });

          if (badge) badges.push(badge);
        }
      }

      return badges;
    } catch (error) {
      logger.error('Error checking badges:', error);
      return [];
    }
  }

  /**
   * Crear un logro para el usuario
   * @param userId
   * @param achievementId
   * @param data
   */
  static async createAchievement(userId, achievementId, data) {
    try {
      const achievement = new Achievement({
        userId,
        achievementId,
        title: data.title,
        description: data.description,
        points: data.points,
        earnedAt: new Date(),
      });

      await achievement.save();

      // Actualizar usuario
      await User.findByIdAndUpdate(userId, {
        $push: { achievements: achievementId },
        $inc: { 'stats.points': data.points },
      });

      logger.info(`Achievement created for user ${userId}: ${achievementId}`);
      return achievement;
    } catch (error) {
      logger.error('Error creating achievement:', error);
      return null;
    }
  }

  /**
   * Crear un badge para el usuario
   * @param userId
   * @param badgeId
   * @param data
   */
  static async createBadge(userId, badgeId, data) {
    try {
      const badge = new Badge({
        userId,
        badgeId,
        title: data.title,
        description: data.description,
        icon: data.icon,
        earnedAt: new Date(),
      });

      await badge.save();

      // Actualizar usuario
      await User.findByIdAndUpdate(userId, {
        $push: { badges: badgeId },
      });

      logger.info(`Badge created for user ${userId}: ${badgeId}`);
      return badge;
    } catch (error) {
      logger.error('Error creating badge:', error);
      return null;
    }
  }

  /**
   * Calcular streak de login diario
   * @param userId
   */
  static async calculateLoginStreak(userId) {
    try {
      const user = await User.findById(userId);
      if (!user.stats?.lastActivity) return 0;

      const today = new Date();
      const lastActivity = new Date(user.stats.lastActivity);
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 1 ? (user.stats.loginStreak || 0) + 1 : 0;
    } catch (error) {
      logger.error('Error calculating login streak:', error);
      return 0;
    }
  }

  /**
   * Obtener leaderboard
   * @param limit
   * @param category
   */
  static async getLeaderboard(limit = 10, category = 'points') {
    try {
      const sortField =
        category === 'events' ? 'stats.eventsCreated' : 'stats.points';

      const users = await User.find({ 'stats.points': { $gt: 0 } })
        .select('username avatar stats.points stats.eventsCreated')
        .sort({ [sortField]: -1 })
        .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        points: user.stats?.points || 0,
        eventsCreated: user.stats?.eventsCreated || 0,
      }));
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de gamificación del usuario
   * @param userId
   */
  static async getUserStats(userId) {
    try {
      const user = await User.findById(userId)
        .populate('achievements')
        .populate('badges');

      const achievements = await Achievement.find({ userId }).sort({
        earnedAt: -1,
      });
      const badges = await Badge.find({ userId }).sort({ earnedAt: -1 });

      const nextMilestone = this.getNextMilestone(user.stats?.points || 0);
      const loginStreak = await this.calculateLoginStreak(userId);

      return {
        points: user.stats?.points || 0,
        rank: await this.getUserRank(userId),
        achievements: achievements.length,
        badges: badges.length,
        loginStreak,
        nextMilestone,
        recentAchievements: achievements.slice(0, 5),
        recentBadges: badges.slice(0, 5),
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Obtener el siguiente milestone
   * @param currentPoints
   */
  static getNextMilestone(currentPoints) {
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    const nextMilestone = milestones.find(
      milestone => milestone > currentPoints
    );

    return {
      points: nextMilestone,
      progress: nextMilestone ? (currentPoints / nextMilestone) * 100 : 100,
      remaining: nextMilestone ? nextMilestone - currentPoints : 0,
    };
  }

  /**
   * Obtener el ranking del usuario
   * @param userId
   */
  static async getUserRank(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.stats?.points) return null;

      const rank = await User.countDocuments({
        'stats.points': { $gt: user.stats.points },
      });

      return rank + 1;
    } catch (error) {
      logger.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Procesar evento de gamificación
   * @param userId
   * @param action
   * @param metadata
   */
  static async processGamificationEvent(userId, action, metadata = {}) {
    try {
      // Asignar puntos
      const pointsResult = await this.assignPoints(userId, action, metadata);

      if (!pointsResult.success) {
        return pointsResult;
      }

      // Actualizar streak de login si es necesario
      if (action === 'daily_login') {
        const loginStreak = await this.calculateLoginStreak(userId);
        await User.findByIdAndUpdate(userId, {
          $set: { 'stats.loginStreak': loginStreak },
        });
      }

      // Loggear evento
      logger.info('Gamification event processed', {
        userId,
        action,
        points: pointsResult.points,
        achievements: pointsResult.achievements.length,
        badges: pointsResult.badges.length,
      });

      return pointsResult;
    } catch (error) {
      logger.error('Error processing gamification event:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = GamificationService;

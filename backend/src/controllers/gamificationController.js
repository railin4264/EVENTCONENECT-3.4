const { User, Achievement, Badge } = require('../models');
const GamificationService = require('../services/GamificationService');
const { logger } = require('../utils/logger');

class GamificationController {
  // ==========================================
  // PERFIL DE GAMIFICACIÓN
  // ==========================================

  async getUserGamificationProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId)
        .populate('achievements')
        .populate('badges')
        .select('level experience points achievements badges stats');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const profile = {
        level: user.level || 1,
        experience: user.experience || 0,
        points: user.points || 0,
        achievements: user.achievements || [],
        badges: user.badges || [],
        stats: user.stats || {},
        nextLevel: GamificationService.calculateNextLevel(user.experience || 0),
      };

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error('Error obteniendo perfil de gamificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo perfil de gamificación',
        error: error.message,
      });
    }
  }

  // ==========================================
  // LOGROS Y ACHIEVEMENTS
  // ==========================================

  async getAchievements(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const achievements = await Achievement.find({ userId })
        .sort({ earnedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Achievement.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          achievements,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error obteniendo logros:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo logros',
        error: error.message,
      });
    }
  }

  async claimAchievement(req, res) {
    try {
      const { achievementId } = req.params;
      const userId = req.user.id;

      const achievement = await Achievement.findOne({
        _id: achievementId,
        userId,
        claimed: false,
      });

      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Logro no encontrado o ya reclamado',
        });
      }

      achievement.claimed = true;
      achievement.claimedAt = new Date();
      await achievement.save();

      // Agregar puntos al usuario
      await User.findByIdAndUpdate(userId, {
        $inc: { points: achievement.points },
      });

      res.json({
        success: true,
        message: 'Logro reclamado exitosamente',
        data: achievement,
      });
    } catch (error) {
      logger.error('Error reclamando logro:', error);
      res.status(500).json({
        success: false,
        message: 'Error reclamando logro',
        error: error.message,
      });
    }
  }

  // ==========================================
  // SISTEMA DE NIVELES
  // ==========================================

  async addExperience(req, res) {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad de experiencia inválida',
        });
      }

      const result = await GamificationService.addExperience(userId, amount);

      res.json({
        success: true,
        message: 'Experiencia agregada exitosamente',
        data: result,
      });
    } catch (error) {
      logger.error('Error agregando experiencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error agregando experiencia',
        error: error.message,
      });
    }
  }

  async getLevelInfo(req, res) {
    try {
      const { level } = req.params;
      const levelNum = parseInt(level);

      if (isNaN(levelNum) || levelNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Nivel inválido',
        });
      }

      const levelInfo = GamificationService.getLevelInfo(levelNum);

      res.json({
        success: true,
        data: levelInfo,
      });
    } catch (error) {
      logger.error('Error obteniendo información de nivel:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de nivel',
        error: error.message,
      });
    }
  }

  // ==========================================
  // SISTEMA DE BADGES
  // ==========================================

  async getBadges(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const badges = await Badge.find({ userId })
        .sort({ earnedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Badge.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          badges,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error obteniendo badges:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo badges',
        error: error.message,
      });
    }
  }

  async showcaseBadge(req, res) {
    try {
      const { badgeId } = req.params;
      const { showcase } = req.body;
      const userId = req.user.id;

      const badge = await Badge.findOne({
        _id: badgeId,
        userId,
      });

      if (!badge) {
        return res.status(404).json({
          success: false,
          message: 'Badge no encontrado',
        });
      }

      badge.showcased = showcase;
      await badge.save();

      res.json({
        success: true,
        message: `Badge ${showcase ? 'mostrado' : 'oculto'} exitosamente`,
        data: badge,
      });
    } catch (error) {
      logger.error('Error actualizando badge:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando badge',
        error: error.message,
      });
    }
  }

  // ==========================================
  // LEADERBOARDS
  // ==========================================

  async getLeaderboards(req, res) {
    try {
      const { type = 'points', limit = 10 } = req.query;

      let sortField = 'points';
      if (type === 'level') sortField = 'level';
      if (type === 'experience') sortField = 'experience';

      const leaderboard = await User.find({ isActive: true })
        .select('firstName lastName avatar level experience points')
        .sort({ [sortField]: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          type,
          leaderboard,
        },
      });
    } catch (error) {
      logger.error('Error obteniendo leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo leaderboard',
        error: error.message,
      });
    }
  }

  async getUserRankings(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('level experience points');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const rankings = {
        points: await User.countDocuments({ points: { $gt: user.points || 0 } }) + 1,
        level: await User.countDocuments({ level: { $gt: user.level || 1 } }) + 1,
        experience: await User.countDocuments({ experience: { $gt: user.experience || 0 } }) + 1,
      };

      res.json({
        success: true,
        data: rankings,
      });
    } catch (error) {
      logger.error('Error obteniendo rankings del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo rankings del usuario',
        error: error.message,
      });
    }
  }

  // ==========================================
  // CHALLENGES Y MISIONES
  // ==========================================

  async getActiveChallenges(req, res) {
    try {
      const userId = req.user.id;

      // Por ahora retornamos desafíos de ejemplo
      const challenges = [
        {
          id: 'daily_login',
          title: 'Login Diario',
          description: 'Inicia sesión durante 7 días consecutivos',
          progress: 3,
          target: 7,
          reward: { type: 'points', amount: 100 },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'create_event',
          title: 'Organizador',
          description: 'Crea tu primer evento',
          progress: 0,
          target: 1,
          reward: { type: 'badge', id: 'organizer' },
          expiresAt: null,
        },
      ];

      res.json({
        success: true,
        data: challenges,
      });
    } catch (error) {
      logger.error('Error obteniendo desafíos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo desafíos',
        error: error.message,
      });
    }
  }

  // ==========================================
  // MÉTODOS ADICIONALES - CHALLENGES Y REWARDS
  // ==========================================

  async joinChallenge(req, res) {
    try {
      const { challengeId } = req.params;
      const userId = req.user.id;

      // Por ahora retornamos éxito
      res.json({
        success: true,
        message: 'Te has unido al desafío exitosamente',
        data: {
          challengeId,
          joinedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error uniéndose al desafío:', error);
      res.status(500).json({
        success: false,
        message: 'Error uniéndose al desafío',
        error: error.message,
      });
    }
  }

  async getAvailableRewards(req, res) {
    try {
      const userId = req.user.id;

      // Por ahora retornamos recompensas de ejemplo
      const rewards = [
        {
          id: 'daily_bonus',
          title: 'Bono Diario',
          description: 'Recompensa por login diario',
          type: 'points',
          amount: 50,
          available: true,
        },
        {
          id: 'level_up',
          title: 'Subida de Nivel',
          description: 'Recompensa por subir de nivel',
          type: 'badge',
          badgeId: 'level_up',
          available: false,
        },
      ];

      res.json({
        success: true,
        data: rewards,
      });
    } catch (error) {
      logger.error('Error obteniendo recompensas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo recompensas',
        error: error.message,
      });
    }
  }

  async claimReward(req, res) {
    try {
      const { rewardId } = req.params;
      const userId = req.user.id;

      // Por ahora retornamos éxito
      res.json({
        success: true,
        message: 'Recompensa reclamada exitosamente',
        data: {
          rewardId,
          claimedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error reclamando recompensa:', error);
      res.status(500).json({
        success: false,
        message: 'Error reclamando recompensa',
        error: error.message,
      });
    }
  }

  async getGamificationStats(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('level experience points stats');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const stats = {
        level: user.level || 1,
        experience: user.experience || 0,
        points: user.points || 0,
        achievements: await Achievement.countDocuments({ userId }),
        badges: await Badge.countDocuments({ userId }),
        eventsAttended: user.stats?.eventsAttended || 0,
        eventsCreated: user.stats?.eventsCreated || 0,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message,
      });
    }
  }

  async updateGamificationSettings(req, res) {
    try {
      const userId = req.user.id;
      const { enableNotifications, showProgressBars } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.gamification': {
              enableNotifications: enableNotifications !== undefined ? enableNotifications : true,
              showProgressBars: showProgressBars !== undefined ? showProgressBars : true,
              updatedAt: new Date(),
            },
          },
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: {
          settings: updatedUser.preferences?.gamification || {},
        },
      });
    } catch (error) {
      logger.error('Error actualizando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando configuración',
        error: error.message,
      });
    }
  }
}

module.exports = new GamificationController();

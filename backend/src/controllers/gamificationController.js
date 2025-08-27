const { User, Achievement, Badge,  } = require('../models');
const GamificationService = require('../services/GamificationService');

class GamificationController {
  // ==========================================
  // PERFIL DE GAMIFICACIÓN DEL USUARIO
  // ==========================================

  async getUserGamificationProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId)
        .populate('achievements.achievementId')
        .populate('badges.badgeId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Obtener progreso actual
      const progress = await GamificationService.getUserProgress(userId);

      // Obtener logros disponibles
      const availableAchievements =
        await GamificationService.getAvailableAchievements(userId);

      // Obtener ranking del usuario
      const ranking = await GamificationService.getUserRanking(userId);

      res.json({
        success: true,
        data: {
          level: progress.level,
          experience: progress.experience,
          nextLevelExperience: progress.nextLevelExperience,
          progressToNextLevel: progress.progressToNextLevel,
          totalPoints: progress.totalPoints,

          achievements: {
            earned: user.achievements || [],
            available: availableAchievements,
            completion: progress.achievementCompletion,
          },

          badges: {
            earned: user.badges || [],
            showcased: user.showcasedBadges || [],
            rare: progress.rareBadges,
          },

          stats: {
            eventsAttended: user.stats?.eventsAttended || 0,
            eventsCreated: user.stats?.eventsHosted || 0,
            tribesJoined: user.stats?.tribesJoined || 0,
            socialScore: user.stats?.socialScore || 0,
            streak: progress.currentStreak,
          },

          ranking: {
            global: ranking.global,
            local: ranking.local,
            category: ranking.category,
          },

          rewards: {
            available: progress.availableRewards,
            claimed: progress.claimedRewards,
          },
        },
      });
    } catch (error) {
      console.error('Error getting user gamification profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // LOGROS Y ACHIEVEMENTS
  // ==========================================

  async getAchievements(req, res) {
    try {
      const userId = req.user.id;
      const { category, status = 'all' } = req.query;

      const filter = {};
      if (category) filter.category = category;

      const achievements = await Achievement.find(filter).sort({
        difficulty: 1,
        order: 1,
      });

      // Obtener progreso del usuario para cada logro
      const userProgress =
        await GamificationService.getUserAchievementProgress(userId);

      const achievementsWithProgress = achievements.map(achievement => {
        const progress = userProgress[achievement._id] || {
          progress: 0,
          completed: false,
        };

        return {
          ...achievement.toObject(),
          userProgress: progress.progress,
          userCompleted: progress.completed,
          completedAt: progress.completedAt,
          canClaim:
            progress.progress >= achievement.requirements.target &&
            !progress.completed,
        };
      });

      // Filtrar por estado si se especifica
      let filteredAchievements = achievementsWithProgress;
      if (status !== 'all') {
        filteredAchievements = achievementsWithProgress.filter(a => {
          switch (status) {
            case 'completed':
              return a.userCompleted;
            case 'available':
              return !a.userCompleted && a.userProgress > 0;
            case 'locked':
              return a.userProgress === 0;
            default:
              return true;
          }
        });
      }

      res.json({
        success: true,
        data: {
          achievements: filteredAchievements,
          categories: await GamificationService.getAchievementCategories(),
          summary: {
            total: achievements.length,
            completed: achievementsWithProgress.filter(a => a.userCompleted)
              .length,
            inProgress: achievementsWithProgress.filter(
              a => a.userProgress > 0 && !a.userCompleted
            ).length,
            available: achievementsWithProgress.filter(a => a.canClaim).length,
          },
        },
      });
    } catch (error) {
      console.error('Error getting achievements:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async claimAchievement(req, res) {
    try {
      const userId = req.user.id;
      const { achievementId } = req.params;

      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Logro no encontrado',
        });
      }

      // Verificar si el usuario puede reclamar el logro
      const canClaim = await GamificationService.canClaimAchievement(
        userId,
        achievementId
      );
      if (!canClaim.success) {
        return res.status(400).json({
          success: false,
          message: canClaim.message,
        });
      }

      // Reclamar el logro
      const result = await GamificationService.claimAchievement(
        userId,
        achievementId
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Logro reclamado exitosamente',
          data: {
            achievement: result.achievement,
            rewards: result.rewards,
            newLevel: result.newLevel,
            unlockedFeatures: result.unlockedFeatures,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // SISTEMA DE NIVELES Y EXPERIENCIA
  // ==========================================

  async addExperience(req, res) {
    try {
      const userId = req.user.id;
      const { amount, source, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad de experiencia inválida',
        });
      }

      const result = await GamificationService.addExperience(userId, {
        amount,
        source,
        description,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Experiencia agregada exitosamente',
        data: {
          experienceAdded: amount,
          newTotalExperience: result.totalExperience,
          currentLevel: result.currentLevel,
          levelUp: result.levelUp,
          newBadges: result.newBadges,
          newAchievements: result.newAchievements,
        },
      });
    } catch (error) {
      console.error('Error adding experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async getLevelInfo(req, res) {
    try {
      const { level } = req.params;
      const levelNumber = parseInt(level);

      if (isNaN(levelNumber) || levelNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'Nivel inválido',
        });
      }

      const levelInfo = await GamificationService.getLevelInfo(levelNumber);

      res.json({
        success: true,
        data: levelInfo,
      });
    } catch (error) {
      console.error('Error getting level info:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // SISTEMA DE BADGES
  // ==========================================

  async getBadges(req, res) {
    try {
      const userId = req.user.id;
      const { category, rarity } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (rarity) filter.rarity = rarity;

      const badges = await Badge.find(filter).sort({ rarity: 1, name: 1 });

      // Obtener badges del usuario
      const user = await User.findById(userId).select('badges showcasedBadges');
      const userBadges = user.badges || [];
      const showcasedBadges = user.showcasedBadges || [];

      const badgesWithStatus = badges.map(badge => {
        const userBadge = userBadges.find(
          ub => ub.badgeId.toString() === badge._id.toString()
        );

        return {
          ...badge.toObject(),
          earned: !!userBadge,
          earnedAt: userBadge?.earnedAt,
          showcased: showcasedBadges.includes(badge._id.toString()),
          count: userBadge?.count || 0,
        };
      });

      res.json({
        success: true,
        data: {
          badges: badgesWithStatus,
          summary: {
            total: badges.length,
            earned: badgesWithStatus.filter(b => b.earned).length,
            showcased: showcasedBadges.length,
            rare: badgesWithStatus.filter(
              b => b.earned && ['legendary', 'epic'].includes(b.rarity)
            ).length,
          },
        },
      });
    } catch (error) {
      console.error('Error getting badges:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async showcaseBadge(req, res) {
    try {
      const userId = req.user.id;
      const { badgeId } = req.params;
      const { showcase = true } = req.body;

      const result = await GamificationService.showcaseBadge(
        userId,
        badgeId,
        showcase
      );

      if (result.success) {
        res.json({
          success: true,
          message: showcase
            ? 'Badge agregado al showcase'
            : 'Badge removido del showcase',
          data: {
            showcasedBadges: result.showcasedBadges,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error showcasing badge:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // LEADERBOARDS
  // ==========================================

  async getLeaderboards(req, res) {
    try {
      const {
        type = 'global',
        period = 'all_time',
        category,
        limit = 50,
        page = 1,
      } = req.query;

      const leaderboards = await GamificationService.getLeaderboards({
        type,
        period,
        category,
        limit: parseInt(limit),
        page: parseInt(page),
      });

      res.json({
        success: true,
        data: leaderboards,
      });
    } catch (error) {
      console.error('Error getting leaderboards:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async getUserRankings(req, res) {
    try {
      const userId = req.user.id;

      const rankings = await GamificationService.getUserRankings(userId);

      res.json({
        success: true,
        data: rankings,
      });
    } catch (error) {
      console.error('Error getting user rankings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // CHALLENGES Y MISIONES
  // ==========================================

  async getActiveChallenges(req, res) {
    try {
      const userId = req.user.id;

      const challenges = await GamificationService.getActiveChallenges(userId);

      res.json({
        success: true,
        data: {
          challenges,
          summary: {
            active: challenges.filter(c => c.status === 'active').length,
            completed: challenges.filter(c => c.status === 'completed').length,
            available: challenges.filter(c => c.status === 'available').length,
          },
        },
      });
    } catch (error) {
      console.error('Error getting active challenges:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async joinChallenge(req, res) {
    try {
      const userId = req.user.id;
      const { challengeId } = req.params;

      const result = await GamificationService.joinChallenge(
        userId,
        challengeId
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Te has unido al desafío exitosamente',
          data: {
            challenge: result.challenge,
            progress: result.progress,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // REWARDS Y RECOMPENSAS
  // ==========================================

  async getAvailableRewards(req, res) {
    try {
      const userId = req.user.id;

      const rewards = await GamificationService.getAvailableRewards(userId);

      res.json({
        success: true,
        data: rewards,
      });
    } catch (error) {
      console.error('Error getting available rewards:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async claimReward(req, res) {
    try {
      const userId = req.user.id;
      const { rewardId } = req.params;

      const result = await GamificationService.claimReward(userId, rewardId);

      if (result.success) {
        res.json({
          success: true,
          message: 'Recompensa reclamada exitosamente',
          data: {
            reward: result.reward,
            newBalance: result.newBalance,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // ESTADÍSTICAS Y ANALYTICS
  // ==========================================

  async getGamificationStats(req, res) {
    try {
      const { period = '30d', global = false } = req.query;
      const userId = global ? null : req.user.id;

      const stats = await GamificationService.getGamificationStats({
        userId,
        period,
        global: global === 'true',
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting gamification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // CONFIGURACIÓN DE GAMIFICACIÓN
  // ==========================================

  async updateGamificationSettings(req, res) {
    try {
      const userId = req.user.id;
      const {
        enableNotifications,
        showProgressBars,
        participateInLeaderboards,
        shareMilestones,
        difficulty,
      } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.gamification': {
              enableNotifications:
                enableNotifications !== undefined ? enableNotifications : true,
              showProgressBars:
                showProgressBars !== undefined ? showProgressBars : true,
              participateInLeaderboards:
                participateInLeaderboards !== undefined
                  ? participateInLeaderboards
                  : true,
              shareMilestones:
                shareMilestones !== undefined ? shareMilestones : false,
              difficulty: difficulty || 'normal',
              updatedAt: new Date(),
            },
          },
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Configuración de gamificación actualizada',
        data: {
          settings: updatedUser.preferences.gamification,
        },
      });
    } catch (error) {
      console.error('Error updating gamification settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}

module.exports = new GamificationController();

const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');
const { rateLimits } = require('../middleware/advancedSecurity');

// ==========================================
// PERFIL DE GAMIFICACIÓN
// ==========================================

// Obtener perfil de gamificación del usuario
router.get(
  '/profile',
  protect,
  rateLimits.general,
  gamificationController.getUserGamificationProfile
);

// ==========================================
// LOGROS Y ACHIEVEMENTS
// ==========================================

// Obtener logros
router.get(
  '/achievements',
  protect,
  rateLimits.general,
  gamificationController.getAchievements
);

// Reclamar logro
router.post(
  '/achievements/:achievementId/claim',
  protect,
  rateLimits.actions,
  gamificationController.claimAchievement
);

// ==========================================
// SISTEMA DE NIVELES
// ==========================================

// Agregar experiencia (para testing/admin)
router.post(
  '/experience',
  protect,
  rateLimits.actions,
  gamificationController.addExperience
);

// Obtener información de nivel
router.get(
  '/levels/:level',
  protect,
  rateLimits.general,
  gamificationController.getLevelInfo
);

// ==========================================
// SISTEMA DE BADGES
// ==========================================

// Obtener badges
router.get(
  '/badges',
  protect,
  rateLimits.general,
  gamificationController.getBadges
);

// Mostrar/ocultar badge en perfil
router.put(
  '/badges/:badgeId/showcase',
  protect,
  rateLimits.actions,
  gamificationController.showcaseBadge
);

// ==========================================
// LEADERBOARDS
// ==========================================

// Obtener leaderboards
router.get(
  '/leaderboards',
  protect,
  rateLimits.general,
  gamificationController.getLeaderboards
);

// Obtener rankings del usuario
router.get(
  '/rankings',
  protect,
  rateLimits.general,
  gamificationController.getUserRankings
);

// ==========================================
// CHALLENGES Y MISIONES
// ==========================================

// Obtener desafíos activos
router.get(
  '/challenges',
  protect,
  rateLimits.general,
  gamificationController.getActiveChallenges
);

// Unirse a desafío
router.post(
  '/challenges/:challengeId/join',
  protect,
  rateLimits.actions,
  gamificationController.joinChallenge
);

// ==========================================
// REWARDS Y RECOMPENSAS
// ==========================================

// Obtener recompensas disponibles
router.get(
  '/rewards',
  protect,
  rateLimits.general,
  gamificationController.getAvailableRewards
);

// Reclamar recompensa
router.post(
  '/rewards/:rewardId/claim',
  protect,
  rateLimits.actions,
  gamificationController.claimReward
);

// ==========================================
// ESTADÍSTICAS Y ANALYTICS
// ==========================================

// Obtener estadísticas de gamificación
router.get(
  '/stats',
  protect,
  rateLimits.general,
  gamificationController.getGamificationStats
);

// ==========================================
// CONFIGURACIÓN
// ==========================================

// Actualizar configuración de gamificación
router.put(
  '/settings',
  protect,
  rateLimits.general,
  gamificationController.updateGamificationSettings
);

module.exports = router;

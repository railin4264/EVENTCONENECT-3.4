const express = require('express');

const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimits = require('../middleware/rateLimitMiddleware');

// ==========================================
// PERFIL DE GAMIFICACIÓN
// ==========================================

// Obtener perfil de gamificación del usuario
router.get(
  '/profile',
  authMiddleware,
  rateLimits.general,
  gamificationController.getUserGamificationProfile
);

// ==========================================
// LOGROS Y ACHIEVEMENTS
// ==========================================

// Obtener logros
router.get(
  '/achievements',
  authMiddleware,
  rateLimits.general,
  gamificationController.getAchievements
);

// Reclamar logro
router.post(
  '/achievements/:achievementId/claim',
  authMiddleware,
  rateLimits.actions,
  gamificationController.claimAchievement
);

// ==========================================
// SISTEMA DE NIVELES
// ==========================================

// Agregar experiencia (para testing/admin)
router.post(
  '/experience',
  authMiddleware,
  rateLimits.actions,
  gamificationController.addExperience
);

// Obtener información de nivel
router.get(
  '/levels/:level',
  authMiddleware,
  rateLimits.general,
  gamificationController.getLevelInfo
);

// ==========================================
// SISTEMA DE BADGES
// ==========================================

// Obtener badges
router.get(
  '/badges',
  authMiddleware,
  rateLimits.general,
  gamificationController.getBadges
);

// Mostrar/ocultar badge en perfil
router.put(
  '/badges/:badgeId/showcase',
  authMiddleware,
  rateLimits.actions,
  gamificationController.showcaseBadge
);

// ==========================================
// LEADERBOARDS
// ==========================================

// Obtener leaderboards
router.get(
  '/leaderboards',
  authMiddleware,
  rateLimits.general,
  gamificationController.getLeaderboards
);

// Obtener rankings del usuario
router.get(
  '/rankings',
  authMiddleware,
  rateLimits.general,
  gamificationController.getUserRankings
);

// ==========================================
// CHALLENGES Y MISIONES
// ==========================================

// Obtener desafíos activos
router.get(
  '/challenges',
  authMiddleware,
  rateLimits.general,
  gamificationController.getActiveChallenges
);

// Unirse a desafío
router.post(
  '/challenges/:challengeId/join',
  authMiddleware,
  rateLimits.actions,
  gamificationController.joinChallenge
);

// ==========================================
// REWARDS Y RECOMPENSAS
// ==========================================

// Obtener recompensas disponibles
router.get(
  '/rewards',
  authMiddleware,
  rateLimits.general,
  gamificationController.getAvailableRewards
);

// Reclamar recompensa
router.post(
  '/rewards/:rewardId/claim',
  authMiddleware,
  rateLimits.actions,
  gamificationController.claimReward
);

// ==========================================
// ESTADÍSTICAS Y ANALYTICS
// ==========================================

// Obtener estadísticas de gamificación
router.get(
  '/stats',
  authMiddleware,
  rateLimits.general,
  gamificationController.getGamificationStats
);

// ==========================================
// CONFIGURACIÓN
// ==========================================

// Actualizar configuración de gamificación
router.put(
  '/settings',
  authMiddleware,
  rateLimits.general,
  gamificationController.updateGamificationSettings
);

module.exports = router;

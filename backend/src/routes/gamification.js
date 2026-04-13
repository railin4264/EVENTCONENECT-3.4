const express = require('express');

const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimitMiddleware');

// ==========================================
// PERFIL DE GAMIFICACIÓN
// ==========================================

// Obtener perfil de gamificación del usuario
router.get(
  '/profile',
  authenticateToken,
  generalLimiter,
  gamificationController.getUserGamificationProfile
);

// ==========================================
// LOGROS Y ACHIEVEMENTS
// ==========================================

// Obtener logros
router.get(
  '/achievements',
  authenticateToken,
  generalLimiter,
  gamificationController.getAchievements
);

// Reclamar logro
router.post(
  '/achievements/:achievementId/claim',
  authenticateToken,
  generalLimiter,
  gamificationController.claimAchievement
);

// ==========================================
// SISTEMA DE NIVELES
// ==========================================

// Agregar experiencia (para testing/admin)
router.post(
  '/experience',
  authenticateToken,
  generalLimiter,
  gamificationController.addExperience
);

// Obtener información de nivel
router.get(
  '/levels/:level',
  authenticateToken,
  generalLimiter,
  gamificationController.getLevelInfo
);

// ==========================================
// SISTEMA DE BADGES
// ==========================================

// Obtener badges
router.get(
  '/badges',
  authenticateToken,
  generalLimiter,
  gamificationController.getBadges
);

// Mostrar/ocultar badge en perfil
router.put(
  '/badges/:badgeId/showcase',
  authenticateToken,
  generalLimiter,
  gamificationController.showcaseBadge
);

// ==========================================
// LEADERBOARDS
// ==========================================

// Obtener leaderboards
router.get(
  '/leaderboards',
  authenticateToken,
  generalLimiter,
  gamificationController.getLeaderboards
);

// Obtener rankings del usuario
router.get(
  '/rankings',
  authenticateToken,
  generalLimiter,
  gamificationController.getUserRankings
);

// ==========================================
// CHALLENGES Y MISIONES
// ==========================================

// Obtener desafíos activos
router.get(
  '/challenges',
  authenticateToken,
  generalLimiter,
  gamificationController.getActiveChallenges
);

// Unirse a desafío
router.post(
  '/challenges/:challengeId/join',
  authenticateToken,
  generalLimiter,
  gamificationController.joinChallenge
);

// ==========================================
// REWARDS Y RECOMPENSAS
// ==========================================

// Obtener recompensas disponibles
router.get(
  '/rewards',
  authenticateToken,
  generalLimiter,
  gamificationController.getAvailableRewards
);

// Reclamar recompensa
router.post(
  '/rewards/:rewardId/claim',
  authenticateToken,
  generalLimiter,
  gamificationController.claimReward
);

// ==========================================
// ESTADÍSTICAS Y ANALYTICS
// ==========================================

// Obtener estadísticas de gamificación
router.get(
  '/stats',
  authenticateToken,
  generalLimiter,
  gamificationController.getGamificationStats
);

// ==========================================
// CONFIGURACIÓN
// ==========================================

// Actualizar configuración de gamificación
router.put(
  '/settings',
  authenticateToken,
  generalLimiter,
  gamificationController.updateGamificationSettings
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Middleware
const { protect: authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Services
const GamificationService = require('../services/gamificationService');
const AnalyticsService = require('../services/analyticsService');

// Rate limiting
const gamificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requests por minuto
  message: { error: 'Demasiadas solicitudes de gamificación' }
});

/**
 * @swagger
 * /api/gamification/profile:
 *   get:
 *     summary: Obtiene perfil de gamificación del usuario
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile',
  gamificationLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      const profile = await GamificationService.getUserGamificationProfile(userId);
      
      res.json({
        success: true,
        data: profile
      });
      
    } catch (error) {
      console.error('Error obteniendo perfil de gamificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/gamification/achievements:
 *   get:
 *     summary: Obtiene logros disponibles y desbloqueados
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [events, social, creation, engagement]
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *           enum: [common, rare, epic, legendary]
 */
router.get('/achievements',
  gamificationLimiter,
  authenticateToken,
  [
    query('category').optional().isIn(['events', 'social', 'creation', 'engagement']),
    query('rarity').optional().isIn(['common', 'rare', 'epic', 'legendary']),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { category, rarity } = req.query;
      
      const achievements = await GamificationService.getUserAchievements(userId, {
        category,
        rarity
      });
      
      res.json({
        success: true,
        data: achievements
      });
      
    } catch (error) {
      console.error('Error obteniendo logros:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: Obtiene leaderboard de usuarios
 *     tags: [Gamification]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [week, month, all]
 *           default: all
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 10
 *           maximum: 100
 *           default: 50
 */
router.get('/leaderboard',
  gamificationLimiter,
  query('timeframe').optional().isIn(['week', 'month', 'all']),
  query('limit').optional().isInt({ min: 10, max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { timeframe = 'all', limit = 50 } = req.query;
      const userId = req.user?.id;
      
      const leaderboard = await GamificationService.getLeaderboard({
        timeframe,
        limit: parseInt(limit),
        includeCurrentUser: !!userId,
        currentUserId: userId
      });
      
      res.json({
        success: true,
        data: leaderboard
      });
      
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/gamification/action:
 *   post:
 *     summary: Registra una acción del usuario para gamificación
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [attended_event, created_event, joined_tribe, early_join, shared_event]
 *               data:
 *                 type: object
 */
router.post('/action',
  gamificationLimiter,
  authenticateToken,
  body('action').isIn(['attended_event', 'created_event', 'joined_tribe', 'early_join', 'shared_event'])
    .withMessage('Acción inválida'),
  body('data').optional().isObject(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { action, data } = req.body;
      
      const result = await GamificationService.processUserAction(userId, action, data);
      
      // Registrar para analytics
      await AnalyticsService.trackEvent(userId, 'gamification_action', {
        action,
        pointsEarned: result.pointsEarned,
        achievementsUnlocked: result.newAchievements.length,
        newLevel: result.levelUp ? result.newLevel : null
      });
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error procesando acción de gamificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/gamification/progress/{achievementId}:
 *   get:
 *     summary: Obtiene progreso de un logro específico
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/progress/:achievementId',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { achievementId } = req.params;
      
      const progress = await GamificationService.getAchievementProgress(userId, achievementId);
      
      res.json({
        success: true,
        data: progress
      });
      
    } catch (error) {
      console.error('Error obteniendo progreso de logro:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/gamification/stats/global:
 *   get:
 *     summary: Obtiene estadísticas globales de gamificación
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/global',
  authenticateToken,
  async (req, res) => {
    try {
      const globalStats = await GamificationService.getGlobalGamificationStats();
      
      res.json({
        success: true,
        data: globalStats
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas globales:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/gamification/simulate:
 *   post:
 *     summary: Simula acciones para testing (solo desarrollo)
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/simulate',
    authenticateToken,
    body('action').isString().notEmpty(),
    body('data').optional().isObject(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const { action, data } = req.body;
        
        const result = await GamificationService.simulateUserAction(userId, action, data);
        
        res.json({
          success: true,
          data: {
            ...result,
            message: 'Acción simulada exitosamente'
          }
        });
        
      } catch (error) {
        console.error('Error simulando acción:', error);
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor'
        });
      }
    }
  );
}

module.exports = router;
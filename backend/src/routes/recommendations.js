const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Middleware
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Services
const RecommendationService = require('../services/recommendationService');
const AnalyticsService = require('../services/analyticsService');

// Rate limiting
const recommendationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por minuto
  message: { error: 'Demasiadas solicitudes de recomendaciones' }
});

/**
 * @swagger
 * /api/recommendations/personalized:
 *   get:
 *     summary: Obtiene recomendaciones personalizadas para el usuario
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeReasons
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Recomendaciones personalizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ScoredEvent'
 *                     context:
 *                       type: object
 *                     generatedAt:
 *                       type: string
 */
router.get('/personalized', 
  recommendationLimiter,
  authenticateToken,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit debe ser entre 1 y 50'),
    query('category').optional().isString().trim(),
    query('includeReasons').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, category, includeReasons = false } = req.query;
      
      // Obtener contexto del usuario
      const userContext = await RecommendationService.getUserContext(userId);
      
      // Generar recomendaciones
      const recommendations = await RecommendationService.generatePersonalizedRecommendations(
        userId,
        {
          limit: parseInt(limit),
          category,
          includeReasons: includeReasons === 'true',
          context: userContext
        }
      );
      
      // Registrar para analytics
      await AnalyticsService.trackEvent(userId, 'recommendations_requested', {
        limit,
        category,
        resultCount: recommendations.length
      });
      
      res.json({
        success: true,
        data: {
          recommendations,
          context: userContext,
          generatedAt: new Date().toISOString(),
          algorithm: 'v2.0'
        }
      });
      
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/recommendations/trending:
 *   get:
 *     summary: Obtiene eventos trending
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: timeWindow
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d]
 *           default: 24h
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           enum: [local, city, global]
 *           default: city
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 */
router.get('/trending',
  recommendationLimiter,
  [
    query('timeWindow').optional().isIn(['1h', '6h', '24h', '7d']),
    query('location').optional().isIn(['local', 'city', 'global']),
    query('category').optional().isString().trim()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { timeWindow = '24h', location = 'city', category } = req.query;
      const userId = req.user?.id;
      
      const trendingEvents = await RecommendationService.getTrendingEvents({
        timeWindow,
        location,
        category,
        userId // Para personalización si está autenticado
      });
      
      // Registrar para analytics
      if (userId) {
        await AnalyticsService.trackEvent(userId, 'trending_viewed', {
          timeWindow,
          location,
          category,
          resultCount: trendingEvents.length
        });
      }
      
      res.json({
        success: true,
        data: {
          events: trendingEvents,
          metrics: {
            timeWindow,
            location,
            category,
            totalTrending: trendingEvents.length,
            lastUpdated: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo trending:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/recommendations/similar/{eventId}:
 *   get:
 *     summary: Obtiene eventos similares a uno específico
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 */
router.get('/similar/:eventId',
  [
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { limit = 5 } = req.query;
      const userId = req.user?.id;
      
      const similarEvents = await RecommendationService.getSimilarEvents(
        eventId,
        parseInt(limit),
        userId
      );
      
      res.json({
        success: true,
        data: {
          events: similarEvents,
          baseEventId: eventId,
          algorithm: 'similarity_v1.0'
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo eventos similares:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/recommendations/feedback:
 *   post:
 *     summary: Envía feedback sobre recomendaciones para mejorar el algoritmo
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [liked, disliked, joined, ignored, shared]
 *               context:
 *                 type: object
 */
router.post('/feedback',
  authenticateToken,
  [
    body('eventId').isString().notEmpty().withMessage('Event ID es requerido'),
    body('action').isIn(['liked', 'disliked', 'joined', 'ignored', 'shared']).withMessage('Acción inválida'),
    body('context').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { eventId, action, context } = req.body;
      
      // Registrar feedback para mejorar algoritmo
      await RecommendationService.recordFeedback(userId, eventId, action, context);
      
      // Actualizar perfil de usuario si es necesario
      if (action === 'joined') {
        await RecommendationService.updateUserProfile(userId, { lastEventJoined: eventId });
      }
      
      res.json({
        success: true,
        data: {
          message: 'Feedback registrado exitosamente',
          action,
          eventId
        }
      });
      
    } catch (error) {
      console.error('Error registrando feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/recommendations/stats:
 *   get:
 *     summary: Obtiene estadísticas del sistema de recomendaciones
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 */
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      const stats = await RecommendationService.getRecommendationStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

module.exports = router;
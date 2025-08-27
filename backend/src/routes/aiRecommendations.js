const express = require('express');

const router = express.Router();
const aiRecommendationsController = require('../controllers/aiRecommendationsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimitMiddleware');

// ==========================================
// RECOMENDACIONES PERSONALIZADAS
// ==========================================

// Obtener recomendaciones personalizadas
router.get(
  '/recommendations',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.getPersonalizedRecommendations
);

// Enviar feedback de recomendaciones
router.post(
  '/feedback',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.submitRecommendationFeedback
);

// ==========================================
// CONTENIDO TRENDING
// ==========================================

// Obtener contenido trending
router.get(
  '/trending',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.getTrendingRecommendations
);

// ==========================================
// ELEMENTOS SIMILARES
// ==========================================

// Obtener elementos similares
router.get(
  '/similar',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.getSimilarItems
);

// ==========================================
// INSIGHTS Y ANALYTICS
// ==========================================

// Obtener insights de recomendaciones
router.get(
  '/insights',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.getRecommendationInsights
);

// ==========================================
// CONFIGURACIÓN DE IA
// ==========================================

// Actualizar preferencias de IA
router.put(
  '/preferences',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.updateAIPreferences
);

// ==========================================
// NOTIFICACIONES INTELIGENTES
// ==========================================

// Obtener notificaciones inteligentes
router.get(
  '/smart-notifications',
  authenticateToken,
  rateLimits.ai,
  aiRecommendationsController.getSmartNotifications
);

// ==========================================
// WEBHOOK PARA ACTUALIZACIONES DE ML
// ==========================================

// Webhook para actualizaciones del modelo de ML
router.post(
  '/ml-update',
  rateLimits.webhook,
  aiRecommendationsController.handleMLModelUpdate
);

module.exports = router;

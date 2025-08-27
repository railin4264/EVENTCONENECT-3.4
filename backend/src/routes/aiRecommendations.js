const express = require('express');

const router = express.Router();
const aiRecommendationsController = require('../controllers/aiRecommendationsController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimits = require('../middleware/rateLimitMiddleware');

// ==========================================
// RECOMENDACIONES PERSONALIZADAS
// ==========================================

// Obtener recomendaciones personalizadas
router.get(
  '/recommendations',
  authMiddleware,
  rateLimits.ai,
  aiRecommendationsController.getPersonalizedRecommendations
);

// Enviar feedback de recomendaciones
router.post(
  '/feedback',
  authMiddleware,
  rateLimits.ai,
  aiRecommendationsController.submitRecommendationFeedback
);

// ==========================================
// CONTENIDO TRENDING
// ==========================================

// Obtener contenido trending
router.get(
  '/trending',
  authMiddleware,
  rateLimits.ai,
  aiRecommendationsController.getTrendingRecommendations
);

// ==========================================
// ELEMENTOS SIMILARES
// ==========================================

// Obtener elementos similares
router.get(
  '/similar',
  authMiddleware,
  rateLimits.ai,
  aiRecommendationsController.getSimilarItems
);

// ==========================================
// INSIGHTS Y ANALYTICS
// ==========================================

// Obtener insights de recomendaciones
router.get(
  '/insights',
  authMiddleware,
  rateLimits.ai,
  aiRecommendationsController.getRecommendationInsights
);

// ==========================================
// CONFIGURACIÓN DE IA
// ==========================================

// Actualizar preferencias de IA
router.put(
  '/preferences',
  authMiddleware,
  rateLimits.ai,
  aiRecommendationsController.updateAIPreferences
);

// ==========================================
// NOTIFICACIONES INTELIGENTES
// ==========================================

// Obtener notificaciones inteligentes
router.get(
  '/smart-notifications',
  authMiddleware,
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

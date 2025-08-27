const express = require('express');
const router = express.Router();
const aiRecommendationsController = require('../controllers/aiRecommendationsController');
const { protect } = require('../middleware/auth');
const { rateLimits } = require('../middleware/advancedSecurity');

// ==========================================
// RECOMENDACIONES PERSONALIZADAS
// ==========================================

// Obtener recomendaciones personalizadas
router.get(
  '/recommendations',
  protect,
  rateLimits.ai,
  aiRecommendationsController.getPersonalizedRecommendations
);

// Enviar feedback de recomendaciones
router.post(
  '/feedback',
  protect,
  rateLimits.ai,
  aiRecommendationsController.submitRecommendationFeedback
);

// ==========================================
// CONTENIDO TRENDING
// ==========================================

// Obtener contenido trending
router.get(
  '/trending',
  protect,
  rateLimits.ai,
  aiRecommendationsController.getTrendingRecommendations
);

// ==========================================
// ELEMENTOS SIMILARES
// ==========================================

// Obtener elementos similares
router.get(
  '/similar',
  protect,
  rateLimits.ai,
  aiRecommendationsController.getSimilarItems
);

// ==========================================
// INSIGHTS Y ANALYTICS
// ==========================================

// Obtener insights de recomendaciones
router.get(
  '/insights',
  protect,
  rateLimits.ai,
  aiRecommendationsController.getRecommendationInsights
);

// ==========================================
// CONFIGURACIÓN DE IA
// ==========================================

// Actualizar preferencias de IA
router.put(
  '/preferences',
  protect,
  rateLimits.ai,
  aiRecommendationsController.updateAIPreferences
);

// ==========================================
// NOTIFICACIONES INTELIGENTES
// ==========================================

// Obtener notificaciones inteligentes
router.get(
  '/smart-notifications',
  protect,
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

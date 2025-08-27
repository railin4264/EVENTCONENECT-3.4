const express = require('express');
const router = express.Router();
const demandAnalyticsController = require('../controllers/demandAnalyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimitMiddleware');

// ==========================================
// ANALYTICS DE DEMANDA
// ==========================================

// Obtener analytics de demanda general
router.get(
  '/demand',
  authenticateToken,
  generalLimiter,
  demandAnalyticsController.getDemandAnalytics
);

// Obtener analytics de demanda por categoría
router.get(
  '/demand/category/:categoryId',
  authenticateToken,
  generalLimiter,
  demandAnalyticsController.getCategoryDemandAnalytics
);

// Obtener analytics de demanda por ubicación
router.get(
  '/demand/location',
  authenticateToken,
  generalLimiter,
  demandAnalyticsController.getLocationDemandAnalytics
);

// Obtener analytics de demanda por período
router.get(
  '/demand/period',
  authenticateToken,
  generalLimiter,
  demandAnalyticsController.getPeriodDemandAnalytics
);

// Obtener predicciones de demanda
router.get(
  '/demand/predictions',
  authenticateToken,
  generalLimiter,
  demandAnalyticsController.getDemandPredictions
);

// Obtener tendencias de demanda
router.get(
  '/demand/trends',
  authenticateToken,
  generalLimiter,
  demandAnalyticsController.getDemandTrends
);

module.exports = router;
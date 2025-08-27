const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const rateLimits = require('../middleware/rateLimitMiddleware');

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

// Obtener eventos públicos
router.get(
  '/',
  rateLimits.general,
  eventController.getEvents
);

// Obtener eventos destacados (featured)
router.get(
  '/featured',
  rateLimits.general,
  eventController.getFeaturedEvents
);

// Obtener evento por ID (público)
router.get(
  '/:eventId',
  rateLimits.general,
  eventController.getEventById
);

module.exports = router;
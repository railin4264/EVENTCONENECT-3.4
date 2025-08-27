const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { rateLimits } = require('../middleware/advancedSecurity');

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

// Obtener eventos públicos
router.get(
  '/',
  rateLimits.general,
  eventController.getEvents
);

// Obtener evento por ID (público)
router.get(
  '/:eventId',
  rateLimits.general,
  eventController.getEventById
);

// ==========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ==========================================

// Crear evento
router.post(
  '/',
  protect,
  rateLimits.creation,
  upload.uploadMultiple('images', 5), // Máximo 5 imágenes
  eventController.createEvent
);

// Actualizar evento
router.put(
  '/:eventId',
  protect,
  rateLimits.modification,
  upload.uploadMultiple('images', 5),
  eventController.updateEvent
);

// ==========================================
// RUTAS DE PARTICIPACIÓN
// ==========================================

// Unirse a evento
router.post(
  '/:eventId/join',
  protect,
  rateLimits.actions,
  eventController.joinEvent
);

// Marcar interés en evento
router.post(
  '/:eventId/interested',
  protect,
  rateLimits.actions,
  eventController.markInterested
);

module.exports = router;
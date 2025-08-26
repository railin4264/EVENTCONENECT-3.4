const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
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

// Buscar eventos
router.get(
  '/search',
  rateLimits.search,
  eventController.searchEvents
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
  authMiddleware,
  rateLimits.creation,
  upload.array('images', 5), // Máximo 5 imágenes
  eventController.createEvent
);

// Guardar borrador
router.post(
  '/draft',
  authMiddleware,
  rateLimits.creation,
  eventController.saveDraft
);

// Obtener eventos recomendados
router.get(
  '/recommended',
  authMiddleware,
  rateLimits.general,
  eventController.getRecommendedEvents
);

// Actualizar evento
router.put(
  '/:eventId',
  authMiddleware,
  rateLimits.modification,
  upload.array('images', 5),
  eventController.updateEvent
);

// Eliminar evento
router.delete(
  '/:eventId',
  authMiddleware,
  rateLimits.modification,
  eventController.deleteEvent
);

// ==========================================
// RUTAS DE PARTICIPACIÓN
// ==========================================

// Unirse a evento
router.post(
  '/:eventId/join',
  authMiddleware,
  rateLimits.actions,
  eventController.joinEvent
);

// Salir de evento
router.delete(
  '/:eventId/leave',
  authMiddleware,
  rateLimits.actions,
  eventController.leaveEvent
);

// Marcar interés en evento
router.post(
  '/:eventId/interested',
  authMiddleware,
  rateLimits.actions,
  eventController.markInterested
);

// ==========================================
// RUTAS DE MODERACIÓN
// ==========================================

// Moderar asistente (aprobar/rechazar)
router.post(
  '/:eventId/moderate',
  authMiddleware,
  rateLimits.moderation,
  eventController.moderateAttendee
);

// Reportar evento
router.post(
  '/:eventId/report',
  authMiddleware,
  rateLimits.actions,
  eventController.reportEvent
);

// ==========================================
// RUTAS DE INTERACCIÓN
// ==========================================

// Compartir evento
router.post(
  '/:eventId/share',
  authMiddleware,
  rateLimits.actions,
  eventController.shareEvent
);

// Comentar en evento
router.post(
  '/:eventId/comments',
  authMiddleware,
  rateLimits.content,
  eventController.addComment
);

// Obtener comentarios del evento
router.get(
  '/:eventId/comments',
  rateLimits.general,
  eventController.getComments
);

// ==========================================
// RUTAS DE ANÁLISIS
// ==========================================

// Obtener estadísticas del evento (solo organizador)
router.get(
  '/:eventId/analytics',
  authMiddleware,
  rateLimits.general,
  eventController.getEventAnalytics
);

// Obtener lista de asistentes (solo organizador)
router.get(
  '/:eventId/attendees',
  authMiddleware,
  rateLimits.general,
  eventController.getAttendees
);

// ==========================================
// RUTAS ESPECIALES
// ==========================================

// Duplicar evento
router.post(
  '/:eventId/duplicate',
  authMiddleware,
  rateLimits.creation,
  eventController.duplicateEvent
);

// Exportar evento
router.get(
  '/:eventId/export',
  authMiddleware,
  rateLimits.general,
  eventController.exportEvent
);

module.exports = router;
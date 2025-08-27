const express = require('express');

const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generalLimiter, searchLimiter, eventCreationLimiter, eventModificationLimiter, eventActionsLimiter } = require('../middleware/rateLimitMiddleware');
const { uploadImages } = require('../middleware/uploadMiddleware');

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

// Obtener eventos públicos
router.get('/', generalLimiter, eventController.getEvents);

// Buscar eventos
router.get('/search', searchLimiter, eventController.searchEvents);

// Obtener evento por ID (público)
router.get('/:eventId', generalLimiter, eventController.getEventById);

// ==========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ==========================================

// Crear evento
router.post(
  '/',
  authenticateToken,
  eventCreationLimiter,
  uploadImages, // Máximo 5 imágenes
  eventController.createEvent
);

// Guardar borrador
router.post(
  '/draft',
  authenticateToken,
  eventCreationLimiter,
  eventController.saveDraft
);

// Obtener eventos recomendados
router.get(
  '/recommended',
  authenticateToken,
  generalLimiter,
  eventController.getRecommendedEvents
);

// Actualizar evento
router.put(
  '/:eventId',
  authenticateToken,
  eventModificationLimiter,
  uploadImages,
  eventController.updateEvent
);

// Eliminar evento
router.delete(
  '/:eventId',
  authenticateToken,
  eventModificationLimiter,
  eventController.deleteEvent
);

// ==========================================
// RUTAS DE PARTICIPACIÓN
// ==========================================

// Unirse a evento
router.post(
  '/:eventId/join',
  authenticateToken,
  eventActionsLimiter,
  eventController.joinEvent
);

// Salir de evento
router.delete(
  '/:eventId/leave',
  authenticateToken,
  eventActionsLimiter,
  eventController.leaveEvent
);

// Marcar interés en evento
router.post(
  '/:eventId/interested',
  authenticateToken,
  eventActionsLimiter,
  eventController.markInterested
);

// ==========================================
// RUTAS DE MODERACIÓN
// ==========================================

// Moderar asistente (aprobar/rechazar)
router.post(
  '/:eventId/moderate',
  authenticateToken,
  rateLimits.moderation,
  eventController.moderateAttendee
);

// Reportar evento
router.post(
  '/:eventId/report',
  authenticateToken,
  eventActionsLimiter,
  eventController.reportEvent
);

// ==========================================
// RUTAS DE INTERACCIÓN
// ==========================================

// Compartir evento
router.post(
  '/:eventId/share',
  authenticateToken,
  eventActionsLimiter,
  eventController.shareEvent
);

// Comentar en evento
router.post(
  '/:eventId/comments',
  authenticateToken,
  rateLimits.content,
  eventController.addComment
);

// Obtener comentarios del evento
router.get(
  '/:eventId/comments',
  generalLimiter,
  eventController.getComments
);

// ==========================================
// RUTAS DE ANÁLISIS
// ==========================================

// Obtener estadísticas del evento (solo organizador)
router.get(
  '/:eventId/analytics',
  authenticateToken,
  generalLimiter,
  eventController.getEventAnalytics
);

// Obtener lista de asistentes (solo organizador)
router.get(
  '/:eventId/attendees',
  authenticateToken,
  generalLimiter,
  eventController.getAttendees
);

// ==========================================
// RUTAS ESPECIALES
// ==========================================

// Duplicar evento
router.post(
  '/:eventId/duplicate',
  authenticateToken,
  eventCreationLimiter,
  eventController.duplicateEvent
);

// Exportar evento
router.get(
  '/:eventId/export',
  authenticateToken,
  generalLimiter,
  eventController.exportEvent
);

module.exports = router;

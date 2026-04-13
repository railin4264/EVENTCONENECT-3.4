const express = require('express');

const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generalLimiter, searchLimiter, eventCreationLimiter } = require('../middleware/rateLimitMiddleware');
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
  generalLimiter,
  uploadImages,
  eventController.updateEvent
);

// Eliminar evento
router.delete(
  '/:eventId',
  authenticateToken,
  generalLimiter,
  eventController.deleteEvent
);

// ==========================================
// RUTAS DE PARTICIPACIÓN
// ==========================================

// Unirse a evento
router.post(
  '/:eventId/join',
  authenticateToken,
  generalLimiter,
  eventController.joinEvent
);

// Salir de evento
router.delete(
  '/:eventId/leave',
  authenticateToken,
  generalLimiter,
  eventController.leaveEvent
);

// Marcar interés en evento
router.post(
  '/:eventId/interested',
  authenticateToken,
  generalLimiter,
  eventController.markInterested
);

// ==========================================
// RUTAS DE MODERACIÓN
// ==========================================

// Moderar asistente (aprobar/rechazar)
router.post(
  '/:eventId/moderate',
  authenticateToken,
  generalLimiter,
  eventController.moderateAttendee
);

// Reportar evento
router.post(
  '/:eventId/report',
  authenticateToken,
  generalLimiter,
  eventController.reportEvent
);

// ==========================================
// RUTAS DE INTERACCIÓN
// ==========================================

// Compartir evento
router.post(
  '/:eventId/share',
  authenticateToken,
  generalLimiter,
  eventController.shareEvent
);

// Comentar en evento
router.post(
  '/:eventId/comments',
  authenticateToken,
  generalLimiter,
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

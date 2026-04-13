const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const { logger } = require('../utils/logger');

/**
 * Rate limiter general para todas las rutas
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Saltar rate limiting para health checks
    return req.path === '/health' || req.path.startsWith('/health/');
  },
});

/**
 * Rate limiter específico para autenticación
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter para creación de eventos
 */
const eventCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 eventos por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de creación de eventos por hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para comentarios y reviews
 */
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 comentarios por 5 minutos
  message: {
    success: false,
    message: 'Has alcanzado el límite de comentarios por 5 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para búsquedas
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 búsquedas por minuto
  message: {
    success: false,
    message: 'Has alcanzado el límite de búsquedas por minuto',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Speed limiter para requests consecutivos
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // permitir 50 requests sin delay
  delayMs: 500, // agregar 500ms de delay por request después de delayAfter
  maxDelayMs: 20000, // máximo delay de 20 segundos
  skip: req => {
    // Saltar speed limiting para health checks
    return req.path === '/health' || req.path.startsWith('/health/');
  },
});

/**
 * Rate limiter para subida de archivos
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // máximo 50 archivos por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de subida de archivos por hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para notificaciones
 */
const notificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 notificaciones por 5 minutos
  message: {
    success: false,
    message: 'Has alcanzado el límite de notificaciones por 5 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para API de terceros
 */
const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por minuto
  message: {
    success: false,
    message: 'Has alcanzado el límite de requests a APIs externas por minuto',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para AI recommendations
 */
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 requests por 5 minutos
  message: {
    success: false,
    message: 'Has alcanzado el límite de requests de IA por 5 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware para aplicar rate limits según la ruta
 * @param req
 * @param res
 * @param next
 */
const applyRateLimits = (req, res, next) => {
  const { path } = req;

  // Aplicar rate limits específicos según la ruta
  if (path.startsWith('/api/auth')) {
    return authLimiter(req, res, next);
  }

  if (path.startsWith('/api/events') && req.method === 'POST') {
    return eventCreationLimiter(req, res, next);
  }

  if (path.includes('/comments') || path.includes('/reviews')) {
    return commentLimiter(req, res, next);
  }

  if (path.startsWith('/api/search')) {
    return searchLimiter(req, res, next);
  }

  if (path.includes('/upload')) {
    return uploadLimiter(req, res, next);
  }

  if (path.startsWith('/api/notifications')) {
    return notificationLimiter(req, res, next);
  }

  if (path.includes('/external') || path.includes('/third-party')) {
    return externalApiLimiter(req, res, next);
  }

  // Aplicar rate limit general para otras rutas
  return generalLimiter(req, res, next);
};

module.exports = {
  generalLimiter,
  authLimiter,
  eventCreationLimiter,
  commentLimiter,
  searchLimiter,
  speedLimiter,
  uploadLimiter,
  notificationLimiter,
  externalApiLimiter,
  aiLimiter,
  applyRateLimits,
};

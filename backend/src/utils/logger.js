const fs = require('fs');
const path = require('path');

const winston = require('winston');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// Configuración de transportes
const transports = [
  // Consola
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),

  // Archivo de errores
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Archivo de logs generales
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Agregar transporte de logs de acceso en producción
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'info',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Función para loggear requests HTTP
const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : null,
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Función para loggear errores de base de datos
const logDatabaseError = (error, operation, collection) => {
  logger.error('Database Error', {
    operation,
    collection,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear errores de autenticación
const logAuthError = (error, userId, action) => {
  logger.warn('Authentication Error', {
    userId,
    action,
    error: error.message,
    ip: error.ip || 'unknown',
    userAgent: error.userAgent || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de seguridad
const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear métricas de rendimiento
const logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de negocio
const logBusinessEvent = (event, userId, details = {}) => {
  logger.info('Business Event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear errores de API externa
const logExternalApiError = (service, endpoint, error, metadata = {}) => {
  logger.error('External API Error', {
    service,
    endpoint,
    error: error.message,
    statusCode: error.statusCode,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de WebSocket
const logWebSocketEvent = (event, socketId, userId, data = {}) => {
  logger.debug('WebSocket Event', {
    event,
    socketId,
    userId,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de cache
const logCacheEvent = (operation, key, hit, duration = null) => {
  logger.debug('Cache Event', {
    operation,
    key,
    hit,
    duration: duration ? `${duration}ms` : null,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de upload
const logUploadEvent = (userId, fileInfo, success, error = null) => {
  const logData = {
    userId,
    fileName: fileInfo.originalname,
    fileSize: fileInfo.size,
    mimetype: fileInfo.mimetype,
    success,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    logData.error = error.message;
    logger.error('Upload Error', logData);
  } else {
    logger.info('Upload Success', logData);
  }
};

// Función para loggear eventos de notificaciones
const logNotificationEvent = (type, userId, success, details = {}) => {
  const logData = {
    type,
    userId,
    success,
    details,
    timestamp: new Date().toISOString(),
  };

  if (success) {
    logger.info('Notification Sent', logData);
  } else {
    logger.error('Notification Failed', logData);
  }
};

// Función para loggear eventos de gamificación
const logGamificationEvent = (event, userId, points, action) => {
  logger.info('Gamification Event', {
    event,
    userId,
    points,
    action,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de búsqueda
const logSearchEvent = (userId, query, filters, resultsCount, duration) => {
  logger.info('Search Event', {
    userId,
    query,
    filters,
    resultsCount,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

// Función para loggear eventos de recomendaciones AI
const logAIRecommendationEvent = (
  userId,
  recommendationType,
  success,
  details = {}
) => {
  const logData = {
    userId,
    recommendationType,
    success,
    details,
    timestamp: new Date().toISOString(),
  };

  if (success) {
    logger.info('AI Recommendation Generated', logData);
  } else {
    logger.error('AI Recommendation Failed', logData);
  }
};

module.exports = {
  logger,
  logRequest,
  logDatabaseError,
  logAuthError,
  logSecurityEvent,
  logPerformance,
  logBusinessEvent,
  logExternalApiError,
  logWebSocketEvent,
  logCacheEvent,
  logUploadEvent,
  logNotificationEvent,
  logGamificationEvent,
  logSearchEvent,
  logAIRecommendationEvent,
};

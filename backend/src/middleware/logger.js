const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// ==========================================
// CONFIGURACIÓN DE LOGGING AVANZADO
// ==========================================

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// ==========================================
// TRANSPORTES DE LOGGING
// ==========================================

// Transporte para archivos de aplicación
const appTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: logFormat
});

// Transporte para archivos de error
const errorTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat
});

// Transporte para archivos de seguridad
const securityTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d',
  level: 'warn',
  format: logFormat
});

// Transporte para archivos de acceso
const accessTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: logFormat
});

// Transporte para consola
const consoleTransport = new winston.transports.Console({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: consoleFormat
});

// ==========================================
// CONFIGURACIÓN DEL LOGGER PRINCIPAL
// ==========================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'eventconnect-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    appTransport,
    errorTransport,
    securityTransport,
    accessTransport,
    consoleTransport
  ],
  // No salir en caso de error
  exitOnError: false
});

// ==========================================
// LOGGERS ESPECIALIZADOS
// ==========================================

// Logger para acceso HTTP
const accessLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'eventconnect-backend',
    type: 'access'
  },
  transports: [accessTransport, consoleTransport]
});

// Logger para seguridad
const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  defaultMeta: { 
    service: 'eventconnect-backend',
    type: 'security'
  },
  transports: [securityTransport, consoleTransport]
});

// Logger para errores
const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  defaultMeta: { 
    service: 'eventconnect-backend',
    type: 'error'
  },
  transports: [errorTransport, consoleTransport]
});

// ==========================================
// MIDDLEWARE DE LOGGING
// ==========================================

// Middleware para logging de requests HTTP
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log del request
  accessLogger.info('Request iniciado', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });
  
  // Interceptar el final de la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log del response
    accessLogger.info('Request completado', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// Middleware para logging de errores
const errorLoggerMiddleware = (err, req, res, next) => {
  // Log del error
  errorLogger.error('Error en la aplicación', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// ==========================================
// FUNCIONES DE LOGGING ESPECIALIZADAS
// ==========================================

// Log de autenticación
const logAuth = (action, userId, ip, success, details = {}) => {
  const level = success ? 'info' : 'warn';
  
  securityLogger.log(level, `Autenticación: ${action}`, {
    userId,
    ip,
    success,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log de autorización
const logAuthz = (action, userId, resource, success, details = {}) => {
  const level = success ? 'info' : 'warn';
  
  securityLogger.log(level, `Autorización: ${action}`, {
    userId,
    resource,
    success,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log de operaciones críticas
const logCriticalOperation = (operation, userId, details = {}) => {
  logger.warn(`Operación crítica: ${operation}`, {
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log de performance
const logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  
  logger.log(level, `Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log de base de datos
const logDatabase = (operation, collection, duration, success, details = {}) => {
  const level = success ? 'info' : 'error';
  
  logger.log(level, `Base de datos: ${operation}`, {
    collection,
    duration: `${duration}ms`,
    success,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// ==========================================
// MONITOREO Y MÉTRICAS
// ==========================================

// Contador de requests
let requestCount = 0;
let errorCount = 0;
let startTime = Date.now();

// Incrementar contadores
const incrementRequestCount = () => requestCount++;
const incrementErrorCount = () => errorCount++;

// Obtener métricas
const getMetrics = () => {
  const uptime = Date.now() - startTime;
  const requestsPerMinute = (requestCount / (uptime / 60000)).toFixed(2);
  const errorRate = ((errorCount / requestCount) * 100).toFixed(2);
  
  return {
    uptime: `${Math.floor(uptime / 1000)}s`,
    totalRequests: requestCount,
    totalErrors: errorCount,
    requestsPerMinute,
    errorRate: `${errorRate}%`,
    timestamp: new Date().toISOString()
  };
};

// Log de métricas cada 5 minutos
setInterval(() => {
  const metrics = getMetrics();
  logger.info('Métricas del sistema', metrics);
}, 5 * 60 * 1000);

// ==========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ==========================================

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  errorLogger.error('Excepción no capturada', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // En producción, cerrar la aplicación
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Capturar promesas rechazadas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  errorLogger.error('Promesa rechazada no manejada', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// EXPORTACIÓN
// ==========================================

module.exports = {
  // Logger principal
  logger,
  
  // Loggers especializados
  accessLogger,
  securityLogger,
  errorLogger,
  
  // Middleware
  requestLogger,
  errorLoggerMiddleware,
  
  // Funciones de logging
  logAuth,
  logAuthz,
  logCriticalOperation,
  logPerformance,
  logDatabase,
  
  // Métricas
  incrementRequestCount,
  incrementErrorCount,
  getMetrics
};

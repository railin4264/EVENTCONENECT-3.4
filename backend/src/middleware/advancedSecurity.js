const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');

// Configuración avanzada de logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'eventconnect-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting avanzado por endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({ error: message });
  }
});

// Configuraciones específicas por endpoint
const rateLimits = {
  // General API
  general: createRateLimit(15 * 60 * 1000, 100, 'Demasiadas solicitudes, intenta de nuevo en 15 minutos'),
  
  // Autenticación más estricta
  auth: createRateLimit(15 * 60 * 1000, 5, 'Demasiados intentos de login, intenta de nuevo en 15 minutos'),
  
  // Creación de contenido
  create: createRateLimit(60 * 1000, 10, 'Demasiada creación de contenido, espera 1 minuto'),
  
  // Búsquedas
  search: createRateLimit(60 * 1000, 30, 'Demasiadas búsquedas, espera 1 minuto'),
  
  // Subida de archivos
  upload: createRateLimit(60 * 1000, 5, 'Demasiadas subidas de archivos, espera 1 minuto')
};

// Configuración de seguridad con Helmet
const securityConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Middleware de compresión
const compressionConfig = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// Middleware de logging de requests
const requestLogger = (req, res, next) => {
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
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Middleware de monitoreo de performance
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;
    
    if (durationMs > 1000) { // Log requests > 1 segundo
      logger.warn('Slow Request', {
        method: req.method,
        url: req.originalUrl,
        duration: `${durationMs.toFixed(2)}ms`,
        userId: req.user?.id
      });
    }
  });
  
  next();
};

// Middleware de detección de ataques
const attackDetection = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi,
    /(javascript:)/gi,
    /(onload=|onerror=|onclick=)/gi,
    /(union.*select|select.*from|drop.*table|insert.*into)/gi
  ];
  
  const checkData = (data) => {
    const dataStr = JSON.stringify(data);
    return suspiciousPatterns.some(pattern => pattern.test(dataStr));
  };
  
  if (checkData(req.body) || checkData(req.query) || checkData(req.params)) {
    logger.error('Suspicious Request Detected', {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      query: req.query,
      params: req.params,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(400).json({ 
      error: 'Solicitud inválida detectada',
      code: 'INVALID_REQUEST'
    });
  }
  
  next();
};

module.exports = {
  logger,
  rateLimits,
  securityConfig,
  compressionConfig,
  requestLogger,
  performanceMonitor,
  attackDetection
};


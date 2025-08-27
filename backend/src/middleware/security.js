const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const validator = require('validator');

// ==========================================
// VALIDACIÓN DE ENTRADA CRÍTICA
// ==========================================

// Sanitización de entrada
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitizar body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = validator.escape(validator.trim(req.body[key]));
        }
      });
    }

    // Sanitizar query params
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = validator.escape(validator.trim(req.query[key]));
        }
      });
    }

    // Sanitizar URL params
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = validator.escape(validator.trim(req.params[key]));
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error sanitizing input:', error);
    res.status(400).json({
      success: false,
      message: 'Entrada inválida detectada'
    });
  }
};

// Validación de tipos de contenido
const validateContentType = (req, res, next) => {
  const allowedTypes = ['application/json', 'multipart/form-data'];
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de contenido no permitido'
      });
    }
  }
  
  next();
};

// Validación de tamaño de request
const validateRequestSize = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request demasiado grande'
    });
  }
  
  next();
};

// ==========================================
// RATE LIMITING AVANZADO
// ==========================================

// Crear rate limiter con configuración avanzada
const createRateLimit = (
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Demasiadas solicitudes, intenta de nuevo en 15 minutos',
  skipSuccessfulRequests = false,
  skipFailedRequests = false
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }
  });
};

// Crear speed limiter
const createSpeedLimit = (
  windowMs = 15 * 60 * 1000,
  delayAfter = 50,
  delayMs = 500,
  maxDelayMs = 20000
) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    maxDelayMs,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }
  });
};

// Rate limiters específicos
const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Demasiados intentos de login, intenta de nuevo en 15 minutos');
const apiRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Límite de API excedido');
const uploadRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Demasiadas subidas de archivos');
const searchRateLimit = createRateLimit(1 * 60 * 1000, 30, 'Demasiadas búsquedas');

// Speed limiters
const authSpeedLimit = createSpeedLimit(15 * 60 * 1000, 3, 1000, 10000);
const apiSpeedLimit = createSpeedLimit(15 * 60 * 1000, 50, 500, 20000);

// ==========================================
// CONFIGURACIÓN DE HELMET
// ==========================================

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// ==========================================
// MONITOREO DE SEGURIDAD
// ==========================================

// Detector de ataques
const attackDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi,
    /(javascript:)/gi,
    /(onload=|onerror=|onclick=)/gi,
    /(union.*select|select.*from|drop.*table|insert.*into)/gi,
    /(eval\s*\()/gi,
    /(document\.cookie)/gi,
    /(window\.location)/gi,
  ];

  const checkData = (data) => {
    if (!data) return false;
    const dataStr = JSON.stringify(data);
    return suspiciousPatterns.some(pattern => pattern.test(dataStr));
  };

  if (checkData(req.body) || checkData(req.query) || checkData(req.params)) {
    console.error('🚨 Ataque detectado:', {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      success: false,
      message: 'Solicitud maliciosa detectada',
      code: 'SECURITY_VIOLATION',
    });
  }

  next();
};

// Logger de seguridad
const securityLogger = (req, res, next) => {
  const securityData = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    userId: req.user?.id || 'anonymous',
  };

  // Log requests sospechosos
  if (req.get('User-Agent')?.includes('bot') || 
      req.get('User-Agent')?.includes('crawler') ||
      req.get('User-Agent')?.length > 500) {
    console.warn('⚠️ Request sospechoso:', securityData);
  }

  // Log requests de seguridad
  if (req.method === 'POST' && (req.originalUrl.includes('/auth') || req.originalUrl.includes('/login'))) {
    console.log('🔐 Request de autenticación:', securityData);
  }

  next();
};

// ==========================================
// EXPORTACIÓN
// ==========================================

module.exports = {
  // Rate limiting
  createRateLimit,
  createSpeedLimit,
  authRateLimit,
  apiRateLimit,
  uploadRateLimit,
  searchRateLimit,
  authSpeedLimit,
  apiSpeedLimit,

  // Security middleware
  helmetConfig,
  sanitizeInput,
  validateContentType,
  validateRequestSize,
  attackDetector,
  securityLogger,
};

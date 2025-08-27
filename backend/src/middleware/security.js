const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
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
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString(),
      });
    },
  });
};

// Crear speed limiter
const createSpeedLimit = (
  windowMs = 15 * 60 * 1000,
  delayAfter = 50,
  delayMs = 500
) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs: () => delayMs,
    maxDelayMs: 20000,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    },
  });
};

// ==========================================
// CONFIGURACIONES ESPECÍFICAS
// ==========================================

// Rate limiters específicos
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos
  'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos',
  false,
  true
);

const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests
  'Demasiadas solicitudes a la API, intenta de nuevo en 15 minutos',
  true,
  false
);

const uploadRateLimit = createRateLimit(
  60 * 1000, // 1 minuto
  5, // 5 uploads
  'Demasiadas subidas de archivos, espera 1 minuto',
  false,
  true
);

const searchRateLimit = createRateLimit(
  60 * 1000, // 1 minuto
  30, // 30 búsquedas
  'Demasiadas búsquedas, espera 1 minuto',
  true,
  false
);

// Speed limiters
const authSpeedLimit = createSpeedLimit(15 * 60 * 1000, 3, 1000);
const apiSpeedLimit = createSpeedLimit(15 * 60 * 1000, 50, 500);

// ==========================================
// MIDDLEWARE DE SEGURIDAD
// ==========================================

// Configuración de Helmet
const helmetConfig = helmet({
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
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Configuración de CORS
const corsConfig = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:19006',
      process.env.CLIENT_URL,
      process.env.WEB_URL,
      process.env.MOBILE_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Client-Version',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 horas
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
    headers: {
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP'),
      'x-client-ip': req.get('X-Client-IP'),
    },
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
  corsConfig,
  sanitizeInput,
  validateContentType,
  validateRequestSize,
  attackDetector,
  securityLogger,

  // Rate limiting
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
  searchRateLimit,
};

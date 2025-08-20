const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');

// CORS configuration
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://eventconnect.com',
      'https://www.eventconnect.com',
      'https://app.eventconnect.com',
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Total-Pages',
  ],
  maxAge: 86400, // 24 hours
};

// Rate limiting configuration
const createRateLimit = (
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Demasiadas solicitudes desde esta IP'
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
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Speed limiting configuration
const createSpeedLimit = (
  windowMs = 15 * 60 * 1000,
  delayAfter = 50,
  delayMs = 100
) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    skip: req => {
      // Skip speed limiting for certain routes
      return (
        req.path.startsWith('/api/health') ||
        req.path.startsWith('/api/status') ||
        req.path.startsWith('/api/metrics')
      );
    },
  });
};

// Specific rate limiters
const authRateLimit = createRateLimit(
  15 * 60 * 1000,
  5,
  'Demasiados intentos de autenticación. Intente de nuevo en 15 minutos'
);
const apiRateLimit = createRateLimit(
  15 * 60 * 1000,
  100,
  'Demasiadas solicitudes a la API. Intente de nuevo en 15 minutos'
);
const uploadRateLimit = createRateLimit(
  15 * 60 * 1000,
  10,
  'Demasiadas subidas de archivos. Intente de nuevo en 15 minutos'
);
const searchRateLimit = createRateLimit(
  1 * 60 * 1000,
  30,
  'Demasiadas búsquedas. Intente de nuevo en 1 minuto'
);

// Helmet configuration for security headers
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", 'https:', 'wss:'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
};

// HPP configuration to prevent HTTP Parameter Pollution
const hppConfig = {
  whitelist: [
    'tags',
    'categories',
    'interests',
    'coordinates',
    'location',
    'date',
    'time',
    'price',
    'capacity',
  ],
};

// Security middleware stack
const securityMiddleware = [
  // Parse cookies
  cookieParser(process.env.COOKIE_SECRET || 'eventconnect-cookie-secret'),

  // CORS
  cors(corsOptions),

  // Security headers
  helmet(helmetConfig),

  // Prevent XSS attacks
  xss(),

  // Prevent NoSQL injection
  mongoSanitize(),

  // Prevent HTTP Parameter Pollution
  hpp(hppConfig),

  // Rate limiting
  apiRateLimit,

  // Speed limiting
  createSpeedLimit(),

  // Trust proxy for accurate IP addresses
  (req, res, next) => {
    req.ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    next();
  },
];

// Route-specific security middleware
const routeSecurity = {
  auth: [authRateLimit],
  upload: [uploadRateLimit],
  search: [searchRateLimit],
  api: [apiRateLimit],
};

// IP whitelist middleware
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip;

    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'IP no autorizada',
      });
    }
  };
};

// Request size limiting middleware
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        message: 'Solicitud demasiado grande',
      });
    }

    next();
  };
};

// Parse size string to bytes
const parseSize = size => {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) return 1024 * 1024; // Default to 1MB

  const value = parseFloat(match[1]);
  const unit = match[2];

  return value * units[unit];
};

// Content type validation middleware
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.get('Content-Type');
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header requerido',
      });
    }

    const isValidType = allowedTypes.some(type => contentType.includes(type));

    if (!isValidType) {
      return res.status(415).json({
        success: false,
        message: `Content-Type no soportado. Tipos permitidos: ${allowedTypes.join(', ')}`,
      });
    }

    next();
  };
};

// Method validation middleware
const validateMethod = (
  allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
) => {
  return (req, res, next) => {
    if (allowedMethods.includes(req.method)) {
      next();
    } else {
      res.status(405).json({
        success: false,
        message: `Método ${req.method} no permitido. Métodos permitidos: ${allowedMethods.join(', ')}`,
      });
    }
  };
};

// Referrer validation middleware
const validateReferrer = (allowedDomains = []) => {
  return (req, res, next) => {
    if (allowedDomains.length === 0) {
      return next();
    }

    const referrer = req.get('Referrer');
    if (!referrer) {
      return next();
    }

    try {
      const referrerUrl = new URL(referrer);
      const isValidReferrer = allowedDomains.some(
        domain =>
          referrerUrl.hostname === domain ||
          referrerUrl.hostname.endsWith(`.${domain}`)
      );

      if (!isValidReferrer) {
        return res.status(403).json({
          success: false,
          message: 'Referrer no autorizado',
        });
      }
    } catch (error) {
      // Invalid referrer URL, continue
    }

    next();
  };
};

// User agent validation middleware
const validateUserAgent = (blockedPatterns = []) => {
  return (req, res, next) => {
    const userAgent = req.get('User-Agent');

    if (!userAgent) {
      return res.status(400).json({
        success: false,
        message: 'User-Agent header requerido',
      });
    }

    const isBlocked = blockedPatterns.some(pattern =>
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'User-Agent no autorizado',
      });
    }

    next();
  };
};

// Request frequency monitoring
const requestFrequencyMonitor = () => {
  const requests = new Map();

  return (req, res, next) => {
    const clientIP = req.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute

    if (!requests.has(clientIP)) {
      requests.set(clientIP, []);
    }

    const clientRequests = requests.get(clientIP);

    // Remove old requests outside the window
    const validRequests = clientRequests.filter(
      timestamp => now - timestamp < windowMs
    );

    // Check frequency
    if (validRequests.length > 60) {
      // More than 60 requests per minute
      console.warn(`High request frequency detected from IP: ${clientIP}`);

      // Log to security log
      const securityLogEntry = `${new Date().toISOString()} - FREQUENCY: ${clientIP} - ${validRequests.length} requests in 1 minute\n`;
      // This would be written to a security log file
    }

    // Add current request
    validRequests.push(now);
    requests.set(clientIP, validRequests);

    next();
  };
};

// Export all security middleware
module.exports = {
  // Main security stack
  securityMiddleware,

  // Route-specific security
  routeSecurity,

  // Individual middleware
  cors: cors(corsOptions),
  helmet: helmet(helmetConfig),
  rateLimit: createRateLimit(),
  speedLimit: createSpeedLimit(),

  // Specific rate limiters
  authRateLimit,
  apiRateLimit,
  uploadRateLimit,
  searchRateLimit,

  // Utility middleware
  ipWhitelist,
  requestSizeLimit,
  validateContentType,
  validateMethod,
  validateReferrer,
  validateUserAgent,
  requestFrequencyMonitor,

  // Configuration
  corsOptions,
  helmetConfig,
  hppConfig,
};

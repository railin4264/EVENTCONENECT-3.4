const jwt = require('jsonwebtoken');

const redisClient = require('../config/redis');
const Event = require('../models/Event');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de acceso',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is blacklisted
      const isBlacklisted = await redisClient.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado',
        });
      }

      // Attach user to request
      req.user = {
        id: decoded.userId || decoded.id || decoded.sub,
        role: decoded.role || 'user',
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Optional authentication - try to verify token but continue
const optionalAuth = async (req, res, next) => {
  try {
    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request
        req.user = {
          id: decoded.userId || decoded.id || decoded.sub,
          role: decoded.role || 'user',
        };
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Token inválido en autenticación opcional:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    next();
  }
};

// Admin only - require admin role
const adminOnly = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren privilegios de administrador',
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Moderator or admin - require moderator or admin role
const moderatorOrAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    // Check if user has moderator or admin role
    if (!['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          'Acceso denegado. Se requieren privilegios de moderador o administrador',
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de moderador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Owner or admin - require ownership or admin role
const ownerOrAdmin = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      // First check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado',
        });
      }

      // Check if user is admin
      if (req.user.role === 'admin') {
        return next();
      }

      // Prefer explicit resourceId
      let resourceId = req.params[resourceField] || req.body[resourceField];

      // If not provided and we have an eventId param, attempt to resolve ownership by event host
      if (!resourceId && req.params.eventId) {
        try {
          const event = await Event.findById(req.params.eventId).select('host');
          if (!event) {
            return res
              .status(404)
              .json({ success: false, message: 'Evento no encontrado' });
          }
          resourceId = event.host?.toString();
        } catch (e) {
          return res
            .status(404)
            .json({ success: false, message: 'Evento no encontrado' });
        }
      }

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de recurso no proporcionado',
        });
      }

      // Check if user owns the resource
      if (resourceId.toString() === req.user.id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message:
          'Acceso denegado. Solo el propietario o administrador puede realizar esta acción',
      });
    } catch (error) {
      console.error('Error en middleware de propietario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  };
};

// Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(ip)) {
      requests.set(
        ip,
        requests.get(ip).filter(timestamp => timestamp > windowStart)
      );
    }

    const currentRequests = requests.get(ip) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intente de nuevo más tarde',
      });
    }

    currentRequests.push(now);
    requests.set(ip, currentRequests);

    next();
  };
};

// Check if user is verified
const requireVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Cuenta no verificada. Por favor verifique su email antes de continuar',
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de verificación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Check if user has completed profile
const requireProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    // Check if user has completed basic profile
    if (!req.user.firstName || !req.user.lastName || !req.user.location) {
      return res.status(403).json({
        success: false,
        message:
          'Perfil incompleto. Por favor complete su perfil antes de continuar',
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Check if user is not banned
const notBanned = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    if (req.user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message:
          'Su cuenta ha sido suspendida. Contacte al soporte para más información',
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de ban:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  adminOnly,
  moderatorOrAdmin,
  ownerOrAdmin,
  rateLimit,
  requireVerification,
  requireProfile,
  notBanned,
};

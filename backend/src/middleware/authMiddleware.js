const jwt = require('jsonwebtoken');
const { logError } = require('../utils/logger');

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Extraer el token
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Agregar la información del usuario al request
      req.user = decoded;
      req.userId = decoded.id;
      
      next();
    } catch (jwtError) {
      logError('JWT verification failed', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Token expirado o inválido'
      });
    }
  } catch (error) {
    logError('Auth middleware error', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware opcional de autenticación (para rutas que pueden funcionar con o sin usuario)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        req.userId = decoded.id;
      } catch (jwtError) {
        // Token inválido, pero continuamos sin usuario
        req.user = null;
        req.userId = null;
      }
    }
    
    next();
  } catch (error) {
    logError('Optional auth middleware error', error);
    req.user = null;
    req.userId = null;
    next();
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes'
      });
    }

    next();
  };
};

// Middleware para verificar si el usuario es propietario del recurso
const requireOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
      }

      const resourceId = req.params[resourceIdField];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      // Verificar si el usuario es propietario o admin
      if (resource.userId?.toString() !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logError('Ownership middleware error', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireOwnership
};

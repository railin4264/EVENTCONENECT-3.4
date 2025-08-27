const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');

/**
 * Middleware para verificar autenticación JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    return res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar roles de usuario
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es propietario del recurso
 */
const authorizeOwner = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      if (resource.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Error en autorización de propietario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario está activo
 */
const requireActiveUser = (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta está desactivada'
    });
  }
  next();
};

/**
 * Middleware para verificar si el usuario está verificado
 */
const requireVerifiedUser = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta debe estar verificada para realizar esta acción'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwner,
  requireActiveUser,
  requireVerifiedUser
};
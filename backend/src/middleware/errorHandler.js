const logger = require('./logger');

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next function (unused but required)
 */
const errorHandler = (error, req, res, _next) => {
  // Log the error
  logger.error('Global error handler:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Determine error type and status code
  let statusCode = 500;
  let message = 'Error interno del servidor';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  } else if (error.name === 'MongoError' && error.code === 11000) {
    statusCode = 409;
    message = 'Conflicto: el recurso ya existe';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'No autorizado';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Acceso prohibido';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Recurso no encontrado';
  } else if (error.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Demasiadas solicitudes';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message || message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.message,
      }),
    },
  });
};

/**
 * 404 Not Found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  logger.warn('404 Not Found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    },
  });
};

/**
 * Handle unhandled promise rejections
 * @param {Error} reason - Rejection reason
 * @param {Promise} promise - Rejected promise
 */
const handleUnhandledRejection = (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  });

  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled Promise Rejection. Exiting...');
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions
 * @param {Error} error - Uncaught error
 */
const handleUncaughtException = error => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Always exit on uncaught exceptions
  console.error('Uncaught Exception. Exiting...');
  process.exit(1);
};

/**
 * Graceful shutdown handler
 * @param {Object} server - HTTP server instance
 * @param {string} signal - Termination signal
 */
const gracefulShutdown = async (server, signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connections
    const { database } = require('../config');
    if (database && database.disconnect) {
      await database.disconnect();
      logger.info('Database connections closed');
    }

    // Close Redis connections
    const { redisService } = require('../config');
    if (redisService && redisService.disconnect) {
      await redisService.disconnect();
      logger.info('Redis connections closed');
    }

    // Exit process
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} details - Additional error details
 */
const sendError = (res, statusCode, message, details = null) => {
  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    errorResponse.error.details = details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Validation error response helper
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    error: {
      message: 'Error de validación',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      details: errors,
    },
  });
};

/**
 * Authentication error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendAuthError = (res, message = 'No autorizado') => {
  res.status(401).json({
    success: false,
    error: {
      message,
      statusCode: 401,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Permission error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendPermissionError = (res, message = 'Acceso prohibido') => {
  res.status(403).json({
    success: false,
    error: {
      message,
      statusCode: 403,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Not found error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendNotFoundError = (res, message = 'Recurso no encontrado') => {
  res.status(404).json({
    success: false,
    error: {
      message,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Rate limit error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendRateLimitError = (res, message = 'Demasiadas solicitudes') => {
  res.status(429).json({
    success: false,
    error: {
      message,
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = {
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
  gracefulShutdown,
  asyncHandler,
  sendError,
  sendSuccess,
  sendValidationError,
  sendAuthError,
  sendPermissionError,
  sendNotFoundError,
  sendRateLimitError,
};

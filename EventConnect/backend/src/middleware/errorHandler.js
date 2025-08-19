const redisClient = require('../config/redis');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `El valor '${value}' ya existe para el campo '${field}'. Por favor use otro valor.`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join('. ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new AppError(message, 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'El archivo es demasiado grande';
    error = new AppError(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Campo de archivo inesperado';
    error = new AppError(message, 400);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Demasiadas solicitudes. Intente de nuevo más tarde';
    error = new AppError(message, 429);
  }

  // Redis connection errors
  if (err.code === 'ECONNREFUSED' && err.syscall === 'connect') {
    const message = 'Error de conexión con la base de datos';
    error = new AppError(message, 503);
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Error de conexión con la base de datos';
    error = new AppError(message, 503);
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler for unhandled rejections
const handleUnhandledRejection = (err) => {
  console.error('Unhandled Rejection:', err);
  console.error('Stack:', err.stack);
  
  // Close server gracefully
  process.exit(1);
};

// Global error handler for uncaught exceptions
const handleUncaughtException = (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  
  // Close server gracefully
  process.exit(1);
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🔄 Recibida señal ${signal}. Cerrando servidor...`);
  
  // Close Redis connection
  if (redisClient.isConnected) {
    redisClient.client.quit();
    console.log('✅ Conexión a Redis cerrada');
  }
  
  // Close server
  process.exit(0);
};

// Error logging service
const logError = (error, req = null) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
    url: req?.url || 'N/A',
    method: req?.method || 'N/A',
    ip: req?.ip || 'N/A',
    userAgent: req?.get('User-Agent') || 'N/A',
    userId: req?.user?.id || 'N/A'
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog);
  }

  // TODO: In production, send to external logging service
  // Example: Winston, Loggly, Sentry, etc.
  
  return errorLog;
};

// Rate limit exceeded handler
const rateLimitExceeded = (req, res) => {
  const error = new AppError('Demasiadas solicitudes desde esta IP', 429);
  logError(error, req);
  
  res.status(429).json({
    success: false,
    message: 'Demasiadas solicitudes. Intente de nuevo más tarde',
    retryAfter: Math.ceil(process.env.RATE_LIMIT_WINDOW_MS / 1000)
  });
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value,
    location: error.location
  }));
};

// Database error handler
const handleDatabaseError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: 'Error de validación de datos',
      details: Object.values(error.errors).map(err => err.message)
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      statusCode: 400,
      message: `El valor '${error.keyValue[field]}' ya existe para el campo '${field}'`
    };
  }

  if (error.name === 'CastError') {
    return {
      statusCode: 400,
      message: 'ID inválido proporcionado'
    };
  }

  return {
    statusCode: 500,
    message: 'Error de base de datos'
  };
};

// File upload error handler
const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      statusCode: 400,
      message: 'El archivo es demasiado grande'
    };
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      statusCode: 400,
      message: 'Demasiados archivos'
    };
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      statusCode: 400,
      message: 'Campo de archivo inesperado'
    };
  }

  return {
    statusCode: 400,
    message: 'Error al subir archivo'
  };
};

// Authentication error handler
const handleAuthError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      message: 'Token inválido'
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      message: 'Token expirado'
    };
  }

  if (error.name === 'NotBeforeError') {
    return {
      statusCode: 401,
      message: 'Token no válido aún'
    };
  }

  return {
    statusCode: 401,
    message: 'Error de autenticación'
  };
};

// Permission error handler
const handlePermissionError = (error) => {
  return {
    statusCode: 403,
    message: 'No tiene permisos para realizar esta acción'
  };
};

// Not found error handler
const handleNotFoundError = (resource = 'Recurso') => {
  return {
    statusCode: 404,
    message: `${resource} no encontrado`
  };
};

// Conflict error handler
const handleConflictError = (message = 'Conflicto de datos') => {
  return {
    statusCode: 409,
    message
  };
};

// Too many requests error handler
const handleTooManyRequestsError = (retryAfter = 60) => {
  return {
    statusCode: 429,
    message: 'Demasiadas solicitudes. Intente de nuevo más tarde',
    retryAfter
  };
};

// Service unavailable error handler
const handleServiceUnavailableError = (service = 'servicio') => {
  return {
    statusCode: 503,
    message: `${service} no disponible temporalmente`
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  gracefulShutdown,
  logError,
  rateLimitExceeded,
  formatValidationErrors,
  handleDatabaseError,
  handleFileUploadError,
  handleAuthError,
  handlePermissionError,
  handleNotFoundError,
  handleConflictError,
  handleTooManyRequestsError,
  handleServiceUnavailableError
};
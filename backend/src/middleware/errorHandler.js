const { logError } = require('../utils/logger');

/**
 * AppError - Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Handler - Wraps async functions to handle errors
 * This utility function catches any errors thrown in async functions
 * and passes them to Express's error handling middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logError('Unhandled error occurred', err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      status: 400,
      details: Object.values(err.errors).map(e => e.message)
    };
  } else if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      status: 400
    };
  } else if (err.name === 'MongoError' && err.code === 11000) {
    error = {
      message: 'Duplicate field value',
      status: 409
    };
  } else if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401
    };
  } else if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401
    };
  } else if (err.status) {
    error = {
      message: err.message || 'Error occurred',
      status: err.status
    };
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler
};

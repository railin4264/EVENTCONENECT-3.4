const compression = require('compression');
const express = require('express');
const path = require('path');

// Compression configuration
const compressionConfig = {
  level: 6, // Compression level (0-9, higher = more compression)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression by default
    return compression.filter(req, res);
  }
};

// Compression middleware
const compressionMiddleware = compression(compressionConfig);

// Static file serving with caching
const staticFilesConfig = {
  maxAge: '1d', // Cache static files for 1 day
  etag: true, // Enable ETag for cache validation
  lastModified: true, // Enable Last-Modified header
  setHeaders: (res, path) => {
    // Set cache headers for different file types
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
  }
};

// Serve static files
const serveStatic = express.static(path.join(__dirname, '../../uploads'), staticFilesConfig);

// Cache control middleware
const cacheControl = (maxAge = '1h', isPublic = true) => {
  return (req, res, next) => {
    const cacheControlValue = isPublic 
      ? `public, max-age=${maxAge}` 
      : `private, max-age=${maxAge}`;
    
    res.setHeader('Cache-Control', cacheControlValue);
    next();
  };
};

// No cache middleware
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// ETag middleware
const etag = (req, res, next) => {
  // Generate ETag based on response content
  res.etag = (body) => {
    const hash = require('crypto').createHash('md5').update(JSON.stringify(body)).digest('hex');
    res.setHeader('ETag', `"${hash}"`);
    return hash;
  };
  
  // Check if-none-match header
  const ifNoneMatch = req.get('If-None-Match');
  if (ifNoneMatch && res.get('ETag') === ifNoneMatch) {
    res.status(304).end();
    return;
  }
  
  next();
};

// Response time middleware
const responseTime = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
  });
  
  next();
};

// Gzip compression for specific routes
const gzipCompression = (req, res, next) => {
  // Check if client accepts gzip
  const acceptEncoding = req.get('Accept-Encoding');
  if (!acceptEncoding || !acceptEncoding.includes('gzip')) {
    return next();
  }
  
  // Set content encoding
  res.setHeader('Content-Encoding', 'gzip');
  
  // Compress response
  const zlib = require('zlib');
  const gzip = zlib.createGzip();
  
  res.write = function(chunk) {
    gzip.write(chunk);
  };
  
  res.end = function(chunk) {
    if (chunk) {
      gzip.write(chunk);
    }
    gzip.end();
  };
  
  gzip.pipe(res);
  
  next();
};

// Memory usage monitoring
const memoryMonitor = (req, res, next) => {
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };
    
    // Log high memory usage
    if (memoryDiff.heapUsed > 50 * 1024 * 1024) { // 50MB
      console.warn('High memory usage detected:', {
        url: req.url,
        method: req.method,
        memoryDiff: {
          rss: `${(memoryDiff.rss / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(memoryDiff.heapTotal / 1024 / 1024).toFixed(2)}MB`
        }
      });
    }
  });
  
  next();
};

// Request body size optimization
const bodySizeOptimization = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        message: 'Solicitud demasiado grande'
      });
    }
    
    // Set body size limit
    req.bodySizeLimit = maxSizeBytes;
    
    next();
  };
};

// Parse size string to bytes
const parseSize = (size) => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) return 10 * 1024 * 1024; // Default to 10MB
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return value * units[unit];
};

// Response optimization middleware
const responseOptimization = (req, res, next) => {
  // Remove unnecessary headers
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enable keep-alive
  res.setHeader('Connection', 'keep-alive');
  
  next();
};

// Database query optimization middleware
const queryOptimization = (req, res, next) => {
  // Add query optimization hints
  req.queryOptimization = {
    limit: parseInt(req.query.limit) || 20,
    page: parseInt(req.query.page) || 1,
    sort: req.query.sort || 'createdAt',
    order: req.query.order === 'asc' ? 1 : -1,
    select: req.query.select ? req.query.select.split(',') : undefined,
    populate: req.query.populate ? req.query.populate.split(',') : undefined
  };
  
  // Validate and sanitize query parameters
  if (req.queryOptimization.limit > 100) {
    req.queryOptimization.limit = 100;
  }
  
  if (req.queryOptimization.page < 1) {
    req.queryOptimization.page = 1;
  }
  
  next();
};

// Image optimization middleware
const imageOptimization = (req, res, next) => {
  // Check if request is for an image
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    // Set image-specific headers
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Check if client accepts WebP
    const acceptWebP = req.get('Accept') && req.get('Accept').includes('image/webp');
    if (acceptWebP && req.path.match(/\.(jpg|jpeg|png)$/i)) {
      // TODO: Implement WebP conversion
      // For now, just log the preference
      console.log('Client accepts WebP, could optimize:', req.path);
    }
  }
  
  next();
};

// API response optimization
const apiOptimization = (req, res, next) => {
  // Set API-specific headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Enable CORS for API routes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  // Set cache headers for GET requests
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log slow responses
    if (duration > 1000) { // 1 second
      console.warn('Slow response detected:', {
        url: req.url,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }
    
    // Set performance headers
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    res.setHeader('X-Process-Time', `${duration.toFixed(2)}ms`);
  });
  
  next();
};

// Export all optimization middleware
module.exports = {
  // Compression
  compressionMiddleware,
  gzipCompression,
  
  // Static files
  serveStatic,
  staticFilesConfig,
  
  // Caching
  cacheControl,
  noCache,
  etag,
  
  // Performance
  responseTime,
  performanceMonitor,
  memoryMonitor,
  
  // Optimization
  bodySizeOptimization,
  responseOptimization,
  queryOptimization,
  imageOptimization,
  apiOptimization,
  
  // Configuration
  compressionConfig
};
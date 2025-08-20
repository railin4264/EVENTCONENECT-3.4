const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom token for request body size
morgan.token('body-size', (req) => {
  if (req.body) {
    return JSON.stringify(req.body).length;
  }
  return 0;
});

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return ms.toFixed(2);
});

// Custom token for user agent
morgan.token('user-agent', (req) => {
  return req.get('User-Agent') || 'Unknown';
});

// Custom token for referrer
morgan.token('referrer', (req) => {
  return req.get('Referrer') || 'Direct';
});

// Custom token for IP address
morgan.token('ip', (req) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'Anonymous';
});

// Custom token for request method with color
morgan.token('method-color', (req) => {
  const method = req.method;
  const colors = {
    GET: '\x1b[32m',     // Green
    POST: '\x1b[34m',    // Blue
    PUT: '\x1b[33m',     // Yellow
    DELETE: '\x1b[31m',  // Red
    PATCH: '\x1b[35m',   // Magenta
    OPTIONS: '\x1b[36m', // Cyan
    HEAD: '\x1b[37m'     // White
  };
  const reset = '\x1b[0m';
  return `${colors[method] || '\x1b[0m'}${method}${reset}`;
});

// Custom token for status code with color
morgan.token('status-color', (req, res) => {
  const status = res.statusCode;
  let color = '\x1b[0m'; // Default
  
  if (status >= 500) {
    color = '\x1b[31m'; // Red for server errors
  } else if (status >= 400) {
    color = '\x1b[33m'; // Yellow for client errors
  } else if (status >= 300) {
    color = '\x1b[36m'; // Cyan for redirects
  } else if (status >= 200) {
    color = '\x1b[32m'; // Green for success
  }
  
  const reset = '\x1b[0m';
  return `${color}${status}${reset}`;
});

// Development format (colored, detailed)
const devFormat = ':method-color :url :status-color :response-time-ms ms - :user-id - :ip - :user-agent';

// Production format (minimal, structured)
const prodFormat = ':method :url :status :response-time-ms :user-id :ip :referrer';

// JSON format for structured logging
const jsonFormat = (tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time-ms'](req, res),
    userAgent: tokens['user-agent'](req, res),
    ip: tokens.ip(req, res),
    userId: tokens['user-id'](req, res),
    referrer: tokens.referrer(req, res),
    bodySize: tokens['body-size'](req, res),
    userAgent: tokens['user-agent'](req, res)
  });
};

// Create write streams for different log levels
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

const combinedLogStream = fs.createWriteStream(
  path.join(logsDir, 'combined.log'),
  { flags: 'a' }
);

// Development logger
const devLogger = morgan(devFormat, {
  skip: (req, res) => res.statusCode >= 400
});

// Production logger
const prodLogger = morgan(prodFormat, {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400
});

// Error logger
const errorLogger = morgan(prodFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Combined logger
const combinedLogger = morgan(prodFormat, {
  stream: combinedLogStream
});

// JSON logger for structured logging
const jsonLogger = morgan(jsonFormat, {
  stream: accessLogStream
});

// Request logger middleware
const requestLogger = (req, res, next) => {
  // Add timestamp to request
  req._startAt = process.hrtime();
  
  // Log request details
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : 'Anonymous',
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'content-type': req.get('Content-Type'),
      'content-length': req.get('Content-Length'),
      'authorization': req.get('Authorization') ? 'Bearer ***' : undefined,
      'cookie': req.get('Cookie') ? '***' : undefined
    }
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📥 Request:', {
      method: logData.method,
      url: logData.url,
      ip: logData.ip,
      userId: logData.userId
    });
  }

  // Store log data for response logging
  req._logData = logData;
  
  next();
};

// Response logger middleware
const responseLogger = (req, res, next) => {
  // Override res.end to capture response data
  const originalEnd = res.end;
  const originalSend = res.send;
  
  res.send = function(data) {
    res._responseData = data;
    return originalSend.call(this, data);
  };
  
  res.end = function(chunk, encoding) {
    if (chunk) {
      res._responseData = chunk;
    }
    
    // Log response
    const responseTime = process.hrtime(req._startAt);
    const responseTimeMs = (responseTime[0] * 1000 + responseTime[1] / 1000000).toFixed(2);
    
    const logData = {
      ...req._logData,
      responseTime: responseTimeMs,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseSize: res.get('Content-Length') || 0,
      responseHeaders: {
        'content-type': res.get('Content-Type'),
        'content-length': res.get('Content-Length')
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const reset = '\x1b[0m';
      
      console.log(`📤 Response: ${statusColor}${res.statusCode}${reset} - ${responseTimeMs}ms - ${req.method} ${req.url}`);
    }

    // Write to log file
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${responseTimeMs}ms - ${req.ip} - ${req.user ? req.user.id : 'Anonymous'}\n`;
    
    if (res.statusCode >= 400) {
      errorLogStream.write(logEntry);
    } else {
      accessLogStream.write(logEntry);
    }
    
    combinedLogStream.write(logEntry);
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      const slowLogEntry = `${new Date().toISOString()} - SLOW REQUEST: ${req.method} ${req.url} - ${duration.toFixed(2)}ms - ${req.ip}\n`;
      fs.appendFileSync(path.join(logsDir, 'slow-requests.log'), slowLogEntry);
    }
    
    // Log performance metrics
    const perfLogEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - ${duration.toFixed(2)}ms - ${res.statusCode}\n`;
    fs.appendFileSync(path.join(logsDir, 'performance.log'), perfLogEntry);
  });
  
  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log potential security issues
  const securityIssues = [];
  
  // Check for suspicious headers
  if (req.get('X-Forwarded-For') && !req.get('X-Real-IP')) {
    securityIssues.push('Potential IP spoofing attempt');
  }
  
  // Check for suspicious user agents
  const userAgent = req.get('User-Agent');
  if (userAgent && (
    userAgent.includes('bot') ||
    userAgent.includes('crawler') ||
    userAgent.includes('spider') ||
    userAgent.length > 500
  )) {
    securityIssues.push('Suspicious user agent');
  }
  
  // Check for suspicious request patterns
  if (req.url.includes('..') || req.url.includes('//')) {
    securityIssues.push('Path traversal attempt');
  }
  
  // Log security issues
  if (securityIssues.length > 0) {
    const securityLogEntry = `${new Date().toISOString()} - SECURITY: ${req.method} ${req.url} - ${req.ip} - Issues: ${securityIssues.join(', ')}\n`;
    fs.appendFileSync(path.join(logsDir, 'security.log'), securityLogEntry);
  }
  
  next();
};

// Error logging middleware
const errorLogger = (error, req, res, next) => {
  const errorLogEntry = `${new Date().toISOString()} - ERROR: ${error.message} - ${req.method} ${req.url} - ${req.ip} - Stack: ${error.stack}\n`;
  fs.appendFileSync(path.join(logsDir, 'errors.log'), errorLogEntry);
  
  next(error);
};

// Log rotation function
const rotateLogs = () => {
  const logFiles = ['access.log', 'error.log', 'combined.log', 'performance.log', 'security.log', 'slow-requests.log', 'errors.log'];
  
  logFiles.forEach(filename => {
    const logPath = path.join(logsDir, filename);
    
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // Rotate if file is larger than 10MB
      if (fileSizeInMB > 10) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = path.join(logsDir, `${filename}.${timestamp}`);
        
        try {
          fs.renameSync(logPath, rotatedPath);
          console.log(`Log rotated: ${filename} -> ${filename}.${timestamp}`);
        } catch (error) {
          console.error(`Error rotating log ${filename}:`, error);
        }
      }
    }
  });
};

// Schedule log rotation (daily at midnight)
const scheduleLogRotation = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    rotateLogs();
    // Schedule next rotation
    setInterval(rotateLogs, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
};

// Initialize log rotation
scheduleLogRotation();

// Export middleware functions
module.exports = {
  // Morgan loggers
  devLogger,
  prodLogger,
  errorLogger,
  combinedLogger,
  jsonLogger,
  
  // Custom loggers
  requestLogger,
  responseLogger,
  performanceMonitor,
  securityLogger,
  errorLogger: errorLogger,
  
  // Utility functions
  rotateLogs,
  scheduleLogRotation
};
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General rate limiting
const general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const auth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for file uploads
const upload = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for actions (join, leave, mark interested, etc.)
const actions = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 actions per windowMs
  message: {
    success: false,
    message: 'Too many actions, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for content creation
const creation = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 creations per windowMs
  message: {
    success: false,
    message: 'Too many creations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for content modification
const modification = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 modifications per windowMs
  message: {
    success: false,
    message: 'Too many modifications, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for search operations
const search = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 searches per windowMs
  message: {
    success: false,
    message: 'Too many searches, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for content operations
const content = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 content operations per windowMs
  message: {
    success: false,
    message: 'Too many content operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for AI operations
const ai = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 AI operations per windowMs
  message: {
    success: false,
    message: 'Too many AI operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for webhook operations
const webhook = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 webhook calls per windowMs
  message: {
    success: false,
    message: 'Too many webhook calls, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiting for general requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: () => 500 // begin adding 500ms of delay per request above 50
});

// Speed limiting for auth requests
const authSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3, // allow 3 requests per 15 minutes, then...
  delayMs: () => 1000 // begin adding 1000ms of delay per request above 3
});

module.exports = {
  general,
  auth,
  upload,
  actions,
  creation,
  modification,
  search,
  content,
  ai,
  webhook,
  speedLimiter,
  authSpeedLimiter
};

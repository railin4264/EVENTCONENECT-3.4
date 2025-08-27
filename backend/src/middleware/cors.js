// Enhanced CORS middleware for EventConnect
const cors = require('cors');

const createCorsOptions = () => {
  // Allowed origins from environment or defaults
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.WEB_URL,
    process.env.MOBILE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:19006', // Expo development server
    'http://localhost:8081',  // React Native packager
    'exp://localhost:19000',  // Expo client
    'exp://192.168.1.100:19000', // Expo on local network (adjust IP as needed)
  ].filter(Boolean);

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, allow localhost with any port
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      // Reject the request
      const error = new Error(`Origin ${origin} not allowed by CORS policy`);
      error.status = 403;
      callback(error);
    },
    
    credentials: true,
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name',
      'X-CSRF-Token',
      'X-API-Key'
    ],
    
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count', 
      'X-Current-Page',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset'
    ],
    
    // How long the browser should cache preflight responses
    maxAge: 86400, // 24 hours
    
    // Handle preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 204 // For legacy browser support
  };
};

// Create CORS middleware
const corsMiddleware = cors(createCorsOptions());

// Enhanced CORS for specific routes that need more permissive settings
const publicCorsOptions = cors({
  origin: true, // Allow all origins for public endpoints
  credentials: false,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400
});

// CORS for file uploads (more permissive for multipart forms)
const uploadCorsOptions = cors({
  ...createCorsOptions(),
  allowedHeaders: [
    ...createCorsOptions().allowedHeaders,
    'Content-Length',
    'X-File-Type',
    'X-File-Size'
  ]
});

module.exports = {
  corsMiddleware,
  publicCorsOptions,
  uploadCorsOptions,
  createCorsOptions
};

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup test environment
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  process.env.REDIS_URL = 'redis://localhost:6379/1';

  // Start in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('🧪 Test environment setup completed');
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from test database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Stop in-memory MongoDB
  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log('🧹 Test environment cleanup completed');
});

// Clean database before each test
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const bcrypt = require('bcryptjs');
    const { User } = require('../src/models');
    
    const defaultUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Test',
      lastName: 'User',
      isVerified: true,
      ...userData
    };

    const user = new User(defaultUser);
    return await user.save();
  },

  // Create test event
  createTestEvent: async (eventData = {}, hostId) => {
    const { Event } = require('../src/models');
    
    const defaultEvent = {
      title: 'Test Event',
      description: 'A test event for testing purposes',
      category: 'technology',
      subcategory: 'meetup',
      tags: ['test', 'technology'],
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
        address: '123 Test St, New York, NY 10001',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        venue: 'Test Venue'
      },
      capacity: 50,
      pricing: { type: 'free', price: 0, currency: 'USD' },
      isPrivate: false,
      host: hostId,
      ...eventData
    };

    const event = new Event(defaultEvent);
    return await event.save();
  },

  // Generate JWT token for testing
  generateTestToken: (userId, isAdmin = false) => {
    const jwt = require('jsonwebtoken');
    const payload = {
      userId,
      isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET);
  },

  // Generate expired JWT token for testing
  generateExpiredToken: (userId) => {
    const jwt = require('jsonwebtoken');
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000) - (20 * 60), // 20 minutes ago
      exp: Math.floor(Date.now() / 1000) - (5 * 60) // 5 minutes ago
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET);
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random MongoDB ObjectId
  generateObjectId: () => new mongoose.Types.ObjectId(),

  // Generate random string
  generateRandomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate random email
  generateRandomEmail: () => {
    const username = global.testUtils.generateRandomString(8);
    const domain = global.testUtils.generateRandomString(6);
    return `${username}@${domain}.com`;
  },

  // Generate random coordinates
  generateRandomCoordinates: () => {
    const lat = (Math.random() - 0.5) * 180; // -90 to 90
    const lng = (Math.random() - 0.5) * 360; // -180 to 180
    return [lng, lat];
  }
};

// Mock console methods during tests to reduce noise
const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console.log during tests unless explicitly needed
  if (process.env.SHOW_LOGS !== 'true') {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, just log the error
});

// Handle uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in tests, just log the error
});

// Export test utilities for use in test files
module.exports = global.testUtils;
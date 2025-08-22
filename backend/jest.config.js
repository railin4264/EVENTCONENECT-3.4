module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Test coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/scripts/**/*.js',
    '!src/config/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module name mapping (corrected)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Coverage ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/dist/',
    '/build/',
    'jest.config.js',
    'babel.config.js'
  ],
  
  // Test reporters
  reporters: [
    'default'
  ],
  
  // Watch plugins
  // watchPlugins disabled in CI to avoid missing dependencies in some envs
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Maximum workers
  maxWorkers: '50%',
  
  // Force exit
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true
};
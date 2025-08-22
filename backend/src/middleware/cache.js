const { redisService } = require('../config/redis');

/**
 * Cache middleware for Express
 */
class CacheMiddleware {
  /**
   *
   */
  constructor() {
    this.defaultTTL = 3600; // 1 hour
    this.cachePrefix = 'api:';
  }

  /**
   * Generate cache key from request
   * @param {Object} req - Express request object
   * @returns {string} Cache key
   */
  generateCacheKey(req) {
    const { url, method, query, params, user } = req;

    // Create a unique key based on request details
    const keyParts = [
      this.cachePrefix,
      method.toLowerCase(),
      url,
      user?.id || 'anonymous',
    ];

    // Add query parameters if they exist
    if (Object.keys(query).length > 0) {
      const sortedQuery = Object.keys(query)
        .sort()
        .map(key => `${key}=${query[key]}`)
        .join('&');
      keyParts.push(sortedQuery);
    }

    // Add route parameters if they exist
    if (Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      keyParts.push(sortedParams);
    }

    return keyParts.join(':');
  }

  /**
   * Cache middleware for GET requests
   * @param {number} ttl - Time to live in seconds
   * @returns {Function} Express middleware function
   */
  cache(ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const cacheKey = this.generateCacheKey(req);
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
          // Return cached data
          return res.json(cachedData);
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = function (data) {
          // Cache the response data
          redisService.set(cacheKey, data, ttl).catch(error => {
            console.error('Error caching response:', error);
          });

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache middleware with custom key generation
   * @param {Function} keyGenerator - Custom key generation function
   * @param {number} ttl - Time to live in seconds
   * @returns {Function} Express middleware function
   */
  cacheWithCustomKey(keyGenerator, ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const cacheKey = keyGenerator(req);
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
          // Return cached data
          return res.json(cachedData);
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = function (data) {
          // Cache the response data
          redisService.set(cacheKey, data, ttl).catch(error => {
            console.error('Error caching response:', error);
          });

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache middleware for specific routes
   * @param {Array} routes - Array of route patterns to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Function} Express middleware function
   */
  cacheRoutes(routes, ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check if current route should be cached
      const shouldCache = routes.some(route => {
        if (typeof route === 'string') {
          return req.path.startsWith(route);
        }
        if (route instanceof RegExp) {
          return route.test(req.path);
        }
        return false;
      });

      if (!shouldCache) {
        return next();
      }

      try {
        const cacheKey = this.generateCacheKey(req);
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
          // Return cached data
          return res.json(cachedData);
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = function (data) {
          // Cache the response data
          redisService.set(cacheKey, data, ttl).catch(error => {
            console.error('Error caching response:', error);
          });

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache middleware with conditional logic
   * @param {Function} condition - Function that returns true if request should be cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Function} Express middleware function
   */
  cacheConditional(condition, ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check if request should be cached
      if (!condition(req)) {
        return next();
      }

      try {
        const cacheKey = this.generateCacheKey(req);
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
          // Return cached data
          return res.json(cachedData);
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = function (data) {
          // Cache the response data
          redisService.set(cacheKey, data, ttl).catch(error => {
            console.error('Error caching response:', error);
          });

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Clear cache for specific key
   * @param {string} key - Cache key to clear
   * @returns {Promise<boolean>} Success status
   */
  async clearCache(key) {
    try {
      return await redisService.del(key);
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clear cache for specific pattern
   * @param {string} pattern - Cache key pattern to clear
   * @returns {Promise<number>} Number of keys cleared
   */
  async clearCachePattern(pattern) {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use Redis SCAN command
      const keys = await redisService.keys(pattern);
      let clearedCount = 0;

      for (const key of keys) {
        const success = await redisService.del(key);
        if (success) {
          clearedCount++;
        }
      }

      return clearedCount;
    } catch (error) {
      console.error('Error clearing cache pattern:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} Success status
   */
  async clearAllCache() {
    try {
      return await redisService.flushdb();
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    try {
      const info = await redisService.info();
      const memory = await redisService.memory();

      return {
        connected: redisService.getConnectionStatus(),
        info,
        memory,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Health check for cache service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const ping = await redisService.ping();

      return {
        status: ping === 'PONG' ? 'healthy' : 'unhealthy',
        ping,
        connected: redisService.getConnectionStatus(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Create and export cache middleware instance
const cacheMiddleware = new CacheMiddleware();

module.exports = {
  cacheMiddleware,
  CacheMiddleware,
};

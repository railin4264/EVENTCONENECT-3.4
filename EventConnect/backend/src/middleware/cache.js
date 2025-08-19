const redisClient = require('../config/redis');
const crypto = require('crypto');

// Cache configuration
const cacheConfig = {
  defaultTTL: 300, // 5 minutes in seconds
  maxTTL: 86400, // 24 hours in seconds
  prefix: 'cache:',
  compression: true
};

// Cache middleware
const cache = (ttl = cacheConfig.defaultTTL, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Generate cache key
      const cacheKey = keyGenerator ? keyGenerator(req) : generateCacheKey(req);
      
      // Try to get from cache
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Return cached data
        res.json(JSON.parse(cachedData));
        return;
      }

      // Store original send method
      const originalSend = res.send;
      
      // Override send method to cache response
      res.send = async function(data) {
        try {
          // Cache the response
          if (data && typeof data === 'object') {
            const dataToCache = JSON.stringify(data);
            await redisClient.set(cacheKey, dataToCache, ttl);
          }
        } catch (error) {
          console.error('Error caching response:', error);
        }
        
        // Call original send method
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Generate cache key from request
const generateCacheKey = (req) => {
  const keyParts = [
    req.method,
    req.originalUrl,
    req.user ? req.user.id : 'anonymous',
    JSON.stringify(req.query),
    JSON.stringify(req.params)
  ];
  
  const keyString = keyParts.join('|');
  const hash = crypto.createHash('md5').update(keyString).digest('hex');
  
  return `${cacheConfig.prefix}${hash}`;
};

// Custom cache key generator for specific routes
const routeCacheKey = (route) => {
  return (req) => {
    return `${cacheConfig.prefix}${route}:${req.user ? req.user.id : 'anonymous'}:${JSON.stringify(req.query)}`;
  };
};

// Model-specific cache key generator
const modelCacheKey = (modelName, identifier = 'id') => {
  return (req) => {
    const id = req.params[identifier] || req.query[identifier];
    return `${cacheConfig.prefix}${modelName}:${id}`;
  };
};

// User-specific cache key generator
const userCacheKey = (prefix = '') => {
  return (req) => {
    const userId = req.user ? req.user.id : 'anonymous';
    const queryHash = crypto.createHash('md5').update(JSON.stringify(req.query)).digest('hex');
    return `${cacheConfig.prefix}${prefix}:user:${userId}:${queryHash}`;
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    try {
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to invalidate cache after successful operations
      res.send = async function(data) {
        try {
          // Invalidate cache patterns
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await invalidateCachePatterns(patterns, req);
          }
        } catch (error) {
          console.error('Error invalidating cache:', error);
        }
        
        // Call original send method
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache invalidation middleware error:', error);
      next();
    }
  };
};

// Invalidate cache patterns
const invalidateCachePatterns = async (patterns, req) => {
  try {
    for (const pattern of patterns) {
      let cachePattern = pattern;
      
      // Replace placeholders with actual values
      if (req.params.id) {
        cachePattern = cachePattern.replace(':id', req.params.id);
      }
      
      if (req.user) {
        cachePattern = cachePattern.replace(':userId', req.user.id);
      }
      
      if (req.params.eventId) {
        cachePattern = cachePattern.replace(':eventId', req.params.eventId);
      }
      
      if (req.params.tribeId) {
        cachePattern = cachePattern.replace(':tribeId', req.params.tribeId);
      }
      
      // Get all keys matching the pattern
      const keys = await redisClient.keys(`${cacheConfig.prefix}${cachePattern}`);
      
      // Delete matching keys
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisClient.del(key)));
        console.log(`🗑️ Cache invalidated: ${keys.length} keys for pattern ${cachePattern}`);
      }
    }
  } catch (error) {
    console.error('Error invalidating cache patterns:', error);
  }
};

// Cache warming middleware
const warmCache = (dataProvider, key, ttl = cacheConfig.defaultTTL) => {
  return async (req, res, next) => {
    try {
      // Check if cache is warm
      const cacheKey = `${cacheConfig.prefix}${key}`;
      const cachedData = await redisClient.get(cacheKey);
      
      if (!cachedData) {
        // Warm the cache in background
        setImmediate(async () => {
          try {
            const data = await dataProvider();
            if (data) {
              await redisClient.set(cacheKey, JSON.stringify(data), ttl);
              console.log(`🔥 Cache warmed for key: ${key}`);
            }
          } catch (error) {
            console.error('Error warming cache:', error);
          }
        });
      }
      
      next();
    } catch (error) {
      console.error('Cache warming middleware error:', error);
      next();
    }
  };
};

// Cache statistics middleware
const cacheStats = async (req, res, next) => {
  try {
    const stats = await getCacheStats();
    req.cacheStats = stats;
    next();
  } catch (error) {
    console.error('Cache stats middleware error:', error);
    req.cacheStats = {};
    next();
  }
};

// Get cache statistics
const getCacheStats = async () => {
  try {
    const keys = await redisClient.keys(`${cacheConfig.prefix}*`);
    const totalKeys = keys.length;
    
    // Get memory usage
    const memoryInfo = await redisClient.client.info('memory');
    const memoryUsage = parseMemoryInfo(memoryInfo);
    
    // Get cache hit rate (this would need to be implemented with counters)
    const hitRate = await getCacheHitRate();
    
    return {
      totalKeys,
      memoryUsage,
      hitRate,
      prefix: cacheConfig.prefix,
      defaultTTL: cacheConfig.defaultTTL
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {};
  }
};

// Parse Redis memory info
const parseMemoryInfo = (memoryInfo) => {
  try {
    const lines = memoryInfo.split('\r\n');
    const memory = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        memory[key] = value;
      }
    });
    
    return {
      usedMemory: memory.used_memory_human || 'N/A',
      usedMemoryPeak: memory.used_memory_peak_human || 'N/A',
      usedMemoryRss: memory.used_memory_rss_human || 'N/A'
    };
  } catch (error) {
    return { error: 'Could not parse memory info' };
  }
};

// Get cache hit rate (simplified implementation)
const getCacheHitRate = async () => {
  try {
    // This would need to be implemented with Redis counters
    // For now, return a placeholder
    return {
      hits: 0,
      misses: 0,
      rate: 'N/A'
    };
  } catch (error) {
    return { error: 'Could not get hit rate' };
  }
};

// Cache middleware for specific models
const modelCache = (modelName, ttl = cacheConfig.defaultTTL) => {
  return cache(ttl, modelCacheKey(modelName));
};

// Cache middleware for user-specific data
const userCache = (prefix = '', ttl = cacheConfig.defaultTTL) => {
  return cache(ttl, userCacheKey(prefix));
};

// Cache middleware for search results
const searchCache = (ttl = 600) => { // 10 minutes for search results
  return cache(ttl, (req) => {
    const searchQuery = req.query.q || req.query.search || '';
    const queryHash = crypto.createHash('md5').update(searchQuery).digest('hex');
    return `${cacheConfig.prefix}search:${queryHash}`;
  });
};

// Cache middleware for location-based queries
const locationCache = (ttl = 300) => { // 5 minutes for location data
  return cache(ttl, (req) => {
    const { lat, lng, radius } = req.query;
    const locationKey = `${lat}:${lng}:${radius}`;
    const hash = crypto.createHash('md5').update(locationKey).digest('hex');
    return `${cacheConfig.prefix}location:${hash}`;
  });
};

// Cache middleware for paginated results
const paginationCache = (ttl = 300) => {
  return cache(ttl, (req) => {
    const { page, limit, sort, order } = req.query;
    const paginationKey = `${page}:${limit}:${sort}:${order}`;
    const hash = crypto.createHash('md5').update(paginationKey).digest('hex');
    return `${cacheConfig.prefix}pagination:${hash}`;
  });
};

// Cache middleware for API responses
const apiCache = (ttl = 300) => {
  return cache(ttl, (req) => {
    const apiKey = `${req.method}:${req.originalUrl}`;
    const userKey = req.user ? req.user.id : 'anonymous';
    const queryKey = JSON.stringify(req.query);
    const combinedKey = `${apiKey}:${userKey}:${queryKey}`;
    const hash = crypto.createHash('md5').update(combinedKey).digest('hex');
    return `${cacheConfig.prefix}api:${hash}`;
  });
};

// Cache middleware for static data
const staticCache = (ttl = 86400) => { // 24 hours for static data
  return cache(ttl, (req) => {
    return `${cacheConfig.prefix}static:${req.originalUrl}`;
  });
};

// Cache middleware for user profile data
const profileCache = (ttl = 1800) => { // 30 minutes for profile data
  return cache(ttl, (req) => {
    const userId = req.params.userId || req.user?.id || 'anonymous';
    return `${cacheConfig.prefix}profile:${userId}`;
  });
};

// Cache middleware for event data
const eventCache = (ttl = 900) => { // 15 minutes for event data
  return cache(ttl, (req) => {
    const eventId = req.params.eventId || req.params.id;
    return eventId ? `${cacheConfig.prefix}event:${eventId}` : `${cacheConfig.prefix}events:list`;
  });
};

// Cache middleware for tribe data
const tribeCache = (ttl = 900) => { // 15 minutes for tribe data
  return cache(ttl, (req) => {
    const tribeId = req.params.tribeId || req.params.id;
    return tribeId ? `${cacheConfig.prefix}tribe:${tribeId}` : `${cacheConfig.prefix}tribes:list`;
  });
};

// Cache middleware for post data
const postCache = (ttl = 600) => { // 10 minutes for post data
  return cache(ttl, (req) => {
    const postId = req.params.postId || req.params.id;
    return postId ? `${cacheConfig.prefix}post:${postId}` : `${cacheConfig.prefix}posts:list`;
  });
};

// Cache middleware for user feed
const feedCache = (ttl = 300) => { // 5 minutes for feed data
  return cache(ttl, (req) => {
    const userId = req.user?.id || 'anonymous';
    const { page, limit, filter } = req.query;
    const feedKey = `${userId}:${page}:${limit}:${filter}`;
    const hash = crypto.createHash('md5').update(feedKey).digest('hex');
    return `${cacheConfig.prefix}feed:${hash}`;
  });
};

// Export all cache middleware
module.exports = {
  // Basic cache middleware
  cache,
  invalidateCache,
  warmCache,
  cacheStats,
  
  // Specific cache middleware
  modelCache,
  userCache,
  searchCache,
  locationCache,
  paginationCache,
  apiCache,
  staticCache,
  profileCache,
  eventCache,
  tribeCache,
  postCache,
  feedCache,
  
  // Utility functions
  generateCacheKey,
  routeCacheKey,
  modelCacheKey,
  userCacheKey,
  invalidateCachePatterns,
  getCacheStats,
  
  // Configuration
  cacheConfig
};
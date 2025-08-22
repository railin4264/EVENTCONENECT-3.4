const redis = require('redis');

/**
 * Redis Configuration and Management Service
 */
class RedisService {
  /**
   *
   */
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000;
  }

  /**
   * Connect to Redis
   * @returns {Promise<boolean>} Connection success
   */
  async connect() {
    try {
      if (this.client && this.isConnected) {
        return true;
      }

      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisPassword = process.env.REDIS_PASSWORD;
      const redisDb = parseInt(process.env.REDIS_DB) || 0;

      // Create Redis client
      this.client = redis.createClient({
        url: redisUrl,
        password: redisPassword,
        database: redisDb,
        retry_strategy: options => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('❌ Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.error('❌ Redis retry time exhausted');
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > this.maxRetries) {
            console.error('❌ Redis max retries exceeded');
            return new Error('Redis max retries exceeded');
          }
          return Math.min(options.attempt * this.retryDelay, 3000);
        },
        socket: {
          connectTimeout: 10000,
          lazyConnect: true,
        },
      });

      // Event handlers
      this.client.on('connect', () => {
        console.log('🔄 Conectando a Redis...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis conectado y listo');
        this.isConnected = true;
        this.connectionRetries = 0;
      });

      this.client.on('error', error => {
        console.error('❌ Error de Redis:', error);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Conexión a Redis cerrada');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Reconectando a Redis...');
        this.connectionRetries++;
      });

      // Connect to Redis
      await this.client.connect();

      return true;
    } catch (error) {
      console.error('❌ Error conectando a Redis:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from Redis
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        console.log('🔌 Desconectado de Redis');
      }
    } catch (error) {
      console.error('❌ Error desconectando de Redis:', error);
    }
  }

  /**
   * Check if Redis is connected
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get Redis client
   * @returns {Object|null} Redis client
   */
  getClient() {
    return this.client;
  }

  /**
   * Set key-value pair
   * @param {string} key - Redis key
   * @param {*} value - Value to store
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serializedValue =
        typeof value === 'object' ? JSON.stringify(value) : value;

      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      console.error('Error setting Redis key:', error);
      return false;
    }
  }

  /**
   * Get value by key
   * @param {string} key - Redis key
   * @returns {Promise<*>} Stored value
   */
  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.client.get(key);

      if (value === null) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error getting Redis key:', error);
      return null;
    }
  }

  /**
   * Delete key
   * @param {string} key - Redis key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Error deleting Redis key:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Redis key
   * @returns {Promise<boolean>} Key existence
   */
  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Error checking Redis key existence:', error);
      return false;
    }
  }

  /**
   * Set key expiration
   * @param {string} key - Redis key
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async expire(key, ttl) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.expire(key, ttl);
      return result > 0;
    } catch (error) {
      console.error('Error setting Redis key expiration:', error);
      return false;
    }
  }

  /**
   * Get key time to live
   * @param {string} key - Redis key
   * @returns {Promise<number>} TTL in seconds
   */
  async ttl(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.ttl(key);
    } catch (error) {
      console.error('Error getting Redis key TTL:', error);
      return -1;
    }
  }

  /**
   * Increment key value
   * @param {string} key - Redis key
   * @param {number} increment - Increment value
   * @returns {Promise<number>} New value
   */
  async incr(key, increment = 1) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      if (increment === 1) {
        return await this.client.incr(key);
      } else {
        return await this.client.incrBy(key, increment);
      }
    } catch (error) {
      console.error('Error incrementing Redis key:', error);
      return null;
    }
  }

  /**
   * Decrement key value
   * @param {string} key - Redis key
   * @param {number} decrement - Decrement value
   * @returns {Promise<number>} New value
   */
  async decr(key, decrement = 1) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      if (decrement === 1) {
        return await this.client.decr(key);
      } else {
        return await this.client.decrBy(key, decrement);
      }
    } catch (error) {
      console.error('Error decrementing Redis key:', error);
      return null;
    }
  }

  /**
   * Add to set
   * @param {string} key - Redis key
   * @param {*} member - Set member
   * @returns {Promise<boolean>} Success status
   */
  async sadd(key, member) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.sAdd(key, member);
      return result > 0;
    } catch (error) {
      console.error('Error adding to Redis set:', error);
      return false;
    }
  }

  /**
   * Remove from set
   * @param {string} key - Redis key
   * @param {*} member - Set member
   * @returns {Promise<boolean>} Success status
   */
  async srem(key, member) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.sRem(key, member);
      return result > 0;
    } catch (error) {
      console.error('Error removing from Redis set:', error);
      return false;
    }
  }

  /**
   * Get set members
   * @param {string} key - Redis key
   * @returns {Promise<Array>} Set members
   */
  async smembers(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.sMembers(key);
    } catch (error) {
      console.error('Error getting Redis set members:', error);
      return [];
    }
  }

  /**
   * Check if member exists in set
   * @param {string} key - Redis key
   * @param {*} member - Set member
   * @returns {Promise<boolean>} Member existence
   */
  async sismember(key, member) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.sIsMember(key, member);
    } catch (error) {
      console.error('Error checking Redis set membership:', error);
      return false;
    }
  }

  /**
   * Get set size
   * @param {string} key - Redis key
   * @returns {Promise<number>} Set size
   */
  async scard(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.sCard(key);
    } catch (error) {
      console.error('Error getting Redis set size:', error);
      return 0;
    }
  }

  /**
   * Add to hash
   * @param {string} key - Redis key
   * @param {string} field - Hash field
   * @param {*} value - Field value
   * @returns {Promise<boolean>} Success status
   */
  async hset(key, field, value) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serializedValue =
        typeof value === 'object' ? JSON.stringify(value) : value;
      const result = await this.client.hSet(key, field, serializedValue);
      return result > 0;
    } catch (error) {
      console.error('Error setting Redis hash field:', error);
      return false;
    }
  }

  /**
   * Get hash field value
   * @param {string} key - Redis key
   * @param {string} field - Hash field
   * @returns {Promise<*>} Field value
   */
  async hget(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.client.hGet(key, field);

      if (value === null) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error getting Redis hash field:', error);
      return null;
    }
  }

  /**
   * Get all hash fields
   * @param {string} key - Redis key
   * @returns {Promise<Object>} Hash fields
   */
  async hgetall(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const hash = await this.client.hGetAll(key);
      const result = {};

      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting Redis hash:', error);
      return {};
    }
  }

  /**
   * Delete hash field
   * @param {string} key - Redis key
   * @param {string} field - Hash field
   * @returns {Promise<boolean>} Success status
   */
  async hdel(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hDel(key, field);
      return result > 0;
    } catch (error) {
      console.error('Error deleting Redis hash field:', error);
      return false;
    }
  }

  /**
   * Check if hash field exists
   * @param {string} key - Redis key
   * @param {string} field - Hash field
   * @returns {Promise<boolean>} Field existence
   */
  async hexists(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.hExists(key, field);
    } catch (error) {
      console.error('Error checking Redis hash field existence:', error);
      return false;
    }
  }

  /**
   * Get hash size
   * @param {string} key - Redis key
   * @returns {Promise<number>} Hash size
   */
  async hlen(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.hLen(key);
    } catch (error) {
      console.error('Error getting Redis hash size:', error);
      return 0;
    }
  }

  /**
   * Push to list
   * @param {string} key - Redis key
   * @param {*} value - List value
   * @param {string} direction - 'left' or 'right'
   * @returns {Promise<number>} List length
   */
  async push(key, value, direction = 'right') {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serializedValue =
        typeof value === 'object' ? JSON.stringify(value) : value;

      if (direction === 'left') {
        return await this.client.lPush(key, serializedValue);
      } else {
        return await this.client.rPush(key, serializedValue);
      }
    } catch (error) {
      console.error('Error pushing to Redis list:', error);
      return 0;
    }
  }

  /**
   * Pop from list
   * @param {string} key - Redis key
   * @param {string} direction - 'left' or 'right'
   * @returns {Promise<*>} Popped value
   */
  async pop(key, direction = 'left') {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      let value;

      if (direction === 'left') {
        value = await this.client.lPop(key);
      } else {
        value = await this.client.rPop(key);
      }

      if (value === null) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error popping from Redis list:', error);
      return null;
    }
  }

  /**
   * Get list range
   * @param {string} key - Redis key
   * @param {number} start - Start index
   * @param {number} stop - Stop index
   * @returns {Promise<Array>} List range
   */
  async lrange(key, start, stop) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const values = await this.client.lRange(key, start, stop);
      const result = [];

      for (const value of values) {
        try {
          result.push(JSON.parse(value));
        } catch {
          result.push(value);
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting Redis list range:', error);
      return [];
    }
  }

  /**
   * Get list length
   * @param {string} key - Redis key
   * @returns {Promise<number>} List length
   */
  async llen(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.lLen(key);
    } catch (error) {
      console.error('Error getting Redis list length:', error);
      return 0;
    }
  }

  /**
   * Flush database
   * @returns {Promise<boolean>} Success status
   */
  async flushdb() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      await this.client.flushDb();
      return true;
    } catch (error) {
      console.error('Error flushing Redis database:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   * @returns {Promise<Object>} Redis information
   */
  async info() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const info = await this.client.info();
      const lines = info.split('\r\n');
      const result = {};

      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (key && value) {
            result[key] = value;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting Redis info:', error);
      return {};
    }
  }

  /**
   * Get Redis memory usage
   * @returns {Promise<Object>} Memory usage information
   */
  async memory() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const memory = await this.client.memoryUsage();
      return memory;
    } catch (error) {
      console.error('Error getting Redis memory usage:', error);
      return {};
    }
  }

  /**
   * Ping Redis server
   * @returns {Promise<string>} Pong response
   */
  async ping() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.client.ping();
    } catch (error) {
      console.error('Error pinging Redis:', error);
      return null;
    }
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      connectionRetries: this.connectionRetries,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
    };
  }
}

// Create and export Redis service instance
const redisService = new RedisService();

module.exports = {
  redisService,
  RedisService,
};

const redis = require('redis');

// ===== CONFIGURACIÓN DE CACHÉ =====
class CacheService {
  constructor() {
    this.client = null;
    this.fallbackCache = new Map(); // Fallback en memoria
    this.isRedisConnected = false;
  }

  /**
   * Inicializa la conexión a Redis
   */
  async init() {
    try {
      // Intentar conectar a Redis
      if (process.env.REDIS_URL) {
        this.client = redis.createClient({
          url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => {
          console.log('Redis error:', err);
          this.isRedisConnected = false;
        });

        this.client.on('connect', () => {
          console.log('✅ Redis connected');
          this.isRedisConnected = true;
        });

        await this.client.connect();
      } else {
        console.log('⚠️ Redis URL not found, using in-memory cache');
      }
    } catch (error) {
      console.log('⚠️ Redis connection failed, using in-memory cache:', error.message);
      this.isRedisConnected = false;
    }
  }

  /**
   * Obtiene un valor del caché
   */
  async get(key) {
    try {
      if (this.isRedisConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback a caché en memoria
        const item = this.fallbackCache.get(key);
        if (item && item.expiresAt > Date.now()) {
          return item.value;
        } else if (item) {
          this.fallbackCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Guarda un valor en el caché
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      if (this.isRedisConnected && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback a caché en memoria
        this.fallbackCache.set(key, {
          value,
          expiresAt: Date.now() + (ttlSeconds * 1000)
        });
        
        // Limpiar caché en memoria cada 100 elementos
        if (this.fallbackCache.size > 100) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Elimina un valor del caché
   */
  async delete(key) {
    try {
      if (this.isRedisConnected && this.client) {
        await this.client.del(key);
      } else {
        this.fallbackCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Elimina múltiples claves por patrón
   */
  async deletePattern(pattern) {
    try {
      if (this.isRedisConnected && this.client) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        // Para caché en memoria, filtrar por patrón
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.fallbackCache.keys()) {
          if (regex.test(key)) {
            this.fallbackCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache deletePattern error:', error);
    }
  }

  /**
   * Limpia elementos expirados del caché en memoria
   */
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.fallbackCache.entries()) {
      if (item.expiresAt <= now) {
        this.fallbackCache.delete(key);
      }
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getStats() {
    try {
      if (this.isRedisConnected && this.client) {
        const info = await this.client.info('memory');
        return {
          type: 'redis',
          connected: true,
          info
        };
      } else {
        return {
          type: 'memory',
          connected: false,
          size: this.fallbackCache.size,
          maxSize: 100
        };
      }
    } catch (error) {
      console.error('Cache stats error:', error);
      return { type: 'error', connected: false };
    }
  }

  /**
   * Cierra la conexión
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
      }
      this.fallbackCache.clear();
    } catch (error) {
      console.error('Cache close error:', error);
    }
  }
}

// Crear instancia singleton
const cacheService = new CacheService();

// Inicializar automáticamente
cacheService.init().catch(err => {
  console.log('Cache initialization failed:', err.message);
});

module.exports = cacheService;
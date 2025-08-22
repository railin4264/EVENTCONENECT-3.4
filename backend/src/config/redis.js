const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      console.log('🔄 Conectando a Redis...');

      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          keepAlive: 5000,
          family: 4,
        },
        retry_strategy: options => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.warn('⚠️ Redis no disponible, continuando sin cache');
            return undefined; // Don't retry on connection refused
          }
          if (options.total_retry_time > 1000 * 30) { // Reduce retry time
            console.warn('⚠️ Redis timeout, continuando sin cache');
            return undefined;
          }
          if (options.attempt > 3) { // Reduce max retries
            return undefined;
          }
          return Math.min(options.attempt * 100, 1000);
        },
      });

      // Event handlers
      this.client.on('error', err => {
        console.error('❌ Error de Redis:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Conectado a Redis');
        this.connected = true;
        this.connectionRetries = 0;
      });

      this.client.on('end', () => {
        console.log('⚠️ Conexión a Redis terminada');
        this.connected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Reconectando a Redis...');
        this.connectionRetries++;
      });

      this.client.on('ready', () => {
        console.log('🚀 Redis listo para recibir comandos');
        this.connected = true;
      });

      // Connect to Redis
      await this.client.connect();

      // Test connection
      await this.client.ping();
      console.log('🏓 Ping a Redis exitoso');

      return this.client;
    } catch (error) {
      console.warn('⚠️ Redis no disponible:', error.message);
      this.connected = false;
      this.client = null;

      // Don't throw error in development, just continue without Redis
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Continuando sin Redis en modo desarrollo');
        return null;
      }

      if (this.connectionRetries < 2) { // Reduce retries
        console.log(
          `🔄 Reintentando conexión (${this.connectionRetries + 1}/2)...`
        );
        this.connectionRetries++;

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.connect();
      }

      // In production, log warning but don't crash
      console.warn('⚠️ Aplicación iniciando sin Redis');
      return null;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.connected) {
        await this.client.quit();
        this.connected = false;
        console.log('✅ Desconectado de Redis');
      }
    } catch (error) {
      console.error('❌ Error al desconectar de Redis:', error);
    }
  }

  async get(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede obtener la clave:',
          key
        );
        return null;
      }

      const data = await this.client.get(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (parseError) {
          // If not JSON, return as string
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo clave de Redis:', error);
      return null;
    }
  }

  async set(key, value, expiryInSeconds = 3600) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede establecer la clave:',
          key
        );
        return false;
      }

      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.set(key, serializedValue, {
        EX: expiryInSeconds,
      });

      return true;
    } catch (error) {
      console.error('❌ Error estableciendo clave en Redis:', error);
      return false;
    }
  }

  async setEx(key, expiryInSeconds, value) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede establecer la clave:',
          key
        );
        return false;
      }

      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.setEx(key, expiryInSeconds, serializedValue);

      return true;
    } catch (error) {
      console.error(
        '❌ Error estableciendo clave con expiración en Redis:',
        error
      );
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede eliminar la clave:',
          key
        );
        return false;
      }

      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('❌ Error eliminando clave de Redis:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se pueden eliminar claves con patrón:',
          pattern
        );
        return false;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(
          `🗑️ Eliminadas ${keys.length} claves con patrón: ${pattern}`
        );
      }

      return true;
    } catch (error) {
      console.error('❌ Error eliminando claves con patrón de Redis:', error);
      return false;
    }
  }

  async keys(pattern) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se pueden obtener claves con patrón:',
          pattern
        );
        return [];
      }

      return await this.client.keys(pattern);
    } catch (error) {
      console.error('❌ Error obteniendo claves con patrón de Redis:', error);
      return [];
    }
  }

  async exists(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede verificar la existencia de la clave:',
          key
        );
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        '❌ Error verificando existencia de clave en Redis:',
        error
      );
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede establecer expiración para la clave:',
          key
        );
        return false;
      }

      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('❌ Error estableciendo expiración en Redis:', error);
      return false;
    }
  }

  async ttl(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede obtener TTL para la clave:',
          key
        );
        return -1;
      }

      return await this.client.ttl(key);
    } catch (error) {
      console.error('❌ Error obteniendo TTL de Redis:', error);
      return -1;
    }
  }

  async incr(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede incrementar la clave:',
          key
        );
        return null;
      }

      return await this.client.incr(key);
    } catch (error) {
      console.error('❌ Error incrementando clave en Redis:', error);
      return null;
    }
  }

  async decr(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede decrementar la clave:',
          key
        );
        return null;
      }

      return await this.client.decr(key);
    } catch (error) {
      console.error('❌ Error decrementando clave en Redis:', error);
      return null;
    }
  }

  async hset(key, field, value) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede establecer campo hash:',
          key
        );
        return false;
      }

      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.hSet(key, field, serializedValue);

      return true;
    } catch (error) {
      console.error('❌ Error estableciendo campo hash en Redis:', error);
      return false;
    }
  }

  async hget(key, field) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede obtener campo hash:',
          key
        );
        return null;
      }

      const data = await this.client.hGet(key, field);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (parseError) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo campo hash de Redis:', error);
      return null;
    }
  }

  async hgetall(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede obtener hash completo:',
          key
        );
        return {};
      }

      const data = await this.client.hGetAll(key);
      const result = {};

      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch (parseError) {
          result[field] = value;
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Error obteniendo hash completo de Redis:', error);
      return {};
    }
  }

  async hdel(key, field) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede eliminar campo hash:',
          key
        );
        return false;
      }

      const result = await this.client.hDel(key, field);
      return result > 0;
    } catch (error) {
      console.error('❌ Error eliminando campo hash de Redis:', error);
      return false;
    }
  }

  async sadd(key, member) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede agregar miembro al set:',
          key
        );
        return false;
      }

      const result = await this.client.sAdd(key, member);
      return result > 0;
    } catch (error) {
      console.error('❌ Error agregando miembro al set en Redis:', error);
      return false;
    }
  }

  async srem(key, member) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede remover miembro del set:',
          key
        );
        return false;
      }

      const result = await this.client.sRem(key, member);
      return result > 0;
    } catch (error) {
      console.error('❌ Error removiendo miembro del set en Redis:', error);
      return false;
    }
  }

  async smembers(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se pueden obtener miembros del set:',
          key
        );
        return [];
      }

      return await this.client.sMembers(key);
    } catch (error) {
      console.error('❌ Error obteniendo miembros del set de Redis:', error);
      return [];
    }
  }

  async sismember(key, member) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede verificar membresía del set:',
          key
        );
        return false;
      }

      return await this.client.sIsMember(key, member);
    } catch (error) {
      console.error('❌ Error verificando membresía del set en Redis:', error);
      return false;
    }
  }

  async lpush(key, value) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede hacer push a la lista:',
          key
        );
        return false;
      }

      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      const result = await this.client.lPush(key, serializedValue);

      return result > 0;
    } catch (error) {
      console.error('❌ Error haciendo push a lista en Redis:', error);
      return false;
    }
  }

  async rpush(key, value) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede hacer push a la lista:',
          key
        );
        return false;
      }

      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      const result = await this.client.rPush(key, serializedValue);

      return result > 0;
    } catch (error) {
      console.error('❌ Error haciendo push a lista en Redis:', error);
      return false;
    }
  }

  async lpop(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede hacer pop de la lista:',
          key
        );
        return null;
      }

      const data = await this.client.lPop(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (parseError) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error haciendo pop de lista en Redis:', error);
      return null;
    }
  }

  async rpop(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede hacer pop de la lista:',
          key
        );
        return null;
      }

      const data = await this.client.rPop(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (parseError) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error haciendo pop de lista en Redis:', error);
      return null;
    }
  }

  async lrange(key, start, stop) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede obtener rango de lista:',
          key
        );
        return [];
      }

      const data = await this.client.lRange(key, start, stop);
      return data.map(item => {
        try {
          return JSON.parse(item);
        } catch (parseError) {
          return item;
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo rango de lista de Redis:', error);
      return [];
    }
  }

  async llen(key) {
    try {
      if (!this.connected) {
        console.warn(
          '⚠️ Redis no está conectado. No se puede obtener longitud de lista:',
          key
        );
        return 0;
      }

      return await this.client.lLen(key);
    } catch (error) {
      console.error('❌ Error obteniendo longitud de lista de Redis:', error);
      return 0;
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.connected) {
        return {
          status: 'unhealthy',
          message: 'Redis no está conectado',
          timestamp: new Date().toISOString(),
        };
      }

      await this.client.ping();

      return {
        status: 'healthy',
        message: 'Redis está funcionando correctamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get Redis info
  async getInfo() {
    try {
      if (!this.connected) {
        return null;
      }

      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error('❌ Error obteniendo info de Redis:', error);
      return null;
    }
  }

  // Get Redis stats
  async getStats() {
    try {
      if (!this.connected) {
        return null;
      }

      const info = await this.client.info();
      const lines = info.split('\r\n');
      const stats = {};

      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo stats de Redis:', error);
      return null;
    }
  }

  // Flush all (dangerous - only use in development/testing)
  async flushAll() {
    try {
      if (!this.connected) {
        console.warn('⚠️ Redis no está conectado. No se puede hacer flush all');
        return false;
      }

      await this.client.flushAll();
      console.log('🗑️ Redis flush all completado');
      return true;
    } catch (error) {
      console.error('❌ Error haciendo flush all en Redis:', error);
      return false;
    }
  }

  // Get client instance
  getClient() {
    return this.client;
  }

  // Check connection status
  isConnected() {
    return this.connected && this.client && this.client.isReady;
  }
}

// Create and export Redis client instance
const redisClient = new RedisClient();

module.exports = redisClient;

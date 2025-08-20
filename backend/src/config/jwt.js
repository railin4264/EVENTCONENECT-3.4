const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const redisClient = require('./redis');

class JWTManager {
  constructor() {
    this.secret =
      process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      'default_refresh_secret_change_in_production';
    this.accessExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.algorithm = 'HS256';
  }

  // Generate access token
  generateAccessToken(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Payload debe ser un objeto válido');
      }

      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.accessExpiresIn,
        algorithm: this.algorithm,
        issuer: 'EventConnect',
        audience: 'EventConnect-Users',
        subject: payload.userId || payload.id,
        jwtid: crypto.randomBytes(16).toString('hex'),
      });

      return token;
    } catch (error) {
      console.error('❌ Error generando access token:', error);
      throw error;
    }
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Payload debe ser un objeto válido');
      }

      const token = jwt.sign(payload, this.refreshSecret, {
        expiresIn: this.refreshExpiresIn,
        algorithm: this.algorithm,
        issuer: 'EventConnect',
        audience: 'EventConnect-Users',
        subject: payload.userId || payload.id,
        jwtid: crypto.randomBytes(16).toString('hex'),
      });

      return token;
    } catch (error) {
      console.error('❌ Error generando refresh token:', error);
      throw error;
    }
  }

  // Generate both tokens
  generateTokens(payload) {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.getExpirationTime(this.accessExpiresIn),
        refreshExpiresIn: this.getExpirationTime(this.refreshExpiresIn),
      };
    } catch (error) {
      console.error('❌ Error generando tokens:', error);
      throw error;
    }
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      const decoded = jwt.verify(token, this.secret, {
        algorithms: [this.algorithm],
        issuer: 'EventConnect',
        audience: 'EventConnect-Users',
      });

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token no válido aún');
      } else {
        throw new Error('Error verificando token');
      }
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      if (!token) {
        throw new Error('Refresh token no proporcionado');
      }

      const decoded = jwt.verify(token, this.refreshSecret, {
        algorithms: [this.algorithm],
        issuer: 'EventConnect',
        audience: 'EventConnect-Users',
      });

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Refresh token inválido');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Refresh token no válido aún');
      } else {
        throw new Error('Error verificando refresh token');
      }
    }
  }

  // Decode token without verification (for logging/debugging)
  decodeToken(token) {
    try {
      if (!token) {
        return null;
      }

      return jwt.decode(token, { complete: true });
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return null;
    }
  }

  // Get token expiration time
  getExpirationTime(expiresIn) {
    try {
      const now = Math.floor(Date.now() / 1000);
      let seconds = 0;

      if (typeof expiresIn === 'string') {
        // Parse time strings like '15m', '1h', '7d'
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];

          switch (unit) {
            case 's':
              seconds = value;
              break;
            case 'm':
              seconds = value * 60;
              break;
            case 'h':
              seconds = value * 60 * 60;
              break;
            case 'd':
              seconds = value * 24 * 60 * 60;
              break;
            default:
              seconds = value;
          }
        } else {
          seconds = parseInt(expiresIn) || 0;
        }
      } else {
        seconds = expiresIn || 0;
      }

      return now + seconds;
    } catch (error) {
      console.error('❌ Error calculando tiempo de expiración:', error);
      return 0;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.payload.exp < now;
    } catch (error) {
      console.error('❌ Error verificando expiración de token:', error);
      return true;
    }
  }

  // Get time until token expires
  getTimeUntilExpiry(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.payload.exp - now;

      return Math.max(0, timeLeft);
    } catch (error) {
      console.error('❌ Error calculando tiempo hasta expiración:', error);
      return 0;
    }
  }

  // Store refresh token in Redis
  async storeRefreshToken(userId, refreshToken, deviceInfo = {}) {
    try {
      if (!userId || !refreshToken) {
        throw new Error('userId y refreshToken son requeridos');
      }

      const tokenId = crypto.randomBytes(16).toString('hex');
      const key = `refresh_token:${userId}:${tokenId}`;

      const tokenData = {
        token: refreshToken,
        userId,
        tokenId,
        deviceInfo,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + this.getExpirationTime(this.refreshExpiresIn) * 1000
        ).toISOString(),
      };

      // Store in Redis with expiration
      const success = await redisClient.setEx(
        key,
        this.getExpirationTime(this.refreshExpiresIn),
        tokenData
      );

      if (success) {
        // Store token ID in user's active tokens set
        await redisClient.sadd(`user_tokens:${userId}`, tokenId);

        return tokenId;
      } else {
        throw new Error('No se pudo almacenar el refresh token');
      }
    } catch (error) {
      console.error('❌ Error almacenando refresh token:', error);
      throw error;
    }
  }

  // Get refresh token from Redis
  async getRefreshToken(userId, tokenId) {
    try {
      if (!userId || !tokenId) {
        throw new Error('userId y tokenId son requeridos');
      }

      const key = `refresh_token:${userId}:${tokenId}`;
      const tokenData = await redisClient.get(key);

      if (!tokenData) {
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('❌ Error obteniendo refresh token:', error);
      return null;
    }
  }

  // Revoke refresh token
  async revokeRefreshToken(userId, tokenId) {
    try {
      if (!userId || !tokenId) {
        throw new Error('userId y tokenId son requeridos');
      }

      const key = `refresh_token:${userId}:${tokenId}`;

      // Remove from Redis
      const success = await redisClient.del(key);

      if (success) {
        // Remove from user's active tokens set
        await redisClient.srem(`user_tokens:${userId}`, tokenId);

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error revocando refresh token:', error);
      return false;
    }
  }

  // Revoke all refresh tokens for a user
  async revokeAllUserTokens(userId) {
    try {
      if (!userId) {
        throw new Error('userId es requerido');
      }

      const userTokensKey = `user_tokens:${userId}`;
      const tokenIds = await redisClient.smembers(userTokensKey);

      if (tokenIds.length === 0) {
        return true;
      }

      let revokedCount = 0;

      for (const tokenId of tokenIds) {
        const key = `refresh_token:${userId}:${tokenId}`;
        const success = await redisClient.del(key);
        if (success) {
          revokedCount++;
        }
      }

      // Clear user's active tokens set
      await redisClient.del(userTokensKey);

      console.log(`🗑️ Revocados ${revokedCount} tokens para usuario ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error revocando todos los tokens del usuario:', error);
      return false;
    }
  }

  // Get user's active refresh tokens
  async getUserActiveTokens(userId) {
    try {
      if (!userId) {
        throw new Error('userId es requerido');
      }

      const userTokensKey = `user_tokens:${userId}`;
      const tokenIds = await redisClient.smembers(userTokensKey);

      if (tokenIds.length === 0) {
        return [];
      }

      const activeTokens = [];

      for (const tokenId of tokenIds) {
        const key = `refresh_token:${userId}:${tokenId}`;
        const tokenData = await redisClient.get(key);

        if (tokenData) {
          activeTokens.push({
            tokenId,
            deviceInfo: tokenData.deviceInfo,
            createdAt: tokenData.createdAt,
            expiresAt: tokenData.expiresAt,
          });
        }
      }

      return activeTokens;
    } catch (error) {
      console.error('❌ Error obteniendo tokens activos del usuario:', error);
      return [];
    }
  }

  // Clean up expired tokens
  async cleanupExpiredTokens() {
    try {
      console.log('🧹 Limpiando tokens expirados...');

      // This is a simplified cleanup - in production you might want to use Redis TTL
      // or a scheduled job to clean up expired tokens

      const pattern = 'refresh_token:*';
      const keys = await redisClient.keys(pattern);

      let cleanedCount = 0;

      for (const key of keys) {
        const tokenData = await redisClient.get(key);

        if (tokenData && tokenData.expiresAt) {
          const expiresAt = new Date(tokenData.expiresAt);
          const now = new Date();

          if (expiresAt < now) {
            await redisClient.del(key);

            // Remove from user's active tokens set
            const [, userId, tokenId] = key.split(':');
            await redisClient.srem(`user_tokens:${userId}`, tokenId);

            cleanedCount++;
          }
        }
      }

      console.log(
        `✅ Limpieza completada. ${cleanedCount} tokens expirados removidos`
      );
      return cleanedCount;
    } catch (error) {
      console.error('❌ Error limpiando tokens expirados:', error);
      return 0;
    }
  }

  // Generate password reset token
  generatePasswordResetToken(userId) {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      return {
        resetToken,
        resetTokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      };
    } catch (error) {
      console.error('❌ Error generando password reset token:', error);
      throw error;
    }
  }

  // Generate email verification token
  generateEmailVerificationToken(userId) {
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      return {
        verificationToken,
        verificationTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };
    } catch (error) {
      console.error('❌ Error generando email verification token:', error);
      throw error;
    }
  }

  // Generate API key
  generateAPIKey(userId, permissions = []) {
    try {
      const apiKey = crypto.randomBytes(32).toString('hex');
      const apiKeyHash = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');

      return {
        apiKey,
        apiKeyHash,
        permissions,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error generando API key:', error);
      throw error;
    }
  }

  // Get token statistics
  async getTokenStats() {
    try {
      const stats = {
        totalActiveTokens: 0,
        totalUsersWithTokens: 0,
        averageTokensPerUser: 0,
        oldestToken: null,
        newestToken: null,
      };

      const userTokensPattern = 'user_tokens:*';
      const userTokenKeys = await redisClient.keys(userTokensPattern);

      stats.totalUsersWithTokens = userTokenKeys.length;

      let totalTokens = 0;
      let oldestDate = null;
      let newestDate = null;

      for (const userKey of userTokenKeys) {
        const userId = userKey.split(':')[1];
        const tokenIds = await redisClient.smembers(userKey);
        totalTokens += tokenIds.length;

        for (const tokenId of tokenIds) {
          const tokenKey = `refresh_token:${userId}:${tokenId}`;
          const tokenData = await redisClient.get(tokenKey);

          if (tokenData && tokenData.createdAt) {
            const createdAt = new Date(tokenData.createdAt);

            if (!oldestDate || createdAt < oldestDate) {
              oldestDate = createdAt;
            }

            if (!newestDate || createdAt > newestDate) {
              newestDate = createdAt;
            }
          }
        }
      }

      stats.totalActiveTokens = totalTokens;
      stats.averageTokensPerUser =
        userTokenKeys.length > 0 ? totalTokens / userTokenKeys.length : 0;
      stats.oldestToken = oldestDate;
      stats.newestToken = newestDate;

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de tokens:', error);
      return null;
    }
  }

  // Validate token format
  validateTokenFormat(token) {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }

      // Check if token has the correct format (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Check if each part is base64 encoded
      for (const part of parts) {
        try {
          Buffer.from(part, 'base64');
        } catch (error) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Get token payload without verification
  getTokenPayload(token) {
    try {
      if (!this.validateTokenFormat(token)) {
        return null;
      }

      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

// Create and export JWT manager instance
const jwtManager = new JWTManager();

module.exports = jwtManager;

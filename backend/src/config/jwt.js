const crypto = require('crypto');

const jwt = require('jsonwebtoken');

/**
 * JWT Configuration and Management Service
 */
class JWTService {
  /**
   *
   */
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    if (!this.secret || !this.refreshSecret) {
      throw new Error('JWT secrets are required');
    }
  }

  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @param {string} payload.userId - User ID
   * @param {string} payload.email - User email
   * @param {string} payload.role - User role
   * @returns {string} JWT token
   */
  generateAccessToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(tokenPayload, this.secret, {
        expiresIn: this.expiresIn,
        issuer: 'eventconnect',
        audience: 'eventconnect-users',
      });
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @param {string} payload.userId - User ID
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(tokenPayload, this.refreshSecret, {
        expiresIn: this.refreshExpiresIn,
        issuer: 'eventconnect',
        audience: 'eventconnect-users',
      });
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} payload - Token payload
   * @returns {Object} Object containing access and refresh tokens
   */
  generateTokens(payload) {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.expiresIn,
        refreshExpiresIn: this.refreshExpiresIn,
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * Verify access token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'eventconnect',
        audience: 'eventconnect-users',
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: 'eventconnect',
        audience: 'eventconnect-users',
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Failed to decode token');
    }
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date} Expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      return Date.now() >= expiration.getTime();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Generate token pair for password reset
   * @param {string} _email - User email (not used in token generation)
   * @returns {Object} Reset token and expiry
   */
  generatePasswordResetToken(_email) {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      return {
        resetToken: hashedToken,
        resetTokenExpiry,
        plainToken: resetToken,
      };
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw new Error('Failed to generate password reset token');
    }
  }

  /**
   * Verify password reset token
   * @param {string} token - Plain reset token
   * @param {string} hashedToken - Hashed reset token from database
   * @param {Date} expiry - Token expiry date
   * @returns {boolean} True if token is valid
   */
  verifyPasswordResetToken(token, hashedToken, expiry) {
    try {
      if (Date.now() > expiry.getTime()) {
        return false;
      }

      const hashedInputToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return hashedInputToken === hashedToken;
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return false;
    }
  }

  /**
   * Generate email verification token
   * @param {string} _email - User email (not used in token generation)
   * @returns {Object} Verification token and expiry
   */
  generateEmailVerificationToken(_email) {
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours

      const hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      return {
        verificationToken: hashedToken,
        verificationTokenExpiry,
        plainToken: verificationToken,
      };
    } catch (error) {
      console.error('Error generating email verification token:', error);
      throw new Error('Failed to generate email verification token');
    }
  }

  /**
   * Verify email verification token
   * @param {string} token - Plain verification token
   * @param {string} hashedToken - Hashed verification token from database
   * @param {Date} expiry - Token expiry date
   * @returns {boolean} True if token is valid
   */
  verifyEmailVerificationToken(token, hashedToken, expiry) {
    try {
      if (Date.now() > expiry.getTime()) {
        return false;
      }

      const hashedInputToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return hashedInputToken === hashedToken;
    } catch (error) {
      console.error('Error verifying email verification token:', error);
      return false;
    }
  }

  /**
   * Generate MFA token
   * @param {string} _userId - User ID (not used in token generation)
   * @returns {Object} MFA token and expiry
   */
  generateMFAToken(_userId) {
    try {
      const mfaToken = crypto.randomBytes(32).toString('hex');
      const mfaTokenExpiry = new Date(Date.now() + 300000); // 5 minutes

      const hashedToken = crypto
        .createHash('sha256')
        .update(mfaToken)
        .digest('hex');

      return {
        mfaToken: hashedToken,
        mfaTokenExpiry,
        plainToken: mfaToken,
      };
    } catch (error) {
      console.error('Error generating MFA token:', error);
      throw new Error('Failed to generate MFA token');
    }
  }

  /**
   * Verify MFA token
   * @param {string} token - Plain MFA token
   * @param {string} hashedToken - Hashed MFA token from database
   * @param {Date} expiry - Token expiry date
   * @returns {boolean} True if token is valid
   */
  verifyMFAToken(token, hashedToken, expiry) {
    try {
      if (Date.now() > expiry.getTime()) {
        return false;
      }

      const hashedInputToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return hashedInputToken === hashedToken;
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      return false;
    }
  }

  /**
   * Generate API key
   * @param {string} userId - User ID
   * @param {string} purpose - Purpose of the API key
   * @returns {Object} API key and metadata
   */
  generateAPIKey(userId, purpose) {
    try {
      const apiKey = crypto.randomBytes(64).toString('hex');
      const hashedKey = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');

      return {
        apiKey,
        hashedKey,
        userId,
        purpose,
        createdAt: new Date(),
        lastUsed: null,
      };
    } catch (error) {
      console.error('Error generating API key:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Verify API key
   * @param {string} apiKey - Plain API key
   * @param {string} hashedKey - Hashed API key from database
   * @returns {boolean} True if API key is valid
   */
  verifyAPIKey(apiKey, hashedKey) {
    try {
      const hashedInputKey = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');

      return hashedInputKey === hashedKey;
    } catch (error) {
      console.error('Error verifying API key:', error);
      return false;
    }
  }

  /**
   * Generate session token
   * @param {string} userId - User ID
   * @param {Object} sessionData - Additional session data
   * @returns {Object} Session token and metadata
   */
  generateSessionToken(userId, sessionData = {}) {
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const sessionTokenExpiry = new Date(Date.now() + 604800000); // 7 days

      const hashedToken = crypto
        .createHash('sha256')
        .update(sessionToken)
        .digest('hex');

      return {
        sessionToken: hashedToken,
        sessionTokenExpiry,
        plainToken: sessionToken,
        userId,
        sessionData,
        createdAt: new Date(),
        lastActivity: new Date(),
      };
    } catch (error) {
      console.error('Error generating session token:', error);
      throw new Error('Failed to generate session token');
    }
  }

  /**
   * Verify session token
   * @param {string} token - Plain session token
   * @param {string} hashedToken - Hashed session token from database
   * @param {Date} expiry - Token expiry date
   * @returns {boolean} True if token is valid
   */
  verifySessionToken(token, hashedToken, expiry) {
    try {
      if (Date.now() > expiry.getTime()) {
        return false;
      }

      const hashedInputToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return hashedInputToken === hashedToken;
    } catch (error) {
      console.error('Error verifying session token:', error);
      return false;
    }
  }

  /**
   * Get token statistics
   * @returns {Object} Token configuration and statistics
   */
  getTokenStats() {
    return {
      accessTokenExpiry: this.expiresIn,
      refreshTokenExpiry: this.refreshExpiresIn,
      issuer: 'eventconnect',
      audience: 'eventconnect-users',
      algorithm: 'HS256',
      createdAt: new Date(),
    };
  }
}

// Create and export JWT service instance
const jwtService = new JWTService();

module.exports = {
  jwtService,
  JWTService,
};

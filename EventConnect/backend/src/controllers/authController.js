const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const redisClient = require('../config/redis');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Store refresh token in Redis
const storeRefreshToken = async (userId, refreshToken, device = 'unknown', ip = 'unknown') => {
  const key = `refresh_token:${userId}:${refreshToken}`;
  const tokenData = {
    userId,
    device,
    ip,
    createdAt: new Date().toISOString()
  };
  
  await redisClient.set(key, tokenData, 7 * 24 * 60 * 60); // 7 days
};

// Remove refresh token from Redis
const removeRefreshToken = async (userId, refreshToken) => {
  const key = `refresh_token:${userId}:${refreshToken}`;
  await redisClient.del(key);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      interests,
      location
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 
          'El email ya está registrado' : 
          'El nombre de usuario ya está en uso'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      interests: interests || [],
      location: location || {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token
    await storeRefreshToken(user._id, refreshToken, req.headers['user-agent'], req.ip);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { email, password, device = 'unknown' } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token
    await storeRefreshToken(user._id, refreshToken, device, req.ip);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token es requerido'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Check if token exists in Redis
    const key = `refresh_token:${decoded.userId}:${token}`;
    const storedToken = await redisClient.get(key);
    
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }

    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    // Remove old refresh token and store new one
    await removeRefreshToken(decoded.userId, token);
    await storeRefreshToken(user._id, newRefreshToken, req.headers['user-agent'], req.ip);

    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirado'
      });
    }

    console.error('Error en refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const userId = req.user.id;

    if (token) {
      // Remove refresh token from Redis
      await removeRefreshToken(userId, token);
    }

    // Remove all refresh tokens for this user (optional - for security)
    // await redisClient.del(`refresh_tokens:${userId}:*`);

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove all refresh tokens for this user
    const pattern = `refresh_token:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redisClient.del(key)));
    }

    // Clear refresh tokens from user document
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logout de todos los dispositivos exitoso'
    });

  } catch (error) {
    console.error('Error en logout all:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      bio,
      interests,
      location,
      preferences
    } = req.body;

    // Fields that can be updated
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;
    if (interests) updateFields.interests = interests;
    if (location) updateFields.location = location;
    if (preferences) updateFields.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Logout from all devices (optional - for security)
    const pattern = `refresh_token:${user._id}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redisClient.del(key)));
    }

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in Redis
    const key = `reset_token:${resetToken}`;
    const tokenData = {
      userId: user._id,
      email: user.email,
      expiresAt: resetTokenExpiry.toISOString()
    };
    
    await redisClient.set(key, tokenData, 60 * 60); // 1 hour

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { token, newPassword } = req.body;

    // Get reset token from Redis
    const key = `reset_token:${token}`;
    const tokenData = await redisClient.get(key);
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Token de restablecimiento inválido o expirado'
      });
    }

    // Check if token is expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      await redisClient.del(key);
      return res.status(400).json({
        success: false,
        message: 'Token de restablecimiento expirado'
      });
    }

    // Update user password
    const user = await User.findById(tokenData.userId);
    if (!user) {
      await redisClient.del(key);
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.password = newPassword;
    await user.save();

    // Remove reset token
    await redisClient.del(key);

    // Logout from all devices
    const pattern = `refresh_token:${user._id}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redisClient.del(key)));
    }

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Get verification token from Redis
    const key = `verify_email:${token}`;
    const tokenData = await redisClient.get(key);
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido o expirado'
      });
    }

    // Update user verification status
    const user = await User.findById(tokenData.userId);
    if (!user) {
      await redisClient.del(key);
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.isVerified = true;
    await user.save();

    // Remove verification token
    await redisClient.del(key);

    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    console.error('Error en verify email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user sessions
// @route   GET /api/auth/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all refresh tokens for this user
    const pattern = `refresh_token:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    
    const sessions = [];
    
    for (const key of keys) {
      const tokenData = await redisClient.get(key);
      if (tokenData) {
        sessions.push({
          id: key.split(':')[2], // Extract token part
          device: tokenData.device,
          ip: tokenData.ip,
          createdAt: tokenData.createdAt,
          isCurrent: false // Will be set below
        });
      }
    }

    // Mark current session
    const currentToken = req.headers.authorization?.split(' ')[1];
    if (currentToken) {
      const decoded = jwt.decode(currentToken);
      if (decoded && decoded.userId === userId) {
        // Find current session and mark it
        sessions.forEach(session => {
          if (session.id === currentToken) {
            session.isCurrent = true;
          }
        });
      }
    }

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Revoke session
// @route   DELETE /api/auth/sessions/:token
// @access  Private
const revokeSession = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const key = `refresh_token:${userId}:${token}`;
    const tokenData = await redisClient.get(key);
    
    if (!tokenData) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Remove the session
    await redisClient.del(key);

    res.json({
      success: true,
      message: 'Sesión revocada exitosamente'
    });

  } catch (error) {
    console.error('Error revocando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getSessions,
  revokeSession
};
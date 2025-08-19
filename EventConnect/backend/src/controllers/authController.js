const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { jwt, redis } = require('../config');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

class AuthController {
  // Register new user
  register = asyncHandler(async (req, res, next) => {
    try {
      const { email, password, username, firstName, lastName, dateOfBirth, phone, acceptTerms, acceptMarketing } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new AppError('El email ya está registrado', 400);
        }
        if (existingUser.username === username) {
          throw new AppError('El nombre de usuario ya está en uso', 400);
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        username,
        firstName,
        lastName,
        dateOfBirth,
        phone,
        acceptTerms,
        acceptMarketing,
        isActive: true,
        isVerified: false, // Will be verified via email
        role: 'user'
      });

      await user.save();

      // Generate tokens
      const tokens = jwt.generateTokens({
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      // Store refresh token in Redis
      const tokenId = await jwt.storeRefreshToken(user._id.toString(), tokens.refreshToken, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userResponse,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            refreshExpiresIn: tokens.refreshExpiresIn
          },
          tokenId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Login user
  login = asyncHandler(async (req, res, next) => {
    try {
      const { email, password, rememberMe } = req.body;

      // Find user by email or username
      const user = await User.findOne({
        $or: [{ email }, { username: email }]
      }).select('+password');

      if (!user) {
        throw new AppError('Credenciales inválidas', 401);
      }

      if (!user.isActive) {
        throw new AppError('Tu cuenta ha sido desactivada', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Credenciales inválidas', 401);
      }

      // Update last login
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();

      // Generate tokens
      const tokens = jwt.generateTokens({
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      // Store refresh token in Redis
      const tokenId = await jwt.storeRefreshToken(user._id.toString(), tokens.refreshToken, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userResponse,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            refreshExpiresIn: tokens.refreshExpiresIn
          },
          tokenId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout user
  logout = asyncHandler(async (req, res, next) => {
    try {
      const { tokenId } = req.body;
      const userId = req.user.id;

      if (tokenId) {
        // Revoke specific refresh token
        await jwt.revokeRefreshToken(userId, tokenId);
      } else {
        // Revoke all user tokens
        await jwt.revokeAllUserTokens(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      next(error);
    }
  });

  // Refresh access token
  refreshToken = asyncHandler(async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token es requerido', 400);
      }

      // Verify refresh token
      const decoded = jwt.verifyRefreshToken(refreshToken);
      
      // Get user
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        throw new AppError('Usuario no encontrado o inactivo', 401);
      }

      // Generate new tokens
      const tokens = jwt.generateTokens({
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      // Store new refresh token
      const tokenId = await jwt.storeRefreshToken(user._id.toString(), tokens.refreshToken, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            refreshExpiresIn: tokens.refreshExpiresIn
          },
          tokenId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get current user profile
  getProfile = asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  });

  // Update user profile
  updateProfile = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.email;
      delete updateData.role;
      delete updateData.isActive;
      delete updateData.isVerified;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  });

  // Change password
  changePassword = asyncHandler(async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Contraseña actual incorrecta', 400);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      // Revoke all user tokens to force re-login
      await jwt.revokeAllUserTokens(userId);

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente.'
      });
    } catch (error) {
      next(error);
    }
  });

  // Request password reset
  requestPasswordReset = asyncHandler(async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not
        return res.status(200).json({
          success: true,
          message: 'Si el email existe, se enviará un enlace de restablecimiento'
        });
      }

      // Generate reset token
      const resetTokenData = jwt.generatePasswordResetToken(user._id);
      
      // Store reset token hash in user document
      user.passwordResetToken = resetTokenData.resetTokenHash;
      user.passwordResetExpires = resetTokenData.expiresAt;
      await user.save();

      // TODO: Send email with reset token
      // For now, just return the token (in production, send via email)
      res.status(200).json({
        success: true,
        message: 'Enlace de restablecimiento enviado al email',
        data: {
          resetToken: resetTokenData.resetToken, // Remove this in production
          expiresAt: resetTokenData.expiresAt
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Reset password
  resetPassword = asyncHandler(async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new AppError('Token y nueva contraseña son requeridos', 400);
      }

      // Hash the token to compare with stored hash
      const crypto = require('crypto');
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new AppError('Token de restablecimiento inválido o expirado', 400);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Revoke all user tokens
      await jwt.revokeAllUserTokens(user._id);

      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Verify email
  verifyEmail = asyncHandler(async (req, res, next) => {
    try {
      const { token } = req.params;

      if (!token) {
        throw new AppError('Token de verificación es requerido', 400);
      }

      // Hash the token to compare with stored hash
      const crypto = require('crypto');
      const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new AppError('Token de verificación inválido o expirado', 400);
      }

      // Mark email as verified
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      user.emailVerifiedAt = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email verificado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Resend verification email
  resendVerificationEmail = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      if (user.isVerified) {
        throw new AppError('El email ya está verificado', 400);
      }

      // Generate new verification token
      const verificationTokenData = jwt.generateEmailVerificationToken(user._id);
      
      // Store verification token hash
      user.emailVerificationToken = verificationTokenData.verificationTokenHash;
      user.emailVerificationExpires = verificationTokenData.expiresAt;
      await user.save();

      // TODO: Send email with verification token
      res.status(200).json({
        success: true,
        message: 'Email de verificación reenviado',
        data: {
          verificationToken: verificationTokenData.verificationToken, // Remove this in production
          expiresAt: verificationTokenData.expiresAt
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user's active sessions
  getActiveSessions = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;

      const activeTokens = await jwt.getUserActiveTokens(userId);

      res.status(200).json({
        success: true,
        data: { activeTokens }
      });
    } catch (error) {
      next(error);
    }
  });

  // Revoke specific session
  revokeSession = asyncHandler(async (req, res, next) => {
    try {
      const { tokenId } = req.params;
      const userId = req.user.id;

      const success = await jwt.revokeRefreshToken(userId, tokenId);

      if (!success) {
        throw new AppError('No se pudo revocar la sesión', 400);
      }

      res.status(200).json({
        success: true,
        message: 'Sesión revocada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Revoke all sessions except current
  revokeAllOtherSessions = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const currentTokenId = req.body.currentTokenId;

      if (currentTokenId) {
        // Get all active tokens
        const activeTokens = await jwt.getUserActiveTokens(userId);
        
        // Revoke all except current
        for (const token of activeTokens) {
          if (token.tokenId !== currentTokenId) {
            await jwt.revokeRefreshToken(userId, token.tokenId);
          }
        }
      } else {
        // Revoke all tokens
        await jwt.revokeAllUserTokens(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Otras sesiones revocadas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = new AuthController();
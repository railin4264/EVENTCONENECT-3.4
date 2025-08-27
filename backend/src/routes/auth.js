const express = require('express');

const router = express.Router();
const { authController } = require('../controllers');
const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validatePasswordReset,
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post(
  '/request-password-reset',
  validatePasswordReset,
  authController.requestPasswordReset
);
router.post(
  '/reset-password',
  validatePasswordReset,
  authController.resetPassword
);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// OAuth routes (public)
router.post('/oauth/login', authController.oauthLogin);

// Protected routes
router.use(protect);

router.get('/profile', authController.getProfile);
router.put('/profile', validateUserUpdate, authController.updateProfile);
router.put(
  '/change-password',
  validatePasswordChange,
  authController.changePassword
);
router.post('/logout', authController.logout);
router.get('/sessions', authController.getActiveSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);
router.delete('/sessions', authController.revokeAllOtherSessions);

// MFA routes
router.post('/mfa/enable', authController.enableMFA);
router.post('/mfa/verify', authController.verifyMFA);
router.post('/mfa/disable', authController.disableMFA);

// OAuth management routes
router.post('/oauth/link', authController.linkOAuthAccount);
router.delete('/oauth/unlink/:provider', authController.unlinkOAuthAccount);

module.exports = router;

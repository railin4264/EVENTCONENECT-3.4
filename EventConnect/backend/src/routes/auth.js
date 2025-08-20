const express = require('express');

const router = express.Router();
const { authController } = require('../controllers');
const { protect, requireVerification } = require('../middleware/auth');
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

module.exports = router;

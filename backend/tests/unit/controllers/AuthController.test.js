const authController = require('../../../src/controllers/authController');

describe('AuthController', () => {
  describe('register', () => {
    it('should be a function', () => {
      expect(typeof authController.register).toBe('function');
    });
  });

  describe('login', () => {
    it('should be a function', () => {
      expect(typeof authController.login).toBe('function');
    });
  });

  describe('requestPasswordReset', () => {
    it('should be a function', () => {
      expect(typeof authController.requestPasswordReset).toBe('function');
    });
  });
});
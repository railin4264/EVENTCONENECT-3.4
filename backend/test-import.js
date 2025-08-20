console.log('Testing import...');

try {
  const auth = require('./src/controllers');
  console.log('Auth imported:', !!auth.authController);
  console.log('Methods:', Object.getOwnPropertyNames(auth.authController));
  console.log('requestPasswordReset:', typeof auth.authController.requestPasswordReset);
} catch(e) {
  console.error('Error:', e.message);
  e.stack.split('\n').slice(0,5).forEach(line => console.error(line));
}
const fs = require('fs');
const path = require('path');

// Función para corregir referencias de rate limits
function fixRateLimits() {
  console.log('🔧 Corrigiendo referencias de rate limits...');
  
  const filesToFix = [
    'src/routes/events.js',
    'src/routes/auth.js',
    'src/routes/users.js',
    'src/routes/tribes.js',
    'src/routes/posts.js',
    'src/routes/notifications.js',
    'src/routes/search.js',
    'src/routes/chat.js'
  ];

  let fixedFiles = 0;

  filesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        // Corregir imports
        content = content.replace(
          /const rateLimits = require\('\.\.\/middleware\/rateLimitMiddleware'\);/g,
          `const { generalLimiter, searchLimiter, eventCreationLimiter, eventModificationLimiter, eventActionsLimiter, commentLimiter, uploadLimiter, notificationLimiter } = require('../middleware/rateLimitMiddleware');`
        );

        // Corregir authMiddleware
        content = content.replace(
          /const authMiddleware = require\('\.\.\/middleware\/authMiddleware'\);/g,
          `const { authenticateToken } = require('../middleware/authMiddleware');`
        );

        // Corregir referencias de rate limits
        content = content.replace(/rateLimits\.general/g, 'generalLimiter');
        content = content.replace(/rateLimits\.search/g, 'searchLimiter');
        content = content.replace(/rateLimits\.creation/g, 'eventCreationLimiter');
        content = content.replace(/rateLimits\.modification/g, 'eventModificationLimiter');
        content = content.replace(/rateLimits\.actions/g, 'eventActionsLimiter');
        content = content.replace(/rateLimits\.comments/g, 'commentLimiter');
        content = content.replace(/rateLimits\.upload/g, 'uploadLimiter');
        content = content.replace(/rateLimits\.notifications/g, 'notificationLimiter');

        // Corregir referencias de auth
        content = content.replace(/authMiddleware/g, 'authenticateToken');

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          fixedFiles++;
          console.log(`✅ ${filePath} - Corregido`);
        }
      } catch (error) {
        console.log(`❌ Error procesando ${filePath}:`, error.message);
      }
    }
  });

  console.log(`\n🎉 Proceso completado:`);
  console.log(`📁 Archivos procesados: ${filesToFix.length}`);
  console.log(`🔧 Archivos corregidos: ${fixedFiles}`);
}

// Ejecutar el script
fixRateLimits();
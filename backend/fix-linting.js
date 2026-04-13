const fs = require('fs');
const path = require('path');

// Función para corregir errores comunes de linting
function fixLintingErrors() {
  console.log('🔧 Corrigiendo errores de linting...');
  
  // Lista de archivos a corregir
  const filesToFix = [
    'src/controllers/authController.js',
    'src/controllers/eventController.js',
    'src/controllers/tribeController.js',
    'src/controllers/postController.js',
    'src/controllers/reviewController.js',
    'src/controllers/searchController.js',
    'src/controllers/aiRecommendationsController.js',
    'src/controllers/gamificationController.js',
    'src/controllers/mockController.js',
    'src/controllers/themeController.js',
    'src/controllers/NotificationController.js',
    'src/controllers/demandAnalyticsController.js',
    'src/controllers/chatController.js',
    'src/controllers/userController.js',
    'src/middleware/auth.js',
    'src/middleware/cache.js',
    'src/middleware/errorHandler.js',
    'src/middleware/index.js',
    'src/middleware/logger.js',
    'src/middleware/notifications.js',
    'src/middleware/optimization.js',
    'src/middleware/pagination.js',
    'src/middleware/rateLimitMiddleware.js',
    'src/middleware/security.js',
    'src/middleware/upload.js',
    'src/middleware/uploadMiddleware.js',
    'src/middleware/authMiddleware.js',
    'src/models/Achievement.js',
    'src/models/Badge.js',
    'src/models/Chat.js',
    'src/models/Event.js',
    'src/models/Notification.js',
    'src/models/Post.js',
    'src/models/ScheduledNotification.js',
    'src/models/User.js',
    'src/routes/auth.js',
    'src/scripts/database.js',
    'src/scripts/migrations/001_initial_schema.js',
    'src/scripts/seeders/DevSeeder.js',
    'src/scripts/seeders/EventSeeder.js',
    'src/scripts/seeders/UserSeeder.js',
    'src/services/AIRecommendationService.js',
    'src/services/ChatWebSocketService.js',
    'src/services/DemandAnalyticsService.js',
    'src/services/EventService.js',
    'src/services/GamificationService.js',
    'src/services/NotificationService.js',
    'src/services/SearchService.js',
    'src/config/jwt.js',
    'src/config/pushNotifications.js',
    'src/config/redis.js',
    'src/config/validation.js',
    'src/server.js'
  ];

  let fixedFiles = 0;
  let totalErrors = 0;

  filesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        let fileErrors = 0;

        // Corregir imports no utilizados
        content = content.replace(/const\s+{\s*([^}]+)\s*}\s*=\s*require\([^)]+\);/g, (match, imports) => {
          const importList = imports.split(',').map(imp => imp.trim());
          const usedImports = importList.filter(imp => {
            const regex = new RegExp(`\\b${imp}\\b`, 'g');
            return content.match(regex) && content.match(regex).length > 1;
          });
          
          if (usedImports.length === 0) {
            fileErrors++;
            return '';
          } else if (usedImports.length === importList.length) {
            return match;
          } else {
            fileErrors++;
            return `const { ${usedImports.join(', ')} } = require('${match.match(/require\(['"]([^'"]+)['"]\)/)[1]}');`;
          }
        });

        // Corregir variables no utilizadas
        content = content.replace(/const\s+(\w+)\s*=\s*[^;]+;/g, (match, varName) => {
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          const matches = content.match(regex);
          if (matches && matches.length === 1) {
            fileErrors++;
            return `// ${match} // Variable no utilizada`;
          }
          return match;
        });

        // Corregir parámetros no utilizados
        content = content.replace(/\(([^)]+)\)\s*=>\s*{/g, (match, params) => {
          const paramList = params.split(',').map(p => p.trim());
          const unusedParams = paramList.filter(param => {
            const regex = new RegExp(`\\b${param}\\b`, 'g');
            const matches = content.match(regex);
            return matches && matches.length === 1;
          });
          
          if (unusedParams.length > 0) {
            fileErrors++;
            const newParams = paramList.map(param => 
              unusedParams.includes(param) ? `_${param}` : param
            ).join(', ');
            return `(${newParams}) => {`;
          }
          return match;
        });

        // Corregir escapes innecesarios en regex
        content = content.replace(/\\\(/g, '(');
        content = content.replace(/\\\)/g, ')');
        content = content.replace(/\\\+/g, '+');

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          fixedFiles++;
          totalErrors += fileErrors;
          console.log(`✅ ${filePath} - ${fileErrors} errores corregidos`);
        }
      } catch (error) {
        console.log(`❌ Error procesando ${filePath}:`, error.message);
      }
    }
  });

  console.log(`\n🎉 Proceso completado:`);
  console.log(`📁 Archivos procesados: ${filesToFix.length}`);
  console.log(`🔧 Archivos corregidos: ${fixedFiles}`);
  console.log(`❌ Errores totales corregidos: ${totalErrors}`);
}

// Ejecutar el script
fixLintingErrors();
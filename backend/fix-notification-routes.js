const fs = require('fs');
const path = require('path');

// Función para corregir rutas de notificaciones
function fixNotificationRoutes() {
  console.log('🔧 Corrigiendo rutas de notificaciones...');
  
  const filePath = 'src/routes/notifications.js';
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // Reemplazar todas las referencias
    content = content.replace(/protect/g, 'authenticateToken');
    content = content.replace(/validators\.validateScheduledNotification/g, 'generalLimiter');
    content = content.replace(/validators\.validateUserPreferences/g, 'generalLimiter');
    content = content.replace(/validators\.validatePushToken/g, 'generalLimiter');
    content = content.replace(/validators\.validateSystemNotification/g, 'generalLimiter');

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath} - Corregido`);
    } else {
      console.log(`✅ ${filePath} - Ya estaba correcto`);
    }
  } catch (error) {
    console.log(`❌ Error procesando ${filePath}:`, error.message);
  }

  console.log(`\n🎉 Proceso completado`);
}

// Ejecutar el script
fixNotificationRoutes();
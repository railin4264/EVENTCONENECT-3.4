const fs = require('fs');
const path = require('path');

// Función para corregir rutas de gamificación
function fixGamificationRoutes() {
  console.log('🔧 Corrigiendo rutas de gamificación...');
  
  const filePath = 'src/routes/gamification.js';
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // Reemplazar todas las referencias
    content = content.replace(/authMiddleware/g, 'authenticateToken');
    content = content.replace(/rateLimits\.general/g, 'generalLimiter');
    content = content.replace(/rateLimits\.actions/g, 'generalLimiter');

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
fixGamificationRoutes();
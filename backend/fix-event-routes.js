const fs = require('fs');
const path = require('path');

// Función para corregir rutas de eventos
function fixEventRoutes() {
  console.log('🔧 Corrigiendo rutas de eventos...');
  
  const filePath = 'src/routes/events.js';
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // Reemplazar todas las referencias a eventActionsLimiter con generalLimiter
    content = content.replace(/eventActionsLimiter/g, 'generalLimiter');

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
fixEventRoutes();
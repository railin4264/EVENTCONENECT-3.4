// TEST BÁSICO DEL SERVIDOR BACKEND
// ================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Configuración mínima para testing
const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/eventconnect-test',
  NODE_ENV: 'development'
};

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Endpoint de prueba de conectividad
app.get('/', (req, res) => {
  res.json({
    message: '✅ EventConnect Backend funcionando correctamente',
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    port: config.PORT
  });
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de prueba de base de datos
app.get('/db-test', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({
        database: '✅ MongoDB conectado correctamente',
        status: 'connected',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
    } else {
      res.status(500).json({
        database: '❌ MongoDB no conectado',
        status: 'disconnected',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({
      database: '❌ Error de base de datos',
      error: error.message,
      status: 'error'
    });
  }
});

// Función para probar la base de datos
async function testDatabase() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB conectado correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error conectando a MongoDB:', error.message);
    console.log('⚠️  Continuando sin base de datos para testing básico...');
    return false;
  }
}

// Iniciar servidor
async function startServer() {
  console.log('🚀 Iniciando servidor de testing...');
  
  // Probar conexión a base de datos
  const dbConnected = await testDatabase();
  
  // Iniciar servidor independientemente de la conexión DB
  const server = app.listen(config.PORT, () => {
    console.log(`
🎉 ================================
   SERVIDOR BACKEND INICIADO
================================
🌐 URL: http://localhost:${config.PORT}
💾 Base de datos: ${dbConnected ? '✅ Conectada' : '❌ Desconectada'}
🕐 Tiempo: ${new Date().toLocaleString()}
📊 Entorno: ${config.NODE_ENV}
================================

📋 ENDPOINTS DISPONIBLES:
   GET  /         - Estado del servidor
   GET  /health   - Health check
   GET  /db-test  - Test de base de datos

🧪 COMANDOS DE TESTING:
   curl http://localhost:${config.PORT}
   curl http://localhost:${config.PORT}/health
   curl http://localhost:${config.PORT}/db-test
================================
    `);
  });

  // Manejo de errores
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ El puerto ${config.PORT} ya está en uso`);
      process.exit(1);
    } else {
      console.log('❌ Error del servidor:', error);
      process.exit(1);
    }
  });

  // Manejo de cierre limpio
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
      mongoose.connection.close();
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });
  });
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = app;










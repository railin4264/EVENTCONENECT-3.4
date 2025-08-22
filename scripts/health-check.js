#!/usr/bin/env node

const axios = require('axios');
const { MongoClient } = require('mongodb');
const redis = require('redis');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Configuración
const config = {
  backend: process.env.BACKEND_URL || 'http://localhost:5000',
  frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  mongodb: process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/eventconnect?authSource=admin',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || 'password123'
  },
  mongoExpress: 'http://localhost:8083',
  redisCommander: 'http://localhost:8082'
};

// Función para imprimir con color
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Banner
function printBanner() {
  console.clear();
  print(`
╔═══════════════════════════════════════════════════════════╗
║          EventConnect - Health Check v1.0                 ║
║          Verificando el estado de los servicios...        ║
╚═══════════════════════════════════════════════════════════╝
`, 'blue');
}

// Verificar servicio HTTP
async function checkHttpService(name, url, expectedStatus = 200) {
  try {
    const response = await axios.get(url, { 
      timeout: 5000,
      validateStatus: () => true 
    });
    
    if (response.status === expectedStatus) {
      print(`✅ ${name}: OK (${response.status})`, 'green');
      return true;
    } else {
      print(`❌ ${name}: Error (${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    print(`❌ ${name}: No disponible - ${error.message}`, 'red');
    return false;
  }
}

// Verificar MongoDB
async function checkMongoDB() {
  const client = new MongoClient(config.mongodb, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    await client.db().admin().ping();
    print('✅ MongoDB: Conectado correctamente', 'green');
    
    // Verificar colecciones
    const db = client.db('eventconnect');
    const collections = await db.listCollections().toArray();
    print(`   📊 Colecciones: ${collections.length}`, 'blue');
    
    return true;
  } catch (error) {
    print(`❌ MongoDB: ${error.message}`, 'red');
    return false;
  } finally {
    await client.close();
  }
}

// Verificar Redis
async function checkRedis() {
  return new Promise((resolve) => {
    const client = redis.createClient({
      url: config.redis.url,
      password: config.redis.password,
      socket: {
        connectTimeout: 5000
      }
    });
    
    client.on('error', (err) => {
      print(`❌ Redis: ${err.message}`, 'red');
      resolve(false);
    });
    
    client.connect().then(async () => {
      await client.ping();
      print('✅ Redis: Conectado correctamente', 'green');
      
      // Obtener información
      const info = await client.info('server');
      const version = info.match(/redis_version:(.+)/)?.[1];
      if (version) {
        print(`   📊 Versión: ${version.trim()}`, 'blue');
      }
      
      await client.disconnect();
      resolve(true);
    }).catch((err) => {
      print(`❌ Redis: ${err.message}`, 'red');
      resolve(false);
    });
  });
}

// Verificar API Backend
async function checkBackendAPI() {
  try {
    const healthResponse = await axios.get(`${config.backend}/health`, {
      timeout: 5000
    });
    
    if (healthResponse.data.status === 'OK') {
      print('✅ Backend API: Funcionando correctamente', 'green');
      print(`   📊 Uptime: ${Math.floor(healthResponse.data.uptime)}s`, 'blue');
      print(`   📊 Base de datos: ${healthResponse.data.database}`, 'blue');
      print(`   📊 Redis: ${healthResponse.data.redis}`, 'blue');
      return true;
    } else {
      print('❌ Backend API: Estado no saludable', 'red');
      return false;
    }
  } catch (error) {
    print(`❌ Backend API: ${error.message}`, 'red');
    return false;
  }
}

// Función principal
async function runHealthCheck() {
  printBanner();
  
  print('\n🔍 Verificando servicios principales...\n', 'yellow');
  
  const results = {
    mongodb: await checkMongoDB(),
    redis: await checkRedis(),
    backend: await checkBackendAPI(),
    frontend: await checkHttpService('Frontend Web', config.frontend),
    mongoExpress: await checkHttpService('Mongo Express', config.mongoExpress, 401),
    redisCommander: await checkHttpService('Redis Commander', config.redisCommander)
  };
  
  print('\n📋 Resumen de resultados:\n', 'yellow');
  
  const totalServices = Object.keys(results).length;
  const healthyServices = Object.values(results).filter(Boolean).length;
  const healthPercentage = Math.round((healthyServices / totalServices) * 100);
  
  if (healthPercentage === 100) {
    print(`✅ Todos los servicios están funcionando correctamente (${healthyServices}/${totalServices})`, 'green');
    print('\n🎉 ¡EventConnect está listo para usar!', 'green');
  } else if (healthPercentage >= 50) {
    print(`⚠️  Algunos servicios no están disponibles (${healthyServices}/${totalServices})`, 'yellow');
    print('\n⚠️  EventConnect puede funcionar con limitaciones', 'yellow');
  } else {
    print(`❌ La mayoría de servicios no están disponibles (${healthyServices}/${totalServices})`, 'red');
    print('\n❌ EventConnect no puede funcionar correctamente', 'red');
  }
  
  print('\n📍 URLs de acceso:', 'blue');
  print(`   - Frontend: ${config.frontend}`, 'blue');
  print(`   - Backend API: ${config.backend}`, 'blue');
  print(`   - Health Check: ${config.backend}/health`, 'blue');
  print(`   - Mongo Express: ${config.mongoExpress}`, 'blue');
  print(`   - Redis Commander: ${config.redisCommander}`, 'blue');
  
  print('\n💡 Consejo: Si hay servicios no disponibles, ejecuta:', 'yellow');
  print('   docker-compose up -d', 'yellow');
  print('   O usa el script: ./start.sh\n', 'yellow');
  
  process.exit(healthPercentage === 100 ? 0 : 1);
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  print(`\n❌ Error no esperado: ${error.message}`, 'red');
  process.exit(1);
});

// Ejecutar verificación
runHealthCheck();
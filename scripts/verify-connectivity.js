#!/usr/bin/env node

/**
 * Script de verificación de conectividad EventConnect
 * Verifica que todos los componentes puedan conectarse correctamente
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuraciones por defecto
const CONFIG = {
  BACKEND_URL: 'http://localhost:5000',
  FRONTEND_URL: 'http://localhost:3000',
  MOBILE_EXPO_URL: 'http://localhost:19006',
  TIMEOUT: 10000
};

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStatus(service, status, details = '') {
  const icon = status === 'OK' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
  const color = status === 'OK' ? 'green' : status === 'WARNING' ? 'yellow' : 'red';
  log(`${icon} ${service}: ${status} ${details}`, color);
}

async function checkUrl(url, name, expectedContent = null) {
  try {
    log(`\n🔍 Verificando ${name}...`, 'blue');
    
    const response = await axios.get(url, { 
      timeout: CONFIG.TIMEOUT,
      validateStatus: function (status) {
        return status < 500; // Acepta cualquier status < 500
      }
    });
    
    if (response.status === 200) {
      if (expectedContent && !JSON.stringify(response.data).includes(expectedContent)) {
        logStatus(name, 'WARNING', `Respuesta inesperada`);
        return false;
      }
      logStatus(name, 'OK', `Status: ${response.status}`);
      return true;
    } else {
      logStatus(name, 'ERROR', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logStatus(name, 'ERROR', 'Conexión rechazada - servicio no está ejecutándose');
    } else if (error.code === 'ENOTFOUND') {
      logStatus(name, 'ERROR', 'Host no encontrado');
    } else if (error.code === 'ETIMEDOUT') {
      logStatus(name, 'ERROR', 'Timeout de conexión');
    } else {
      logStatus(name, 'ERROR', error.message);
    }
    return false;
  }
}

async function checkBackendHealth() {
  log('\n🏥 Verificando salud del backend...', 'bold');
  
  const endpoints = [
    { url: `${CONFIG.BACKEND_URL}/health`, name: 'Health Check' },
    { url: `${CONFIG.BACKEND_URL}/health/database`, name: 'Database Health' },
    { url: `${CONFIG.BACKEND_URL}/health/system`, name: 'System Health' },
    { url: `${CONFIG.BACKEND_URL}/api`, name: 'API Info', expected: 'EventConnect API' }
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await checkUrl(endpoint.url, endpoint.name, endpoint.expected);
    results.push(result);
  }
  
  return results.every(r => r);
}

async function checkFrontendApps() {
  log('\n🌐 Verificando aplicaciones frontend...', 'bold');
  
  const apps = [
    { url: CONFIG.FRONTEND_URL, name: 'Web Frontend (Next.js)' },
    { url: CONFIG.MOBILE_EXPO_URL, name: 'Mobile App (Expo)' }
  ];
  
  const results = [];
  for (const app of apps) {
    const result = await checkUrl(app.url, app.name);
    results.push(result);
  }
  
  return results.every(r => r);
}

function checkConfigFiles() {
  log('\n📋 Verificando archivos de configuración...', 'bold');
  
  const configFiles = [
    { path: 'backend/env-config.txt', name: 'Backend Config' },
    { path: 'web/env-local-config.txt', name: 'Web Config' },
    { path: 'mobile/env-config.txt', name: 'Mobile Config' },
    { path: 'backend/package.json', name: 'Backend Package' },
    { path: 'web/package.json', name: 'Web Package' },
    { path: 'mobile/package.json', name: 'Mobile Package' }
  ];
  
  let allExist = true;
  
  for (const file of configFiles) {
    const fullPath = path.join(process.cwd(), file.path);
    if (fs.existsSync(fullPath)) {
      logStatus(file.name, 'OK', 'Archivo encontrado');
    } else {
      logStatus(file.name, 'ERROR', 'Archivo no encontrado');
      allExist = false;
    }
  }
  
  return allExist;
}

function checkDependencies() {
  log('\n📦 Verificando node_modules...', 'bold');
  
  const nodeModulesDirs = [
    'backend/node_modules',
    'web/node_modules', 
    'mobile/node_modules'
  ];
  
  let allExist = true;
  
  for (const dir of nodeModulesDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      logStatus(dir, 'OK', 'Dependencias instaladas');
    } else {
      logStatus(dir, 'ERROR', 'Dependencias no instaladas - ejecuta npm install');
      allExist = false;
    }
  }
  
  return allExist;
}

async function testApiEndpoints() {
  log('\n🔌 Probando endpoints principales de la API...', 'bold');
  
  const endpoints = [
    { method: 'GET', url: '/api/events', name: 'Obtener eventos' },
    { method: 'GET', url: '/api/tribes', name: 'Obtener tribus' },
    { method: 'POST', url: '/api/auth/register', name: 'Registro (sin datos)', expectError: true }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${CONFIG.BACKEND_URL}${endpoint.url}`,
        timeout: CONFIG.TIMEOUT,
        validateStatus: () => true // Acepta cualquier status
      };
      
      if (endpoint.method === 'POST') {
        config.data = {}; // Datos vacíos para testing
      }
      
      const response = await axios(config);
      
      if (endpoint.expectError && response.status >= 400) {
        logStatus(endpoint.name, 'OK', `Error esperado: ${response.status}`);
        results.push(true);
      } else if (!endpoint.expectError && response.status < 400) {
        logStatus(endpoint.name, 'OK', `Status: ${response.status}`);
        results.push(true);
      } else {
        logStatus(endpoint.name, 'WARNING', `Status inesperado: ${response.status}`);
        results.push(false);
      }
    } catch (error) {
      logStatus(endpoint.name, 'ERROR', error.message);
      results.push(false);
    }
  }
  
  return results.filter(r => r).length >= results.length * 0.7; // 70% de éxito mínimo
}

function generateSetupInstructions() {
  log('\n📋 INSTRUCCIONES DE CONFIGURACIÓN:', 'bold');
  log('━'.repeat(50), 'blue');
  
  log('\n1. BACKEND:', 'yellow');
  log('   cd backend');
  log('   npm install');
  log('   cp env-config.txt .env');
  log('   npm run dev');
  
  log('\n2. WEB FRONTEND:', 'yellow');
  log('   cd web');
  log('   npm install');
  log('   cp env-local-config.txt .env.local');
  log('   npm run dev');
  
  log('\n3. MOBILE APP:', 'yellow');
  log('   cd mobile');
  log('   npm install');
  log('   cp env-config.txt .env');
  log('   npm start');
  
  log('\n4. BASE DE DATOS:', 'yellow');
  log('   Asegúrate de tener MongoDB ejecutándose en puerto 27017');
  log('   O actualiza MONGODB_URI en backend/.env');
  
  log('\n━'.repeat(50), 'blue');
}

async function main() {
  log('🚀 VERIFICACIÓN DE CONECTIVIDAD EVENTCONNECT', 'bold');
  log('='.repeat(50), 'blue');
  
  // Verificar archivos de configuración
  const configOk = checkConfigFiles();
  
  // Verificar dependencias
  const depsOk = checkDependencies();
  
  // Verificar backend
  const backendOk = await checkBackendHealth();
  
  // Verificar frontends
  const frontendsOk = await checkFrontendApps();
  
  // Probar endpoints de API
  const apiOk = await testApiEndpoints();
  
  // Resumen final
  log('\n📊 RESUMEN DE VERIFICACIÓN:', 'bold');
  log('━'.repeat(30), 'blue');
  
  logStatus('Archivos de configuración', configOk ? 'OK' : 'ERROR');
  logStatus('Dependencias instaladas', depsOk ? 'OK' : 'ERROR');
  logStatus('Backend funcionando', backendOk ? 'OK' : 'ERROR');
  logStatus('Frontends funcionando', frontendsOk ? 'OK' : 'WARNING');
  logStatus('API endpoints', apiOk ? 'OK' : 'WARNING');
  
  const overallOk = configOk && depsOk && backendOk;
  
  log(`\n🎯 ESTADO GENERAL: ${overallOk ? '✅ LISTO PARA USAR' : '❌ NECESITA CONFIGURACIÓN'}`, 'bold');
  
  if (!overallOk) {
    generateSetupInstructions();
  } else {
    log('\n🎉 ¡EventConnect está listo para usar!', 'green');
    log('💡 URLs principales:', 'blue');
    log(`   Backend: ${CONFIG.BACKEND_URL}`);
    log(`   Web: ${CONFIG.FRONTEND_URL}`);
    log(`   Mobile: ${CONFIG.MOBILE_EXPO_URL}`);
    log(`   API Docs: ${CONFIG.BACKEND_URL}/api`);
  }
  
  return overallOk;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main, checkBackendHealth, checkFrontendApps };

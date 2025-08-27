#!/usr/bin/env node

/**
 * Script de configuración automática para desarrollo
 * Configura el entorno de desarrollo completo de EventConnect
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'blue');
  log(`🔧 ${title}`, 'bold');
  log('='.repeat(50), 'blue');
}

function logStep(step, description) {
  log(`\n📋 Paso ${step}: ${description}`, 'yellow');
}

function execCommand(command, cwd = process.cwd()) {
  try {
    log(`   Ejecutando: ${command}`, 'blue');
    execSync(command, { cwd, stdio: 'inherit' });
    log('   ✅ Completado', 'green');
    return true;
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return false;
  }
}

function copyEnvFile(source, destination, name) {
  try {
    const sourcePath = path.join(process.cwd(), source);
    const destPath = path.join(process.cwd(), destination);
    
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
        log(`   ✅ ${name} configurado: ${destination}`, 'green');
      } else {
        log(`   ℹ️  ${name} ya existe: ${destination}`, 'yellow');
      }
      return true;
    } else {
      log(`   ❌ Archivo fuente no encontrado: ${source}`, 'red');
      return false;
    }
  } catch (error) {
    log(`   ❌ Error copiando ${name}: ${error.message}`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  logSection('VERIFICANDO PREREQUISITOS');
  
  const commands = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' },
    { cmd: 'git --version', name: 'Git' }
  ];
  
  let allOk = true;
  
  for (const { cmd, name } of commands) {
    try {
      const version = execSync(cmd, { encoding: 'utf8' }).trim();
      log(`✅ ${name}: ${version}`, 'green');
    } catch (error) {
      log(`❌ ${name}: No instalado`, 'red');
      allOk = false;
    }
  }
  
  // Verificar MongoDB (opcional)
  try {
    execSync('mongod --version', { encoding: 'utf8', stdio: 'ignore' });
    log('✅ MongoDB: Instalado', 'green');
  } catch (error) {
    log('⚠️  MongoDB: No detectado (necesario para el backend)', 'yellow');
  }
  
  return allOk;
}

function setupBackend() {
  logSection('CONFIGURANDO BACKEND');
  
  const backendDir = path.join(process.cwd(), 'backend');
  
  if (!fs.existsSync(backendDir)) {
    log('❌ Directorio backend no encontrado', 'red');
    return false;
  }
  
  logStep(1, 'Instalando dependencias del backend');
  if (!execCommand('npm install', backendDir)) return false;
  
  logStep(2, 'Configurando variables de entorno');
  copyEnvFile('backend/env-config.txt', 'backend/.env', 'Backend .env');
  
  logStep(3, 'Verificando configuración');
  if (fs.existsSync(path.join(backendDir, '.env'))) {
    log('   ✅ Backend configurado correctamente', 'green');
    return true;
  }
  
  return false;
}

function setupWeb() {
  logSection('CONFIGURANDO WEB FRONTEND');
  
  const webDir = path.join(process.cwd(), 'web');
  
  if (!fs.existsSync(webDir)) {
    log('❌ Directorio web no encontrado', 'red');
    return false;
  }
  
  logStep(1, 'Instalando dependencias del frontend web');
  if (!execCommand('npm install', webDir)) return false;
  
  logStep(2, 'Configurando variables de entorno');
  copyEnvFile('web/env-local-config.txt', 'web/.env.local', 'Web .env.local');
  
  logStep(3, 'Verificando configuración');
  if (fs.existsSync(path.join(webDir, '.env.local'))) {
    log('   ✅ Frontend web configurado correctamente', 'green');
    return true;
  }
  
  return false;
}

function setupMobile() {
  logSection('CONFIGURANDO MOBILE APP');
  
  const mobileDir = path.join(process.cwd(), 'mobile');
  
  if (!fs.existsSync(mobileDir)) {
    log('❌ Directorio mobile no encontrado', 'red');
    return false;
  }
  
  logStep(1, 'Instalando dependencias de la app móvil');
  if (!execCommand('npm install', mobileDir)) return false;
  
  logStep(2, 'Configurando variables de entorno');
  copyEnvFile('mobile/env-config.txt', 'mobile/.env', 'Mobile .env');
  
  logStep(3, 'Verificando configuración');
  if (fs.existsSync(path.join(mobileDir, '.env'))) {
    log('   ✅ App móvil configurada correctamente', 'green');
    return true;
  }
  
  return false;
}

function generateStartupScripts() {
  logSection('GENERANDO SCRIPTS DE INICIO');
  
  const scripts = {
    'start-backend.js': `
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando backend EventConnect...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

backend.on('close', (code) => {
  console.log(\`Backend cerrado con código \${code}\`);
});

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  process.exit(0);
});
    `.trim(),
    
    'start-web.js': `
const { spawn } = require('child_process');
const path = require('path');

console.log('🌐 Iniciando frontend web EventConnect...');
const web = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'web'),
  stdio: 'inherit',
  shell: true
});

web.on('close', (code) => {
  console.log(\`Frontend web cerrado con código \${code}\`);
});

process.on('SIGINT', () => {
  web.kill('SIGINT');
  process.exit(0);
});
    `.trim(),
    
    'start-mobile.js': `
const { spawn } = require('child_process');
const path = require('path');

console.log('📱 Iniciando app móvil EventConnect...');
const mobile = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'mobile'),
  stdio: 'inherit',
  shell: true
});

mobile.on('close', (code) => {
  console.log(\`App móvil cerrada con código \${code}\`);
});

process.on('SIGINT', () => {
  mobile.kill('SIGINT');
  process.exit(0);
});
    `.trim(),
    
    'start-all.js': `
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando EventConnect completo...');

const processes = [];

// Backend
const backend = spawn('node', ['start-backend.js'], {
  stdio: 'inherit',
  shell: true
});
processes.push(backend);

// Esperar un poco antes de iniciar frontend
setTimeout(() => {
  // Web
  const web = spawn('node', ['start-web.js'], {
    stdio: 'inherit',
    shell: true
  });
  processes.push(web);
  
  // Mobile
  const mobile = spawn('node', ['start-mobile.js'], {
    stdio: 'inherit',
    shell: true
  });
  processes.push(mobile);
}, 3000);

process.on('SIGINT', () => {
  console.log('\\n🛑 Cerrando EventConnect...');
  processes.forEach(proc => proc.kill('SIGINT'));
  process.exit(0);
});
    `.trim()
  };
  
  Object.entries(scripts).forEach(([filename, content]) => {
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, content);
    log(`✅ Creado: ${filename}`, 'green');
  });
}

function showFinalInstructions(success) {
  logSection('INSTRUCCIONES FINALES');
  
  if (success) {
    log('🎉 ¡Configuración completada exitosamente!', 'green');
    
    log('\n📋 COMANDOS DISPONIBLES:', 'bold');
    log('  node start-backend.js    - Solo backend', 'blue');
    log('  node start-web.js        - Solo frontend web', 'blue');
    log('  node start-mobile.js     - Solo app móvil', 'blue');
    log('  node start-all.js        - Todo junto', 'blue');
    log('  node scripts/verify-connectivity.js - Verificar conexiones', 'blue');
    
    log('\n🌐 URLs PRINCIPALES:', 'bold');
    log('  Backend API: http://localhost:5000', 'green');
    log('  Frontend Web: http://localhost:3000', 'green');
    log('  Mobile App: http://localhost:19006', 'green');
    log('  API Docs: http://localhost:5000/api', 'green');
    
    log('\n⚡ INICIO RÁPIDO:', 'bold');
    log('  node start-all.js', 'yellow');
    
  } else {
    log('❌ Configuración incompleta', 'red');
    log('\n🔧 PASOS MANUALES NECESARIOS:', 'yellow');
    log('1. Verificar que Node.js y npm estén instalados');
    log('2. Instalar MongoDB si usarás base de datos local');
    log('3. Ejecutar npm install en cada directorio manualmente');
    log('4. Copiar archivos de configuración manualmente');
  }
}

async function main() {
  log('🚀 CONFIGURACIÓN AUTOMÁTICA EVENTCONNECT', 'bold');
  log('='.repeat(50), 'blue');
  
  // Verificar prerequisitos
  if (!checkPrerequisites()) {
    log('\n❌ Prerequisitos no cumplidos. Instalar herramientas necesarias.', 'red');
    return false;
  }
  
  // Configurar componentes
  const backendOk = setupBackend();
  const webOk = setupWeb();
  const mobileOk = setupMobile();
  
  // Generar scripts de inicio
  generateStartupScripts();
  
  const success = backendOk && webOk && mobileOk;
  
  // Mostrar instrucciones finales
  showFinalInstructions(success);
  
  return success;
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

module.exports = { main };

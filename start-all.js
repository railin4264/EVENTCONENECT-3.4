#!/usr/bin/env node

/**
 * Script para iniciar todos los servicios de EventConnect
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando EventConnect completo...');
console.log('='.repeat(50));

const processes = [];

// Función para crear un proceso
function createProcess(name, command, args, cwd, color = '') {
  console.log(`${color}📦 Iniciando ${name}...`);
  
  const proc = spawn(command, args, {
    cwd: path.join(__dirname, cwd),
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('error', (error) => {
    console.error(`❌ Error en ${name}:`, error.message);
  });
  
  proc.on('close', (code) => {
    if (code !== 0) {
      console.log(`⚠️  ${name} cerrado con código ${code}`);
    } else {
      console.log(`✅ ${name} cerrado correctamente`);
    }
  });
  
  return proc;
}

// Iniciar backend primero
const backend = createProcess('Backend', 'npm', ['run', 'dev'], 'backend', '\x1b[32m');
processes.push({ name: 'Backend', process: backend });

// Esperar un poco antes de iniciar frontends
setTimeout(() => {
  // Frontend web
  const web = createProcess('Frontend Web', 'npm', ['run', 'dev'], 'web', '\x1b[34m');
  processes.push({ name: 'Frontend Web', process: web });
  
  // App móvil
  setTimeout(() => {
    const mobile = createProcess('App Móvil', 'npm', ['start'], 'mobile', '\x1b[35m');
    processes.push({ name: 'App Móvil', process: mobile });
  }, 2000);
  
}, 3000);

// Mostrar información
setTimeout(() => {
  console.log('\n🎯 EVENTCONNECT INICIADO');
  console.log('='.repeat(30));
  console.log('🌐 URLs principales:');
  console.log('  Backend API: http://localhost:5000');
  console.log('  Frontend Web: http://localhost:3000');
  console.log('  App Móvil: http://localhost:19006');
  console.log('  API Docs: http://localhost:5000/api');
  console.log('\n⚡ Presiona Ctrl+C para detener todos los servicios');
  console.log('='.repeat(50));
}, 8000);

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando EventConnect...');
  
  processes.forEach(({ name, process }) => {
    console.log(`   Cerrando ${name}...`);
    process.kill('SIGINT');
  });
  
  setTimeout(() => {
    console.log('✅ EventConnect cerrado completamente');
    process.exit(0);
  }, 2000);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

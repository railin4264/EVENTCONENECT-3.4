#!/bin/bash

# EventConnect - Script de Inicio Rápido
# Este script configura e inicia la aplicación EventConnect

set -e

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_message() {
    echo -e "${2}${1}${NC}"
}

# Banner
clear
print_message "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ███████╗██╗   ██╗███████╗███╗   ██╗████████╗         ║
║     ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝         ║
║     █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║            ║
║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║            ║
║     ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║            ║
║     ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝            ║
║                                                           ║
║            ██████╗ ██████╗ ███╗   ██╗███╗   ██╗          ║
║           ██╔════╝██╔═══██╗████╗  ██║████╗  ██║          ║
║           ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║          ║
║           ██║     ██║   ██║██║╚██╗██║██║╚██╗██║          ║
║           ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║          ║
║            ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝          ║
║                                                           ║
║              🚀 Configuración e Inicio Rápido 🚀          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
" "$BLUE"

# Verificar requisitos
print_message "\n📋 Verificando requisitos del sistema..." "$YELLOW"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_message "❌ Node.js no está instalado. Por favor instala Node.js 18+" "$RED"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_message "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)" "$RED"
    exit 1
fi
print_message "✅ Node.js $(node -v) detectado" "$GREEN"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_message "❌ npm no está instalado" "$RED"
    exit 1
fi
print_message "✅ npm $(npm -v) detectado" "$GREEN"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_message "⚠️  Docker no está instalado. Se usará instalación manual" "$YELLOW"
    DOCKER_AVAILABLE=false
else
    print_message "✅ Docker detectado" "$GREEN"
    DOCKER_AVAILABLE=true
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && [ "$DOCKER_AVAILABLE" = true ]; then
    if ! docker compose version &> /dev/null; then
        print_message "⚠️  Docker Compose no está instalado" "$YELLOW"
        DOCKER_COMPOSE_AVAILABLE=false
    else
        DOCKER_COMPOSE_CMD="docker compose"
        DOCKER_COMPOSE_AVAILABLE=true
    fi
else
    DOCKER_COMPOSE_CMD="docker-compose"
    DOCKER_COMPOSE_AVAILABLE=true
fi

# Configurar archivos de entorno
print_message "\n🔧 Configurando archivos de entorno..." "$YELLOW"

if [ ! -f backend/.env ]; then
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        print_message "✅ Archivo backend/.env creado" "$GREEN"
    else
        print_message "⚠️  No se encontró backend/.env.example" "$YELLOW"
    fi
else
    print_message "✅ Archivo backend/.env ya existe" "$GREEN"
fi

if [ ! -f web/.env.local ]; then
    if [ -f web/.env.example ]; then
        cp web/.env.example web/.env.local
        print_message "✅ Archivo web/.env.local creado" "$GREEN"
    else
        print_message "⚠️  No se encontró web/.env.example" "$YELLOW"
    fi
else
    print_message "✅ Archivo web/.env.local ya existe" "$GREEN"
fi

# Preguntar método de instalación
print_message "\n🚀 ¿Cómo deseas iniciar EventConnect?" "$YELLOW"
echo "1) Docker (Recomendado)"
echo "2) Instalación manual"
echo "3) Salir"
read -p "Selecciona una opción (1-3): " choice

case $choice in
    1)
        if [ "$DOCKER_AVAILABLE" = false ] || [ "$DOCKER_COMPOSE_AVAILABLE" = false ]; then
            print_message "❌ Docker o Docker Compose no están disponibles" "$RED"
            exit 1
        fi
        
        print_message "\n🐳 Iniciando con Docker..." "$YELLOW"
        
        # Construir e iniciar contenedores
        print_message "Construyendo imágenes..." "$BLUE"
        $DOCKER_COMPOSE_CMD build
        
        print_message "Iniciando servicios..." "$BLUE"
        $DOCKER_COMPOSE_CMD up -d
        
        # Esperar a que los servicios estén listos
        print_message "\n⏳ Esperando a que los servicios estén listos..." "$YELLOW"
        sleep 10
        
        # Verificar servicios
        if $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
            print_message "✅ Todos los servicios están ejecutándose" "$GREEN"
        else
            print_message "❌ Algunos servicios no se iniciaron correctamente" "$RED"
            $DOCKER_COMPOSE_CMD ps
            exit 1
        fi
        ;;
        
    2)
        print_message "\n📦 Instalación manual..." "$YELLOW"
        
        # Instalar dependencias
        print_message "Instalando dependencias del proyecto raíz..." "$BLUE"
        npm install
        
        print_message "Instalando dependencias del backend..." "$BLUE"
        cd backend && npm install && cd ..
        
        print_message "Instalando dependencias del frontend..." "$BLUE"
        cd web && npm install && cd ..
        
        # Iniciar servicios externos con Docker si está disponible
        if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
            print_message "\n🐳 Iniciando MongoDB y Redis con Docker..." "$YELLOW"
            $DOCKER_COMPOSE_CMD up -d mongo redis
            sleep 5
        else
            print_message "\n⚠️  Asegúrate de tener MongoDB y Redis ejecutándose localmente" "$YELLOW"
        fi
        
        # Iniciar la aplicación
        print_message "\n🚀 Iniciando la aplicación..." "$YELLOW"
        npm run dev
        ;;
        
    3)
        print_message "\n👋 ¡Hasta luego!" "$BLUE"
        exit 0
        ;;
        
    *)
        print_message "\n❌ Opción inválida" "$RED"
        exit 1
        ;;
esac

# Mostrar información de acceso
print_message "\n
╔═══════════════════════════════════════════════════════════╗
║                  🎉 ¡EventConnect está listo! 🎉          ║
╚═══════════════════════════════════════════════════════════╝
" "$GREEN"

print_message "📱 Accede a la aplicación en:" "$BLUE"
print_message "   - Frontend: http://localhost:3000" "$NC"
print_message "   - Backend API: http://localhost:5000" "$NC"
print_message "   - Health Check: http://localhost:5000/health" "$NC"
print_message "   - MongoDB Admin: http://localhost:8083" "$NC"
print_message "   - Redis Commander: http://localhost:8082" "$NC"

print_message "\n🔑 Usuarios de prueba:" "$BLUE"
print_message "   - admin@eventconnect.com / Admin123!" "$NC"
print_message "   - user@eventconnect.com / Password123!" "$NC"

print_message "\n📚 Comandos útiles:" "$BLUE"
print_message "   - Ver logs: $DOCKER_COMPOSE_CMD logs -f" "$NC"
print_message "   - Detener servicios: $DOCKER_COMPOSE_CMD down" "$NC"
print_message "   - Poblar base de datos: npm run db:seed" "$NC"

print_message "\n❓ ¿Necesitas ayuda? Revisa README-QUICKSTART.md" "$YELLOW"
print_message "\n¡Disfruta usando EventConnect! 🚀\n" "$GREEN"
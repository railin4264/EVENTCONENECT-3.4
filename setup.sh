#!/bin/bash

# EventConnect - Setup Script
# Este script automatiza la instalación y configuración completa de EventConnect

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_header "Verificando Prerrequisitos"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión 18+ es requerida. Versión actual: $(node -v)"
        exit 1
    fi
    
    print_message "Node.js $(node -v) ✓"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v | cut -d'.' -f1)
    if [ "$NPM_VERSION" -lt 9 ]; then
        print_error "npm versión 9+ es requerida. Versión actual: $(npm -v)"
        exit 1
    fi
    
    print_message "npm $(npm -v) ✓"
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git no está instalado"
        exit 1
    fi
    
    print_message "Git $(git --version) ✓"
    
    # Verificar MongoDB (opcional)
    if command -v mongod &> /dev/null; then
        print_message "MongoDB detectado ✓"
    else
        print_warning "MongoDB no detectado. Asegúrate de tener MongoDB instalado y corriendo"
    fi
    
    # Verificar Redis (opcional)
    if command -v redis-server &> /dev/null; then
        print_message "Redis detectado ✓"
    else
        print_warning "Redis no detectado. Asegúrate de tener Redis instalado y corriendo"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_header "Instalando Dependencias"
    
    print_message "Instalando dependencias del workspace principal..."
    npm install
    
    print_message "Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    
    print_message "Instalando dependencias del frontend web..."
    cd web
    npm install
    cd ..
    
    print_message "Instalando dependencias del frontend móvil..."
    cd mobile
    npm install
    cd ..
    
    print_message "Todas las dependencias instaladas ✓"
}

# Configurar variables de entorno
setup_environment() {
    print_header "Configurando Variables de Entorno"
    
    # Backend
    if [ ! -f "backend/.env" ]; then
        print_message "Creando archivo .env para backend..."
        cp backend/.env.example backend/.env
        print_warning "Por favor edita backend/.env con tus configuraciones"
    else
        print_message "Archivo .env del backend ya existe ✓"
    fi
    
    # Frontend Web
    if [ ! -f "web/.env.local" ]; then
        print_message "Creando archivo .env.local para frontend web..."
        cat > web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EOF
        print_warning "Por favor edita web/.env.local con tus configuraciones"
    else
        print_message "Archivo .env.local del frontend web ya existe ✓"
    fi
    
    # Frontend Móvil
    if [ ! -f "mobile/.env" ]; then
        print_message "Creando archivo .env para frontend móvil..."
        cat > mobile/.env << EOF
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_WS_URL=ws://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EOF
        print_warning "Por favor edita mobile/.env con tus configuraciones"
    else
        print_message "Archivo .env del frontend móvil ya existe ✓"
    fi
}

# Configurar base de datos
setup_database() {
    print_header "Configurando Base de Datos"
    
    print_message "Verificando conexión a MongoDB..."
    
    # Intentar conectar a MongoDB
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
            print_message "MongoDB está corriendo ✓"
        else
            print_warning "MongoDB no está corriendo. Inicia MongoDB antes de continuar"
        fi
    else
        print_warning "mongosh no está disponible. Verifica manualmente que MongoDB esté corriendo"
    fi
    
    print_message "Verificando conexión a Redis..."
    
    # Intentar conectar a Redis
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            print_message "Redis está corriendo ✓"
        else
            print_warning "Redis no está corriendo. Inicia Redis antes de continuar"
        fi
    else
        print_warning "redis-cli no está disponible. Verifica manualmente que Redis esté corriendo"
    fi
}

# Ejecutar migraciones y seeders
run_migrations() {
    print_header "Ejecutando Migraciones y Seeders"
    
    cd backend
    
    print_message "Ejecutando migraciones de base de datos..."
    if npm run db:migrate > /dev/null 2>&1; then
        print_message "Migraciones ejecutadas ✓"
    else
        print_warning "Error ejecutando migraciones. Verifica la conexión a MongoDB"
    fi
    
    print_message "Ejecutando seeders..."
    if npm run db:seed > /dev/null 2>&1; then
        print_message "Seeders ejecutados ✓"
    else
        print_warning "Error ejecutando seeders. Verifica la conexión a MongoDB"
    fi
    
    cd ..
}

# Verificar instalación
verify_installation() {
    print_header "Verificando Instalación"
    
    # Verificar que todos los archivos necesarios existen
    required_files=(
        "backend/package.json"
        "web/package.json"
        "mobile/package.json"
        "backend/src/server.js"
        "web/next.config.js"
        "mobile/app.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_message "$file ✓"
        else
            print_error "$file no encontrado"
            exit 1
        fi
    done
    
    # Verificar que las dependencias están instaladas
    if [ -d "backend/node_modules" ] && [ -d "web/node_modules" ] && [ -d "mobile/node_modules" ]; then
        print_message "Todas las dependencias están instaladas ✓"
    else
        print_error "Algunas dependencias no están instaladas"
        exit 1
    fi
}

# Mostrar información de inicio
show_startup_info() {
    print_header "Información de Inicio"
    
    echo -e "${GREEN}¡EventConnect está listo para usar!${NC}"
    echo ""
    echo -e "${BLUE}Para iniciar el desarrollo:${NC}"
    echo "  npm run dev                    # Iniciar todo (backend + web + mobile)"
    echo "  npm run dev:backend            # Solo backend (puerto 5000)"
    echo "  npm run dev:web               # Solo frontend web (puerto 3000)"
    echo "  npm run dev:mobile            # Solo frontend móvil (puerto 19006)"
    echo ""
    echo -e "${BLUE}URLs de desarrollo:${NC}"
    echo "  Backend API:     http://localhost:5000"
    echo "  Frontend Web:    http://localhost:3000"
    echo "  Frontend Mobile: http://localhost:19006"
    echo ""
    echo -e "${BLUE}Health Checks:${NC}"
    echo "  Backend:         http://localhost:5000/health"
    echo "  Base de datos:   http://localhost:5000/health/database"
    echo "  Sistema:         http://localhost:5000/health/system"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo "1. Configura las variables de entorno en los archivos .env"
    echo "2. Asegúrate de que MongoDB y Redis estén corriendo"
    echo "3. Ejecuta 'npm run dev' para iniciar el desarrollo"
    echo "4. Visita http://localhost:3000 para ver la aplicación web"
    echo ""
    echo -e "${GREEN}¡Disfruta desarrollando con EventConnect! 🚀${NC}"
}

# Función principal
main() {
    print_header "EventConnect - Setup Automatizado"
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_database
    run_migrations
    verify_installation
    show_startup_info
}

# Ejecutar función principal
main "$@"
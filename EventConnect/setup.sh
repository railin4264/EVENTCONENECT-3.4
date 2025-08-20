#!/bin/bash

# =============================================================================
# EventConnect - Setup Script
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logo de EventConnect
echo -e "${PURPLE}"
echo "███████╗██╗   ██╗███████╗███╗   ██╗████████╗ ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗"
echo "██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝"
echo "█████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   "
echo "██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   "
echo "███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   "
echo "╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   "
echo -e "${NC}"
echo -e "${CYAN}🎉 Configuración inicial de EventConnect${NC}"
echo ""

# Función para mostrar spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerequisitos
echo -e "${BLUE}📋 Verificando prerequisitos...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "18.0.0" ]; then
    echo -e "${RED}❌ Node.js versión 18+ requerida. Versión actual: $NODE_VERSION${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

if ! command_exists git; then
    echo -e "${RED}❌ Git no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisitos verificados${NC}"

# Verificar si Docker está disponible (opcional)
if command_exists docker; then
    echo -e "${GREEN}✅ Docker disponible${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️ Docker no disponible (opcional)${NC}"
    DOCKER_AVAILABLE=false
fi

# Instalar dependencias
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
echo -e "${CYAN}   Esto puede tomar varios minutos...${NC}"

(npm install) &
spinner $!
wait

echo -e "${GREEN}✅ Dependencias del proyecto principal instaladas${NC}"

# Instalar dependencias del backend
echo -e "${BLUE}🔧 Instalando dependencias del backend...${NC}"
(cd backend && npm install) &
spinner $!
wait

echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"

# Instalar dependencias del frontend web
echo -e "${BLUE}🌐 Instalando dependencias del frontend web...${NC}"
(cd web && npm install) &
spinner $!
wait

echo -e "${GREEN}✅ Dependencias del frontend web instaladas${NC}"

# Instalar dependencias del mobile
echo -e "${BLUE}📱 Instalando dependencias del mobile...${NC}"
(cd mobile && npm install) &
spinner $!
wait

echo -e "${GREEN}✅ Dependencias del mobile instaladas${NC}"

# Configurar archivos de entorno
echo -e "${BLUE}⚙️ Configurando archivos de entorno...${NC}"

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Archivo .env creado para backend${NC}"
else
    echo -e "${YELLOW}⚠️ Archivo .env ya existe para backend${NC}"
fi

if [ ! -f web/.env.local ]; then
    cp web/.env.example web/.env.local
    echo -e "${GREEN}✅ Archivo .env.local creado para web${NC}"
else
    echo -e "${YELLOW}⚠️ Archivo .env.local ya existe para web${NC}"
fi

if [ ! -f mobile/.env ]; then
    cp mobile/.env.example mobile/.env
    echo -e "${GREEN}✅ Archivo .env creado para mobile${NC}"
else
    echo -e "${YELLOW}⚠️ Archivo .env ya existe para mobile${NC}"
fi

# Configurar Git hooks
echo -e "${BLUE}🔗 Configurando Git hooks...${NC}"
npx husky install > /dev/null 2>&1
echo -e "${GREEN}✅ Git hooks configurados${NC}"

# Verificar configuración
echo -e "${BLUE}🧪 Verificando configuración...${NC}"

# Verificar linting
echo -e "${CYAN}   Verificando linting...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Linting configurado correctamente${NC}"
else
    echo -e "${YELLOW}⚠️ Advertencias de linting encontradas${NC}"
fi

# Verificar tipos TypeScript
echo -e "${CYAN}   Verificando tipos TypeScript...${NC}"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Tipos TypeScript válidos${NC}"
else
    echo -e "${YELLOW}⚠️ Errores de tipos encontrados${NC}"
fi

# Mostrar información de configuración
echo ""
echo -e "${PURPLE}🎯 Configuración completada!${NC}"
echo ""
echo -e "${CYAN}📝 Próximos pasos:${NC}"
echo ""
echo -e "${YELLOW}1. Configurar variables de entorno:${NC}"
echo -e "   - backend/.env"
echo -e "   - web/.env.local" 
echo -e "   - mobile/.env"
echo ""
echo -e "${YELLOW}2. Iniciar servicios de base de datos:${NC}"
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "   ${GREEN}make db-start${NC} (con Docker)"
else
    echo -e "   Instalar MongoDB y Redis manualmente"
fi
echo ""
echo -e "${YELLOW}3. Iniciar desarrollo:${NC}"
echo -e "   ${GREEN}make dev${NC} (todos los servicios)"
echo -e "   ${GREEN}make dev-backend${NC} (solo backend)"
echo -e "   ${GREEN}make dev-web${NC} (solo frontend web)"
echo -e "   ${GREEN}make dev-mobile${NC} (solo app móvil)"
echo ""
echo -e "${YELLOW}4. Comandos útiles:${NC}"
echo -e "   ${GREEN}make help${NC} - Ver todos los comandos disponibles"
echo -e "   ${GREEN}make test${NC} - Ejecutar tests"
echo -e "   ${GREEN}make lint${NC} - Verificar código"
echo -e "   ${GREEN}make build${NC} - Construir para producción"
echo ""
echo -e "${CYAN}🔗 URLs de desarrollo:${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:5000${NC}"
echo -e "   Frontend Web: ${GREEN}http://localhost:3000${NC}"
echo -e "   Mobile Expo: ${GREEN}http://localhost:19000${NC}"
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "   MongoDB Admin: ${GREEN}http://localhost:8081${NC}"
    echo -e "   Redis Admin: ${GREEN}http://localhost:8082${NC}"
fi
echo ""
echo -e "${PURPLE}¡Disfruta desarrollando con EventConnect! 🚀${NC}"
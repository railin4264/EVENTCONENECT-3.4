# EventConnect - Makefile
# Comandos útiles para desarrollo y producción

.PHONY: help install dev build test lint clean docker-up docker-down docker-logs

# Variables
DOCKER_COMPOSE_FILE = docker-compose.dev.yml
NODE_ENV ?= development

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Comando por defecto
.DEFAULT_GOAL := help

help: ## Mostrar esta ayuda
	@echo -e "$(BLUE)EventConnect - Comandos Disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# INSTALACIÓN Y CONFIGURACIÓN
# =============================================================================

install: ## Instalar todas las dependencias
	@echo -e "$(BLUE)Instalando dependencias...$(NC)"
	@npm run install:all

install-backend: ## Instalar dependencias del backend
	@echo -e "$(BLUE)Instalando dependencias del backend...$(NC)"
	@cd backend && npm install

install-web: ## Instalar dependencias del frontend web
	@echo -e "$(BLUE)Instalando dependencias del frontend web...$(NC)"
	@cd web && npm install

install-mobile: ## Instalar dependencias del frontend móvil
	@echo -e "$(BLUE)Instalando dependencias del frontend móvil...$(NC)"
	@cd mobile && npm install

setup: ## Configurar el proyecto completo
	@echo -e "$(BLUE)Configurando EventConnect...$(NC)"
	@chmod +x setup.sh
	@./setup.sh

# =============================================================================
# DESARROLLO
# =============================================================================

dev: ## Iniciar desarrollo completo (backend + web + mobile)
	@echo -e "$(BLUE)Iniciando desarrollo completo...$(NC)"
	@npm run dev

dev-backend: ## Iniciar solo el backend
	@echo -e "$(BLUE)Iniciando backend...$(NC)"
	@cd backend && npm run dev

dev-web: ## Iniciar solo el frontend web
	@echo -e "$(BLUE)Iniciando frontend web...$(NC)"
	@cd web && npm run dev

dev-mobile: ## Iniciar solo el frontend móvil
	@echo -e "$(BLUE)Iniciando frontend móvil...$(NC)"
	@cd mobile && npm start

# =============================================================================
# DOCKER
# =============================================================================

docker-up: ## Iniciar servicios con Docker Compose
	@echo -e "$(BLUE)Iniciando servicios con Docker...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) up -d

docker-down: ## Detener servicios de Docker
	@echo -e "$(BLUE)Deteniendo servicios de Docker...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) down

docker-logs: ## Ver logs de Docker
	@echo -e "$(BLUE)Mostrando logs de Docker...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f

docker-build: ## Construir imágenes de Docker
	@echo -e "$(BLUE)Construyendo imágenes de Docker...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) build

docker-clean: ## Limpiar contenedores e imágenes de Docker
	@echo -e "$(BLUE)Limpiando Docker...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) down -v --rmi all

# =============================================================================
# BASE DE DATOS
# =============================================================================

db-start: ## Iniciar base de datos con Docker
	@echo -e "$(BLUE)Iniciando base de datos...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) up -d mongodb redis

db-stop: ## Detener base de datos
	@echo -e "$(BLUE)Deteniendo base de datos...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) stop mongodb redis

db-migrate: ## Ejecutar migraciones
	@echo -e "$(BLUE)Ejecutando migraciones...$(NC)"
	@cd backend && npm run db:migrate

db-seed: ## Ejecutar seeders
	@echo -e "$(BLUE)Ejecutando seeders...$(NC)"
	@cd backend && npm run db:seed

db-reset: ## Resetear base de datos
	@echo -e "$(BLUE)Reseteando base de datos...$(NC)"
	@cd backend && npm run db:reset

db-backup: ## Crear backup de la base de datos
	@echo -e "$(BLUE)Creando backup de la base de datos...$(NC)"
	@cd backend && npm run db:backup

# =============================================================================
# BUILD Y PRODUCCIÓN
# =============================================================================

build: ## Construir para producción
	@echo -e "$(BLUE)Construyendo para producción...$(NC)"
	@npm run build

build-backend: ## Construir backend
	@echo -e "$(BLUE)Construyendo backend...$(NC)"
	@cd backend && npm run build

build-web: ## Construir frontend web
	@echo -e "$(BLUE)Construyendo frontend web...$(NC)"
	@cd web && npm run build

build-mobile: ## Construir app móvil
	@echo -e "$(BLUE)Construyendo app móvil...$(NC)"
	@cd mobile && npm run build:android

# =============================================================================
# TESTING
# =============================================================================

test: ## Ejecutar todos los tests
	@echo -e "$(BLUE)Ejecutando tests...$(NC)"
	@npm run test

test-backend: ## Ejecutar tests del backend
	@echo -e "$(BLUE)Ejecutando tests del backend...$(NC)"
	@cd backend && npm test

test-web: ## Ejecutar tests del frontend web
	@echo -e "$(BLUE)Ejecutando tests del frontend web...$(NC)"
	@cd web && npm test

test-mobile: ## Ejecutar tests del frontend móvil
	@echo -e "$(BLUE)Ejecutando tests del frontend móvil...$(NC)"
	@cd mobile && npm test

test-e2e: ## Ejecutar tests E2E
	@echo -e "$(BLUE)Ejecutando tests E2E...$(NC)"
	@cd web && npm run test:e2e

test-coverage: ## Ejecutar tests con coverage
	@echo -e "$(BLUE)Ejecutando tests con coverage...$(NC)"
	@npm run test:coverage

# =============================================================================
# LINTING Y FORMATEO
# =============================================================================

lint: ## Ejecutar linting en todo el proyecto
	@echo -e "$(BLUE)Ejecutando linting...$(NC)"
	@npm run lint

lint-fix: ## Arreglar errores de linting automáticamente
	@echo -e "$(BLUE)Arreglando errores de linting...$(NC)"
	@npm run lint:fix

format: ## Formatear código
	@echo -e "$(BLUE)Formateando código...$(NC)"
	@npm run format

type-check: ## Verificar tipos TypeScript
	@echo -e "$(BLUE)Verificando tipos TypeScript...$(NC)"
	@npm run type-check

# =============================================================================
# SEGURIDAD
# =============================================================================

security-audit: ## Ejecutar auditoría de seguridad
	@echo -e "$(BLUE)Ejecutando auditoría de seguridad...$(NC)"
	@npm run security:audit

security-fix: ## Arreglar vulnerabilidades de seguridad
	@echo -e "$(BLUE)Arreglando vulnerabilidades de seguridad...$(NC)"
	@npm run security:fix

# =============================================================================
# LIMPIEZA
# =============================================================================

clean: ## Limpiar node_modules y archivos temporales
	@echo -e "$(BLUE)Limpiando archivos temporales...$(NC)"
	@npm run clean

clean-backend: ## Limpiar backend
	@echo -e "$(BLUE)Limpiando backend...$(NC)"
	@cd backend && npm run clean

clean-web: ## Limpiar frontend web
	@echo -e "$(BLUE)Limpiando frontend web...$(NC)"
	@cd web && npm run clean

clean-mobile: ## Limpiar frontend móvil
	@echo -e "$(BLUE)Limpiando frontend móvil...$(NC)"
	@cd mobile && npm run clean

# =============================================================================
# MONITOREO Y LOGS
# =============================================================================

logs: ## Ver logs de la aplicación
	@echo -e "$(BLUE)Mostrando logs...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f backend web

logs-backend: ## Ver logs del backend
	@echo -e "$(BLUE)Mostrando logs del backend...$(NC)"
	@docker-compose -f $(DOCKLE_COMPOSE_FILE) logs -f backend

logs-web: ## Ver logs del frontend web
	@echo -e "$(BLUE)Mostrando logs del frontend web...$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f web

health: ## Verificar estado de salud de los servicios
	@echo -e "$(BLUE)Verificando estado de salud...$(NC)"
	@curl -f http://localhost:5000/health || echo "Backend no disponible"
	@curl -f http://localhost:3000 || echo "Frontend web no disponible"

# =============================================================================
# DESPLIEGUE
# =============================================================================

deploy-staging: ## Desplegar en staging
	@echo -e "$(BLUE)Desplegando en staging...$(NC)"
	@echo "Implementar lógica de despliegue en staging"

deploy-production: ## Desplegar en producción
	@echo -e "$(BLUE)Desplegando en producción...$(NC)"
	@echo "Implementar lógica de despliegue en producción"

# =============================================================================
# UTILIDADES
# =============================================================================

status: ## Mostrar estado de los servicios
	@echo -e "$(BLUE)Estado de los servicios:$(NC)"
	@docker-compose -f $(DOCKER_COMPOSE_FILE) ps

ports: ## Mostrar puertos utilizados
	@echo -e "$(BLUE)Puertos utilizados:$(NC)"
	@echo "Backend API:     http://localhost:5000"
	@echo "Frontend Web:    http://localhost:3000"
	@echo "Frontend Mobile: http://localhost:19006"
	@echo "MongoDB:         localhost:27017"
	@echo "Redis:           localhost:6379"
	@echo "Mongo Express:   http://localhost:8081"
	@echo "Redis Commander: http://localhost:8082"
	@echo "Grafana:         http://localhost:3001"
	@echo "Prometheus:      http://localhost:9090"

docs: ## Generar documentación
	@echo -e "$(BLUE)Generando documentación...$(NC)"
	@echo "Implementar generación de documentación"

# =============================================================================
# DESARROLLO RÁPIDO
# =============================================================================

quick-start: ## Inicio rápido del proyecto
	@echo -e "$(BLUE)Inicio rápido de EventConnect...$(NC)"
	@make install
	@make db-start
	@make db-migrate
	@make db-seed
	@make dev

quick-stop: ## Parar todo rápidamente
	@echo -e "$(BLUE)Parando todos los servicios...$(NC)"
	@make docker-down
	@make db-stop

# =============================================================================
# INFORMACIÓN
# =============================================================================

info: ## Mostrar información del proyecto
	@echo -e "$(BLUE)Información de EventConnect:$(NC)"
	@echo "Versión: 2.0.0"
	@echo "Node.js: $(shell node --version)"
	@echo "npm: $(shell npm --version)"
	@echo "Docker: $(shell docker --version 2>/dev/null || echo 'No disponible')"
	@echo "Docker Compose: $(shell docker-compose --version 2>/dev/null || echo 'No disponible')"

version: ## Mostrar versión
	@echo "EventConnect v2.0.0"
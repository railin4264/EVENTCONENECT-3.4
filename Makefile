# EventConnect Makefile
# Facilita el desarrollo y despliegue de la aplicación

.PHONY: help install dev build test lint format clean docker setup

# Colores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Muestra esta ayuda
	@echo "$(BLUE)EventConnect - Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Instala todas las dependencias
	@echo "$(GREEN)📦 Instalando dependencias...$(NC)"
	npm run install:all

dev: ## Inicia el entorno de desarrollo
	@echo "$(GREEN)🚀 Iniciando entorno de desarrollo...$(NC)"
	npm run dev

dev-backend: ## Inicia solo el backend
	@echo "$(GREEN)🔧 Iniciando backend...$(NC)"
	npm run dev:backend

dev-web: ## Inicia solo el frontend web
	@echo "$(GREEN)🌐 Iniciando frontend web...$(NC)"
	npm run dev:web

dev-mobile: ## Inicia solo la app móvil
	@echo "$(GREEN)📱 Iniciando app móvil...$(NC)"
	npm run dev:mobile

build: ## Construye todos los proyectos
	@echo "$(GREEN)🏗️ Construyendo proyectos...$(NC)"
	npm run build

build-backend: ## Construye solo el backend
	@echo "$(GREEN)🔧 Construyendo backend...$(NC)"
	npm run build:backend

build-web: ## Construye solo el frontend web
	@echo "$(GREEN)🌐 Construyendo frontend web...$(NC)"
	npm run build:web

test: ## Ejecuta todos los tests
	@echo "$(GREEN)🧪 Ejecutando tests...$(NC)"
	npm test

test-watch: ## Ejecuta tests en modo watch
	@echo "$(GREEN)👀 Ejecutando tests en modo watch...$(NC)"
	npm run test:watch

test-coverage: ## Ejecuta tests con cobertura
	@echo "$(GREEN)📊 Ejecutando tests con cobertura...$(NC)"
	npm run test:coverage

lint: ## Ejecuta linting en todos los proyectos
	@echo "$(GREEN)🔍 Ejecutando linting...$(NC)"
	npm run lint

lint-fix: ## Corrige automáticamente los errores de linting
	@echo "$(GREEN)🔧 Corrigiendo errores de linting...$(NC)"
	npm run lint:fix

format: ## Formatea el código
	@echo "$(GREEN)✨ Formateando código...$(NC)"
	npm run format

type-check: ## Verifica tipos de TypeScript
	@echo "$(GREEN)📝 Verificando tipos...$(NC)"
	npm run type-check

security: ## Ejecuta auditoría de seguridad
	@echo "$(GREEN)🔒 Ejecutando auditoría de seguridad...$(NC)"
	npm run security:audit

security-fix: ## Corrige vulnerabilidades de seguridad
	@echo "$(GREEN)🛡️ Corrigiendo vulnerabilidades...$(NC)"
	npm run security:fix

clean: ## Limpia archivos temporales y dependencias
	@echo "$(YELLOW)🧹 Limpiando archivos temporales...$(NC)"
	npm run clean

docker-build: ## Construye imágenes Docker
	@echo "$(GREEN)🐳 Construyendo imágenes Docker...$(NC)"
	npm run docker:build

docker-up: ## Inicia servicios con Docker Compose
	@echo "$(GREEN)🚀 Iniciando servicios con Docker...$(NC)"
	npm run docker:up

docker-down: ## Detiene servicios Docker
	@echo "$(YELLOW)⏹️ Deteniendo servicios Docker...$(NC)"
	npm run docker:down

docker-logs: ## Muestra logs de Docker
	@echo "$(BLUE)📋 Mostrando logs de Docker...$(NC)"
	npm run docker:logs

setup: install ## Configuración inicial completa
	@echo "$(GREEN)⚙️ Configuración inicial...$(NC)"
	@if [ ! -f backend/.env ]; then \
		echo "$(YELLOW)📝 Creando archivo .env para backend...$(NC)"; \
		cp backend/.env.example backend/.env; \
	fi
	@if [ ! -f web/.env.local ]; then \
		echo "$(YELLOW)📝 Creando archivo .env.local para web...$(NC)"; \
		cp web/.env.example web/.env.local; \
	fi
	@if [ ! -f mobile/.env ]; then \
		echo "$(YELLOW)📝 Creando archivo .env para mobile...$(NC)"; \
		cp mobile/.env.example mobile/.env; \
	fi
	@echo "$(GREEN)✅ Configuración inicial completada!$(NC)"
	@echo "$(BLUE)💡 Edita los archivos .env con tus configuraciones específicas$(NC)"

commit: ## Hace commit usando Commitizen
	@echo "$(GREEN)📝 Haciendo commit...$(NC)"
	npm run commit

release: ## Crea un nuevo release
	@echo "$(GREEN)🎉 Creando release...$(NC)"
	npm run release

status: ## Muestra el estado del proyecto
	@echo "$(BLUE)📊 Estado del proyecto EventConnect:$(NC)"
	@echo "$(YELLOW)Backend:$(NC)"
	@cd backend && npm list --depth=0 2>/dev/null | head -5
	@echo "$(YELLOW)Web:$(NC)"
	@cd web && npm list --depth=0 2>/dev/null | head -5
	@echo "$(YELLOW)Mobile:$(NC)"
	@cd mobile && npm list --depth=0 2>/dev/null | head -5

update: ## Actualiza todas las dependencias
	@echo "$(GREEN)📦 Actualizando dependencias...$(NC)"
	npm update
	cd backend && npm update
	cd web && npm update
	cd mobile && npm update

production: ## Despliegue a producción
	@echo "$(RED)🚀 Desplegando a producción...$(NC)"
	@echo "$(YELLOW)⚠️ Asegúrate de que todos los tests pasen$(NC)"
	make test
	make build
	@echo "$(GREEN)✅ Listo para producción!$(NC)"

# Comandos para base de datos
db-start: ## Inicia base de datos con Docker
	@echo "$(GREEN)🗄️ Iniciando base de datos...$(NC)"
	docker-compose up -d mongo redis

db-stop: ## Detiene base de datos
	@echo "$(YELLOW)⏹️ Deteniendo base de datos...$(NC)"
	docker-compose stop mongo redis

db-reset: ## Resetea la base de datos
	@echo "$(RED)🔄 Reseteando base de datos...$(NC)"
	cd backend && npm run db:reset

# Comandos de monitoreo
logs: ## Muestra logs de todos los servicios
	@echo "$(BLUE)📋 Mostrando logs...$(NC)"
	docker-compose logs -f

health: ## Verifica el estado de los servicios
	@echo "$(BLUE)🏥 Verificando estado de servicios...$(NC)"
	@curl -s http://localhost:5000/health || echo "$(RED)❌ Backend no responde$(NC)"
	@curl -s http://localhost:3000 || echo "$(RED)❌ Frontend no responde$(NC)"

# Por defecto muestra la ayuda
.DEFAULT_GOAL := help
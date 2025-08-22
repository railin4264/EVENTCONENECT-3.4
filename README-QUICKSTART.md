# EventConnect - Guía de Inicio Rápido 🚀

## 📋 Requisitos Previos

- **Node.js** 18+ y npm 9+
- **Docker** y Docker Compose
- **Git**
- 8GB RAM mínimo recomendado

## 🛠️ Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone <tu-repositorio>
cd eventconnect
```

### 2. Configurar Variables de Entorno
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp web/.env.example web/.env.local
```

### 3. Instalación con Docker (Recomendado)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Instalación Manual (Desarrollo Local)
```bash
# Instalar dependencias
npm install
npm run install:all

# Iniciar servicios externos (MongoDB y Redis)
docker-compose up -d mongo redis

# Iniciar la aplicación
npm run dev
```

## 🌐 Acceso a la Aplicación

- **Frontend Web**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health
- **MongoDB Admin**: http://localhost:8083 (admin/password123)
- **Redis Commander**: http://localhost:8082

## 👤 Usuario de Prueba

- **Email**: admin@eventconnect.com
- **Password**: Admin123!

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar todos los servicios en modo desarrollo
npm run dev:backend      # Solo backend
npm run dev:web          # Solo frontend

# Testing
npm test                 # Ejecutar todos los tests
npm run test:watch       # Tests en modo watch

# Build
npm run build            # Build de producción

# Docker
docker-compose up -d     # Iniciar servicios
docker-compose down      # Detener servicios
docker-compose logs -f   # Ver logs en tiempo real

# Base de Datos
npm run db:seed          # Poblar base de datos con datos de prueba
npm run db:reset         # Resetear base de datos
```

## 🚨 Solución de Problemas Comunes

### Error: Puerto en uso
```bash
# Cambiar puertos en docker-compose.yml o .env
# Verificar puertos en uso:
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### Error: MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
docker ps | grep mongo

# Reiniciar MongoDB
docker-compose restart mongo
```

### Error: Dependencias no instaladas
```bash
# Limpiar e instalar todo de nuevo
npm run clean
npm run install:all
```

## 📱 Características Principales

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **OAuth 2.0** (Google, Facebook, GitHub)
- ✅ **Upload de imágenes** con Cloudinary
- ✅ **Notificaciones en tiempo real** con Socket.io
- ✅ **PWA** con soporte offline
- ✅ **Búsqueda geoespacial** de eventos
- ✅ **Sistema de chat** en tiempo real
- ✅ **Panel de administración**
- ✅ **API RESTful** documentada
- ✅ **Rate limiting** y seguridad
- ✅ **Tests automatizados**
- ✅ **CI/CD** con GitHub Actions

## 🔐 Seguridad

- Todas las contraseñas están hasheadas con bcrypt
- JWT tokens con expiración configurable
- Rate limiting en todas las rutas
- Sanitización de inputs
- CORS configurado
- Helmet.js para headers de seguridad
- Variables de entorno para datos sensibles

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

- 📧 Email: support@eventconnect.com
- 📖 Documentación: [/docs](./docs)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/eventconnect/issues)

## 📜 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

**¡Disfruta usando EventConnect! 🎉**
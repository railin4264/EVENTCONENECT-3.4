# EventConnect - Plataforma Social de Eventos 🎉

[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-blue.svg)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73+-blue.svg)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

EventConnect es una plataforma integral que conecta personas a través de eventos y comunidades (tribus). Descubre eventos únicos, únete a tribus apasionadas y crea conexiones que duran toda la vida.

## 🚀 Inicio Rápido

### Configuración Automática
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/eventconnect.git
cd eventconnect

# Configuración automática
npm run setup

# Iniciar todos los servicios
npm run dev
```

### URLs de Desarrollo
- **Backend API**: http://localhost:5000
- **Frontend Web**: http://localhost:3000 
- **App Móvil**: http://localhost:19006
- **Documentación API**: http://localhost:5000/api

## 📁 Estructura del Proyecto

```
eventconnect/
├── backend/          # API REST con Node.js + Express
├── web/             # Frontend web con Next.js 14
├── mobile/          # App móvil con React Native + Expo
├── scripts/         # Scripts de utilidades
├── docs/           # Documentación
└── config/         # Configuraciones globales
```

## 🛠️ Tecnologías

### Backend
- **Node.js 18+** con Express
- **MongoDB** para base de datos principal
- **Redis** para cache y sesiones
- **Socket.IO** para tiempo real
- **JWT** para autenticación
- **Cloudinary** para almacenamiento de media

### Frontend Web
- **Next.js 14** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **PWA** soporte completo
- **React Query** para estado del servidor

### App Móvil
- **React Native** con Expo
- **TypeScript** para tipado estático
- **Expo** para desarrollo y deployment
- **React Navigation** para navegación
- **AsyncStorage** para persistencia local

## 🔧 Comandos Disponibles

### Desarrollo
```bash
npm run dev              # Inicia todos los servicios
npm run setup           # Configuración inicial automática
npm run verify          # Verifica conectividad
npm run dev:backend     # Solo backend
npm run dev:web         # Solo frontend web
npm run dev:mobile      # Solo app móvil
```

### Testing
```bash
npm test                # Tests en todos los proyectos
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Cobertura de tests
```

### Linting y Formato
```bash
npm run lint            # Linting en todos los proyectos
npm run lint:fix        # Corregir errores de linting
npm run format          # Formatear código
npm run type-check      # Verificar tipos TypeScript
```

### Seguridad
```bash
npm run security:audit  # Auditoría de seguridad
npm run security:fix    # Corregir vulnerabilidades
```

### Docker
```bash
npm run docker:build    # Construir imágenes
npm run docker:up       # Iniciar con Docker Compose
npm run docker:down     # Detener contenedores
npm run docker:logs     # Ver logs
```

### Utilidades
```bash
npm run clean           # Limpiar node_modules
npm run install:all     # Instalar dependencias en todos
```

## ⚙️ Configuración

### Variables de Entorno

Cada componente tiene su archivo de configuración:

- `backend/env-config.txt` → `backend/.env`
- `web/env-local-config.txt` → `web/.env.local`
- `mobile/env-config.txt` → `mobile/.env`

### Base de Datos

**MongoDB** (requerido para backend):
```bash
# Instalación con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O instalación local
# https://docs.mongodb.com/manual/installation/
```

**Redis** (opcional, para cache):
```bash
# Instalación con Docker
docker run -d -p 6379:6379 --name redis redis:alpine
```

## 🌟 Características Principales

### ✨ Para Usuarios
- **Descubrimiento Inteligente**: Eventos personalizados basados en ubicación e intereses
- **Tribus Sociales**: Únete a comunidades con intereses similares
- **Eventos en Tiempo Real**: Actualizaciones instantáneas y notificaciones push
- **Experiencia Móvil Nativa**: App móvil completa con funcionalidades offline
- **Gamificación**: Sistema de reputación y logros

### 🛠️ Para Desarrolladores
- **API REST Completa**: Documentación completa con Swagger
- **WebSockets**: Comunicación en tiempo real
- **PWA Ready**: Funciona offline y se puede instalar
- **Testing Completo**: Unit, integration y e2e tests
- **CI/CD Ready**: GitHub Actions y Docker configurado
- **Seguridad Avanzada**: Rate limiting, validación, sanitización

### 📱 Multiplataforma
- **Web Responsive**: Compatible con todos los navegadores
- **iOS y Android**: App nativa con Expo
- **PWA**: Instalable en dispositivos móviles
- **API Universal**: Un backend para todas las plataformas

## 🔐 Seguridad

- **Autenticación JWT** con refresh tokens
- **Rate Limiting** configurable por endpoint
- **Validación de entrada** con Joi y Zod
- **Sanitización XSS** y NoSQL injection protection
- **HTTPS** en producción
- **Helmet.js** para headers de seguridad

## 📊 Monitoreo y Analytics

- **Health Checks** automáticos
- **Logging estructurado** con Winston
- **Métricas de performance**
- **Error tracking** y notificaciones
- **Analytics de usuario** (opcional)

## 🚀 Deployment

### Desarrollo Local
```bash
npm run setup    # Configuración inicial
npm run dev      # Inicio completo
```

### Producción con Docker
```bash
npm run docker:build
npm run docker:up
```

### Servicios Cloud
- **Backend**: Railway, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify
- **Mobile**: Expo EAS Build
- **Base de Datos**: MongoDB Atlas, AWS DocumentDB

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Standards de Código
- **ESLint** y **Prettier** configurados
- **Conventional Commits** para mensajes
- **Husky** para git hooks
- **TypeScript** requerido para nuevos archivos

## 📝 Documentación

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## 🐛 Problemas Conocidos

Consulta [Issues](https://github.com/tu-usuario/eventconnect/issues) para problemas conocidos y roadmap.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Frontend Team** - React/Next.js specialists
- **Backend Team** - Node.js/MongoDB experts  
- **Mobile Team** - React Native/Expo developers
- **DevOps Team** - Docker/CI-CD specialists

## 🙏 Agradecimientos

- [Node.js](https://nodejs.org/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [MongoDB](https://mongodb.com/)
- [Todos los contribuidores](../../contributors)

---

**EventConnect** - Conectando personas a través de experiencias únicas 🎉✨
# EventConnect - Plataforma Integral para Eventos y Tribus

EventConnect es una plataforma completa para descubrir eventos, conectar con tribus y crear experiencias sociales únicas. Combina funcionalidades de redes sociales, gestión de eventos y análisis de datos para ofrecer una experiencia integral.

## 🚀 Características Principales

- **Gestión de Eventos**: Crear, gestionar y descubrir eventos con funcionalidades avanzadas
- **Sistema de Tribus**: Comunidades temáticas para conectar usuarios con intereses similares
- **Chat en Tiempo Real**: Comunicación instantánea entre usuarios y tribus
- **Sistema de Notificaciones**: Push, email y SMS para mantener a los usuarios informados
- **Análisis de Datos**: Insights y analytics para eventos y usuarios
- **PWA**: Aplicación web progresiva con funcionalidades offline
- **API RESTful**: Backend robusto con documentación completa
- **WebSockets**: Comunicación en tiempo real para chat y notificaciones

## 🏗️ Arquitectura

```
eventconnect/
├── backend/          # API Node.js + Express
├── web/             # Frontend Next.js + React
├── mobile/          # App React Native + Expo
├── config/          # Configuraciones compartidas
├── docs/            # Documentación
└── scripts/         # Scripts de utilidad
```

## 📋 Prerrequisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **MongoDB**: >= 6.0
- **Redis**: >= 7.0
- **Git**: Para clonar el repositorio

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/eventconnect.git
cd eventconnect
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias
npm run install:all

# O instalar por separado
npm install                    # Dependencias raíz
cd backend && npm install     # Backend
cd ../web && npm install      # Frontend web
cd ../mobile && npm install   # Frontend mobile
```

### 3. Configurar Variables de Entorno

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eventconnect

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Web (.env.local)

```bash
cd web
cp .env.example .env.local
```

Editar `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Configurar Base de Datos

#### MongoDB

```bash
# Iniciar MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# O con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Redis

```bash
# Iniciar Redis (Ubuntu/Debian)
sudo systemctl start redis

# O con Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5. Inicializar Base de Datos

```bash
cd backend

# Ejecutar migraciones
npm run db:migrate

# Sembrar datos de ejemplo
npm run db:seed

# Verificar estado
npm run db:status
```

## 🚀 Ejecución

### Desarrollo

```bash
# Ejecutar todo el stack
npm run dev

# O ejecutar por separado
npm run dev:backend    # Backend en puerto 5000
npm run dev:web        # Frontend web en puerto 3000
npm run dev:mobile     # App mobile con Expo
```

### Producción

```bash
# Construir todo
npm run build

# Ejecutar en producción
npm run start:backend  # Backend
npm run start:web      # Frontend web
```

## 📱 Acceso a la Aplicación

- **Frontend Web**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **Documentación API**: http://localhost:5000/api/docs

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests específicos
npm run test:backend   # Tests del backend
npm run test:web       # Tests del frontend
npm run test:mobile    # Tests de la app mobile

# Tests con coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## 🔧 Scripts Disponibles

### Backend

```bash
cd backend

# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Servidor de producción

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Sembrar datos
npm run db:reset         # Resetear base de datos
npm run db:backup        # Crear backup
npm run db:restore       # Restaurar backup

# Testing y calidad
npm run test             # Ejecutar tests
npm run lint             # Verificar código
npm run lint:fix         # Corregir errores de linting
npm run format           # Formatear código
```

### Frontend Web

```bash
cd web

# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Servidor de producción

# Testing y calidad
npm run test             # Ejecutar tests
npm run lint             # Verificar código
npm run type-check       # Verificar tipos TypeScript
npm run storybook        # Abrir Storybook
```

## 🐳 Docker

### Construir Imágenes

```bash
# Construir todas las imágenes
npm run docker:build

# O construir por separado
npm run docker:build:backend
npm run docker:build:web
```

### Ejecutar con Docker Compose

```bash
# Iniciar servicios
npm run docker:up

# Ver logs
npm run docker:logs

# Detener servicios
npm run docker:down
```

## 📊 Monitoreo y Logs

### Health Checks

- **Backend**: http://localhost:5000/health
- **Frontend**: http://localhost:3000/api/health

### Logs

```bash
# Ver logs del backend
cd backend && npm run logs

# Ver logs de Docker
docker-compose logs -f backend
```

## 🔒 Seguridad

- **JWT**: Autenticación basada en tokens
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configuración de orígenes permitidos
- **Helmet**: Headers de seguridad HTTP
- **Validación**: Validación de entrada en todas las APIs
- **Sanitización**: Limpieza de datos de entrada

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `GET /api/events/:id` - Obtener evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Tribus
- `GET /api/tribes` - Listar tribus
- `POST /api/tribes` - Crear tribu
- `GET /api/tribes/:id` - Obtener tribu
- `PUT /api/tribes/:id` - Actualizar tribu
- `DELETE /api/tribes/:id` - Eliminar tribu

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a MongoDB**
   - Verificar que MongoDB esté ejecutándose
   - Verificar la URI en `.env`

2. **Error de conexión a Redis**
   - Verificar que Redis esté ejecutándose
   - Verificar la configuración en `.env`

3. **Error de puerto en uso**
   - Cambiar el puerto en `.env`
   - Verificar que no haya otros servicios usando el puerto

4. **Error de dependencias**
   - Eliminar `node_modules` y `package-lock.json`
   - Ejecutar `npm install` nuevamente

### Logs de Error

```bash
# Ver logs del backend
cd backend && tail -f logs/app.log

# Ver logs de Docker
docker-compose logs -f backend
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/eventconnect/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/eventconnect/wiki)
- **Email**: soporte@eventconnect.com

## 🙏 Agradecimientos

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Next.js** - Framework de React
- **MongoDB** - Base de datos NoSQL
- **Redis** - Base de datos en memoria
- **Socket.IO** - Comunicación en tiempo real

---

**EventConnect** - Conectando personas a través de eventos y tribus 🎉 
# EventConnect 🎉

**EventConnect** es una plataforma integral para descubrir eventos y conectar con tribus en tiempo real. Facilita la organización de eventos, la creación de comunidades y la interacción social basada en intereses y ubicación.

## 🚀 Características Principales

### Core Features
- **🗺️ Mapa Interactivo**: Descubre eventos y tribus cerca de ti con integración de Google Maps
- **📱 Feed Social**: Publica, comenta y da like a contenido de eventos y tribus
- **👥 Gestión de Tribus**: Crea y únete a comunidades basadas en intereses
- **📅 Sistema de Eventos**: Organiza y participa en eventos con funcionalidades completas
- **💬 Chat en Tiem Real**: Comunicación privada y grupal con WebSockets
- **🔔 Notificaciones Push**: Sistema de alertas personalizable por tipo de evento
- **🏆 Gamificación**: Sistema de badges y logros por participación
- **🤖 IA Básica**: Recomendaciones inteligentes basadas en intereses y ubicación

### Tecnologías Implementadas
- **Backend**: Node.js 18+, Express, MongoDB, Redis, Socket.IO
- **Frontend Web**: Next.js 14, React, Tailwind CSS, Shadcn/ui
- **Frontend Mobile**: React Native, Expo, Google Maps
- **Base de Datos**: MongoDB con Mongoose
- **Cache**: Redis para sesiones y datos frecuentes
- **Autenticación**: JWT + Refresh Tokens
- **Real-time**: WebSockets con Socket.IO
- **Notificaciones**: Push, Email, SMS, In-app

## 🏗️ Arquitectura del Proyecto

```
EventConnect/
├── backend/                 # API REST + WebSockets
│   ├── src/
│   │   ├── config/         # Configuraciones (DB, Redis, JWT, etc.)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Autenticación, validación, etc.
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Endpoints de la API
│   │   ├── services/       # Servicios externos
│   │   ├── utils/          # Utilidades y helpers
│   │   └── validators/     # Validación de datos
│   ├── tests/              # Tests unitarios e integración
│   └── docs/               # Documentación de la API
├── web/                    # Frontend Web (Next.js)
│   ├── src/
│   │   ├── app/            # App Router (Next.js 14)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios de API
│   │   ├── store/          # Estado global (Zustand)
│   │   └── styles/         # Estilos globales
│   └── public/             # Assets estáticos
├── mobile/                 # App Móvil (React Native + Expo)
│   ├── src/
│   │   ├── components/     # Componentes móviles
│   │   ├── contexts/       # Contextos de React
│   │   ├── hooks/          # Custom hooks móviles
│   │   ├── navigation/     # Navegación de la app
│   │   ├── screens/        # Pantallas de la app
│   │   ├── services/       # Servicios de API
│   │   └── utils/          # Utilidades móviles
│   └── assets/             # Imágenes y recursos
└── docs/                   # Documentación general
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MongoDB 6+
- Redis 6+
- Expo CLI (para desarrollo móvil)
- Google Maps API Key

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/eventconnect.git
cd EventConnect
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

### 3. Configurar Frontend Web
```bash
cd web
npm install
cp .env.example .env.local
# Editar .env.local con tus configuraciones
npm run dev
```

### 4. Configurar App Móvil
```bash
cd mobile
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npx expo start
```

## 🔧 Configuración de Variables de Entorno

### Backend (.env)
```bash
# Configuración básica
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/eventconnect
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### App Móvil (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🚀 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Obtener perfil del usuario

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `GET /api/events/:id` - Obtener evento específico
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento
- `POST /api/events/:id/join` - Unirse a evento
- `POST /api/events/:id/leave` - Salir de evento

### Tribus
- `GET /api/tribes` - Listar tribus
- `POST /api/tribes` - Crear tribu
- `GET /api/tribes/:id` - Obtener tribu específica
- `PUT /api/tribes/:id` - Actualizar tribu
- `DELETE /api/tribes/:id` - Eliminar tribu
- `POST /api/tribes/:id/join` - Unirse a tribu
- `POST /api/tribes/:id/leave` - Salir de tribu

### Chat
- `GET /api/chat` - Listar chats
- `POST /api/chat` - Crear chat
- `GET /api/chat/:id/messages` - Obtener mensajes
- `POST /api/chat/:id/messages` - Enviar mensaje

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PATCH /api/notifications/:id/read` - Marcar como leída
- `POST /api/notifications/push-token` - Registrar token push

## 📱 Funcionalidades de la App Móvil

### Pantallas Principales
- **Inicio**: Dashboard con estadísticas y acciones rápidas
- **Eventos**: Descubrir y gestionar eventos
- **Tribus**: Explorar y unirse a comunidades
- **Mapa**: Vista interactiva de eventos y tribus cercanas
- **Chat**: Comunicación en tiempo real
- **Notificaciones**: Sistema de alertas personalizable
- **Perfil**: Gestión de cuenta y preferencias

### Características Móviles
- **Geolocalización**: Detección automática de ubicación
- **Mapas Offline**: Funcionalidad básica sin conexión
- **Push Notifications**: Alertas en tiempo real
- **Modo Oscuro**: Tema adaptable automáticamente
- **Responsive**: Adaptado a diferentes tamaños de pantalla

## 🌐 Funcionalidades del Frontend Web

### Características Web
- **PWA**: Instalable como aplicación nativa
- **Modo Offline**: Funcionalidad básica sin conexión
- **SEO Optimizado**: Meta tags y estructura semántica
- **Analytics**: Integración con Google Analytics
- **Performance**: Lazy loading y optimizaciones
- **Accesibilidad**: Cumple estándares WCAG

### Componentes Principales
- **Mapa Interactivo**: Integración con Google Maps
- **Feed Social**: Timeline de eventos y publicaciones
- **Sistema de Chat**: Comunicación en tiempo real
- **Gestión de Eventos**: CRUD completo de eventos
- **Sistema de Tribus**: Comunidades y membresías

## 🔒 Seguridad

### Medidas Implementadas
- **Autenticación**: JWT con refresh tokens
- **Autorización**: Middleware de roles y permisos
- **Validación**: Sanitización de inputs y validación de esquemas
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configuración segura de origen cruzado
- **Helmet**: Headers de seguridad HTTP
- **XSS Protection**: Prevención de ataques XSS
- **NoSQL Injection**: Protección contra inyecciones

## 🧪 Testing

### Backend
```bash
cd backend
npm test              # Tests unitarios
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con cobertura
npm run test:integration # Tests de integración
```

### Frontend Web
```bash
cd web
npm test              # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:coverage # Tests con cobertura
```

### App Móvil
```bash
cd mobile
npm test              # Tests unitarios
npx expo test         # Tests de Expo
```

## 📊 Monitoreo y Logging

### Métricas Implementadas
- **Performance**: Tiempo de respuesta de API
- **Errores**: Captura y logging de errores
- **Uso**: Métricas de usuarios y funcionalidades
- **Base de Datos**: Estado de conexiones y queries
- **Cache**: Hit/miss rates de Redis

### Herramientas de Logging
- **Morgan**: Logging de requests HTTP
- **Winston**: Logging estructurado
- **Rotación**: Logs automáticos por fecha/tamaño

## 🚀 Despliegue

### Backend (Producción)
```bash
# Docker
docker build -t eventconnect-backend .
docker run -p 5000:5000 eventconnect-backend

# PM2
npm run build
pm2 start ecosystem.config.js
```

### Frontend Web (Producción)
```bash
npm run build
npm start
# o deploy a Vercel/Netlify
```

### App Móvil (Producción)
```bash
# Build para producción
npx expo build:android
npx expo build:ios

# Deploy a stores
npx expo submit:android
npx expo submit:ios
```

## 🤝 Contribución

### Guías de Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **ESLint**: Configuración estricta para JavaScript/TypeScript
- **Prettier**: Formateo automático de código
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Estándar de mensajes de commit

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

### Canales de Soporte
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/eventconnect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/eventconnect/discussions)
- **Documentación**: [Wiki del Proyecto](https://github.com/tu-usuario/eventconnect/wiki)

### Comunidad
- **Discord**: [Servidor de EventConnect](https://discord.gg/eventconnect)
- **Telegram**: [Canal de EventConnect](https://t.me/eventconnect)
- **Email**: support@eventconnect.com

## 🙏 Agradecimientos

- **Expo**: Por el framework móvil increíble
- **Next.js**: Por el framework web moderno
- **MongoDB**: Por la base de datos flexible
- **Socket.IO**: Por la comunicación en tiempo real
- **Google Maps**: Por las APIs de geolocalización

---

**EventConnect** - Conectando personas, creando experiencias. 🎉 
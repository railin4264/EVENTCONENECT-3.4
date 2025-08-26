# 🚀 EventConnect - Guía de Configuración Completa

## 📋 Requisitos Previos

- **Node.js** 18+ 
- **npm** 8+
- **MongoDB** 5.0+
- **Redis** 6+ (opcional para cache)
- **Expo CLI** (para app móvil)

## ⚡ Configuración Rápida

### 1. Clonar e Instalar

```bash
# Instalar dependencias de todos los proyectos
npm install  # En la raíz

# Instalar dependencias específicas
cd web && npm install
cd ../backend && npm install
cd ../mobile && npm install
```

### 2. Variables de Entorno

#### **Backend** (`backend/.env`)
```env
# Base
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/eventconnect
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
JWT_EXPIRE=7d

# External APIs
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
CLOUDINARY_CLOUD_NAME=tu-cloudinary-cloud-name
CLOUDINARY_API_KEY=tu-cloudinary-api-key
CLOUDINARY_API_SECRET=tu-cloudinary-api-secret

# Social Auth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
FACEBOOK_APP_ID=tu-facebook-app-id
FACEBOOK_APP_SECRET=tu-facebook-app-secret

# Notifications
VAPID_PUBLIC_KEY=tu-vapid-public-key
VAPID_PRIVATE_KEY=tu-vapid-private-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

#### **Frontend Web** (`web/.env.local`)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu-mapbox-token

# Social Login
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=tu-facebook-client-id

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu-vapid-public-key
```

#### **App Móvil** (`mobile/.env`)
```env
# API
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_WS_URL=ws://localhost:5000

# Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu-google-maps-api-key

# Social Auth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
EXPO_PUBLIC_FACEBOOK_CLIENT_ID=tu-facebook-client-id
```

## 🎯 Configuración por Servicios

### 📍 Google Maps API
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Maps
4. Crea credenciales (API Key)
5. Restringe la API key a tus dominios

### 🔧 Cloudinary (Imágenes)
1. Regístrate en [Cloudinary](https://cloudinary.com/)
2. Ve a Dashboard para obtener tus credenciales
3. Copia Cloud Name, API Key y API Secret

### 🔑 Auth Social

#### Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Crear credenciales > OAuth 2.0 Client ID
4. Configura URLs de redirección:
   - Web: `http://localhost:3000/api/auth/callback/google`
   - Mobile: `tu-scheme://`

#### Facebook Login
1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva app
3. Añade Facebook Login
4. Configura Valid OAuth Redirect URIs

### 🔔 Push Notifications (Web)
```bash
# Generar VAPID keys
npx web-push generate-vapid-keys
```

## 🏃‍♂️ Ejecutar la Aplicación

### Opción 1: Todo a la vez
```bash
# Desde la raíz del proyecto
npm run dev  # Inicia web, backend y mobile
```

### Opción 2: Por separado
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend Web
cd web
npm run dev

# Terminal 3 - App Móvil
cd mobile
npm start
```

## 📱 Configuración Móvil

### Development Build
```bash
cd mobile

# iOS
npm run ios

# Android
npm run android

# Web (para testing)
npm run web
```

### Production Build
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

## 🐳 Docker (Opcional)

```bash
# Construir todas las imágenes
docker-compose build

# Ejecutar todo el stack
docker-compose up

# Solo backend y base de datos
docker-compose up backend mongo redis
```

## 🧪 Testing

```bash
# Frontend
cd web && npm test

# Backend
cd backend && npm test

# Mobile
cd mobile && npm test

# E2E Testing
cd web && npm run test:e2e
```

## 🚀 Despliegue

### Web (Vercel)
```bash
cd web
npm run build
npm run deploy
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
npm run start
```

### Mobile (EAS Build)
```bash
cd mobile
npm run build:android
npm run build:ios
```

## 🔧 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que MongoDB esté corriendo
- Revisa la CONNECTION_STRING en .env

### Error: "API endpoints returning 404"
- Confirma que el backend esté en puerto 5000
- Verifica NEXT_PUBLIC_API_URL en frontend

### Error: "Mobile app not loading"
- Ejecuta `npm start -- --clear` en mobile/
- Verifica que el puerto del backend sea accesible desde tu dispositivo

### Error: Icons not loading
- HandHeart no existe, usa Heart en su lugar
- Verifica importaciones de lucide-react vs lucide-react-native

## 📚 Funcionalidades Implementadas

### ✅ Completado
- 🔐 Sistema de autenticación completo
- 🎯 Filtros de intereses visuales
- 🗺️ Vista de mapa interactivo
- 📱 App móvil con navegación completa
- 🎨 Sistema de iconos para eventos
- ⚡ Optimizaciones de performance
- 🔔 Sistema de notificaciones
- 🎮 Gamificación básica
- 🎭 Temas dinámicos
- 📊 Analytics y métricas

### 🎯 Características Principales
- **Login/Register** con validación en tiempo real
- **Filtros por Intereses** con iconos visuales
- **Vista Mapa** con eventos geolocalizados
- **App Móvil** completamente funcional
- **Performance** optimizado <3s de carga
- **PWA** con soporte offline
- **Responsive** para todos los dispositivos

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en consola
2. Verifica las variables de entorno
3. Asegúrate de que todos los servicios estén corriendo
4. Consulta la documentación específica de cada servicio

---

🎉 **¡EventConnect está listo para conectar al mundo!** 🌍

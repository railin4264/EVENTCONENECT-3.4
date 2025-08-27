# EventConnect - Plataforma Integral de Eventos y Tribus

EventConnect es una plataforma completa para descubrir eventos, conectar con tribus y crear experiencias sociales únicas. Incluye aplicaciones web y móvil con backend robusto.

## 🚀 Características Principales

### Backend (Node.js + Express)
- ✅ API RESTful completa con autenticación JWT
- ✅ Base de datos MongoDB con Redis para cache
- ✅ Sistema de notificaciones push (Firebase + Expo)
- ✅ Gamificación con puntos, logros y badges
- ✅ Recomendaciones AI personalizadas
- ✅ Sistema de búsqueda avanzada
- ✅ Upload de archivos con Cloudinary
- ✅ Rate limiting y seguridad avanzada
- ✅ WebSockets para tiempo real
- ✅ Logging y monitoreo completo

### Frontend Web (Next.js 14)
- ✅ PWA con funcionalidades offline
- ✅ Diseño responsive y moderno
- ✅ Integración con Google Maps
- ✅ Sistema de notificaciones
- ✅ Chat en tiempo real
- ✅ Gamificación visual
- ✅ Optimización SEO

### Frontend Móvil (React Native + Expo)
- ✅ App nativa para iOS y Android
- ✅ Notificaciones push
- ✅ Geolocalización
- ✅ Cámara y galería
- ✅ Chat en tiempo real
- ✅ Gamificación móvil

## 📋 Prerrequisitos

- Node.js 18+ 
- npm 9+
- MongoDB 6+
- Redis 6+
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/eventconnect.git
cd eventconnect
```

### 2. Instalar dependencias

```bash
# Instalar todas las dependencias
npm run install:all

# O instalar por separado:
npm run install:backend
npm run install:web
npm run install:mobile
```

### 3. Configurar variables de entorno

#### Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones
```

#### Frontend Web
```bash
cd web
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

#### Frontend Móvil
```bash
cd mobile
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar base de datos

```bash
# Iniciar MongoDB (si no está corriendo)
mongod

# Iniciar Redis (si no está corriendo)
redis-server

# Ejecutar migraciones y seeders
cd backend
npm run db:migrate
npm run db:seed
```

### 5. Iniciar servicios

```bash
# Desarrollo completo (backend + web + mobile)
npm run dev

# O por separado:
npm run dev:backend  # Puerto 5000
npm run dev:web      # Puerto 3000
npm run dev:mobile   # Puerto 19006
```

## 🔧 Configuración Detallada

### Variables de Entorno Requeridas

#### Backend (.env)
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/eventconnect
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# CORS
CLIENT_URL=http://localhost:3000
WEB_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006

# Cloudinary (para uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Firebase (notificaciones push)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Expo (notificaciones push móvil)
EXPO_ACCESS_TOKEN=your-expo-access-token
```

#### Frontend Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Frontend Móvil (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_WS_URL=ws://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🚀 Despliegue

### Backend (Producción)

```bash
cd backend
npm run build
npm start
```

### Frontend Web (Producción)

```bash
cd web
npm run build
npm start
```

### Frontend Móvil (Producción)

```bash
cd mobile
npm run build:android  # Para Android
npm run build:ios      # Para iOS
```

## 📱 Estructura del Proyecto

```
eventconnect/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── controllers/    # Controladores
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Servicios
│   │   ├── utils/          # Utilidades
│   │   └── server.js       # Servidor principal
│   └── package.json
├── web/                    # Frontend Next.js
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Librerías
│   │   ├── services/      # Servicios API
│   │   ├── store/         # Estado global
│   │   ├── styles/        # Estilos
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Utilidades
│   └── package.json
├── mobile/                 # App React Native
│   ├── src/
│   │   ├── components/    # Componentes
│   │   ├── navigation/    # Navegación
│   │   ├── screens/       # Pantallas
│   │   ├── services/      # Servicios
│   │   ├── store/         # Estado
│   │   ├── types/         # Tipos
│   │   └── utils/         # Utilidades
│   └── package.json
└── package.json           # Workspace principal
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests por componente
npm run test:backend
npm run test:web
npm run test:mobile

# Tests con coverage
npm run test:coverage

# Tests E2E (web)
cd web
npm run test:e2e
```

## 📊 Monitoreo y Logs

### Health Checks
- Backend: `http://localhost:5000/health`
- Base de datos: `http://localhost:5000/health/database`
- Sistema: `http://localhost:5000/health/system`

### Logs
- Backend: `backend/logs/`
- Web: `web/.next/`
- Mobile: `mobile/logs/`

## 🔒 Seguridad

- ✅ Autenticación JWT con refresh tokens
- ✅ Rate limiting por IP y usuario
- ✅ Validación de entrada con Joi
- ✅ Sanitización de datos
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ XSS protection
- ✅ CSRF protection
- ✅ SQL injection protection

## 📈 Performance

- ✅ Caching con Redis
- ✅ Compresión gzip
- ✅ Lazy loading de imágenes
- ✅ Code splitting
- ✅ Bundle optimization
- ✅ CDN para assets estáticos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

### Workspace Principal
```bash
npm run dev              # Desarrollo completo
npm run build            # Build completo
npm run test             # Tests completos
npm run lint             # Linting completo
npm run format           # Formateo completo
npm run clean            # Limpiar node_modules
```

### Backend
```bash
npm run dev              # Desarrollo con nodemon
npm run start            # Producción
npm run build            # Build con Babel
npm run test             # Tests con Jest
npm run db:migrate       # Migraciones
npm run db:seed          # Datos de prueba
```

### Frontend Web
```bash
npm run dev              # Desarrollo Next.js
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run test             # Tests
npm run test:e2e         # Tests E2E
npm run storybook        # Storybook
```

### Frontend Móvil
```bash
npm start                # Expo development server
npm run android          # Android
npm run ios              # iOS
npm run build:android    # Build Android
npm run build:ios        # Build iOS
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a MongoDB**
   - Verificar que MongoDB esté corriendo
   - Verificar la URI en .env

2. **Error de conexión a Redis**
   - Verificar que Redis esté corriendo
   - Verificar la URL en .env

3. **Error de CORS**
   - Verificar las URLs en .env del backend
   - Verificar que el frontend esté en el puerto correcto

4. **Error de JWT**
   - Verificar que JWT_SECRET esté configurado
   - Verificar que el token no haya expirado

5. **Error de upload de archivos**
   - Verificar configuración de Cloudinary
   - Verificar permisos de carpeta uploads

## 📞 Soporte

- 📧 Email: soporte@eventconnect.com
- 📱 Discord: [EventConnect Community](https://discord.gg/eventconnect)
- 📖 Documentación: [docs.eventconnect.com](https://docs.eventconnect.com)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Expo](https://expo.dev/) - Plataforma React Native
- [MongoDB](https://www.mongodb.com/) - Base de datos
- [Redis](https://redis.io/) - Cache
- [Cloudinary](https://cloudinary.com/) - Cloud storage
- [Firebase](https://firebase.google.com/) - Notificaciones push
- [Google Maps](https://developers.google.com/maps) - Mapas
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
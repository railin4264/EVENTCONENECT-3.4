# EventConnect 🎉

**Plataforma de descubrimiento instantáneo de eventos y tribus**

EventConnect es una plataforma completa que facilita la conexión entre personas a través de eventos y tribus, con funcionalidades avanzadas de geolocalización, notificaciones en tiempo real y una experiencia PWA optimizada.

## 🚀 Características Principales

### ✨ Funcionalidades Core
- **Mapa Interactivo**: Descubre eventos y tribus cerca de ti
- **Feed Social**: Posts, comentarios y likes en tiempo real
- **Gestión de Eventos**: Crear, unirse y gestionar eventos
- **Sistema de Tribus**: Únete a comunidades con intereses similares
- **Chat en Tiempo Real**: Comunicación privada y grupal
- **Notificaciones Push**: Multi-plataforma y personalizables
- **Modo Offline**: Funcionalidad PWA completa
- **Gamificación**: Sistema de badges y logros

### 🎯 Tecnologías Implementadas
- **Backend**: Node.js 18+, Express, MongoDB, Redis, Socket.IO
- **Frontend Web**: Next.js 14, PWA, Tailwind CSS, Shadcn/ui
- **Mobile**: React Native + Expo, Google Maps, Notificaciones Push
- **Real-time**: WebSockets, Chat en vivo, Notificaciones instantáneas
- **Seguridad**: JWT, Helmet, CORS, Rate Limiting, XSS Protection

## 📁 Estructura del Proyecto

```
EventConnect/
├── backend/                 # API REST + WebSockets
│   ├── src/
│   │   ├── config/         # Configuraciones (DB, Redis, JWT, Google Maps)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Autenticación, validación, seguridad
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Endpoints de la API
│   │   ├── services/       # Servicios (Chat, Notificaciones, Location)
│   │   ├── validators/     # Validación de datos con Joi
│   │   └── utils/          # Utilidades y helpers
│   └── tests/              # Tests unitarios e integración
├── web/                    # Frontend Web (PWA)
│   ├── src/
│   │   ├── app/           # Páginas y rutas (App Router)
│   │   ├── components/    # Componentes reutilizables
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── services/      # Servicios (API, Socket, Analytics)
│   │   └── styles/        # Estilos y configuración Tailwind
│   ├── public/            # Assets estáticos, Service Worker, Manifest
│   └── next.config.js     # Configuración PWA y optimizaciones
└── mobile/                 # App Móvil (React Native + Expo)
    ├── src/
    │   ├── components/    # Componentes nativos
    │   ├── contexts/      # Contextos (Auth, Theme)
    │   ├── hooks/         # Hooks personalizados
    │   ├── navigation/    # Navegación y rutas
    │   ├── screens/       # Pantallas principales
    │   └── services/      # Servicios móviles
    └── app.json          # Configuración Expo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- **Node.js** 18.0.0 o superior
- **MongoDB** 6.0 o superior
- **Redis** 6.0 o superior
- **npm** 9.0.0 o superior
- **Expo CLI** (para desarrollo móvil)

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd EventConnect
```

### 2. Configurar Variables de Entorno

#### Backend (`.env`)
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales reales
```

#### Frontend Web (`.env.local`)
```bash
cd web
cp .env.example .env.local
# Editar .env.local con tus API keys
```

#### Mobile (`.env`)
```bash
cd mobile
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Instalar Dependencias
```bash
# Backend
cd backend
npm install

# Frontend Web
cd ../web
npm install

# Mobile
cd ../mobile
npm install
```

### 4. Configurar Base de Datos
```bash
# Iniciar MongoDB
mongod

# Iniciar Redis
redis-server

# Ejecutar migraciones
cd backend
npm run db:migrate
npm run db:seed
```

### 5. Generar VAPID Keys para Notificaciones
```bash
npm install -g web-push
web-push generate-vapid-keys
# Agregar las keys al .env del frontend web
```

## 🚀 Ejecutar el Proyecto

### Desarrollo
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend Web
cd web
npm run dev

# Terminal 3: Mobile
cd mobile
npm start
```

### Producción
```bash
# Backend
cd backend
npm run build
npm start

# Frontend Web
cd web
npm run build
npm start
```

## 🔑 Configuración de APIs

### Google Maps
1. Obtener API Key en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar APIs: Maps JavaScript, Places, Geocoding, Distance Matrix
3. Configurar restricciones de dominio

### Cloudinary
1. Crear cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtener Cloud Name, API Key y Secret
3. Configurar upload preset

### Push Notifications
1. **Web**: Generar VAPID keys
2. **Mobile**: Configurar Expo Push Tokens
3. **iOS**: Configurar APNS (opcional)
4. **Android**: Configurar FCM (opcional)

## 📱 Funcionalidades por Plataforma

### 🌐 Frontend Web (PWA)
- ✅ Instalación como app nativa
- ✅ Funcionamiento offline
- ✅ Notificaciones push del navegador
- ✅ Chat en tiempo real
- ✅ Mapa interactivo con Google Maps
- ✅ Modo oscuro/claro
- ✅ Responsive design
- ✅ SEO optimizado

### 📱 App Móvil
- ✅ Navegación nativa
- ✅ Geolocalización en tiempo real
- ✅ Notificaciones push nativas
- ✅ Chat en tiempo real
- ✅ Mapa nativo con Google Maps
- ✅ Tema adaptativo
- ✅ Funcionalidad offline
- ✅ Integración con cámara y galería

### 🔧 Backend API
- ✅ REST API completa
- ✅ WebSockets para tiempo real
- ✅ Sistema de notificaciones multi-canal
- ✅ Autenticación JWT segura
- ✅ Validación de datos robusta
- ✅ Rate limiting y seguridad
- ✅ Integración con servicios externos
- ✅ Logging y monitoreo

## 🧪 Testing

### Backend
```bash
cd backend
npm test                    # Tests unitarios
npm run test:integration   # Tests de integración
npm run test:coverage      # Cobertura de código
```

### Frontend Web
```bash
cd web
npm run test               # Tests con Jest
npm run test:e2e          # Tests end-to-end
npm run lint              # Linting
npm run type-check        # Verificación de tipos
```

## 📊 Monitoreo y Logs

### Logs
- **Backend**: Logs estructurados con Winston
- **Frontend**: Logs del navegador y consola
- **Mobile**: Logs nativos y crash reporting

### Métricas
- **Performance**: Tiempo de respuesta, throughput
- **Errores**: Rate de errores, tipos de errores
- **Usuarios**: Activos, engagement, retención

## 🔒 Seguridad

### Implementado
- ✅ Autenticación JWT con refresh tokens
- ✅ Rate limiting y throttling
- ✅ Validación de entrada y sanitización
- ✅ Protección XSS y CSRF
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Sanitización de MongoDB

### Recomendaciones de Producción
- 🔐 Usar HTTPS en producción
- 🔐 Configurar CSP headers
- 🔐 Implementar logging de auditoría
- 🔐 Configurar backup automático de DB
- 🔐 Monitoreo de seguridad continuo

## 🚀 Despliegue

### Backend
```bash
# Docker
docker build -t eventconnect-backend .
docker run -p 5000:5000 eventconnect-backend

# Heroku
heroku create eventconnect-backend
git push heroku main

# Vercel
vercel --prod
```

### Frontend Web
```bash
# Vercel (recomendado para Next.js)
vercel --prod

# Netlify
npm run build
netlify deploy --prod

# AWS S3 + CloudFront
npm run build
aws s3 sync out/ s3://tu-bucket
```

### Mobile
```bash
# Expo EAS Build
eas build --platform all

# App Store / Google Play
eas submit --platform all
```

## 📈 Roadmap

### 🎯 MVP (Completado ✅)
- [x] Sistema de autenticación
- [x] CRUD de eventos y tribus
- [x] Chat en tiempo real
- [x] Notificaciones push
- [x] Mapa interactivo
- [x] PWA funcional
- [x] App móvil nativa

### 🚀 Próximas Versiones
- [ ] IA avanzada para recomendaciones
- [ ] Sistema de votación de ubicaciones
- [ ] Integración con redes sociales
- [ ] Sistema de pagos y ticketing
- [ ] Analytics avanzado
- [ ] Multi-idioma
- [ ] Modo empresa/organizador

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Documentación**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/eventconnect/issues)
- **Email**: soporte@eventconnect.com
- **Discord**: [EventConnect Community](https://discord.gg/eventconnect)

## 🙏 Agradecimientos

- **Next.js** por el framework web
- **Expo** por la plataforma móvil
- **MongoDB** por la base de datos
- **Socket.IO** por el tiempo real
- **Tailwind CSS** por los estilos
- **Shadcn/ui** por los componentes

---

**EventConnect** - Conectando personas a través de eventos y tribus 🎉 
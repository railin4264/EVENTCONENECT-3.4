# EventConnect 🎉

**EventConnect** es una plataforma integral para descubrir eventos y conectar con tribus en tiempo real. Facilita la organización de eventos, la creación de comunidades y la interacción social basada en intereses y ubicación.

## 🆕 **Versión 2.0.0 - Rediseño Completo "Neon Urban"**

### ✨ **Nuevo Sistema de Diseño:**
- **🎨 Tema Visual**: "Neon Urban" - Cyberpunk meets Urban Culture
- **🌈 Paleta de Colores**: Azul eléctrico, púrpura neón, verde cyber, naranja vibrante
- **💎 Efectos Visuales**: Glassmorphism, neumorphism, gradientes radiales, partículas
- **🚀 Animaciones**: Framer Motion avanzado, micro-interacciones, efectos de hover
- **📱 Multiplataforma**: Web (React + Next.js) y Mobile (React Native + Expo)

### 🔥 **Componentes UI Avanzados:**

#### **Web Components (React + Tailwind + Framer Motion):**
- **Button**: 7 variantes (primary, secondary, accent, outline, ghost, glass, neon)
- **Card**: 6 variantes (default, glass, neon, gradient, elevated, interactive)
- **Input**: 5 variantes con labels flotantes y efectos de focus
- **Hero Section**: Con partículas animadas y gradientes neon
- **Sistema de Animaciones**: Float, pulse, glow, slideIn, scale

#### **Mobile Components (React Native + Reanimated):**
- **Button**: Con gradientes, efectos de glow y animaciones táctiles
- **Card**: Glassmorphism y efectos neon adaptados para móvil
- **Animaciones**: Spring animations, gesture handling, haptic feedback

---

## 🚀 **Características Principales**

### **Core Features**
- **🗺️ Mapa Interactivo**: Descubre eventos y tribus cerca de ti con integración de Google Maps
- **🎯 Sistema de Recomendaciones**: IA que sugiere eventos basados en tus intereses
- **💬 Chat en Tiempo Real**: Comunicación instantánea con otros miembros
- **🔔 Notificaciones Push**: Mantente al día con eventos y actividades
- **📱 PWA Nativa**: Instala como app y disfruta de funcionalidad offline
- **🌍 Geolocalización**: Encuentra eventos en tu área con precisión

### **Social Features**
- **👥 Sistema de Tribus**: Únete a comunidades con intereses similares
- **📸 Galería Multimedia**: Comparte fotos y videos de eventos
- **⭐ Sistema de Reviews**: Califica y comenta eventos
- **🎭 Perfiles Personalizados**: Muestra tus intereses y eventos favoritos
- **🔗 Networking**: Conecta con otros asistentes antes, durante y después

### **Event Management**
- **📅 Calendario Inteligente**: Organiza y gestiona eventos fácilmente
- **🎪 Categorías Dinámicas**: Música, deportes, tecnología, arte, negocios
- **💰 Ticketing Integrado**: Venta de entradas con múltiples métodos de pago
- **📊 Analytics en Tiempo Real**: Estadísticas de asistencia y engagement
- **🔄 Eventos Recurrentes**: Configura eventos que se repiten automáticamente

---

## 🛠️ **Stack Tecnológico**

### **Backend (Node.js + Express)**
- **Runtime**: Node.js 18+ con Express 4
- **Base de Datos**: MongoDB con Mongoose ODM
- **Cache**: Redis para sesiones y datos en tiempo real
- **Autenticación**: JWT + Passport.js (Local, Google, Facebook, GitHub)
- **WebSockets**: Socket.IO para comunicación en tiempo real
- **Testing**: Jest + Supertest con cobertura completa
- **Deployment**: PM2 + Docker + Nginx

### **Frontend Web (Next.js 14)**
- **Framework**: Next.js 14 con App Router
- **UI Library**: React 18 con TypeScript
- **Styling**: Tailwind CSS + CSS Variables personalizadas
- **Animations**: Framer Motion + CSS Animations
- **State Management**: Zustand + React Query
- **PWA**: Service Workers + Manifest
- **Testing**: Jest + Playwright E2E

### **Mobile App (React Native + Expo)**
- **Framework**: React Native 0.73.4
- **Platform**: Expo 50 con EAS Build
- **Animations**: React Native Reanimated 3
- **UI Components**: React Native Paper + Elements
- **Navigation**: React Navigation 6
- **Testing**: Jest + React Native Testing Library

### **DevOps & Infraestructura**
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions con workflows automatizados
- **Monitoring**: PM2 + Winston + Prometheus
- **Security**: Helmet + Rate Limiting + CORS
- **Performance**: Redis Cache + CDN + Gzip

---

## 🎨 **Sistema de Diseño "Neon Urban"**

### **Paleta de Colores:**
```css
:root {
  --neon-blue: #00d4ff;      /* Azul eléctrico principal */
  --neon-purple: #a855f7;    /* Púrpura neón */
  --neon-cyan: #06b6d4;      /* Cyan vibrante */
  --neon-green: #10b981;     /* Verde cyber */
  --neon-orange: #f97316;    /* Naranja vibrante */
  --neon-pink: #ec4899;      /* Rosa neón */
  --neon-yellow: #eab308;    /* Amarillo cyber */
}
```

### **Efectos Visuales:**
- **Glassmorphism**: `backdrop-blur-xl bg-white/10`
- **Neumorphism**: Sombras suaves y bordes sutiles
- **Gradientes**: `linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)`
- **Neon Glow**: `box-shadow: 0 0 20px rgba(0, 212, 255, 0.3)`
- **Partículas**: Sistema de partículas animadas en Hero Section

### **Animaciones:**
- **Hover Effects**: Scale, rotate, translate con spring physics
- **Micro-interacciones**: Ripple effects, focus states, loading spinners
- **Page Transitions**: Fade in/out, slide animations
- **Scroll Animations**: Intersection Observer + Framer Motion

---

## 🚀 **Inicio Rápido**

### **1. Clonar y Configurar:**
```bash
# Clonar el repositorio
git clone https://github.com/railin4264/EVENTCONENECT-3.4.git
cd EventConnect

# Ejecutar configuración automática
chmod +x setup.sh
./setup.sh
```

### **2. Configurar Variables de Entorno:**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar con: MONGODB_URI, JWT_SECRET, GOOGLE_MAPS_API_KEY

# Web Frontend
cp web/.env.example web/.env.local
# Editar con: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Mobile
cp mobile/.env.example mobile/.env
# Editar con: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
```

### **3. Iniciar Desarrollo:**
```bash
# Todos los servicios
make dev

# O servicios individuales:
make dev-backend    # Backend API (puerto 5000)
make dev-web       # Frontend Web (puerto 3000)  
make dev-mobile    # App Móvil (puerto 19000)
```

---

## 📱 **URLs de Desarrollo**

- **🌐 Web Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:5000
- **📱 Mobile Expo**: http://localhost:19000
- **🗄️ MongoDB Admin**: http://localhost:8081 (con Docker)
- **⚡ Redis Admin**: http://localhost:8082 (con Docker)

---

## 🎯 **Comandos Útiles**

```bash
make help           # Ver todos los comandos disponibles
make setup          # Configuración inicial completa
make dev            # Iniciar todos los servicios
make test           # Ejecutar tests en todos los proyectos
make lint           # Verificar código con ESLint
make format         # Formatear con Prettier
make build          # Construir para producción
make docker-up      # Iniciar stack completo con Docker
make clean          # Limpiar archivos temporales
```

---

## 🧪 **Testing y Calidad**

### **Backend Testing:**
```bash
cd backend
npm run test              # Tests unitarios
npm run test:coverage     # Con cobertura
npm run test:integration  # Tests de integración
```

### **Web Frontend Testing:**
```bash
cd web
npm run test              # Jest tests
npm run test:e2e          # Playwright E2E
npm run storybook         # Storybook para componentes
```

### **Mobile Testing:**
```bash
cd mobile
npm run test              # Jest tests
npm run test:coverage     # Con cobertura
```

---

## 🚀 **Deployment**

### **Backend:**
```bash
# Con PM2
npm run build
pm2 start ecosystem.config.js

# Con Docker
docker build -t eventconnect-backend .
docker run -p 5000:5000 eventconnect-backend
```

### **Web Frontend:**
```bash
# Build estático
npm run build
npm run start

# Con Docker
docker build -t eventconnect-web .
docker run -p 3000:3000 eventconnect-web
```

### **Mobile App:**
```bash
# EAS Build
eas build --platform all

# EAS Submit
eas submit --platform all
```

---

## 🔧 **Configuración Avanzada**

### **Variables de Entorno Principales:**
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/eventconnect
JWT_SECRET=tu_jwt_secret_super_seguro_2024
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
CLOUDINARY_URL=cloudinary://tu_config
FIREBASE_CONFIG=tu_config_de_firebase

# Web Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Mobile
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
```

### **Personalización del Tema:**
```css
/* En web/src/styles/globals.css */
:root {
  --neon-blue: #tu_color_personalizado;
  --neon-purple: #tu_color_personalizado;
  /* ... más colores */
}
```

---

## 📚 **Documentación Adicional**

- **📖 API Docs**: `/backend/docs/API.md`
- **🔔 Notificaciones**: `/backend/docs/NOTIFICATIONS.md`
- **🗄️ Base de Datos**: `/backend/docs/README.md`
- **📱 Mobile Guide**: `/mobile/README.md`
- **🌐 Web Guide**: `/web/README.md`

---

## 🤝 **Contribuir**

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Estándares de Código:**
- **ESLint** + **Prettier** para consistencia
- **TypeScript** para type safety
- **Jest** para testing
- **Conventional Commits** para mensajes

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🆘 **Soporte**

- **📧 Email**: support@eventconnect.app
- **💬 Discord**: [EventConnect Community](https://discord.gg/eventconnect)
- **🐛 Issues**: [GitHub Issues](https://github.com/railin4264/EVENTCONENECT-3.4/issues)
- **📖 Wiki**: [Documentación Completa](https://github.com/railin4264/EVENTCONENECT-3.4/wiki)

---

## 🎉 **¡Gracias por usar EventConnect!**

**EventConnect** está diseñado para conectar personas a través de eventos y pasiones compartidas. Esperamos que disfrutes usando la plataforma y que te ayude a crear conexiones significativas en tu comunidad.

---

**⭐ Si te gusta EventConnect, ¡danos una estrella en GitHub!** 
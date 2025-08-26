# 🚀 **GUÍA DE DEPLOYMENT EVENTCONNECT**
**Production Ready Deployment Guide**

---

## 📋 **PREREQUISITOS**

### **🔧 Servicios Requeridos**
- ✅ **MongoDB**: Database principal
- ✅ **Redis**: Cache y sesiones
- ✅ **Cloudinary**: Upload de imágenes
- ✅ **Google Maps API**: Mapas y geolocalización
- ⚠️ **OAuth Providers**: Google, Facebook, GitHub (opcional)
- ⚠️ **Push Notifications**: FCM/APNS (opcional)

### **🌐 Hosting Recomendado**
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Frontend Web**: Vercel, Netlify, AWS Amplify
- **Mobile**: App Store, Google Play
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Cache**: Redis Cloud, AWS ElastiCache

---

## 🛠️ **CONFIGURACIÓN BACKEND**

### **1. Variables de Entorno (.env)**
```bash
# ===== PRODUCTION ENVIRONMENT =====
NODE_ENV=production
PORT=5000

# ===== DATABASE =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventconnect

# ===== JWT =====
JWT_SECRET=super-secure-jwt-secret-for-production-2024
JWT_EXPIRE=7d

# ===== CORS =====
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com

# ===== REDIS =====
REDIS_URL=redis://user:password@redis-server:6379

# ===== CLOUDINARY =====
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ===== GOOGLE MAPS =====
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ===== EMAIL =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-app-password

# ===== OAUTH =====
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# ===== PUSH NOTIFICATIONS =====
FCM_SERVER_KEY=your-fcm-server-key
EXPO_ACCESS_TOKEN=your-expo-access-token

# ===== RATE LIMITING =====
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# ===== SECURITY =====
SKIP_EMAIL_VERIFICATION=false
ENABLE_DETAILED_LOGS=false
```

### **2. Comandos de Deployment**
```bash
# Preparar para producción
npm run build
npm run test
npm run lint

# Docker deployment
docker build -t eventconnect-backend .
docker run -p 5000:5000 --env-file .env eventconnect-backend

# PM2 deployment
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🌐 **CONFIGURACIÓN WEB FRONTEND**

### **1. Variables de Entorno (.env.local)**
```bash
# ===== API CONFIGURATION =====
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_VERSION=v1

# ===== GOOGLE MAPS =====
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ===== OAUTH =====
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# ===== ANALYTICS =====
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# ===== PWA =====
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key

# ===== SENTRY =====
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# ===== ENVIRONMENT =====
NODE_ENV=production
```

### **2. Build y Deploy**
```bash
# Build optimizado
npm run build
npm run analyze  # Verificar bundle size

# Deploy en Vercel
npx vercel --prod

# Deploy en Netlify
npm run build
npx netlify deploy --prod --dir=.next

# Deploy manual
npm run build
npm run start
```

---

## 📱 **CONFIGURACIÓN MOBILE**

### **1. Configuración Expo (app.config.js)**
```javascript
export default {
  expo: {
    name: "EventConnect",
    slug: "eventconnect",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#667eea"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.eventconnect.app",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#667eea"
      },
      package: "com.eventconnect.app",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};
```

### **2. Build y Deploy**
```bash
# Configurar EAS
npm install -g @expo/cli
eas login
eas init

# Build para desarrollo
eas build --platform all --profile development

# Build para producción
eas build --platform all --profile production

# Submit a stores
eas submit --platform ios
eas submit --platform android
```

---

## 🔒 **CONFIGURACIÓN DE SEGURIDAD**

### **1. SSL/TLS**
```bash
# Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Cloudflare (Recomendado)
# Configurar DNS en Cloudflare con SSL/TLS en modo "Full (strict)"
```

### **2. Firewall y Security Headers**
```bash
# UFW Firewall
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # API (si es necesario)

# Fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### **3. Helmet.js Configuration (ya implementado)**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "*.cloudinary.com", "*.unsplash.com"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 📊 **MONITOREO Y ANALYTICS**

### **1. Logging (Winston configurado)**
```javascript
// logs/error.log
// logs/combined.log
// logs/access.log

// PM2 logs
pm2 logs eventconnect-backend
pm2 monit
```

### **2. Health Checks**
```bash
# Backend health
curl https://api.yourdomain.com/health

# Respuesta esperada:
{
  "status": "OK",
  "timestamp": "2025-01-XX",
  "uptime": 3600,
  "environment": "production",
  "database": "connected",
  "redis": "connected"
}
```

### **3. Performance Monitoring**
```javascript
// Prometheus metrics (ya configurado)
// Grafana dashboard
// New Relic / DataDog integración
```

---

## 🗄️ **BACKUP Y RECUPERACIÓN**

### **1. Database Backup**
```bash
# MongoDB backup automático
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Cron job para backup diario
0 2 * * * /usr/bin/mongodump --uri="$MONGODB_URI" --out=/backup/$(date +\%Y\%m\%d)
```

### **2. Files Backup**
```bash
# Cloudinary automático (ya configurado)
# Assets backup
tar -czf assets-backup-$(date +%Y%m%d).tar.gz ./uploads
```

---

## 🚀 **SCRIPTS DE DEPLOYMENT**

### **1. Deploy Script (deploy.sh)**
```bash
#!/bin/bash
set -e

echo "🚀 Starting EventConnect Deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run tests
npm run test

# Build application
npm run build

# Restart services
pm2 restart all

# Health check
sleep 10
curl -f http://localhost:5000/health || exit 1

echo "✅ Deployment completed successfully!"
```

### **2. Rollback Script (rollback.sh)**
```bash
#!/bin/bash
set -e

echo "⏪ Rolling back EventConnect..."

# Get previous release
PREVIOUS_RELEASE=$(git rev-parse HEAD~1)

# Checkout previous version
git checkout $PREVIOUS_RELEASE

# Install dependencies
npm ci

# Build application
npm run build

# Restart services
pm2 restart all

echo "✅ Rollback completed!"
```

---

## 📈 **ESCALABILIDAD**

### **1. Load Balancing (Nginx)**
```nginx
upstream eventconnect_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://eventconnect_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **2. Docker Compose (Producción)**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
      - mongo

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  redis_data:
  mongo_data:
```

---

## ✅ **CHECKLIST DE DEPLOYMENT**

### **🔧 Pre-deployment**
- [ ] Variables de entorno configuradas
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] SSL certificado instalado
- [ ] Backup de base de datos
- [ ] DNS configurado

### **🚀 Deployment**
- [ ] Backend deployado y funcionando
- [ ] Frontend web deployado
- [ ] Mobile app en stores
- [ ] Health checks pasando
- [ ] Monitoring activo
- [ ] Logs funcionando

### **📊 Post-deployment**
- [ ] Performance monitoring
- [ ] Error tracking configurado
- [ ] Analytics funcionando
- [ ] Backup automático activo
- [ ] Documentation actualizada
- [ ] Team notificado

---

## 🆘 **TROUBLESHOOTING**

### **❌ Problemas Comunes**

#### **Backend No Responde**
```bash
# Verificar estado del servicio
pm2 status
pm2 logs eventconnect-backend

# Reiniciar si es necesario
pm2 restart eventconnect-backend

# Verificar puertos
netstat -tulpn | grep :5000
```

#### **Database Connection Error**
```bash
# Verificar conexión MongoDB
mongosh "$MONGODB_URI"

# Verificar Redis
redis-cli ping
```

#### **High Memory Usage**
```bash
# Monitorear memoria
pm2 monit

# Restart si es necesario
pm2 restart all --update-env
```

---

## 📞 **CONTACTO Y SOPORTE**

### **🚨 Emergency Contacts**
- **DevOps Lead**: devops@yourdomain.com
- **Backend Lead**: backend@yourdomain.com
- **Frontend Lead**: frontend@yourdomain.com

### **📖 Documentación**
- **API Docs**: https://api.yourdomain.com/docs
- **Status Page**: https://status.yourdomain.com
- **Monitoring**: https://monitoring.yourdomain.com

---

**🎯 EventConnect está listo para producción con alta disponibilidad, seguridad y escalabilidad.**



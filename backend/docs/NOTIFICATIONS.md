# Sistema de Notificaciones - EventConnect

## Descripción General

El sistema de notificaciones de EventConnect proporciona una solución completa para enviar notificaciones push, in-app, por email y SMS a los usuarios. Está diseñado para ser escalable, confiable y fácil de usar.

## Características Principales

### 🔔 Tipos de Notificaciones
- **Eventos**: Invitaciones, recordatorios, actualizaciones, cancelaciones
- **Tribus**: Invitaciones, actualizaciones
- **Social**: Mensajes, menciones, likes, comentarios, seguimientos
- **Sistema**: Anuncios, actualizaciones de seguridad
- **Promocional**: Contenido promocional (opcional)

### 📱 Plataformas Soportadas
- **iOS**: APNS (Apple Push Notification Service)
- **Android**: FCM (Firebase Cloud Messaging)
- **Web**: Service Workers + Push API
- **Expo**: Expo Push Notifications

### 🚀 Funcionalidades Avanzadas
- Notificaciones programadas y recurrentes
- Horarios silenciosos configurables
- Preferencias personalizables por usuario
- Analytics y métricas de engagement
- Rate limiting y throttling
- Retry automático con backoff exponencial
- Categorización y priorización
- Acciones personalizables (iOS/Android)

## Arquitectura

### Componentes Principales

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Push Services │
│                 │    │                  │    │                 │
│ • Web (PWA)    │◄──►│ • Notification   │◄──►│ • Expo         │
│ • Mobile App   │    │   Controller     │    │ • FCM          │
│ • Service      │    │ • Notification   │    │ • APNS         │
│   Workers      │    │   Service        │    │ • Email        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Database       │
                       │                  │
                       │ • InApp          │
                       │   Notifications │
                       │ • Scheduled      │
                       │   Notifications │
                       │ • User           │
                       │   Preferences   │
                       └──────────────────┘
```

### Flujo de Notificación

1. **Generación**: El sistema genera una notificación basada en eventos
2. **Validación**: Se valida contra las preferencias del usuario
3. **Envío**: Se envía por los canales configurados
4. **Tracking**: Se registra el estado y métricas
5. **Retry**: En caso de fallo, se reintenta automáticamente

## Configuración

### Variables de Entorno

```bash
# Expo Push Notifications
EXPO_ACCESS_TOKEN=your-expo-access-token
EXPO_PROJECT_ID=your-expo-project-id

# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-fcm-project-id

# Apple Push Notification Service
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apns-team-id
APNS_BUNDLE_ID=your-app-bundle-id
APNS_PRIVATE_KEY=your-apns-private-key

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Opcional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### Configuración de Plataformas

#### Expo
1. Crear cuenta en [expo.dev](https://expo.dev)
2. Crear un proyecto
3. Obtener access token y project ID
4. Configurar variables de entorno

#### Firebase (FCM)
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Cloud Messaging
3. Obtener server key y project ID
4. Configurar variables de entorno

#### Apple (APNS)
1. Crear certificado push en Apple Developer Portal
2. Obtener key ID, team ID y bundle ID
3. Exportar private key
4. Configurar variables de entorno

## API Endpoints

### Notificaciones In-App

```http
GET /api/notifications/in-app
GET /api/notifications/in-app/unread
GET /api/notifications/in-app/stats
PATCH /api/notifications/in-app/:id/read
PATCH /api/notifications/in-app/read-all
DELETE /api/notifications/in-app/:id
DELETE /api/notifications/in-app
```

### Notificaciones Programadas

```http
GET /api/notifications/scheduled
POST /api/notifications/scheduled
PATCH /api/notifications/scheduled/:id
DELETE /api/notifications/scheduled/:id
DELETE /api/notifications/scheduled
```

### Preferencias de Usuario

```http
GET /api/notifications/preferences
PATCH /api/notifications/preferences
```

### Tokens de Push

```http
POST /api/notifications/push-token
DELETE /api/notifications/push-token/:token
GET /api/notifications/push-tokens
```

### Notificaciones del Sistema

```http
GET /api/notifications/system
POST /api/notifications/system/broadcast
```

### Analytics

```http
GET /api/notifications/analytics
GET /api/notifications/analytics/engagement
```

## Uso del Sistema

### Enviar Notificación Simple

```javascript
const { notificationService } = require('../services/NotificationService');

// Notificación push básica
await notificationService.sendPushNotification(userId, {
  type: 'event_invite',
  title: 'Invitación a Evento',
  body: 'Te han invitado a un evento',
  data: { eventId: '123' },
  priority: 'high'
});
```

### Notificación Multi-Canal

```javascript
// Enviar por múltiples canales
await notificationService.sendMultiChannelNotification(userId, {
  type: 'event_reminder',
  title: 'Recordatorio de Evento',
  body: 'Tu evento comienza en 1 hora',
  data: { eventId: '123' }
}, ['push', 'email', 'in_app']);
```

### Notificación Programada

```javascript
// Programar notificación para el futuro
await notificationService.scheduleNotification(userId, {
  type: 'event_reminder',
  title: 'Recordatorio de Evento',
  body: 'Tu evento comienza mañana',
  data: { eventId: '123' }
}, new Date('2024-01-15T09:00:00Z'));
```

### Notificación Recurrente

```javascript
// Notificación que se repite diariamente
await notificationService.scheduleNotification(userId, {
  type: 'daily_reminder',
  title: 'Recordatorio Diario',
  body: 'Revisa los eventos de hoy',
  data: {}
}, new Date(), {
  recurrence: {
    enabled: true,
    pattern: 'daily',
    interval: 1
  }
});
```

## Modelos de Datos

### InAppNotification

```javascript
{
  userId: ObjectId,
  type: String, // event_invite, event_reminder, etc.
  title: String,
  body: String,
  data: Object,
  priority: String, // low, normal, high, urgent
  categoryId: String,
  read: Boolean,
  readAt: Date,
  clicked: Boolean,
  clickedAt: Date,
  dismissed: Boolean,
  dismissedAt: Date,
  actionTaken: String,
  actionTakenAt: Date,
  expiresAt: Date,
  status: String, // pending, sent, delivered, failed
  channels: [String], // push, email, sms, in_app
  metadata: Object
}
```

### ScheduledNotification

```javascript
{
  userId: ObjectId,
  notification: Object,
  scheduledTime: Date,
  status: String, // pending, processing, sent, failed
  executionAttempts: Number,
  maxExecutionAttempts: Number,
  recurrence: {
    enabled: Boolean,
    pattern: String, // daily, weekly, monthly, yearly
    interval: Number,
    endDate: Date,
    maxOccurrences: Number
  },
  conditions: {
    userOnline: Boolean,
    userActive: Boolean,
    timeWindow: { start: String, end: String },
    timezone: String
  }
}
```

### User (Campos de Notificaciones)

```javascript
{
  // ... otros campos
  pushTokens: [{
    token: String,
    platform: String, // ios, android, web
    deviceId: String,
    appVersion: String,
    osVersion: String,
    registeredAt: Date,
    lastUsed: Date
  }],
  notificationPreferences: {
    push: {
      enabled: Boolean,
      types: Object,
      quietHours: Object
    },
    email: {
      enabled: Boolean,
      types: Object,
      frequency: String
    },
    sms: {
      enabled: Boolean,
      types: Object
    },
    in_app: {
      enabled: Boolean,
      types: Object,
      sound: Boolean,
      vibration: Boolean,
      badge: Boolean
    }
  }
}
```

## Preferencias de Usuario

### Estructura de Preferencias

```javascript
{
  push: {
    enabled: true,
    types: {
      event_invite: true,
      event_reminder: true,
      event_update: true,
      event_cancelled: true,
      tribe_invite: true,
      tribe_update: true,
      new_message: true,
      mention: true,
      like: true,
      comment: true,
      follow: true,
      system: true,
      security: true,
      promotional: false
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC'
    }
  },
  email: {
    enabled: true,
    types: { /* similar a push */ },
    frequency: 'immediate' // immediate, hourly, daily, weekly
  },
  sms: {
    enabled: false,
    types: { /* solo tipos críticos */ }
  },
  in_app: {
    enabled: true,
    types: { /* similar a push */ },
    sound: true,
    vibration: true,
    badge: true
  }
}
```

## Canales de Android

### Configuración de Canales

```javascript
[
  {
    id: 'default',
    name: 'General',
    description: 'Notificaciones generales',
    importance: 3, // IMPORTANCE_DEFAULT
    sound: 'default',
    vibration: true,
    light: true,
    lightColor: '#2196F3'
  },
  {
    id: 'events',
    name: 'Eventos',
    description: 'Notificaciones relacionadas con eventos',
    importance: 4, // IMPORTANCE_HIGH
    sound: 'default',
    vibration: true,
    light: true,
    lightColor: '#4CAF50'
  }
  // ... más canales
]
```

## Categorías de iOS

### Configuración de Categorías

```javascript
[
  {
    id: 'event_invite',
    actions: [
      {
        id: 'accept',
        title: 'Aceptar',
        options: ['foreground']
      },
      {
        id: 'decline',
        title: 'Rechazar',
        options: ['foreground']
      },
      {
        id: 'view',
        title: 'Ver',
        options: ['foreground']
      }
    ]
  }
  // ... más categorías
]
```

## Analytics y Métricas

### Métricas Disponibles

- **Delivery Rate**: Porcentaje de notificaciones entregadas
- **Open Rate**: Porcentaje de notificaciones abiertas
- **Click Rate**: Porcentaje de notificaciones con clics
- **Dismiss Rate**: Porcentaje de notificaciones descartadas
- **Time to Read**: Tiempo promedio para leer
- **Time to Click**: Tiempo promedio para hacer clic
- **Response Rate**: Tasa de respuesta
- **Retention Impact**: Impacto en retención

### Endpoints de Analytics

```http
GET /api/notifications/analytics?timeRange=7d
GET /api/notifications/analytics/engagement?timeRange=30d
```

## Seguridad

### Medidas Implementadas

- **Autenticación**: JWT requerido para todos los endpoints
- **Autorización**: Verificación de permisos por usuario
- **Rate Limiting**: Límites por IP y usuario
- **Validación**: Esquemas Joi para todos los inputs
- **Sanitización**: Limpieza de datos de entrada
- **Audit Logging**: Registro de todas las acciones
- **Token Validation**: Verificación de tokens push
- **Content Filtering**: Filtrado de contenido malicioso

### Configuración de Seguridad

```javascript
{
  encryption: true,
  signatureVerification: true,
  tokenValidation: true,
  rateLimiting: true,
  contentFiltering: true,
  auditLogging: true
}
```

## Monitoreo y Logs

### Logs Disponibles

- **Delivery Logs**: Estado de entrega de notificaciones
- **Error Logs**: Errores y fallos del sistema
- **Performance Logs**: Métricas de rendimiento
- **Security Logs**: Eventos de seguridad
- **User Activity Logs**: Actividad de usuarios

### Métricas de Sistema

- **Throughput**: Notificaciones por segundo
- **Latency**: Tiempo de respuesta
- **Error Rate**: Tasa de errores
- **Queue Size**: Tamaño de cola
- **Memory Usage**: Uso de memoria
- **CPU Usage**: Uso de CPU

## Troubleshooting

### Problemas Comunes

#### Notificaciones No Llegan
1. Verificar tokens push válidos
2. Revisar preferencias del usuario
3. Verificar configuración de plataforma
4. Revisar logs de error

#### Tokens Inválidos
1. Limpiar tokens automáticamente
2. Solicitar nuevo registro de token
3. Verificar formato de token

#### Rate Limiting
1. Ajustar límites en configuración
2. Implementar colas de procesamiento
3. Usar notificaciones batch

#### Fallos de Entrega
1. Verificar conectividad de servicios
2. Revisar configuración de retry
3. Monitorear métricas de entrega

### Comandos de Debug

```bash
# Verificar estado de servicios
curl http://localhost:5000/health

# Verificar logs de notificaciones
tail -f logs/notifications.log

# Verificar métricas de Redis
redis-cli info memory

# Verificar conexión a MongoDB
mongo --eval "db.runCommand('ping')"
```

## Escalabilidad

### Estrategias de Escalado

- **Horizontal**: Múltiples instancias del servicio
- **Vertical**: Aumentar recursos de instancia
- **Queue-based**: Colas de procesamiento
- **Caching**: Redis para datos frecuentes
- **Load Balancing**: Distribución de carga
- **Database Sharding**: Particionamiento de datos

### Configuración de Escalado

```javascript
{
  maxInstances: 10,
  queueSize: 10000,
  batchSize: 100,
  workerThreads: 4,
  cacheSize: '1GB',
  connectionPool: 20
}
```

## Mantenimiento

### Tareas Programadas

- **Cleanup**: Limpieza de notificaciones antiguas
- **Token Refresh**: Actualización de tokens expirados
- **Metrics Aggregation**: Agregación de métricas
- **Health Checks**: Verificación de servicios
- **Backup**: Respaldo de datos críticos

### Comandos de Mantenimiento

```bash
# Limpiar notificaciones antiguas
curl -X DELETE "http://localhost:5000/api/notifications/admin/cleanup?daysOld=30"

# Verificar estado del sistema
curl http://localhost:5000/health

# Generar reporte de métricas
curl http://localhost:5000/api/notifications/analytics?timeRange=30d
```

## Integración con Frontend

### Web (PWA)

```javascript
// Registrar service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// Solicitar permisos de notificación
const permission = await Notification.requestPermission();

// Suscribirse a notificaciones push
const subscription = await navigator.serviceWorker.ready
  .then(registration => registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'your-vapid-public-key'
  }));
```

### Mobile (React Native + Expo)

```javascript
import * as Notifications from 'expo-notifications';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicitar permisos
const { status } = await Notifications.requestPermissionsAsync();

// Obtener token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id',
});

// Enviar token al backend
await api.post('/notifications/push-token', { token });
```

## Testing

### Tests Unitarios

```bash
# Ejecutar tests de notificaciones
npm test -- --grep "notifications"

# Tests específicos
npm test -- --grep "NotificationService"
npm test -- --grep "NotificationController"
```

### Tests de Integración

```bash
# Tests de API
npm run test:integration -- --grep "notifications"

# Tests de WebSocket
npm run test:integration -- --grep "websocket"
```

### Tests de Performance

```bash
# Test de carga
npm run test:load -- --notifications

# Test de estrés
npm run test:stress -- --notifications
```

## Deployment

### Configuración de Producción

```bash
# Variables de entorno
NODE_ENV=production
REDIS_URL=redis://your-redis-cluster
MONGODB_URI=mongodb://your-mongodb-cluster

# Configuración de servicios
EXPO_ACCESS_TOKEN=your-production-token
FCM_SERVER_KEY=your-production-key
APNS_PRIVATE_KEY=your-production-key
```

### Monitoreo de Producción

- **APM**: New Relic, DataDog, etc.
- **Logs**: ELK Stack, Splunk, etc.
- **Metrics**: Prometheus, Grafana, etc.
- **Alerts**: PagerDuty, OpsGenie, etc.

## Roadmap

### Próximas Funcionalidades

- [ ] **AI-powered Personalization**: Personalización basada en IA
- [ ] **Advanced Segmentation**: Segmentación avanzada de usuarios
- [ ] **A/B Testing**: Testing de notificaciones
- [ ] **Smart Scheduling**: Programación inteligente
- [ ] **Rich Media**: Notificaciones con imágenes y videos
- [ ] **Interactive Notifications**: Notificaciones interactivas
- [ ] **Cross-platform Sync**: Sincronización entre plataformas
- [ ] **Advanced Analytics**: Analytics avanzados con ML

### Mejoras Técnicas

- [ ] **Microservices**: Arquitectura de microservicios
- [ ] **Event Sourcing**: Sourcing de eventos
- [ ] **CQRS**: Command Query Responsibility Segregation
- [ ] **GraphQL**: API GraphQL para notificaciones
- [ ] **Real-time Analytics**: Analytics en tiempo real
- [ ] **Machine Learning**: ML para optimización

## Contribución

### Guías de Desarrollo

1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Implementa** la funcionalidad
4. **Añade** tests
5. **Documenta** los cambios
6. **Crea** un Pull Request

### Estándares de Código

- **ESLint**: Configuración estándar
- **Prettier**: Formateo de código
- **JSDoc**: Documentación de funciones
- **TypeScript**: Tipado estático (opcional)

## Soporte

### Recursos

- **Documentación**: [docs/](docs/)
- **API Reference**: [docs/API.md](docs/API.md)
- **Examples**: [examples/](examples/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

### Contacto

- **Email**: support@eventconnect.com
- **Discord**: [EventConnect Community](https://discord.gg/eventconnect)
- **GitHub**: [EventConnect Repository](https://github.com/your-repo)

---

**Nota**: Este documento se actualiza regularmente. Para la versión más reciente, consulta el repositorio de GitHub.
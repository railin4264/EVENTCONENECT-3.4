// ==============================
// 📱 EVENTCONNECT - CONFIGURACIÓN PARA TESTING
// ==============================
// Este archivo contiene las configuraciones mínimas necesarias para testing

export const TEST_CONFIG = {
  // 🌐 BACKEND URLs (ESENCIAL)
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  
  // 🗺️ GOOGLE MAPS (Ya configurado en env.txt)
  GOOGLE_MAPS_KEY: 'AIzaSyDNN_nzVkisOiUq-O-3TT6vNYscXz5wkXo',
  
  // 🎯 FEATURE FLAGS PARA TESTING
  FEATURES: {
    OAUTH_LOGIN: false, // Deshabilitado hasta configurar keys reales
    PUSH_NOTIFICATIONS: true, // Usar Expo automático
    ANALYTICS: false, // No necesario para testing básico
    REAL_TIME_CHAT: true, // Habilitado para testing
    GEOLOCATION: true, // Habilitado para testing
    TRIBES_SYSTEM: true,
    POSTS_FEED: true,
    REVIEWS_SYSTEM: true,
    ADVANCED_SEARCH: true,
  },
  
  // 🧪 TESTING MODES
  TESTING: {
    USE_MOCK_DATA: false,
    SKIP_AUTHENTICATION: false, // Cambiar a true para testing sin login
    DEBUG_MODE: true,
    LOG_API_CALLS: true,
  }
};

// ==============================
// 📋 APIs NECESARIAS POR PRIORIDAD:
// ==============================

/*
🔥 CRÍTICAS (PARA QUE LA APP FUNCIONE):
✅ EXPO_PUBLIC_API_URL - Backend local (ya configurado)
✅ Google Maps API Key - Para eventos cercanos (ya configurado)

🟡 IMPORTANTES (PARA FUNCIONES AVANZADAS):
❌ Google OAuth Client ID - Para login con Google
❌ Facebook App ID - Para login con Facebook  
✅ Expo Push Notifications - Funciona automáticamente

🔵 OPCIONALES (PARA PRODUCCIÓN):
❌ Cloudinary - Para subir imágenes
❌ SendGrid - Para emails
❌ Sentry - Para monitoring de errores
❌ Analytics keys - Para tracking

==============================
🚀 PARA EMPEZAR A TESTEAR AHORA:
==============================

1. ✅ Backend funcionando en localhost:5000
2. ✅ Google Maps key ya configurado
3. ❌ Necesitas configurar OAuth si quieres probar login social
4. ✅ Todo lo demás funciona con el backend local

==============================
🛠️ CONFIGURACIÓN RÁPIDA OAUTH:
==============================

GOOGLE OAUTH:
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Crear credenciales > OAuth 2.0 Client ID
3. Aplicación: Android
4. Package name: com.eventconnect.app
5. Copiar Client ID

FACEBOOK OAUTH:
1. Ve a: https://developers.facebook.com/
2. Crear App > Consumer
3. Facebook Login > Settings
4. Android > Package Name: com.eventconnect.app
5. Copiar App ID

*/












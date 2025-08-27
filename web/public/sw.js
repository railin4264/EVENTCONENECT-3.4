// ==========================================
// SERVICE WORKER AVANZADO PARA EVENTCONNECT
// ==========================================

const CACHE_NAME = 'eventconnect-v1.0.0';
const STATIC_CACHE = 'eventconnect-static-v1.0.0';
const DYNAMIC_CACHE = 'eventconnect-dynamic-v1.0.0';
const API_CACHE = 'eventconnect-api-v1.0.0';

// ==========================================
// ESTRATEGIAS DE CACHE
// ==========================================

// Archivos estáticos críticos
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/events',
  '/tribes',
  '/profile',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Recursos de terceros para cache
const THIRD_PARTY_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/lucide-react@latest/dist/umd/lucide.min.js',
  'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places'
];

// ==========================================
// INSTALACIÓN DEL SERVICE WORKER
// ==========================================

self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache de archivos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cacheando archivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache de recursos de terceros
      caches.open(STATIC_CACHE).then(cache => {
        console.log('🌐 Cacheando recursos de terceros...');
        return cache.addAll(THIRD_PARTY_ASSETS);
      })
    ]).then(() => {
      console.log('✅ Service Worker instalado correctamente');
      return self.skipWaiting();
    }).catch(error => {
      console.error('❌ Error durante la instalación:', error);
    })
  );
});

// ==========================================
// ACTIVACIÓN DEL SERVICE WORKER
// ==========================================

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar control inmediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado correctamente');
    })
  );
});

// ==========================================
// INTERCEPTACIÓN DE REQUESTS
// ==========================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo procesar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estrategia de cache según el tipo de request
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isApiRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// ==========================================
// ESTRATEGIAS DE CACHE
// ==========================================

// Cache First: Para archivos estáticos
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Error en cacheFirst:', error);
    return new Response('Error de conexión', { status: 503 });
  }
}

// Network First: Para APIs y contenido dinámico
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🌐 Red no disponible, usando cache...');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para diferentes tipos de request
    return getFallbackResponse(request);
  }
}

// ==========================================
// DETECCIÓN DE TIPOS DE REQUEST
// ==========================================

function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.includes(url.pathname) ||
         request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'font';
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.hostname === 'api.eventconnect.com';
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

// ==========================================
// RESPONSES DE FALLBACK
// ==========================================

function getFallbackResponse(request) {
  const url = new URL(request.url);
  
  // Fallback para páginas
  if (request.destination === 'document') {
    return caches.match('/offline.html');
  }
  
  // Fallback para imágenes
  if (request.destination === 'image') {
    return caches.match('/offline-image.png');
  }
  
  // Fallback para APIs
  if (isApiRequest(request)) {
    return new Response(JSON.stringify({
      error: 'No hay conexión a internet',
      message: 'Los datos mostrados pueden no estar actualizados',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Fallback genérico
  return new Response('Contenido no disponible offline', { status: 503 });
}

// ==========================================
// NOTIFICACIONES PUSH
// ==========================================

self.addEventListener('push', (event) => {
  console.log('📱 Notificación push recibida:', event);
  
  if (!event.data) {
    return;
  }
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva notificación de EventConnect',
      icon: '/logo192.png',
      badge: '/badge.png',
      image: data.image,
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      tag: data.tag || 'eventconnect-notification',
      renotify: data.renotify || true,
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: Date.now()
    };
    
    // Verificar si es hora silenciosa
    if (isQuietHours()) {
      options.silent = true;
      options.body = '🔇 Notificación silenciosa: ' + options.body;
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'EventConnect', options)
    );
    
  } catch (error) {
    console.error('Error procesando notificación push:', error);
    
    // Notificación de fallback
    event.waitUntil(
      self.registration.showNotification('EventConnect', {
        body: 'Nueva notificación disponible',
        icon: '/logo192.png'
      })
    );
  }
});

// ==========================================
// CLICK EN NOTIFICACIONES
// ==========================================

self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action) {
    // Manejar acciones específicas
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Comportamiento por defecto
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// ==========================================
// CIERRE DE NOTIFICACIONES
// ==========================================

self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event);
  
  // Enviar métricas de engagement
  if (event.notification.data && event.notification.data.notificationId) {
    sendNotificationMetrics(event.notification.data.notificationId, 'closed');
  }
});

// ==========================================
// MANEJO DE ACCIONES DE NOTIFICACIÓN
// ==========================================

function handleNotificationAction(action, data) {
  switch (action) {
    case 'view_event':
      if (data.eventId) {
        clients.openWindow(`/events/${data.eventId}`);
      }
      break;
      
    case 'join_tribe':
      if (data.tribeId) {
        clients.openWindow(`/tribes/${data.tribeId}`);
      }
      break;
      
    case 'reply_message':
      if (data.chatId) {
        clients.openWindow(`/chat/${data.chatId}`);
      }
      break;
      
    default:
      clients.openWindow('/dashboard');
  }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

// Verificar si es hora silenciosa
function isQuietHours() {
  const now = new Date();
  const hour = now.getHours();
  const quietStart = 22; // 10 PM
  const quietEnd = 8;    // 8 AM
  
  return hour >= quietStart || hour < quietEnd;
}

// Enviar métricas de notificaciones
async function sendNotificationMetrics(notificationId, action) {
  try {
    const response = await fetch('/api/notifications/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId,
        action,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.warn('No se pudieron enviar métricas de notificación');
    }
  } catch (error) {
    console.error('Error enviando métricas:', error);
  }
}

// ==========================================
// SINCRONIZACIÓN EN BACKGROUND
// ==========================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronización en background:', event.tag);
  
  switch (event.tag) {
    case 'background-sync-events':
      event.waitUntil(syncEvents());
      break;
      
    case 'background-sync-notifications':
      event.waitUntil(syncNotifications());
      break;
      
    case 'background-sync-user-data':
      event.waitUntil(syncUserData());
      break;
      
    default:
      console.log('Tag de sincronización no reconocido:', event.tag);
  }
});

// Sincronizar eventos
async function syncEvents() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const eventRequests = requests.filter(req => 
      req.url.includes('/api/events')
    );
    
    for (const request of eventRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.error('Error sincronizando evento:', error);
      }
    }
    
    console.log('✅ Eventos sincronizados correctamente');
  } catch (error) {
    console.error('Error en sincronización de eventos:', error);
  }
}

// Sincronizar notificaciones
async function syncNotifications() {
  try {
    // Sincronizar preferencias de notificación
    const response = await fetch('/api/notifications/preferences', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const preferences = await response.json();
      await updateNotificationPreferences(preferences);
    }
    
    console.log('✅ Notificaciones sincronizadas correctamente');
  } catch (error) {
    console.error('Error en sincronización de notificaciones:', error);
  }
}

// Sincronizar datos del usuario
async function syncUserData() {
  try {
    // Sincronizar perfil del usuario
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const profile = await response.json();
      await updateUserProfile(profile);
    }
    
    console.log('✅ Datos de usuario sincronizados correctamente');
  } catch (error) {
    console.error('Error en sincronización de datos de usuario:', error);
  }
}

// ==========================================
// ACTUALIZACIÓN DE DATOS LOCALES
// ==========================================

async function updateNotificationPreferences(preferences) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(preferences), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/api/notifications/preferences', response);
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
  }
}

async function updateUserProfile(profile) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(profile), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/api/user/profile', response);
  } catch (error) {
    console.error('Error actualizando perfil:', error);
  }
}

// ==========================================
// MANEJO DE ERRORES
// ==========================================

self.addEventListener('error', (event) => {
  console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promesa rechazada no manejada:', event.reason);
});

// ==========================================
// LOGS DE DEBUG
// ==========================================

// Log de estado del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '1.0.0',
      cacheNames: [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE],
      timestamp: new Date().toISOString()
    });
  }
});

console.log('🚀 Service Worker de EventConnect cargado correctamente');

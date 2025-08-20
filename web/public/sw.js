const CACHE_NAME = 'eventconnect-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const API_CACHE = 'api-v1.0.0';

// Archivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/react-refresh.js',
  '/_next/static/css/app.css',
  '/images/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/hero-bg.jpg',
  '/images/event-placeholder.jpg',
  '/images/tribe-placeholder.jpg',
  '/images/user-avatar.jpg'
];

// Rutas de API para cache
const API_ROUTES = [
  '/api/v1/events',
  '/api/v1/tribes',
  '/api/v1/posts',
  '/api/v1/users',
  '/api/v1/search'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  STATIC_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cacheando archivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error instalando Service Worker:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Eliminando cache obsoleto:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado correctamente');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Error activando Service Worker:', error);
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests no-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estrategia para archivos estáticos
  if (isStaticFile(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Estrategia para APIs
  if (isApiRequest(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // Estrategia para páginas HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Estrategia por defecto
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Estrategia Cache First
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
    console.error('Error en cache first:', error);
    return getOfflineResponse(request);
  }
}

// Estrategia Network First
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
    
    return getOfflineResponse(request);
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Revalidar en background
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
  } catch (error) {
    console.error('Error en stale while revalidate:', error);
    return getOfflineResponse(request);
  }
}

// Obtener respuesta offline
async function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Si es una página HTML, mostrar página offline
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Crear respuesta offline básica
    const offlineHtml = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>EventConnect - Sin Conexión</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .offline-container { 
              text-align: center; 
              padding: 2rem; 
              background: rgba(255,255,255,0.1); 
              border-radius: 1rem; 
              backdrop-filter: blur(10px);
            }
            .offline-icon { 
              font-size: 4rem; 
              margin-bottom: 1rem; 
            }
            h1 { 
              margin-bottom: 1rem; 
              font-size: 2rem; 
            }
            p { 
              margin-bottom: 1rem; 
              opacity: 0.9; 
            }
            .retry-btn { 
              background: rgba(255,255,255,0.2); 
              border: 1px solid rgba(255,255,255,0.3); 
              color: white; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.5rem; 
              cursor: pointer; 
              transition: all 0.3s; 
            }
            .retry-btn:hover { 
              background: rgba(255,255,255,0.3); 
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📡</div>
            <h1>Sin Conexión</h1>
            <p>No tienes conexión a internet en este momento.</p>
            <p>Algunas funciones pueden no estar disponibles.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Reintentar
            </button>
          </div>
        </body>
      </html>
    `;
    
    return new Response(offlineHtml, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // Para otros tipos de contenido, devolver respuesta vacía
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}

// Función para verificar si es archivo estático
function isStaticFile(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         pathname.startsWith('/_next/static/') ||
         pathname === '/manifest.json';
}

// Función para verificar si es request de API
function isApiRequest(pathname) {
  return pathname.startsWith('/api/') || 
         pathname.includes('/events') ||
         pathname.includes('/tribes') ||
         pathname.includes('/posts') ||
         pathname.includes('/users') ||
         pathname.includes('/search');
}

// Función para limpiar cache antiguo
async function cleanOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== STATIC_CACHE && 
      name !== DYNAMIC_CACHE && 
      name !== API_CACHE
    );
    
    await Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
    
    console.log('🧹 Cache antiguo limpiado');
  } catch (error) {
    console.error('Error limpiando cache:', error);
  }
}

// Función para precargar recursos importantes
async function preloadImportantResources() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const resources = [
      '/api/v1/events?limit=10',
      '/api/v1/tribes?limit=10',
      '/api/v1/posts?limit=10'
    ];
    
    await Promise.all(
      resources.map(url => 
        fetch(url).then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        }).catch(() => {})
      )
    );
    
    console.log('📥 Recursos importantes precargados');
  } catch (error) {
    console.error('Error precargando recursos:', error);
  }
}

// Función para sincronizar datos offline
async function syncOfflineData() {
  try {
    // Obtener datos offline del IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      console.log(`🔄 Sincronizando ${offlineData.length} elementos offline...`);
      
      for (const data of offlineData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
          });
          
          // Remover de la cola offline si fue exitoso
          await removeOfflineData(data.id);
        } catch (error) {
          console.error('Error sincronizando dato offline:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error en sincronización offline:', error);
  }
}

// Función para obtener datos offline
async function getOfflineData() {
  // Implementar lógica para obtener datos del IndexedDB
  return [];
}

// Función para remover datos offline
async function removeOfflineData(id) {
  // Implementar lógica para remover datos del IndexedDB
}

// Evento de sincronización en background
self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronización en background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Evento de push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification recibida:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Nueva notificación de EventConnect',
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png',
        image: data.image,
        tag: data.tag || 'eventconnect-notification',
        data: data.data || {},
        actions: data.actions || [
          {
            action: 'view',
            title: 'Ver',
            icon: '/images/icon-192.png'
          },
          {
            action: 'dismiss',
            title: 'Descartar',
            icon: '/images/icon-192.png'
          }
        ],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate || [200, 100, 200],
        sound: data.sound || null
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'EventConnect', options)
      );
    } catch (error) {
      console.error('Error procesando push notification:', error);
      
      // Notificación de fallback
      const options = {
        body: 'Nueva notificación de EventConnect',
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png'
      };
      
      event.waitUntil(
        self.registration.showNotification('EventConnect', options)
      );
    }
  }
});

// Evento de click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Buscar ventana existente
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Abrir nueva ventana si no existe
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Solo cerrar la notificación
    event.notification.close();
  }
});

// Evento de cierre de notificación
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event);
  
  // Enviar analytics si está disponible
  if (event.notification.data?.analytics) {
    // Implementar tracking de analytics
    console.log('📊 Analytics: Notificación cerrada');
  }
});

// Función para actualizar cache
async function updateCache() {
  try {
    console.log('🔄 Actualizando cache...');
    
    // Limpiar cache antiguo
    await cleanOldCaches();
    
    // Precargar recursos importantes
    await preloadImportantResources();
    
    console.log('✅ Cache actualizado correctamente');
  } catch (error) {
    console.error('❌ Error actualizando cache:', error);
  }
}

// Función para obtener estadísticas de cache
async function getCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = keys.length;
    }
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas de cache:', error);
    return {};
  }
}

// Mensajes del Service Worker
self.addEventListener('message', (event) => {
  console.log('📨 Mensaje recibido en Service Worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      getCacheStats().then(stats => {
        event.ports[0].postMessage({ type: 'CACHE_STATS', stats });
      })
    );
  } else if (event.data && event.data.type === 'UPDATE_CACHE') {
    event.waitUntil(updateCache());
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names => 
        Promise.all(names.map(name => caches.delete(name)))
      )
    );
  }
});

// Función para registrar el Service Worker
if (typeof self !== 'undefined') {
  console.log('🚀 Service Worker EventConnect cargado');
  
  // Limpiar cache antiguo al iniciar
  cleanOldCaches();
  
  // Precargar recursos importantes
  preloadImportantResources();
}
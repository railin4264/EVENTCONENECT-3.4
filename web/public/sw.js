// ===== SERVICE WORKER - EventConnect PWA =====
// Version: 1.0.0
// Cache Strategy: Network First with Cache Fallback

const CACHE_NAME = 'eventconnect-v1.0.0';
const STATIC_CACHE = 'eventconnect-static-v1.0.0';
const DYNAMIC_CACHE = 'eventconnect-dynamic-v1.0.0';

// URLs to cache on install
const STATIC_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/events',
  '/api/events/popular',
  '/api/events/trending',
  '/api/tribes',
  '/api/tribes/popular'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname === '/') {
    // Home page - cache first
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/_next/')) {
    // Next.js assets - cache first
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/')) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request));
  } else {
    // Other pages - network first
    event.respondWith(networkFirst(request));
  }
});

// Cache First Strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first error:', error);
    return new Response('Network error', { status: 500 });
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first error:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    return new Response('Network error', { status: 500 });
  }
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Error processing pending action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de EventConnect',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver evento',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('EventConnect', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for background sync
async function getPendingActions() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function processPendingAction(action) {
  // Process pending action (like creating events, joining tribes, etc.)
  console.log('Processing pending action:', action);
}

async function removePendingAction(actionId) {
  // Remove processed action from IndexedDB
  console.log('Removing pending action:', actionId);
}

// Message handling
self.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});

console.log('🚀 EventConnect Service Worker loaded successfully!');
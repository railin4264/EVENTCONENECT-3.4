// Service Worker para Notificaciones Push
const CACHE_NAME = 'eventconnect-push-v1';
const PUSH_EVENTS = 'push-events';

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

// Manejo de mensajes push
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Nueva notificación de EventConnect',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        tag: data.tag || 'eventconnect',
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        data: data,
        actions: data.actions || [],
        image: data.image,
        vibrate: data.vibrate || [200, 100, 200],
        timestamp: data.timestamp || Date.now(),
        renotify: data.renotify || false,
        dir: data.dir || 'ltr',
        lang: data.lang || 'es',
        ...data.options
      };

      // Verificar horarios silenciosos
      if (data.quietHours && data.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTime = parseInt(data.quietHours.start.split(':')[0]) * 60 + parseInt(data.quietHours.start.split(':')[1]);
        const endTime = parseInt(data.quietHours.end.split(':')[0]) * 60 + parseInt(data.quietHours.end.split(':')[1]);
        
        if (currentTime >= startTime || currentTime <= endTime) {
          console.log('Notificación silenciada por horario');
          return;
        }
      }

      // Mostrar notificación
      event.waitUntil(
        self.registration.showNotification(data.title || 'EventConnect', options)
      );

      // Guardar en cache para sincronización offline
      event.waitUntil(
        cachePushEvent(data)
      );

    } catch (error) {
      console.error('Error procesando push:', error);
      
      // Fallback a notificación básica
      const options = {
        body: 'Nueva notificación de EventConnect',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'eventconnect'
      };
      
      event.waitUntil(
        self.registration.showNotification('EventConnect', options)
      );
    }
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Clic en notificación:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  // Manejar acciones específicas
  if (action === 'accept') {
    handleNotificationAction('accept', data);
  } else if (action === 'decline') {
    handleNotificationAction('decline', data);
  } else if (action === 'reply') {
    handleNotificationAction('reply', data);
  } else if (action === 'view') {
    handleNotificationAction('view', data);
  } else {
    // Clic en la notificación principal
    handleNotificationClick(data);
  }
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event);
  
  const data = event.notification.data || {};
  
  // Enviar métrica de cierre
  sendNotificationMetric('dismiss', data);
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('Mensaje recibido:', event.data);
  
  if (event.data.type === 'SETUP_NOTIFICATION_CATEGORIES') {
    setupNotificationCategories(event.data.categories);
  } else if (event.data.type === 'SYNC_PENDING_NOTIFICATIONS') {
    syncPendingNotifications();
  }
});

// Funciones auxiliares
async function handleNotificationClick(data) {
  try {
    // Abrir o enfocar la ventana
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });
    
    if (windowClients.length > 0) {
      // Si hay ventanas abiertas, enfocar la primera
      await windowClients[0].focus();
      
      // Navegar a la URL si se especifica
      if (data.url) {
        await windowClients[0].navigate(data.url);
      }
    } else {
      // Si no hay ventanas, abrir una nueva
      if (data.url) {
        await self.clients.openWindow(data.url);
      } else {
        await self.clients.openWindow('/');
      }
    }
    
    // Enviar métrica de clic
    sendNotificationMetric('click', data);
    
  } catch (error) {
    console.error('Error manejando clic en notificación:', error);
  }
}

async function handleNotificationAction(action, data) {
  try {
    // Enviar acción al cliente principal
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });
    
    if (windowClients.length > 0) {
      windowClients[0].postMessage({
        type: 'NOTIFICATION_ACTION',
        action,
        data
      });
    }
    
    // Enviar métrica de acción
    sendNotificationMetric(action, data);
    
  } catch (error) {
    console.error('Error manejando acción de notificación:', error);
  }
}

async function sendNotificationMetric(action, data) {
  try {
    const response = await fetch('/api/notifications/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        notificationType: data.type,
        notificationId: data.id,
        timestamp: new Date().toISOString(),
        platform: 'web',
        userAgent: navigator.userAgent
      })
    });
    
    if (!response.ok) {
      throw new Error('Error enviando métrica');
    }
    
  } catch (error) {
    console.error('Error enviando métrica:', error);
  }
}

async function cachePushEvent(data) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const events = await cache.match(PUSH_EVENTS);
    
    let pushEvents = [];
    if (events) {
      pushEvents = await events.json();
    }
    
    pushEvents.push({
      ...data,
      timestamp: Date.now(),
      cached: true
    });
    
    // Mantener solo los últimos 50 eventos
    if (pushEvents.length > 50) {
      pushEvents = pushEvents.slice(-50);
    }
    
    await cache.put(PUSH_EVENTS, new Response(JSON.stringify(pushEvents)));
    
  } catch (error) {
    console.error('Error cacheando evento push:', error);
  }
}

async function setupNotificationCategories(categories) {
  try {
    // Configurar categorías de notificación
    if ('Notification' in self) {
      // Las categorías se configuran automáticamente al mostrar notificaciones
      console.log('Categorías de notificación configuradas:', categories);
    }
  } catch (error) {
    console.error('Error configurando categorías:', error);
  }
}

async function syncPendingNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const events = await cache.match(PUSH_EVENTS);
    
    if (events) {
      const pushEvents = await events.json();
      const pendingEvents = pushEvents.filter(event => event.cached);
      
      if (pendingEvents.length > 0) {
        // Enviar eventos pendientes al backend
        const response = await fetch('/api/notifications/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notifications: pendingEvents
          })
        });
        
        if (response.ok) {
          // Limpiar eventos sincronizados
          const syncedEvents = pushEvents.filter(event => !event.cached);
          await cache.put(PUSH_EVENTS, new Response(JSON.stringify(syncedEvents)));
          console.log(`${pendingEvents.length} notificaciones sincronizadas`);
        }
      }
    }
  } catch (error) {
    console.error('Error sincronizando notificaciones:', error);
  }
}

// Manejo de errores
self.addEventListener('error', (event) => {
  console.error('Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada en Service Worker:', event.reason);
});
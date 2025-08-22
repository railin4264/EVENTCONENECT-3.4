import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const swRegistration = useRef(null);
  const notificationTimeout = useRef(null);

  // Verificar soporte del navegador
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Verificar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
      localStorage.setItem('last_sync_time', new Date().toISOString());

      // Sincronizar notificaciones pendientes
      syncPendingNotifications();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Registrar service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker no soportado');
      }

      const registration =
        await navigator.serviceWorker.register('/service-worker.js');
      swRegistration.current = registration;

      // Esperar a que el service worker esté activo
      await navigator.serviceWorker.ready;

      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      setError('Error registrando Service Worker');
      throw error;
    }
  }, []);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async () => {
    try {
      if (!isSupported) {
        throw new Error('Notificaciones push no soportadas');
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Permisos de notificación concedidos');
        return true;
      } else if (result === 'denied') {
        toast.error('Permisos de notificación denegados');
        return false;
      } else {
        toast.info('Permisos de notificación cancelados');
        return false;
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      setError('Error solicitando permisos');
      return false;
    }
  }, [isSupported]);

  // Suscribirse a notificaciones push
  const subscribeToPush = useCallback(async () => {
    try {
      setIsSubscribing(true);
      setError(null);

      // Registrar service worker si no está registrado
      if (!swRegistration.current) {
        await registerServiceWorker();
      }

      // Verificar permisos
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permisos de notificación requeridos');
        }
      }

      // Obtener suscripción existente
      let existingSubscription = null;
      if (swRegistration.current) {
        existingSubscription =
          await swRegistration.current.pushManager.getSubscription();
      }

      if (existingSubscription) {
        setSubscription(existingSubscription);
        toast.success('Ya estás suscrito a las notificaciones');
        return existingSubscription;
      }

      // Crear nueva suscripción
      if (swRegistration.current) {
        const newSubscription =
          await swRegistration.current.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

        setSubscription(newSubscription);

        // Enviar suscripción al backend
        await sendSubscriptionToServer(newSubscription);

        toast.success('Suscrito a notificaciones push');
        return newSubscription;
      }
    } catch (error) {
      console.error('Error suscribiéndose a push:', error);
      setError('Error suscribiéndose a notificaciones');
      toast.error('Error suscribiéndose a notificaciones');
      throw error;
    } finally {
      setIsSubscribing(false);
    }
  }, [permission, requestPermission, registerServiceWorker]);

  // Cancelar suscripción
  const unsubscribeFromPush = useCallback(async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);

        // Notificar al backend
        await removeSubscriptionFromServer(subscription);

        toast.success('Suscripción cancelada');
        return true;
      }
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      setError('Error cancelando suscripción');
      toast.error('Error cancelando suscripción');
      return false;
    }
  }, [subscription]);

  // Enviar suscripción al backend
  const sendSubscriptionToServer = async subscription => {
    try {
      const response = await fetch('/api/notifications/push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          token: subscription.endpoint,
          platform: 'web',
          deviceId: getDeviceId(),
          appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          osVersion: navigator.platform,
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error enviando suscripción al servidor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enviando suscripción:', error);
      throw error;
    }
  };

  // Remover suscripción del backend
  const removeSubscriptionFromServer = async subscription => {
    try {
      const response = await fetch(
        `/api/notifications/push-token/${encodeURIComponent(subscription.endpoint)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        console.warn('Error removiendo suscripción del servidor');
      }
    } catch (error) {
      console.error('Error removiendo suscripción:', error);
    }
  };

  // Obtener ID único del dispositivo
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  // Sincronizar notificaciones pendientes
  const syncPendingNotifications = async () => {
    try {
      const pendingNotifications = JSON.parse(
        localStorage.getItem('pending_notifications') || '[]'
      );

      if (pendingNotifications.length > 0) {
        // Enviar notificaciones pendientes al backend
        await fetch('/api/notifications/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ notifications: pendingNotifications }),
        });

        // Limpiar notificaciones pendientes
        localStorage.removeItem('pending_notifications');

        toast.success(
          `${pendingNotifications.length} notificaciones sincronizadas`
        );
      }
    } catch (error) {
      console.error('Error sincronizando notificaciones:', error);
    }
  };

  // Mostrar notificación local
  const showLocalNotification = useCallback(
    (title, options = {}) => {
      if (permission === 'granted' && isOnline) {
        const notification = new Notification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'eventconnect',
          requireInteraction: false,
          silent: false,
          ...options,
        });

        // Limpiar timeout anterior si existe
        if (notificationTimeout.current) {
          clearTimeout(notificationTimeout.current);
        }

        // Auto-cerrar notificación después de 5 segundos
        notificationTimeout.current = setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } else {
        // Fallback a toast si no hay permisos o está offline
        toast(title, options);
      }
    },
    [permission, isOnline]
  );

  // Configurar categorías de notificación
  const setupNotificationCategories = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.ready;

        // Enviar mensaje al service worker para configurar categorías
        registration.active?.postMessage({
          type: 'SETUP_NOTIFICATION_CATEGORIES',
          categories: [
            {
              id: 'event_invite',
              actions: [
                { id: 'accept', title: 'Aceptar', icon: '/icons/accept.png' },
                {
                  id: 'decline',
                  title: 'Rechazar',
                  icon: '/icons/decline.png',
                },
                { id: 'view', title: 'Ver', icon: '/icons/view.png' },
              ],
            },
            {
              id: 'event_reminder',
              actions: [
                { id: 'snooze', title: 'Posponer', icon: '/icons/snooze.png' },
                { id: 'view', title: 'Ver', icon: '/icons/view.png' },
              ],
            },
            {
              id: 'new_message',
              actions: [
                { id: 'reply', title: 'Responder', icon: '/icons/reply.png' },
                { id: 'view', title: 'Ver', icon: '/icons/view.png' },
              ],
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error configurando categorías:', error);
    }
  }, []);

  // Manejar clic en notificación
  const handleNotificationClick = useCallback((notification, action = null) => {
    try {
      // Marcar como leída
      notification.close();

      // Obtener datos de la notificación
      const data = notification.data || {};

      // Manejar acciones específicas
      if (action === 'accept') {
        // Lógica para aceptar evento
        console.log('Evento aceptado:', data.eventId);
      } else if (action === 'decline') {
        // Lógica para rechazar evento
        console.log('Evento rechazado:', data.eventId);
      } else if (action === 'reply') {
        // Lógica para responder mensaje
        console.log('Respondiendo mensaje:', data.messageId);
      } else if (action === 'view') {
        // Navegar a la página correspondiente
        if (data.url) {
          window.open(data.url, '_blank');
        }
      }

      // Enviar métrica de clic al backend
      sendNotificationMetric('click', data);
    } catch (error) {
      console.error('Error manejando clic en notificación:', error);
    }
  }, []);

  // Enviar métrica de notificación
  const sendNotificationMetric = async (action, data) => {
    try {
      await fetch('/api/notifications/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action,
          notificationType: data.type,
          notificationId: data.id,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: 'web',
        }),
      });
    } catch (error) {
      console.error('Error enviando métrica:', error);
    }
  };

  // Configurar listeners de notificación
  useEffect(() => {
    if (permission === 'granted') {
      // Listener para clic en notificación
      const handleClick = event => {
        const notification = event.notification;
        const action = event.action;

        handleNotificationClick(notification, action);
      };

      // Listener para cierre de notificación
      const handleClose = event => {
        const notification = event.notification;
        const data = notification.data || {};

        // Enviar métrica de cierre
        sendNotificationMetric('dismiss', data);
      };

      // Listener para error de notificación
      const handleError = event => {
        console.error('Error en notificación:', event.error);
        setError('Error mostrando notificación');
      };

      // Agregar listeners
      navigator.serviceWorker?.addEventListener('message', event => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          handleNotificationClick(event.data.notification, event.data.action);
        }
      });

      // Configurar categorías
      setupNotificationCategories();

      return () => {
        // Cleanup listeners si es necesario
      };
    }
  }, [permission, handleNotificationClick, setupNotificationCategories]);

  // Verificar estado de suscripción
  useEffect(() => {
    const checkSubscription = async () => {
      if (swRegistration.current) {
        try {
          const existingSubscription =
            await swRegistration.current.pushManager.getSubscription();
          setSubscription(existingSubscription);
        } catch (error) {
          console.error('Error verificando suscripción:', error);
        }
      }
    };

    if (permission === 'granted') {
      checkSubscription();
    }
  }, [permission]);

  // Estado del hook
  const state = {
    isSupported,
    permission,
    subscription,
    isSubscribing,
    error,
    isOnline,
    lastSync,
  };

  // Acciones del hook
  const actions = {
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showLocalNotification,
    handleNotificationClick,
    setupNotificationCategories,
    syncPendingNotifications,
  };

  return [state, actions];
};

export default usePushNotifications;

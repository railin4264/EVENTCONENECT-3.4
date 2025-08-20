import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  isUpdated: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

interface ServiceWorkerActions {
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  update: () => Promise<void>;
  skipWaiting: () => Promise<void>;
}

export const useServiceWorker = (): ServiceWorkerState & ServiceWorkerActions => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalled: false,
    isUpdated: false,
    registration: null,
    error: null
  });

  // Check if Service Worker is supported
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator;
    setState(prev => ({ ...prev, isSupported }));
  }, []);

  // Check for existing registration
  useEffect(() => {
    if (!state.isSupported) return;

    const checkRegistration = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setState(prev => ({
            ...prev,
            isRegistered: true,
            registration,
            isInstalled: registration.active !== null,
            isUpdated: registration.waiting !== null
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error checking registration'
        }));
      }
    };

    checkRegistration();
  }, [state.isSupported]);

  // Listen for Service Worker updates
  useEffect(() => {
    if (!state.isSupported) return;

    const handleUpdateFound = () => {
      setState(prev => ({ ...prev, isUpdated: true }));
    };

    const handleControllerChange = () => {
      setState(prev => ({ ...prev, isInstalled: true }));
    };

    navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [state.isSupported]);

  // Register Service Worker
  const register = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error('Service Worker no soportado');
    }

    try {
      setState(prev => ({ ...prev, error: null }));

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
        isInstalled: registration.active !== null,
        isUpdated: registration.waiting !== null
      }));

      console.log('✅ Service Worker registrado exitosamente:', registration);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('❌ Error registrando Service Worker:', error);
      throw error;
    }
  }, [state.isSupported]);

  // Unregister Service Worker
  const unregister = useCallback(async () => {
    if (!state.registration) {
      throw new Error('No hay Service Worker registrado');
    }

    try {
      const unregistered = await state.registration.unregister();
      
      if (unregistered) {
        setState(prev => ({
          ...prev,
          isRegistered: false,
          isInstalled: false,
          isUpdated: false,
          registration: null
        }));
        console.log('✅ Service Worker desregistrado exitosamente');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('❌ Error desregistrando Service Worker:', error);
      throw error;
    }
  }, [state.registration]);

  // Update Service Worker
  const update = useCallback(async () => {
    if (!state.registration) {
      throw new Error('No hay Service Worker registrado');
    }

    try {
      await state.registration.update();
      console.log('🔄 Actualización de Service Worker solicitada');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('❌ Error actualizando Service Worker:', error);
      throw error;
    }
  }, [state.registration]);

  // Skip waiting (force update)
  const skipWaiting = useCallback(async () => {
    if (!state.registration?.waiting) {
      throw new Error('No hay Service Worker esperando');
    }

    try {
      // Send skip waiting message
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for the new service worker to take over
      await new Promise<void>((resolve) => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      });

      setState(prev => ({ ...prev, isUpdated: false }));
      console.log('✅ Service Worker actualizado y activado');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('❌ Error saltando espera del Service Worker:', error);
      throw error;
    }
  }, [state.registration]);

  return {
    ...state,
    register,
    unregister,
    update,
    skipWaiting
  };
};

// Hook for PWA installation
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('✅ PWA instalada exitosamente');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      throw new Error('No hay prompt de instalación disponible');
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó la instalación');
      } else {
        console.log('❌ Usuario rechazó la instalación');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('❌ Error durante la instalación:', error);
      throw error;
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    install
  };
};

// Hook for offline status
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Notificaciones push no soportadas');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('❌ Error solicitando permisos de notificación:', error);
      throw error;
    }
  }, []);

  const subscribe = useCallback(async (vapidPublicKey: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push Manager no soportado');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      setSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('❌ Error suscribiéndose a notificaciones push:', error);
      throw error;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      throw new Error('No hay suscripción activa');
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
    } catch (error) {
      console.error('❌ Error desuscribiéndose de notificaciones push:', error);
      throw error;
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe
  };
};
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  WifiIcon, 
  ArrowPathIcon, 
  HomeIcon, 
  MapIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const OfflinePage = () => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Verificar estado de conexión
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Escuchar cambios de conexión
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Verificar estado inicial
    checkOnlineStatus();

    // Obtener última sincronización
    const lastSyncTime = localStorage.getItem('last_sync_time');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // Redirigir cuando vuelva la conexión
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, router]);

  // Intentar reconectar
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
    try {
      // Intentar hacer una petición simple
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        setLastSync(new Date());
        localStorage.setItem('last_sync_time', new Date().toISOString());
      }
    } catch (error) {
      console.log('Aún sin conexión...');
    }
  };

  // Navegar a página offline
  const navigateToOfflinePage = (page) => {
    // Verificar si la página está en cache
    if ('caches' in window) {
      caches.match(`/${page}`).then(response => {
        if (response) {
          router.push(`/${page}`);
        } else {
          // Mostrar mensaje de página no disponible offline
          alert('Esta página no está disponible offline');
        }
      });
    } else {
      alert('Esta página no está disponible offline');
    }
  };

  // Funciones disponibles offline
  const offlineFeatures = [
    {
      name: 'Eventos Guardados',
      icon: CalendarIcon,
      description: 'Ver eventos que has guardado',
      action: () => navigateToOfflinePage('events/saved'),
      available: true
    },
    {
      name: 'Mis Tribus',
      icon: UserGroupIcon,
      description: 'Acceder a tus tribus',
      action: () => navigateToOfflinePage('tribes/my'),
      available: true
    },
    {
      name: 'Perfil',
      icon: UserGroupIcon,
      description: 'Ver tu perfil',
      action: () => navigateToOfflinePage('profile'),
      available: true
    },
    {
      name: 'Configuración',
      icon: CogIcon,
      description: 'Ajustes de la aplicación',
      action: () => navigateToOfflinePage('settings'),
      available: true
    }
  ];

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Conexión Restaurada!
          </h1>
          <p className="text-gray-600 mb-4">
            Redirigiendo a EventConnect...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">EC</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">EventConnect</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Sin conexión</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Icono principal */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiIcon className="w-12 h-12 text-red-600" />
          </div>

          {/* Título y descripción */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sin Conexión a Internet
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            No tienes conexión a internet en este momento. Algunas funciones pueden no estar disponibles, pero puedes acceder a contenido guardado offline.
          </p>

          {/* Botón de reintento */}
          <button
            onClick={handleRetry}
            disabled={retryCount >= 3}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            {retryCount >= 3 ? 'Demasiados intentos' : 'Reintentar conexión'}
          </button>

          {/* Contador de reintentos */}
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Intentos: {retryCount}/3
            </p>
          )}
        </div>

        {/* Información de estado */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estado de la Aplicación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Estado de conexión:</span>
              <span className="text-red-600 font-medium">Desconectado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Última sincronización:</span>
              <span className="text-gray-900 font-medium">
                {lastSync ? lastSync.toLocaleString() : 'Nunca'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Contenido offline:</span>
              <span className="text-green-600 font-medium">Disponible</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Cache de la app:</span>
              <span className="text-green-600 font-medium">Activo</span>
            </div>
          </div>
        </div>

        {/* Funciones disponibles offline */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Funciones Disponibles Offline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {offlineFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={feature.action}
                disabled={!feature.available}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Consejos para usuarios */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Consejos para usar EventConnect offline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">
                Los eventos y tribus que has visitado recientemente están disponibles offline
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">
                Puedes ver tu perfil y configuraciones sin conexión
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">
                Las notificaciones se sincronizarán cuando vuelva la conexión
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">
                Verifica tu conexión WiFi o datos móviles
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Ir al Inicio
          </button>
          
          <button
            onClick={() => navigateToOfflinePage('map')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <MapIcon className="w-4 h-4 mr-2" />
            Ver Mapa
          </button>
          
          <button
            onClick={() => navigateToOfflinePage('events')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Ver Eventos
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              EventConnect - Funcionando en modo offline
            </p>
            <p className="mt-1">
              La aplicación se sincronizará automáticamente cuando se restaure la conexión
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
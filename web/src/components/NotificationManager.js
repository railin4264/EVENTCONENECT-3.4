'use client';

import { useState, useEffect } from 'react';
import {
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  WifiIcon,
  WifiIcon as WifiOffIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import usePushNotifications from '../hooks/usePushNotifications';

const NotificationManager = ({ className = '' }) => {
  const [state, actions] = usePushNotifications();
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isSupported,
    permission,
    subscription,
    isSubscribing,
    error,
    isOnline,
    lastSync,
  } = state;

  const {
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showLocalNotification,
    setupNotificationCategories,
  } = actions;

  // Estado local para preferencias
  const [preferences, setPreferences] = useState({
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
    promotional: false,
  });

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00',
  });

  // Cargar preferencias del usuario
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences || preferences);
          setQuietHours(data.quietHours || quietHours);
        }
      } catch (error) {
        console.error('Error cargando preferencias:', error);
      }
    };

    if (localStorage.getItem('token')) {
      loadPreferences();
    }
  }, []);

  // Guardar preferencias
  const savePreferences = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          preferences,
          quietHours,
        }),
      });

      if (response.ok) {
        toast.success('Preferencias guardadas');
        setShowSettings(false);
      } else {
        throw new Error('Error guardando preferencias');
      }
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      toast.error('Error guardando preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar suscripción
  const handleSubscription = async () => {
    try {
      if (subscription) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error manejando suscripción:', error);
    }
  };

  // Probar notificación
  const testNotification = () => {
    showLocalNotification('Notificación de Prueba', {
      body: 'Esta es una notificación de prueba para verificar que todo funciona correctamente.',
      tag: 'test',
      data: {
        type: 'test',
        id: 'test-' + Date.now(),
        url: '/',
      },
    });
  };

  // Obtener estado de las notificaciones
  const getNotificationStatus = () => {
    if (!isSupported) {
      return {
        icon: ExclamationTriangleIcon,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        text: 'No soportado',
        description: 'Tu navegador no soporta notificaciones push',
      };
    }

    if (permission === 'denied') {
      return {
        icon: BellSlashIcon,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        text: 'Bloqueado',
        description: 'Las notificaciones están bloqueadas',
      };
    }

    if (permission === 'default') {
      return {
        icon: BellIcon,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        text: 'Pendiente',
        description: 'Permisos no solicitados',
      };
    }

    if (subscription) {
      return {
        icon: CheckCircleIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        text: 'Activo',
        description: 'Recibiendo notificaciones',
      };
    }

    return {
      icon: BellIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      text: 'Disponible',
      description: 'Listo para activar',
    };
  };

  const status = getNotificationStatus();
  const StatusIcon = status.icon;

  // Renderizar botón principal
  if (!showSettings) {
    return (
      <div className={`relative ${className}`}>
        {/* Botón principal */}
        <button
          onClick={() => setShowSettings(true)}
          className={`relative p-2 rounded-lg transition-all duration-200 hover:scale-105 ${status.bgColor} hover:bg-opacity-80`}
          title={`Notificaciones: ${status.text}`}
        >
          <StatusIcon className={`w-6 h-6 ${status.color}`} />

          {/* Indicador de estado online/offline */}
          <div className='absolute -top-1 -right-1'>
            {isOnline ? (
              <WifiIcon className='w-3 h-3 text-green-500' />
            ) : (
              <WifiOffIcon className='w-3 h-3 text-red-500' />
            )}
          </div>

          {/* Badge de notificaciones no leídas */}
          {subscription && (
            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white'></div>
          )}
        </button>

        {/* Tooltip de estado */}
        <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
          <div className='font-medium'>{status.text}</div>
          <div className='text-gray-300 text-xs'>{status.description}</div>
          {!isOnline && (
            <div className='text-red-300 text-xs mt-1'>Modo offline</div>
          )}
          <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
        </div>
      </div>
    );
  }

  // Renderizar panel de configuración
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center space-x-3'>
            <CogIcon className='w-6 h-6 text-gray-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Configuración de Notificaciones
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className='p-6 space-y-6'>
          {/* Estado actual */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center space-x-3 mb-3'>
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
              <span className='font-medium text-gray-900'>
                Estado: {status.text}
              </span>
            </div>
            <p className='text-sm text-gray-600 mb-3'>{status.description}</p>

            {/* Botón de suscripción */}
            {isSupported && permission === 'granted' && (
              <button
                onClick={handleSubscription}
                disabled={isSubscribing}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  subscription
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubscribing
                  ? 'Procesando...'
                  : subscription
                    ? 'Desactivar Notificaciones'
                    : 'Activar Notificaciones'}
              </button>
            )}

            {/* Solicitar permisos */}
            {isSupported && permission === 'default' && (
              <button
                onClick={requestPermission}
                className='w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors'
              >
                Solicitar Permisos
              </button>
            )}

            {/* Estado offline */}
            {!isOnline && (
              <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                <div className='flex items-center space-x-2'>
                  <WifiOffIcon className='w-4 h-4 text-yellow-600' />
                  <span className='text-sm text-yellow-800'>Modo offline</span>
                </div>
                {lastSync && (
                  <p className='text-xs text-yellow-700 mt-1'>
                    Última sincronización: {new Date(lastSync).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tipos de notificaciones */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>
              Tipos de Notificaciones
            </h3>
            <div className='space-y-2'>
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    checked={value}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700 capitalize'>
                    {key.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Horarios silenciosos */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>
              Horarios Silenciosos
            </h3>
            <div className='space-y-3'>
              <label className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  checked={quietHours.enabled}
                  onChange={e =>
                    setQuietHours(prev => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>
                  Activar horarios silenciosos
                </span>
              </label>

              {quietHours.enabled && (
                <div className='grid grid-cols-2 gap-3 ml-7'>
                  <div>
                    <label className='block text-xs text-gray-600 mb-1'>
                      Inicio
                    </label>
                    <input
                      type='time'
                      value={quietHours.start}
                      onChange={e =>
                        setQuietHours(prev => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-600 mb-1'>
                      Fin
                    </label>
                    <input
                      type='time'
                      value={quietHours.end}
                      onChange={e =>
                        setQuietHours(prev => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className='flex space-x-3'>
            <button
              onClick={testNotification}
              disabled={!subscription || permission !== 'granted'}
              className='flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Probar Notificación
            </button>
            <button
              onClick={savePreferences}
              disabled={isLoading}
              className='flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {/* Información adicional */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start space-x-3'>
              <InformationCircleIcon className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
              <div className='text-sm text-blue-800'>
                <p className='font-medium mb-1'>
                  ¿Cómo funcionan las notificaciones?
                </p>
                <ul className='space-y-1 text-xs'>
                  <li>
                    • Las notificaciones aparecen incluso cuando la app está
                    cerrada
                  </li>
                  <li>• Puedes personalizar qué tipos recibir</li>
                  <li>
                    • Los horarios silenciosos evitan notificaciones en la noche
                  </li>
                  <li>
                    • Funcionan offline y se sincronizan cuando vuelve la
                    conexión
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;

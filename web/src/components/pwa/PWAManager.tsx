'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Loading } from '../ui';
import { 
  useServiceWorker, 
  usePWAInstall, 
  useOfflineStatus, 
  usePushNotifications 
} from '../../hooks/useServiceWorker';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react';

const PWAManager: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  
  const sw = useServiceWorker();
  const pwa = usePWAInstall();
  const offline = useOfflineStatus();
  const push = usePushNotifications();

  // Auto-register service worker on mount
  useEffect(() => {
    if (sw.isSupported && !sw.isRegistered) {
      sw.register().catch(console.error);
    }
  }, [sw.isSupported, sw.isRegistered, sw.register]);

  // Show install prompt when available
  useEffect(() => {
    if (pwa.isInstallable && !showInstallPrompt) {
      setShowInstallPrompt(true);
    }
  }, [pwa.isInstallable, showInstallPrompt]);

  // Show update prompt when available
  useEffect(() => {
    if (sw.isUpdated && !showUpdatePrompt) {
      setShowUpdatePrompt(true);
    }
  }, [sw.isUpdated, showUpdatePrompt]);

  const handleInstall = async () => {
    try {
      await pwa.install();
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await sw.skipWaiting();
      setShowUpdatePrompt(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating PWA:', error);
    }
  };

  const handlePushPermission = async () => {
    try {
      const result = await push.requestPermission();
      if (result === 'granted') {
        // Subscribe to push notifications
        // You would need to implement your VAPID key here
        console.log('Push notifications enabled');
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          📱 Gestor PWA - EventConnect
        </h2>
        <p className="text-gray-600 mt-2">
          Instala la app, gestiona notificaciones y optimiza la experiencia offline
        </p>
      </div>

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card variant="glass" className="p-4 shadow-2xl border-2 border-purple-500">
              <div className="flex items-center space-x-3 mb-3">
                <Smartphone className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="font-semibold">Instalar EventConnect</h3>
                  <p className="text-sm text-gray-600">Acceso rápido desde tu pantalla de inicio</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleInstall} variant="primary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Instalar
                </Button>
                <Button 
                  onClick={() => setShowInstallPrompt(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Más tarde
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card variant="glass" className="p-4 shadow-2xl border-2 border-blue-500">
              <div className="flex items-center space-x-3 mb-3">
                <RefreshCw className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Nueva versión disponible</h3>
                  <p className="text-sm text-gray-600">Actualiza para obtener las últimas mejoras</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdate} variant="primary" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
                <Button 
                  onClick={() => setShowUpdatePrompt(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Más tarde
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Worker Status */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold">Estado del Service Worker</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Soporte:</span>
              <div className="flex items-center space-x-2">
                {sw.isSupported ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {sw.isSupported ? 'Soportado' : 'No soportado'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Registro:</span>
              <div className="flex items-center space-x-2">
                {sw.isRegistered ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium">
                  {sw.isRegistered ? 'Registrado' : 'No registrado'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Instalación:</span>
              <div className="flex items-center space-x-2">
                {sw.isInstalled ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Info className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  {sw.isInstalled ? 'Instalado' : 'Pendiente'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actualización:</span>
              <div className="flex items-center space-x-2">
                {sw.isUpdated ? (
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  {sw.isUpdated ? 'Disponible' : 'Actualizado'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {sw.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{sw.error}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {!sw.isRegistered && sw.isSupported && (
                <Button onClick={sw.register} variant="primary" size="sm">
                  Registrar SW
                </Button>
              )}
              
              {sw.isRegistered && (
                <>
                  <Button onClick={sw.update} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Actualización
                  </Button>
                  
                  <Button onClick={sw.unregister} variant="outline" size="sm">
                    Desregistrar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* PWA Installation */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-semibold">Instalación PWA</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Instalar como App</h4>
              <p className="text-sm text-gray-600">
                Accede rápidamente desde tu pantalla de inicio
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {pwa.isInstallable ? (
                <Button onClick={handleInstall} variant="primary">
                  <Download className="w-4 h-4 mr-2" />
                  Instalar
                </Button>
              ) : (
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-green-600">Ya instalado</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">¿Cómo instalar?</p>
                <ul className="mt-1 space-y-1">
                  <li>• En Chrome: Busca el botón "Instalar" en la barra de direcciones</li>
                  <li>• En Safari: Toca "Compartir" → "Añadir a pantalla de inicio"</li>
                  <li>• En Android: Toca "Instalar app" en el menú</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Connection Status */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold">Estado de Conexión</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            {offline.isOnline ? (
              <Wifi className="w-6 h-6 text-green-500" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                {offline.isOnline ? 'Conectado' : 'Sin conexión'}
              </p>
              <p className="text-sm text-gray-600">
                {offline.isOnline ? 'Internet disponible' : 'Modo offline activo'}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              {offline.isOnline 
                ? 'La app funciona con todas las funcionalidades'
                : 'Algunas funciones pueden estar limitadas'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold">Notificaciones Push</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Estado de Permisos</h4>
              <p className="text-sm text-gray-600">
                {push.permission === 'granted' && '✅ Notificaciones habilitadas'}
                {push.permission === 'denied' && '❌ Notificaciones bloqueadas'}
                {push.permission === 'default' && '⏳ Permisos no solicitados'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {push.permission === 'default' && (
                <Button onClick={handlePushPermission} variant="primary" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Habilitar
                </Button>
              )}
              
              {push.permission === 'granted' && (
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-green-600">Habilitadas</p>
                </div>
              )}
              
              {push.permission === 'denied' && (
                <div className="text-center">
                  <BellOff className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-red-600">Bloqueadas</p>
                </div>
              )}
            </div>
          </div>
          
          {push.permission === 'granted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Notificaciones activas</p>
                  <p>Recibirás alertas sobre eventos, mensajes y actualizaciones importantes</p>
                </div>
              </div>
            </div>
          )}
          
          {push.permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Permisos bloqueados</p>
                  <p>Para recibir notificaciones, habilita los permisos en la configuración del navegador</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* PWA Features */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-gray-500" />
          <h3 className="text-xl font-semibold">Características PWA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Instalación como app nativa</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Funcionamiento offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Notificaciones push</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Sincronización en background</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Cache inteligente</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Actualizaciones automáticas</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Experiencia app-like</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Acceso rápido desde pantalla de inicio</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PWAManager;
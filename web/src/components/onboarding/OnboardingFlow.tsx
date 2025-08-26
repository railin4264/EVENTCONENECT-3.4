'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  MapPinIcon,
  HeartIcon,
  BellIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';

// ===== INTERFACES =====
interface OnboardingData {
  profileSetup: boolean;
  locationPermission: boolean;
  notificationPermission: boolean;
  interestsSelected: string[];
  preferredRadius: number;
  eventTypes: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  userProfile?: any;
}

// ===== ONBOARDING FLOW COMPONENT =====
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  userProfile
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profileSetup: false,
    locationPermission: false,
    notificationPermission: false,
    interestsSelected: userProfile?.interests || [],
    preferredRadius: 25,
    eventTypes: []
  });

  // ===== ONBOARDING STEPS =====
  const steps = [
    {
      id: 'welcome',
      title: '¡Bienvenido a EventConnect!',
      description: 'Te ayudaremos a configurar tu experiencia personalizada',
      icon: SparklesIcon,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'profile',
      title: 'Perfil Completado',
      description: 'Tu perfil está listo para conectar con otros',
      icon: UserIcon,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'location',
      title: 'Activa tu Ubicación',
      description: 'Encuentra eventos cerca de ti',
      icon: MapPinIcon,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'notifications',
      title: 'Mantente Informado',
      description: 'Recibe notificaciones de eventos que te interesan',
      icon: BellIcon,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'preferences',
      title: 'Personaliza tu Experiencia',
      description: 'Ajusta tus preferencias de eventos',
      icon: HeartIcon,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'complete',
      title: '¡Todo Listo!',
      description: 'Comienza a explorar eventos increíbles',
      icon: CheckCircleIcon,
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  // ===== EVENT TYPES =====
  const eventTypeOptions = [
    { id: 'music', label: 'Conciertos & Música', icon: '🎵', description: 'Conciertos, festivales, música en vivo' },
    { id: 'sports', label: 'Deportes', icon: '⚽', description: 'Eventos deportivos, competencias' },
    { id: 'technology', label: 'Tecnología', icon: '💻', description: 'Conferencias tech, hackathons' },
    { id: 'food', label: 'Gastronomía', icon: '🍔', description: 'Festivales gastronómicos, cenas' },
    { id: 'art', label: 'Arte & Cultura', icon: '🎨', description: 'Exposiciones, teatro, arte' },
    { id: 'business', label: 'Networking', icon: '💼', description: 'Eventos profesionales, networking' },
    { id: 'education', label: 'Educación', icon: '📚', description: 'Talleres, seminarios, cursos' },
    { id: 'outdoor', label: 'Aire Libre', icon: '🏔️', description: 'Actividades al aire libre' }
  ];

  // ===== HANDLERS =====
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLocationPermission = async () => {
    setIsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      setOnboardingData(prev => ({
        ...prev,
        locationPermission: true
      }));

      // Store location
      localStorage.setItem('userLocation', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));

      setTimeout(handleNext, 1000);
    } catch (error) {
      console.error('Location permission denied:', error);
      // Continue anyway
      setTimeout(handleNext, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setOnboardingData(prev => ({
        ...prev,
        notificationPermission: permission === 'granted'
      }));
      
      setTimeout(handleNext, 1000);
    } catch (error) {
      console.error('Notification permission error:', error);
      setTimeout(handleNext, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventTypeToggle = (typeId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(typeId)
        ? prev.eventTypes.filter(id => id !== typeId)
        : [...prev.eventTypes, typeId]
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simulate saving preferences
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete(onboardingData);
    setIsLoading(false);
  };

  // ===== STEP COMPONENTS =====
  const WelcomeStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center"
      >
        <SparklesIcon className="w-12 h-12 text-white" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          ¡Bienvenido a EventConnect!
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Estás a unos pasos de descubrir eventos increíbles. Te guiaremos para personalizar tu experiencia.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {[
          { icon: '🎯', text: 'Eventos personalizados' },
          { icon: '📍', text: 'Cerca de ti' },
          { icon: '🔔', text: 'Notificaciones smart' },
          { icon: '🚀', text: 'Experiencias únicas' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="text-sm text-gray-300">{feature.text}</div>
          </motion.div>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleNext}
        className="w-full mt-8"
      >
        Comenzar Configuración
      </Button>
    </div>
  );

  const ProfileStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center"
      >
        <CheckCircleIcon className="w-12 h-12 text-white" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          ¡Perfil Completado!
        </h2>
        <p className="text-gray-300">
          Tu perfil está listo. Ahora configuremos algunas preferencias para mejorar tu experiencia.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">
              {userProfile?.firstName} {userProfile?.lastName}
            </h3>
            <p className="text-gray-400 text-sm">@{userProfile?.username}</p>
            <p className="text-gray-400 text-sm">{userProfile?.email}</p>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleNext}
        className="w-full"
      >
        Continuar
      </Button>
    </div>
  );

  const LocationStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center"
      >
        <MapPinIcon className="w-12 h-12 text-white" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Activa tu Ubicación
        </h2>
        <p className="text-gray-300">
          Permitenos acceder a tu ubicación para mostrarte eventos cerca de ti y crear una experiencia más personalizada.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold">¿Por qué necesitamos tu ubicación?</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Eventos cerca de ti</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Distancias precisas</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Recomendaciones locales</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleLocationPermission}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" variant="neon" />
              <span>Obteniendo ubicación...</span>
            </div>
          ) : (
            'Permitir Ubicación'
          )}
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleNext}
          className="w-full"
        >
          Saltar por ahora
        </Button>
      </div>
    </div>
  );

  const NotificationStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center"
      >
        <BellIcon className="w-12 h-12 text-white" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Mantente Informado
        </h2>
        <p className="text-gray-300">
          Recibe notificaciones sobre eventos que te interesan, recordatorios y actualizaciones importantes.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold">Te notificaremos sobre:</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Nuevos eventos que te interesan</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Recordatorios de eventos</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Actualizaciones importantes</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleNotificationPermission}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" variant="neon" />
              <span>Configurando...</span>
            </div>
          ) : (
            'Activar Notificaciones'
          )}
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleNext}
          className="w-full"
        >
          Saltar por ahora
        </Button>
      </div>
    </div>
  );

  const PreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center mb-6"
        >
          <HeartIcon className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-4">
          Personaliza tu Experiencia
        </h2>
        <p className="text-gray-300 mb-6">
          Selecciona los tipos de eventos que más te interesan
        </p>
      </div>

      {/* Event Types */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Tipos de eventos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {eventTypeOptions.map((eventType) => (
            <motion.button
              key={eventType.id}
              type="button"
              onClick={() => handleEventTypeToggle(eventType.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 text-left
                ${onboardingData.eventTypes.includes(eventType.id)
                  ? 'border-cyan-400 bg-cyan-500/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{eventType.icon}</span>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    onboardingData.eventTypes.includes(eventType.id) 
                      ? 'text-cyan-400' 
                      : 'text-white'
                  }`}>
                    {eventType.label}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {eventType.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Radius Preference */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Distancia máxima para eventos</h3>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Radio de búsqueda</span>
            <span className="text-cyan-400 font-semibold">{onboardingData.preferredRadius} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={onboardingData.preferredRadius}
            onChange={(e) => setOnboardingData(prev => ({
              ...prev,
              preferredRadius: parseInt(e.target.value)
            }))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5km</span>
            <span>50km</span>
            <span>100km</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleNext}
        className="w-full"
      >
        Continuar
      </Button>
    </div>
  );

  const CompleteStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center"
      >
        <CheckCircleIcon className="w-12 h-12 text-white" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          ¡Todo Listo!
        </h2>
        <p className="text-gray-300 text-lg">
          Tu cuenta está configurada. Comienza a explorar eventos increíbles.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Resumen de configuración:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Ubicación:</span>
            <span className={onboardingData.locationPermission ? 'text-green-400' : 'text-gray-400'}>
              {onboardingData.locationPermission ? 'Activada' : 'Desactivada'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Notificaciones:</span>
            <span className={onboardingData.notificationPermission ? 'text-green-400' : 'text-gray-400'}>
              {onboardingData.notificationPermission ? 'Activadas' : 'Desactivadas'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Tipos de eventos:</span>
            <span className="text-cyan-400">{onboardingData.eventTypes.length} seleccionados</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Radio de búsqueda:</span>
            <span className="text-cyan-400">{onboardingData.preferredRadius} km</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleComplete}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" variant="neon" />
            <span>Finalizando configuración...</span>
          </div>
        ) : (
          'Explorar EventConnect'
        )}
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep />;
      case 1: return <ProfileStep />;
      case 2: return <LocationStep />;
      case 3: return <NotificationStep />;
      case 4: return <PreferencesStep />;
      case 5: return <CompleteStep />;
      default: return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  Paso {currentStep + 1} de {steps.length}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% completado
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation (for non-action steps) */}
            {currentStep > 0 && currentStep < 5 && currentStep !== 2 && currentStep !== 3 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={isLoading}
                >
                  Anterior
                </Button>
                <div></div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;

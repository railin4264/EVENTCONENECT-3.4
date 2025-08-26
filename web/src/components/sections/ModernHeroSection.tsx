'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Users, 
  Music, 
  Camera, 
  Gamepad2,
  Book,
  Utensils,
  Dumbbell,
  Palette,
  Code,
  Heart,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Definir tipos de intereses
const INTERESTS = [
  { id: 'music', icon: Music, label: 'Música', color: 'from-purple-500 to-pink-500' },
  { id: 'photography', icon: Camera, label: 'Fotografía', color: 'from-blue-500 to-cyan-500' },
  { id: 'gaming', icon: Gamepad2, label: 'Gaming', color: 'from-green-500 to-emerald-500' },
  { id: 'reading', icon: Book, label: 'Lectura', color: 'from-orange-500 to-yellow-500' },
  { id: 'food', icon: Utensils, label: 'Gastronomía', color: 'from-red-500 to-orange-500' },
  { id: 'fitness', icon: Dumbbell, label: 'Fitness', color: 'from-indigo-500 to-purple-500' },
  { id: 'art', icon: Palette, label: 'Arte', color: 'from-pink-500 to-rose-500' },
  { id: 'tech', icon: Code, label: 'Tecnología', color: 'from-cyan-500 to-blue-500' },
];

interface ModernHeroSectionProps {}

export const ModernHeroSection: React.FC<ModernHeroSectionProps> = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'interests' | 'location' | 'complete'>('welcome');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const router = useRouter();

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleLocationRequest = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setCurrentStep('complete');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
          setCurrentStep('complete');
        }
      );
    }
  };

  const handleContinueToInterests = () => {
    setCurrentStep('interests');
  };

  const handleContinueToLocation = () => {
    if (selectedInterests.length > 0) {
      setCurrentStep('location');
    }
  };

  const handleExploreEvents = () => {
    // Guardar datos en localStorage o contexto
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
    if (userLocation) {
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    }
    router.push('/events');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.h1 
                  className="text-6xl md:text-8xl font-bold text-white"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Event
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    Connect
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Descubre eventos que realmente te interesen, cerca de ti
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button 
                  variant="primary" 
                  size="xl" 
                  onClick={handleContinueToInterests}
                  className="min-w-[250px] group"
                >
                  Comenzar
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  ¿Qué te interesa?
                </h2>
                <p className="text-lg text-gray-300">
                  Selecciona tus intereses para encontrar eventos perfectos para ti
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {INTERESTS.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.id);
                  
                  return (
                    <motion.button
                      key={interest.id}
                      onClick={() => handleInterestToggle(interest.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'border-cyan-400 bg-cyan-400/10 scale-105' 
                          : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${interest.color} flex items-center justify-center mb-3 mx-auto`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-medium text-sm">{interest.label}</p>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <CheckCircle className="w-6 h-6 text-cyan-400 bg-slate-900 rounded-full" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button 
                  variant="primary" 
                  size="xl" 
                  onClick={handleContinueToLocation}
                  disabled={selectedInterests.length === 0}
                  className="min-w-[200px]"
                >
                  Continuar ({selectedInterests.length})
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Encuentra eventos cerca
                </h2>
                <p className="text-lg text-gray-300">
                  Permitenos acceder a tu ubicación para mostrarte eventos cercanos
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-md mx-auto">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <h3 className="text-xl font-semibold text-white">Ubicación requerida</h3>
                    <p className="text-gray-300 text-sm">
                      Te mostraremos eventos increíbles que estén cerca de ti
                    </p>
                  </div>

                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleLocationRequest}
                    fullWidth
                    className="group"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Permitir ubicación
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentStep('complete')}
                    fullWidth
                  >
                    Omitir por ahora
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  ¡Perfecto!
                </h2>
                
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Ya tienes todo configurado. Ahora puedes explorar eventos que se adapten a tus intereses
                  {userLocation ? ' y ubicación' : ''}.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-lg mx-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Tu perfil:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Intereses:</span>
                      <span className="text-cyan-400 font-medium">{selectedInterests.length} seleccionados</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Ubicación:</span>
                      <span className={`font-medium ${locationPermission === 'granted' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {locationPermission === 'granted' ? 'Activada' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="xl" 
                onClick={handleExploreEvents}
                className="min-w-[250px] group"
              >
                <Users className="w-5 h-5 mr-2" />
                Explorar eventos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  MapPin, 
  MessageCircle, 
  Bell, 
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a EventConnect! 🎉',
    description: 'Tu nueva plataforma favorita para descubrir eventos increíbles y conectar con personas afines.',
    icon: <Sparkles className="w-12 h-12" />,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Eventos locales y globales',
      'Comunidades (Tribus) temáticas',
      'Chat en tiempo real',
      'Notificaciones personalizadas'
    ]
  },
  {
    id: 'discover',
    title: 'Descubre Eventos Únicos 📅',
    description: 'Explora eventos que realmente te interesan, desde talleres tecnológicos hasta conciertos increíbles.',
    icon: <Calendar className="w-12 h-12" />,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Búsqueda inteligente por intereses',
      'Filtros por ubicación y fecha',
      'Recomendaciones personalizadas',
      'Calendario integrado'
    ]
  },
  {
    id: 'connect',
    title: 'Conecta con Tu Tribu 👥',
    description: 'Únete a comunidades de personas que comparten tus pasiones y crea conexiones duraderas.',
    icon: <Users className="w-12 h-12" />,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Tribus por categorías de interés',
      'Chat grupal en tiempo real',
      'Eventos exclusivos de la tribu',
      'Sistema de karma y reconocimiento'
    ]
  },
  {
    id: 'location',
    title: 'Eventos Cerca de Ti 📍',
    description: 'Descubre qué está pasando en tu ciudad o explora eventos en destinos que quieres visitar.',
    icon: <MapPin className="w-12 h-12" />,
    color: 'from-orange-500 to-red-500',
    features: [
      'Mapa interactivo de eventos',
      'Eventos cercanos en tiempo real',
      'Planificación de viajes',
      'Check-in en eventos'
    ]
  },
  {
    id: 'features',
    title: 'Funciones Increíbles ⚡',
    description: 'Todas las herramientas que necesitas para una experiencia social completa.',
    icon: <Zap className="w-12 h-12" />,
    color: 'from-yellow-500 to-orange-500',
    features: [
      'Mensajería privada y grupal',
      'Sistema de reputación y badges',
      'Compartir en redes sociales',
      'Modo offline para viajes'
    ]
  },
  {
    id: 'ready',
    title: '¡Estás Listo para Comenzar! 🚀',
    description: 'Tu aventura social comienza ahora. ¡Vamos a crear momentos inolvidables juntos!',
    icon: <Target className="w-12 h-12" />,
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Perfil completamente personalizable',
      'Notificaciones inteligentes',
      'Integración con calendario',
      'Soporte 24/7'
    ]
  }
];

interface WelcomeOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function WelcomeOnboarding({ onComplete, onSkip }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
            <motion.div
              className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  EventConnect
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Saltar tutorial
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center text-white shadow-lg`}
                >
                  {currentStepData.icon}
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentStepData.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {currentStepData.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {/* Step indicators */}
              <div className="flex space-x-2">
                {ONBOARDING_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-purple-500 scale-110'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>
                  {currentStep === ONBOARDING_STEPS.length - 1 ? '¡Comenzar!' : 'Siguiente'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Fun fact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Dato curioso:</strong> Los usuarios de EventConnect asisten en promedio a 3.2 eventos más por mes que antes de unirse.
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}




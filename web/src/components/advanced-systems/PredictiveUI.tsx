'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  Search,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Sparkles,
  Settings,
  Palette,
  Type,
  Layout,
  Eye,
  X,
  Music,
} from 'lucide-react';

interface UserPreference {
  id: string;
  category: 'layout' | 'colors' | 'typography' | 'density' | 'animations';
  value: any;
  priority: number;
}

interface PredictiveAction {
  id: string;
  type: 'search' | 'navigation' | 'content' | 'action';
  label: string;
  description: string;
  icon: React.ReactNode;
  probability: number;
  action: () => void;
  category: string;
}

interface PredictiveUIProps {
  userId: string;
  className?: string;
}

// Componente de sugerencias predictivas
const PredictiveSuggestions: React.FC<{ actions: PredictiveAction[] }> = ({
  actions,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % actions.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + actions.length) % actions.length);
    } else if (e.key === 'Enter') {
      actions[selectedIndex]?.action();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions, selectedIndex]);

  if (!isVisible || actions.length === 0) return null;

  return (
    <motion.div
      className='fixed top-20 left-1/2 transform -translate-x-1/2 z-50'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl'>
        <div className='flex items-center space-x-2 mb-3'>
          <Sparkles className='w-5 h-5 text-yellow-400' />
          <h3 className='text-white font-semibold'>Sugerencias Inteligentes</h3>
        </div>

        <div className='space-y-2'>
          {actions.map((action, index) => (
            <motion.button
              key={action.id}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                index === selectedIndex
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
              onClick={action.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className='flex items-center space-x-3'>
                <div className='text-blue-400'>{action.icon}</div>
                <div className='flex-1'>
                  <div className='font-medium'>{action.label}</div>
                  <div className='text-sm text-white/60'>
                    {action.description}
                  </div>
                </div>
                <div className='text-xs text-white/40'>
                  {Math.round(action.probability * 100)}%
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className='text-xs text-white/40 mt-3 text-center'>
          Usa las flechas ↑↓ para navegar, Enter para seleccionar
        </div>
      </div>
    </motion.div>
  );
};

// Componente de personalización avanzada
const AdvancedCustomization: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('layout');
  const [preferences, setPreferences] = useState<UserPreference[]>([
    { id: '1', category: 'layout', value: 'grid', priority: 1 },
    { id: '2', category: 'colors', value: 'auto', priority: 1 },
    { id: '3', category: 'typography', value: 'inter', priority: 1 },
    { id: '4', category: 'density', value: 'comfortable', priority: 1 },
    { id: '5', category: 'animations', value: 'smooth', priority: 1 },
  ]);

  const tabs = [
    { id: 'layout', label: 'Layout', icon: <Layout className='w-4 h-4' /> },
    { id: 'colors', label: 'Colores', icon: <Palette className='w-4 h-4' /> },
    {
      id: 'typography',
      label: 'Tipografía',
      icon: <Type className='w-4 h-4' />,
    },
    { id: 'density', label: 'Densidad', icon: <Eye className='w-4 h-4' /> },
    {
      id: 'animations',
      label: 'Animaciones',
      icon: <Sparkles className='w-4 h-4' />,
    },
  ];

  const updatePreference = (category: string, value: any) => {
    setPreferences(prev =>
      prev.map(p => (p.category === category ? { ...p, value } : p))
    );
  };

  return (
    <motion.div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className='bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto'
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            Personalización Avanzada
          </h2>
          <button
            onClick={onClose}
            className='text-white/70 hover:text-white transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex space-x-1 mb-6 bg-white/5 rounded-lg p-1'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'layout' && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Diseño de Layout
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {['grid', 'list', 'masonry', 'timeline'].map(layout => (
                    <button
                      key={layout}
                      onClick={() => updatePreference('layout', layout)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.find(p => p.category === 'layout')
                          ?.value === layout
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <div className='text-white font-medium capitalize'>
                        {layout}
                      </div>
                      <div className='text-white/60 text-sm'>
                        Vista en {layout}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Esquema de Colores
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {[
                    {
                      id: 'auto',
                      name: 'Automático',
                      desc: 'Se adapta al contexto',
                    },
                    { id: 'light', name: 'Claro', desc: 'Tema claro fijo' },
                    { id: 'dark', name: 'Oscuro', desc: 'Tema oscuro fijo' },
                    {
                      id: 'custom',
                      name: 'Personalizado',
                      desc: 'Colores únicos',
                    },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => updatePreference('colors', theme.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.find(p => p.category === 'colors')
                          ?.value === theme.id
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <div className='text-white font-medium'>{theme.name}</div>
                      <div className='text-white/60 text-sm'>{theme.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Tipografía
                </h3>
                <div className='space-y-3'>
                  {[
                    { id: 'inter', name: 'Inter', desc: 'Moderno y legible' },
                    {
                      id: 'roboto',
                      name: 'Roboto',
                      desc: 'Clásico y confiable',
                    },
                    {
                      id: 'poppins',
                      name: 'Poppins',
                      desc: 'Elegante y amigable',
                    },
                    {
                      id: 'mono',
                      name: 'Monospace',
                      desc: 'Técnico y preciso',
                    },
                  ].map(font => (
                    <button
                      key={font.id}
                      onClick={() => updatePreference('typography', font.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        preferences.find(p => p.category === 'typography')
                          ?.value === font.id
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                      style={{
                        fontFamily: font.id === 'mono' ? 'monospace' : font.id,
                      }}
                    >
                      <div className='text-white font-medium'>{font.name}</div>
                      <div className='text-white/60 text-sm'>{font.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'density' && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Densidad de Información
                </h3>
                <div className='space-y-3'>
                  {[
                    {
                      id: 'compact',
                      name: 'Compacta',
                      desc: 'Máxima información, mínimo espacio',
                    },
                    {
                      id: 'comfortable',
                      name: 'Cómoda',
                      desc: 'Balance entre espacio y contenido',
                    },
                    {
                      id: 'spacious',
                      name: 'Espaciosa',
                      desc: 'Máximo espacio, fácil lectura',
                    },
                  ].map(density => (
                    <button
                      key={density.id}
                      onClick={() => updatePreference('density', density.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        preferences.find(p => p.category === 'density')
                          ?.value === density.id
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <div className='text-white font-medium'>
                        {density.name}
                      </div>
                      <div className='text-white/60 text-sm'>
                        {density.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'animations' && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Nivel de Animaciones
                </h3>
                <div className='space-y-3'>
                  {[
                    {
                      id: 'minimal',
                      name: 'Mínimas',
                      desc: 'Solo transiciones esenciales',
                    },
                    {
                      id: 'smooth',
                      name: 'Suaves',
                      desc: 'Animaciones fluidas y elegantes',
                    },
                    {
                      id: 'extensive',
                      name: 'Extensivas',
                      desc: 'Máximo movimiento y efectos',
                    },
                  ].map(animation => (
                    <button
                      key={animation.id}
                      onClick={() =>
                        updatePreference('animations', animation.id)
                      }
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        preferences.find(p => p.category === 'animations')
                          ?.value === animation.id
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <div className='text-white font-medium'>
                        {animation.name}
                      </div>
                      <div className='text-white/60 text-sm'>
                        {animation.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Botones de acción */}
        <div className='flex justify-end space-x-3 mt-6 pt-6 border-t border-white/20'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-white/70 hover:text-white transition-colors'
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              // Guardar preferencias
              localStorage.setItem(
                'userPreferences',
                JSON.stringify(preferences)
              );
              onClose();
            }}
            className='px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
          >
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente principal
export const PredictiveUI: React.FC<PredictiveUIProps> = ({
  userId,
  className = '',
}) => {
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [predictiveActions, setPredictiveActions] = useState<
    PredictiveAction[]
  >([]);
  const [userBehavior, setUserBehavior] = useState<Record<string, number>>({});

  // Simular análisis de comportamiento del usuario
  useEffect(() => {
    const analyzeBehavior = () => {
      const actions: PredictiveAction[] = [];

      // Basado en la hora del día
      const hour = new Date().getHours();
      if (hour >= 9 && hour <= 17) {
        actions.push({
          id: 'work-events',
          type: 'search',
          label: 'Eventos de trabajo',
          description: 'Conferencias y networking profesional',
          icon: <Users className='w-4 h-4' />,
          probability: 0.85,
          action: () => console.log('Buscar eventos de trabajo'),
          category: 'work',
        });
      }

      // Basado en ubicación (simulado)
      if (Math.random() > 0.5) {
        actions.push({
          id: 'nearby-events',
          type: 'navigation',
          label: 'Eventos cercanos',
          description: 'Descubre eventos en tu área',
          icon: <MapPin className='w-4 h-4' />,
          probability: 0.78,
          action: () => console.log('Navegar a eventos cercanos'),
          category: 'location',
        });
      }

      // Basado en tendencias
      actions.push({
        id: 'trending-events',
        type: 'content',
        label: 'Eventos trending',
        description: 'Lo que está de moda ahora',
        icon: <TrendingUp className='w-4 h-4' />,
        probability: 0.92,
        action: () => console.log('Ver eventos trending'),
        category: 'trends',
      });

      // Basado en historial de búsquedas
      if (userBehavior['music-events'] > 0.3) {
        actions.push({
          id: 'music-events',
          type: 'search',
          label: 'Eventos de música',
          description: 'Conciertos y festivales',
          icon: <Music className='w-4 h-4' />,
          probability: 0.88,
          action: () => console.log('Buscar eventos de música'),
          category: 'interests',
        });
      }

      setPredictiveActions(
        actions.sort((a, b) => b.probability - a.probability)
      );
    };

    analyzeBehavior();
    const interval = setInterval(analyzeBehavior, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [userBehavior]);

  // Simular tracking de comportamiento
  useEffect(() => {
    const trackBehavior = (action: string) => {
      setUserBehavior(prev => ({
        ...prev,
        [action]: (prev[action] || 0) + 0.1,
      }));
    };

    // Simular acciones del usuario
    const actions = [
      'music-events',
      'tech-events',
      'social-events',
      'work-events',
    ];
    const randomAction = () => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      trackBehavior(action);
    };

    const interval = setInterval(randomAction, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      {/* Botón de personalización */}
      <motion.button
        className='fixed bottom-6 left-6 p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors z-40'
        onClick={() => setIsCustomizationOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Settings className='w-6 h-6' />
      </motion.button>

      {/* Sugerencias predictivas */}
      <PredictiveSuggestions actions={predictiveActions} />

      {/* Modal de personalización */}
      <AnimatePresence>
        {isCustomizationOpen && (
          <AdvancedCustomization
            onClose={() => setIsCustomizationOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook para usar la UI predictiva
export const usePredictiveUI = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [learningMode, setLearningMode] = useState(true);

  const togglePredictive = () => setIsEnabled(!isEnabled);
  const toggleLearning = () => setLearningMode(!learningMode);

  return {
    isEnabled,
    learningMode,
    togglePredictive,
    toggleLearning,
  };
};

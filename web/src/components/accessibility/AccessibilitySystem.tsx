import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Volume2,
  Keyboard,
  MousePointer,
  Contrast,
  Monitor,
  Palette,
  Zap,
  Headphones,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ===== ACCESSIBILITY TYPES =====
export interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reduceMotion: boolean;
  darkMode: boolean;

  // Audio
  screenReader: boolean;
  audioDescriptions: boolean;
  soundEffects: boolean;

  // Navigation
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  skipLinks: boolean;

  // Cognitive
  simplifiedLayout: boolean;
  readingMode: boolean;
  distractionFree: boolean;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'visual' | 'audio' | 'navigation' | 'cognitive';
  enabled: boolean;
  settings?: any;
}

// ===== ACCESSIBILITY FEATURES =====
const accessibilityFeatures: AccessibilityFeature[] = [
  // Visual Features
  {
    id: 'high-contrast',
    name: 'Alto Contraste',
    description: 'Mejora la visibilidad con colores de alto contraste',
    icon: <Contrast className='w-5 h-5' />,
    category: 'visual',
    enabled: false,
  },
  {
    id: 'font-size',
    name: 'Tamaño de Fuente',
    description: 'Ajusta el tamaño del texto para mejor legibilidad',
    icon: <Eye className='w-5 h-5' />,
    category: 'visual',
    enabled: true,
    settings: { size: 'medium' },
  },
  {
    id: 'color-blind-mode',
    name: 'Modo Daltónico',
    description: 'Adapta los colores para diferentes tipos de daltonismo',
    icon: <Palette className='w-5 h-5' />,
    category: 'visual',
    enabled: false,
  },
  {
    id: 'reduce-motion',
    name: 'Reducir Movimiento',
    description: 'Minimiza las animaciones para usuarios sensibles',
    icon: <Zap className='w-5 h-5' />,
    category: 'visual',
    enabled: false,
  },

  // Audio Features
  {
    id: 'screen-reader',
    name: 'Lector de Pantalla',
    description: 'Optimiza el contenido para lectores de pantalla',
    icon: <Volume2 className='w-5 h-5' />,
    category: 'audio',
    enabled: true,
  },
  {
    id: 'audio-descriptions',
    name: 'Descripciones de Audio',
    description: 'Proporciona descripciones de audio para contenido visual',
    icon: <Headphones className='w-5 h-5' />,
    category: 'audio',
    enabled: false,
  },
  {
    id: 'sound-effects',
    name: 'Efectos de Sonido',
    description: 'Añade efectos de sonido para mejor feedback',
    icon: <Volume2 className='w-5 h-5' />,
    category: 'audio',
    enabled: false,
  },

  // Navigation Features
  {
    id: 'keyboard-navigation',
    name: 'Navegación por Teclado',
    description: 'Permite navegar completamente usando solo el teclado',
    icon: <Keyboard className='w-5 h-5' />,
    category: 'navigation',
    enabled: true,
  },
  {
    id: 'focus-indicators',
    name: 'Indicadores de Foco',
    description: 'Muestra claramente el elemento actualmente enfocado',
    icon: <MousePointer className='w-5 h-5' />,
    category: 'navigation',
    enabled: true,
  },
  {
    id: 'skip-links',
    name: 'Enlaces de Salto',
    description: 'Permite saltar al contenido principal rápidamente',
    icon: <ArrowDown className='w-5 h-5' />,
    category: 'navigation',
    enabled: true,
  },

  // Cognitive Features
  {
    id: 'simplified-layout',
    name: 'Diseño Simplificado',
    description: 'Reduce la complejidad visual del interfaz',
    icon: <Monitor className='w-5 h-5' />,
    category: 'cognitive',
    enabled: false,
  },
  {
    id: 'reading-mode',
    name: 'Modo de Lectura',
    description: 'Optimiza el contenido para lectura prolongada',
    icon: <Eye className='w-5 h-5' />,
    category: 'cognitive',
    enabled: false,
  },
  {
    id: 'distraction-free',
    name: 'Sin Distracciones',
    description: 'Elimina elementos distractores del interfaz',
    icon: <EyeOff className='w-5 h-5' />,
    category: 'cognitive',
    enabled: false,
  },
];

// ===== ACCESSIBILITY FEATURE CARD COMPONENT =====
const AccessibilityFeatureCard: React.FC<{
  feature: AccessibilityFeature;
  onToggle: (featureId: string, enabled: boolean) => void;
  onSettingsChange?: (featureId: string, settings: any) => void;
  className?: string;
}> = ({ feature, onToggle, onSettingsChange, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = () => {
    switch (feature.category) {
      case 'visual':
        return 'text-cyan-400';
      case 'audio':
        return 'text-purple-400';
      case 'navigation':
        return 'text-green-400';
      case 'cognitive':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryBg = () => {
    switch (feature.category) {
      case 'visual':
        return 'bg-cyan-400/10 border-cyan-400/20';
      case 'audio':
        return 'bg-purple-400/10 border-purple-400/20';
      case 'navigation':
        return 'bg-green-400/10 border-green-400/20';
      case 'cognitive':
        return 'bg-orange-400/10 border-orange-400/20';
      default:
        return 'bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card variant='glass' className={cn('w-full', getCategoryBg())}>
        <CardContent className='p-4'>
          <div className='flex items-start space-x-3'>
            {/* Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                getCategoryBg()
              )}
            >
              <div className={getCategoryColor()}>{feature.icon}</div>
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-medium text-white'>{feature.name}</h4>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={feature.enabled}
                    onChange={e => onToggle(feature.id, e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                </label>
              </div>

              <p className='text-sm text-gray-300 mb-3'>
                {feature.description}
              </p>

              {/* Category Badge */}
              <div className='flex items-center justify-between'>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getCategoryBg(),
                    getCategoryColor()
                  )}
                >
                  {feature.category}
                </span>

                {/* Settings Button */}
                {feature.settings && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className='text-cyan-400 hover:text-cyan-300 text-sm font-medium'
                  >
                    {isExpanded ? 'Ocultar' : 'Configurar'}
                  </button>
                )}
              </div>

              {/* Settings Panel */}
              {isExpanded && feature.settings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mt-3 pt-3 border-t border-white/10'
                >
                  {feature.id === 'font-size' && (
                    <div className='space-y-2'>
                      <label className='text-sm text-gray-300'>
                        Tamaño de fuente:
                      </label>
                      <div className='flex space-x-2'>
                        {['small', 'medium', 'large', 'xlarge'].map(size => (
                          <button
                            key={size}
                            onClick={() =>
                              onSettingsChange?.(feature.id, { size })
                            }
                            className={cn(
                              'px-3 py-1 rounded text-sm transition-all duration-200',
                              feature.settings?.size === size
                                ? 'bg-cyan-500 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            )}
                          >
                            {size === 'small' && 'A'}
                            {size === 'medium' && 'A'}
                            {size === 'large' && 'A'}
                            {size === 'xlarge' && 'A'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.id === 'color-blind-mode' && (
                    <div className='space-y-2'>
                      <label className='text-sm text-gray-300'>
                        Tipo de daltonismo:
                      </label>
                      <select
                        onChange={e =>
                          onSettingsChange?.(feature.id, {
                            type: e.target.value,
                          })
                        }
                        className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm'
                      >
                        <option value='none'>Ninguno</option>
                        <option value='protanopia'>
                          Protanopía (rojo-verde)
                        </option>
                        <option value='deuteranopia'>
                          Deuteranopía (rojo-verde)
                        </option>
                        <option value='tritanopia'>
                          Tritanopía (azul-amarillo)
                        </option>
                      </select>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== KEYBOARD NAVIGATION GUIDE COMPONENT =====
const KeyboardNavigationGuide: React.FC<{
  className?: string;
}> = ({ className }) => {
  const shortcuts = [
    {
      key: 'Tab',
      description: 'Navegar entre elementos',
      icon: <ArrowRight className='w-4 h-4' />,
    },
    {
      key: 'Enter',
      description: 'Activar elemento',
      icon: <ArrowDown className='w-4 h-4' />,
    },
    {
      key: 'Space',
      description: 'Seleccionar/Activar',
      icon: <Keyboard className='w-4 h-4' />,
    },
    {
      key: 'Escape',
      description: 'Cerrar/Cancelar',
      icon: <X className='w-4 h-4' />,
    },
    {
      key: '↑↓←→',
      description: 'Navegar en listas',
      icon: <ArrowUp className='w-4 h-4' />,
    },
    {
      key: 'H',
      description: 'Ir al inicio',
      icon: <ArrowUp className='w-4 h-4' />,
    },
    {
      key: 'E',
      description: 'Ir a eventos',
      icon: <ArrowRight className='w-4 h-4' />,
    },
    {
      key: 'P',
      description: 'Ir a perfil',
      icon: <ArrowRight className='w-4 h-4' />,
    },
    {
      key: 'S',
      description: 'Buscar',
      icon: <ArrowRight className='w-4 h-4' />,
    },
    {
      key: 'A',
      description: 'Accesibilidad',
      icon: <ArrowRight className='w-4 h-4' />,
    },
  ];

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Keyboard className='w-5 h-5 text-green-400' />
          <span>Guía de Navegación por Teclado</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className='flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200'
            >
              <div className='w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400'>
                {shortcut.icon}
              </div>
              <div className='flex-1'>
                <div className='text-white font-medium'>
                  {shortcut.description}
                </div>
                <div className='text-sm text-gray-300'>
                  Tecla: {shortcut.key}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ===== SCREEN READER OPTIMIZATION COMPONENT =====
const ScreenReaderOptimization: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [isActive, setIsActive] = useState(false);

  const screenReaderAnnouncements = [
    'Navegando por EventConnect',
    'Página de accesibilidad cargada',
    'Configuración de accesibilidad disponible',
    'Modo de alto contraste activado',
    'Navegación por teclado habilitada',
  ];

  const announceToScreenReader = (message: string) => {
    if (isActive) {
      // Create a live region for screen reader announcements
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Volume2 className='w-5 h-5 text-purple-400' />
          <span>Optimización para Lector de Pantalla</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Screen Reader Status */}
        <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                isActive ? 'bg-green-400' : 'bg-red-400'
              )}
            />
            <span className='text-white'>
              Lector de Pantalla: {isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <Button
            variant='neon'
            size='sm'
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>

        {/* Test Announcements */}
        <div className='space-y-2'>
          <h5 className='text-white font-medium'>Probar Anuncios:</h5>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {screenReaderAnnouncements.map((announcement, index) => (
              <button
                key={index}
                onClick={() => announceToScreenReader(announcement)}
                disabled={!isActive}
                className='px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-200'
              >
                {announcement}
              </button>
            ))}
          </div>
        </div>

        {/* ARIA Labels */}
        <div className='space-y-2'>
          <h5 className='text-white font-medium'>
            Etiquetas ARIA Implementadas:
          </h5>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {[
              'aria-label',
              'aria-describedby',
              'aria-live',
              'aria-expanded',
              'aria-hidden',
              'aria-current',
              'aria-selected',
              'aria-pressed',
            ].map((aria, index) => (
              <div
                key={index}
                className='px-3 py-2 bg-green-400/20 border border-green-400/30 text-green-400 text-sm rounded-lg'
              >
                {aria}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== COLOR BLIND SIMULATOR COMPONENT =====
const ColorBlindSimulator: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [selectedType, setSelectedType] = useState<string>('none');

  const colorBlindTypes = [
    { id: 'none', name: 'Normal', description: 'Visión normal del color' },
    {
      id: 'protanopia',
      name: 'Protanopía',
      description: 'Dificultad para distinguir rojo y verde',
    },
    {
      id: 'deuteranopia',
      name: 'Deuteranopía',
      description: 'Dificultad para distinguir rojo y verde',
    },
    {
      id: 'tritanopia',
      name: 'Tritanopía',
      description: 'Dificultad para distinguir azul y amarillo',
    },
  ];

  const getColorBlindFilter = () => {
    switch (selectedType) {
      case 'protanopia':
        return 'filter: url(#protanopia)';
      case 'deuteranopia':
        return 'filter: url(#deuteranopia)';
      case 'tritanopia':
        return 'filter: url(#tritanopia)';
      default:
        return '';
    }
  };

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Palette className='w-5 h-5 text-orange-400' />
          <span>Simulador de Daltonismo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Type Selector */}
        <div className='space-y-2'>
          <label className='text-white font-medium'>Tipo de Daltonismo:</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white'
          >
            {colorBlindTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* Color Test */}
        <div className='space-y-3'>
          <h5 className='text-white font-medium'>Prueba de Colores:</h5>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <div className='text-sm text-gray-300'>Colores Originales:</div>
              <div className='space-y-2'>
                <div className='h-8 bg-red-500 rounded'></div>
                <div className='h-8 bg-green-500 rounded'></div>
                <div className='h-8 bg-blue-500 rounded'></div>
                <div className='h-8 bg-yellow-500 rounded'></div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='text-sm text-gray-300'>Como lo ven:</div>
              <div
                className='space-y-2'
                style={{ filter: getColorBlindFilter() }}
              >
                <div className='h-8 bg-red-500 rounded'></div>
                <div className='h-8 bg-green-500 rounded'></div>
                <div className='h-8 bg-blue-500 rounded'></div>
                <div className='h-8 bg-yellow-500 rounded'></div>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Tips */}
        <div className='p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg'>
          <h6 className='text-blue-400 font-medium mb-2'>
            Consejos de Accesibilidad:
          </h6>
          <ul className='text-sm text-gray-300 space-y-1'>
            <li>• Usa colores con suficiente contraste</li>
            <li>• No dependas solo del color para transmitir información</li>
            <li>• Incluye texto alternativo para elementos visuales</li>
            <li>• Usa patrones y formas además de colores</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== MAIN ACCESSIBILITY SYSTEM COMPONENT =====
export const AccessibilitySystem: React.FC = () => {
  const [settings, _setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 'medium',
    colorBlindMode: 'none',
    reduceMotion: false,
    darkMode: true,
    screenReader: true,
    audioDescriptions: false,
    soundEffects: false,
    keyboardNavigation: true,
    focusIndicators: true,
    skipLinks: true,
    simplifiedLayout: false,
    readingMode: false,
    distractionFree: false,
  });

  const [features, setFeatures] = useState(accessibilityFeatures);

  useEffect(() => {
    // Apply accessibility settings to the document
    document.documentElement.classList.toggle(
      'high-contrast',
      settings.highContrast
    );
    document.documentElement.classList.toggle(
      'reduce-motion',
      settings.reduceMotion
    );
    document.documentElement.classList.toggle(
      'simplified-layout',
      settings.simplifiedLayout
    );
    document.documentElement.classList.toggle(
      'reading-mode',
      settings.readingMode
    );
    document.documentElement.classList.toggle(
      'distraction-free',
      settings.distractionFree
    );

    // Apply font size
    document.documentElement.style.fontSize = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    }[settings.fontSize];
  }, [settings]);

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    setFeatures(prev =>
      prev.map(f => (f.id === featureId ? { ...f, enabled } : f))
    );
  };

  const handleSettingsChange = (featureId: string, newSettings: any) => {
    setFeatures(prev =>
      prev.map(f =>
        f.id === featureId
          ? { ...f, settings: { ...f.settings, ...newSettings } }
          : f
      )
    );
  };

  const getCategoryFeatures = (category: string) => {
    return features.filter(f => f.category === category);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold text-white mb-2'>
            Sistema de Accesibilidad
          </h1>
          <p className='text-gray-300'>
            Hacemos EventConnect accesible para todos los usuarios
          </p>
        </motion.div>

        {/* Skip Links */}
        <div className='mb-6'>
          <div className='flex space-x-4'>
            <a
              href='#main-content'
              className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cyan-500 text-white px-4 py-2 rounded-lg z-50'
            >
              Saltar al contenido principal
            </a>
            <a
              href='#navigation'
              className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-20 bg-purple-500 text-white px-4 py-2 rounded-lg z-50'
            >
              Saltar a la navegación
            </a>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Features by Category */}
          <div className='space-y-8'>
            {/* Visual Accessibility */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-4 flex items-center space-x-2'>
                <Eye className='w-6 h-6 text-cyan-400' />
                <span>Accesibilidad Visual</span>
              </h2>
              <div className='space-y-4'>
                {getCategoryFeatures('visual').map(feature => (
                  <AccessibilityFeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onSettingsChange={handleSettingsChange}
                  />
                ))}
              </div>
            </div>

            {/* Audio Accessibility */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-4 flex items-center space-x-2'>
                <Volume2 className='w-6 h-6 text-purple-400' />
                <span>Accesibilidad Auditiva</span>
              </h2>
              <div className='space-y-4'>
                {getCategoryFeatures('audio').map(feature => (
                  <AccessibilityFeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onSettingsChange={handleSettingsChange}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tools and Guides */}
          <div className='space-y-6'>
            {/* Navigation Accessibility */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-4 flex items-center space-x-2'>
                <Keyboard className='w-6 h-6 text-green-400' />
                <span>Accesibilidad de Navegación</span>
              </h2>
              <div className='space-y-4'>
                {getCategoryFeatures('navigation').map(feature => (
                  <AccessibilityFeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onSettingsChange={handleSettingsChange}
                  />
                ))}
              </div>
            </div>

            {/* Cognitive Accessibility */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-4 flex items-center space-x-2'>
                <Monitor className='w-6 h-6 text-orange-400' />
                <span>Accesibilidad Cognitiva</span>
              </h2>
              <div className='space-y-4'>
                {getCategoryFeatures('cognitive').map(feature => (
                  <AccessibilityFeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onSettingsChange={handleSettingsChange}
                  />
                ))}
              </div>
            </div>

            {/* Tools */}
            <KeyboardNavigationGuide />
            <ScreenReaderOptimization />
            <ColorBlindSimulator />
          </div>
        </div>

        {/* Accessibility Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='mt-12'
        >
          <Card variant='glass' className='w-full'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Eye className='w-5 h-5 text-cyan-400' />
                <span>Estado de Accesibilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center p-4 bg-white/5 rounded-lg'>
                  <div className='text-2xl font-bold text-green-400 mb-1'>
                    {features.filter(f => f.enabled).length}
                  </div>
                  <div className='text-sm text-gray-300'>
                    Características Activas
                  </div>
                </div>
                <div className='text-center p-4 bg-white/5 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-400 mb-1'>
                    {
                      features.filter(f => f.category === 'visual' && f.enabled)
                        .length
                    }
                  </div>
                  <div className='text-sm text-gray-300'>Visual Activo</div>
                </div>
                <div className='text-center p-4 bg-white/5 rounded-lg'>
                  <div className='text-2xl font-bold text-purple-400 mb-1'>
                    {
                      features.filter(f => f.category === 'audio' && f.enabled)
                        .length
                    }
                  </div>
                  <div className='text-sm text-gray-300'>Audio Activo</div>
                </div>
                <div className='text-center p-4 bg-white/5 rounded-lg'>
                  <div className='text-2xl font-bold text-orange-400 mb-1'>
                    {
                      features.filter(
                        f => f.category === 'navigation' && f.enabled
                      ).length
                    }
                  </div>
                  <div className='text-sm text-gray-300'>Navegación Activa</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AccessibilitySystem;

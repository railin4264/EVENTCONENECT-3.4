'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  MapPinIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// ===== INTERFACES =====
interface EmptyStateProps {
  type: 'events' | 'tribes' | 'search' | 'bookmarks' | 'notifications' | 'location' | 'generic';
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'default' | 'floating' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ===== CONFIGURACIONES POR TIPO =====
const emptyStateConfig = {
  events: {
    title: 'No hay eventos disponibles',
    description: 'Parece que no hay eventos que coincidan con tus criterios. ¡Sé el primero en crear uno!',
    icon: CalendarDaysIcon,
    primaryAction: { label: 'Crear Evento', icon: <PlusIcon className="w-4 h-4" /> },
    secondaryAction: { label: 'Explorar Todo' },
    color: 'text-primary-500'
  },
  tribes: {
    title: 'Aún no te has unido a ninguna tribu',
    description: 'Las tribus son la mejor forma de conectar con personas que comparten tus intereses.',
    icon: UserGroupIcon,
    primaryAction: { label: 'Explorar Tribus', icon: <MagnifyingGlassIcon className="w-4 h-4" /> },
    secondaryAction: { label: 'Crear Tribu' },
    color: 'text-purple-500'
  },
  search: {
    title: 'No encontramos resultados',
    description: 'Intenta con otros términos de búsqueda o explora nuestras categorías populares.',
    icon: MagnifyingGlassIcon,
    primaryAction: { label: 'Limpiar Filtros' },
    secondaryAction: { label: 'Ver Populares' },
    color: 'text-blue-500'
  },
  bookmarks: {
    title: 'No tienes eventos guardados',
    description: 'Guarda eventos que te interesen para encontrarlos fácilmente más tarde.',
    icon: HeartIcon,
    primaryAction: { label: 'Explorar Eventos', icon: <SparklesIcon className="w-4 h-4" /> },
    color: 'text-red-500'
  },
  notifications: {
    title: 'No tienes notificaciones',
    description: 'Te notificaremos cuando haya actualizaciones importantes sobre tus eventos.',
    icon: SparklesIcon,
    primaryAction: { label: 'Ver Eventos' },
    color: 'text-green-500'
  },
  location: {
    title: 'Ubicación no disponible',
    description: 'Permite el acceso a tu ubicación para encontrar eventos cerca de ti.',
    icon: MapPinIcon,
    primaryAction: { label: 'Permitir Ubicación', icon: <GlobeAltIcon className="w-4 h-4" /> },
    color: 'text-orange-500'
  },
  generic: {
    title: 'No hay contenido disponible',
    description: 'Vuelve más tarde o explora otras secciones de la aplicación.',
    icon: SparklesIcon,
    primaryAction: { label: 'Explorar' },
    color: 'text-gray-500'
  }
};

// ===== ILUSTRACIONES FLOTANTES =====
const FloatingElements: React.FC<{ type: string }> = ({ type }) => {
  const getElements = () => {
    switch (type) {
      case 'events':
        return [
          { icon: CalendarDaysIcon, delay: 0, x: -20, y: -10 },
          { icon: MapPinIcon, delay: 0.2, x: 20, y: -20 },
          { icon: UserGroupIcon, delay: 0.4, x: 0, y: 15 }
        ];
      case 'tribes':
        return [
          { icon: UserGroupIcon, delay: 0, x: -15, y: -15 },
          { icon: HeartIcon, delay: 0.3, x: 15, y: -10 },
          { icon: SparklesIcon, delay: 0.6, x: 0, y: 20 }
        ];
      default:
        return [
          { icon: SparklesIcon, delay: 0, x: 0, y: 0 }
        ];
    }
  };

  const elements = getElements();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute top-1/2 left-1/2"
          style={{ x: element.x, y: element.y }}
          animate={{
            y: [element.y, element.y - 10, element.y],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            delay: element.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <element.icon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
        </motion.div>
      ))}
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration = 'default',
  size = 'md',
  className = ''
}) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-20'
  };

  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center ${sizeClasses[size]} ${className}`}
    >
      <div className="max-w-md mx-auto">
        {/* Ilustración */}
        <div className="relative mb-6">
          {illustration === 'floating' ? (
            <div className="relative w-32 h-32 mx-auto">
              <FloatingElements type={type} />
              <motion.div
                className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center ${config.color}`}
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              >
                <Icon className={iconSizes[size]} />
              </motion.div>
            </div>
          ) : illustration === 'minimal' ? (
            <motion.div
              className={`${iconSizes[size]} mx-auto ${config.color} opacity-60`}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className={iconSizes[size]} />
            </motion.div>
          ) : (
            <motion.div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center ${config.color} shadow-lg`}
              whileHover={{ scale: 1.05 }}
              animate={{ 
                boxShadow: [
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Icon className={iconSizes[size]} />
            </motion.div>
          )}
        </div>

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title || config.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {description || config.description}
          </p>
        </motion.div>

        {/* Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {(primaryAction || config.primaryAction) && (
            <Button
              variant="primary"
              onClick={primaryAction?.onClick || (() => {})}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              {primaryAction?.icon || config.primaryAction?.icon}
              {primaryAction?.label || config.primaryAction?.label}
            </Button>
          )}
          
          {(secondaryAction || config.secondaryAction) && (
            <Button
              variant="outline"
              onClick={secondaryAction?.onClick || (() => {})}
            >
              {secondaryAction?.label || config.secondaryAction?.label}
            </Button>
          )}
        </motion.div>

        {/* Elementos decorativos */}
        {illustration === 'default' && (
          <div className="mt-8 flex justify-center space-x-1 opacity-30">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.2, 
                  repeat: Infinity 
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
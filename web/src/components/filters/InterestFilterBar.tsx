'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Camera, 
  Gamepad2,
  Book,
  Utensils,
  Dumbbell,
  Palette,
  Code,
  Heart,
  Briefcase,
  Users,
  Plane,
  Monitor,
  GraduationCap,
  Stethoscope,
  TreePine,
  Shirt,
  Trophy,
  Coffee,
  Theater,
  Mic,
  PartyPopper,
  Building,
  X,
  Filter
} from 'lucide-react';

// Definir categorías de intereses con iconos y colores
const INTEREST_CATEGORIES = [
  { 
    id: 'music', 
    icon: Music, 
    label: 'Música', 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20 border-purple-400/30',
    activeColor: 'bg-purple-500 border-purple-400'
  },
  { 
    id: 'photography', 
    icon: Camera, 
    label: 'Fotografía', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20 border-blue-400/30',
    activeColor: 'bg-blue-500 border-blue-400'
  },
  { 
    id: 'gaming', 
    icon: Gamepad2, 
    label: 'Gaming', 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/20 border-green-400/30',
    activeColor: 'bg-green-500 border-green-400'
  },
  { 
    id: 'reading', 
    icon: Book, 
    label: 'Lectura', 
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/20 border-orange-400/30',
    activeColor: 'bg-orange-500 border-orange-400'
  },
  { 
    id: 'food', 
    icon: Utensils, 
    label: 'Gastronomía', 
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/20 border-red-400/30',
    activeColor: 'bg-red-500 border-red-400'
  },
  { 
    id: 'fitness', 
    icon: Dumbbell, 
    label: 'Fitness', 
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/20 border-indigo-400/30',
    activeColor: 'bg-indigo-500 border-indigo-400'
  },
  { 
    id: 'art', 
    icon: Palette, 
    label: 'Arte', 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/20 border-pink-400/30',
    activeColor: 'bg-pink-500 border-pink-400'
  },
  { 
    id: 'technology', 
    icon: Code, 
    label: 'Tecnología', 
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/20 border-cyan-400/30',
    activeColor: 'bg-cyan-500 border-cyan-400'
  },
  { 
    id: 'business', 
    icon: Briefcase, 
    label: 'Negocios', 
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-500/20 border-gray-400/30',
    activeColor: 'bg-gray-500 border-gray-400'
  },
  { 
    id: 'networking', 
    icon: Users, 
    label: 'Networking', 
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/20 border-teal-400/30',
    activeColor: 'bg-teal-500 border-teal-400'
  },
  { 
    id: 'travel', 
    icon: Plane, 
    label: 'Viajes', 
    color: 'from-sky-500 to-blue-500',
    bgColor: 'bg-sky-500/20 border-sky-400/30',
    activeColor: 'bg-sky-500 border-sky-400'
  },
  { 
    id: 'education', 
    icon: GraduationCap, 
    label: 'Educación', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/20 border-amber-400/30',
    activeColor: 'bg-amber-500 border-amber-400'
  },
  { 
    id: 'health', 
    icon: Stethoscope, 
    label: 'Salud', 
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/20 border-emerald-400/30',
    activeColor: 'bg-emerald-500 border-emerald-400'
  },
  { 
    id: 'outdoors', 
    icon: TreePine, 
    label: 'Aire Libre', 
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-600/20 border-green-500/30',
    activeColor: 'bg-green-600 border-green-500'
  },
  { 
    id: 'fashion', 
    icon: Shirt, 
    label: 'Moda', 
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-600/20 border-purple-500/30',
    activeColor: 'bg-purple-600 border-purple-500'
  },
  { 
    id: 'sports', 
    icon: Trophy, 
    label: 'Deportes', 
    color: 'from-orange-600 to-red-600',
    bgColor: 'bg-orange-600/20 border-orange-500/30',
    activeColor: 'bg-orange-600 border-orange-500'
  },
  { 
    id: 'volunteering', 
    icon: Heart, 
    label: 'Voluntariado', 
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/20 border-rose-400/30',
    activeColor: 'bg-rose-500 border-rose-400'
  },
  { 
    id: 'workshop', 
    icon: Coffee, 
    label: 'Talleres', 
    color: 'from-yellow-600 to-orange-600',
    bgColor: 'bg-yellow-600/20 border-yellow-500/30',
    activeColor: 'bg-yellow-600 border-yellow-500'
  },
  { 
    id: 'concert', 
    icon: Mic, 
    label: 'Conciertos', 
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/20 border-violet-400/30',
    activeColor: 'bg-violet-500 border-violet-400'
  },
  { 
    id: 'party', 
    icon: PartyPopper, 
    label: 'Fiestas', 
    color: 'from-fuchsia-500 to-pink-500',
    bgColor: 'bg-fuchsia-500/20 border-fuchsia-400/30',
    activeColor: 'bg-fuchsia-500 border-fuchsia-400'
  }
];

interface InterestFilterBarProps {
  selectedInterests: string[];
  onInterestToggle: (interestId: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const InterestFilterBar: React.FC<InterestFilterBarProps> = ({
  selectedInterests,
  onInterestToggle,
  onClearAll,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);
  
  // Mostrar solo los primeros 10 por defecto, todos si se hace clic en "Ver más"
  const visibleInterests = showAll ? INTEREST_CATEGORIES : INTEREST_CATEGORIES.slice(0, 10);

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Filtrar por Intereses</h3>
            <p className="text-sm text-gray-400">
              {selectedInterests.length > 0 
                ? `${selectedInterests.length} seleccionados`
                : 'Selecciona tus intereses favoritos'
              }
            </p>
          </div>
        </div>

        {selectedInterests.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClearAll}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Limpiar</span>
          </motion.button>
        )}
      </div>

      {/* Interest Icons Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mb-4">
        {visibleInterests.map((interest, index) => {
          const Icon = interest.icon;
          const isSelected = selectedInterests.includes(interest.id);
          
          return (
            <motion.button
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => onInterestToggle(interest.id)}
              className={`relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                isSelected 
                  ? `${interest.activeColor} text-white shadow-lg shadow-current/25` 
                  : `${interest.bgColor} text-gray-300 hover:border-opacity-50`
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon */}
              <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
              
              {/* Label */}
              <span className={`text-xs font-medium text-center leading-tight ${
                isSelected ? 'text-white' : 'text-gray-300'
              }`}>
                {interest.label}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </motion.div>
              )}

              {/* Hover effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${interest.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            </motion.button>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {INTEREST_CATEGORIES.length > 10 && (
        <div className="text-center">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 hover:bg-white/20 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm font-medium">
              {showAll ? 'Ver menos' : `Ver ${INTEREST_CATEGORIES.length - 10} más`}
            </span>
            <motion.div
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.button>
        </div>
      )}

      {/* Selected Interests Summary */}
      {selectedInterests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Intereses activos:</h4>
            <span className="text-xs text-gray-400">
              Mostrando eventos relacionados
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interestId) => {
              const interest = INTEREST_CATEGORIES.find(i => i.id === interestId);
              if (!interest) return null;
              
              const Icon = interest.icon;
              
              return (
                <div
                  key={interestId}
                  className={`inline-flex items-center space-x-2 px-3 py-1 ${interest.activeColor} rounded-full`}
                >
                  <Icon className="w-3 h-3 text-white" />
                  <span className="text-xs font-medium text-white">{interest.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

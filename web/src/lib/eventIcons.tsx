import React from 'react';
import {
  Music,
  Camera,
  Gamepad2,
  Book,
  Utensils,
  Dumbbell,
  Palette,
  Code,
  Briefcase,
  Users,
  Plane,
  GraduationCap,
  Stethoscope,
  TreePine,
  Shirt,
  Trophy,
  Heart,
  Coffee,
  Mic,
  PartyPopper,
  Building,
  Zap,
  Gift,
  Star,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Theater,
  Clapperboard,
  Brush,
  Scissors,
  Hammer,
  Wrench
} from 'lucide-react';

// Mapeo de categorías a iconos y colores
export const EVENT_CATEGORY_CONFIG = {
  // Entretenimiento
  music: {
    icon: Music,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400'
  },
  concert: {
    icon: Mic,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/20',
    textColor: 'text-violet-400'
  },
  party: {
    icon: PartyPopper,
    color: 'from-fuchsia-500 to-pink-500',
    bgColor: 'bg-fuchsia-500/20',
    textColor: 'text-fuchsia-400'
  },
  festival: {
    icon: Star,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400'
  },
  theater: {
    icon: Theater,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400'
  },
  
  // Deportes y Fitness
  sports: {
    icon: Trophy,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400'
  },
  fitness: {
    icon: Dumbbell,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/20',
    textColor: 'text-indigo-400'
  },
  
  // Tecnología
  technology: {
    icon: Code,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/20',
    textColor: 'text-cyan-400'
  },
  webinar: {
    icon: Monitor,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400'
  },
  conference: {
    icon: Building,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400'
  },
  
  // Arte y Creatividad
  art: {
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/20',
    textColor: 'text-pink-400'
  },
  photography: {
    icon: Camera,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400'
  },
  exhibition: {
    icon: Brush,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/20',
    textColor: 'text-rose-400'
  },
  
  // Educación y Desarrollo
  education: {
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400'
  },
  workshop: {
    icon: Hammer,
    color: 'from-yellow-600 to-orange-600',
    bgColor: 'bg-yellow-600/20',
    textColor: 'text-yellow-400'
  },
  seminar: {
    icon: Coffee,
    color: 'from-brown-500 to-orange-500',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400'
  },
  
  // Negocios y Networking
  business: {
    icon: Briefcase,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400'
  },
  networking: {
    icon: Users,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/20',
    textColor: 'text-teal-400'
  },
  meetup: {
    icon: Users,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400'
  },
  
  // Alimentación
  food: {
    icon: Utensils,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400'
  },
  cooking: {
    icon: Coffee,
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400'
  },
  
  // Viajes y Aventura
  travel: {
    icon: Plane,
    color: 'from-sky-500 to-blue-500',
    bgColor: 'bg-sky-500/20',
    textColor: 'text-sky-400'
  },
  outdoors: {
    icon: TreePine,
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-600/20',
    textColor: 'text-green-400'
  },
  
  // Salud y Bienestar
  health: {
    icon: Stethoscope,
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400'
  },
  
  // Otros
  gaming: {
    icon: Gamepad2,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400'
  },
  reading: {
    icon: Book,
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400'
  },
  fashion: {
    icon: Shirt,
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-600/20',
    textColor: 'text-purple-400'
  },
  volunteering: {
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/20',
    textColor: 'text-rose-400'
  },
  charity: {
    icon: Gift,
    color: 'from-red-400 to-pink-400',
    bgColor: 'bg-red-400/20',
    textColor: 'text-red-400'
  },
  competition: {
    icon: Trophy,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400'
  },
  
  // Default fallback
  default: {
    icon: Calendar,
    color: 'from-slate-500 to-gray-500',
    bgColor: 'bg-slate-500/20',
    textColor: 'text-slate-400'
  }
};

// Función para obtener el icono de un evento
export const getEventIcon = (category: string): React.ComponentType<{ className?: string }> => {
  const config = EVENT_CATEGORY_CONFIG[category as keyof typeof EVENT_CATEGORY_CONFIG];
  return config ? config.icon : EVENT_CATEGORY_CONFIG.default.icon;
};

// Función para obtener la configuración completa de un evento
export const getEventConfig = (category: string) => {
  return EVENT_CATEGORY_CONFIG[category as keyof typeof EVENT_CATEGORY_CONFIG] || EVENT_CATEGORY_CONFIG.default;
};

// Componente de icono de evento reutilizable
interface EventIconProps {
  category: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'outline' | 'gradient';
  className?: string;
}

export const EventIcon: React.FC<EventIconProps> = ({ 
  category, 
  size = 'md', 
  variant = 'filled',
  className = '' 
}) => {
  const config = getEventConfig(category);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  if (variant === 'outline') {
    return (
      <div className={`${containerSizes[size]} border-2 border-current rounded-lg flex items-center justify-center ${config.textColor} ${className}`}>
        <Icon className={sizeClasses[size]} />
      </div>
    );
  }
  
  if (variant === 'gradient') {
    return (
      <div className={`${containerSizes[size]} bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center text-white ${className}`}>
        <Icon className={sizeClasses[size]} />
      </div>
    );
  }
  
  // Default filled variant
  return (
    <div className={`${containerSizes[size]} ${config.bgColor} rounded-lg flex items-center justify-center ${config.textColor} ${className}`}>
      <Icon className={sizeClasses[size]} />
    </div>
  );
};

// Lista de todas las categorías disponibles
export const AVAILABLE_CATEGORIES = Object.keys(EVENT_CATEGORY_CONFIG).filter(key => key !== 'default');

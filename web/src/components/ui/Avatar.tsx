'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
  ring?: boolean;
  gradient?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20'
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500'
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  status,
  showStatus = false,
  className = '',
  onClick,
  ring = false,
  gradient = false
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const initials = React.useMemo(() => {
    if (fallback) {
      return fallback.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }
    return alt?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }, [fallback, alt]);

  const containerClasses = [
    sizeClasses[size],
    'relative inline-flex items-center justify-center rounded-full overflow-hidden',
    ring && 'ring-2 ring-white ring-offset-2 ring-offset-gray-100',
    gradient && 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
    !gradient && !src && 'bg-gray-200 dark:bg-gray-700',
    onClick && 'cursor-pointer hover:scale-105 transition-transform duration-200',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={containerClasses}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {src && !imageError ? (
        <>
          <motion.img
            src={src}
            alt={alt || 'Avatar'}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
        </>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${
          gradient ? 'text-white' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {initials ? (
            <span className={`font-medium ${
              size === 'xs' ? 'text-xs' :
              size === 'sm' ? 'text-sm' :
              size === 'md' ? 'text-base' :
              size === 'lg' ? 'text-lg' :
              size === 'xl' ? 'text-xl' : 'text-2xl'
            }`}>
              {initials}
            </span>
          ) : (
            <User className={`${
              size === 'xs' ? 'w-3 h-3' :
              size === 'sm' ? 'w-4 h-4' :
              size === 'md' ? 'w-5 h-5' :
              size === 'lg' ? 'w-6 h-6' :
              size === 'xl' ? 'w-8 h-8' : 'w-10 h-10'
            }`} />
          )}
        </div>
      )}

      {/* Status Indicator */}
      {showStatus && status && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            statusColors[status]
          } ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
        />
      )}
    </motion.div>
  );
};

// Avatar Group Component
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback?: string;
  }>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className = ''
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          ring
          className="hover:z-10"
        />
      ))}
      
      {remainingCount > 0 && (
        <div className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-white flex items-center justify-center z-10`}>
          <span className={`text-gray-600 dark:text-gray-300 font-medium ${
            size === 'xs' ? 'text-xs' :
            size === 'sm' ? 'text-xs' :
            size === 'md' ? 'text-sm' :
            size === 'lg' ? 'text-base' :
            size === 'xl' ? 'text-lg' : 'text-xl'
          }`}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

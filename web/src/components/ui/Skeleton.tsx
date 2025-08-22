'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== INTERFACES =====
interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'pulse' | 'wave' | 'shimmer';
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

interface SkeletonCardProps {
  type?: 'event' | 'tribe' | 'user' | 'notification';
  count?: number;
  className?: string;
}

// ===== SKELETON BASE =====
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'default',
  width,
  height,
  rounded = 'md'
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]}`;

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  switch (variant) {
    case 'pulse':
      return (
        <motion.div
          className={cn(baseClasses, className)}
          style={style}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      );

    case 'wave':
      return (
        <motion.div
          className={cn(baseClasses, 'relative overflow-hidden', className)}
          style={style}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      );

    case 'shimmer':
      return (
        <motion.div
          className={cn(baseClasses, 'relative overflow-hidden', className)}
          style={style}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      );

    default:
      return (
        <div
          className={cn(baseClasses, 'animate-pulse', className)}
          style={style}
        />
      );
  }
};

// ===== SKELETON PARA TARJETA DE EVENTO =====
export const EventCardSkeleton: React.FC<{ variant?: 'default' | 'compact' }> = ({ 
  variant = 'default' 
}) => {
  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <Skeleton width={48} height={48} rounded="lg" variant="shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="70%" variant="wave" />
            <Skeleton height={12} width="50%" variant="wave" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton height={14} width={60} variant="wave" />
            <Skeleton height={10} width={80} variant="wave" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Imagen */}
      <Skeleton height={192} variant="shimmer" />
      
      {/* Contenido */}
      <div className="p-6">
        <div className="space-y-3 mb-4">
          <Skeleton height={20} width="80%" variant="wave" />
          <Skeleton height={14} width="100%" variant="wave" />
          <Skeleton height={14} width="60%" variant="wave" />
        </div>
        
        <div className="space-y-2 mb-4">
          <Skeleton height={14} width="70%" variant="wave" />
          <Skeleton height={14} width="85%" variant="wave" />
          <Skeleton height={14} width="60%" variant="wave" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton width={32} height={32} rounded="full" variant="pulse" />
            <Skeleton height={12} width={80} variant="wave" />
          </div>
          <Skeleton height={32} width={100} rounded="md" variant="pulse" />
        </div>
      </div>
    </div>
  );
};

// ===== SKELETON PARA TARJETA DE TRIBU =====
export const TribeCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center space-x-4">
      <Skeleton width={64} height={64} rounded="lg" variant="shimmer" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton height={18} width="60%" variant="wave" />
          <Skeleton height={20} width={80} rounded="full" variant="pulse" />
        </div>
        <Skeleton height={14} width="90%" variant="wave" />
        <div className="flex items-center justify-between">
          <Skeleton height={12} width="40%" variant="wave" />
          <Skeleton height={28} width={60} rounded="md" variant="pulse" />
        </div>
      </div>
    </div>
  </div>
);

// ===== SKELETON PARA LISTA DE USUARIOS =====
export const UserListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3">
        <Skeleton width={40} height={40} rounded="full" variant="pulse" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="40%" variant="wave" />
          <Skeleton height={12} width="60%" variant="wave" />
        </div>
        <Skeleton height={28} width={70} rounded="md" variant="pulse" />
      </div>
    ))}
  </div>
);

// ===== SKELETON PARA NOTIFICACIONES =====
export const NotificationSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, index) => (
      <div key={index} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Skeleton width={36} height={36} rounded="full" variant="pulse" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="70%" variant="wave" />
          <Skeleton height={12} width="90%" variant="wave" />
          <Skeleton height={10} width="30%" variant="wave" />
        </div>
        <Skeleton width={16} height={16} variant="pulse" />
      </div>
    ))}
  </div>
);

// ===== SKELETON COMPUESTO =====
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  type = 'event', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'event':
        return <EventCardSkeleton />;
      case 'tribe':
        return <TribeCardSkeleton />;
      case 'user':
        return <UserListSkeleton count={1} />;
      case 'notification':
        return <NotificationSkeleton count={1} />;
      default:
        return <EventCardSkeleton />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
};

// ===== SKELETON PARA GRID =====
export const SkeletonGrid: React.FC<{
  type?: 'event' | 'tribe';
  columns?: 1 | 2 | 3 | 4;
  count?: number;
  className?: string;
}> = ({ 
  type = 'event', 
  columns = 3, 
  count = 6, 
  className = '' 
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {type === 'event' ? <EventCardSkeleton /> : <TribeCardSkeleton />}
        </motion.div>
      ))}
    </div>
  );
};
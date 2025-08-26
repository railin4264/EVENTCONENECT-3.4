'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  lines = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
      case 'pulse':
        return 'animate-pulse bg-gray-200';
      case 'none':
      default:
        return 'bg-gray-200';
    }
  };

  const baseClasses = [
    'bg-gray-200 dark:bg-gray-700',
    getVariantClasses(),
    getAnimationClasses(),
    className
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    width: width,
    height: height || (variant === 'text' ? '1rem' : undefined)
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={baseClasses}
            style={{
              ...style,
              width: index === lines - 1 ? '70%' : '100%'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

// Skeleton presets for common UI patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={14} className="mt-1" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={200} className="mb-4" />
    <Skeleton variant="text" lines={3} />
  </div>
);

export const SkeletonPost: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="text" width="50%" height={14} className="mt-1" />
      </div>
    </div>
    <Skeleton variant="text" lines={2} className="mb-4" />
    <Skeleton variant="rectangular" height={300} className="mb-4 rounded-lg" />
    <div className="flex items-center space-x-4">
      <Skeleton variant="text" width="15%" height={14} />
      <Skeleton variant="text" width="15%" height={14} />
      <Skeleton variant="text" width="15%" height={14} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`overflow-hidden bg-white dark:bg-gray-800 shadow rounded-lg ${className}`}>
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="20%" height={16} />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="20%" height={14} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  className?: string;
  showAvatar?: boolean;
}> = ({ 
  items = 3, 
  className = '',
  showAvatar = true
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <motion.div
        key={index}
        className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {showAvatar && <Skeleton variant="circular" width={48} height={48} />}
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={14} className="mt-2" />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} className="rounded" />
      </motion.div>
    ))}
  </div>
);

export const SkeletonProfile: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
    {/* Header */}
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton variant="circular" width={80} height={80} />
      <div className="flex-1">
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="text" width="60%" height={16} className="mt-2" />
        <div className="flex space-x-2 mt-3">
          <Skeleton variant="rectangular" width={80} height={32} className="rounded" />
          <Skeleton variant="rectangular" width={80} height={32} className="rounded" />
        </div>
      </div>
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="text-center">
          <Skeleton variant="text" width="50%" height={20} className="mx-auto" />
          <Skeleton variant="text" width="70%" height={14} className="mx-auto mt-1" />
        </div>
      ))}
    </div>
    
    {/* Bio */}
    <Skeleton variant="text" lines={3} />
  </div>
);

// Add shimmer animation to global CSS
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
  }
`;

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== LOADING SPINNER COMPONENT =====
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'neon' | 'gradient' | 'pulse';
  className?: string;
}> = ({ size = 'md', variant = 'default', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const spinnerVariants: Variants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'neon':
        return 'border-cyan-400 border-t-transparent';
      case 'gradient':
        return 'border-gradient-to-r from-cyan-400 to-purple-500 border-t-transparent';
      case 'pulse':
        return 'border-white/20 border-t-cyan-400';
      default:
        return 'border-white/20 border-t-cyan-400';
    }
  };

  return (
    <motion.div
      className={cn(
        'border-2 rounded-full',
        sizeClasses[size],
        getVariantStyles(),
        className
      )}
      variants={spinnerVariants}
      animate='spin'
    />
  );
};

// ===== LOADING DOTS COMPONENT =====
export const LoadingDots: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neon' | 'gradient';
  className?: string;
}> = ({ size = 'md', variant = 'default', className }) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'neon':
        return 'bg-cyan-400';
      case 'gradient':
        return 'bg-gradient-to-r from-cyan-400 to-purple-500';
      default:
        return 'bg-white/60';
    }
  };

  const dotVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          className={cn('rounded-full', sizeClasses[size], getVariantStyles())}
          variants={dotVariants}
          animate='animate'
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </div>
  );
};

// ===== LOADING BAR COMPONENT =====
export const LoadingBar: React.FC<{
  progress?: number;
  variant?: 'default' | 'neon' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ progress = 0, variant = 'default', size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'neon':
        return 'bg-cyan-400 shadow-cyan-400/50';
      case 'gradient':
        return 'bg-gradient-to-r from-cyan-400 to-purple-500';
      default:
        return 'bg-cyan-400';
    }
  };

  return (
    <div
      className={cn(
        'w-full bg-white/10 rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      <motion.div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          getVariantStyles()
        )}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

// ===== SKELETON COMPONENT =====
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'default' | 'pulse' | 'shimmer' | 'wave';
  animation?: 'none' | 'pulse' | 'shimmer' | 'wave';
}> = ({ className, variant = 'default', animation = 'pulse' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pulse':
        return 'bg-white/10 animate-pulse';
      case 'shimmer':
        return 'bg-gradient-to-r from-white/5 via-white/10 to-white/5';
      case 'wave':
        return 'bg-white/10';
      default:
        return 'bg-white/10 animate-pulse';
    }
  };

  const getAnimationStyles = () => {
    switch (animation) {
      case 'shimmer':
        return 'animate-shimmer';
      case 'wave':
        return 'animate-wave';
      case 'pulse':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg',
        getVariantStyles(),
        getAnimationStyles(),
        className
      )}
    />
  );
};

// ===== SKELETON CARD COMPONENT =====
export const SkeletonCard: React.FC<{
  variant?: 'default' | 'event' | 'user' | 'article';
  className?: string;
}> = ({ variant = 'default', className }) => {
  const getVariantContent = () => {
    switch (variant) {
      case 'event':
        return (
          <>
            <Skeleton className='w-full h-48 rounded-t-xl' />
            <div className='p-4 space-y-3'>
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-2/3' />
              <div className='flex space-x-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
              </div>
              <div className='flex justify-between items-center'>
                <Skeleton className='h-8 w-24' />
                <Skeleton className='h-8 w-20' />
              </div>
            </div>
          </>
        );

      case 'user':
        return (
          <div className='p-4 space-y-3'>
            <div className='flex items-center space-x-3'>
              <Skeleton className='w-12 h-12 rounded-full' />
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-2/3' />
                <Skeleton className='h-3 w-1/2' />
              </div>
            </div>
            <Skeleton className='h-4 w-full' />
            <div className='flex space-x-2'>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-8 w-24' />
            </div>
          </div>
        );

      case 'article':
        return (
          <div className='p-4 space-y-3'>
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-4 w-4/5' />
            <div className='flex justify-between items-center pt-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
        );

      default:
        return (
          <div className='p-4 space-y-3'>
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-8 w-24' />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden',
        className
      )}
    >
      {getVariantContent()}
    </div>
  );
};

// ===== SKELETON LIST COMPONENT =====
export const SkeletonList: React.FC<{
  count: number;
  variant?: 'default' | 'event' | 'user' | 'article';
  className?: string;
}> = ({ count, variant = 'default', className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <SkeletonCard variant={variant} />
        </motion.div>
      ))}
    </div>
  );
};

// ===== LOADING OVERLAY COMPONENT =====
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'blur' | 'dark';
  className?: string;
}> = ({ isLoading, children, variant = 'default', className }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'blur':
        return 'backdrop-blur-sm bg-white/5';
      case 'dark':
        return 'bg-black/50';
      default:
        return 'bg-white/10 backdrop-blur-sm';
    }
  };

  if (!isLoading) return <>{children}</>;

  return (
    <div className='relative'>
      {children}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center z-10',
          getVariantStyles(),
          className
        )}
      >
        <div className='text-center'>
          <LoadingSpinner size='lg' variant='neon' className='mb-4' />
          <p className='text-white/80 text-sm'>Cargando...</p>
        </div>
      </div>
    </div>
  );
};

// ===== LOADING BUTTON COMPONENT =====
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'neon' | 'gradient';
}> = ({ loading, children, className, variant = 'default' }) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'neon' && 'bg-cyan-500 text-white hover:bg-cyan-600',
        variant === 'gradient' &&
          'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600',
        variant === 'default' && 'bg-white/10 text-white hover:bg-white/20',
        className
      )}
      disabled={loading}
    >
      {loading && (
        <motion.div
          className='absolute inset-0 flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingSpinner size='sm' variant='neon' />
        </motion.div>
      )}

      <motion.div
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </button>
  );
};

// ===== INFINITE LOADING COMPONENT =====
export const InfiniteLoading: React.FC<{
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
}> = ({ hasMore, isLoading, onLoadMore, className }) => {
  if (!hasMore) return null;

  return (
    <div className={cn('text-center py-8', className)}>
      {isLoading ? (
        <div className='flex items-center justify-center space-x-3'>
          <LoadingSpinner size='md' variant='neon' />
          <span className='text-white/80'>Cargando más...</span>
        </div>
      ) : (
        <button
          onClick={onLoadMore}
          className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30'
        >
          Cargar Más
        </button>
      )}
    </div>
  );
};

// ===== PAGE LOADING COMPONENT =====
export const PageLoading: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center',
        'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
        className
      )}
    >
      <div className='text-center'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className='w-16 h-16 mx-auto mb-6'
        >
          <div className='w-full h-full border-4 border-cyan-400/30 border-t-cyan-400 rounded-full' />
        </motion.div>

        <h2 className='text-2xl font-bold text-white mb-2'>
          Cargando EventConnect
        </h2>
        <p className='text-gray-300'>Preparando tu experiencia...</p>

        <div className='mt-8'>
          <LoadingDots size='lg' variant='neon' />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

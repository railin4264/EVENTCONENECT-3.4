import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/router';
import { LoadingSpinner } from './Loading';
import { cn } from '@/lib/utils';

// ===== PAGE TRANSITION VARIANTS =====
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ===== SLIDE TRANSITIONS =====
export const slideVariants: Variants = {
  initial: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? -100 : 100,
    opacity: 0,
  }),
  in: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? 100 : -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// ===== FADE TRANSITIONS =====
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ===== SCALE TRANSITIONS =====
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  in: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ===== FLIP TRANSITIONS =====
export const flipVariants: Variants = {
  initial: {
    opacity: 0,
    rotateY: -90,
  },
  in: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: {
    opacity: 0,
    rotateY: 90,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ===== MAIN PAGE TRANSITION COMPONENT =====
export const PageTransition: React.FC<{
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'flip' | 'custom';
  direction?: 'left' | 'right';
  variants?: Variants;
  className?: string;
  mode?: 'wait' | 'sync' | 'popLayout';
}> = ({
  children,
  type = 'fade',
  direction = 'right',
  variants,
  className,
  mode = 'wait',
}) => {
  const getVariants = () => {
    if (variants) return variants;

    switch (type) {
      case 'slide':
        return slideVariants;
      case 'scale':
        return scaleVariants;
      case 'flip':
        return flipVariants;
      case 'custom':
        return pageVariants;
      default:
        return fadeVariants;
    }
  };

  const customVariants = getVariants();

  return (
    <motion.div
      variants={customVariants}
      initial='initial'
      animate='in'
      exit='out'
      custom={type === 'slide' ? direction : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ===== ROUTE TRANSITION WRAPPER =====
export const RouteTransition: React.FC<{
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'flip' | 'custom';
  direction?: 'left' | 'right';
  className?: string;
}> = ({ children, type = 'fade', direction = 'right', className }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <AnimatePresence mode='wait'>
      {isLoading ? (
        <motion.div
          key='loading'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        >
          <div className='text-center'>
            <LoadingSpinner size='xl' variant='neon' className='mb-6' />
            <h2 className='text-2xl font-bold text-white mb-2'>Cargando...</h2>
            <p className='text-gray-300'>Preparando tu experiencia</p>
          </div>
        </motion.div>
      ) : (
        <PageTransition
          key={router.asPath}
          type={type}
          direction={direction}
          className={className}
        >
          {children}
        </PageTransition>
      )}
    </AnimatePresence>
  );
};

// ===== STAGGERED CHILDREN TRANSITION =====
export const StaggeredTransition: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='show'
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ===== INTERSECTION TRANSITION =====
export const IntersectionTransition: React.FC<{
  children: React.ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'slideUp';
}> = ({
  children,
  threshold = 0.1,
  triggerOnce = true,
  className,
  animation = 'fade',
}) => {
  const [isInView, setIsInView] = React.useState(false);

  const getAnimationVariants = () => {
    switch (animation) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 },
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onViewportEnter={() => setIsInView(true)}
      onViewportLeave={() => !triggerOnce && setIsInView(false)}
      viewport={{ threshold, once: triggerOnce }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ===== HOVER TRANSITION =====
export const HoverTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  scale?: number;
  rotate?: number;
  y?: number;
}> = ({ children, className, scale = 1.05, rotate = 0, y = -5 }) => {
  return (
    <motion.div
      whileHover={{
        scale,
        rotate,
        y,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ===== TAP TRANSITION =====
export const TapTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  scale?: number;
}> = ({ children, className, scale = 0.95 }) => {
  return (
    <motion.div
      whileTap={{
        scale,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 10,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ===== LOADING TRANSITION =====
export const LoadingTransition: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
}> = ({ isLoading, children, className, variant = 'fade' }) => {
  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 },
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  return (
    <AnimatePresence mode='wait'>
      {isLoading ? (
        <motion.div
          key='loading'
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={getVariants()}
          transition={{ duration: 0.3 }}
          className={cn(
            'flex items-center justify-center min-h-[200px]',
            className
          )}
        >
          <LoadingSpinner size='lg' variant='neon' />
        </motion.div>
      ) : (
        <motion.div
          key='content'
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={getVariants()}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ===== PROGRESS TRANSITION =====
export const ProgressTransition: React.FC<{
  progress: number;
  children: React.ReactNode;
  className?: string;
}> = ({ progress, children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: progress > 0 ? 1 : 0,
        scale: progress > 0 ? 1 : 0.9,
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

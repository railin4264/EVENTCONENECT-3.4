import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== CARD INTERFACES =====
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'glass'
    | 'neon'
    | 'gradient'
    | 'elevated'
    | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  border?: boolean;
  shadow?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'none' | 'float' | 'pulse' | 'glow' | 'slideIn';
  delay?: number;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode;
  divider?: boolean;
}

// ===== ANIMATION VARIANTS =====
const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  hover: {
    y: -8,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  float: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  pulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  glow: {
    boxShadow: [
      '0 0 20px rgba(0, 212, 255, 0.3)',
      '0 0 40px rgba(0, 212, 255, 0.6)',
      '0 0 20px rgba(0, 212, 255, 0.3)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  slideIn: {
    opacity: [0, 1],
    x: [-50, 0],
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ===== MAIN CARD COMPONENT =====
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      hover = false,
      glow = false,
      border = true,
      shadow = true,
      rounded = 'lg',
      animation = 'none',
      delay = 0,
      children,
      ...props
    },
    ref
  ) => {
    // ===== BASE CLASSES =====
    const baseClasses = cn(
      // Base styles
      'relative overflow-hidden transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',

      // Size variants
      size === 'sm' && 'p-3',
      size === 'md' && 'p-4',
      size === 'lg' && 'p-6',
      size === 'xl' && 'p-8',

      // Border radius
      rounded === 'sm' && 'rounded-md',
      rounded === 'md' && 'rounded-lg',
      rounded === 'lg' && 'rounded-xl',
      rounded === 'xl' && 'rounded-2xl',
      rounded === 'full' && 'rounded-full',

      // Hover effects
      hover && 'cursor-pointer',

      // Shadow
      shadow && 'shadow-lg',

      className
    );

    // ===== VARIANT STYLES =====
    const variantClasses = {
      default: cn(
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'hover:bg-white/10 hover:border-white/20',
        shadow && 'hover:shadow-xl'
      ),

      glass: cn(
        'backdrop-blur-xl bg-white/10',
        'border border-white/20',
        'hover:backdrop-blur-2xl hover:bg-white/15',
        'hover:border-white/30',
        shadow && 'shadow-2xl hover:shadow-3xl'
      ),

      neon: cn(
        'bg-black/80 border border-cyan-400/50',
        'hover:border-cyan-400 hover:bg-black/90',
        glow && 'shadow-cyan-500/25',
        'hover:shadow-cyan-500/50'
      ),

      gradient: cn(
        'bg-gradient-to-br from-cyan-500/20 to-purple-600/20',
        'border border-cyan-400/30',
        'hover:from-cyan-500/30 hover:to-purple-600/30',
        'hover:border-cyan-400/50'
      ),

      elevated: cn(
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'shadow-2xl hover:shadow-3xl',
        'hover:bg-white/10 hover:border-white/20'
      ),

      interactive: cn(
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'cursor-pointer',
        'hover:bg-white/15 hover:border-white/30',
        'hover:scale-105 hover:rotate-1',
        'active:scale-95 active:rotate-0',
        'transition-all duration-300 ease-out'
      ),
    };

    // ===== ANIMATION CONFIG =====
    const animationConfig = {
      initial: animation !== 'none' ? 'initial' : false,
      animate: animation !== 'none' ? 'animate' : false,
      whileHover: hover ? 'hover' : undefined,
      variants: cardVariants,
      custom: delay,
    };

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant])}
        {...animationConfig}
        {...props}
      >
        {/* Background gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300' />

        {/* Neon border effect for neon variant */}
        {variant === 'neon' && (
          <div className='absolute inset-0 rounded-inherit bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300' />
        )}

        {/* Content */}
        <div className='relative z-10'>{children}</div>

        {/* Ripple effect on click for interactive cards */}
        {variant === 'interactive' && (
          <motion.div
            className='absolute inset-0 rounded-inherit bg-white/10'
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// ===== CARD HEADER COMPONENT =====
export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  icon,
  badge,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-start justify-between mb-4', className)}
      {...props}
    >
      <div className='flex items-center space-x-3'>
        {icon && (
          <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white'>
            {icon}
          </div>
        )}
        <div className='flex-1'>{children}</div>
      </div>
      {badge && <div className='flex-shrink-0'>{badge}</div>}
    </div>
  );
};

// ===== CARD TITLE COMPONENT =====
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-white mb-1',
        'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

// ===== CARD SUBTITLE COMPONENT =====
export const CardSubtitle: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, children, ...props }) => {
  return (
    <p className={cn('text-sm text-gray-300', className)} {...props}>
      {children}
    </p>
  );
};

// ===== CARD CONTENT COMPONENT =====
export const CardContent: React.FC<CardContentProps> = ({
  className,
  padding = 'md',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-2 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-4',
  };

  return (
    <div
      className={cn('text-gray-300', paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};

// ===== CARD FOOTER COMPONENT =====
export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  actions,
  divider = true,
  children,
  ...props
}) => {
  return (
    <div className={cn('mt-4', className)} {...props}>
      {divider && <div className='border-t border-white/10 mb-4' />}
      <div className='flex items-center justify-between'>
        <div className='flex-1'>{children}</div>
        {actions && (
          <div className='flex items-center space-x-2'>{actions}</div>
        )}
      </div>
    </div>
  );
};

// ===== CARD BADGE COMPONENT =====
export const CardBadge: React.FC<{
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error';
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'primary', children, className }) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    secondary: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white',
    accent: 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
    error: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// ===== EXPORT ALL CARD COMPONENTS =====
export default Card;

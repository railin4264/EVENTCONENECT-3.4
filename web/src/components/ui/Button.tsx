import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== BUTTON VARIANTS =====
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'outline'
    | 'ghost'
    | 'glass'
    | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  glow?: boolean;
  pulse?: boolean;
}

// ===== ANIMATION VARIANTS =====
const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  tap: {
    scale: 0.95,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  loading: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
};

// ===== BUTTON COMPONENT =====
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      rounded = 'lg',
      glow = false,
      pulse = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // ===== BASE CLASSES =====
    const baseClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center font-semibold',
      'transition-all duration-300 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transform-gpu',

      // Size variants
      size === 'sm' && 'px-3 py-2 text-sm',
      size === 'md' && 'px-4 py-2.5 text-base',
      size === 'lg' && 'px-6 py-3 text-lg',
      size === 'xl' && 'px-8 py-4 text-xl',

      // Width
      fullWidth ? 'w-full' : 'w-auto',

      // Border radius
      rounded === 'sm' && 'rounded-md',
      rounded === 'md' && 'rounded-lg',
      rounded === 'lg' && 'rounded-xl',
      rounded === 'full' && 'rounded-full',

      // Glow effects
      glow && 'shadow-lg',
      glow && variant === 'primary' && 'shadow-cyan-500/25',
      glow && variant === 'secondary' && 'shadow-purple-500/25',
      glow && variant === 'accent' && 'shadow-orange-500/25',

      // Pulse animation
      pulse && 'animate-pulse-neon',

      className
    );

    // ===== VARIANT STYLES =====
    const variantClasses = {
      primary: cn(
        'bg-gradient-to-r from-cyan-500 to-blue-600',
        'hover:from-cyan-600 hover:to-blue-700',
        'text-white border-0',
        'focus:ring-cyan-500/50',
        glow && 'shadow-cyan-500/25 hover:shadow-cyan-500/40'
      ),

      secondary: cn(
        'bg-gradient-to-r from-purple-500 to-pink-600',
        'hover:from-purple-600 hover:to-pink-700',
        'text-white border-0',
        'focus:ring-purple-500/50',
        glow && 'shadow-purple-500/25 hover:shadow-purple-500/40'
      ),

      accent: cn(
        'bg-gradient-to-r from-orange-500 to-red-600',
        'hover:from-orange-600 hover:to-red-700',
        'text-white border-0',
        'focus:ring-orange-500/50',
        glow && 'shadow-orange-500/25 hover:shadow-orange-500/40'
      ),

      outline: cn(
        'bg-transparent border-2',
        'border-cyan-400 text-cyan-400',
        'hover:bg-cyan-400 hover:text-white',
        'focus:ring-cyan-500/50',
        'hover:shadow-cyan-500/25'
      ),

      ghost: cn(
        'bg-transparent text-cyan-400',
        'hover:bg-cyan-400/10',
        'focus:ring-cyan-500/50'
      ),

      glass: cn(
        'backdrop-blur-md bg-white/10',
        'border border-white/20 text-white',
        'hover:bg-white/20 hover:border-white/30',
        'focus:ring-white/50',
        'shadow-lg hover:shadow-xl'
      ),

      neon: cn(
        'bg-black border border-cyan-400 text-cyan-400',
        'hover:bg-cyan-400 hover:text-black',
        'focus:ring-cyan-500/50',
        'shadow-cyan-500/25 hover:shadow-cyan-500/50',
        'animate-glow'
      ),
    };

    // ===== LOADING SPINNER =====
    const LoadingSpinner = () => (
      <motion.div
        className='w-4 h-4 border-2 border-current border-t-transparent rounded-full'
        animate='loading'
        variants={buttonVariants}
      />
    );

    // ===== ICON WRAPPER =====
    const IconWrapper = ({
      children,
      position,
    }: {
      children: React.ReactNode;
      position: 'left' | 'right';
    }) => (
      <span
        className={cn(
          'inline-flex items-center',
          position === 'left' && 'mr-2',
          position === 'right' && 'ml-2'
        )}
      >
        {children}
      </span>
    );

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant])}
        variants={buttonVariants}
        initial='initial'
        whileHover={!disabled && !loading ? 'hover' : undefined}
        whileTap={!disabled && !loading ? 'tap' : undefined}
        disabled={disabled || loading}
        {...props}
      >
        {/* Background gradient overlay for extra depth */}
        <div className='absolute inset-0 rounded-inherit bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300' />

        {/* Content */}
        <div className='relative flex items-center justify-center'>
          {/* Left Icon */}
          {icon && iconPosition === 'left' && !loading && (
            <IconWrapper position='left'>{icon}</IconWrapper>
          )}

          {/* Loading Spinner */}
          {loading && <LoadingSpinner />}

          {/* Text Content */}
          {!loading && children}

          {/* Right Icon */}
          {icon && iconPosition === 'right' && !loading && (
            <IconWrapper position='right'>{icon}</IconWrapper>
          )}
        </div>

        {/* Ripple effect on click */}
        <motion.div
          className='absolute inset-0 rounded-inherit bg-white/20'
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ===== BUTTON GROUP COMPONENT =====
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        orientation === 'horizontal'
          ? 'divide-x divide-white/20'
          : 'divide-y divide-white/20',
        'rounded-lg overflow-hidden border border-white/20',
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'first:rounded-t-none last:rounded-b-none',
            orientation === 'horizontal' &&
              'first:rounded-l-lg last:rounded-r-lg',
            orientation === 'vertical' && 'first:rounded-t-lg last:rounded-b-lg'
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// ===== EXPORT ALL BUTTON COMPONENTS =====
export default Button;

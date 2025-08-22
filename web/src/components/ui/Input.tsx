import React, { forwardRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== INPUT INTERFACES =====
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass' | 'neon' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  glow?: boolean;
  animated?: boolean;
  floating?: boolean;
}

// ===== ANIMATION VARIANTS =====
const inputVariants: Variants = {
  initial: { scale: 1 },
  focus: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.3 },
  },
  success: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 },
  },
};

const labelVariants: Variants = {
  initial: { y: 0, scale: 1, color: '#9ca3af' },
  focus: {
    y: -8,
    scale: 0.85,
    color: '#06b6d4',
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  filled: {
    y: -8,
    scale: 0.85,
    color: '#06b6d4',
  },
};

// ===== MAIN INPUT COMPONENT =====
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      error,
      success,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      rounded = 'lg',
      glow = false,
      animated = true,
      floating = false,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      !!props.value || !!props.defaultValue
    );

    // ===== BASE CLASSES =====
    const baseClasses = cn(
      // Base styles
      'relative transition-all duration-300 ease-out',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',

      // Width
      fullWidth ? 'w-full' : 'w-auto',

      // Border radius
      rounded === 'sm' && 'rounded-md',
      rounded === 'lg' && 'rounded-lg',
      rounded === 'lg' && 'rounded-xl',
      rounded === 'xl' && 'rounded-2xl',
      rounded === 'full' && 'rounded-full',

      // Glow effects
      glow && 'shadow-lg',
      glow && variant === 'neon' && 'shadow-cyan-500/25',
      glow && variant === 'glass' && 'shadow-white/25',

      className
    );

    // ===== INPUT STYLES =====
    const inputClasses = cn(
      // Base input styles
      'w-full transition-all duration-300',
      'placeholder:text-gray-400 placeholder:transition-colors',
      'focus:placeholder:text-transparent',

      // Size variants
      size === 'sm' && 'px-3 py-2 text-sm',
      size === 'md' && 'px-4 py-2.5 text-base',
      size === 'lg' && 'px-5 py-3 text-lg',
      size === 'xl' && 'px-6 py-4 text-xl',

      // Icon spacing
      icon && iconPosition === 'left' && size === 'sm' && 'pl-10',
      icon && iconPosition === 'left' && size === 'md' && 'pl-12',
      icon && iconPosition === 'left' && size === 'lg' && 'pl-14',
      icon && iconPosition === 'left' && size === 'xl' && 'pl-16',

      icon && iconPosition === 'right' && size === 'sm' && 'pr-10',
      icon && iconPosition === 'right' && size === 'md' && 'pr-12',
      icon && iconPosition === 'right' && size === 'lg' && 'pr-14',
      icon && iconPosition === 'right' && size === 'xl' && 'pr-16',

      // Text colors
      'text-white',
      'bg-transparent',

      // Border styles
      'border-2',
      'focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent'
    );

    // ===== VARIANT STYLES =====
    const variantClasses = {
      default: cn(
        'border-white/20',
        'hover:border-white/30',
        'focus:border-cyan-400 focus:ring-cyan-400/50',
        'bg-white/5 backdrop-blur-sm',
        'hover:bg-white/10'
      ),

      glass: cn(
        'border-white/20',
        'hover:border-white/30',
        'focus:border-cyan-400 focus:ring-cyan-400/50',
        'backdrop-blur-xl bg-white/10',
        'hover:backdrop-blur-2xl hover:bg-white/15'
      ),

      neon: cn(
        'border-cyan-400/50',
        'hover:border-cyan-400',
        'focus:border-cyan-400 focus:ring-cyan-400/50',
        'bg-black/80',
        'hover:bg-black/90',
        glow && 'shadow-cyan-500/25 hover:shadow-cyan-500/50'
      ),

      gradient: cn(
        'border-transparent',
        'bg-gradient-to-r from-cyan-500/20 to-purple-600/20',
        'hover:from-cyan-500/30 hover:to-purple-600/30',
        'focus:from-cyan-500/40 focus:to-purple-600/40',
        'focus:ring-cyan-400/50'
      ),

      outline: cn(
        'border-cyan-400/50',
        'hover:border-cyan-400',
        'focus:border-cyan-400 focus:ring-cyan-400/50',
        'bg-transparent',
        'hover:bg-cyan-400/5'
      ),
    };

    // ===== LABEL STYLES =====
    const labelClasses = cn(
      'absolute left-0 pointer-events-none transition-all duration-300',
      'origin-left',

      // Size positioning
      size === 'sm' && 'px-3 py-2 text-sm',
      size === 'md' && 'px-4 py-2.5 text-base',
      size === 'lg' && 'px-5 py-3 text-lg',
      size === 'xl' && 'px-6 py-4 text-xl',

      // Icon adjustment
      icon && iconPosition === 'left' && size === 'sm' && 'left-10',
      icon && iconPosition === 'left' && size === 'md' && 'left-12',
      icon && iconPosition === 'left' && size === 'lg' && 'left-14',
      icon && iconPosition === 'left' && size === 'xl' && 'left-16',

      // Default state
      !floating && 'text-gray-400',
      floating && 'text-gray-400'
    );

    // ===== ICON STYLES =====
    const iconClasses = cn(
      'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
      'transition-colors duration-300',
      'group-focus-within:text-cyan-400',

      // Icon positioning
      iconPosition === 'left' && size === 'sm' && 'left-3',
      iconPosition === 'left' && size === 'md' && 'left-4',
      iconPosition === 'left' && size === 'lg' && 'left-5',
      iconPosition === 'left' && size === 'xl' && 'left-6',

      iconPosition === 'right' && size === 'sm' && 'right-3',
      iconPosition === 'right' && size === 'md' && 'right-4',
      iconPosition === 'right' && size === 'lg' && 'right-5',
      iconPosition === 'right' && size === 'xl' && 'right-6'
    );

    // ===== EVENT HANDLERS =====
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      onChange?.(e);
    };

    // ===== ANIMATION CONFIG =====
    const animationConfig = animated
      ? {
          variants: inputVariants,
          initial: 'initial',
          whileFocus: 'focus',
          animate: error ? 'error' : success ? 'success' : 'initial',
        }
      : {};

    const labelAnimationConfig = animated
      ? {
          variants: labelVariants,
          initial: 'initial',
          animate: isFocused || hasValue ? 'focus' : 'initial',
        }
      : {};

    return (
      <div className={cn('group relative', baseClasses)}>
        {/* Input Element */}
        <motion.input
          ref={ref}
          className={cn(inputClasses, variantClasses[variant])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...animationConfig}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <motion.label className={cn(labelClasses)} {...labelAnimationConfig}>
            {label}
          </motion.label>
        )}

        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={cn(iconClasses, 'left-0')}>{icon}</div>
        )}

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className={cn(iconClasses, 'right-0')}>{icon}</div>
        )}

        {/* Success Icon */}
        {success && (
          <motion.div
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </motion.div>
        )}

        {/* Error Icon */}
        {error && (
          <motion.div
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </motion.div>
        )}

        {/* Background gradient overlay for glass effect */}
        {variant === 'glass' && (
          <div className='absolute inset-0 rounded-inherit bg-gradient-to-r from-white/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none' />
        )}

        {/* Neon border effect for neon variant */}
        {variant === 'neon' && (
          <div className='absolute inset-0 rounded-inherit bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none' />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ===== INPUT GROUP COMPONENT =====
interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex',
        'divide-x divide-white/20',
        'rounded-lg overflow-hidden border border-white/20',
        'bg-white/5 backdrop-blur-sm',
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'flex-1',
            'first:rounded-l-lg last:rounded-r-lg',
            'focus-within:z-10 focus-within:ring-2 focus-within:ring-cyan-500/50'
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// ===== EXPORT ALL INPUT COMPONENTS =====
export default Input;

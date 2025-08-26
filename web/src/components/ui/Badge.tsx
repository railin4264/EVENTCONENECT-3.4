'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  pulse?: boolean;
  gradient?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
};

const gradientClasses = {
  default: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
  warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
  danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
  info: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
  outline: 'border-2 border-gradient-to-r from-blue-500 to-purple-600 text-blue-600',
  ghost: 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  removable = false,
  onRemove,
  pulse = false,
  gradient = false,
  icon
}) => {
  const baseClasses = [
    'inline-flex items-center font-medium rounded-full transition-all duration-200',
    gradient ? gradientClasses[variant] : variantClasses[variant],
    sizeClasses[size],
    pulse && 'animate-pulse',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.span
      className={baseClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {icon && (
        <span className={`${size === 'sm' ? 'mr-1' : 'mr-1.5'} flex items-center`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {removable && onRemove && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`${size === 'sm' ? 'ml-1' : 'ml-1.5'} flex items-center hover:bg-black/10 rounded-full p-0.5 transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        </motion.button>
      )}
    </motion.span>
  );
};

// Notification Badge Component
export interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  max = 99,
  showZero = false,
  dot = false,
  className = '',
  children
}) => {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count.toString();

  if (!shouldShow && !dot) return <>{children}</>;

  return (
    <div className={`relative inline-flex ${className}`}>
      {children}
      {shouldShow && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -top-1 -right-1 flex items-center justify-center ${
            dot 
              ? 'w-2 h-2' 
              : count > 99 
                ? 'min-w-[1.25rem] h-5 px-1' 
                : 'w-5 h-5'
          } text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white`}
        >
          {!dot && displayCount}
        </motion.span>
      )}
    </div>
  );
};

// Status Badge Component
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-green-500', text: 'En línea' },
  offline: { color: 'bg-gray-500', text: 'Desconectado' },
  away: { color: 'bg-yellow-500', text: 'Ausente' },
  busy: { color: 'bg-red-500', text: 'Ocupado' },
  invisible: { color: 'bg-gray-400', text: 'Invisible' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  className = ''
}) => {
  const config = statusConfig[status];
  const displayText = text || config.text;

  return (
    <Badge
      variant="ghost"
      size={size}
      className={`${className} bg-white/90 backdrop-blur-sm border border-gray-200`}
      icon={
        <motion.div
          className={`w-2 h-2 rounded-full ${config.color}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      }
    >
      {displayText}
    </Badge>
  );
};

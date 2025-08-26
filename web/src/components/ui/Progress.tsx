'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
};

const variantClasses = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className = '',
  animated = true,
  striped = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progreso'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full relative overflow-hidden ${
            striped ? 'bg-stripes' : ''
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        >
          {striped && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                animation: animated ? 'slide 1s linear infinite' : 'none'
              }}
            />
          )}
          
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-8"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Circular Progress Component
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  label,
  className = '',
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    default: 'stroke-blue-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
    gradient: 'stroke-purple-500'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colorClasses[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset,
            strokeDasharray
          }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        />
        
        {variant === 'gradient' && (
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        )}
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(percentage)}%
            </div>
            {label && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {label}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Multi-step Progress Component
export interface StepProgressProps {
  steps: Array<{
    label: string;
    status: 'completed' | 'current' | 'pending';
    description?: string;
  }>;
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'current'
                    ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-600'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {step.status === 'completed' ? (
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  step.status === 'current' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                steps[index + 1].status === 'completed' || step.status === 'completed'
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

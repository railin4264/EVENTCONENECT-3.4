import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TOAST INTERFACES =====
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'default';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'glass' | 'neon' | 'gradient';
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// ===== ANIMATION VARIANTS =====
const toastVariants: Variants = {
  initial: (position: string) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    
    if (isTop) {
      return { 
        opacity: 0, 
        y: -100, 
        scale: 0.8,
        x: isLeft ? -50 : isRight ? 50 : 0
      };
    } else {
      return { 
        opacity: 0, 
        y: 100, 
        scale: 0.8,
        x: isLeft ? -50 : isRight ? 50 : 0
      };
    }
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: (position: string) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    
    if (isTop) {
      return { 
        opacity: 0, 
        y: -100, 
        scale: 0.8,
        x: isLeft ? -50 : isRight ? 50 : 0,
        transition: {
          duration: 0.2
        }
      };
    } else {
      return { 
        opacity: 0, 
        y: 100, 
        scale: 0.8,
        x: isLeft ? -50 : isRight ? 50 : 0,
        transition: {
          duration: 0.2
        }
      };
    }
  }
};

// ===== TOAST ICONS =====
const getToastIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-400" />;
    default:
      return <Bell className="w-5 h-5 text-cyan-400" />;
  }
};

// ===== TOAST COMPONENT =====
const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // ===== AUTO-DISMISS LOGIC =====
  useEffect(() => {
    if (toast.duration === 0) return; // Infinite toast
    
    const duration = toast.duration || 5000;
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;
      
      if (newProgress <= 0) {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
        return;
      }
      
      setProgress(newProgress);
      requestAnimationFrame(updateProgress);
    };
    
    requestAnimationFrame(updateProgress);
  }, [toast.duration, toast.id, onRemove]);

  // ===== VARIANT STYLES =====
  const getVariantStyles = () => {
    switch (toast.variant) {
      case 'glass':
        return 'backdrop-blur-xl bg-white/10 border border-white/20';
      case 'neon':
        return 'bg-black/80 border border-cyan-400/50 shadow-cyan-500/25';
      case 'gradient':
        return 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30';
      default:
        return 'bg-white/5 backdrop-blur-sm border border-white/10';
    }
  };

  // ===== TYPE STYLES =====
  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-4 border-l-green-400';
      case 'error':
        return 'border-l-4 border-l-red-400';
      case 'warning':
        return 'border-l-4 border-l-yellow-400';
      case 'info':
        return 'border-l-4 border-l-blue-400';
      default:
        return 'border-l-4 border-l-cyan-400';
    }
  };

  return (
    <motion.div
      custom={toast.position}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <div className={cn(
        'relative overflow-hidden rounded-xl shadow-2xl',
        'transform-gpu transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-3xl',
        getVariantStyles(),
        getTypeStyles()
      )}>
        {/* Progress Bar */}
        {toast.duration !== 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}

        {/* Toast Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getToastIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-sm text-gray-300 leading-relaxed">
                  {toast.message}
                </p>
              )}
              
              {/* Action Button */}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onRemove(toast.id), 300);
              }}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

// ===== TOAST CONTAINER =====
const ToastContainer: React.FC<{
  toasts: Toast[];
  position: Toast['position'];
  onRemove: (id: string) => void;
}> = ({ toasts, position, onRemove }) => {
  const filteredToasts = toasts.filter(toast => toast.position === position);
  
  if (filteredToasts.length === 0) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={cn(
      'fixed z-50 w-96 max-w-sm',
      getPositionClasses()
    )}>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredToasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ===== TOAST CONTEXT =====
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ===== TOAST PROVIDER =====
export const ToastProvider: React.FC<{
  children: React.ReactNode;
  defaultPosition?: Toast['position'];
}> = ({ children, defaultPosition = 'top-right' }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      position: toast.position || defaultPosition,
      duration: toast.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, [defaultPosition]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const positions: Toast['position'][] = [
    'top-left',
    'top-right', 
    'top-center',
    'bottom-left',
    'bottom-right',
    'bottom-center'
  ];

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      
      {/* Toast Containers */}
      {positions.map(position => (
        <ToastContainer
          key={position}
          toasts={toasts}
          position={position}
          onRemove={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
};

// ===== TOAST FUNCTIONS =====
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    // This will be used by the provider
    return { type: 'success' as const, title, message, ...options };
  },
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    return { type: 'error' as const, title, message, ...options };
  },
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    return { type: 'warning' as const, title, message, ...options };
  },
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    return { type: 'info' as const, title, message, ...options };
  },
  default: (title: string, message?: string, options?: Partial<Toast>) => {
    return { type: 'default' as const, title, message, ...options };
  },
};

export default ToastProvider;
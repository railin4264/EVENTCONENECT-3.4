import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== MODAL INTERFACES =====
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'neon' | 'gradient' | 'elevated';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
}

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export interface ModalContentProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  divider?: boolean;
  className?: string;
}

// ===== ANIMATION VARIANTS =====
const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    rotateX: -15,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    rotateX: -15,
    transition: {
      duration: 0.2,
    },
  },
};

// ===== MODAL ICONS =====
const getModalIcon = (variant?: string) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className='w-6 h-6 text-green-400' />;
    case 'error':
      return <AlertCircle className='w-6 h-6 text-red-400' />;
    case 'warning':
      return <AlertTriangle className='w-6 h-6 text-yellow-400' />;
    case 'info':
      return <Info className='w-6 h-6 text-blue-400' />;
    default:
      return null;
  }
};

// ===== MAIN MODAL COMPONENT =====
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
}) => {
  // ===== ESCAPE KEY HANDLER =====
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // ===== OVERLAY CLICK HANDLER =====
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // ===== SIZE CLASSES =====
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  // ===== VARIANT STYLES =====
  const variantClasses = {
    default: 'bg-white/5 backdrop-blur-sm border border-white/10',
    glass: 'backdrop-blur-xl bg-white/10 border border-white/20',
    neon: 'bg-black/80 border border-cyan-400/50 shadow-cyan-500/25',
    gradient:
      'bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/30',
    elevated: 'bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-black/60 backdrop-blur-sm',
            overlayClassName
          )}
          variants={overlayVariants}
          initial='initial'
          animate='animate'
          exit='exit'
          onClick={handleOverlayClick}
        >
          {/* Background particles effect */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className='absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20'
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Modal Content */}
          <motion.div
            className={cn(
              'relative w-full rounded-2xl overflow-hidden',
              'transform-gpu perspective-1000',
              sizeClasses[size],
              variantClasses[variant],
              className
            )}
            variants={modalVariants}
            initial='initial'
            animate='animate'
            exit='exit'
          >
            {/* Background gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300' />

            {/* Neon border effect for neon variant */}
            {variant === 'neon' && (
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300' />
            )}

            {/* Content */}
            <div className='relative z-10'>{children}</div>

            {/* Close button overlay */}
            {showCloseButton && (
              <motion.button
                onClick={onClose}
                className='absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-white hover:bg-black/40 hover:border-white/40 transition-all duration-200 flex items-center justify-center'
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className='w-4 h-4' />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ===== MODAL HEADER COMPONENT =====
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  showCloseButton = true,
  className,
}) => {
  return (
    <div className={cn('p-6 pb-4', className)}>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          {icon && (
            <div className='flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg'>
              {icon}
            </div>
          )}
          <div className='flex-1'>
            <h2 className='text-xl font-semibold text-white mb-1'>{title}</h2>
            {subtitle && <p className='text-sm text-gray-300'>{subtitle}</p>}
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className='flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center text-white'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    </div>
  );
};

// ===== MODAL CONTENT COMPONENT =====
export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  padding = 'md',
  className,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-6 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  };

  return (
    <div className={cn('text-gray-300', paddingClasses[padding], className)}>
      {children}
    </div>
  );
};

// ===== MODAL FOOTER COMPONENT =====
export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  actions,
  divider = true,
  className,
}) => {
  return (
    <div className={cn('p-6 pt-4', className)}>
      {divider && <div className='border-t border-white/10 mb-4' />}
      <div className='flex items-center justify-between'>
        <div className='flex-1'>{children}</div>
        {actions && (
          <div className='flex items-center space-x-3'>{actions}</div>
        )}
      </div>
    </div>
  );
};

// ===== ALERT MODAL COMPONENT =====
export const AlertModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  actions?: React.ReactNode;
}> = ({ isOpen, onClose, title, message, type = 'info', actions }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='sm'
      variant='glass'
      closeOnOverlayClick={false}
    >
      <ModalHeader
        title={title}
        icon={getModalIcon(type)}
        showCloseButton={false}
      />
      <ModalContent>
        <p className='text-gray-300 leading-relaxed'>{message}</p>
      </ModalContent>
      <ModalFooter>
        {actions || (
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200'
          >
            Entendido
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
};

// ===== CONFIRM MODAL COMPONENT =====
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700';
      case 'warning':
        return 'from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700';
      default:
        return 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='sm'
      variant='glass'
      closeOnOverlayClick={false}
    >
      <ModalHeader
        title={title}
        icon={getModalIcon(variant)}
        showCloseButton={false}
      />
      <ModalContent>
        <p className='text-gray-300 leading-relaxed'>{message}</p>
      </ModalContent>
      <ModalFooter>
        <button
          onClick={onClose}
          className='px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-200'
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            'px-4 py-2 bg-gradient-to-r text-white rounded-lg transition-all duration-200',
            getVariantStyles()
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default Modal;

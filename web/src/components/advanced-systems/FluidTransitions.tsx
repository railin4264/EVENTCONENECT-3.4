'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface MorphingCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'expand' | 'transform' | 'breathing';
  onExpand?: () => void;
  expanded?: boolean;
}

export const MorphingCard: React.FC<MorphingCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onExpand,
  expanded = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  const scale = useMotionValue(1);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const z = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springScale = useSpring(scale, springConfig);
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springZ = useSpring(z, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateXValue = (mouseY / (rect.height / 2)) * -10;
    const rotateYValue = (mouseX / (rect.width / 2)) * 10;
    
    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
    z.set(20);
  };

  const handleMouseLeave = () => {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    z.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    scale.set(1.05);
    setIsHovered(true);
  };

  const handleClick = () => {
    if (variant === 'expand' && onExpand) {
      setIsExpanded(!isExpanded);
      onExpand();
    }
  };

  const breathingAnimation = variant === 'breathing' ? {
    animate: {
      scale: [1, 1.02, 1],
      boxShadow: [
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  } : {};

  const expandAnimation = isExpanded ? {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
    borderRadius: 0
  } : {};

  return (
    <motion.div
      ref={(node) => {
        cardRef.current = node;
        inViewRef(node);
      }}
      className={`relative overflow-hidden ${className}`}
      style={{
        scale: springScale,
        rotateX: springRotateX,
        rotateY: springRotateY,
        z: springZ,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 50 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      {...breathingAnimation}
      animate={isExpanded ? expandAnimation : breathingAnimation.animate}
    >
      {/* Efecto de brillo en hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Contenido principal */}
      <motion.div
        className="relative z-10 h-full"
        animate={{
          filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      
      {/* Sombra dinámica */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: useTransform(
            [springScale, springZ],
            ([s, z]) => `0 ${z * 2}px ${z * 4}px rgba(0, 0, 0, ${0.1 + s * 0.05})`
          )
        }}
      />
    </motion.div>
  );
};

interface FluidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'expand' | 'morph';
  className?: string;
  expandedContent?: React.ReactNode;
}

export const FluidButton: React.FC<FluidButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  className = '',
  expandedContent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (variant === 'expand') {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  const expandAnimation = variant === 'expand' && isExpanded ? {
    width: '300px',
    height: '200px',
    borderRadius: '20px'
  } : {};

  const morphAnimation = variant === 'morph' && isHovered ? {
    borderRadius: '50%',
    scale: 1.1
  } : {};

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        ...expandAnimation,
        ...morphAnimation
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300
      }}
    >
      {/* Contenido principal */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-full"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center h-full p-4"
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Efecto de ondas */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.8 }}
      />
    </motion.button>
  );
};

interface BreathingElementProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  duration?: number;
}

export const BreathingElement: React.FC<BreathingElementProps> = ({
  children,
  className = '',
  intensity = 0.02,
  duration = 3
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1 + intensity, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

interface WaterFlowNavigationProps {
  children: React.ReactNode;
  className?: string;
}

export const WaterFlowNavigation: React.FC<WaterFlowNavigationProps> = ({
  children,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Indicador fluido */}
      <motion.div
        className="absolute bottom-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
        layoutId="activeTab"
        initial={false}
        animate={{
          width: '100%',
          x: `${activeIndex * 100}%`
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300
        }}
      />
      
      {/* Elementos de navegación */}
      <div className="flex">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            className="flex-1 cursor-pointer"
            onClick={() => handleItemClick(index)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
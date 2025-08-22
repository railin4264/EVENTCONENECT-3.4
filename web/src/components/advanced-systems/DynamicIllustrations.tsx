import React from 'react';
import { motion } from 'framer-motion';

interface DynamicIllustrationProps {
  type?: 'geometric' | 'organic' | 'abstract';
  theme?: 'default' | 'neon' | 'elegant';
  className?: string;
}

export const DynamicIllustration: React.FC<DynamicIllustrationProps> = ({
  type = 'geometric',
  theme = 'default',
  className = ''
}) => {
  const themeColors = {
    default: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#8b5cf6'
    },
    neon: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00'
    },
    elegant: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      accent: '#cbd5e1'
    }
  };

  const colors = themeColors[theme];

  const renderGeometric = () => (
    <div className="relative w-full h-full">
      {/* Animated circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full opacity-20"
        style={{ backgroundColor: colors.primary }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full opacity-30"
        style={{ backgroundColor: colors.secondary }}
        animate={{
          scale: [1, 0.8, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Animated rectangles */}
      <motion.div
        className="absolute bottom-1/3 left-1/2 w-8 h-20 opacity-25"
        style={{ backgroundColor: colors.accent }}
        animate={{
          scaleY: [1, 1.5, 1],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );

  const renderOrganic = () => (
    <div className="relative w-full h-full">
      {/* Flowing shapes */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-20 h-20 rounded-full opacity-15"
        style={{ 
          backgroundColor: colors.primary,
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
        }}
        animate={{
          borderRadius: [
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '30% 60% 70% 40% / 50% 60% 30% 60%',
            '60% 40% 30% 70% / 60% 30% 70% 40%'
          ],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/3 w-16 h-16 opacity-20"
        style={{ 
          backgroundColor: colors.secondary,
          borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%'
        }}
        animate={{
          borderRadius: [
            '40% 60% 60% 40% / 70% 30% 70% 30%',
            '60% 40% 40% 60% / 30% 70% 30% 70%',
            '40% 60% 60% 40% / 70% 30% 70% 30%'
          ],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );

  const renderAbstract = () => (
    <div className="relative w-full h-full">
      {/* Abstract lines and shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-24 h-1 opacity-30"
        style={{ backgroundColor: colors.primary }}
        animate={{
          scaleX: [1, 2, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-1 h-16 opacity-25"
        style={{ backgroundColor: colors.secondary }}
        animate={{
          scaleY: [1, 1.8, 1],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-4 h-4 opacity-40"
        style={{ 
          backgroundColor: colors.accent,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
    </div>
  );

  const renderIllustration = () => {
    switch (type) {
      case 'organic':
        return renderOrganic();
      case 'abstract':
        return renderAbstract();
      default:
        return renderGeometric();
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {renderIllustration()}
    </motion.div>
  );
};
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ParticleSystemProps {
  count?: number;
  theme?: 'default' | 'neon' | 'elegant';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 50,
  theme = 'default',
  intensity = 'medium',
  className = '',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const themeColors = {
    default: ['#06b6d4', '#3b82f6', '#8b5cf6'],
    neon: ['#00ffff', '#ff00ff', '#ffff00'],
    elegant: ['#f8fafc', '#e2e8f0', '#cbd5e1'],
  };

  useEffect(() => {
    // Validar todos los props antes de usarlos
    const safeCount = typeof count === 'number' && !isNaN(count) && count >= 0 ? count : 50;
    const safeTheme = theme in themeColors ? theme : 'default';
    const safeIntensity = ['low', 'medium', 'high'].includes(intensity) ? intensity : 'medium';

    const intensitySettings = {
      low: { count: Math.floor(safeCount * 0.5), speed: 0.5 },
      medium: { count: safeCount, speed: 1 },
      high: { count: Math.floor(safeCount * 1.5), speed: 1.5 },
    };

    const settings = intensitySettings[safeIntensity];
    const colors = themeColors[safeTheme];

    const newParticles: Particle[] = Array.from(
      { length: settings.count },
      (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * settings.speed + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    );

    setParticles(newParticles);
  }, [count, theme, intensity]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className='absolute rounded-full'
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [
              particle.opacity,
              particle.opacity * 0.5,
              particle.opacity,
            ],
          }}
          transition={{
            duration: 3 / particle.speed,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

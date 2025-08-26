import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  theme?: 'default' | 'energy' | 'cosmic' | 'nature' | 'tech';
  style?: any;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  theme = 'default',
  style = {}
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Configuración de temas
  const themeConfig = useMemo(() => {
    const configs = {
      default: {
        colors: ['#3b82f6', '#8b5cf6', '#06b6d4'],
        particleCount: 30,
        sizeRange: [2, 6] as [number, number],
        speedRange: [0.5, 2] as [number, number],
        lifeRange: [100, 200] as [number, number]
      },
      energy: {
        colors: ['#ef4444', '#f59e0b', '#fbbf24'],
        particleCount: 40,
        sizeRange: [3, 8] as [number, number],
        speedRange: [1, 3] as [number, number],
        lifeRange: [80, 150] as [number, number]
      },
      cosmic: {
        colors: ['#8b5cf6', '#a855f7', '#ec4899'],
        particleCount: 50,
        sizeRange: [1, 5] as [number, number],
        speedRange: [0.3, 1.5] as [number, number],
        lifeRange: [120, 250] as [number, number]
      },
      nature: {
        colors: ['#22c55e', '#16a34a', '#84cc16'],
        particleCount: 35,
        sizeRange: [2, 7] as [number, number],
        speedRange: [0.4, 1.8] as [number, number],
        lifeRange: [100, 200] as [number, number]
      },
      tech: {
        colors: ['#06b6d4', '#0891b2', '#0ea5e9'],
        particleCount: 45,
        sizeRange: [2, 6] as [number, number],
        speedRange: [0.8, 2.5] as [number, number],
        lifeRange: [90, 180] as [number, number]
      }
    };
    return configs[theme] || configs.default;
  }, [theme]);

  // Generar partículas iniciales
  useEffect(() => {
    const newParticles: Particle[] = [];
    const { width, height } = Dimensions.get('window');

    for (let i = 0; i < themeConfig.particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * themeConfig.speedRange[1],
        vy: (Math.random() - 0.5) * themeConfig.speedRange[1],
        size: Math.random() * (themeConfig.sizeRange[1] - themeConfig.sizeRange[0]) + themeConfig.sizeRange[0],
        opacity: Math.random() * 0.8 + 0.2,
        color: themeConfig.colors[Math.floor(Math.random() * themeConfig.colors.length)] || '#3b82f6',
        life: Math.random() * (themeConfig.lifeRange[1] - themeConfig.lifeRange[0]) + themeConfig.lifeRange[0],
        maxLife: Math.random() * (themeConfig.lifeRange[1] - themeConfig.lifeRange[0]) + themeConfig.lifeRange[0]
      });
    }

    setParticles(newParticles);
  }, [theme, themeConfig]);

  // Animación de partículas
  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setParticles(prevParticles => {
        const { width, height } = Dimensions.get('window');
        
        return prevParticles.map(particle => {
          // Actualizar posición
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;

          // Rebotar en los bordes
          if (newX <= 0 || newX >= width) {
            particle.vx = -particle.vx;
            newX = Math.max(0, Math.min(width, newX));
          }
          if (newY <= 0 || newY >= height) {
            particle.vy = -particle.vy;
            newY = Math.max(0, Math.min(height, newY));
          }

          // Actualizar vida
          const newLife = particle.life - 1;
          
          // Regenerar partícula si muere
          if (newLife <= 0) {
            return {
              ...particle,
              x: Math.random() * width,
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * themeConfig.speedRange[1],
              vy: (Math.random() - 0.5) * themeConfig.speedRange[1],
              life: themeConfig.lifeRange[1],
              maxLife: themeConfig.lifeRange[1]
            };
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            life: newLife
          };
        });
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [particles, themeConfig]);

  // Manejar toque
  const handleTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // Crear partículas de explosión en el punto de toque
    const explosionParticles: Particle[] = [];

    for (let i = 0; i < 10; i++) {
      explosionParticles.push({
        id: Date.now() + i,
        x: locationX,
        y: locationY,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: Math.random() * 4 + 2,
        opacity: 1,
        color: themeConfig.colors[Math.floor(Math.random() * themeConfig.colors.length)] || '#3b82f6',
        life: 50,
        maxLife: 50
      });
    }

    setParticles(prev => [...prev, ...explosionParticles]);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={[styles.container, style]}>
        {particles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.opacity * (particle.life / particle.maxLife),
              },
            ]}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default ParticleSystem;
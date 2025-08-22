import React, { useRef, useEffect, useMemo } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { Canvas, Circle, Group, useValue, useComputedValue, useTouchHandler, useValueEffect, SkiaValue, useSharedValue, withRepeat, withTiming, withSpring, withSequence, interpolate, Extrapolate } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

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
  count?: number;
  theme?: 'default' | 'energy' | 'cosmic' | 'nature' | 'tech';
  intensity?: number;
  className?: string;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 500,
  theme = 'default',
  intensity = 1.0,
  style = {}
}) => {
  const { currentTheme } = useDynamicTheme();
  const { width, height } = useWindowDimensions();
  
  // Valores de animación
  const time = useSharedValue(0);
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const isTouching = useSharedValue(false);

  // Generar partículas
  const particles = useMemo(() => {
    const particleArray: Particle[] = [];
    
    const colors = {
      default: ['#06b6d4', '#3b82f6', '#8b5cf6'],
      energy: ['#fbbf24', '#f97316', '#ef4444'],
      cosmic: ['#8b5cf6', '#ec4899', '#06b6d4'],
      nature: ['#22c55e', '#10b981', '#059669'],
      tech: ['#06b6d4', '#3b82f6', '#1e40af']
    };
    
    const themeColors = colors[theme] || colors.default;
    
    for (let i = 0; i < count; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2 * intensity,
        vy: (Math.random() - 0.5) * 2 * intensity,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        life: Math.random(),
        maxLife: 1
      });
    }
    
    return particleArray;
  }, [count, theme, intensity, width, height]);

  // Animación de tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      time.value = time.value + 0.016; // 60 FPS
    }, 16);
    
    return () => clearInterval(interval);
  }, [time]);

  // Manejador de toques
  const touchHandler = useTouchHandler({
    onStart: (info) => {
      touchX.value = info.x;
      touchY.value = info.y;
      isTouching.value = true;
      
      // Feedback háptico
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    onActive: (info) => {
      touchX.value = info.x;
      touchY.value = info.y;
    },
    onEnd: () => {
      isTouching.value = false;
    }
  });

  // Componente de partícula individual
  const ParticleComponent: React.FC<{ particle: Particle; index: number }> = ({ particle, index }) => {
    const x = useSharedValue(particle.x);
    const y = useSharedValue(particle.y);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(particle.opacity);
    
    // Calcular posición basada en tiempo y velocidad
    const animatedX = useComputedValue(() => {
      const newX = x.value + Math.sin(time.value * 0.5 + index * 0.1) * 20 * intensity;
      
      // Mantener partículas en pantalla
      if (newX < 0) x.value = width;
      if (newX > width) x.value = 0;
      
      return newX;
    }, [time, x, width, intensity, index]);
    
    const animatedY = useComputedValue(() => {
      const newY = y.value + Math.cos(time.value * 0.3 + index * 0.1) * 15 * intensity;
      
      // Mantener partículas en pantalla
      if (newY < 0) y.value = height;
      if (newY > height) y.value = 0;
      
      // Efecto de gravedad
      y.value += 0.1;
      
      return newY;
    }, [time, y, height, intensity, index]);

    // Efectos especiales según el tema
    useEffect(() => {
      if (theme === 'energy') {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 1000 }),
            withTiming(0.5, { duration: 1000 })
          ),
          -1,
          true
        );
      } else if (theme === 'cosmic') {
        opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 2000 }),
            withTiming(0.3, { duration: 2000 })
          ),
          -1,
          true
        );
      } else if (theme === 'nature') {
        scale.value = withRepeat(
          withSpring(1.2, { damping: 10, stiffness: 100 }),
          -1,
          true
        );
      }
    }, [theme, scale, opacity]);

    // Interacción con toques
    const interactiveScale = useComputedValue(() => {
      if (!isTouching.value) return scale.value;
      
      const distance = Math.sqrt(
        Math.pow(animatedX.value - touchX.value, 2) + 
        Math.pow(animatedY.value - touchY.value, 2)
      );
      
      if (distance < 100) {
        return scale.value * (1 + (100 - distance) / 100);
      }
      
      return scale.value;
    }, [isTouching, touchX, touchY, animatedX, animatedY, scale]);

    return (
      <Circle
        cx={animatedX}
        cy={animatedY}
        r={particle.size}
        color={particle.color}
        opacity={opacity}
        transform={[{ scale: interactiveScale }]}
      />
    );
  };

  // Efectos de partículas especiales según el tema
  const SpecialEffects = () => {
    if (theme === 'energy') {
      return (
        <Group>
          {/* Líneas de energía */}
          {[...Array(20)].map((_, i) => (
            <Circle
              key={`energy-${i}`}
              cx={width * 0.5 + Math.sin(time.value + i * 0.5) * 100}
              cy={height * 0.5 + Math.cos(time.value + i * 0.3) * 100}
              r={2}
              color="#fbbf24"
              opacity={0.8}
            />
          ))}
        </Group>
      );
    }
    
    if (theme === 'cosmic') {
      return (
        <Group>
          {/* Estrellas brillantes */}
          {[...Array(15)].map((_, i) => (
            <Circle
              key={`star-${i}`}
              cx={width * 0.2 + Math.sin(time.value * 0.2 + i * 0.8) * 150}
              cy={height * 0.3 + Math.cos(time.value * 0.3 + i * 0.6) * 150}
              r={3}
              color="#fbbf24"
              opacity={withRepeat(
                withSequence(
                  withTiming(1, { duration: 1500 }),
                  withTiming(0.2, { duration: 1500 })
                ),
                -1,
                true
              )}
            />
          ))}
        </Group>
      );
    }
    
    if (theme === 'nature') {
      return (
        <Group>
          {/* Hojas flotantes */}
          {[...Array(10)].map((_, i) => (
            <Circle
              key={`leaf-${i}`}
              cx={width * 0.1 + Math.sin(time.value * 0.1 + i * 1.2) * 200}
              cy={height * 0.8 + Math.cos(time.value * 0.15 + i * 0.9) * 50}
              r={4}
              color="#10b981"
              opacity={0.6}
            />
          ))}
        </Group>
      );
    }
    
    if (theme === 'tech') {
      return (
        <Group>
          {/* Puntos de conexión */}
          {[...Array(25)].map((_, i) => (
            <Circle
              key={`tech-${i}`}
              cx={width * 0.5 + Math.sin(time.value * 0.4 + i * 0.4) * 120}
              cy={height * 0.5 + Math.cos(time.value * 0.5 + i * 0.3) * 120}
              r={1.5}
              color="#06b6d4"
              opacity={0.7}
            />
          ))}
        </Group>
      );
    }
    
    return null;
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
        {/* Partículas principales */}
        <Group>
          {particles.map((particle, index) => (
            <ParticleComponent key={particle.id} particle={particle} index={index} />
          ))}
        </Group>
        
        {/* Efectos especiales */}
        <SpecialEffects />
        
        {/* Efecto de ondas en toque */}
        {isTouching && (
          <Group>
            <Circle
              cx={touchX}
              cy={touchY}
              r={withTiming(50, { duration: 500 })}
              color="rgba(255, 255, 255, 0.3)"
              style="stroke"
              strokeWidth={2}
            />
          </Group>
        )}
      </Canvas>
    </View>
  );
};

export default ParticleSystem;
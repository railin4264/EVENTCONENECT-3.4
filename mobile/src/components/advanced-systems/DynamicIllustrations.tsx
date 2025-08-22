import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanGestureHandler,
  State
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface IllustrationProps {
  type: 'person' | 'scene' | 'icon';
  context?: 'morning' | 'afternoon' | 'evening' | 'night' | 'event' | 'social';
  state?: 'idle' | 'active' | 'excited' | 'calm';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onPress?: () => void;
  style?: any;
}

// Componente de ilustración dinámica
export const DynamicIllustration: React.FC<IllustrationProps> = ({
  type,
  context = 'morning',
  state = 'idle',
  size = 'medium',
  interactive = true,
  onPress,
  style = {}
}) => {
  const { currentTheme } = useDynamicTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Configuraciones por tipo
  const typeConfig = {
    person: {
      icon: '👤',
      colors: ['#3b82f6', '#1d4ed8'],
      animations: ['float', 'pulse', 'glow']
    },
    scene: {
      icon: '🌅',
      colors: ['#f59e0b', '#d97706'],
      animations: ['float', 'rotate', 'pulse']
    },
    icon: {
      icon: '✨',
      colors: ['#8b5cf6', '#7c3aed'],
      animations: ['rotate', 'glow', 'pulse']
    }
  };

  const contextConfig = {
    morning: {
      icon: '🌅',
      colors: ['#fbbf24', '#f59e0b'],
      mood: 'energized'
    },
    afternoon: {
      icon: '☀️',
      colors: ['#f59e0b', '#d97706'],
      mood: 'active'
    },
    evening: {
      icon: '🌆',
      colors: ['#ec4899', '#db2777'],
      mood: 'relaxed'
    },
    night: {
      icon: '🌙',
      colors: ['#6366f1', '#4f46e5'],
      mood: 'calm'
    },
    event: {
      icon: '🎉',
      colors: ['#8b5cf6', '#7c3aed'],
      mood: 'excited'
    },
    social: {
      icon: '👥',
      colors: ['#ec4899', '#db2777'],
      mood: 'social'
    }
  };

  const stateConfig = {
    idle: {
      scale: 1,
      rotation: 0,
      pulse: 1
    },
    active: {
      scale: 1.1,
      rotation: 5,
      pulse: 1.05
    },
    excited: {
      scale: 1.2,
      rotation: 10,
      pulse: 1.1
    },
    calm: {
      scale: 0.95,
      rotation: -2,
      pulse: 0.98
    }
  };

  const sizeConfig = {
    small: {
      width: 60,
      height: 60,
      fontSize: 24
    },
    medium: {
      width: 100,
      height: 100,
      fontSize: 40
    },
    large: {
      width: 150,
      height: 150,
      fontSize: 60
    }
  };

  const config = typeConfig[type];
  const contextInfo = contextConfig[context];
  const stateInfo = stateConfig[state];
  const sizeInfo = sizeConfig[size];

  // Animaciones automáticas
  useEffect(() => {
    // Animación de flotación
    if (config.animations.includes('float')) {
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      floatAnimation.start();

      return () => floatAnimation.stop();
    }

    // Animación de rotación
    if (config.animations.includes('rotate')) {
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();

      return () => rotationAnimation.stop();
    }

    // Animación de pulso
    if (config.animations.includes('pulse')) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }

    // Animación de brillo
    if (config.animations.includes('glow')) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
    }
  }, [type, context, state]);

  // Interpolaciones
  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotationInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  // Manejo de interacciones
  const handlePressIn = () => {
    if (interactive) {
      setIsPressed(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      setIsPressed(false);
    }
  };

  const handlePress = () => {
    if (interactive && onPress) {
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Renderizado de partículas de fondo
  const renderBackgroundParticles = () => {
    if (type === 'scene' || type === 'icon') {
      return (
        <View style={styles.particlesContainer}>
          {[...Array(5)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: glowOpacity,
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={interactive ? 0.8 : 1}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: sizeInfo.width,
            height: sizeInfo.height,
            transform: [
              { scale: scaleAnim },
              { translateY: floatInterpolation },
              { rotate: rotationInterpolation },
            ],
          },
        ]}
      >
        {/* Partículas de fondo */}
        {renderBackgroundParticles()}

        {/* Ilustración principal */}
        <LinearGradient
          colors={contextInfo.colors}
          style={[
            styles.illustrationGradient,
            {
              width: sizeInfo.width,
              height: sizeInfo.height,
              borderRadius: sizeInfo.width / 2,
            },
          ]}
        >
          <Text style={[
            styles.illustrationIcon,
            { fontSize: sizeInfo.fontSize }
          ]}>
            {contextInfo.icon}
          </Text>

          {/* Indicador de estado */}
          <View style={[
            styles.stateIndicator,
            {
              backgroundColor: stateInfo.scale > 1 ? '#22c55e' : '#6b7280',
            }
          ]}>
            <Text style={styles.stateIndicatorText}>
              {state === 'excited' ? '🔥' : 
               state === 'active' ? '⚡' : 
               state === 'calm' ? '😌' : '😐'}
            </Text>
          </View>

          {/* Efecto de brillo */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowOpacity,
                backgroundColor: contextInfo.colors[0],
              },
            ]}
          />
        </LinearGradient>

        {/* Información contextual */}
        <View style={styles.contextInfo}>
          <Text style={styles.contextText}>
            {context.charAt(0).toUpperCase() + context.slice(1)}
          </Text>
          <Text style={styles.moodText}>
            {contextInfo.mood}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Componente de colección de ilustraciones
export const IllustrationCollection: React.FC<{
  illustrations: Array<{
    type: IllustrationProps['type'];
    context: IllustrationProps['context'];
    state: IllustrationProps['state'];
    size: IllustrationProps['size'];
  }>;
  layout?: 'grid' | 'carousel' | 'stack';
  onIllustrationPress?: (index: number) => void;
  style?: any;
}> = ({ illustrations, layout = 'grid', onIllustrationPress, style = {} }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const handleIllustrationPress = (index: number) => {
    if (onIllustrationPress) {
      onIllustrationPress(index);
    }
    setCurrentIndex(index);
  };

  if (layout === 'carousel') {
    return (
      <View style={[styles.carouselContainer, style]}>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollAnim } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {illustrations.map((illustration, index) => (
            <View key={index} style={styles.carouselItem}>
              <DynamicIllustration
                {...illustration}
                onPress={() => handleIllustrationPress(index)}
                interactive={true}
              />
            </View>
          ))}
        </Animated.ScrollView>
        
        {/* Indicadores de página */}
        <View style={styles.carouselIndicators}>
          {illustrations.map((_, index) => (
            <View
              key={index}
              style={[
                styles.carouselIndicator,
                {
                  backgroundColor: index === currentIndex ? '#8b5cf6' : '#e5e7eb',
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  if (layout === 'stack') {
    return (
      <View style={[styles.stackContainer, style]}>
        {illustrations.map((illustration, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stackItem,
              {
                zIndex: illustrations.length - index,
                transform: [
                  {
                    translateY: scrollAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [index * 20, index * 10],
                    }),
                  },
                  {
                    scale: scrollAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1 - index * 0.1, 1 - index * 0.05],
                    }),
                  },
                ],
              },
            ]}
          >
            <DynamicIllustration
              {...illustration}
              onPress={() => handleIllustrationPress(index)}
              interactive={true}
            />
          </Animated.View>
        ))}
      </View>
    );
  }

  // Layout por defecto: grid
  return (
    <View style={[styles.gridContainer, style]}>
      {illustrations.map((illustration, index) => (
        <View key={index} style={styles.gridItem}>
          <DynamicIllustration
            {...illustration}
            onPress={() => handleIllustrationPress(index)}
            interactive={true}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  illustrationGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  illustrationIcon: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stateIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateIndicatorText: {
    fontSize: 10,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 100,
    opacity: 0.3,
  },
  contextInfo: {
    position: 'absolute',
    bottom: -30,
    alignItems: 'center',
  },
  contextText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  moodText: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  carouselContainer: {
    height: 200,
  },
  carouselItem: {
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  carouselIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  stackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  stackItem: {
    position: 'absolute',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
  gridItem: {
    margin: 8,
  },
});

export default DynamicIllustration;
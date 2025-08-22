import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

interface DynamicIllustrationProps {
  type: 'person' | 'scene' | 'icon';
  context?: string;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onPress?: () => void;
  style?: any;
}

// Componente de ilustración dinámica
export const DynamicIllustration: React.FC<DynamicIllustrationProps> = ({
  type,
  context = 'default',
  size = 'medium',
  interactive = true,
  onPress,
  style = {}
}) => {
  const { currentTheme } = useDynamicTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: { width: 80, height: 80, fontSize: 40 },
    medium: { width: 120, height: 120, fontSize: 60 },
    large: { width: 200, height: 200, fontSize: 100 }
  };

  const config = sizeConfig[size];

  // Generar contenido basado en el tipo y contexto
  const generateContent = () => {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 18;

    switch (type) {
      case 'person':
        if (context === 'morning' || (isDay && hour < 12)) {
          return { emoji: '🌅', description: 'Buenos días' };
        } else if (context === 'afternoon' || (isDay && hour >= 12 && hour < 18)) {
          return { emoji: '☀️', description: 'Buenas tardes' };
        } else if (context === 'evening' || (hour >= 18 && hour < 22)) {
          return { emoji: '🌆', description: 'Buenas tardes' };
        } else {
          return { emoji: '🌙', description: 'Buenas noches' };
        }

      case 'scene':
        if (context === 'music') {
          return { emoji: '🎵', description: 'Música' };
        } else if (context === 'tech') {
          return { emoji: '💻', description: 'Tecnología' };
        } else if (context === 'art') {
          return { emoji: '🎨', description: 'Arte' };
        } else if (context === 'nature') {
          return { emoji: '🌿', description: 'Naturaleza' };
        } else if (context === 'sports') {
          return { emoji: '⚽', description: 'Deportes' };
        } else if (context === 'romantic') {
          return { emoji: '💕', description: 'Romántico' };
        } else {
          return { emoji: '🎉', description: 'Evento' };
        }

      case 'icon':
        if (context === 'success') {
          return { emoji: '✅', description: 'Éxito' };
        } else if (context === 'error') {
          return { emoji: '❌', description: 'Error' };
        } else if (context === 'loading') {
          return { emoji: '⏳', description: 'Cargando' };
        } else if (context === 'warning') {
          return { emoji: '⚠️', description: 'Advertencia' };
        } else if (context === 'info') {
          return { emoji: 'ℹ️', description: 'Información' };
        } else {
          return { emoji: '✨', description: 'Acción' };
        }
    }
  };

  const content = generateContent();

  // Animación de rotación continua
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    return () => rotationAnimation.stop();
  }, [rotateAnim]);

  // Animación de brillo
  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, [glowAnim]);

  const handlePressIn = () => {
    if (interactive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (interactive && onPress) {
      onPress();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

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
            width: config.width,
            height: config.height,
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        {/* Efecto de brillo */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              backgroundColor: currentTheme.colors.primary,
            },
          ]}
        />

        {/* Contenido principal */}
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.illustrationGradient}
        >
          <Text style={[styles.illustrationEmoji, { fontSize: config.fontSize }]}>
            {content.emoji}
          </Text>
        </LinearGradient>

        {/* Partículas de fondo */}
        <View style={styles.particlesContainer}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.particle,
                {
                  backgroundColor: currentTheme.colors.secondary,
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index * 10)}%`,
                },
              ]}
            />
          ))}
        </View>

        {/* Descripción */}
        <Text style={styles.illustrationDescription}>
          {content.description}
        </Text>
      </Animated.View>
    </TouchableOpacity>
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
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 100,
    opacity: 0.3,
  },
  illustrationGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  illustrationEmoji: {
    textAlign: 'center',
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
    opacity: 0.6,
  },
  illustrationDescription: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default DynamicIllustration;
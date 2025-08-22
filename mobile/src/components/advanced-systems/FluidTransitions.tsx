import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

interface MorphingCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

interface FluidButtonProps {
  children: React.ReactNode;
  variant?: 'expand' | 'morph';
  style?: any;
  onPress?: () => void;
}

interface BreathingElementProps {
  children: React.ReactNode;
  style?: any;
}

interface WaterFlowNavigationProps {
  items: Array<{ id: string; label: string; icon: string }>;
  activeIndex: number;
  onItemPress: (index: number) => void;
  style?: any;
}

// Componente de tarjeta morfing
export const MorphingCard: React.FC<MorphingCardProps> = ({
  children,
  style = {},
  onPress
}) => {
  const { currentTheme } = useDynamicTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;

  // Animación de respiración continua
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, [breathingAnim]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const shineOpacity = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.morphingCard, style]}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, breathingAnim) },
              { rotate: rotation },
            ],
          },
        ]}
      >
        {/* Efecto de brillo */}
        <Animated.View
          style={[
            styles.shineEffect,
            {
              opacity: shineOpacity,
            },
          ]}
        />

        {/* Contenido de la tarjeta */}
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.cardGradient}
        >
          {children}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Componente de botón fluido
export const FluidButton: React.FC<FluidButtonProps> = ({
  children,
  variant = 'expand',
  style = {},
  onPress
}) => {
  const { currentTheme } = useDynamicTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    if (variant === 'expand') {
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    if (variant === 'expand') {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const expandScale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.fluidButton, style]}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, expandScale) },
            ],
          },
        ]}
      >
        {/* Efecto de ripple */}
        <Animated.View
          style={[
            styles.rippleEffect,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0],
              }),
            },
          ]}
        />

        {/* Contenido del botón */}
        <LinearGradient
          colors={currentTheme.gradients.secondary}
          style={styles.buttonGradient}
        >
          {children}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Componente de elemento respirando
export const BreathingElement: React.FC<BreathingElementProps> = ({
  children,
  style = {}
}) => {
  const breathingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, [breathingAnim]);

  return (
    <Animated.View
      style={[
        styles.breathingElement,
        {
          transform: [{ scale: breathingAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Componente de navegación con flujo de agua
export const WaterFlowNavigation: React.FC<WaterFlowNavigationProps> = ({
  items,
  activeIndex,
  onItemPress,
  style = {}
}) => {
  const { currentTheme } = useDynamicTheme();
  const flowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flowAnim, {
      toValue: activeIndex,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, flowAnim]);

  const flowPosition = flowAnim.interpolate({
    inputRange: [0, items.length - 1],
    outputRange: [0, 100],
  });

  return (
    <View style={[styles.waterFlowContainer, style]}>
      {/* Indicador de flujo */}
      <Animated.View
        style={[
          styles.flowIndicator,
          {
            left: flowPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.flowGradient}
        />
      </Animated.View>

      {/* Elementos de navegación */}
      <View style={styles.navigationItems}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navigationItem,
              index === activeIndex && styles.navigationItemActive,
            ]}
            onPress={() => onItemPress(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.navigationIcon}>{item.icon}</Text>
            <Text style={[
              styles.navigationLabel,
              index === activeIndex && styles.navigationLabelActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  morphingCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fluidButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
  },
  buttonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  breathingElement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterFlowContainer: {
    position: 'relative',
    height: 80,
  },
  flowIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  flowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  navigationItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  navigationItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navigationItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navigationIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navigationLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  navigationLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MorphingCard;
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  PanGestureHandler,
  State,
  GestureHandlerRootView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MorphingCardProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'default' | 'expand' | 'transform' | 'breathing';
  onExpand?: () => void;
  expanded?: boolean;
}

export const MorphingCard: React.FC<MorphingCardProps> = ({
  children,
  style = {},
  variant = 'default',
  onExpand,
  expanded = false
}) => {
  const { currentTheme } = useDynamicTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  // Valores de animación
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateXValue = useRef(new Animated.Value(0)).current;
  const rotateYValue = useRef(new Animated.Value(0)).current;
  const shadowValue = useRef(new Animated.Value(0)).current;
  const breathingValue = useRef(new Animated.Value(0)).current;

  // Animación de respiración
  useEffect(() => {
    if (variant === 'breathing') {
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
      breathingAnimation.start();
    }
  }, [variant, breathingValue]);

  // Efectos de hover
  const handlePressIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(shadowValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    // Feedback háptico
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(shadowValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (variant === 'expand' && onExpand) {
      setIsExpanded(!isExpanded);
      onExpand();
      
      // Feedback háptico
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // Calcular valores de transformación
  const scale = breathingValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const finalScale = Animated.multiply(scaleValue, scale);

  const shadowOpacity = shadowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const shadowRadius = shadowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  return (
    <Animated.View
      style={[
        styles.morphingCard,
        {
          transform: [
            { scale: finalScale },
            { rotateX: rotateXValue },
            { rotateY: rotateYValue },
          ],
          shadowOpacity,
          shadowRadius,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Efecto de brillo */}
          {isHovered && (
            <Animated.View
              style={[
                styles.shine,
                {
                  opacity: shadowValue,
                  transform: [
                    {
                      translateX: shadowValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 100],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          
          {/* Contenido */}
          <View style={styles.content}>
            {children}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FluidButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'expand' | 'morph';
  style?: any;
  expandedContent?: React.ReactNode;
}

export const FluidButton: React.FC<FluidButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  style = {},
  expandedContent
}) => {
  const { currentTheme } = useDynamicTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  // Valores de animación
  const scaleValue = useRef(new Animated.Value(1)).current;
  const borderRadiusValue = useRef(new Animated.Value(12)).current;
  const widthValue = useRef(new Animated.Value(200)).current;
  const heightValue = useRef(new Animated.Value(50)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Feedback háptico
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePress = () => {
    if (variant === 'expand') {
      setIsExpanded(!isExpanded);
      
      // Animación de expansión
      Animated.parallel([
        Animated.timing(widthValue, {
          toValue: isExpanded ? 200 : 300,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(heightValue, {
          toValue: isExpanded ? 50 : 200,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(borderRadiusValue, {
          toValue: isExpanded ? 12 : 20,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }

    if (variant === 'morph') {
      // Animación de morphing
      Animated.sequence([
        Animated.timing(borderRadiusValue, {
          toValue: 25,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(borderRadiusValue, {
          toValue: 12,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }

    onPress?.();
    
    // Feedback háptico
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <Animated.View
      style={[
        styles.fluidButton,
        {
          transform: [{ scale: scaleValue }],
          width: widthValue,
          height: heightValue,
          borderRadius: borderRadiusValue,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.buttonTouchable}
      >
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Efecto de ondas */}
          {isPressed && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  transform: [
                    {
                      scale: scaleValue.interpolate({
                        inputRange: [0.95, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          
          {/* Contenido */}
          <View style={styles.buttonContent}>
            {!isExpanded ? children : expandedContent}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface BreathingElementProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
  duration?: number;
}

export const BreathingElement: React.FC<BreathingElementProps> = ({
  children,
  style = {},
  intensity = 0.02,
  duration = 3000
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1 + intensity,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.8,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    
    breathingAnimation.start();
    
    return () => breathingAnimation.stop();
  }, [scaleValue, opacityValue, intensity, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface WaterFlowNavigationProps {
  children: React.ReactNode;
  style?: any;
}

export const WaterFlowNavigation: React.FC<WaterFlowNavigationProps> = ({
  children,
  style = {}
}) => {
  const { currentTheme } = useDynamicTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const handleItemPress = (index: number) => {
    setActiveIndex(index);
    
    // Animación fluida del indicador
    Animated.spring(indicatorPosition, {
      toValue: index * (100 / React.Children.count(children)),
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();

    // Feedback háptico
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.waterFlowContainer, style]}>
      {/* Indicador fluido */}
      <Animated.View
        style={[
          styles.flowIndicator,
          {
            left: indicatorPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      
      {/* Elementos de navegación */}
      <View style={styles.navigationItems}>
        {React.Children.map(children, (child, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navigationItem}
            onPress={() => handleItemPress(index)}
            activeOpacity={0.7}
          >
            {child}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  morphingCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fluidButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  buttonTouchable: {
    flex: 1,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  waterFlowContainer: {
    position: 'relative',
    height: 60,
  },
  flowIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '25%',
    height: 3,
    backgroundColor: '#06b6d4',
    borderRadius: 2,
  },
  navigationItems: {
    flexDirection: 'row',
    flex: 1,
  },
  navigationItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
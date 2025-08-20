import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

// ===== BUTTON VARIANTS =====
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'glass' | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  glow?: boolean;
  pulse?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ===== ANIMATED BUTTON COMPONENT =====
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = 'lg',
  glow = false,
  pulse = false,
  onPress,
  children,
  style,
  textStyle,
}) => {
  // ===== ANIMATION VALUES =====
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(glow ? 0.5 : 0);

  // ===== ANIMATION STYLES =====
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  // ===== PRESS HANDLERS =====
  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  // ===== VARIANT STYLES =====
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: ['#06b6d4', '#3b82f6'],
          border: 'transparent',
          textColor: '#ffffff',
        };
      case 'secondary':
        return {
          background: ['#a855f7', '#ec4899'],
          border: 'transparent',
          textColor: '#ffffff',
        };
      case 'accent':
        return {
          background: ['#f97316', '#ef4444'],
          border: 'transparent',
          textColor: '#ffffff',
        };
      case 'outline':
        return {
          background: ['transparent', 'transparent'],
          border: '#06b6d4',
          textColor: '#06b6d4',
        };
      case 'ghost':
        return {
          background: ['transparent', 'transparent'],
          border: 'transparent',
          textColor: '#06b6d4',
        };
      case 'glass':
        return {
          background: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
          border: 'rgba(255, 255, 255, 0.2)',
          textColor: '#ffffff',
        };
      case 'neon':
        return {
          background: ['#000000', '#000000'],
          border: '#06b6d4',
          textColor: '#06b6d4',
        };
      default:
        return {
          background: ['#06b6d4', '#3b82f6'],
          border: 'transparent',
          textColor: '#ffffff',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // ===== SIZE STYLES =====
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 };
      case 'xl':
        return { paddingVertical: 20, paddingHorizontal: 32, fontSize: 20 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 };
    }
  };

  const sizeStyles = getSizeStyles();

  // ===== BORDER RADIUS =====
  const getBorderRadius = () => {
    switch (rounded) {
      case 'sm':
        return 6;
      case 'md':
        return 8;
      case 'lg':
        return 12;
      case 'xl':
        return 16;
      case 'full':
        return 999;
      default:
        return 12;
    }
  };

  // ===== RENDER CONTENT =====
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? '#06b6d4' : '#ffffff'}
          />
          <Text style={[styles.loadingText, { color: variantStyles.textColor }]}>
            Cargando...
          </Text>
        </View>
      );
    }

    return (
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
            color: variantStyles.textColor,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    );
  };

  // ===== RENDER BUTTON =====
  const renderButton = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return (
        <TouchableOpacity
          style={[
            styles.button,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: getBorderRadius(),
              borderWidth: variant === 'outline' ? 2 : 0,
              borderColor: variantStyles.border,
              width: fullWidth ? '100%' : 'auto',
              opacity: disabled ? 0.5 : 1,
            },
            style,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          {renderContent()}
        </TouchableOpacity>
      );
    }

    return (
      <LinearGradient
        colors={variantStyles.background}
        style={[
          styles.button,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            borderRadius: getBorderRadius(),
            borderWidth: variantStyles.border !== 'transparent' ? 2 : 0,
            borderColor: variantStyles.border,
            width: fullWidth ? '100%' : 'auto',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          {renderContent()}
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      {glow && (
        <Animated.View
          style={[
            styles.glow,
            {
              borderRadius: getBorderRadius(),
              backgroundColor: variant === 'neon' ? '#06b6d4' : '#3b82f6',
            },
            glowStyle,
          ]}
        />
      )}

      {/* Main button */}
      <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        {renderButton()}
      </Animated.View>
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  buttonContainer: {
    position: 'relative',
    zIndex: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    zIndex: 0,
  },
});

export default Button;
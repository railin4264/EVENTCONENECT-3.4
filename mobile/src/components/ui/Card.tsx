import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// ===== CARD INTERFACES =====
export interface CardProps {
  variant?: 'default' | 'glass' | 'neon' | 'gradient' | 'elevated' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  border?: boolean;
  shadow?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'none' | 'float' | 'pulse' | 'glow' | 'slideIn';
  delay?: number;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardHeaderProps {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardContentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardFooterProps {
  actions?: React.ReactNode;
  divider?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

// ===== ANIMATED CARD COMPONENT =====
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  hover: _hover = false,
  glow = false,
  border = true,
  shadow = true,
  rounded = 'lg',
  animation: _animation = 'none',
  delay: _delay = 0,
  onPress,
  children,
  style,
}) => {
  // ===== ANIMATION VALUES =====
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(glow ? 0.3 : 0);

  // ===== ANIMATION STYLES =====
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
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
    if (variant === 'interactive' && onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      translateY.value = withSpring(-2, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (variant === 'interactive' && onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    }
  };

  // ===== VARIANT STYLES =====
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          shadow: shadow ? 8 : 0,
        };
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          shadow: shadow ? 16 : 0,
        };
      case 'neon':
        return {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '#06b6d4',
          shadow: glow ? 16 : 8,
        };
      case 'gradient':
        return {
          background: 'rgba(6, 182, 212, 0.2)',
          border: 'rgba(6, 182, 212, 0.3)',
          shadow: shadow ? 12 : 0,
        };
      case 'elevated':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          shadow: shadow ? 16 : 0,
        };
      case 'interactive':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          shadow: shadow ? 12 : 0,
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          shadow: shadow ? 8 : 0,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // ===== SIZE STYLES =====
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 12 };
      case 'md':
        return { padding: 16 };
      case 'lg':
        return { padding: 24 };
      case 'xl':
        return { padding: 32 };
      default:
        return { padding: 16 };
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

  // ===== RENDER CARD =====
  const renderCard = () => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.2)', 'rgba(168, 85, 247, 0.2)']}
          style={[
            styles.card,
            {
              padding: sizeStyles.padding,
              borderRadius: getBorderRadius(),
              borderWidth: border ? 2 : 0,
              borderColor: variantStyles.border,
              shadowOpacity: variantStyles.shadow / 100,
              elevation: variantStyles.shadow,
            },
            style,
          ]}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.card,
          {
            padding: sizeStyles.padding,
            borderRadius: getBorderRadius(),
            backgroundColor: variantStyles.background,
            borderWidth: border ? 1 : 0,
            borderColor: variantStyles.border,
            shadowOpacity: variantStyles.shadow / 100,
            elevation: variantStyles.shadow,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  };

  const CardContent = onPress ? (
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {renderCard()}
    </TouchableOpacity>
  ) : (
    renderCard()
  );

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

      {/* Main card */}
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        {CardContent}
      </Animated.View>
    </View>
  );
};

// ===== CARD HEADER COMPONENT =====
export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  badge,
  children,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <View style={styles.headerText}>
          {children}
        </View>
      </View>
      {badge && (
        <View style={styles.badgeContainer}>
          {badge}
        </View>
      )}
    </View>
  );
};

// ===== CARD TITLE COMPONENT =====
export const CardTitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({
  children,
  style,
}) => {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
};

// ===== CARD SUBTITLE COMPONENT =====
export const CardSubtitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({
  children,
  style,
}) => {
  return (
    <Text style={[styles.subtitle, style]}>
      {children}
    </Text>
  );
};

// ===== CARD CONTENT COMPONENT =====
export const CardContent: React.FC<CardContentProps> = ({
  padding = 'md',
  children,
  style,
}) => {
  const paddingStyles = {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
  };

  return (
    <View style={[styles.content, { padding: paddingStyles[padding] }, style]}>
      {children}
    </View>
  );
};

// ===== CARD FOOTER COMPONENT =====
export const CardFooter: React.FC<CardFooterProps> = ({
  actions,
  divider = true,
  children,
  style,
}) => {
  return (
    <View style={[styles.footer, style]}>
      {divider && <View style={styles.divider} />}
      <View style={styles.footerContent}>
        <View style={styles.footerText}>
          {children}
        </View>
        {actions && (
          <View style={styles.footerActions}>
            {actions}
          </View>
        )}
      </View>
    </View>
  );
};

// ===== CARD BADGE COMPONENT =====
export const CardBadge: React.FC<{
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ variant = 'primary', children, style }) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'primary':
        return ['#06b6d4', '#3b82f6'];
      case 'secondary':
        return ['#a855f7', '#ec4899'];
      case 'accent':
        return ['#f97316', '#ef4444'];
      case 'success':
        return ['#10b981', '#059669'];
      case 'warning':
        return ['#f59e0b', '#d97706'];
      case 'error':
        return ['#ef4444', '#dc2626'];
      default:
        return ['#06b6d4', '#3b82f6'];
    }
  };

  return (
    <LinearGradient
      colors={getBadgeColors()}
      style={[styles.badge, style]}
    >
      <Text style={styles.badgeText}>{children}</Text>
    </LinearGradient>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cardContainer: {
    position: 'relative',
    zIndex: 1,
  },
  card: {
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    flex: 1,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default Card;
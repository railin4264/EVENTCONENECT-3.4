import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemedStyles } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// ===== SWIPE ACTION INTERFACE =====
export interface SwipeAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  haptic?: 'light' | 'medium' | 'heavy';
}

// ===== SWIPEABLE ROW COMPONENT =====
export const SwipeableRow: React.FC<{
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd,
  disabled = false,
  threshold = 0.3,
  className
}) => {
  const styles = useThemedStyles();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const isSwipeActive = useRef(false);

  // Calculate action widths
  const leftActionWidth = leftActions.length * 80;
  const rightActionWidth = rightActions.length * 80;
  const swipeThreshold = screenWidth * threshold;

  // ===== GESTURE HANDLER =====
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (disabled) return;

    const { state, translationX, velocityX } = event.nativeEvent;

    if (state === State.BEGAN) {
      isSwipeActive.current = true;
      onSwipeStart?.();
      Haptics.selectionAsync();
    }

    if (state === State.END || state === State.CANCELLED) {
      isSwipeActive.current = false;
      onSwipeEnd?.();

      // Determine final position
      let finalX = 0;
      const offset = lastOffset.current + translationX;

      // Check if should snap to action
      if (offset > swipeThreshold && leftActions.length > 0) {
        finalX = leftActionWidth;
      } else if (offset < -swipeThreshold && rightActions.length > 0) {
        finalX = -rightActionWidth;
      }

      // Check for fast swipe (velocity-based)
      if (Math.abs(velocityX) > 500) {
        if (velocityX > 0 && leftActions.length > 0) {
          finalX = leftActionWidth;
        } else if (velocityX < 0 && rightActions.length > 0) {
          finalX = -rightActionWidth;
        }
      }

      // Animate to final position
      lastOffset.current = finalX;
      Animated.spring(translateX, {
        toValue: finalX,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  // ===== CLOSE SWIPE =====
  const closeSwipe = () => {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // ===== EXECUTE ACTION =====
  const executeAction = (action: SwipeAction) => {
    // Haptic feedback
    switch (action.haptic) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      default:
        Haptics.selectionAsync();
    }

    // Close swipe and execute action
    closeSwipe();
    action.onPress();
  };

  // ===== RENDER ACTIONS =====
  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;

    return (
      <View style={[
        componentStyles.actionsContainer,
        side === 'left' ? componentStyles.leftActions : componentStyles.rightActions,
        { width: actions.length * 80 }
      ]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              componentStyles.actionButton,
              { backgroundColor: action.backgroundColor }
            ]}
            onPress={() => executeAction(action)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={action.icon as any}
              size={24}
              color={action.color}
            />
            <Text style={[componentStyles.actionLabel, { color: action.color }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[componentStyles.container, className]}>
      {/* Left Actions */}
      {renderActions(leftActions, 'left')}

      {/* Right Actions */}
      {renderActions(rightActions, 'right')}

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!disabled}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <Animated.View
          style={[
            componentStyles.content,
            {
              backgroundColor: styles.colors.surface,
              transform: [{ translateX }],
            }
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// ===== COMPONENT STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  content: {
    width: screenWidth,
    zIndex: 1,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 0,
  },
  leftActions: {
    left: 0,
    justifyContent: 'flex-start',
  },
  rightActions: {
    right: 0,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SwipeableRow;

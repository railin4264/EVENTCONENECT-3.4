import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemedStyles } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// ===== MENU ITEM INTERFACE =====
export interface LongPressMenuItem {
  id: string;
  label: string;
  icon: string;
  color?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

// ===== LONG PRESS MENU COMPONENT =====
export const LongPressMenu: React.FC<{
  children: React.ReactNode;
  menuItems: LongPressMenuItem[];
  onLongPress?: () => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  disabled?: boolean;
  longPressDuration?: number;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  menuPosition?: 'auto' | 'top' | 'bottom' | 'center';
  style?: any;
}> = ({
  children,
  menuItems,
  onLongPress,
  onMenuOpen,
  onMenuClose,
  disabled = false,
  longPressDuration = 500,
  hapticFeedback = 'medium',
  menuPosition = 'auto',
  style
}) => {
  const styles = useThemedStyles();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
  const [pressCoords, setPressCoords] = useState({ x: 0, y: 0 });
  
  // ===== ANIMATED VALUES =====
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuScale = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  // ===== REFS =====
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const childRef = useRef<View>(null);
  const isLongPressing = useRef(false);

  // ===== HAPTIC FEEDBACK =====
  const triggerHaptic = () => {
    switch (hapticFeedback) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  };

  // ===== CALCULATE MENU POSITION =====
  const calculateMenuPosition = (gestureX: number, gestureY: number) => {
    const menuWidth = 200;
    const menuHeight = menuItems.length * 50 + 20;
    
    let x = gestureX - menuWidth / 2;
    let y = gestureY;

    // Determine position based on props and available space
    if (menuPosition === 'auto') {
      if (gestureY + menuHeight > height - 100) {
        y = gestureY - menuHeight - 20; // Position above
      } else {
        y = gestureY + 20; // Position below
      }
    } else if (menuPosition === 'top') {
      y = gestureY - menuHeight - 20;
    } else if (menuPosition === 'bottom') {
      y = gestureY + 20;
    } else if (menuPosition === 'center') {
      y = gestureY - menuHeight / 2;
    }

    // Keep menu within screen bounds
    x = Math.max(20, Math.min(width - menuWidth - 20, x));
    y = Math.max(20, Math.min(height - menuHeight - 20, y));

    return { x, y };
  };

  // ===== GESTURE HANDLERS =====
  const onPressIn = (event: any) => {
    if (disabled) return;

    const { pageX, pageY } = event.nativeEvent;
    setPressCoords({ x: pageX, y: pageY });

    // Start scale animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: longPressDuration,
      useNativeDriver: true,
    }).start();

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      triggerHaptic();
      onLongPress?.();
      showMenu(pageX, pageY);
    }, longPressDuration);
  };

  const onPressOut = () => {
    if (disabled) return;

    // Clear timer and reset scale
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    isLongPressing.current = false;
  };

  const onPanGestureEvent = (event: any) => {
    if (disabled) return;
    
    const { translationX, translationY } = event.nativeEvent;
    const distance = Math.sqrt(translationX * translationX + translationY * translationY);
    
    // Cancel long press if moved too far
    if (distance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onPressOut();
    }
  };

  const onPanHandlerStateChange = (event: any) => {
    if (disabled) return;
    
    const { state } = event.nativeEvent;
    
    if (state === State.END || state === State.CANCELLED) {
      onPressOut();
    }
  };

  // ===== SHOW MENU =====
  const showMenu = (gestureX: number, gestureY: number) => {
    const coords = calculateMenuPosition(gestureX, gestureY);
    setMenuCoords(coords);
    setMenuVisible(true);
    onMenuOpen?.();

    // Animate menu appearance
    Animated.parallel([
      Animated.spring(menuScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(menuOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ===== HIDE MENU =====
  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(menuScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
      onMenuClose?.();
    });
  };

  // ===== EXECUTE MENU ITEM =====
  const executeMenuItem = (item: LongPressMenuItem) => {
    if (item.disabled) return;

    // Haptic feedback for selection
    Haptics.selectionAsync();
    
    // Hide menu first, then execute action
    hideMenu();
    
    // Small delay to allow menu to close
    setTimeout(() => {
      item.onPress();
    }, 150);
  };

  // ===== RENDER MENU =====
  const renderMenu = () => {
    if (!menuVisible) return null;

    return (
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={hideMenu}
      >
        <TouchableWithoutFeedback onPress={hideMenu}>
          <Animated.View
            style={[
              componentStyles.overlay,
              { opacity: backgroundOpacity }
            ]}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  componentStyles.menu,
                  {
                    backgroundColor: styles.colors.surface,
                    borderColor: styles.colors.primary + '20',
                    left: menuCoords.x,
                    top: menuCoords.y,
                    opacity: menuOpacity,
                    transform: [{ scale: menuScale }],
                  }
                ]}
              >
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      componentStyles.menuItem,
                      index === menuItems.length - 1 && componentStyles.lastMenuItem,
                      item.disabled && componentStyles.disabledMenuItem,
                    ]}
                    onPress={() => executeMenuItem(item)}
                    disabled={item.disabled}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={
                        item.disabled
                          ? styles.colors.text + '40'
                          : item.destructive
                          ? '#ef4444'
                          : item.color || styles.colors.primary
                      }
                    />
                    <Text
                      style={[
                        componentStyles.menuItemText,
                        {
                          color: item.disabled
                            ? styles.colors.text + '40'
                            : item.destructive
                            ? '#ef4444'
                            : styles.colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        enabled={!disabled}
      >
        <Animated.View
          ref={childRef}
          style={[
            style,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
          onTouchStart={onPressIn}
          onTouchEnd={onPressOut}
          onTouchCancel={onPressOut}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
      
      {renderMenu()}
    </>
  );
};

// ===== COMPONENT STYLES =====
const componentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default LongPressMenu;

import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Animated,
  PanGestureHandler,
  State,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemedStyles } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const REFRESH_HEIGHT = 80;
const TRIGGER_HEIGHT = 120;

// ===== PULL TO REFRESH COMPONENT =====
export const PullToRefresh: React.FC<{
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  enabled?: boolean;
  pullDistance?: number;
  refreshText?: string;
  releaseText?: string;
  loadingText?: string;
  showLastUpdate?: boolean;
  lastUpdateTime?: Date;
  customIndicator?: React.ReactNode;
  style?: any;
}> = ({
  children,
  onRefresh,
  refreshing = false,
  enabled = true,
  pullDistance = TRIGGER_HEIGHT,
  refreshText = 'Desliza para actualizar',
  releaseText = 'Suelta para actualizar',
  loadingText = 'Actualizando...',
  showLastUpdate = true,
  lastUpdateTime,
  customIndicator,
  style
}) => {
  const styles = useThemedStyles();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(lastUpdateTime || null);
  
  // ===== ANIMATED VALUES =====
  const translateY = useRef(new Animated.Value(0)).current;
  const refreshProgress = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  // ===== REFS =====
  const scrollRef = useRef<ScrollView>(null);
  const currentTranslateY = useRef(0);
  const hasTriggered = useRef(false);

  // ===== GESTURE HANDLER =====
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationY } = event.nativeEvent;
        currentTranslateY.current = Math.max(0, translationY);
        
        // Update progress
        const progress = Math.min(1, currentTranslateY.current / pullDistance);
        refreshProgress.setValue(progress);

        // Haptic feedback when reaching trigger point
        if (currentTranslateY.current >= pullDistance && !hasTriggered.current) {
          hasTriggered.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (currentTranslateY.current < pullDistance && hasTriggered.current) {
          hasTriggered.current = false;
        }
      }
    }
  );

  const onHandlerStateChange = async (event: any) => {
    if (!enabled || isRefreshing) return;

    const { state, translationY } = event.nativeEvent;

    if (state === State.END || state === State.CANCELLED) {
      if (translationY >= pullDistance) {
        // Trigger refresh
        setIsRefreshing(true);
        
        // Animate to refresh position
        Animated.timing(translateY, {
          toValue: REFRESH_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Start spin animation
        spinValue.setValue(0);
        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();

        try {
          await onRefresh();
          setLastUpdated(new Date());
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.error('Error during refresh:', error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
          setIsRefreshing(false);
          
          // Reset to initial state
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(refreshProgress, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          
          spinValue.stopAnimation();
          hasTriggered.current = false;
        }
      } else {
        // Return to initial state
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(refreshProgress, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        
        hasTriggered.current = false;
      }
    }
  };

  // ===== RENDER REFRESH INDICATOR =====
  const renderRefreshIndicator = () => {
    if (customIndicator) {
      return customIndicator;
    }

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const arrowRotation = refreshProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const opacity = refreshProgress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.5, 1],
    });

    return (
      <Animated.View style={[
        componentStyles.refreshIndicator,
        {
          backgroundColor: styles.colors.surface,
          opacity,
        }
      ]}>
        {isRefreshing ? (
          <View style={componentStyles.refreshContent}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons
                name="refresh"
                size={24}
                color={styles.colors.primary}
              />
            </Animated.View>
            <Text style={[componentStyles.refreshText, { color: styles.colors.text }]}>
              {loadingText}
            </Text>
          </View>
        ) : (
          <View style={componentStyles.refreshContent}>
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <Ionicons
                name="arrow-down"
                size={24}
                color={styles.colors.primary}
              />
            </Animated.View>
            <Text style={[componentStyles.refreshText, { color: styles.colors.text }]}>
              {hasTriggered.current ? releaseText : refreshText}
            </Text>
          </View>
        )}
        
        {showLastUpdate && lastUpdated && (
          <Text style={[componentStyles.lastUpdateText, { color: styles.colors.text + '80' }]}>
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[componentStyles.container, style]}>
      {/* Refresh Indicator */}
      <Animated.View
        style={[
          componentStyles.refreshContainer,
          {
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, pullDistance],
                  outputRange: [-REFRESH_HEIGHT, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        {renderRefreshIndicator()}
      </Animated.View>

      {/* Scrollable Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={enabled && !isRefreshing}
        activeOffsetY={[0, 10]}
        failOffsetX={[-50, 50]}
      >
        <Animated.View
          style={[
            componentStyles.scrollContainer,
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, pullDistance],
                    outputRange: [0, pullDistance * 0.5],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            ref={scrollRef}
            style={componentStyles.scrollView}
            scrollEnabled={!isRefreshing}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// ===== COMPONENT STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  refreshContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: REFRESH_HEIGHT,
    zIndex: 1,
  },
  refreshIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  refreshContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastUpdateText: {
    fontSize: 12,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default PullToRefresh;

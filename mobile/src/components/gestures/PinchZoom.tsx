import React, { useRef } from 'react';
import {
  View,
  Animated,
  PinchGestureHandler,
  PanGestureHandler,
  State,
  Dimensions,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ===== PINCH ZOOM COMPONENT =====
export const PinchZoom: React.FC<{
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onZoomStart?: () => void;
  onZoomEnd?: (scale: number) => void;
  onDoubleTap?: () => void;
  disabled?: boolean;
  resetOnDoubleTap?: boolean;
  style?: any;
}> = ({
  children,
  minScale = 1,
  maxScale = 5,
  initialScale = 1,
  onZoomStart,
  onZoomEnd,
  onDoubleTap,
  disabled = false,
  resetOnDoubleTap = true,
  style
}) => {
  // ===== ANIMATED VALUES =====
  const scale = useRef(new Animated.Value(initialScale)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // ===== REFS =====
  const lastScale = useRef(initialScale);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const isZooming = useRef(false);
  const doubleTapRef = useRef<any>(null);
  const lastTap = useRef(0);

  // ===== PINCH GESTURE HANDLER =====
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (disabled) return;

    const { state, scale: gestureScale } = event.nativeEvent;

    if (state === State.BEGAN) {
      isZooming.current = true;
      onZoomStart?.();
      Haptics.selectionAsync();
    }

    if (state === State.END || state === State.CANCELLED) {
      const currentScale = lastScale.current * gestureScale;
      let finalScale = Math.max(minScale, Math.min(maxScale, currentScale));

      // Snap to bounds if close
      if (finalScale < minScale * 1.1) {
        finalScale = minScale;
      }
      if (finalScale > maxScale * 0.9) {
        finalScale = maxScale;
      }

      lastScale.current = finalScale;
      isZooming.current = false;

      // Reset scale animation
      scale.setValue(finalScale);

      // Handle translation bounds
      const maxTranslateX = (screenWidth * (finalScale - 1)) / 2;
      const maxTranslateY = (screenHeight * (finalScale - 1)) / 2;

      let finalTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, lastTranslateX.current));
      let finalTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, lastTranslateY.current));

      // If zoomed out completely, center the image
      if (finalScale === minScale) {
        finalTranslateX = 0;
        finalTranslateY = 0;
      }

      lastTranslateX.current = finalTranslateX;
      lastTranslateY.current = finalTranslateY;

      // Animate to final position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: finalTranslateX,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: finalTranslateY,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      onZoomEnd?.(finalScale);
    }
  };

  // ===== PAN GESTURE HANDLER =====
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (disabled || lastScale.current <= minScale) return;

    const { state, translationX: gestureTranslateX, translationY: gestureTranslateY } = event.nativeEvent;

    if (state === State.END || state === State.CANCELLED) {
      const maxTranslateX = (screenWidth * (lastScale.current - 1)) / 2;
      const maxTranslateY = (screenHeight * (lastScale.current - 1)) / 2;

      const finalTranslateX = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, lastTranslateX.current + gestureTranslateX)
      );
      const finalTranslateY = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, lastTranslateY.current + gestureTranslateY)
      );

      lastTranslateX.current = finalTranslateX;
      lastTranslateY.current = finalTranslateY;

      // Animate to bounds if needed
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: finalTranslateX,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: finalTranslateY,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  };

  // ===== DOUBLE TAP HANDLER =====
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (resetOnDoubleTap) {
        // Reset to initial state
        resetZoom();
      }
      
      onDoubleTap?.();
    }

    lastTap.current = now;
  };

  // ===== RESET ZOOM =====
  const resetZoom = () => {
    lastScale.current = initialScale;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: initialScale,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  return (
    <View style={[componentStyles.container, style]}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        enabled={!disabled && lastScale.current > minScale}
        minPointers={1}
        maxPointers={1}
      >
        <Animated.View style={componentStyles.panContainer}>
          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
            enabled={!disabled}
          >
            <Animated.View
              style={[
                componentStyles.content,
                {
                  transform: [
                    { scale: scale },
                    { translateX: translateX },
                    { translateY: translateY },
                  ],
                }
              ]}
              onTouchEnd={handleTap}
            >
              {children}
            </Animated.View>
          </PinchGestureHandler>
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
  panContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default PinchZoom;

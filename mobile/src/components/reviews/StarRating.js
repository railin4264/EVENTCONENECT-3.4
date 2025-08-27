import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 20,
  color = '#fbbf24',
  emptyColor = '#6b7280',
  onRatingPress,
  editable = false,
  style,
}) => {
  const handleStarPress = (starIndex) => {
    if (editable && onRatingPress) {
      onRatingPress(starIndex + 1);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 0; i < maxRating; i++) {
      const isFilled = i < Math.floor(rating);
      const isHalfFilled = i === Math.floor(rating) && rating % 1 !== 0;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          disabled={!editable}
          style={styles.starTouchable}
          activeOpacity={editable ? 0.7 : 1}
        >
          <View style={styles.starContainer}>
            {/* Base star (empty) */}
            <Star
              size={size}
              color={emptyColor}
              fill="transparent"
              style={styles.starBase}
            />
            
            {/* Filled star */}
            {isFilled && (
              <Star
                size={size}
                color={color}
                fill={color}
                style={[styles.starFilled, { position: 'absolute' }]}
              />
            )}
            
            {/* Half filled star */}
            {isHalfFilled && (
              <View style={[styles.halfStarContainer, { width: size / 2 }]}>
                <Star
                  size={size}
                  color={color}
                  fill={color}
                  style={[styles.starFilled, { position: 'absolute' }]}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouchable: {
    marginRight: 2,
  },
  starContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBase: {
    // Base star styling
  },
  starFilled: {
    // Filled star styling
  },
  halfStarContainer: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
});

export default StarRating;












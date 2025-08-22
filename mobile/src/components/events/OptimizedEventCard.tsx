import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Event, EventCardProps } from '../../types';

// ===== CONFIGURACIÓN =====
const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = screenWidth - (CARD_MARGIN * 2);

// ===== TEMA MÓVIL =====
const theme = {
  colors: {
    primary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  borderRadius: 8,
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
  }
};

// ===== COMPONENTE PRINCIPAL =====
export const OptimizedEventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  onPress,
  showActions = true
}) => {
  // Estados
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Valores animados
  const scale = useSharedValue(1);
  const likeScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  // Helpers
  const getEventImage = () => {
    if (event.image) return { uri: event.image };
    return { uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&q=80' };
  };

  const getEventPrice = () => {
    if (event.price === 0) return 'GRATIS';
    return `€${event.price}`;
  };

  const formatEventDate = () => {
    const date = new Date(event.date);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getLocationText = () => {
    if (typeof event.location === 'string') return event.location;
    if (typeof event.location === 'object') {
      return event.location.venue || event.location.city || 'Ubicación por definir';
    }
    return 'Ubicación por definir';
  };

  // Handlers
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress?.(event);
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLiked(!isLiked);
    likeScale.value = withSpring(1.2, {}, () => {
      likeScale.value = withSpring(1);
    });
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSaved(!isSaved);
    saveScale.value = withSpring(1.2, {}, () => {
      saveScale.value = withSpring(1);
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este evento increíble! ${event.title}`,
        url: `https://eventconnect.app/events/${event.id}`,
        title: event.title
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  // Estilos animados
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }]
  }));

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }]
  }));

  // Renderizado compacto
  if (variant === 'compact') {
    return (
      <Animated.View style={[styles.compactCard, cardAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.compactContent}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.compactImageContainer}>
            <Image source={getEventImage()} style={styles.compactImage} />
            <View style={styles.compactPriceTag}>
              <Text style={styles.compactPriceText}>{getEventPrice()}</Text>
            </View>
          </View>
          
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={styles.compactMeta}>
              {formatEventDate()} • {getLocationText()}
            </Text>
            <Text style={styles.compactAttendees}>
              {event.attendees?.toLocaleString()} asistentes
            </Text>
          </View>
          
          {showActions && (
            <View style={styles.compactActions}>
              <Animated.View style={likeAnimatedStyle}>
                <TouchableOpacity onPress={handleLike} style={styles.compactActionButton}>
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isLiked ? theme.colors.error : theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Renderizado principal
  return (
    <Animated.View style={[styles.card, cardAnimatedStyle]}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.cardContent}
      >
        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          <Image source={getEventImage()} style={styles.image} />
          
          {/* Overlay gradiente */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          
          {/* Badges superiores */}
          <View style={styles.badgeContainer}>
            {event.isPopular && (
              <View style={[styles.badge, styles.popularBadge]}>
                <Ionicons name="flame" size={12} color="white" />
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            )}
            {event.isTrending && (
              <View style={[styles.badge, styles.trendingBadge]}>
                <Ionicons name="trending-up" size={12} color="white" />
                <Text style={styles.badgeText}>Trending</Text>
              </View>
            )}
          </View>
          
          {/* Precio */}
          <View style={styles.priceContainer}>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{getEventPrice()}</Text>
            </View>
          </View>
          
          {/* Amigos asistiendo */}
          {event.friendsAttending && event.friendsAttending > 0 && (
            <View style={styles.friendsContainer}>
              <View style={styles.friendsBadge}>
                <Ionicons name="heart" size={12} color="white" />
                <Text style={styles.friendsText}>
                  {event.friendsAttending} amigo{event.friendsAttending > 1 ? 's' : ''} va{event.friendsAttending > 1 ? 'n' : ''}
                </Text>
              </View>
            </View>
          )}
          
          {/* Acciones rápidas */}
          {showActions && (
            <View style={styles.quickActions}>
              <Animated.View style={likeAnimatedStyle}>
                <TouchableOpacity 
                  onPress={handleLike}
                  style={[styles.actionButton, isLiked && styles.actionButtonActive]}
                >
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={saveAnimatedStyle}>
                <TouchableOpacity 
                  onPress={handleSave}
                  style={[styles.actionButton, isSaved && styles.actionButtonSaved]}
                >
                  <Ionicons 
                    name={isSaved ? "bookmark" : "bookmark-outline"} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </View>
        
        {/* Contenido */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          
          {event.description && (
            <Text style={styles.description} numberOfLines={2}>
              {event.description}
            </Text>
          )}
          
          {/* Información del evento */}
          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>{formatEventDate()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {getLocationText()}
                {event.distance && ` • ${event.distance}`}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                {event.attendees?.toLocaleString()} asistentes
              </Text>
            </View>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.categoryContainer}>
              <View style={styles.categoryIcon}>
                <Ionicons name="pricetag-outline" size={14} color={theme.colors.primary} />
              </View>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            
            {showActions && (
              <TouchableOpacity 
                onPress={handleShare}
                style={styles.shareButton}
              >
                <Ionicons name="share-outline" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Host info */}
          <View style={styles.hostInfo}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostInitial}>
                {event.host?.name?.charAt(0) || 'O'}
              </Text>
            </View>
            <Text style={styles.hostName}>
              {event.host?.name || 'Organizador'}
            </Text>
            
            {event.host?.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {event.host.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ===== ESTILOS =====
const styles = StyleSheet.create({
  // Estilos principales
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  
  cardContent: {
    flex: 1
  },
  
  // Imagen
  imageContainer: {
    position: 'relative',
    height: 200
  },
  
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80
  },
  
  // Badges
  badgeContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    gap: 4
  },
  
  popularBadge: {
    backgroundColor: theme.colors.error
  },
  
  trendingBadge: {
    backgroundColor: theme.colors.success
  },
  
  badgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '600'
  },
  
  // Precio
  priceContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md
  },
  
  priceTag: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16
  },
  
  priceText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold'
  },
  
  // Amigos
  friendsContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md
  },
  
  friendsBadge: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    gap: 4
  },
  
  friendsText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '500'
  },
  
  // Acciones rápidas
  quickActions: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.xl + 60, // Offset por el precio
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  
  actionButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  actionButtonActive: {
    backgroundColor: theme.colors.error
  },
  
  actionButtonSaved: {
    backgroundColor: theme.colors.primary
  },
  
  // Contenido
  content: {
    padding: theme.spacing.lg
  },
  
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md
  },
  
  // Información del evento
  eventInfo: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  
  categoryIcon: {
    width: 24,
    height: 24,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary
  },
  
  shareButton: {
    padding: theme.spacing.sm
  },
  
  // Host info
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  
  hostAvatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  hostInitial: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  
  hostName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  
  ratingText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  
  // Estilos compactos
  compactCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  
  compactContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center'
  },
  
  compactImageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius,
    overflow: 'hidden'
  },
  
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  
  compactPriceTag: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8
  },
  
  compactPriceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  
  compactInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    gap: 2
  },
  
  compactTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text
  },
  
  compactMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },
  
  compactAttendees: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },
  
  compactActions: {
    marginLeft: theme.spacing.sm
  },
  
  compactActionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default OptimizedEventCard;
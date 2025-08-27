import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageCircle,
  MoreVertical,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react-native';

import StarRating from './StarRating';
import reviewsService from '../../services/ReviewsService';

const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  onLike,
  onReport,
  onReply,
  currentUserId,
  showActions = true,
  style,
}) => {
  const [isLiked, setIsLiked] = useState(review.isLiked || false);
  const [likesCount, setLikesCount] = useState(review.likesCount || 0);
  const [isHelpful, setIsHelpful] = useState(review.isHelpful || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [showFullText, setShowFullText] = useState(false);

  const isOwnReview = currentUserId === review.author._id;
  const truncatedText = review.content?.length > 200 
    ? review.content.substring(0, 200) + '...'
    : review.content;

  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

      if (newLikedState) {
        await reviewsService.likeReview(review._id);
      } else {
        await reviewsService.unlikeReview(review._id);
      }

      if (onLike) onLike(review._id, newLikedState);
    } catch (error) {
      // Revert changes on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      Alert.alert('Error', error.message);
    }
  };

  const handleHelpful = async () => {
    try {
      const newHelpfulState = !isHelpful;
      setIsHelpful(newHelpfulState);
      setHelpfulCount(prev => newHelpfulState ? prev + 1 : prev - 1);

      if (newHelpfulState) {
        await reviewsService.markReviewAsHelpful(review._id);
      } else {
        await reviewsService.unmarkReviewAsHelpful(review._id);
      }
    } catch (error) {
      // Revert changes on error
      setIsHelpful(!isHelpful);
      setHelpfulCount(prev => isHelpful ? prev + 1 : prev - 1);
      Alert.alert('Error', error.message);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Reportar Review',
      '¿Por qué quieres reportar este review?',
      [
        { text: 'Spam', onPress: () => reportReview('spam') },
        { text: 'Contenido inapropiado', onPress: () => reportReview('inappropriate') },
        { text: 'Información falsa', onPress: () => reportReview('misinformation') },
        { text: 'Acoso', onPress: () => reportReview('harassment') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const reportReview = async (reason) => {
    try {
      await reviewsService.reportReview(review._id, reason);
      Alert.alert('Éxito', 'Review reportado correctamente');
      if (onReport) onReport(review._id, reason);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleMoreOptions = () => {
    const options = [];

    if (isOwnReview) {
      options.push({ text: 'Editar', onPress: () => onEdit?.(review) });
      options.push({ 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Eliminar Review',
            '¿Estás seguro de que quieres eliminar este review?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => onDelete?.(review._id) }
            ]
          );
        }
      });
    } else {
      options.push({ text: 'Reportar', onPress: handleReport });
    }

    options.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Opciones', '', options);
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.cardGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <Image
              source={{ uri: review.author.avatar || 'https://via.placeholder.com/40' }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{review.author.name}</Text>
              <View style={styles.reviewMeta}>
                <Calendar size={12} color="#9ca3af" />
                <Text style={styles.reviewDate}>
                  {reviewsService.formatReviewDate(review.createdAt)}
                </Text>
                {review.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verificado</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {showActions && (
            <TouchableOpacity onPress={handleMoreOptions}>
              <MoreVertical size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <StarRating
            rating={review.rating}
            size={16}
            color="#fbbf24"
            emptyColor="#6b7280"
          />
          <Text style={styles.ratingText}>
            {reviewsService.formatRating(review.rating)} • {reviewsService.getRatingText(review.rating)}
          </Text>
        </View>

        {/* Content */}
        {review.content && (
          <View style={styles.contentContainer}>
            <Text style={styles.reviewContent}>
              {showFullText ? review.content : truncatedText}
            </Text>
            
            {review.content.length > 200 && (
              <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
                <Text style={styles.readMoreText}>
                  {showFullText ? 'Ver menos' : 'Leer más'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {review.images.slice(0, 3).map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.reviewImage}
              />
            ))}
            {review.images.length > 3 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{review.images.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {review.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, isLiked && styles.activeActionButton]}
              onPress={handleLike}
            >
              <ThumbsUp
                size={16}
                color={isLiked ? "#67e8f9" : "#9ca3af"}
                fill={isLiked ? "#67e8f9" : "transparent"}
              />
              <Text style={[styles.actionText, isLiked && styles.activeActionText]}>
                {likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isHelpful && styles.activeActionButton]}
              onPress={handleHelpful}
            >
              <ThumbsUp
                size={16}
                color={isHelpful ? "#22c55e" : "#9ca3af"}
                fill={isHelpful ? "#22c55e" : "transparent"}
              />
              <Text style={[styles.actionText, isHelpful && styles.activeActionText]}>
                Útil ({helpfulCount})
              </Text>
            </TouchableOpacity>

            {onReply && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onReply(review)}
              >
                <MessageCircle size={16} color="#9ca3af" />
                <Text style={styles.actionText}>Responder</Text>
              </TouchableOpacity>
            )}

            <View style={styles.spacer} />

            {!isOwnReview && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReport}
              >
                <Flag size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Responses count */}
        {review.responsesCount > 0 && (
          <TouchableOpacity style={styles.responsesButton}>
            <Text style={styles.responsesText}>
              Ver {review.responsesCount} respuesta{review.responsesCount !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#d1d5db',
    marginLeft: 8,
    fontWeight: '500',
  },
  contentContainer: {
    marginBottom: 12,
  },
  reviewContent: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  moreImagesOverlay: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#67e8f9',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  activeActionButton: {
    backgroundColor: 'rgba(103, 232, 249, 0.1)',
  },
  actionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeActionText: {
    color: '#67e8f9',
  },
  spacer: {
    flex: 1,
  },
  responsesButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  responsesText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '500',
  },
});

export default ReviewCard;












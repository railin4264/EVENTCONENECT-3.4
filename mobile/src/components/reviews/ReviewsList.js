import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Star, Filter, TrendingUp, Clock, ThumbsUp } from 'lucide-react-native';

import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import reviewsService from '../../services/ReviewsService';
import { useAuth } from '../../contexts/AuthContext';

const ReviewsList = ({
  targetType, // 'events', 'tribes'
  targetId,
  showHeader = true,
  showStats = true,
  showFilters = true,
  itemsPerPage = 20,
  onReviewCreated,
  onReviewUpdated,
  onReviewDeleted,
  style,
}) => {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'rating', 'helpful'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc', 'asc'
  const [ratingFilter, setRatingFilter] = useState(null); // 1-5 or null for all
  
  useEffect(() => {
    loadInitialData();
  }, [targetType, targetId, sortBy, sortOrder, ratingFilter]);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadReviews(true),
      loadStats()
    ]);
    setIsLoading(false);
  };

  const loadReviews = async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setReviews([]);
      }

      const currentPage = reset ? 1 : page;
      let response;

      if (targetType === 'events') {
        response = await reviewsService.getEventReviews(
          targetId, 
          currentPage, 
          itemsPerPage, 
          sortBy, 
          sortOrder
        );
      } else if (targetType === 'tribes') {
        response = await reviewsService.getTribeReviews(
          targetId, 
          currentPage, 
          itemsPerPage, 
          sortBy, 
          sortOrder
        );
      }

      let newReviews = response.data || [];

      // Apply rating filter if set
      if (ratingFilter) {
        newReviews = newReviews.filter(review => 
          Math.floor(review.rating) === ratingFilter
        );
      }

      if (reset) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setHasMore(newReviews.length === itemsPerPage);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Error', 'No se pudieron cargar los reviews');
    }
  };

  const loadStats = async () => {
    try {
      let response;
      
      if (targetType === 'events') {
        response = await reviewsService.getEventReviewStats(targetId);
      } else if (targetType === 'tribes') {
        response = await reviewsService.getTribeReviewStats(targetId);
      }

      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  const handleReviewEdit = (review) => {
    // Navigate to edit review screen or open modal
    console.log('Edit review:', review._id);
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await reviewsService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      await loadStats(); // Refresh stats
      
      if (onReviewDeleted) onReviewDeleted(reviewId);
      Alert.alert('Éxito', 'Review eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleReviewLike = async (reviewId, isLiked) => {
    // Update local state immediately for better UX
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { 
            ...review, 
            isLiked,
            likesCount: isLiked ? review.likesCount + 1 : review.likesCount - 1
          }
        : review
    ));
  };

  const handleReviewReport = async (reviewId, reason) => {
    // Optionally hide the review from the list
    console.log('Review reported:', reviewId, reason);
  };

  const handleReviewReply = (review) => {
    // Navigate to reply screen or open modal
    console.log('Reply to review:', review._id);
  };

  const renderStatsHeader = () => {
    if (!showStats || !stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.overallRating}>
          <Text style={styles.averageRatingText}>
            {reviewsService.formatRating(stats.averageRating)}
          </Text>
          <StarRating
            rating={stats.averageRating}
            size={20}
            color="#fbbf24"
            emptyColor="#6b7280"
            style={styles.starsContainer}
          />
          <Text style={styles.totalReviewsText}>
            {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Rating distribution */}
        <View style={styles.distributionContainer}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.ratingDistribution?.[rating] || 0;
            const percentage = stats.totalReviews > 0 
              ? Math.round((count / stats.totalReviews) * 100) 
              : 0;

            return (
              <TouchableOpacity
                key={rating}
                style={styles.distributionRow}
                onPress={() => setRatingFilter(ratingFilter === rating ? null : rating)}
              >
                <Text style={styles.ratingNumber}>{rating}</Text>
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${percentage}%`,
                        backgroundColor: ratingFilter === rating ? '#67e8f9' : '#fbbf24'
                      }
                    ]} 
                  />
                </View>
                
                <Text style={styles.countText}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Ordenar por:</Text>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'createdAt' && styles.activeFilterButton
            ]}
            onPress={() => setSortBy('createdAt')}
          >
            <Clock size={16} color={sortBy === 'createdAt' ? '#ffffff' : '#9ca3af'} />
            <Text style={[
              styles.filterButtonText,
              sortBy === 'createdAt' && styles.activeFilterButtonText
            ]}>
              Más recientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'rating' && styles.activeFilterButton
            ]}
            onPress={() => setSortBy('rating')}
          >
            <Star size={16} color={sortBy === 'rating' ? '#ffffff' : '#9ca3af'} />
            <Text style={[
              styles.filterButtonText,
              sortBy === 'rating' && styles.activeFilterButtonText
            ]}>
              Mejor calificados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'helpful' && styles.activeFilterButton
            ]}
            onPress={() => setSortBy('helpful')}
          >
            <ThumbsUp size={16} color={sortBy === 'helpful' ? '#ffffff' : '#9ca3af'} />
            <Text style={[
              styles.filterButtonText,
              sortBy === 'helpful' && styles.activeFilterButtonText
            ]}>
              Más útiles
            </Text>
          </TouchableOpacity>
        </View>

        {ratingFilter && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFilterText}>
              Filtrando por {ratingFilter} estrella{ratingFilter !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              onPress={() => setRatingFilter(null)}
              style={styles.clearFilterButton}
            >
              <Text style={styles.clearFilterText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <ReviewCard
      review={item}
      currentUserId={user?._id}
      onEdit={handleReviewEdit}
      onDelete={handleReviewDelete}
      onLike={handleReviewLike}
      onReport={handleReviewReport}
      onReply={handleReviewReply}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Star size={64} color="#6b7280" />
      <Text style={styles.emptyStateTitle}>
        {ratingFilter ? 'No hay reviews con esta calificación' : 'No hay reviews aún'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {ratingFilter 
          ? 'Prueba con una calificación diferente'
          : 'Sé el primero en dejar un review'
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View>
      {renderStatsHeader()}
      {renderFilters()}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={showHeader ? renderHeader : null}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#67e8f9"
          />
        }
        onEndReached={() => {
          if (hasMore && !isLoading) {
            loadReviews(false);
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 16,
  },
  averageRatingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  starsContainer: {
    marginBottom: 8,
  },
  totalReviewsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '500',
    width: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  countText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    width: 32,
    textAlign: 'right',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterButton: {
    backgroundColor: '#67e8f9',
    borderColor: '#67e8f9',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '500',
  },
  clearFilterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReviewsList;










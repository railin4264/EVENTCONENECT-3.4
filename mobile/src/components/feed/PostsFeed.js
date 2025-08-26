import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart,
  MessageCircle,
  Share as ShareIcon,
  Bookmark,
  MoreVertical,
  Clock,
  MapPin,
  Users,
  Eye,
  TrendingUp
} from 'lucide-react-native';

import postsService from '../../services/PostsService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onLike, onSave, onComment, onShare, onMoreOptions }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      await onLike(post._id, newLikedState);
    } catch (error) {
      // Revertir cambios si falla
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      Alert.alert('Error', error.message);
    }
  };

  const handleSave = async () => {
    try {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      await onSave(post._id, newSavedState);
    } catch (error) {
      setIsSaved(!isSaved);
      Alert.alert('Error', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1h';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <View style={styles.postCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.cardGradient}
      >
        {/* Header del post */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: post.author?.avatar || 'https://via.placeholder.com/40' }} 
              style={styles.authorAvatar}
            />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>
                {post.author?.name || 'Usuario'}
              </Text>
              <View style={styles.postMeta}>
                <Clock size={12} color="#9ca3af" />
                <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
                
                {post.location && (
                  <>
                    <Text style={styles.metaSeparator}>•</Text>
                    <MapPin size={12} color="#9ca3af" />
                    <Text style={styles.locationText}>{post.location}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => onMoreOptions(post)}
          >
            <MoreVertical size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Contenido del post */}
        <View style={styles.postContent}>
          {post.content && (
            <Text style={styles.postText}>{post.content}</Text>
          )}
          
          {/* Imágenes del post */}
          {post.images && post.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {post.images.length === 1 ? (
                <Image 
                  source={{ uri: post.images[0] }} 
                  style={styles.singleImage}
                />
              ) : (
                <View style={styles.multipleImages}>
                  {post.images.slice(0, 4).map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: image }} 
                        style={styles.multiImage}
                      />
                      {index === 3 && post.images.length > 4 && (
                        <View style={styles.moreImagesOverlay}>
                          <Text style={styles.moreImagesText}>
                            +{post.images.length - 4}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {post.hashtags.map((hashtag, index) => (
                <TouchableOpacity key={index} style={styles.hashtagButton}>
                  <Text style={styles.hashtagText}>#{hashtag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Contexto del post (Evento/Tribu) */}
          {(post.event || post.tribe) && (
            <View style={styles.contextContainer}>
              {post.event && (
                <View style={styles.contextTag}>
                  <Text style={styles.contextText}>📅 {post.event.title}</Text>
                </View>
              )}
              {post.tribe && (
                <View style={styles.contextTag}>
                  <Text style={styles.contextText}>👥 {post.tribe.name}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Estadísticas del post */}
        <View style={styles.postStats}>
          <View style={styles.statsLeft}>
            <View style={styles.statItem}>
              <Heart size={16} color="#ef4444" />
              <Text style={styles.statText}>{likesCount}</Text>
            </View>
            
            <View style={styles.statItem}>
              <MessageCircle size={16} color="#67e8f9" />
              <Text style={styles.statText}>{post.commentsCount || 0}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Eye size={16} color="#9ca3af" />
              <Text style={styles.statText}>{post.viewsCount || 0}</Text>
            </View>
          </View>

          {post.isPopular && (
            <View style={styles.popularBadge}>
              <TrendingUp size={14} color="#fbbf24" />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>

        {/* Acciones del post */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <Heart 
              size={24} 
              color={isLiked ? "#ef4444" : "#9ca3af"}
              fill={isLiked ? "#ef4444" : "transparent"}
            />
            <Text style={[
              styles.actionText,
              isLiked && styles.actionTextActive
            ]}>
              Me gusta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onComment(post)}
          >
            <MessageCircle size={24} color="#9ca3af" />
            <Text style={styles.actionText}>Comentar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare(post)}
          >
            <ShareIcon size={24} color="#9ca3af" />
            <Text style={styles.actionText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, isSaved && styles.actionButtonActive]}
            onPress={handleSave}
          >
            <Bookmark 
              size={24} 
              color={isSaved ? "#fbbf24" : "#9ca3af"}
              fill={isSaved ? "#fbbf24" : "transparent"}
            />
            <Text style={[
              styles.actionText,
              isSaved && styles.actionTextActive
            ]}>
              Guardar
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const PostsFeed = ({ 
  feedType = 'personalized', // 'personalized', 'trending', 'event', 'tribe'
  contextId = null, // eventId o tribeId
  refreshTrigger = 0 
}) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts(true);
  }, [feedType, contextId, refreshTrigger]);

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setPosts([]);
      }

      let response;
      const currentPage = reset ? 1 : page;

      switch (feedType) {
        case 'trending':
          response = await postsService.getTrendingPosts();
          break;
        case 'event':
          if (contextId) {
            response = await postsService.getEventPosts(contextId, currentPage);
          }
          break;
        case 'tribe':
          if (contextId) {
            response = await postsService.getTribePosts(contextId, currentPage);
          }
          break;
        case 'saved':
          response = await postsService.getSavedPosts(currentPage);
          break;
        default:
          response = await postsService.getPersonalizedFeed(currentPage);
      }

      const newPosts = response?.data || [];
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 20);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'No se pudieron cargar los posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPosts(true);
    setIsRefreshing(false);
  };

  const handleLike = async (postId, isLiking) => {
    try {
      if (isLiking) {
        await postsService.likePost(postId);
      } else {
        await postsService.unlikePost(postId);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSave = async (postId, isSaving) => {
    try {
      if (isSaving) {
        await postsService.savePost(postId);
      } else {
        await postsService.unsavePost(postId);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleComment = (post) => {
    // Navegar a pantalla de comentarios
    console.log('Open comments for post:', post._id);
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `${post.content}\n\nVía EventConnect`,
        url: `https://eventconnect.app/posts/${post._id}`,
      });
      
      await postsService.sharePost(post._id);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleMoreOptions = (post) => {
    Alert.alert(
      'Opciones',
      '',
      [
        { text: 'Reportar', onPress: () => handleReport(post._id) },
        { text: 'Ocultar', onPress: () => handleHidePost(post._id) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleReport = (postId) => {
    Alert.alert(
      'Reportar Post',
      '¿Por qué quieres reportar este post?',
      [
        { text: 'Spam', onPress: () => reportPost(postId, 'spam') },
        { text: 'Contenido inapropiado', onPress: () => reportPost(postId, 'inappropriate') },
        { text: 'Acoso', onPress: () => reportPost(postId, 'harassment') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const reportPost = async (postId, reason) => {
    try {
      await postsService.reportPost(postId, reason);
      Alert.alert('Éxito', 'Post reportado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onShare={handleShare}
      onMoreOptions={handleMoreOptions}
    />
  );

  if (posts.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyState}>
        <Users size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No hay posts aún</Text>
        <Text style={styles.emptyText}>
          {feedType === 'saved' 
            ? 'No tienes posts guardados' 
            : 'Sé el primero en compartir algo'
          }
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.feedContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#67e8f9"
        />
      }
      onEndReached={() => {
        if (hasMore && !isLoading) {
          loadPosts(false);
        }
      }}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    paddingBottom: 20,
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
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
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  metaSeparator: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    paddingHorizontal: 16,
  },
  postText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  multipleImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  multiImage: {
    width: (width - 40) / 2 - 2,
    height: 120,
    borderRadius: 8,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  hashtagButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 6,
  },
  hashtagText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '500',
  },
  contextContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  contextTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 6,
  },
  contextText: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    color: '#fbbf24',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonActive: {
    // Estilos para botones activos
  },
  actionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#67e8f9',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PostsFeed;


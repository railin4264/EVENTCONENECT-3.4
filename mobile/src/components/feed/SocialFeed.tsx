import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  RefreshControl,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';
import { MorphingCard } from '../advanced-systems/FluidTransitions';

interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  eventId?: string;
  eventName?: string;
  type: 'text' | 'image' | 'event' | 'achievement';
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
}

export const SocialFeed: React.FC = () => {
  const { currentTheme } = useDynamicTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Generar posts de ejemplo
  useEffect(() => {
    generateSamplePosts();
  }, []);

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const generateSamplePosts = () => {
    const samplePosts: Post[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'María García',
        userAvatar: '👩‍🎨',
        content: '¡Acabo de crear mi primer evento de arte! Será una exposición increíble con artistas locales. ¿Quién se anima a venir? 🎨✨',
        likes: 24,
        comments: 8,
        shares: 3,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        eventId: 'event1',
        eventName: 'Exposición de Arte Local',
        type: 'event'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'Carlos Rodríguez',
        userAvatar: '👨‍💻',
        content: 'Increíble experiencia en el meetup de tecnología ayer. Aprendí mucho sobre React Native y conocí gente genial. ¡Gracias a todos! 🚀',
        image: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Tech+Meetup',
        likes: 42,
        comments: 15,
        shares: 7,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
        type: 'image'
      },
      {
        id: '3',
        userId: 'user3',
        username: 'Ana Martínez',
        userAvatar: '👩‍🏃‍♀️',
        content: '¡Logro desbloqueado! 🏆 Completé mi primer maratón de 5K. Gracias a todos los que me apoyaron en este viaje. ¡Siguiente meta: 10K! 💪',
        likes: 67,
        comments: 23,
        shares: 12,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
        type: 'achievement'
      },
      {
        id: '4',
        userId: 'user4',
        username: 'Luis Fernández',
        userAvatar: '👨‍🎵',
        content: 'Noche increíble en el concierto de jazz. La música nos conecta de una manera especial. ¿Cuál fue tu último concierto memorable? 🎷🎵',
        likes: 31,
        comments: 11,
        shares: 5,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
        type: 'text'
      },
      {
        id: '5',
        userId: 'user5',
        username: 'Sofia López',
        userAvatar: '👩‍🌱',
        content: 'Organizando un evento de networking para emprendedores. Será el próximo sábado en el centro de la ciudad. ¡Perfecto para hacer conexiones valiosas! 🤝💼',
        likes: 28,
        comments: 9,
        shares: 4,
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 horas atrás
        eventId: 'event2',
        eventName: 'Networking Emprendedores',
        type: 'event'
      }
    ];

    setPosts(samplePosts);
  };

  const generateSampleComments = () => {
    const sampleComments: Comment[] = [
      {
        id: 'c1',
        userId: 'user2',
        username: 'Carlos Rodríguez',
        userAvatar: '👨‍💻',
        content: '¡Me encanta la idea! Definitivamente estaré ahí 🎨',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        likes: 3
      },
      {
        id: 'c2',
        userId: 'user3',
        username: 'Ana Martínez',
        userAvatar: '👩‍🏃‍♀️',
        content: '¡Cuenta conmigo! El arte local necesita más visibilidad ✨',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        likes: 5
      },
      {
        id: 'c3',
        userId: 'user4',
        username: 'Luis Fernández',
        userAvatar: '👨‍🎵',
        content: '¿Habrá música en vivo también? 🎵',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        likes: 2
      }
    ];

    setComments(sampleComments);
  };

  const handleLike = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (selectedPost?.id === postId) {
      setShowComments(!showComments);
    } else {
      setSelectedPost(posts.find(p => p.id === postId) || null);
      setShowComments(true);
      generateSampleComments();
    }
  };

  const handleShare = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateSamplePosts();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <Animated.View
      style={[
        styles.postContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MorphingCard style={styles.postCard}>
        {/* Header del post */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userAvatar}>{post.userAvatar}</Text>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{post.username}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
            </View>
          </View>
          
          {post.type === 'event' && (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>🎉 Evento</Text>
            </View>
          )}
        </View>

        {/* Contenido del post */}
        <View style={styles.postContent}>
          <Text style={styles.postText}>{post.content}</Text>
          
          {post.image && (
            <Image 
              source={{ uri: post.image }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
          
          {post.eventName && (
            <View style={styles.eventInfo}>
              <LinearGradient
                colors={currentTheme.gradients.secondary}
                style={styles.eventInfoGradient}
              >
                <Text style={styles.eventInfoTitle}>📅 {post.eventName}</Text>
                <Text style={styles.eventInfoSubtitle}>Haz clic para más detalles</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Acciones del post */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(post.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(post.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
      </MorphingCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header del feed */}
      <LinearGradient
        colors={currentTheme.gradients.primary}
        style={styles.feedHeader}
      >
        <Text style={styles.feedTitle}>Feed Social</Text>
        <Text style={styles.feedSubtitle}>Conecta con tu comunidad</Text>
      </LinearGradient>

      {/* Feed principal */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.feedList}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.colors.primary]}
            tintColor={currentTheme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Panel de comentarios */}
      {showComments && selectedPost && (
        <Animated.View
          style={[
            styles.commentsPanel,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={currentTheme.gradients.secondary}
            style={styles.commentsPanelGradient}
          >
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comentarios</Text>
              <TouchableOpacity
                onPress={() => setShowComments(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentAvatar}>{comment.userAvatar}</Text>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{comment.username}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <Text style={styles.commentTimestamp}>
                      {formatTimestamp(comment.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input para nuevo comentario */}
            <View style={styles.commentInput}>
              <Text style={styles.commentInputPlaceholder}>
                Escribe un comentario...
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Botón flotante para crear post */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.floatingButtonGradient}
        >
          <Text style={styles.floatingButtonIcon}>✏️</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  feedHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  feedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  feedSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  feedList: {
    flex: 1,
  },
  feedContent: {
    padding: 20,
  },
  postContainer: {
    marginBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    marginBottom: 16,
  },
  postText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventInfo: {
    marginTop: 12,
  },
  eventInfoGradient: {
    padding: 16,
    borderRadius: 12,
  },
  eventInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  eventInfoSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  commentsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 400,
  },
  commentsPanelGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  commentInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonIcon: {
    fontSize: 24,
  },
});

export default SocialFeed;
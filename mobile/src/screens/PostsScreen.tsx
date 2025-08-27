import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/apiClient';
import { 
  FileText, User, Clock, Heart, Share2, Bookmark, 
  Plus, Search, Filter, Eye, MoreHorizontal, Hash, Image as ImageIcon, Video, Link
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link' | 'document';
  likes: number;
  views: number;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  tags: string[];
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
  };
  link?: {
    url: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

export default function PostsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch posts
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', searchQuery, selectedType, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await apiClient.get(`/posts?${params.toString()}`);
      return response.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={16} color={colors.info} />;
      case 'video': return <Video size={16} color={colors.error} />;
      case 'link': return <Link size={16} color={colors.warning} />;
      case 'document': return <FileText size={16} color={colors.success} />;
      default: return <FileText size={16} color={colors.primary} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Imagen';
      case 'video': return 'Video';
      case 'link': return 'Enlace';
      case 'document': return 'Documento';
      default: return 'Texto';
    }
  };

  const types = [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'text', label: 'Texto', icon: 'document-text' },
    { id: 'image', label: 'Imágenes', icon: 'image' },
    { id: 'video', label: 'Videos', icon: 'videocam' },
    { id: 'link', label: 'Enlaces', icon: 'link' },
    { id: 'document', label: 'Documentos', icon: 'document' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Más Recientes' },
    { id: 'popular', label: 'Más Populares' },
    { id: 'likes', label: 'Más Likes' },
    { id: 'views', label: 'Más Vistas' },
  ];

  const renderPostCard = (post: Post) => (
    <TouchableOpacity
      key={post.id}
      style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('PostDetail' as never, { postId: post.id } as never)}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          {post.author.avatar ? (
            <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
          ) : (
            <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.authorInitial}>{post.author.username.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>
              @{post.author.username}
            </Text>
            <Text style={[styles.postTime, { color: colors.textSecondary }]}>
              {formatDate(post.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.postTypeContainer}>
          {getTypeIcon(post.type)}
          <Text style={[styles.postTypeText, { color: colors.textSecondary }]}>
            {getTypeLabel(post.type)}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>
        
        <Text style={[styles.postContentText, { color: colors.textSecondary }]} numberOfLines={3}>
          {post.content}
        </Text>

        {/* Media Preview */}
        {post.media && (
          <View style={styles.mediaPreview}>
            {post.media.type === 'image' && (
              <Image source={{ uri: post.media.url }} style={styles.mediaImage} />
            )}
            {post.media.type === 'video' && (
              <View style={styles.videoPreview}>
                <Video size={24} color="white" />
                <Text style={styles.videoLabel}>Video</Text>
              </View>
            )}
            {post.media.type === 'document' && (
              <View style={styles.documentPreview}>
                <FileText size={24} color="white" />
                <Text style={styles.documentLabel}>Documento</Text>
              </View>
            )}
          </View>
        )}

        {/* Link Preview */}
        {post.link && (
          <View style={[styles.linkPreview, { backgroundColor: colors.background }]}>
            {post.link.thumbnail && (
              <Image source={{ uri: post.link.thumbnail }} style={styles.linkThumbnail} />
            )}
            <View style={styles.linkInfo}>
              <Text style={[styles.linkTitle, { color: colors.text }]} numberOfLines={1}>
                {post.link.title}
              </Text>
              <Text style={[styles.linkDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {post.link.description}
              </Text>
              <Text style={[styles.linkUrl, { color: colors.primary }]} numberOfLines={1}>
                {post.link.url}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
            >
              <Hash size={12} color={colors.primary} />
              <Text style={[styles.tagText, { color: colors.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
          {post.tags.length > 3 && (
            <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
              +{post.tags.length - 3} más
            </Text>
          )}
        </View>
      )}

      {/* Post Footer */}
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Heart size={16} color={colors.primary} />
            <Text style={[styles.postStatText, { color: colors.textSecondary }]}>
              {post.likes}
            </Text>
          </View>
          
          <View style={styles.postStat}>
            <Eye size={16} color={colors.textSecondary} />
            <Text style={[styles.postStatText, { color: colors.textSecondary }]}>
              {post.views}
            </Text>
          </View>
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={16} color={post.isLiked ? colors.error : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={16} color={post.isBookmarked ? colors.warning : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Posts</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreatePost' as never)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar posts..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Post Types */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typesContainer}
        >
          {types.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={selectedType === type.id ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.typeButtonText,
                { color: selectedType === type.id ? 'white' : colors.textSecondary }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortButton,
                sortBy === option.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSortBy(option.id)}
            >
              <Text style={[
                styles.sortButtonText,
                { color: sortBy === option.id ? 'white' : colors.textSecondary }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts List */}
      <ScrollView
        style={styles.postsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Cargando posts...
            </Text>
          </View>
        ) : posts && posts.length > 0 ? (
          <View style={styles.postsList}>
            {posts.map(renderPostCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <FileText size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No se encontraron posts
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay posts disponibles en este momento'
              }
            </Text>
            <TouchableOpacity
              style={[styles.createPostButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreatePost' as never)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.createPostButtonText}>Crear Post</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  typesContainer: {
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
  },
  postsList: {
    paddingHorizontal: 20,
  },
  postCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
  },
  postTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  postTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  postContent: {
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaPreview: {
    marginBottom: 12,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  documentPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  documentLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkPreview: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  linkThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
    gap: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  postActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createPostButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

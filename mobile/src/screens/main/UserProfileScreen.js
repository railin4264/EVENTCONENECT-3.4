import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft,
  Settings,
  Edit,
  Camera,
  MapPin,
  Calendar,
  Users,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Star,
  Award,
  Activity,
  TrendingUp,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  Link,
  Instagram,
  Twitter,
  Facebook,
  Shield,
  Crown,
  MoreVertical
} from 'lucide-react-native';

import userProfileService from '../../services/UserProfileService';
import { useAuth } from '../../contexts/AuthContext';

const UserProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { userId } = route.params || { userId: user.id };
  
  const [profileUser, setProfileUser] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [userEvents, setUserEvents] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [activeTab, setActiveTab] = useState('posts'); // posts, events, saved, stats
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    instagram: '',
    twitter: '',
  });

  useEffect(() => {
    const targetUserId = userId || user.id;
    setIsOwnProfile(targetUserId === user.id);
    loadUserProfile(targetUserId);
  }, [userId]);

  const loadUserProfile = async (targetUserId) => {
    try {
      setIsLoading(true);
      
      const [profileResponse, statsResponse, eventsResponse, postsResponse] = await Promise.all([
        userProfileService.getProfile(targetUserId),
        userProfileService.getUserStats(),
        userProfileService.getUserEvents('all'),
        userProfileService.getUserPosts(1, 20)
      ]);
      
      const profileData = profileResponse.data;
      setProfileUser(profileData);
      setUserStats(statsResponse.data || {});
      setUserEvents(eventsResponse.data || []);
      setUserPosts(postsResponse.data || []);
      
      // Check if following (for other users)
      if (!isOwnProfile && profileData.followers) {
        setIsFollowing(profileData.followers.includes(user.id));
      }
      
      // Load saved posts if own profile
      if (isOwnProfile) {
        const savedResponse = await userProfileService.getSavedPosts(1, 20);
        setSavedPosts(savedResponse.data || []);
      }
      
      // Set edit form data
      setEditForm({
        name: profileData.name || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        instagram: profileData.socialLinks?.instagram || '',
        twitter: profileData.socialLinks?.twitter || '',
      });
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUserProfile(userId || user.id);
    setIsRefreshing(false);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userProfileService.unfollowUser(profileUser._id);
        setIsFollowing(false);
      } else {
        await userProfileService.followUser(profileUser._id);
        setIsFollowing(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        socialLinks: {
          instagram: editForm.instagram,
          twitter: editForm.twitter,
        }
      };
      
      await userProfileService.updateProfile(updateData);
      setShowEditModal(false);
      await loadUserProfile(user.id);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        await userProfileService.uploadProfilePicture(result.assets[0].uri);
        await loadUserProfile(user.id);
      } catch (error) {
        Alert.alert('Error', 'No se pudo subir la imagen');
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'Mi Perfil' : profileUser?.name}
        </Text>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: profileUser?.profilePicture || 
                   `https://ui-avatars.com/api/?name=${profileUser?.name}&background=67e8f9&color=fff&size=100`
            }}
            style={styles.avatar}
          />
          {isOwnProfile && (
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleImagePicker}
            >
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
          
          {profileUser?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Shield size={16} color="#10b981" />
            </View>
          )}
          
          {profileUser?.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={16} color="#fbbf24" />
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>{profileUser?.name}</Text>
        {profileUser?.username && (
          <Text style={styles.userHandle}>@{profileUser.username}</Text>
        )}
        
        {profileUser?.bio && (
          <Text style={styles.userBio}>{profileUser.bio}</Text>
        )}
        
        <View style={styles.userMeta}>
          {profileUser?.location && (
            <View style={styles.metaItem}>
              <MapPin size={14} color="#9ca3af" />
              <Text style={styles.metaText}>{profileUser.location}</Text>
            </View>
          )}
          
          <View style={styles.metaItem}>
            <Calendar size={14} color="#9ca3af" />
            <Text style={styles.metaText}>
              Se unió {new Date(profileUser?.createdAt).toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>
        
        {/* Social Links */}
        {(profileUser?.website || profileUser?.socialLinks?.instagram || profileUser?.socialLinks?.twitter) && (
          <View style={styles.socialLinks}>
            {profileUser.website && (
              <TouchableOpacity style={styles.socialLink}>
                <Link size={16} color="#67e8f9" />
              </TouchableOpacity>
            )}
            {profileUser.socialLinks?.instagram && (
              <TouchableOpacity style={styles.socialLink}>
                <Instagram size={16} color="#e4405f" />
              </TouchableOpacity>
            )}
            {profileUser.socialLinks?.twitter && (
              <TouchableOpacity style={styles.socialLink}>
                <Twitter size={16} color="#1da1f2" />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.eventsCreated || 0}
            </Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.postsCount || 0}
            </Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.followersCount || 0}
            </Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.followingCount || 0}
            </Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Edit size={16} color="#67e8f9" />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton
                ]}
                onPress={handleFollow}
              >
                {isFollowing ? <UserMinus size={16} color="#ffffff" /> : <UserPlus size={16} color="#ffffff" />}
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => navigation.navigate('Chat', { userId: profileUser._id })}
              >
                <MessageCircle size={16} color="#67e8f9" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton}>
                <Share2 size={16} color="#67e8f9" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
        onPress={() => setActiveTab('posts')}
      >
        <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
          Posts
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'events' && styles.activeTab]}
        onPress={() => setActiveTab('events')}
      >
        <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
          Eventos
        </Text>
      </TouchableOpacity>
      
      {isOwnProfile && (
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Guardados
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
        onPress={() => setActiveTab('stats')}
      >
        <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
          Stats
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item: post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      <View style={styles.postMeta}>
        <Text style={styles.postDate}>
          {new Date(post.createdAt).toLocaleDateString('es-ES')}
        </Text>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Heart size={14} color="#9ca3af" />
            <Text style={styles.postStatText}>{post.likesCount || 0}</Text>
          </View>
          <View style={styles.postStat}>
            <MessageCircle size={14} color="#9ca3af" />
            <Text style={styles.postStatText}>{post.commentsCount || 0}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEventItem = ({ item: event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
    >
      <Image 
        source={{ 
          uri: event.image || `https://picsum.photos/200/120?random=${event._id}`
        }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventDate}>
          {new Date(event.date).toLocaleDateString('es-ES', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
        <View style={styles.eventMeta}>
          <Users size={12} color="#9ca3af" />
          <Text style={styles.eventMetaText}>{event.attendeesCount || 0} asistentes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Activity size={24} color="#67e8f9" />
          <Text style={styles.statCardNumber}>{userStats.totalLikes || 0}</Text>
          <Text style={styles.statCardLabel}>Total Likes</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#10b981" />
          <Text style={styles.statCardNumber}>{userStats.profileViews || 0}</Text>
          <Text style={styles.statCardLabel}>Vistas del perfil</Text>
        </View>
        
        <View style={styles.statCard}>
          <Award size={24} color="#fbbf24" />
          <Text style={styles.statCardNumber}>{userStats.achievementsCount || 0}</Text>
          <Text style={styles.statCardLabel}>Logros</Text>
        </View>
        
        <View style={styles.statCard}>
          <Star size={24} color="#f59e0b" />
          <Text style={styles.statCardNumber}>{userStats.averageRating || '0.0'}</Text>
          <Text style={styles.statCardLabel}>Rating promedio</Text>
        </View>
      </View>
      
      {userStats.topInterests && (
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>Intereses principales</Text>
          <View style={styles.interestTags}>
            {userStats.topInterests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestTagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <FlatList
            data={userPosts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item._id}
            numColumns={1}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MessageCircle size={64} color="#6b7280" />
                <Text style={styles.emptyStateTitle}>No hay posts aún</Text>
                <Text style={styles.emptyStateText}>
                  {isOwnProfile ? 'Comparte tu primer post' : 'Este usuario no ha publicado nada'}
                </Text>
              </View>
            }
          />
        );
        
      case 'events':
        return (
          <FlatList
            data={userEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.eventsRow}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Calendar size={64} color="#6b7280" />
                <Text style={styles.emptyStateTitle}>No hay eventos</Text>
                <Text style={styles.emptyStateText}>
                  {isOwnProfile ? 'Crea tu primer evento' : 'Este usuario no ha creado eventos'}
                </Text>
              </View>
            }
          />
        );
        
      case 'saved':
        return (
          <FlatList
            data={savedPosts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Bookmark size={64} color="#6b7280" />
                <Text style={styles.emptyStateTitle}>No hay posts guardados</Text>
                <Text style={styles.emptyStateText}>
                  Los posts que guardes aparecerán aquí
                </Text>
              </View>
            }
          />
        );
        
      case 'stats':
        return renderStats();
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0f0f23', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#67e8f9"
          />
        }
      >
        {renderHeader()}
        {renderTabs()}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Editar perfil</Text>
            
            <TouchableOpacity onPress={handleUpdateProfile}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({...prev, name: text}))}
                placeholder="Tu nombre"
                placeholderTextColor="#6b7280"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Biografía</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={editForm.bio}
                onChangeText={(text) => setEditForm(prev => ({...prev, bio: text}))}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ubicación</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.location}
                onChangeText={(text) => setEditForm(prev => ({...prev, location: text}))}
                placeholder="Tu ciudad"
                placeholderTextColor="#6b7280"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Sitio web</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.website}
                onChangeText={(text) => setEditForm(prev => ({...prev, website: text}))}
                placeholder="https://..."
                placeholderTextColor="#6b7280"
                keyboardType="url"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Instagram</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.instagram}
                onChangeText={(text) => setEditForm(prev => ({...prev, instagram: text}))}
                placeholder="@username"
                placeholderTextColor="#6b7280"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Twitter</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.twitter}
                onChangeText={(text) => setEditForm(prev => ({...prev, twitter: text}))}
                placeholder="@username"
                placeholderTextColor="#6b7280"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  moreButton: {
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#67e8f9',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#67e8f9',
    borderRadius: 16,
    padding: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 12,
  },
  userBio: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  userMeta: {
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 6,
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  socialLink: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#67e8f9',
  },
  editButtonText: {
    fontSize: 16,
    color: '#67e8f9',
    fontWeight: '600',
    marginLeft: 8,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#67e8f9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
  },
  followingButton: {
    backgroundColor: '#10b981',
  },
  followButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  messageButton: {
    padding: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 20,
    marginRight: 8,
  },
  shareButton: {
    padding: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#67e8f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  postStatText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  eventsRow: {
    justifyContent: 'space-between',
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventInfo: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 18,
  },
  eventDate: {
    fontSize: 12,
    color: '#67e8f9',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 4,
  },
  statsContent: {
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  interestsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestTagText: {
    fontSize: 12,
    color: '#67e8f9',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalSave: {
    fontSize: 16,
    color: '#67e8f9',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default UserProfileScreen;












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
import { 
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Star,
  MessageCircle,
  Share2,
  MoreVertical,
  Settings,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Heart,
  Flag,
  Edit,
  Camera,
  Plus,
  Search,
  Filter
} from 'lucide-react-native';

import tribesService from '../../services/TribesService';
import postsService from '../../services/PostsService';
import { useAuth } from '../../contexts/AuthContext';

const TribeDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { tribeId } = route.params;
  
  const [tribe, setTribe] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  
  const [activeTab, setActiveTab] = useState('posts'); // posts, members, events
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    loadTribeDetails();
  }, [tribeId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = members.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const loadTribeDetails = async () => {
    try {
      setIsLoading(true);
      
      const [tribeResponse, membersResponse, postsResponse] = await Promise.all([
        tribesService.getTribeById(tribeId),
        tribesService.getTribeMembers(tribeId),
        postsService.getPostsByTribe(tribeId, 1, 20)
      ]);
      
      const tribeData = tribeResponse.data;
      const membersData = membersResponse.data || [];
      const postsData = postsResponse.data || [];
      
      setTribe(tribeData);
      setMembers(membersData);
      setPosts(postsData);
      
      // Check user status
      const memberStatus = membersData.find(m => m._id === user.id || m.id === user.id);
      setIsMember(!!memberStatus);
      setIsAdmin(memberStatus?.role === 'admin');
      setIsModerator(memberStatus?.role === 'moderator' || memberStatus?.role === 'admin');
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información de la tribu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTribeDetails();
    setIsRefreshing(false);
  };

  const handleJoinTribe = async () => {
    try {
      if (isMember) {
        Alert.alert(
          'Abandonar Tribu',
          '¿Estás seguro que quieres abandonar esta tribu?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Abandonar', 
              style: 'destructive',
              onPress: async () => {
                await tribesService.leaveTribe(tribeId);
                setIsMember(false);
                setIsAdmin(false);
                setIsModerator(false);
                await loadTribeDetails();
              }
            }
          ]
        );
      } else {
        if (tribe.privacy === 'private') {
          setShowJoinModal(true);
        } else {
          await tribesService.joinTribe(tribeId);
          setIsMember(true);
          await loadTribeDetails();
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    try {
      const newPost = await postsService.createPost({
        content: newPostContent,
        tribe: tribeId,
        type: 'text'
      });
      
      setPosts(prev => [newPost.data, ...prev]);
      setNewPostContent('');
      setShowPostModal(false);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el post');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image 
        source={{ 
          uri: tribe?.coverImage || 
               `https://picsum.photos/400/200?random=${tribeId}`
        }}
        style={styles.coverImage}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 10, 0.8)']}
        style={styles.coverGradient}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.tribeInfo}>
        <Image 
          source={{ 
            uri: tribe?.profilePicture || 
                 `https://ui-avatars.com/api/?name=${tribe?.name}&background=7c3aed&color=fff&size=80`
          }}
          style={styles.tribeAvatar}
        />
        
        <Text style={styles.tribeName}>{tribe?.name}</Text>
        <Text style={styles.tribeDescription} numberOfLines={2}>
          {tribe?.description}
        </Text>
        
        <View style={styles.tribeStats}>
          <View style={styles.statItem}>
            <Users size={16} color="#9ca3af" />
            <Text style={styles.statText}>
              {tribe?.memberCount || members.length} miembros
            </Text>
          </View>
          
          {tribe?.location && (
            <View style={styles.statItem}>
              <MapPin size={16} color="#9ca3af" />
              <Text style={styles.statText}>{tribe.location}</Text>
            </View>
          )}
          
          <View style={styles.statItem}>
            <Calendar size={16} color="#9ca3af" />
            <Text style={styles.statText}>
              Creada {new Date(tribe?.createdAt).toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.joinButton,
              isMember && styles.memberButton
            ]}
            onPress={handleJoinTribe}
          >
            {isMember ? <UserMinus size={20} color="#ffffff" /> : <UserPlus size={20} color="#ffffff" />}
            <Text style={styles.joinButtonText}>
              {isMember ? 'Miembro' : 'Unirse'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={20} color="#67e8f9" />
          </TouchableOpacity>
          
          {isMember && (
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <MessageCircle size={20} color="#67e8f9" />
            </TouchableOpacity>
          )}
          
          {isAdmin && (
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('TribeSettings', { tribeId })}
            >
              <Settings size={20} color="#67e8f9" />
            </TouchableOpacity>
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
          Posts ({posts.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'members' && styles.activeTab]}
        onPress={() => setActiveTab('members')}
      >
        <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
          Miembros ({members.length})
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
    </View>
  );

  const renderPostItem = ({ item: post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image 
          source={{ 
            uri: post.author?.profilePicture || 
                 `https://ui-avatars.com/api/?name=${post.author?.name}&background=67e8f9&color=fff`
          }}
          style={styles.postAvatar}
        />
        
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthorName}>{post.author?.name}</Text>
          {post.author?.role && (
            <View style={styles.roleContainer}>
              {post.author.role === 'admin' && <Crown size={12} color="#fbbf24" />}
              {post.author.role === 'moderator' && <Shield size={12} color="#10b981" />}
              <Text style={styles.roleText}>{post.author.role}</Text>
            </View>
          )}
          <Text style={styles.postTime}>
            {new Date(post.createdAt).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction}>
          <Heart size={20} color="#9ca3af" />
          <Text style={styles.postActionText}>{post.likesCount || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.postAction}>
          <MessageCircle size={20} color="#9ca3af" />
          <Text style={styles.postActionText}>{post.commentsCount || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.postAction}>
          <Share2 size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMemberItem = ({ item: member }) => (
    <View style={styles.memberCard}>
      <Image 
        source={{ 
          uri: member.profilePicture || 
               `https://ui-avatars.com/api/?name=${member.name}&background=67e8f9&color=fff`
        }}
        style={styles.memberAvatar}
      />
      
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        {member.username && (
          <Text style={styles.memberUsername}>@{member.username}</Text>
        )}
        
        <View style={styles.memberRole}>
          {member.role === 'admin' && (
            <>
              <Crown size={14} color="#fbbf24" />
              <Text style={styles.memberRoleText}>Administrador</Text>
            </>
          )}
          {member.role === 'moderator' && (
            <>
              <Shield size={14} color="#10b981" />
              <Text style={styles.memberRoleText}>Moderador</Text>
            </>
          )}
          {!member.role || member.role === 'member' && (
            <Text style={styles.memberRoleText}>Miembro</Text>
          )}
        </View>
      </View>
      
      <View style={styles.memberActions}>
        <TouchableOpacity 
          style={styles.memberAction}
          onPress={() => navigation.navigate('UserProfile', { userId: member._id })}
        >
          <Text style={styles.memberActionText}>Ver perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <View style={styles.content}>
            {isMember && (
              <TouchableOpacity 
                style={styles.createPostButton}
                onPress={() => setShowPostModal(true)}
              >
                <Plus size={20} color="#67e8f9" />
                <Text style={styles.createPostText}>Crear post en la tribu</Text>
              </TouchableOpacity>
            )}
            
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        );
        
      case 'members':
        return (
          <View style={styles.content}>
            <View style={styles.membersHeader}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar miembros..."
                  placeholderTextColor="#6b7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={20} color="#67e8f9" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filteredMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        );
        
      case 'events':
        return (
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Calendar size={64} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>Próximamente</Text>
              <Text style={styles.emptyStateText}>
                Los eventos de la tribu estarán disponibles pronto
              </Text>
            </View>
          </View>
        );
        
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
          <Text style={styles.loadingText}>Cargando tribu...</Text>
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
        {renderContent()}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPostModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Nuevo Post</Text>
            
            <TouchableOpacity 
              onPress={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              <Text style={[
                styles.modalSave,
                !newPostContent.trim() && styles.modalSaveDisabled
              ]}>
                Publicar
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.postInput}
              placeholder="¿Qué quieres compartir con la tribu?"
              placeholderTextColor="#6b7280"
              multiline
              maxLength={1000}
              value={newPostContent}
              onChangeText={setNewPostContent}
              autoFocus
            />
            
            <View style={styles.postOptions}>
              <TouchableOpacity style={styles.postOption}>
                <Camera size={24} color="#67e8f9" />
                <Text style={styles.postOptionText}>Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    position: 'relative',
    height: 300,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  moreButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  tribeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tribeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  tribeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tribeDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 16,
  },
  tribeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#67e8f9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
  },
  memberButton: {
    backgroundColor: '#10b981',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  shareButton: {
    padding: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 20,
    marginRight: 8,
  },
  chatButton: {
    padding: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 20,
    marginRight: 8,
  },
  settingsButton: {
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
    marginVertical: 16,
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
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(103, 232, 249, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  createPostText: {
    fontSize: 16,
    color: '#67e8f9',
    marginLeft: 12,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  postTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  filterButton: {
    padding: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberUsername: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  memberRole: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberRoleText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  memberActions: {
    alignItems: 'flex-end',
  },
  memberAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 8,
  },
  memberActionText: {
    fontSize: 14,
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
  modalSaveDisabled: {
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  postInput: {
    fontSize: 16,
    color: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 20,
  },
  postOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.1)',
    borderRadius: 20,
    marginRight: 12,
  },
  postOptionText: {
    fontSize: 14,
    color: '#67e8f9',
    marginLeft: 8,
  },
});

export default TribeDetailScreen;










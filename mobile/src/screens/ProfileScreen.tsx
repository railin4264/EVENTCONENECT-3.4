import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Edit, Camera, Settings, Heart, Bookmark, Calendar, Users, 
  FileText, Star, MapPin, Globe, Mail, Phone, Link, Award, 
  CheckCircle, Zap, Eye, Share2, Plus, Trash2, MoreHorizontal,
  Bell, Lock, Shield, HelpCircle, LogOut, Download, Upload
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  isVerified: boolean;
  isHost: boolean;
  isOnline: boolean;
  lastSeen: string;
  followers: number;
  following: number;
  events: number;
  tribes: number;
  posts: number;
  reviews: number;
  rating: number;
  badges: string[];
  interests: string[];
  skills: string[];
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
    events: boolean;
    messages: boolean;
    mentions: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert('Info', 'Función de edición de perfil en desarrollo');
  };

  const handleAvatarUpload = () => {
    Alert.alert('Info', 'Función de cambio de avatar en desarrollo');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'event':
        navigation.navigate('CreateEvent' as never);
        break;
      case 'tribe':
        navigation.navigate('CreateTribe' as never);
        break;
      case 'post':
        navigation.navigate('CreatePost' as never);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStatsCard = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const renderTabButton = (id: string, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      key={id}
      style={[
        styles.tabButton,
        activeTab === id && { borderBottomColor: colors.primary }
      ]}
      onPress={() => setActiveTab(id)}
    >
      {icon}
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === id ? colors.primary : colors.textSecondary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Usuario no autenticado
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings' as never)}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>
                    {user.firstName?.charAt(0) || user.username.charAt(0)}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                onPress={handleAvatarUpload}
              >
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user.firstName} {user.lastName}
                </Text>
                {user.isVerified && (
                  <CheckCircle size={20} color={colors.success} />
                )}
              </View>
              
              <Text style={[styles.username, { color: colors.textSecondary }]}>
                @{user.username}
              </Text>
              
              {user.isHost && (
                <View style={[styles.hostBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.hostBadgeText, { color: colors.success }]}>
                    Host Verificado
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.primary }]}
              onPress={() => handleQuickAction('event')}
            >
              <Plus size={20} color="white" />
              <Text style={styles.quickActionText}>Evento</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.secondary }]}
              onPress={() => handleQuickAction('tribe')}
            >
              <Plus size={20} color="white" />
              <Text style={styles.quickActionText}>Tribu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.info }]}
              onPress={() => handleQuickAction('post')}
            >
              <Plus size={20} color="white" />
              <Text style={styles.quickActionText}>Post</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              {renderStatsCard(
                'Seguidores',
                user.followers || 0,
                <Users size={18} color={colors.primary} />,
                colors.primary
              )}
              {renderStatsCard(
                'Siguiendo',
                user.following || 0,
                <Users size={18} color={colors.secondary} />,
                colors.secondary
              )}
              {renderStatsCard(
                'Eventos',
                user.events || 0,
                <Calendar size={18} color={colors.success} />,
                colors.success
              )}
              {renderStatsCard(
                'Rating',
                user.rating || 0,
                <Star size={18} color={colors.warning} />,
                colors.warning
              )}
            </View>
          </View>
        </View>

        {/* Profile Content Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.tabs}>
            {renderTabButton('overview', 'Vista General', <Eye size={18} />)}
            {renderTabButton('events', 'Eventos', <Calendar size={18} />)}
            {renderTabButton('tribes', 'Tribus', <Users size={18} />)}
            {renderTabButton('posts', 'Posts', <FileText size={18} />)}
            {renderTabButton('settings', 'Config', <Settings size={18} />)}
          </View>
        </View>

        {/* Tab Content */}
        <View style={[styles.tabContent, { backgroundColor: colors.surface }]}>
          {activeTab === 'overview' && (
            <View style={styles.overviewContent}>
              {/* Personal Info */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Información Personal
                </Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Mail size={16} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      {user.email}
                    </Text>
                  </View>
                  
                  {user.phone && (
                    <View style={styles.infoItem}>
                      <Phone size={16} color={colors.textSecondary} />
                      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {user.phone}
                      </Text>
                    </View>
                  )}
                  
                  {user.location && (
                    <View style={styles.infoItem}>
                      <MapPin size={16} color={colors.textSecondary} />
                      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {user.location}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.infoItem}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      Miembro desde {formatDate(user.createdAt || new Date().toISOString())}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Interests & Skills */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Intereses y Habilidades
                </Text>
                <View style={styles.tagsContainer}>
                  {(user.interests || []).map((interest, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                    >
                      <Text style={[styles.tagText, { color: colors.primary }]}>
                        {interest}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.tagsContainer}>
                  {(user.skills || []).map((skill, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: colors.success + '20' }]}
                    >
                      <Text style={[styles.tagText, { color: colors.success }]}>
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Badges */}
              {(user.badges || []).length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Insignias y Logros
                  </Text>
                  <View style={styles.badgesContainer}>
                    {user.badges.map((badge, index) => (
                      <View
                        key={index}
                        style={[styles.badge, { backgroundColor: colors.warning + '20' }]}
                      >
                        <Award size={16} color={colors.warning} />
                        <Text style={[styles.badgeText, { color: colors.warning }]}>
                          {badge}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'events' && (
            <View style={styles.tabContent}>
              <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                Lista de eventos próximamente
              </Text>
            </View>
          )}

          {activeTab === 'tribes' && (
            <View style={styles.tabContent}>
              <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                Lista de tribus próximamente
              </Text>
            </View>
          )}

          {activeTab === 'posts' && (
            <View style={styles.tabContent}>
              <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                Lista de posts próximamente
              </Text>
            </View>
          )}

          {activeTab === 'settings' && (
            <View style={styles.settingsContent}>
              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('Settings' as never)}
              >
                <View style={styles.settingItemLeft}>
                  <Settings size={20} color={colors.textSecondary} />
                  <Text style={[styles.settingItemText, { color: colors.text }]}>
                    Configuración General
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('Gamification' as never)}
              >
                <View style={styles.settingItemLeft}>
                  <Award size={20} color={colors.textSecondary} />
                  <Text style={[styles.settingItemText, { color: colors.text }]}>
                    Gamificación
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('Analytics' as never)}
              >
                <View style={styles.settingItemLeft}>
                  <Zap size={20} color={colors.textSecondary} />
                  <Text style={[styles.settingItemText, { color: colors.text }]}>
                    Analytics
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={handleLogout}
              >
                <View style={styles.settingItemLeft}>
                  <LogOut size={20} color={colors.error} />
                  <Text style={[styles.settingItemText, { color: colors.error }]}>
                    Cerrar Sesión
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
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
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    marginBottom: 8,
  },
  hostBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  quickAction: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabContent: {
    padding: 20,
    minHeight: 400,
  },
  overviewContent: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  comingSoonText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 40,
  },
  settingsContent: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 100,
  },
});

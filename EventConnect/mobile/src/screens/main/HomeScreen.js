import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    upcomingEvents: 5,
    activeTribes: 3,
    newNotifications: 2,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch fresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    {
      title: 'Crear Evento',
      icon: '🎉',
      onPress: () => navigation.navigate('CreateEvent'),
      color: '#667eea',
    },
    {
      title: 'Unirse a Tribu',
      icon: '👥',
      onPress: () => navigation.navigate('DiscoverTribes'),
      color: '#764ba2',
    },
    {
      title: 'Ver Mapa',
      icon: '🗺️',
      onPress: () => navigation.navigate('Map'),
      color: '#f093fb',
    },
    {
      title: 'Chat',
      icon: '💬',
      onPress: () => navigation.navigate('Chat'),
      color: '#4facfe',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'event',
      title: 'Fiesta de Cumpleaños',
      description: 'Te uniste al evento',
      time: '2 horas atrás',
      icon: '🎂',
    },
    {
      id: '2',
      type: 'tribe',
      title: 'Tech Enthusiasts',
      description: 'Nueva tribu creada',
      time: '1 día atrás',
      icon: '💻',
    },
    {
      id: '3',
      type: 'notification',
      title: 'Nuevo mensaje',
      description: 'De Juan en el chat',
      time: '3 horas atrás',
      icon: '📱',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.headerGradient}
          >
            <Text style={styles.greeting}>
              ¡Hola, {user?.firstName || 'Usuario'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              ¿Qué te gustaría hacer hoy?
            </Text>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Eventos próximos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeTribes}</Text>
            <Text style={styles.statLabel}>Tribus activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.newNotifications}</Text>
            <Text style={styles.statLabel}>Notificaciones</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Acciones Rápidas
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Actividad Reciente
          </Text>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[styles.activityCard, isDark && styles.activityCardDark]}
              onPress={() => {
                // TODO: Navigate to specific activity
              }}
            >
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>{activity.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, isDark && styles.activityTitleDark]}>
                  {activity.title}
                </Text>
                <Text style={[styles.activityDescription, isDark && styles.activityDescriptionDark]}>
                  {activity.description}
                </Text>
                <Text style={[styles.activityTime, isDark && styles.activityTimeDark]}>
                  {activity.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Destacado
          </Text>
          <TouchableOpacity
            style={[styles.featuredCard, isDark && styles.featuredCardDark]}
            onPress={() => navigation.navigate('Featured')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.featuredGradient}
            >
              <Text style={styles.featuredTitle}>
                🎯 Descubre Eventos Cerca de Ti
              </Text>
              <Text style={styles.featuredDescription}>
                Encuentra eventos increíbles y únete a nuevas tribus en tu área
              </Text>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Explorar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityCardDark: {
    backgroundColor: '#2a2a2a',
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityTitleDark: {
    color: '#fff',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDescriptionDark: {
    color: '#ccc',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityTimeDark: {
    color: '#888',
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredCardDark: {
    backgroundColor: '#2a2a2a',
  },
  featuredGradient: {
    padding: 24,
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuredButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  featuredButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp, Users, Calendar, MessageSquare, Eye, 
  Heart, Share2, Download, BarChart3, PieChart, Activity
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const { width, height } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalEvents: number;
    totalUsers: number;
    totalPosts: number;
    totalTribes: number;
    activeUsers: number;
    engagementRate: number;
  };
  events: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
    byCategory: Array<{ category: string; count: number; percentage: number }>;
    byLocation: Array<{ location: string; count: number; percentage: number }>;
    attendance: {
      total: number;
      average: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  users: {
    total: number;
    newThisMonth: number;
    activeThisWeek: number;
    byLocation: Array<{ location: string; count: number; percentage: number }>;
    byInterests: Array<{ interest: string; count: number; percentage: number }>;
    engagement: {
      averagePosts: number;
      averageEvents: number;
      averageTribes: number;
    };
  };
  engagement: {
    posts: {
      total: number;
      likes: number;
      comments: number;
      shares: number;
      averageLikes: number;
      averageComments: number;
      averageShares: number;
    };
    interactions: {
      total: number;
      likes: number;
      comments: number;
      shares: number;
      follows: number;
      messages: number;
    };
    trends: Array<{ date: string; value: number; type: string }>;
  };
  performance: {
    appUsage: {
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
      averageSessionDuration: number;
      retentionRate: number;
    };
    features: {
      events: number;
      tribes: number;
      posts: number;
      chat: number;
      search: number;
    };
  };
}

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'events' | 'users' | 'engagement' | 'performance'>('overview');

  // Fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', selectedPeriod],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/analytics?period=${selectedPeriod}`);
        return response.data.analytics;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Return mock data for development
        return generateMockAnalyticsData();
      }
    },
  });

  // Generate mock analytics data for development
  const generateMockAnalyticsData = (): AnalyticsData => ({
    overview: {
      totalEvents: 1247,
      totalUsers: 8943,
      totalPosts: 5678,
      totalTribes: 234,
      activeUsers: 3421,
      engagementRate: 78.5,
    },
    events: {
      total: 1247,
      upcoming: 89,
      ongoing: 23,
      completed: 1123,
      cancelled: 12,
      byCategory: [
        { category: 'Networking', count: 456, percentage: 36.6 },
        { category: 'Tech', count: 234, percentage: 18.8 },
        { category: 'Business', count: 189, percentage: 15.2 },
        { category: 'Social', count: 156, percentage: 12.5 },
        { category: 'Education', count: 123, percentage: 9.9 },
        { category: 'Other', count: 89, percentage: 7.1 },
      ],
      byLocation: [
        { location: 'Madrid', count: 234, percentage: 18.8 },
        { location: 'Barcelona', count: 189, percentage: 15.2 },
        { location: 'Valencia', count: 156, percentage: 12.5 },
        { location: 'Sevilla', count: 123, percentage: 9.9 },
        { location: 'Online', count: 345, percentage: 27.7 },
        { location: 'Other', count: 200, percentage: 16.0 },
      ],
      attendance: {
        total: 15678,
        average: 12.6,
        trend: 'up',
      },
    },
    users: {
      total: 8943,
      newThisMonth: 456,
      activeThisWeek: 3421,
      byLocation: [
        { location: 'Madrid', count: 2345, percentage: 26.2 },
        { location: 'Barcelona', count: 1890, percentage: 21.1 },
        { location: 'Valencia', count: 1234, percentage: 13.8 },
        { location: 'Sevilla', count: 890, percentage: 10.0 },
        { location: 'Other', count: 2584, percentage: 28.9 },
      ],
      byInterests: [
        { interest: 'Technology', count: 2345, percentage: 26.2 },
        { interest: 'Business', count: 1890, percentage: 21.1 },
        { interest: 'Networking', count: 1234, percentage: 13.8 },
        { interest: 'Education', count: 890, percentage: 10.0 },
        { interest: 'Social', count: 567, percentage: 6.3 },
        { interest: 'Other', count: 2017, percentage: 22.6 },
      ],
      engagement: {
        averagePosts: 0.6,
        averageEvents: 1.8,
        averageTribes: 2.1,
      },
    },
    engagement: {
      posts: {
        total: 5678,
        likes: 23456,
        comments: 12345,
        shares: 6789,
        averageLikes: 4.1,
        averageComments: 2.2,
        averageShares: 1.2,
      },
      interactions: {
        total: 45678,
        likes: 23456,
        comments: 12345,
        shares: 6789,
        follows: 2345,
        messages: 1234,
      },
      trends: [
        { date: '2024-01', value: 234, type: 'posts' },
        { date: '2024-02', value: 267, type: 'posts' },
        { date: '2024-03', value: 289, type: 'posts' },
        { date: '2024-04', value: 312, type: 'posts' },
        { date: '2024-05', value: 298, type: 'posts' },
        { date: '2024-06', value: 345, type: 'posts' },
      ],
    },
    performance: {
      appUsage: {
        dailyActiveUsers: 2345,
        weeklyActiveUsers: 5678,
        monthlyActiveUsers: 8943,
        averageSessionDuration: 12.5,
        retentionRate: 67.8,
      },
      features: {
        events: 89,
        tribes: 67,
        posts: 78,
        chat: 56,
        search: 45,
      },
    },
  });

  const renderPeriodSelector = () => (
    <View style={[styles.periodSelector, { backgroundColor: colors.surface }]}>
      {[
        { key: 'week', label: 'Semana', icon: 'calendar' },
        { key: 'month', label: 'Mes', icon: 'calendar' },
        { key: 'quarter', label: 'Trimestre', icon: 'calendar' },
        { key: 'year', label: 'Año', icon: 'calendar' },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodTab,
            selectedPeriod === period.key && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Ionicons
            name={period.icon as any}
            size={16}
            color={selectedPeriod === period.key ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            styles.periodTabText,
            { color: selectedPeriod === period.key ? colors.primary : colors.textSecondary }
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricSelector = () => (
    <View style={styles.metricSelector}>
      {[
        { key: 'overview', label: 'Resumen', icon: BarChart3 },
        { key: 'events', label: 'Eventos', icon: Calendar },
        { key: 'users', label: 'Usuarios', icon: Users },
        { key: 'engagement', label: 'Engagement', icon: Heart },
        { key: 'performance', label: 'Rendimiento', icon: Activity },
      ].map((metric) => (
        <TouchableOpacity
          key={metric.key}
          style={[
            styles.metricTab,
            selectedMetric === metric.key && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setSelectedMetric(metric.key as any)}
        >
          <metric.icon
            size={20}
            color={selectedMetric === metric.key ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            styles.metricTabText,
            { color: selectedMetric === metric.key ? colors.primary : colors.textSecondary }
          ]}>
            {metric.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverview = () => (
    <View style={styles.metricContent}>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        {[
          { label: 'Total Eventos', value: analyticsData?.overview.totalEvents || 0, icon: Calendar, color: '#4CAF50' },
          { label: 'Total Usuarios', value: analyticsData?.overview.totalUsers || 0, icon: Users, color: '#2196F3' },
          { label: 'Total Posts', value: analyticsData?.overview.totalPosts || 0, icon: MessageSquare, color: '#FF9800' },
          { label: 'Total Tribus', value: analyticsData?.overview.totalTribes || 0, icon: Users, color: '#9C27B0' },
        ].map((metric, index) => (
          <View key={index} style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
              <metric.icon size={24} color={metric.color} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {metric.value.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Engagement Stats */}
      <View style={[styles.engagementCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Engagement
        </Text>
        
        <View style={styles.engagementStats}>
          <View style={styles.engagementStat}>
            <Text style={[styles.engagementValue, { color: colors.primary }]}>
              {analyticsData?.overview.activeUsers || 0}
            </Text>
            <Text style={[styles.engagementLabel, { color: colors.textSecondary }]}>
              Usuarios Activos
            </Text>
          </View>
          
          <View style={styles.engagementStat}>
            <Text style={[styles.engagementValue, { color: colors.primary }]}>
              {analyticsData?.overview.engagementRate || 0}%
            </Text>
            <Text style={[styles.engagementLabel, { color: colors.textSecondary }]}>
              Tasa de Engagement
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEvents = () => (
    <View style={styles.metricContent}>
      {/* Event Status */}
      <View style={styles.metricsGrid}>
        {[
          { label: 'Total', value: analyticsData?.events.total || 0, color: '#2196F3' },
          { label: 'Próximos', value: analyticsData?.events.upcoming || 0, color: '#4CAF50' },
          { label: 'En Curso', value: analyticsData?.events.ongoing || 0, color: '#FF9800' },
          { label: 'Completados', value: analyticsData?.events.completed || 0, color: '#9C27B0' },
        ].map((metric, index) => (
          <View key={index} style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: metric.color }]}>
              {metric.value.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <View style={[styles.categoryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Eventos por Categoría
        </Text>
        
        <View style={styles.categoryList}>
          {analyticsData?.events.byCategory.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {category.category}
                </Text>
                <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                  {category.count} eventos
                </Text>
              </View>
              <View style={styles.categoryPercentage}>
                <Text style={[styles.percentageText, { color: colors.primary }]}>
                  {category.percentage}%
                </Text>
                <View style={[styles.percentageBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.percentageFill,
                      { backgroundColor: colors.primary, width: `${category.percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Attendance */}
      <View style={[styles.attendanceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Asistencia
        </Text>
        
        <View style={styles.attendanceStats}>
          <View style={styles.attendanceStat}>
            <Text style={[styles.attendanceValue, { color: colors.primary }]}>
              {analyticsData?.events.attendance.total || 0}
            </Text>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>
              Total Asistentes
            </Text>
          </View>
          
          <View style={styles.attendanceStat}>
            <Text style={[styles.attendanceValue, { color: colors.primary }]}>
              {analyticsData?.events.attendance.average || 0}
            </Text>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>
              Promedio por Evento
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.metricContent}>
      {/* User Stats */}
      <View style={styles.metricsGrid}>
        {[
          { label: 'Total', value: analyticsData?.users.total || 0, color: '#2196F3' },
          { label: 'Nuevos (Mes)', value: analyticsData?.users.newThisMonth || 0, color: '#4CAF50' },
          { label: 'Activos (Semana)', value: analyticsData?.users.activeThisWeek || 0, color: '#FF9800' },
          { label: 'Engagement', value: `${analyticsData?.users.engagement.averagePosts || 0}/mes`, color: '#9C27B0' },
        ].map((metric, index) => (
          <View key={index} style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: metric.color }]}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Top Locations */}
      <View style={[styles.locationCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Usuarios por Ubicación
        </Text>
        
        <View style={styles.locationList}>
          {analyticsData?.users.byLocation.slice(0, 5).map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <View style={styles.locationInfo}>
                <Text style={[styles.locationName, { color: colors.text }]}>
                  {location.location}
                </Text>
                <Text style={[styles.locationCount, { color: colors.textSecondary }]}>
                  {location.count} usuarios
                </Text>
              </View>
              <Text style={[styles.locationPercentage, { color: colors.primary }]}>
                {location.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEngagement = () => (
    <View style={styles.metricContent}>
      {/* Post Stats */}
      <View style={styles.metricsGrid}>
        {[
          { label: 'Total Posts', value: analyticsData?.engagement.posts.total || 0, color: '#2196F3' },
          { label: 'Total Likes', value: analyticsData?.engagement.posts.likes || 0, color: '#E91E63' },
          { label: 'Total Comentarios', value: analyticsData?.engagement.posts.comments || 0, color: '#FF9800' },
          { label: 'Total Compartidos', value: analyticsData?.engagement.posts.shares || 0, color: '#4CAF50' },
        ].map((metric, index) => (
          <View key={index} style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: metric.color }]}>
              {metric.value.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Averages */}
      <View style={[styles.averagesCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Promedios por Post
        </Text>
        
        <View style={styles.averagesGrid}>
          {[
            { label: 'Likes', value: analyticsData?.engagement.posts.averageLikes || 0, icon: Heart },
            { label: 'Comentarios', value: analyticsData?.engagement.posts.averageComments || 0, icon: MessageSquare },
            { label: 'Compartidos', value: analyticsData?.engagement.posts.averageShares || 0, icon: Share2 },
          ].map((average, index) => (
            <View key={index} style={styles.averageItem}>
              <View style={[styles.averageIcon, { backgroundColor: colors.primary + '20' }]}>
                <average.icon size={20} color={colors.primary} />
              </View>
              <View style={styles.averageInfo}>
                <Text style={[styles.averageValue, { color: colors.text }]}>
                  {average.value}
                </Text>
                <Text style={[styles.averageLabel, { color: colors.textSecondary }]}>
                  {average.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.metricContent}>
      {/* App Usage */}
      <View style={styles.metricsGrid}>
        {[
          { label: 'DAU', value: analyticsData?.performance.appUsage.dailyActiveUsers || 0, color: '#4CAF50' },
          { label: 'WAU', value: analyticsData?.performance.appUsage.weeklyActiveUsers || 0, color: '#2196F3' },
          { label: 'MAU', value: analyticsData?.performance.appUsage.monthlyActiveUsers || 0, color: '#FF9800' },
          { label: 'Retención', value: `${analyticsData?.performance.appUsage.retentionRate || 0}%`, color: '#9C27B0' },
        ].map((metric, index) => (
          <View key={index} style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: metric.color }]}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Feature Usage */}
      <View style={[styles.featuresCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Uso de Funcionalidades
        </Text>
        
        <View style={styles.featuresList}>
          {[
            { name: 'Eventos', usage: analyticsData?.performance.features.events || 0, icon: Calendar },
            { name: 'Tribus', usage: analyticsData?.performance.features.tribes || 0, icon: Users },
            { name: 'Posts', usage: analyticsData?.performance.features.posts || 0, icon: MessageSquare },
            { name: 'Chat', usage: analyticsData?.performance.features.chat || 0, icon: MessageSquare },
            { name: 'Búsqueda', usage: analyticsData?.performance.features.search || 0, icon: 'search' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                {feature.name === 'Búsqueda' ? (
                  <Ionicons name="search" size={20} color={colors.primary} />
                ) : (
                  <feature.icon size={20} color={colors.primary} />
                )}
              </View>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureName, { color: colors.text }]}>
                  {feature.name}
                </Text>
                <Text style={[styles.featureUsage, { color: colors.textSecondary }]}>
                  {feature.usage}% de uso
                </Text>
              </View>
              <View style={[styles.usageBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.usageFill,
                    { backgroundColor: colors.primary, width: `${feature.usage}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMetricContent = () => {
    switch (selectedMetric) {
      case 'overview':
        return renderOverview();
      case 'events':
        return renderEvents();
      case 'users':
        return renderUsers();
      case 'engagement':
        return renderEngagement();
      case 'performance':
        return renderPerformance();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Analytics
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => Alert.alert('Info', 'Exportar analytics en desarrollo')}
        >
          <Download size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Metric Selector */}
      {renderMetricSelector()}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderMetricContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  periodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  periodTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  metricTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  metricTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  metricContent: {
    gap: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  engagementCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  engagementStat: {
    alignItems: 'center',
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  engagementLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  categoryCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
  },
  categoryPercentage: {
    alignItems: 'flex-end',
    width: 80,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  percentageBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 3,
  },
  attendanceCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceStat: {
    alignItems: 'center',
  },
  attendanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attendanceLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  locationCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationList: {
    gap: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationCount: {
    fontSize: 14,
  },
  locationPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  averagesCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  averagesGrid: {
    gap: 16,
  },
  averageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  averageInfo: {
    flex: 1,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  averageLabel: {
    fontSize: 14,
  },
  featuresCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureUsage: {
    fontSize: 14,
  },
  usageBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: 60,
  },
  usageFill: {
    height: '100%',
    borderRadius: 3,
  },
});

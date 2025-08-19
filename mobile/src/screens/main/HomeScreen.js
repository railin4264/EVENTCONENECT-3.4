import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const featuredEvents = [
    {
      id: 1,
      title: 'Tech Meetup NYC',
      category: 'Tech',
      date: 'Mañana',
      attendees: 45,
    },
    {
      id: 2,
      title: 'Summer Music Festival',
      category: 'Music',
      date: 'Este fin de semana',
      attendees: 120,
    },
  ];

  const quickActions = [
    { title: 'Crear Evento', action: 'create-event', icon: '➕' },
    { title: 'Buscar Eventos', action: 'search-events', icon: '🔍' },
    { title: 'Ver Mapa', action: 'view-map', icon: '🗺️' },
    { title: 'Mis Tribus', action: 'my-tribes', icon: '👥' },
  ];

  const handleQuickAction = (action) => {
    switch (action) {
      case 'view-map':
        navigation.navigate('Map');
        break;
      case 'search-events':
        navigation.navigate('Events');
        break;
      default:
        // TODO: Implementar otras acciones
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.subtitle}>Descubre eventos increíbles cerca de ti</Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.action}
                style={styles.actionButton}
                onPress={() => handleQuickAction(action.action)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.featuredEvents}>
          <Text style={styles.sectionTitle}>Eventos Destacados</Text>
          {featuredEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventCategory}>{event.category}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
              <View style={styles.eventStats}>
                <Text style={styles.attendeesCount}>{event.attendees} asistentes</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.stats}>
          <Text style={styles.sectionTitle}>Tu Actividad</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Eventos Asistidos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Tribus Activas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Eventos Creados</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  quickActions: {
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuredEvents: {
    marginBottom: 30,
  },
  eventCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventCategory: {
    color: '#3b82f6',
    fontSize: 14,
    marginBottom: 4,
  },
  eventDate: {
    color: '#888888',
    fontSize: 12,
  },
  eventStats: {
    alignItems: 'flex-end',
  },
  attendeesCount: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  stats: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#3b82f6',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
  },
});
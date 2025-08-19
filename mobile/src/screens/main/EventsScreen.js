import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';

export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'food', name: 'Comida', icon: '🍕' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'wellness', name: 'Bienestar', icon: '🧘' },
  ];

  const events = [
    {
      id: 1,
      title: 'Tech Meetup NYC',
      category: 'tech',
      date: 'Mañana, 19:00',
      location: 'Manhattan, NY',
      attendees: 45,
      price: 0,
      image: '💻',
    },
    {
      id: 2,
      title: 'Summer Music Festival',
      category: 'music',
      date: 'Este fin de semana',
      location: 'Central Park, NY',
      attendees: 120,
      price: 25,
      image: '🎵',
    },
    {
      id: 3,
      title: 'Food & Wine Tasting',
      category: 'food',
      date: 'Próximo viernes',
      location: 'Brooklyn, NY',
      attendees: 30,
      price: 75,
      image: '🍷',
    },
    {
      id: 4,
      title: 'Startup Pitch Night',
      category: 'business',
      date: 'Próximo martes',
      location: 'Financial District, NY',
      attendees: 80,
      price: 15,
      image: '🚀',
    },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventPress = (event) => {
    // TODO: Navegar a detalles del evento
    console.log('Evento seleccionado:', event.title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Eventos</Text>
        <Text style={styles.subtitle}>Descubre eventos increíbles</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888888"
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleEventPress(event)}
          >
            <View style={styles.eventImage}>
              <Text style={styles.eventImageText}>{event.image}</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
              <View style={styles.eventStats}>
                <Text style={styles.attendeesCount}>{event.attendees} asistentes</Text>
                <Text style={styles.eventPrice}>
                  {event.price === 0 ? 'Gratis' : `$${event.price}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryNameActive: {
    color: '#ffffff',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventImageText: {
    fontSize: 24,
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
  eventDate: {
    color: '#3b82f6',
    fontSize: 14,
    marginBottom: 4,
  },
  eventLocation: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 8,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendeesCount: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  eventPrice: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
});
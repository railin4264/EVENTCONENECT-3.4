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

export default function TribesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todas', icon: '🌟' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'food', name: 'Comida', icon: '🍕' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'wellness', name: 'Bienestar', icon: '🧘' },
  ];

  const tribes = [
    {
      id: 1,
      name: 'NYC Tech Enthusiasts',
      category: 'tech',
      members: 1250,
      description: 'Comunidad de entusiastas de la tecnología en NYC',
      image: '💻',
      isMember: true,
    },
    {
      id: 2,
      name: 'Brooklyn Food Lovers',
      category: 'food',
      members: 890,
      description: 'Amantes de la comida explorando Brooklyn',
      image: '🍕',
      isMember: false,
    },
    {
      id: 3,
      name: 'Manhattan Music Scene',
      category: 'music',
      members: 650,
      description: 'Escena musical vibrante de Manhattan',
      image: '🎵',
      isMember: true,
    },
    {
      id: 4,
      name: 'Startup Founders NYC',
      category: 'business',
      members: 320,
      description: 'Fundadores de startups conectando en NYC',
      image: '🚀',
      isMember: false,
    },
  ];

  const filteredTribes = tribes.filter(tribe => {
    const matchesSearch = tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tribe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTribePress = (tribe) => {
    // TODO: Navegar a detalles de la tribu
    console.log('Tribu seleccionada:', tribe.name);
  };

  const handleJoinLeave = (tribe) => {
    // TODO: Implementar unirse/salir de tribu
    console.log('Acción en tribu:', tribe.isMember ? 'Salir de' : 'Unirse a', tribe.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tribus</Text>
        <Text style={styles.subtitle}>Conecta con comunidades</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tribus..."
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

      <ScrollView style={styles.tribesList} showsVerticalScrollIndicator={false}>
        {filteredTribes.map((tribe) => (
          <TouchableOpacity
            key={tribe.id}
            style={styles.tribeCard}
            onPress={() => handleTribePress(tribe)}
          >
            <View style={styles.tribeImage}>
              <Text style={styles.tribeImageText}>{tribe.image}</Text>
            </View>
            <View style={styles.tribeInfo}>
              <Text style={styles.tribeName}>{tribe.name}</Text>
              <Text style={styles.tribeDescription}>{tribe.description}</Text>
              <View style={styles.tribeStats}>
                <Text style={styles.membersCount}>{tribe.members} miembros</Text>
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    tribe.isMember && styles.leaveButton
                  ]}
                  onPress={() => handleJoinLeave(tribe)}
                >
                  <Text style={styles.joinButtonText}>
                    {tribe.isMember ? 'Salir' : 'Unirse'}
                  </Text>
                </TouchableOpacity>
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
  tribesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tribeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tribeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tribeImageText: {
    fontSize: 24,
  },
  tribeInfo: {
    flex: 1,
  },
  tribeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tribeDescription: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 8,
  },
  tribeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersCount: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
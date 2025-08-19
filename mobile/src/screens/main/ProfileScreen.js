import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function ProfileScreen({ navigation }) {
  const [user] = useState({
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: '👤',
    bio: 'Entusiasta de la tecnología y eventos en NYC',
    location: 'New York, NY',
    joinDate: 'Enero 2024',
  });

  const stats = [
    { label: 'Eventos Asistidos', value: '12', icon: '🎯' },
    { label: 'Tribus Activas', value: '5', icon: '👥' },
    { label: 'Eventos Creados', value: '3', icon: '✨' },
    { label: 'Días Activo', value: '45', icon: '📅' },
  ];

  const menuItems = [
    { title: 'Editar Perfil', icon: '✏️', action: 'edit-profile' },
    { title: 'Configuración', icon: '⚙️', action: 'settings' },
    { title: 'Notificaciones', icon: '🔔', action: 'notifications' },
    { title: 'Privacidad', icon: '🔒', action: 'privacy' },
    { title: 'Ayuda', icon: '❓', action: 'help' },
    { title: 'Acerca de', icon: 'ℹ️', action: 'about' },
  ];

  const handleMenuAction = (action) => {
    switch (action) {
      case 'edit-profile':
        Alert.alert('Info', 'Editar perfil implementado próximamente');
        break;
      case 'settings':
        Alert.alert('Info', 'Configuración implementada próximamente');
        break;
      case 'notifications':
        Alert.alert('Info', 'Notificaciones implementadas próximamente');
        break;
      case 'privacy':
        Alert.alert('Info', 'Privacidad implementada próximamente');
        break;
      case 'help':
        Alert.alert('Info', 'Ayuda implementada próximamente');
        break;
      case 'about':
        Alert.alert('Info', 'Acerca de implementado próximamente');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar logout real
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{user.avatar}</Text>
          </View>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{user.location}</Text>
          </View>
          <Text style={styles.joinDate}>Miembro desde {user.joinDate}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuAction(item.action)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  location: {
    fontSize: 14,
    color: '#888888',
  },
  joinDate: {
    fontSize: 12,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  menuArrow: {
    fontSize: 18,
    color: '#888888',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
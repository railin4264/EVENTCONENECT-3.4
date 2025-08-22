import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../contexts/DynamicThemeContext';
import { useNotifications } from '../components/notifications/ImmersiveNotifications';
import { ParticleSystem } from '../components/advanced-systems/ParticleSystem';
import { MorphingCard, FluidButton, BreathingElement } from '../components/advanced-systems/FluidTransitions';
import { DynamicIllustration } from '../components/advanced-systems/DynamicIllustrations';
import { PredictiveSuggestions, AdvancedCustomization } from '../components/advanced-systems/PredictiveUI';
import { GamificationSystem } from '../components/gamification/GamificationSystem';

export const AdvancedDemoScreen: React.FC = () => {
  const { currentTheme, setEventType } = useDynamicTheme();
  const { addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState(0);
  const [showCustomization, setShowCustomization] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Cambiar tema aleatoriamente cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const themes = ['music', 'tech', 'art', 'nature', 'sports', 'romantic'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      if (randomTheme) {
        setEventType(randomTheme);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [setEventType]);

  // Agregar notificaciones de ejemplo
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      const notifications = [
        {
          type: 'achievement' as const,
          title: '¡Logro Desbloqueado!',
          message: 'Has completado tu primer evento',
          icon: '🏆',
          priority: 'high' as const
        },
        {
          type: 'event' as const,
          title: 'Evento Próximo',
          message: 'Tu evento comienza en 1 hora',
          icon: '⏰',
          priority: 'urgent' as const
        },
        {
          type: 'social' as const,
          title: 'Nueva Conexión',
          message: 'María García se unió a tu evento',
          icon: '👥',
          priority: 'medium' as const
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      if (randomNotification) {
        addNotification(randomNotification);
      }
    }, 15000);

    return () => clearInterval(notificationInterval);
  }, [addNotification]);

  const handleTabPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(index);
  };

  const handleCustomizationSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const tabs = [
    { id: 0, name: 'Sistemas', icon: '⚡' },
    { id: 1, name: 'Gamificación', icon: '🏆' },
    { id: 2, name: 'Feed', icon: '📱' },
    { id: 3, name: 'Config', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Sistemas Avanzados</Text>
            
            {/* Sistema de Partículas */}
            <View style={styles.systemSection}>
              <Text style={styles.systemTitle}>Sistema de Partículas 3D</Text>
              <View style={styles.particleContainer}>
                <ParticleSystem theme="default" />
              </View>
            </View>

            {/* Transiciones Fluidas */}
            <View style={styles.systemSection}>
              <Text style={styles.systemTitle}>Transiciones Fluidas</Text>
              <View style={styles.componentsRow}>
                <MorphingCard style={styles.componentCard}>
                  <Text style={styles.componentText}>Tarjeta Morfing</Text>
                </MorphingCard>
                
                <FluidButton style={styles.componentButton}>
                  <Text style={styles.componentText}>Botón Fluido</Text>
                </FluidButton>
              </View>
              
              <BreathingElement style={styles.breathingContainer}>
                <Text style={styles.componentText}>Elemento Respirando</Text>
              </BreathingElement>
            </View>

            {/* Ilustraciones Dinámicas */}
            <View style={styles.systemSection}>
              <Text style={styles.systemTitle}>Ilustraciones Dinámicas</Text>
              <View style={styles.illustrationsRow}>
                <DynamicIllustration type="person" context="morning" size="small" />
                <DynamicIllustration type="scene" context="music" size="small" />
                <DynamicIllustration type="icon" context="success" size="small" />
              </View>
            </View>

            {/* Interfaces Predictivas */}
            <View style={styles.systemSection}>
              <Text style={styles.systemTitle}>Interfaces Predictivas</Text>
              <PredictiveSuggestions
                context="search"
                onSuggestionPress={(suggestion) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  console.log('Sugerencia seleccionada:', suggestion);
                }}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.tabContent}>
            <GamificationSystem userId="demo-user" />
          </View>
        );

      case 2:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Feed Social</Text>
            <Text style={styles.placeholderText}>
              El feed social se mostrará aquí con todas las funcionalidades avanzadas
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => setShowCustomization(true)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={currentTheme.gradients.primary}
                style={styles.configButtonGradient}
              >
                <Text style={styles.configButtonText}>Personalización Avanzada</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.currentThemeInfo}>
              <Text style={styles.themeLabel}>Tema Actual:</Text>
              <Text style={styles.themeValue}>{currentTheme.name}</Text>
              <Text style={styles.themeMood}>Estado de ánimo: {currentTheme.mood}</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={currentTheme.gradients.primary}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>EventConnect</Text>
          <Text style={styles.headerSubtitle}>Demo de Sistemas Avanzados</Text>
        </Animated.View>
      </LinearGradient>

      {/* Navegación por pestañas */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive,
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido de la pestaña */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {renderTabContent()}
        </Animated.View>
      </ScrollView>

      {/* Panel de personalización */}
      <AdvancedCustomization
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
        onSave={handleCustomizationSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentWrapper: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  systemSection: {
    marginBottom: 30,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  particleContainer: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  componentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  componentCard: {
    flex: 1,
    marginRight: 8,
  },
  componentButton: {
    flex: 1,
    marginLeft: 8,
  },
  componentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  breathingContainer: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  illustrationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  configButton: {
    marginBottom: 20,
  },
  configButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  configButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  currentThemeInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  themeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  themeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  themeMood: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default AdvancedDemoScreen;
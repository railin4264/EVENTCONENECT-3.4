import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../contexts/DynamicThemeContext';
import { ParticleSystem } from '../components/advanced-systems/ParticleSystem';
import { MorphingCard, FluidButton, BreathingElement } from '../components/advanced-systems/FluidTransitions';
import { GamificationSystem } from '../components/gamification/GamificationSystem';
import { useNotifications } from '../components/notifications/ImmersiveNotifications';
import { DynamicIllustration } from '../components/advanced-systems/DynamicIllustrations';
import { PredictiveSuggestions, AdvancedCustomization } from '../components/advanced-systems/PredictiveUI';
import { SocialFeed } from '../components/feed/SocialFeed';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const AdvancedDemoScreen: React.FC = () => {
  const { currentTheme, setEventType, setUserMood, setLocation } = useDynamicTheme();
  const { addNotification } = useNotifications();
  const [showPredictive, setShowPredictive] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentSection, setCurrentSection] = useState('feed');

  // Cambiar tema automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      const themes = ['music', 'tech', 'art', 'nature', 'sports', 'romantic'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      setEventType(randomTheme);
      
      // Feedback háptico sutil
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSuggestionPress = (suggestion: any) => {
    addNotification({
      type: 'info',
      title: 'Sugerencia Seleccionada',
      message: `Has seleccionado: ${suggestion.title}`,
      icon: suggestion.icon,
      priority: 'medium',
      autoClose: true,
      duration: 3000
    });
  };

  const handleCustomizationSave = (settings: any) => {
    addNotification({
      type: 'success',
      title: 'Configuración Guardada',
      message: `Se han aplicado tus preferencias de ${settings.layout}`,
      icon: '✅',
      priority: 'high',
      autoClose: true,
      duration: 4000
    });
  };

  const showRandomNotification = () => {
    const notifications = [
      {
        type: 'achievement' as const,
        title: '¡Nuevo Logro!',
        message: 'Has desbloqueado "Explorador de Eventos"',
        icon: '🏆',
        priority: 'high' as const
      },
      {
        type: 'event' as const,
        title: 'Evento Próximo',
        message: 'Tu evento favorito comienza en 1 hora',
        icon: '🎉',
        priority: 'urgent' as const
      },
      {
        type: 'social' as const,
        title: 'Nueva Conexión',
        message: 'María te ha enviado una invitación',
        icon: '👥',
        priority: 'medium' as const
      }
    ];

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    addNotification(randomNotification);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'feed':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Feed Social</Text>
            <SocialFeed />
          </View>
        );

      case 'particles':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sistema de Partículas 3D</Text>
            <ParticleSystem theme={currentTheme.name} />
          </View>
        );

      case 'transitions':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Transiciones Fluidas</Text>
            <View style={styles.transitionsGrid}>
              <MorphingCard style={styles.demoCard}>
                <Text style={styles.demoCardText}>Tarjeta Morfing</Text>
              </MorphingCard>
              
              <FluidButton 
                variant="expand" 
                style={styles.demoButton}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                Botón Fluido
              </FluidButton>
              
              <BreathingElement style={styles.breathingElement}>
                <Text style={styles.breathingText}>Elemento Respirando</Text>
              </BreathingElement>
            </View>
          </View>
        );

      case 'gamification':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sistema de Gamificación</Text>
            <GamificationSystem userId="demo-user" />
          </View>
        );

      case 'illustrations':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ilustraciones Dinámicas</Text>
            <View style={styles.illustrationsGrid}>
              <DynamicIllustration 
                type="person" 
                context="morning" 
                size="medium"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
              <DynamicIllustration 
                type="scene" 
                context="music" 
                size="medium"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
              <DynamicIllustration 
                type="icon" 
                context="success" 
                size="medium"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={currentTheme.gradients.background}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>EventConnect Pro</Text>
          <Text style={styles.headerSubtitle}>
            Tema: {currentTheme.name} | Estado de ánimo: {currentTheme.mood}
          </Text>
        </LinearGradient>
      </View>

      {/* Navegación de secciones */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sectionNavigation}
        contentContainerStyle={styles.sectionNavigationContent}
      >
        {[
          { key: 'feed', label: 'Feed Social', icon: '📱' },
          { key: 'particles', label: 'Partículas', icon: '✨' },
          { key: 'transitions', label: 'Transiciones', icon: '🔄' },
          { key: 'gamification', label: 'Gamificación', icon: '🏆' },
          { key: 'illustrations', label: 'Ilustraciones', icon: '🎨' }
        ].map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionTab,
              currentSection === section.key && styles.sectionTabActive
            ]}
            onPress={() => {
              setCurrentSection(section.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTabIcon}>{section.icon}</Text>
            <Text style={[
              styles.sectionTabLabel,
              currentSection === section.key && styles.sectionTabLabelActive
            ]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contenido principal */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderSection()}

        {/* Botones de demostración */}
        <View style={styles.demoButtonsContainer}>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => {
              setShowPredictive(!showPredictive);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.demoButtonText}>
              {showPredictive ? 'Ocultar' : 'Mostrar'} Sugerencias
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => {
              setShowCustomization(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.demoButtonText}>Personalización</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={showRandomNotification}
            activeOpacity={0.7}
          >
            <Text style={styles.demoButtonText}>Notificación Aleatoria</Text>
          </TouchableOpacity>
        </View>

        {/* Información del tema actual */}
        <View style={styles.themeInfo}>
          <LinearGradient
            colors={currentTheme.gradients.secondary}
            style={styles.themeInfoGradient}
          >
            <Text style={styles.themeInfoTitle}>Información del Tema</Text>
            <Text style={styles.themeInfoText}>
              Nombre: {currentTheme.name}
            </Text>
            <Text style={styles.themeInfoText}>
              Estado de ánimo: {currentTheme.mood}
            </Text>
            <Text style={styles.themeInfoText}>
              Colores: {currentTheme.colors.primary} / {currentTheme.colors.secondary}
            </Text>
            <Text style={styles.themeInfoText}>
              Partículas: {currentTheme.particles.count}
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Sugerencias predictivas */}
      {showPredictive && (
        <PredictiveSuggestions
          context="actions"
          onSuggestionPress={handleSuggestionPress}
        />
      )}

      {/* Modal de personalización */}
      <AdvancedCustomization
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
        onSave={handleCustomizationSave}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  sectionNavigation: {
    maxHeight: 80,
  },
  sectionNavigationContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTab: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    minWidth: 100,
  },
  sectionTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  sectionTabLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  sectionTabLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  transitionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  demoCard: {
    width: 150,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoCardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  breathingElement: {
    width: 150,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  breathingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  illustrationsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  demoButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
    marginBottom: 30,
  },
  themeInfo: {
    marginBottom: 30,
  },
  themeInfoGradient: {
    padding: 20,
    borderRadius: 20,
  },
  themeInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeInfoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
});

export default AdvancedDemoScreen;
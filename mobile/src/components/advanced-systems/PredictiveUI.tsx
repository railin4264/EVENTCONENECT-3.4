import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Componente de sugerencias predictivas
export const PredictiveSuggestions: React.FC<{
  context: 'search' | 'navigation' | 'actions' | 'content';
  onSuggestionPress: (suggestion: any) => void;
  style?: any;
}> = ({ context, onSuggestionPress, style = {} }) => {
  const { currentTheme } = useDynamicTheme();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Generar sugerencias basadas en el contexto
  useEffect(() => {
    const generateSuggestions = () => {
      let contextSuggestions: any[] = [];

      switch (context) {
        case 'search':
          contextSuggestions = [
            {
              id: '1',
              title: 'Eventos de música',
              description: 'Basado en tu historial',
              icon: '🎵',
              type: 'personalized',
              priority: 1
            },
            {
              id: '2',
              title: 'Eventos próximos',
              description: 'Esta semana',
              icon: '📅',
              type: 'contextual',
              priority: 2
            },
            {
              id: '3',
              title: 'Eventos trending',
              description: 'Populares ahora',
              icon: '🔥',
              type: 'trending',
              priority: 3
            }
          ];
          break;

        case 'navigation':
          contextSuggestions = [
            {
              id: '4',
              title: 'Mi perfil',
              description: 'Actualizado hace 2 horas',
              icon: '👤',
              type: 'personalized',
              priority: 1
            },
            {
              id: '5',
              title: 'Eventos guardados',
              description: '5 eventos guardados',
              icon: '❤️',
              type: 'personalized',
              priority: 2
            },
            {
              id: '6',
              title: 'Calendario',
              description: 'Próximo evento en 3 días',
              icon: '📆',
              type: 'contextual',
              priority: 3
            }
          ];
          break;

        case 'actions':
          contextSuggestions = [
            {
              id: '7',
              title: 'Crear evento',
              description: 'Organiza tu propio evento',
              icon: '✨',
              type: 'contextual',
              priority: 1
            },
            {
              id: '8',
              title: 'Invitar amigos',
              description: 'Comparte eventos',
              icon: '👥',
              type: 'personalized',
              priority: 2
            },
            {
              id: '9',
              title: 'Configurar recordatorios',
              description: 'No te pierdas nada',
              icon: '⏰',
              type: 'contextual',
              priority: 3
            }
          ];
          break;

        case 'content':
          contextSuggestions = [
            {
              id: '10',
              title: 'Eventos similares',
              description: 'Basado en tus gustos',
              icon: '🎯',
              type: 'personalized',
              priority: 1
            },
            {
              id: '11',
              title: 'Recomendaciones',
              description: 'Nuevos para ti',
              icon: '💡',
              type: 'personalized',
              priority: 2
            },
            {
              id: '12',
              title: 'Tendencias',
              description: 'Lo que está de moda',
              icon: '📈',
              type: 'trending',
              priority: 3
            }
          ];
          break;
      }

      // Ordenar por prioridad
      contextSuggestions.sort((a: any, b: any) => a.priority - b.priority);
      setSuggestions(contextSuggestions);
    };

    generateSuggestions();
  }, [context]);

  // Mostrar sugerencias con animación
  useEffect(() => {
    if (suggestions.length > 0) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [suggestions]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.suggestionsContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={currentTheme.gradients.secondary}
        style={styles.suggestionsGradient}
      >
        <Text style={styles.suggestionsTitle}>
          Sugerencias {context === 'search' ? 'de búsqueda' : 
                       context === 'navigation' ? 'de navegación' :
                       context === 'actions' ? 'de acciones' : 'de contenido'}
        </Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSuggestionPress(suggestion);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionIcon}>
                <Text style={styles.suggestionIconText}>{suggestion.icon}</Text>
              </View>
              
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionDescription}>
                  {suggestion.description}
                </Text>
              </View>
              
              <View style={[
                styles.suggestionType,
                {
                  backgroundColor: suggestion.type === 'personalized' ? '#22c55e' :
                                 suggestion.type === 'trending' ? '#f59e0b' :
                                 suggestion.type === 'recent' ? '#3b82f6' : '#8b5cf6'
                }
              ]}>
                <Text style={styles.suggestionTypeText}>
                  {suggestion.type === 'personalized' ? '🎯' :
                   suggestion.type === 'trending' ? '🔥' :
                   suggestion.type === 'recent' ? '🕒' : '💡'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
};

// Componente de personalización avanzada
export const AdvancedCustomization: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}> = ({ isVisible, onClose, onSave }) => {
  const { currentTheme } = useDynamicTheme();
  const [settings, setSettings] = useState({
    layout: 'grid',
    colors: 'auto',
    typography: 'medium',
    density: 'comfortable',
    animations: 'high'
  });

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(settings);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.modalOverlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={currentTheme.gradients.primary}
          style={styles.modalGradient}
        >
          <Text style={styles.modalTitle}>Personalización Avanzada</Text>
          
          <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
            {/* Layout */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Layout</Text>
              <View style={styles.optionsContainer}>
                {['grid', 'list', 'card'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      settings.layout === option && styles.optionButtonActive
                    ]}
                    onPress={() => setSettings({ ...settings, layout: option })}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.layout === option && styles.optionTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Colores */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Esquema de Colores</Text>
              <View style={styles.optionsContainer}>
                {['auto', 'light', 'dark', 'colorful'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      settings.colors === option && styles.optionButtonActive
                    ]}
                    onPress={() => setSettings({ ...settings, colors: option })}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.colors === option && styles.optionTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tipografía */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Tamaño de Texto</Text>
              <View style={styles.optionsContainer}>
                {['small', 'medium', 'large'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      settings.typography === option && styles.optionButtonActive
                    ]}
                    onPress={() => setSettings({ ...settings, typography: option })}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.typography === option && styles.optionTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Densidad */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Densidad de Información</Text>
              <View style={styles.optionsContainer}>
                {['compact', 'comfortable', 'spacious'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      settings.density === option && styles.optionButtonActive
                    ]}
                    onPress={() => setSettings({ ...settings, density: option })}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.density === option && styles.optionTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Animaciones */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Nivel de Animaciones</Text>
              <View style={styles.optionsContainer}>
                {['low', 'medium', 'high'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      settings.animations === option && styles.optionButtonActive
                    ]}
                    onPress={() => setSettings({ ...settings, animations: option })}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.animations === option && styles.optionTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Estilos para PredictiveSuggestions
  suggestionsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    maxHeight: 300,
  },
  suggestionsGradient: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionIconText: {
    fontSize: 20,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  suggestionType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionTypeText: {
    fontSize: 12,
    color: '#fff',
  },

  // Estilos para AdvancedCustomization
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },
  modalContainer: {
    backgroundColor: 'transparent',
  },
  modalGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#fff',
  },
  optionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PredictiveSuggestions;
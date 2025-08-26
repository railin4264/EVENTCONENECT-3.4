import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// ===== THEME SELECTOR COMPONENT =====
export const ThemeSelector: React.FC<{
  visible: boolean;
  onClose: () => void;
  compact?: boolean;
}> = ({ visible, onClose, compact = false }) => {
  const {
    theme,
    presetThemes,
    isLoading,
    updateTheme,
    applyPresetTheme,
    toggleThemeMode,
    getCurrentMode
  } = useTheme();
  
  const styles = useThemedStyles();
  const [activeTab, setActiveTab] = useState<'mode' | 'colors' | 'effects' | 'presets'>('mode');
  const [slideAnim] = useState(new Animated.Value(height));

  // ===== ANIMATION EFFECTS =====
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ===== HAPTIC FEEDBACK =====
  const hapticSelect = () => {
    Haptics.selectionAsync();
  };

  const hapticImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // ===== MODE SELECTOR =====
  const ModeSelector = () => {
    const modes = [
      { value: 'light', label: 'Claro', icon: 'sunny-outline' },
      { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
      { value: 'auto', label: 'Auto', icon: 'phone-portrait-outline' }
    ];

    return (
      <View style={componentStyles.section}>
        <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
          Modo de Tema
        </Text>
        <View style={componentStyles.modeGrid}>
          {modes.map(({ value, label, icon }) => (
            <TouchableOpacity
              key={value}
              style={[
                componentStyles.modeButton,
                {
                  backgroundColor: theme.mode === value 
                    ? styles.colors.primary + '20' 
                    : styles.colors.surface,
                  borderColor: theme.mode === value 
                    ? styles.colors.primary 
                    : 'transparent',
                }
              ]}
              onPress={() => {
                hapticSelect();
                updateTheme({ mode: value as any });
              }}
            >
              <Ionicons 
                name={icon as any} 
                size={32} 
                color={theme.mode === value ? styles.colors.primary : styles.colors.text} 
              />
              <Text style={[
                componentStyles.modeLabel, 
                { 
                  color: theme.mode === value ? styles.colors.primary : styles.colors.text 
                }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ===== COLOR SELECTOR =====
  const ColorSelector = () => {
    const colors = [
      { value: 'cyan', color: '#06b6d4', name: 'Cian' },
      { value: 'purple', color: '#8b5cf6', name: 'Púrpura' },
      { value: 'blue', color: '#3b82f6', name: 'Azul' },
      { value: 'green', color: '#10b981', name: 'Verde' },
      { value: 'orange', color: '#f59e0b', name: 'Naranja' },
      { value: 'pink', color: '#ec4899', name: 'Rosa' },
      { value: 'red', color: '#ef4444', name: 'Rojo' }
    ];

    return (
      <ScrollView style={componentStyles.section} showsVerticalScrollIndicator={false}>
        {/* Primary Color */}
        <View style={componentStyles.colorSection}>
          <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
            Color Primario
          </Text>
          <View style={componentStyles.colorGrid}>
            {colors.map(({ value, color, name }) => (
              <TouchableOpacity
                key={`primary-${value}`}
                style={[
                  componentStyles.colorButton,
                  {
                    backgroundColor: color,
                    borderWidth: theme.primaryColor === value ? 3 : 0,
                    borderColor: styles.colors.text,
                    transform: [{ scale: theme.primaryColor === value ? 1.1 : 1 }]
                  }
                ]}
                onPress={() => {
                  hapticSelect();
                  updateTheme({ primaryColor: value as any });
                }}
              >
                <Text style={componentStyles.colorName}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accent Color */}
        <View style={componentStyles.colorSection}>
          <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
            Color de Acento
          </Text>
          <View style={componentStyles.colorGrid}>
            {colors.map(({ value, color, name }) => (
              <TouchableOpacity
                key={`accent-${value}`}
                style={[
                  componentStyles.colorButton,
                  {
                    backgroundColor: color,
                    borderWidth: theme.accentColor === value ? 3 : 0,
                    borderColor: styles.colors.text,
                    transform: [{ scale: theme.accentColor === value ? 1.1 : 1 }]
                  }
                ]}
                onPress={() => {
                  hapticSelect();
                  updateTheme({ accentColor: value as any });
                }}
              >
                <Text style={componentStyles.colorName}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  // ===== EFFECTS SELECTOR =====
  const EffectsSelector = () => {
    const effects = [
      {
        key: 'animations',
        label: 'Animaciones',
        description: 'Transiciones y efectos de movimiento',
        icon: 'flash-outline'
      },
      {
        key: 'glassEffect',
        label: 'Efecto Cristal',
        description: 'Transparencias y blur en componentes',
        icon: 'glasses-outline'
      },
      {
        key: 'neonEffects',
        label: 'Efectos Neón',
        description: 'Bordes brillantes y sombras coloridas',
        icon: 'bulb-outline'
      },
      {
        key: 'reducedMotion',
        label: 'Movimiento Reducido',
        description: 'Menos animaciones para accesibilidad',
        icon: 'eye-off-outline'
      }
    ];

    return (
      <ScrollView style={componentStyles.section} showsVerticalScrollIndicator={false}>
        <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
          Efectos Visuales
        </Text>
        <View style={componentStyles.effectsList}>
          {effects.map(({ key, label, description, icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                componentStyles.effectItem,
                {
                  backgroundColor: theme[key as keyof typeof theme] 
                    ? styles.colors.primary + '20' 
                    : styles.colors.surface,
                  borderColor: theme[key as keyof typeof theme] 
                    ? styles.colors.primary 
                    : 'transparent',
                }
              ]}
              onPress={() => {
                hapticSelect();
                updateTheme({ [key]: !theme[key as keyof typeof theme] });
              }}
            >
              <View style={componentStyles.effectInfo}>
                <Ionicons 
                  name={icon as any} 
                  size={24} 
                  color={styles.colors.primary} 
                />
                <View style={componentStyles.effectText}>
                  <Text style={[componentStyles.effectLabel, { color: styles.colors.text }]}>
                    {label}
                  </Text>
                  <Text style={[componentStyles.effectDescription, { color: styles.colors.text + '80' }]}>
                    {description}
                  </Text>
                </View>
              </View>
              <Switch
                value={theme[key as keyof typeof theme] as boolean}
                onValueChange={(value) => {
                  hapticSelect();
                  updateTheme({ [key]: value });
                }}
                trackColor={{
                  false: styles.colors.surface,
                  true: styles.colors.primary + '60'
                }}
                thumbColor={theme[key as keyof typeof theme] ? styles.colors.primary : styles.colors.text + '60'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ===== PRESET THEMES =====
  const PresetThemes = () => (
    <ScrollView style={componentStyles.section} showsVerticalScrollIndicator={false}>
      <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
        Temas Predefinidos
      </Text>
      <View style={componentStyles.presetsList}>
        {presetThemes.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              componentStyles.presetItem,
              {
                backgroundColor: theme.appliedPreset === preset.id 
                  ? styles.colors.primary + '20' 
                  : styles.colors.surface,
                borderColor: theme.appliedPreset === preset.id 
                  ? styles.colors.primary 
                  : 'transparent',
              }
            ]}
            onPress={() => {
              hapticImpact();
              applyPresetTheme(preset.id);
            }}
          >
            <LinearGradient
              colors={[preset.config.customColors.primary, preset.config.customColors.secondary]}
              style={componentStyles.presetPreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={componentStyles.presetInfo}>
              <Text style={[componentStyles.presetName, { color: styles.colors.text }]}>
                {preset.name}
              </Text>
              <Text style={[componentStyles.presetDescription, { color: styles.colors.text + '80' }]}>
                {preset.description}
              </Text>
            </View>
            {theme.appliedPreset === preset.id && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={styles.colors.primary} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ===== COMPACT MODE =====
  if (compact) {
    return (
      <View style={[componentStyles.compactContainer, { backgroundColor: styles.colors.surface }]}>
        <View style={componentStyles.compactHeader}>
          <Text style={[componentStyles.compactTitle, { color: styles.colors.text }]}>
            Tema
          </Text>
          <TouchableOpacity
            onPress={() => {
              hapticSelect();
              toggleThemeMode();
            }}
            style={[componentStyles.compactToggle, { backgroundColor: styles.colors.primary }]}
          >
            <Ionicons 
              name={getCurrentMode() === 'dark' ? 'sunny' : 'moon'} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        <ModeSelector />
      </View>
    );
  }

  // ===== FULL MODAL =====
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={componentStyles.modalOverlay}>
        <Animated.View
          style={[
            componentStyles.modalContainer,
            {
              backgroundColor: styles.colors.background,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={[componentStyles.modalHeader, { borderBottomColor: styles.colors.surface }]}>
            <Text style={[componentStyles.modalTitle, { color: styles.colors.text }]}>
              Personalización de Tema
            </Text>
            <TouchableOpacity
              onPress={() => {
                hapticSelect();
                onClose();
              }}
              style={componentStyles.closeButton}
            >
              <Ionicons name="close" size={24} color={styles.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[componentStyles.tabBar, { backgroundColor: styles.colors.surface }]}>
            {[
              { key: 'mode', label: 'Modo', icon: 'phone-portrait-outline' },
              { key: 'colors', label: 'Colores', icon: 'color-palette-outline' },
              { key: 'effects', label: 'Efectos', icon: 'flash-outline' },
              { key: 'presets', label: 'Temas', icon: 'brush-outline' }
            ].map(({ key, label, icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  componentStyles.tab,
                  {
                    backgroundColor: activeTab === key ? styles.colors.primary + '20' : 'transparent'
                  }
                ]}
                onPress={() => {
                  hapticSelect();
                  setActiveTab(key as any);
                }}
              >
                <Ionicons 
                  name={icon as any} 
                  size={20} 
                  color={activeTab === key ? styles.colors.primary : styles.colors.text + '80'} 
                />
                <Text style={[
                  componentStyles.tabLabel,
                  { 
                    color: activeTab === key ? styles.colors.primary : styles.colors.text + '80' 
                  }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={componentStyles.content}>
            {activeTab === 'mode' && <ModeSelector />}
            {activeTab === 'colors' && <ColorSelector />}
            {activeTab === 'effects' && <EffectsSelector />}
            {activeTab === 'presets' && <PresetThemes />}
          </View>

          {/* Loading overlay */}
          {isLoading && (
            <View style={componentStyles.loadingOverlay}>
              <View style={[componentStyles.loadingSpinner, { backgroundColor: styles.colors.surface }]}>
                <Text style={[componentStyles.loadingText, { color: styles.colors.text }]}>
                  Aplicando tema...
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ===== STYLES =====
const componentStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorName: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  effectsList: {
    gap: 12,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  effectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  effectText: {
    marginLeft: 12,
    flex: 1,
  },
  effectLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  effectDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  presetsList: {
    gap: 12,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  presetPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  presetInfo: {
    marginLeft: 12,
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  presetDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  compactContainer: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  compactToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemeSelector;

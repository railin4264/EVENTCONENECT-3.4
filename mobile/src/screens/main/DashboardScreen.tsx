import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

// ===== INTERFACES =====
interface DashboardWidget {
  id: string;
  type: 'events' | 'stats' | 'map' | 'notifications' | 'tribes' | 'shortcuts' | 'trending' | 'calendar';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  settings: Record<string, any>;
  visible: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  isDefault: boolean;
}

// ===== DASHBOARD SCREEN COMPONENT =====
export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string>('default');

  // ===== INITIAL WIDGETS =====
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'upcoming-events',
      type: 'events',
      title: 'Próximos Eventos',
      size: 'large',
      position: { x: 0, y: 0 },
      settings: { limit: 5, showImages: true },
      visible: true
    },
    {
      id: 'my-stats',
      type: 'stats',
      title: 'Mis Estadísticas',
      size: 'medium',
      position: { x: 2, y: 0 },
      settings: { showGrowth: true, period: '30d' },
      visible: true
    },
    {
      id: 'notifications',
      type: 'notifications',
      title: 'Notificaciones',
      size: 'small',
      position: { x: 2, y: 1 },
      settings: { showUnreadOnly: true, limit: 3 },
      visible: true
    }
  ]);

  // ===== AVAILABLE WIDGET TYPES =====
  const availableWidgets = [
    {
      type: 'events',
      title: 'Próximos Eventos',
      description: 'Lista de eventos a los que asistirás',
      icon: 'event',
      color: '#06b6d4',
      defaultSize: 'large'
    },
    {
      type: 'stats',
      title: 'Estadísticas',
      description: 'Métricas de tu actividad',
      icon: 'bar-chart',
      color: '#8b5cf6',
      defaultSize: 'medium'
    },
    {
      type: 'map',
      title: 'Mapa de Eventos',
      description: 'Eventos cercanos en mapa',
      icon: 'map',
      color: '#10b981',
      defaultSize: 'medium'
    },
    {
      type: 'notifications',
      title: 'Notificaciones',
      description: 'Alertas y mensajes',
      icon: 'notifications',
      color: '#f59e0b',
      defaultSize: 'small'
    },
    {
      type: 'tribes',
      title: 'Mis Comunidades',
      description: 'Tribus a las que perteneces',
      icon: 'people',
      color: '#6366f1',
      defaultSize: 'medium'
    },
    {
      type: 'shortcuts',
      title: 'Accesos Rápidos',
      description: 'Acciones frecuentes',
      icon: 'flash',
      color: '#ec4899',
      defaultSize: 'small'
    },
    {
      type: 'trending',
      title: 'Tendencias',
      description: 'Eventos populares',
      icon: 'trending-up',
      color: '#f59e0b',
      defaultSize: 'medium'
    },
    {
      type: 'calendar',
      title: 'Calendario',
      description: 'Vista de calendario compacta',
      icon: 'calendar-today',
      color: '#06b6d4',
      defaultSize: 'large'
    }
  ];

  // ===== HANDLERS =====
  const handleAddWidget = (widgetType: string) => {
    const widgetConfig = availableWidgets.find(w => w.type === widgetType);
    if (!widgetConfig) return;

    const newWidget: DashboardWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType as any,
      title: widgetConfig.title,
      size: widgetConfig.defaultSize as any,
      position: { x: 0, y: widgets.length },
      settings: {},
      visible: true
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetSelector(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    Alert.alert(
      'Eliminar Widget',
      '¿Estás seguro de que quieres eliminar este widget?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setWidgets(prev => prev.filter(w => w.id !== widgetId));
          }
        }
      ]
    );
  };

  const handleSaveLayout = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditMode(false);
      Alert.alert('Éxito', 'Dashboard guardado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLayout = () => {
    Alert.alert(
      'Restablecer Layout',
      '¿Estás seguro de que quieres restablecer el layout por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setWidgets([
              {
                id: 'upcoming-events',
                type: 'events',
                title: 'Próximos Eventos',
                size: 'large',
                position: { x: 0, y: 0 },
                settings: { limit: 5, showImages: true },
                visible: true
              },
              {
                id: 'my-stats',
                type: 'stats',
                title: 'Mis Estadísticas',
                size: 'medium',
                position: { x: 2, y: 0 },
                settings: { showGrowth: true, period: '30d' },
                visible: true
              }
            ]);
          }
        }
      ]
    );
  };

  // ===== WIDGET COMPONENTS =====
  const EventsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={styles.widgetContent}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.eventItem, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.eventIcon, { backgroundColor: '#06b6d4' }]} />
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
              Evento de Ejemplo {i}
            </Text>
            <Text style={[styles.eventSubtitle, { color: theme.colors.textSecondary }]}>
              Mañana a las 19:00
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const StatsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={styles.statsGrid}>
      <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statNumber, { color: '#06b6d4' }]}>12</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Eventos</Text>
      </View>
      <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>5</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tribus</Text>
      </View>
      <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statNumber, { color: '#10b981' }]}>89%</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Asistencia</Text>
      </View>
      <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>4.8</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rating</Text>
      </View>
    </View>
  );

  const MapWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={[styles.mapWidget, { backgroundColor: theme.colors.card }]}>
      <MaterialIcons name="map" size={48} color="#10b981" />
      <Text style={[styles.mapTitle, { color: theme.colors.text }]}>Mapa Interactivo</Text>
      <Text style={[styles.mapSubtitle, { color: theme.colors.textSecondary }]}>15 eventos cerca</Text>
    </View>
  );

  const NotificationsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={styles.widgetContent}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.notificationItem, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.notificationDot, { backgroundColor: '#f59e0b' }]} />
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationText, { color: theme.colors.text }]}>
              Nueva notificación {i}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
              Hace 2 min
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const TribesWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={styles.widgetContent}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.tribeItem, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.tribeIcon, { backgroundColor: '#6366f1' }]} />
          <View style={styles.tribeInfo}>
            <Text style={[styles.tribeTitle, { color: theme.colors.text }]}>Tribu {i}</Text>
            <Text style={[styles.tribeSubtitle, { color: theme.colors.textSecondary }]}>250 miembros</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const ShortcutsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={styles.shortcutsGrid}>
      {[
        { label: 'Crear Evento', icon: 'add', color: '#06b6d4' },
        { label: 'Buscar', icon: 'search', color: '#8b5cf6' },
        { label: 'Mi Perfil', icon: 'person', color: '#10b981' },
        { label: 'Configuración', icon: 'settings', color: '#f59e0b' }
      ].map((shortcut, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.shortcutItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name={shortcut.icon as any} size={24} color={shortcut.color} />
          <Text style={[styles.shortcutLabel, { color: theme.colors.text }]}>
            {shortcut.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const TrendingWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={styles.widgetContent}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.trendingItem, { backgroundColor: theme.colors.card }]}>
          <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
          <View style={styles.trendingInfo}>
            <Text style={[styles.trendingTitle, { color: theme.colors.text }]}>
              Evento Trending {i}
            </Text>
            <Text style={[styles.trendingSubtitle, { color: theme.colors.textSecondary }]}>
              +{i * 50}% popularidad
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const CalendarWidget = ({ widget }: { widget: DashboardWidget }) => (
    <View style={[styles.calendarWidget, { backgroundColor: theme.colors.card }]}>
      <View style={styles.calendarHeader}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
          <Text key={day} style={[styles.calendarDay, { color: theme.colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {Array.from({ length: 35 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.calendarDate,
              i === 15 && { backgroundColor: '#06b6d4' },
              [12, 18, 25].includes(i) && { backgroundColor: '#06b6d4', opacity: 0.2 }
            ]}
          >
            <Text style={[
              styles.calendarDateText,
              { color: i % 7 === 5 || i % 7 === 6 ? theme.colors.textSecondary : theme.colors.text },
              i === 15 && { color: '#ffffff' }
            ]}>
              {i - 5 > 0 ? i - 5 : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'events': return <EventsWidget widget={widget} />;
      case 'stats': return <StatsWidget widget={widget} />;
      case 'map': return <MapWidget widget={widget} />;
      case 'notifications': return <NotificationsWidget widget={widget} />;
      case 'tribes': return <TribesWidget widget={widget} />;
      case 'shortcuts': return <ShortcutsWidget widget={widget} />;
      case 'trending': return <TrendingWidget widget={widget} />;
      case 'calendar': return <CalendarWidget widget={widget} />;
      default: return <Text style={[styles.errorText, { color: theme.colors.text }]}>Widget desconocido</Text>;
    }
  };

  const getWidgetSize = (size: string) => {
    switch (size) {
      case 'small': return { width: screenWidth * 0.4, height: 120 };
      case 'medium': return { width: screenWidth * 0.4, height: 200 };
      case 'large': return { width: screenWidth * 0.9, height: 250 };
      default: return { width: screenWidth * 0.4, height: 150 };
    }
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Mi Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Personaliza tu vista de EventConnect
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Button
              variant={isEditMode ? "secondary" : "ghost"}
              onPress={() => setIsEditMode(!isEditMode)}
              style={styles.editButton}
            >
              <MaterialIcons 
                name="settings" 
                size={20} 
                color={isEditMode ? theme.colors.primary : theme.colors.text} 
              />
              <Text style={[styles.editButtonText, { color: isEditMode ? theme.colors.primary : theme.colors.text }]}>
                {isEditMode ? 'Ver Dashboard' : 'Personalizar'}
              </Text>
            </Button>

            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  onPress={() => setShowWidgetSelector(true)}
                  style={styles.addButton}
                >
                  <MaterialIcons name="add" size={20} color={theme.colors.primary} />
                  <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                    Agregar Widget
                  </Text>
                </Button>

                <Button
                  variant="primary"
                  onPress={handleSaveLayout}
                  disabled={isLoading}
                  style={styles.saveButton}
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </Button>
              </>
            )}
          </View>
        </View>

        {/* Edit Mode Notice */}
        {isEditMode && (
          <View style={[styles.editNotice, { backgroundColor: theme.colors.primary, opacity: 0.1 }]}>
            <MaterialIcons name="flash-on" size={24} color={theme.colors.primary} />
            <View style={styles.editNoticeContent}>
              <Text style={[styles.editNoticeTitle, { color: theme.colors.primary }]}>
                Modo de Edición Activado
              </Text>
              <Text style={[styles.editNoticeSubtitle, { color: theme.colors.textSecondary }]}>
                Toca los widgets para eliminarlos o reorganizarlos
              </Text>
            </View>
          </View>
        )}

        {/* Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          {widgets.filter(w => w.visible).map((widget) => (
            <View
              key={widget.id}
              style={[
                styles.widgetContainer,
                getWidgetSize(widget.size)
              ]}
            >
              {isEditMode && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveWidget(widget.id)}
                >
                  <MaterialIcons name="close" size={16} color="#ffffff" />
                </TouchableOpacity>
              )}

              <Card style={styles.widgetCard}>
                <View style={styles.widgetHeader}>
                  <Text style={[styles.widgetTitle, { color: theme.colors.text }]}>
                    {widget.title}
                  </Text>
                </View>
                <View style={styles.widgetBody}>
                  {renderWidget(widget)}
                </View>
              </Card>
            </View>
          ))}
        </View>

        {/* Widget Selector Modal */}
        {showWidgetSelector && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Agregar Widget
                </Text>
                <TouchableOpacity
                  onPress={() => setShowWidgetSelector(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.widgetSelector} showsVerticalScrollIndicator={false}>
                <View style={styles.widgetGrid}>
                  {availableWidgets.map((widget) => (
                    <TouchableOpacity
                      key={widget.type}
                      style={[styles.widgetOption, { backgroundColor: theme.colors.card }]}
                      onPress={() => handleAddWidget(widget.type)}
                    >
                      <View style={[styles.widgetOptionIcon, { backgroundColor: widget.color }]}>
                        <MaterialIcons name={widget.icon as any} size={24} color="#ffffff" />
                      </View>
                      <View style={styles.widgetOptionContent}>
                        <Text style={[styles.widgetOptionTitle, { color: theme.colors.text }]}>
                          {widget.title}
                        </Text>
                        <Text style={[styles.widgetOptionDescription, { color: theme.colors.textSecondary }]}>
                          {widget.description}
                        </Text>
                        <View style={[styles.widgetOptionSize, { backgroundColor: theme.colors.primary, opacity: 0.1 }]}>
                          <Text style={[styles.widgetOptionSizeText, { color: theme.colors.primary }]}>
                            {widget.defaultSize}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    gap: 12,
  },
  editNoticeContent: {
    flex: 1,
  },
  editNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  editNoticeSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  dashboardGrid: {
    padding: 20,
    gap: 20,
  },
  widgetContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  widgetCard: {
    flex: 1,
    height: '100%',
  },
  widgetHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  widgetBody: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  widgetSelector: {
    flex: 1,
  },
  widgetGrid: {
    gap: 16,
  },
  widgetOption: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  widgetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetOptionContent: {
    flex: 1,
  },
  widgetOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  widgetOptionDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  widgetOptionSize: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  widgetOptionSizeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Widget Content Styles
  widgetContent: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  mapWidget: {
    height: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 12,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.8,
  },
  tribeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  tribeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tribeInfo: {
    flex: 1,
  },
  tribeTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  tribeSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shortcutLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  trendingSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  calendarWidget: {
    height: 200,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  calendarDay: {
    fontSize: 12,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  calendarDate: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  calendarDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
});

export default DashboardScreen;
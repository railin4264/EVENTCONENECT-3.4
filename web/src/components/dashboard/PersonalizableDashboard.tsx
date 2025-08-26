'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  PlusIcon,
  CogIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ChartBarIcon,
  HeartIcon,
  BellIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useTheme } from '@/contexts/ThemeContext';

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

// ===== PERSONALIZABLE DASHBOARD COMPONENT =====
export const PersonalizableDashboard: React.FC = () => {
  const { theme } = useTheme();
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
      id: 'event-map',
      type: 'map',
      title: 'Eventos Cerca',
      size: 'medium',
      position: { x: 0, y: 1 },
      settings: { radius: 25, showFilters: false },
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
      icon: CalendarIcon,
      color: 'from-cyan-500 to-blue-600',
      defaultSize: 'large'
    },
    {
      type: 'stats',
      title: 'Estadísticas',
      description: 'Métricas de tu actividad',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-600',
      defaultSize: 'medium'
    },
    {
      type: 'map',
      title: 'Mapa de Eventos',
      description: 'Eventos cercanos en mapa',
      icon: MapPinIcon,
      color: 'from-green-500 to-emerald-600',
      defaultSize: 'medium'
    },
    {
      type: 'notifications',
      title: 'Notificaciones',
      description: 'Alertas y mensajes',
      icon: BellIcon,
      color: 'from-orange-500 to-red-600',
      defaultSize: 'small'
    },
    {
      type: 'tribes',
      title: 'Mis Comunidades',
      description: 'Tribus a las que perteneces',
      icon: UserGroupIcon,
      color: 'from-indigo-500 to-purple-600',
      defaultSize: 'medium'
    },
    {
      type: 'shortcuts',
      title: 'Accesos Rápidos',
      description: 'Acciones frecuentes',
      icon: SparklesIcon,
      color: 'from-pink-500 to-rose-600',
      defaultSize: 'small'
    },
    {
      type: 'trending',
      title: 'Tendencias',
      description: 'Eventos populares',
      icon: ArrowTrendingUpIcon,
      color: 'from-yellow-500 to-orange-600',
      defaultSize: 'medium'
    },
    {
      type: 'calendar',
      title: 'Calendario',
      description: 'Vista de calendario compacta',
      icon: CalendarIcon,
      color: 'from-teal-500 to-cyan-600',
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
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const handleWidgetReorder = (newOrder: DashboardWidget[]) => {
    setWidgets(newOrder);
  };

  const handleSaveLayout = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsEditMode(false);
    setIsLoading(false);
  };

  const handleResetLayout = () => {
    // Reset to default layout
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
  };

  // ===== WIDGET COMPONENTS =====
  const EvensWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600"></div>
          <div className="flex-1">
            <h4 className="text-white font-medium">Evento de Ejemplo {i}</h4>
            <p className="text-gray-400 text-sm">Mañana a las 19:00</p>
          </div>
        </div>
      ))}
    </div>
  );

  const StatsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-cyan-400">12</div>
        <div className="text-sm text-gray-400">Eventos</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-purple-400">5</div>
        <div className="text-sm text-gray-400">Tribus</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-green-400">89%</div>
        <div className="text-sm text-gray-400">Asistencia</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-orange-400">4.8</div>
        <div className="text-sm text-gray-400">Rating</div>
      </div>
    </div>
  );

  const MapWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="h-48 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <MapPinIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
        <p className="text-gray-300">Mapa Interactivo</p>
        <p className="text-gray-400 text-sm">15 eventos cerca</p>
      </div>
    </div>
  );

  const NotificationsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          <div className="flex-1">
            <p className="text-white text-sm">Nueva notificación {i}</p>
            <p className="text-gray-400 text-xs">Hace 2 min</p>
          </div>
        </div>
      ))}
    </div>
  );

  const TribesWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="flex-1">
            <h4 className="text-white font-medium">Tribu {i}</h4>
            <p className="text-gray-400 text-sm">250 miembros</p>
          </div>
        </div>
      ))}
    </div>
  );

  const ShortcutsWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Crear Evento', icon: PlusIcon, color: 'cyan' },
        { label: 'Buscar', icon: SparklesIcon, color: 'purple' },
        { label: 'Mi Perfil', icon: UserGroupIcon, color: 'green' },
        { label: 'Configuración', icon: CogIcon, color: 'orange' }
      ].map((shortcut, i) => (
        <button
          key={i}
          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <shortcut.icon className={`w-6 h-6 text-${shortcut.color}-400 mx-auto mb-1`} />
          <p className="text-xs text-gray-300">{shortcut.label}</p>
        </button>
      ))}
    </div>
  );

  const TrendingWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-400" />
          <div className="flex-1">
            <h4 className="text-white font-medium">Evento Trending {i}</h4>
            <p className="text-gray-400 text-sm">+{i * 50}% popularidad</p>
          </div>
        </div>
      ))}
    </div>
  );

  const CalendarWidget = ({ widget }: { widget: DashboardWidget }) => (
    <div className="h-48 rounded-lg bg-white/5 border border-white/10 p-4">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
          <div key={day} className="p-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <div
            key={i}
            className={`
              aspect-square flex items-center justify-center text-xs rounded
              ${i % 7 === 5 || i % 7 === 6 ? 'text-gray-500' : 'text-gray-300'}
              ${i === 15 ? 'bg-cyan-500 text-white' : ''}
              ${[12, 18, 25].includes(i) ? 'bg-cyan-500/20 text-cyan-400' : ''}
            `}
          >
            {i - 5 > 0 ? i - 5 : ''}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'events': return <EvensWidget widget={widget} />;
      case 'stats': return <StatsWidget widget={widget} />;
      case 'map': return <MapWidget widget={widget} />;
      case 'notifications': return <NotificationsWidget widget={widget} />;
      case 'tribes': return <TribesWidget widget={widget} />;
      case 'shortcuts': return <ShortcutsWidget widget={widget} />;
      case 'trending': return <TrendingWidget widget={widget} />;
      case 'calendar': return <CalendarWidget widget={widget} />;
      default: return <div>Widget desconocido</div>;
    }
  };

  const getWidgetGridClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-1 md:col-span-2 row-span-2';
      case 'large': return 'col-span-1 md:col-span-3 row-span-2';
      default: return 'col-span-1';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Mi Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Personaliza tu vista de EventConnect
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={isEditMode ? "secondary" : "ghost"}
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center space-x-2"
          >
            <CogIcon className="w-5 h-5" />
            <span>{isEditMode ? 'Ver Dashboard' : 'Personalizar'}</span>
          </Button>

          {isEditMode && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowWidgetSelector(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Agregar Widget</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleSaveLayout}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="neon" />
                ) : (
                  'Guardar'
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Notice */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
          >
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-cyan-400 font-medium">Modo de Edición Activado</h3>
                <p className="text-gray-300 text-sm">
                  Arrastra los widgets para reordenarlos o elimínalos usando el botón X
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
        <AnimatePresence>
          {isEditMode ? (
            <Reorder.Group
              values={widgets}
              onReorder={handleWidgetReorder}
              className="contents"
            >
              {widgets.filter(w => w.visible).map((widget) => (
                <Reorder.Item
                  key={widget.id}
                  value={widget}
                  className={getWidgetGridClass(widget.size)}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>

                    <Card variant="glass" className="h-full cursor-move">
                      <CardHeader>
                        <CardTitle className="text-lg">{widget.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderWidget(widget)}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            widgets.filter(w => w.visible).map((widget) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={getWidgetGridClass(widget.size)}
              >
                <Card variant="glass" className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{widget.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderWidget(widget)}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Widget Selector Modal */}
      <AnimatePresence>
        {showWidgetSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWidgetSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Agregar Widget</h2>
                <button
                  onClick={() => setShowWidgetSelector(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets.map((widget) => (
                  <motion.button
                    key={widget.type}
                    onClick={() => handleAddWidget(widget.type)}
                    className="p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${widget.color} flex items-center justify-center`}>
                        <widget.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{widget.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{widget.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-white/10 text-gray-300">
                          {widget.defaultSize}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalizableDashboard;

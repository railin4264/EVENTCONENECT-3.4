'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Save, X, GripVertical, Maximize2, Minimize2 } from 'lucide-react';

// ==========================================
// COMPONENTES LAZY LOADED PARA PERFORMANCE
// ==========================================

// Lazy load de widgets para mejorar performance
const EventosWidget = lazy(() => import('./widgets/EventosWidget'));
const CalendarioWidget = lazy(() => import('./widgets/CalendarioWidget'));
const TribusWidget = lazy(() => import('./widgets/TribusWidget'));
const ActividadWidget = lazy(() => import('./widgets/ActividadWidget'));
const EstadisticasWidget = lazy(() => import('./widgets/EstadisticasWidget'));
const NotificacionesWidget = lazy(() => import('./widgets/NotificacionesWidget'));
const MapaWidget = lazy(() => import('./widgets/MapaWidget'));
const ChatWidget = lazy(() => import('./widgets/ChatWidget'));

// ==========================================
// TIPOS Y INTERFACES
// ==========================================

interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  settings: Record<string, any>;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// CONFIGURACIÓN DE WIDGETS
// ==========================================

const AVAILABLE_WIDGETS = [
  {
    type: 'eventos',
    title: 'Próximos Eventos',
    defaultSize: { width: 400, height: 300 },
    minSize: { width: 300, height: 200 },
    maxSize: { width: 600, height: 500 },
    icon: '🎉',
    description: 'Muestra tus próximos eventos y recordatorios',
    category: 'events'
  },
  {
    type: 'calendario',
    title: 'Calendario',
    defaultSize: { width: 350, height: 400 },
    minSize: { width: 300, height: 300 },
    maxSize: { width: 500, height: 600 },
    icon: '📅',
    description: 'Vista de calendario con eventos y fechas importantes',
    category: 'events'
  },
  {
    type: 'tribus',
    title: 'Mis Tribus',
    defaultSize: { width: 380, height: 280 },
    minSize: { width: 300, height: 200 },
    maxSize: { width: 550, height: 400 },
    icon: '👥',
    description: 'Gestiona y visualiza tus tribus y comunidades',
    category: 'social'
  },
  {
    type: 'actividad',
    title: 'Actividad Reciente',
    defaultSize: { width: 400, height: 250 },
    minSize: { width: 300, height: 200 },
    maxSize: { width: 600, height: 400 },
    icon: '📊',
    description: 'Actividad reciente y notificaciones del sistema',
    category: 'activity'
  },
  {
    type: 'estadisticas',
    title: 'Estadísticas',
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 250 },
    maxSize: { width: 500, height: 450 },
    icon: '📈',
    description: 'Estadísticas personales y métricas de uso',
    category: 'analytics'
  },
  {
    type: 'notificaciones',
    title: 'Notificaciones',
    defaultSize: { width: 320, height: 280 },
    minSize: { width: 250, height: 200 },
    maxSize: { width: 450, height: 400 },
    icon: '🔔',
    description: 'Centro de notificaciones y mensajes',
    category: 'communication'
  },
  {
    type: 'mapa',
    title: 'Mapa de Eventos',
    defaultSize: { width: 450, height: 350 },
    minSize: { width: 350, height: 250 },
    maxSize: { width: 700, height: 500 },
    icon: '🗺️',
    description: 'Mapa interactivo con eventos cercanos',
    category: 'location'
  },
  {
    type: 'chat',
    title: 'Chat Rápido',
    defaultSize: { width: 300, height: 400 },
    minSize: { width: 250, height: 300 },
    maxSize: { width: 450, height: 600 },
    icon: '💬',
    description: 'Chat rápido con contactos y tribus',
    category: 'communication'
  }
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const PersonalizableDashboard: React.FC = () => {
  // ==========================================
  // ESTADOS CON OPTIMIZACIÓN
  // ==========================================
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<string>('default');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // ==========================================
  // MEMOIZACIÓN PARA PERFORMANCE
  // ==========================================

  // Memoizar widgets por categoría para evitar re-renders
  const widgetsByCategory = useMemo(() => {
    return AVAILABLE_WIDGETS.reduce((acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    }, {} as Record<string, typeof AVAILABLE_WIDGETS>);
  }, []);

  // Memoizar widgets activos para evitar re-renders innecesarios
  const activeWidgets = useMemo(() => {
    return widgets.filter(widget => !widget.isMinimized);
  }, [widgets]);

  // ==========================================
  // EFECTOS CON OPTIMIZACIÓN
  // ==========================================

  // Cargar layout guardado al montar el componente
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) {
      try {
        const parsed = JSON.parse(savedLayouts);
        setLayouts(parsed);
        
        // Cargar layout por defecto
        const defaultLayout = parsed.find((l: DashboardLayout) => l.id === 'default');
        if (defaultLayout) {
          setWidgets(defaultLayout.widgets);
        }
      } catch (error) {
        console.error('Error cargando layouts:', error);
        // Crear layout por defecto si hay error
        createDefaultLayout();
      }
    } else {
      createDefaultLayout();
    }
  }, []);

  // Guardar layouts automáticamente cuando cambien
  useEffect(() => {
    if (layouts.length > 0) {
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    }
  }, [layouts]);

  // ==========================================
  // FUNCIONES OPTIMIZADAS CON USECALLBACK
  // ==========================================

  // Crear layout por defecto
  const createDefaultLayout = useCallback(() => {
    const defaultWidgets: Widget[] = [
      {
        id: 'eventos-default',
        type: 'eventos',
        title: 'Próximos Eventos',
        position: { x: 20, y: 20 },
        size: { width: 400, height: 300 },
        isMinimized: false,
        isMaximized: false,
        settings: {}
      },
      {
        id: 'calendario-default',
        type: 'calendario',
        title: 'Calendario',
        position: { x: 440, y: 20 },
        size: { width: 350, height: 400 },
        isMinimized: false,
        isMaximized: false,
        settings: {}
      }
    ];

    const defaultLayout: DashboardLayout = {
      id: 'default',
      name: 'Layout por Defecto',
      widgets: defaultWidgets,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLayouts([defaultLayout]);
    setWidgets(defaultWidgets);
  }, []);

  // Agregar widget
  const addWidget = useCallback((widgetType: string) => {
    const widgetConfig = AVAILABLE_WIDGETS.find(w => w.type === widgetType);
    if (!widgetConfig) return;

    const newWidget: Widget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetConfig.title,
      position: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
      size: { ...widgetConfig.defaultSize },
      isMinimized: false,
      isMaximized: false,
      settings: {}
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetSelector(false);
    
    // Actualizar layout actual
    updateCurrentLayout([...widgets, newWidget]);
  }, [widgets]);

  // Remover widget
  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setSelectedWidget(null);
    
    // Actualizar layout actual
    updateCurrentLayout(widgets.filter(w => w.id !== widgetId));
  }, [widgets]);

  // Actualizar layout actual
  const updateCurrentLayout = useCallback((newWidgets: Widget[]) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayout 
        ? { ...layout, widgets: newWidgets, updatedAt: new Date() }
        : layout
    ));
  }, [currentLayout]);

  // Guardar layout
  const saveLayout = useCallback((name: string) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      name,
      widgets: [...widgets],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLayouts(prev => [...prev, newLayout]);
    setCurrentLayout(newLayout.id);
  }, [widgets]);

  // Cargar layout
  const loadLayout = useCallback((layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (layout) {
      setWidgets(layout.widgets);
      setCurrentLayout(layoutId);
    }
  }, [layouts]);

  // ==========================================
  // MANEJO DE DRAG & DROP OPTIMIZADO
  // ==========================================

  // Iniciar drag
  const handleDragStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (!isEditMode) return;
    
    setIsDragging(true);
    setSelectedWidget(widgetId);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  }, [isEditMode]);

  // Manejar drag
  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedWidget) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setWidgets(prev => prev.map(widget =>
      widget.id === selectedWidget
        ? {
            ...widget,
            position: {
              x: Math.max(0, widget.position.x + deltaX),
              y: Math.max(0, widget.position.y + deltaY)
            }
          }
        : widget
    ));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, selectedWidget, dragStart]);

  // Finalizar drag
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setSelectedWidget(null);
      updateCurrentLayout(widgets);
    }
  }, [isDragging, widgets, updateCurrentLayout]);

  // ==========================================
  // MANEJO DE RESIZE OPTIMIZADO
  // ==========================================

  // Iniciar resize
  const handleResizeStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (!isEditMode) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setIsResizing(true);
    setSelectedWidget(widgetId);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: widget.size.width,
      height: widget.size.height
    });
  }, [isEditMode, widgets]);

  // Manejar resize
  const handleResize = useCallback((e: React.MouseEvent) => {
    if (!isResizing || !selectedWidget) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    setWidgets(prev => prev.map(widget =>
      widget.id === selectedWidget
        ? {
            ...widget,
            size: {
              width: Math.max(200, resizeStart.width + deltaX),
              height: Math.max(150, resizeStart.height + deltaY)
            }
          }
        : widget
    ));
  }, [isResizing, selectedWidget, resizeStart]);

  // Finalizar resize
  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setSelectedWidget(null);
      updateCurrentLayout(widgets);
    }
  }, [isResizing, widgets, updateCurrentLayout]);

  // ==========================================
  // FUNCIONES DE WIDGET
  // ==========================================

  // Minimizar widget
  const toggleMinimize = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId
        ? { ...widget, isMinimized: !widget.isMinimized }
        : widget
    ));
  }, []);

  // Maximizar widget
  const toggleMaximize = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId
        ? { ...widget, isMaximized: !widget.isMaximized }
        : widget
    ));
  }, []);

  // ==========================================
  // RENDERIZADO DE WIDGETS CON SUSPENSE
  // ==========================================

  const renderWidget = useCallback((widget: Widget) => {
    const widgetConfig = AVAILABLE_WIDGETS.find(w => w.type === widget.type);
    if (!widgetConfig) return null;

    const widgetProps = {
      key: widget.id,
      widget,
      onRemove: () => removeWidget(widget.id),
      onMinimize: () => toggleMinimize(widget.id),
      onMaximize: () => toggleMaximize(widget.id),
      onSettingsChange: (settings: Record<string, any>) => {
        setWidgets(prev => prev.map(w =>
          w.id === widget.id ? { ...w, settings } : w
        ));
      }
    };

    // Renderizar widget con Suspense para lazy loading
    return (
      <Suspense key={widget.id} fallback={
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        {widget.type === 'eventos' && <EventosWidget {...widgetProps} />}
        {widget.type === 'calendario' && <CalendarioWidget {...widgetProps} />}
        {widget.type === 'tribus' && <TribusWidget {...widgetProps} />}
        {widget.type === 'actividad' && <ActividadWidget {...widgetProps} />}
        {widget.type === 'estadisticas' && <EstadisticasWidget {...widgetProps} />}
        {widget.type === 'notificaciones' && <NotificacionesWidget {...widgetProps} />}
        {widget.type === 'mapa' && <MapaWidget {...widgetProps} />}
        {widget.type === 'chat' && <ChatWidget {...widgetProps} />}
      </Suspense>
    );
  }, [removeWidget, toggleMinimize, toggleMaximize]);

  // ==========================================
  // RENDERIZADO DEL COMPONENTE
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header del Dashboard */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Personalizable
            </h1>
            <p className="text-gray-600">
              Organiza y personaliza tu espacio de trabajo
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Selector de Layout */}
            <select
              value={currentLayout}
              onChange={(e) => loadLayout(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>

            {/* Botón de Edición */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 inline mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 inline mr-2" />
                  Editar
                </>
              )}
            </button>

            {/* Botón de Agregar Widget */}
            <button
              onClick={() => setShowWidgetSelector(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Agregar Widget
            </button>
          </div>
        </div>
      </div>

      {/* Área de Widgets */}
      <div 
        className="relative min-h-[600px] bg-white/50 rounded-xl p-6 backdrop-blur-sm border border-white/20"
        onMouseMove={isDragging ? handleDrag : isResizing ? handleResize : undefined}
        onMouseUp={isDragging ? handleDragEnd : isResizing ? handleResizeEnd : undefined}
        onMouseLeave={isDragging ? handleDragEnd : isResizing ? handleResizeEnd : undefined}
      >
        <AnimatePresence>
          {activeWidgets.map(widget => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`absolute ${widget.isMaximized ? 'z-50' : 'z-10'}`}
              style={{
                left: widget.position.x,
                top: widget.position.y,
                width: widget.isMaximized ? 'calc(100% - 48px)' : widget.size.width,
                height: widget.isMaximized ? 'calc(100% - 48px)' : widget.size.height,
              }}
            >
              {/* Header del Widget */}
              <div 
                className={`bg-white rounded-t-lg border-b border-gray-200 p-3 flex items-center justify-between ${
                  isEditMode ? 'cursor-move' : ''
                }`}
                onMouseDown={isEditMode ? (e) => handleDragStart(e, widget.id) : undefined}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{widgetConfig?.icon}</span>
                  <h3 className="font-medium text-gray-900">{widget.title}</h3>
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* Botón Minimizar */}
                  <button
                    onClick={() => toggleMinimize(widget.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                    title="Minimizar"
                  >
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {/* Botón Maximizar */}
                  <button
                    onClick={() => toggleMaximize(widget.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                    title="Maximizar"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {/* Botón Cerrar (solo en modo edición) */}
                  {isEditMode && (
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors duration-150"
                      title="Eliminar Widget"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contenido del Widget */}
              <div className="bg-white rounded-b-lg h-full overflow-hidden">
                {renderWidget(widget)}
              </div>

              {/* Handle de Resize (solo en modo edición) */}
              {isEditMode && !widget.isMaximized && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 rounded-tl"
                  onMouseDown={(e) => handleResizeStart(e, widget.id)}
                  title="Redimensionar"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mensaje cuando no hay widgets */}
        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium mb-2">No hay widgets configurados</h3>
            <p className="text-gray-400 text-center max-w-md">
              Comienza agregando widgets para personalizar tu dashboard
            </p>
            <button
              onClick={() => setShowWidgetSelector(true)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Agregar Primer Widget
            </button>
          </div>
        )}
      </div>

      {/* Selector de Widgets Modal */}
      {showWidgetSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Agregar Widget</h2>
              <button
                onClick={() => setShowWidgetSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-gray-700 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {categoryWidgets.map(widget => (
                      <button
                        key={widget.type}
                        onClick={() => addWidget(widget.type)}
                        className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{widget.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                              {widget.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {widget.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PersonalizableDashboard;

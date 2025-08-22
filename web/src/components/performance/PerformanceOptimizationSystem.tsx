import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Gauge,
  Download,
  Upload,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Code,
  Package,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  FolderOpen,
  Database,
  Server,
  Cloud,
  Globe,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

// ===== PERFORMANCE TYPES =====
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte

  // Performance Metrics
  fcp: number; // First Contentful Paint
  si: number; // Speed Index
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time

  // Resource Metrics
  totalSize: number;
  imageSize: number;
  scriptSize: number;
  cssSize: number;
  fontSize: number;

  // Network Metrics
  requests: number;
  cacheHitRate: number;
  compressionRatio: number;

  // User Experience
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface OptimizationFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'loading' | 'images' | 'code' | 'network' | 'pwa';
  enabled: boolean;
  impact: 'high' | 'medium' | 'low';
  savings: string;
  settings?: any;
}

// ===== PERFORMANCE DATA =====
const performanceMetrics: PerformanceMetrics = {
  // Core Web Vitals
  lcp: 2.1,
  fid: 45,
  cls: 0.08,
  ttfb: 180,

  // Performance Metrics
  fcp: 1.2,
  si: 1.8,
  tti: 2.5,
  tbt: 120,

  // Resource Metrics
  totalSize: 2.8,
  imageSize: 1.2,
  scriptSize: 0.8,
  cssSize: 0.3,
  fontSize: 0.5,

  // Network Metrics
  requests: 45,
  cacheHitRate: 78,
  compressionRatio: 65,

  // User Experience
  score: 87,
  grade: 'B',
};

const optimizationFeatures: OptimizationFeature[] = [
  // Loading Optimizations
  {
    id: 'lazy-loading',
    name: 'Lazy Loading',
    description: 'Carga imágenes y componentes solo cuando son necesarios',
    icon: <Eye className='w-5 h-5' />,
    category: 'loading',
    enabled: true,
    impact: 'high',
    savings: '30-50%',
  },
  {
    id: 'infinite-scroll',
    name: 'Infinite Scroll',
    description: 'Carga contenido incrementalmente al hacer scroll',
    icon: <Download className='w-5 h-5' />,
    category: 'loading',
    enabled: false,
    impact: 'medium',
    savings: '20-40%',
  },
  {
    id: 'virtual-scroll',
    name: 'Virtual Scrolling',
    description: 'Renderiza solo los elementos visibles en listas largas',
    icon: <Layers className='w-5 h-5' />,
    category: 'loading',
    enabled: false,
    impact: 'high',
    savings: '60-80%',
  },

  // Image Optimizations
  {
    id: 'image-compression',
    name: 'Compresión de Imágenes',
    description: 'Optimiza imágenes automáticamente sin pérdida de calidad',
    icon: <Image className='w-5 h-5' />,
    category: 'images',
    enabled: true,
    impact: 'high',
    savings: '40-70%',
  },
  {
    id: 'webp-conversion',
    name: 'Conversión WebP',
    description: 'Convierte imágenes a formatos modernos más eficientes',
    icon: <Image className='w-5 h-5' />,
    category: 'images',
    enabled: true,
    impact: 'medium',
    savings: '25-35%',
  },
  {
    id: 'responsive-images',
    name: 'Imágenes Responsivas',
    description: 'Sirve imágenes del tamaño apropiado para cada dispositivo',
    icon: <Smartphone className='w-5 h-5' />,
    category: 'images',
    enabled: false,
    impact: 'medium',
    savings: '20-40%',
  },

  // Code Optimizations
  {
    id: 'code-splitting',
    name: 'Code Splitting',
    description: 'Divide el código en chunks más pequeños y manejables',
    icon: <Code className='w-5 h-5' />,
    category: 'code',
    enabled: true,
    impact: 'high',
    savings: '30-50%',
  },
  {
    id: 'tree-shaking',
    name: 'Tree Shaking',
    description: 'Elimina código no utilizado del bundle final',
    icon: <Package className='w-5 h-5' />,
    category: 'code',
    enabled: true,
    impact: 'medium',
    savings: '15-30%',
  },
  {
    id: 'minification',
    name: 'Minificación',
    description:
      'Reduce el tamaño del código eliminando espacios y comentarios',
    icon: <FileText className='w-5 h-5' />,
    category: 'code',
    enabled: true,
    impact: 'medium',
    savings: '20-40%',
  },

  // Network Optimizations
  {
    id: 'http2',
    name: 'HTTP/2',
    description: 'Utiliza el protocolo HTTP/2 para mejor rendimiento',
    icon: <Network className='w-5 h-5' />,
    category: 'network',
    enabled: true,
    impact: 'high',
    savings: '25-40%',
  },
  {
    id: 'gzip-compression',
    name: 'Compresión Gzip',
    description: 'Comprime archivos antes de enviarlos al cliente',
    icon: <Archive className='w-5 h-5' />,
    category: 'network',
    enabled: true,
    impact: 'high',
    savings: '60-80%',
  },
  {
    id: 'cdn',
    name: 'CDN',
    description: 'Distribuye contenido desde servidores cercanos al usuario',
    icon: <Globe className='w-5 h-5' />,
    category: 'network',
    enabled: false,
    impact: 'high',
    savings: '30-60%',
  },

  // PWA Optimizations
  {
    id: 'service-worker',
    name: 'Service Worker',
    description: 'Cachea recursos para funcionamiento offline',
    icon: <Server className='w-5 h-5' />,
    category: 'pwa',
    enabled: true,
    impact: 'high',
    savings: '40-70%',
  },
  {
    id: 'app-shell',
    name: 'App Shell',
    description: 'Proporciona una estructura básica para carga instantánea',
    icon: <Smartphone className='w-5 h-5' />,
    category: 'pwa',
    enabled: false,
    impact: 'medium',
    savings: '20-40%',
  },
  {
    id: 'precaching',
    name: 'Precaching',
    description: 'Cachea recursos críticos de forma proactiva',
    icon: <HardDrive className='w-5 h-5' />,
    category: 'pwa',
    enabled: false,
    impact: 'medium',
    savings: '25-45%',
  },
];

// ===== PERFORMANCE METRICS CARD COMPONENT =====
const PerformanceMetricsCard: React.FC<{
  metrics: PerformanceMetrics;
  className?: string;
}> = ({ metrics, className }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-400';
      case 'B':
        return 'text-blue-400';
      case 'C':
        return 'text-yellow-400';
      case 'D':
        return 'text-orange-400';
      case 'F':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getMetricStatus = (
    value: number,
    threshold: number,
    lowerIsBetter: boolean = true
  ) => {
    if (lowerIsBetter) {
      return value <= threshold
        ? 'good'
        : value <= threshold * 1.5
          ? 'warning'
          : 'poor';
    } else {
      return value >= threshold
        ? 'good'
        : value >= threshold * 0.7
          ? 'warning'
          : 'poor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Gauge className='w-5 h-5 text-cyan-400' />
          <span>Métricas de Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Overall Score */}
        <div className='text-center p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-400/20'>
          <div className='text-4xl font-bold text-white mb-2'>
            {metrics.score}/100
          </div>
          <div
            className={cn(
              'text-2xl font-bold mb-2',
              getGradeColor(metrics.grade)
            )}
          >
            {metrics.grade}
          </div>
          <div className='text-gray-300'>Puntuación General de Performance</div>
        </div>

        {/* Core Web Vitals */}
        <div>
          <h4 className='text-lg font-semibold text-white mb-3'>
            Core Web Vitals
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-300'>LCP</span>
                <span
                  className={cn(
                    'font-medium',
                    getStatusColor(getMetricStatus(metrics.lcp, 2.5))
                  )}
                >
                  {metrics.lcp}s
                </span>
              </div>
              <Progress value={(metrics.lcp / 4) * 100} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-300'>FID</span>
                <span
                  className={cn(
                    'font-medium',
                    getStatusColor(getMetricStatus(metrics.fid, 100))
                  )}
                >
                  {metrics.fid}ms
                </span>
              </div>
              <Progress value={(metrics.fid / 300) * 100} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-300'>CLS</span>
                <span
                  className={cn(
                    'font-medium',
                    getStatusColor(getMetricStatus(metrics.cls, 0.1))
                  )}
                >
                  {metrics.cls}
                </span>
              </div>
              <Progress value={(metrics.cls / 0.25) * 100} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-300'>TTFB</span>
                <span
                  className={cn(
                    'font-medium',
                    getStatusColor(getMetricStatus(metrics.ttfb, 200))
                  )}
                >
                  {metrics.ttfb}ms
                </span>
              </div>
              <Progress value={(metrics.ttfb / 600) * 100} className='h-2' />
            </div>
          </div>
        </div>

        {/* Resource Breakdown */}
        <div>
          <h4 className='text-lg font-semibold text-white mb-3'>
            Desglose de Recursos
          </h4>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-300'>Total</span>
              <span className='text-white font-medium'>
                {metrics.totalSize}MB
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-300'>Imágenes</span>
              <span className='text-white font-medium'>
                {metrics.imageSize}MB
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-300'>Scripts</span>
              <span className='text-white font-medium'>
                {metrics.scriptSize}MB
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-300'>CSS</span>
              <span className='text-white font-medium'>
                {metrics.cssSize}MB
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-300'>Fuentes</span>
              <span className='text-white font-medium'>
                {metrics.fontSize}MB
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== OPTIMIZATION FEATURE CARD COMPONENT =====
const OptimizationFeatureCard: React.FC<{
  feature: OptimizationFeature;
  onToggle: (featureId: string, enabled: boolean) => void;
  onSettingsChange?: (featureId: string, settings: any) => void;
  className?: string;
}> = ({ feature, onToggle, onSettingsChange, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getImpactColor = () => {
    switch (feature.impact) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getImpactBg = () => {
    switch (feature.impact) {
      case 'high':
        return 'bg-red-400/10 border-red-400/20';
      case 'medium':
        return 'bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'bg-green-400/10 border-green-400/20';
      default:
        return 'bg-gray-400/10 border-gray-400/20';
    }
  };

  const getCategoryIcon = () => {
    switch (feature.category) {
      case 'loading':
        return <Download className='w-4 h-4 text-cyan-400' />;
      case 'images':
        return <Image className='w-4 h-4 text-purple-400' />;
      case 'code':
        return <Code className='w-4 h-4 text-green-400' />;
      case 'network':
        return <Network className='w-4 h-4 text-orange-400' />;
      case 'pwa':
        return <Smartphone className='w-4 h-4 text-blue-400' />;
      default:
        return <Settings className='w-4 h-4 text-gray-400' />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card variant='glass' className={cn('w-full', getImpactBg())}>
        <CardContent className='p-4'>
          <div className='flex items-start space-x-3'>
            {/* Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                getImpactBg()
              )}
            >
              <div className='text-white'>{feature.icon}</div>
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-medium text-white'>{feature.name}</h4>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={feature.enabled}
                    onChange={e => onToggle(feature.id, e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                </label>
              </div>

              <p className='text-sm text-gray-300 mb-3'>
                {feature.description}
              </p>

              {/* Impact and Savings */}
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      getImpactBg(),
                      getImpactColor()
                    )}
                  >
                    Impacto: {feature.impact.toUpperCase()}
                  </span>
                  <span className='text-xs text-cyan-400 bg-cyan-400/20 px-2 py-1 rounded-full'>
                    Ahorro: {feature.savings}
                  </span>
                </div>

                {/* Settings Button */}
                {feature.settings && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className='text-cyan-400 hover:text-cyan-300 text-sm font-medium'
                  >
                    {isExpanded ? 'Ocultar' : 'Configurar'}
                  </button>
                )}
              </div>

              {/* Category */}
              <div className='flex items-center space-x-2'>
                {getCategoryIcon()}
                <span className='text-xs text-gray-400 capitalize'>
                  {feature.category}
                </span>
              </div>

              {/* Settings Panel */}
              {isExpanded && feature.settings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mt-3 pt-3 border-t border-white/10'
                >
                  <div className='space-y-2'>
                    <label className='text-sm text-gray-300'>
                      Configuración:
                    </label>
                    <div className='p-2 bg-white/5 rounded text-xs text-gray-300'>
                      Configuraciones específicas para{' '}
                      {feature.name.toLowerCase()}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== BUNDLE ANALYZER COMPONENT =====
const BundleAnalyzer: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const bundleData = {
    totalSize: '2.8 MB',
    chunks: [
      { name: 'main', size: '1.2 MB', percentage: 43 },
      { name: 'vendor', size: '0.8 MB', percentage: 29 },
      { name: 'events', size: '0.4 MB', percentage: 14 },
      { name: 'profile', size: '0.2 MB', percentage: 7 },
      { name: 'shared', size: '0.2 MB', percentage: 7 },
    ],
    modules: [
      { name: 'react', size: '0.3 MB', percentage: 11 },
      { name: 'framer-motion', size: '0.2 MB', percentage: 7 },
      { name: 'tailwindcss', size: '0.1 MB', percentage: 4 },
      { name: 'lucide-react', size: '0.1 MB', percentage: 4 },
      { name: 'other', size: '2.1 MB', percentage: 74 },
    ],
  };

  const analyzeBundle = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResults(bundleData);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Package className='w-5 h-5 text-green-400' />
          <span>Analizador de Bundle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Analysis Button */}
        <Button
          onClick={analyzeBundle}
          disabled={isAnalyzing}
          variant='neon'
          className='w-full'
        >
          {isAnalyzing ? (
            <div className='flex items-center space-x-2'>
              <RefreshCw className='w-4 h-4 animate-spin' />
              <span>Analizando...</span>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <BarChart3 className='w-4 h-4' />
              <span>Analizar Bundle</span>
            </div>
          )}
        </Button>

        {/* Results */}
        {analysisResults && (
          <div className='space-y-4'>
            {/* Total Size */}
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-2xl font-bold text-cyan-400 mb-1'>
                {bundleData.totalSize}
              </div>
              <div className='text-sm text-gray-300'>
                Tamaño Total del Bundle
              </div>
            </div>

            {/* Chunks Breakdown */}
            <div>
              <h5 className='text-white font-medium mb-2'>
                Desglose por Chunks:
              </h5>
              <div className='space-y-2'>
                {bundleData.chunks.map((chunk, index) => (
                  <div key={index} className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-300'>{chunk.name}</span>
                      <span className='text-white'>{chunk.size}</span>
                    </div>
                    <Progress value={chunk.percentage} className='h-1' />
                  </div>
                ))}
              </div>
            </div>

            {/* Modules Breakdown */}
            <div>
              <h5 className='text-white font-medium mb-2'>
                Desglose por Módulos:
              </h5>
              <div className='space-y-2'>
                {bundleData.modules.map((module, index) => (
                  <div key={index} className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-300'>{module.name}</span>
                      <span className='text-white'>{module.size}</span>
                    </div>
                    <Progress value={module.percentage} className='h-1' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===== NETWORK MONITOR COMPONENT =====
const NetworkMonitor: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    requests: 0,
    bytesReceived: 0,
    averageResponseTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      interval = setInterval(() => {
        setNetworkStats(prev => ({
          requests: prev.requests + Math.floor(Math.random() * 5),
          bytesReceived: prev.bytesReceived + Math.floor(Math.random() * 1000),
          averageResponseTime: Math.random() * 200 + 50,
          cacheHits: prev.cacheHits + Math.floor(Math.random() * 3),
          cacheMisses: prev.cacheMisses + Math.floor(Math.random() * 2),
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Network className='w-5 h-5 text-orange-400' />
          <span>Monitor de Red</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Monitor Controls */}
        <div className='flex space-x-2'>
          <Button
            onClick={() => setIsMonitoring(true)}
            disabled={isMonitoring}
            variant='neon'
            size='sm'
          >
            <Play className='w-4 h-4' />
          </Button>
          <Button
            onClick={() => setIsMonitoring(false)}
            disabled={!isMonitoring}
            variant='ghost'
            size='sm'
          >
            <Pause className='w-4 h-4' />
          </Button>
          <Button
            onClick={() =>
              setNetworkStats({
                requests: 0,
                bytesReceived: 0,
                averageResponseTime: 0,
                cacheHits: 0,
                cacheMisses: 0,
              })
            }
            variant='ghost'
            size='sm'
          >
            <RotateCcw className='w-4 h-4' />
          </Button>
        </div>

        {/* Network Stats */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center p-3 bg-white/5 rounded-lg'>
            <div className='text-xl font-bold text-cyan-400 mb-1'>
              {networkStats.requests}
            </div>
            <div className='text-xs text-gray-300'>Peticiones</div>
          </div>
          <div className='text-center p-3 bg-white/5 rounded-lg'>
            <div className='text-xl font-bold text-purple-400 mb-1'>
              {(networkStats.bytesReceived / 1024).toFixed(1)}KB
            </div>
            <div className='text-xs text-gray-300'>Bytes Recibidos</div>
          </div>
          <div className='text-center p-3 bg-white/5 rounded-lg'>
            <div className='text-xl font-bold text-green-400 mb-1'>
              {networkStats.averageResponseTime.toFixed(0)}ms
            </div>
            <div className='text-xs text-gray-300'>Tiempo Respuesta</div>
          </div>
          <div className='text-center p-3 bg-white/5 rounded-lg'>
            <div className='text-xl font-bold text-yellow-400 mb-1'>
              {networkStats.cacheHits}
            </div>
            <div className='text-xs text-gray-300'>Cache Hits</div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className='p-3 bg-white/5 rounded-lg'>
          <div className='text-sm text-gray-300 mb-2'>
            Rendimiento del Cache:
          </div>
          <div className='w-full bg-white/10 rounded-full h-2'>
            <motion.div
              className='h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full'
              initial={{ width: 0 }}
              animate={{
                width: `${(networkStats.cacheHits / (networkStats.cacheHits + networkStats.cacheMisses)) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            {(
              (networkStats.cacheHits /
                (networkStats.cacheHits + networkStats.cacheMisses)) *
              100
            ).toFixed(1)}
            % hit rate
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== MAIN PERFORMANCE OPTIMIZATION SYSTEM COMPONENT =====
export const PerformanceOptimizationSystem: React.FC = () => {
  const [features, setFeatures] = useState(optimizationFeatures);

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    setFeatures(prev =>
      prev.map(f => (f.id === featureId ? { ...f, enabled } : f))
    );
  };

  const handleSettingsChange = (featureId: string, newSettings: any) => {
    setFeatures(prev =>
      prev.map(f =>
        f.id === featureId
          ? { ...f, settings: { ...f.settings, ...newSettings } }
          : f
      )
    );
  };

  const getCategoryFeatures = (category: string) => {
    return features.filter(f => f.category === category);
  };

  const getOptimizationScore = () => {
    const enabledFeatures = features.filter(f => f.enabled);
    const totalImpact = enabledFeatures.reduce((score, feature) => {
      switch (feature.impact) {
        case 'high':
          return score + 3;
        case 'medium':
          return score + 2;
        case 'low':
          return score + 1;
        default:
          return score;
      }
    }, 0);

    return Math.min(
      100,
      Math.round((totalImpact / (features.length * 3)) * 100)
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold text-white mb-2'>
            Sistema de Optimización de Performance
          </h1>
          <p className='text-gray-300'>
            Optimiza el rendimiento de EventConnect para la mejor experiencia
            del usuario
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Performance Metrics & Features */}
          <div className='space-y-8'>
            {/* Performance Metrics */}
            <PerformanceMetricsCard metrics={performanceMetrics} />

            {/* Optimization Features by Category */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-4 flex items-center space-x-2'>
                <Zap className='w-6 h-6 text-cyan-400' />
                <span>Características de Optimización</span>
              </h2>

              {/* Loading Optimizations */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Optimizaciones de Carga
                </h3>
                <div className='space-y-3'>
                  {getCategoryFeatures('loading').map(feature => (
                    <OptimizationFeatureCard
                      key={feature.id}
                      feature={feature}
                      onToggle={handleFeatureToggle}
                      onSettingsChange={handleSettingsChange}
                    />
                  ))}
                </div>
              </div>

              {/* Image Optimizations */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Optimizaciones de Imágenes
                </h3>
                <div className='space-y-3'>
                  {getCategoryFeatures('images').map(feature => (
                    <OptimizationFeatureCard
                      key={feature.id}
                      feature={feature}
                      onToggle={handleFeatureToggle}
                      onSettingsChange={handleSettingsChange}
                    />
                  ))}
                </div>
              </div>

              {/* Code Optimizations */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  Optimizaciones de Código
                </h3>
                <div className='space-y-3'>
                  {getCategoryFeatures('code').map(feature => (
                    <OptimizationFeatureCard
                      key={feature.id}
                      feature={feature}
                      onToggle={handleFeatureToggle}
                      onSettingsChange={handleSettingsChange}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tools and Network */}
          <div className='space-y-6'>
            {/* Network Optimizations */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-3'>
                Optimizaciones de Red
              </h3>
              <div className='space-y-3'>
                {getCategoryFeatures('network').map(feature => (
                  <OptimizationFeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onSettingsChange={handleSettingsChange}
                  />
                ))}
              </div>
            </div>

            {/* PWA Optimizations */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-3'>
                Optimizaciones PWA
              </h3>
              <div className='space-y-3'>
                {getCategoryFeatures('pwa').map(feature => (
                  <OptimizationFeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onSettingsChange={handleSettingsChange}
                  />
                ))}
              </div>
            </div>

            {/* Tools */}
            <BundleAnalyzer />
            <NetworkMonitor />
          </div>
        </div>

        {/* Optimization Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='mt-12'
        >
          <Card variant='glass' className='w-full'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <TrendingUp className='w-5 h-5 text-green-400' />
                <span>Puntuación de Optimización</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center'>
                <div className='text-6xl font-bold text-cyan-400 mb-4'>
                  {getOptimizationScore()}/100
                </div>
                <div className='w-full bg-white/10 rounded-full h-4 mb-4'>
                  <motion.div
                    className='h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full'
                    initial={{ width: 0 }}
                    animate={{ width: `${getOptimizationScore()}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className='text-gray-300'>
                  {features.filter(f => f.enabled).length} de {features.length}{' '}
                  optimizaciones activas
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PerformanceOptimizationSystem;

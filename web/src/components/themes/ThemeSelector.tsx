'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  PaintBrushIcon,
  SwatchIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';

// ===== THEME SELECTOR COMPONENT =====
export const ThemeSelector: React.FC<{
  className?: string;
  showPresets?: boolean;
  compact?: boolean;
}> = ({ className, showPresets = true, compact = false }) => {
  const {
    theme,
    presetThemes,
    isLoading,
    updateTheme,
    applyPresetTheme,
    toggleThemeMode,
    getCurrentMode
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'mode' | 'colors' | 'effects' | 'presets'>('mode');

  // ===== MODE SELECTOR =====
  const ModeSelector = () => {
    const modes = [
      { value: 'light', label: 'Claro', icon: SunIcon },
      { value: 'dark', label: 'Oscuro', icon: MoonIcon },
      { value: 'auto', label: 'Auto', icon: ComputerDesktopIcon }
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Modo de Tema</h3>
        <div className="grid grid-cols-3 gap-3">
          {modes.map(({ value, label, icon: Icon }) => (
            <motion.button
              key={value}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${theme.mode === value 
                  ? 'border-cyan-400 bg-cyan-500/10' 
                  : 'border-white/20 bg-white/5 hover:border-white/40'
                }
              `}
              onClick={() => updateTheme({ mode: value as any })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-sm text-white">{label}</p>
              {theme.mode === value && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-cyan-400/20"
                  layoutId="activeMode"
                  initial={false}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
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
      <div className="space-y-6">
        {/* Primary Color */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Color Primario</h3>
          <div className="grid grid-cols-4 gap-3">
            {colors.map(({ value, color, name }) => (
              <motion.button
                key={`primary-${value}`}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-300
                  ${theme.primaryColor === value 
                    ? 'border-white scale-110' 
                    : 'border-white/20 hover:border-white/40'
                  }
                `}
                style={{ backgroundColor: color }}
                onClick={() => updateTheme({ primaryColor: value as any })}
                whileHover={{ scale: theme.primaryColor === value ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs text-white font-medium">{name}</span>
                {theme.primaryColor === value && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-white"
                    layoutId="activePrimary"
                    initial={false}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Color de Acento</h3>
          <div className="grid grid-cols-4 gap-3">
            {colors.map(({ value, color, name }) => (
              <motion.button
                key={`accent-${value}`}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-300
                  ${theme.accentColor === value 
                    ? 'border-white scale-110' 
                    : 'border-white/20 hover:border-white/40'
                  }
                `}
                style={{ backgroundColor: color }}
                onClick={() => updateTheme({ accentColor: value as any })}
                whileHover={{ scale: theme.accentColor === value ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs text-white font-medium">{name}</span>
                {theme.accentColor === value && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-white"
                    layoutId="activeAccent"
                    initial={false}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===== EFFECTS SELECTOR =====
  const EffectsSelector = () => {
    const effects = [
      {
        key: 'animations',
        label: 'Animaciones',
        description: 'Transiciones y efectos de movimiento',
        icon: SparklesIcon
      },
      {
        key: 'glassEffect',
        label: 'Efecto Cristal',
        description: 'Transparencias y blur en componentes',
        icon: EyeIcon
      },
      {
        key: 'neonEffects',
        label: 'Efectos Neón',
        description: 'Bordes brillantes y sombras coloridas',
        icon: SparklesIcon
      },
      {
        key: 'reducedMotion',
        label: 'Movimiento Reducido',
        description: 'Menos animaciones para accesibilidad',
        icon: EyeSlashIcon
      }
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Efectos Visuales</h3>
        <div className="space-y-3">
          {effects.map(({ key, label, description, icon: Icon }) => (
            <motion.div
              key={key}
              className={`
                p-4 rounded-xl border transition-all duration-300 cursor-pointer
                ${theme[key as keyof typeof theme] 
                  ? 'border-cyan-400 bg-cyan-500/10' 
                  : 'border-white/20 bg-white/5 hover:border-white/40'
                }
              `}
              onClick={() => updateTheme({ [key]: !theme[key as keyof typeof theme] })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h4 className="text-white font-medium">{label}</h4>
                    <p className="text-gray-400 text-sm">{description}</p>
                  </div>
                </div>
                <div className={`
                  w-6 h-6 rounded-full border-2 transition-all duration-300
                  ${theme[key as keyof typeof theme] 
                    ? 'border-cyan-400 bg-cyan-400' 
                    : 'border-white/40'
                  }
                `}>
                  {theme[key as keyof typeof theme] && (
                    <motion.div
                      className="w-full h-full rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // ===== PRESET THEMES =====
  const PresetThemes = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-3">Temas Predefinidos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presetThemes.map((preset) => (
          <motion.div
            key={preset.id}
            className={`
              p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
              ${theme.appliedPreset === preset.id 
                ? 'border-cyan-400 bg-cyan-500/10' 
                : 'border-white/20 bg-white/5 hover:border-white/40'
              }
            `}
            onClick={() => applyPresetTheme(preset.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-8 h-8 rounded-lg" 
                style={{ 
                  background: `linear-gradient(45deg, ${preset.config.customColors.primary}, ${preset.config.customColors.secondary})` 
                }}
              />
              <div>
                <h4 className="text-white font-medium">{preset.name}</h4>
                <p className="text-gray-400 text-sm">{preset.description}</p>
              </div>
            </div>
            
            {/* Color Preview */}
            <div className="flex space-x-2">
              {Object.values(preset.config.customColors).slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ===== COMPACT MODE =====
  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Tema</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleThemeMode}
            disabled={isLoading}
          >
            {getCurrentMode() === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </Button>
        </div>
        <ModeSelector />
      </div>
    );
  }

  // ===== FULL MODE =====
  return (
    <Card className={`${className}`} variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PaintBrushIcon className="w-6 h-6" />
          <span>Personalización de Tema</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" variant="neon" />
          </div>
        )}
        
        {!isLoading && (
          <>
            {/* Tabs */}
            <div className="flex space-x-2 mb-6 p-1 bg-white/5 rounded-lg">
              {[
                { key: 'mode', label: 'Modo', icon: ComputerDesktopIcon },
                { key: 'colors', label: 'Colores', icon: SwatchIcon },
                { key: 'effects', label: 'Efectos', icon: SparklesIcon },
                ...(showPresets ? [{ key: 'presets', label: 'Temas', icon: PaintBrushIcon }] : [])
              ].map(({ key, label, icon: Icon }) => (
                <motion.button
                  key={key}
                  className={`
                    relative flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-300
                    ${activeTab === key 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                  onClick={() => setActiveTab(key as any)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                  {activeTab === key && (
                    <motion.div
                      className="absolute inset-0 bg-cyan-500/20 rounded-md"
                      layoutId="activeTab"
                      initial={false}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'mode' && <ModeSelector />}
                {activeTab === 'colors' && <ColorSelector />}
                {activeTab === 'effects' && <EffectsSelector />}
                {activeTab === 'presets' && showPresets && <PresetThemes />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;

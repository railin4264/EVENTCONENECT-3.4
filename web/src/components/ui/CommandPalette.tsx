'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Users, 
  Settings, 
  User, 
  Map, 
  Bell, 
  Home,
  ArrowRight,
  Command
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  placeholder?: string;
  className?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  placeholder = 'Buscar comandos...',
  className = ''
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter commands based on search
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.description?.toLowerCase().includes(search.toLowerCase()) ||
    command.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Command Palette */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className={`relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border">
                Esc
              </kbd>
              <span>para cerrar</span>
            </div>
          </div>

          {/* Command List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedCommands).length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No se encontraron comandos
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                    {category}
                  </div>
                  
                  {/* Commands in Category */}
                  {categoryCommands.map((command, categoryIndex) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <motion.div
                        key={command.id}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {command.icon && (
                              <div className={`w-5 h-5 ${
                                isSelected ? 'text-blue-600' : 'text-gray-400'
                              }`}>
                                {command.icon}
                              </div>
                            )}
                            <div>
                              <div className={`font-medium ${
                                isSelected 
                                  ? 'text-blue-900 dark:text-blue-100' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {command.title}
                              </div>
                              {command.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {command.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {command.shortcut && (
                              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded border">
                                {command.shortcut}
                              </kbd>
                            )}
                            <ArrowRight className={`w-4 h-4 ${
                              isSelected ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for Command Palette
export const useCommandPalette = (commands: CommandItem[]) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    openCommandPalette: () => setIsOpen(true),
    closeCommandPalette: () => setIsOpen(false),
    CommandPalette: (props: Omit<CommandPaletteProps, 'isOpen' | 'onClose' | 'commands'>) => (
      <CommandPalette
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        commands={commands}
      />
    )
  };
};

// Default commands for EventConnect
export const defaultEventConnectCommands: CommandItem[] = [
  {
    id: 'home',
    title: 'Ir al Inicio',
    description: 'Navegar a la página principal',
    icon: <Home className="w-5 h-5" />,
    category: 'Navegación',
    shortcut: 'G H',
    action: () => window.location.href = '/'
  },
  {
    id: 'events',
    title: 'Ver Eventos',
    description: 'Explorar todos los eventos disponibles',
    icon: <Calendar className="w-5 h-5" />,
    category: 'Navegación',
    shortcut: 'G E',
    action: () => window.location.href = '/events'
  },
  {
    id: 'map',
    title: 'Vista de Mapa',
    description: 'Ver eventos en el mapa interactivo',
    icon: <Map className="w-5 h-5" />,
    category: 'Navegación',
    shortcut: 'G M',
    action: () => window.location.href = '/events?view=map'
  },
  {
    id: 'tribes',
    title: 'Mis Tribus',
    description: 'Ver las comunidades a las que perteneces',
    icon: <Users className="w-5 h-5" />,
    category: 'Navegación',
    shortcut: 'G T',
    action: () => window.location.href = '/tribes'
  },
  {
    id: 'profile',
    title: 'Mi Perfil',
    description: 'Ver y editar tu perfil de usuario',
    icon: <User className="w-5 h-5" />,
    category: 'Usuario',
    shortcut: 'G P',
    action: () => window.location.href = '/profile'
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Ver tus notificaciones recientes',
    icon: <Bell className="w-5 h-5" />,
    category: 'Usuario',
    shortcut: 'G N',
    action: () => window.location.href = '/notifications'
  },
  {
    id: 'settings',
    title: 'Configuración',
    description: 'Ajustar las preferencias de tu cuenta',
    icon: <Settings className="w-5 h-5" />,
    category: 'Usuario',
    shortcut: 'G S',
    action: () => window.location.href = '/settings'
  }
];

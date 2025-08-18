'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  UserCircleIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  HeartIcon,
  BookmarkIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface UserDropdownProps {
  user: any;
  onClose: () => void;
}

const UserDropdown = ({ user, onClose }: UserDropdownProps) => {
  const { logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  const menuItems = [
    {
      label: 'Mi Perfil',
      href: '/profile',
      icon: UserCircleIcon,
      description: 'Ver y editar tu perfil'
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: CalendarDaysIcon,
      description: 'Gestionar tus eventos'
    },
    {
      label: 'Mis Tribus',
      href: '/tribes/my',
      icon: UsersIcon,
      description: 'Tribus que has creado o te has unido'
    },
    {
      label: 'Mensajes',
      href: '/chat',
      icon: ChatBubbleLeftIcon,
      description: 'Chat y mensajes privados'
    },
    {
      label: 'Notificaciones',
      href: '/notifications',
      icon: BellIcon,
      description: 'Configurar notificaciones'
    },
    {
      label: 'Favoritos',
      href: '/favorites',
      icon: HeartIcon,
      description: 'Eventos y tribus favoritos'
    },
    {
      label: 'Guardados',
      href: '/saved',
      icon: BookmarkIcon,
      description: 'Contenido guardado'
    },
    {
      label: 'Configuración',
      href: '/settings',
      icon: Cog6ToothIcon,
      description: 'Preferencias de la cuenta'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{user?.username}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {user?.stats?.eventsAttended || 0} eventos asistidos
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {user?.stats?.tribesJoined || 0} tribus
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <item.icon className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDropdown;
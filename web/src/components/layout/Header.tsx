'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEventConnectContext } from '@/contexts/EventConnectContext';
import { useCommandPalette, defaultEventConnectCommands } from '@/components/ui/CommandPalette';
import {
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Calendar,
  Users,
  Search,
  MapPin,
  Command
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, notifications, unreadNotifications } = useEventConnectContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Command Palette
  const { openCommandPalette, CommandPalette } = useCommandPalette(defaultEventConnectCommands);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/profile');
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EventConnect</h1>
            </div>
          </motion.div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/events" icon={Calendar} label="Eventos" />
            <NavLink href="/tribes" icon={Users} label="Tribus" />
            <NavLink href="/discover" icon={Search} label="Descubrir" />
            <NavLink href="/map" icon={MapPin} label="Mapa" />
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Command Palette Button */}
                <motion.button
                  onClick={openCommandPalette}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Abrir búsqueda rápida (Ctrl+K)"
                >
                  <Command className="w-5 h-5" />
                </motion.button>

                {/* Notifications */}
                <motion.button
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </motion.span>
                  )}
                </motion.button>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden sm:block text-white text-sm font-medium">
                      {user?.firstName || 'Usuario'}
                    </span>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.firstName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-gray-400 text-sm">@{user?.username}</p>
                              {user?.isVerified && (
                                <span className="inline-flex items-center px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full mt-1">
                                  ✓ Verificado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <UserMenuItem
                            icon={User}
                            label="Mi Perfil"
                            onClick={handleProfile}
                          />
                          <UserMenuItem
                            icon={Heart}
                            label="Mis Favoritos"
                            onClick={() => router.push('/favorites')}
                          />
                          <UserMenuItem
                            icon={Calendar}
                            label="Mis Eventos"
                            onClick={() => router.push('/my-events')}
                          />
                          <UserMenuItem
                            icon={Settings}
                            label="Configuración"
                            onClick={() => router.push('/settings')}
                          />
                          <div className="border-t border-white/10 my-2"></div>
                          <UserMenuItem
                            icon={LogOut}
                            label="Cerrar Sesión"
                            onClick={handleLogout}
                            variant="danger"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Login/Register Buttons */}
                <div className="hidden sm:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogin}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRegister}
                  >
                    Registrarse
                  </Button>
                </div>

                {/* Mobile Auth Button */}
                <div className="sm:hidden">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLogin}
                  >
                    Entrar
                  </Button>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 py-4"
            >
              <nav className="space-y-2">
                <MobileNavLink href="/events" icon={Calendar} label="Eventos" />
                <MobileNavLink href="/tribes" icon={Users} label="Tribus" />
                <MobileNavLink href="/discover" icon={Search} label="Descubrir" />
                <MobileNavLink href="/map" icon={MapPin} label="Mapa" />
                
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <Button variant="ghost" size="sm" fullWidth onClick={handleLogin}>
                      Iniciar Sesión
                    </Button>
                    <Button variant="primary" size="sm" fullWidth onClick={handleRegister}>
                      Registrarse
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Command Palette */}
      <CommandPalette />
    </header>
  );
};

// Helper Components
interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label }) => {
  const router = useRouter();
  
  return (
    <motion.button
      onClick={() => router.push(href)}
      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label }) => {
  const router = useRouter();
  
  return (
    <motion.button
      onClick={() => router.push(href)}
      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
};

interface UserMenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const UserMenuItem: React.FC<UserMenuItemProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'default' 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
        variant === 'danger'
          ? 'text-red-400 hover:bg-red-500/20'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </motion.button>
  );
};
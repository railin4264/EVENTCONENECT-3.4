'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useUnreadNotificationsCount } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import SearchModal from '@/components/modals/SearchModal';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import UserDropdown from '@/components/user/UserDropdown';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { unreadCount } = useUnreadNotificationsCount();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Eventos', href: '/events', icon: CalendarDaysIcon },
    { name: 'Tribus', href: '/tribes', icon: UsersIcon },
    { name: 'Dashboard', href: '/dashboard', icon: Cog6ToothIcon },
    { name: 'Feed', href: '/feed', icon: HeartIcon },
    { name: 'Mapa', href: '/map', icon: MapPinIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg'
            : 'bg-white dark:bg-gray-900'
        )}
      >
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link href='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>E</span>
              </div>
              <span className='text-xl font-bold text-gray-900 dark:text-white'>
                EventConnect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-1'>
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className='w-4 h-4' />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className='flex items-center space-x-2'>
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className='p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                title='Buscar'
              >
                <MagnifyingGlassIcon className='w-5 h-5' />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className='p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                title='Cambiar tema'
              >
                {theme === 'light' ? (
                  <SunIcon className='w-5 h-5' />
                ) : theme === 'dark' ? (
                  <MoonIcon className='w-5 h-5' />
                ) : (
                  <ComputerDesktopIcon className='w-5 h-5' />
                )}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className='relative dropdown-container'>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className='relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                      title='Notificaciones'
                    >
                      <BellIcon className='w-5 h-5' />
                      {unreadCount > 0 && (
                        <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotificationOpen && (
                        <NotificationDropdown
                          onClose={() => setIsNotificationOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className='relative dropdown-container'>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className='flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                      title='Menú de usuario'
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-8 h-8 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center'>
                          <span className='text-sm font-medium text-primary-600'>
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <span className='hidden lg:block text-sm font-medium'>
                        {user?.firstName}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <UserDropdown
                          user={user}
                          onClose={() => setIsUserMenuOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <Link
                    href='/auth/login'
                    className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium'
                  >
                    Iniciar Sesión
                  </Link>

                  {/* Register Button */}
                  <Link
                    href='/auth/register'
                    className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium'
                  >
                    Registrarse
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className='w-5 h-5' />
                ) : (
                  <Bars3Icon className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
            >
              <div className='px-4 py-4 space-y-2'>
                {navigation.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <item.icon className='w-5 h-5' />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {isAuthenticated && (
                  <>
                    <div className='border-t border-gray-200 dark:border-gray-700 pt-4 mt-4'>
                      <Link
                        href='/profile'
                        className='flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                      >
                        <UserCircleIcon className='w-5 h-5' />
                        <span>Mi Perfil</span>
                      </Link>

                      <Link
                        href='/settings'
                        className='flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                      >
                        <Cog6ToothIcon className='w-5 h-5' />
                        <span>Configuración</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className='flex items-center space-x-3 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                      >
                        <ArrowRightOnRectangleIcon className='w-5 h-5' />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Spacer for fixed navbar */}
      <div className='h-16' />
    </>
  );
};

export default Navbar;

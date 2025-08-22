'use client';

import { useState } from 'react';
import Link from 'next/link';
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
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import SearchModal from '@/components/modals/SearchModal';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import UserDropdown from '@/components/user/UserDropdown';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: 'Eventos', href: '/events' },
    { name: 'Tribus', href: '/tribes' },
    { name: 'Explorar', href: '/explore' },
    { name: 'Crear', href: '/create' },
  ];

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <>
      <header className='fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-soft border-b border-gray-200 dark:border-gray-700'>
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
            <nav className='hidden md:flex items-center space-x-8'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium'
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className='flex items-center space-x-4'>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
                title='Cambiar tema'
              >
                {theme === 'dark' ? (
                  <SunIcon className='w-5 h-5' />
                ) : theme === 'light' ? (
                  <MoonIcon className='w-5 h-5' />
                ) : (
                  <ComputerDesktopIcon className='w-5 h-5' />
                )}
              </button>

              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
                title='Buscar'
              >
                <MagnifyingGlassIcon className='w-5 h-5' />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className='relative'>
                    <button
                      onClick={() =>
                        setIsNotificationsOpen(!isNotificationsOpen)
                      }
                      className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative'
                      title='Notificaciones'
                    >
                      <BellIcon className='w-5 h-5' />
                      {/* Notification Badge */}
                      <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <NotificationDropdown
                          onClose={() => setIsNotificationsOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className='relative'>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className='flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      ) : (
                        <UserCircleIcon className='w-8 h-8' />
                      )}
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
                /* Auth Buttons */
                <div className='hidden md:flex items-center space-x-3'>
                  <Link href='/auth/login' className='btn-outline btn-sm'>
                    Iniciar Sesión
                  </Link>
                  <Link href='/auth/register' className='btn-primary btn-sm'>
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className='w-6 h-6' />
                ) : (
                  <Bars3Icon className='w-6 h-6' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'
            >
              <div className='px-4 py-6 space-y-4'>
                {/* Mobile Navigation */}
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className='block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium py-2'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <div className='pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3'>
                    <Link
                      href='/auth/login'
                      className='block w-full text-center btn-outline'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href='/auth/register'
                      className='block w-full text-center btn-primary'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}

                {/* Mobile User Menu */}
                {isAuthenticated && (
                  <div className='pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3'>
                    <Link
                      href='/dashboard'
                      className='flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircleIcon className='w-5 h-5' />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href='/profile'
                      className='flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Cog6ToothIcon className='w-5 h-5' />
                      <span>Perfil</span>
                    </Link>
                    <button
                      onClick={() => {
                        // Handle logout
                        setIsMobileMenuOpen(false);
                      }}
                      className='flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors py-2 w-full text-left'
                    >
                      <ArrowRightOnRectangleIcon className='w-5 h-5' />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Header;

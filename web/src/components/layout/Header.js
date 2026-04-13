'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Solo usar useAuth después de que el componente esté montado
  const auth = mounted ? useAuth() : { user: null, isAuthenticated: false, logout: () => {} };
  const { user, isAuthenticated, logout } = auth;

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
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EventConnect</h1>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => router.push('/events')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Eventos
            </button>
            <button
              onClick={() => router.push('/tribes')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Tribus
            </button>
            <button
              onClick={() => router.push('/discover')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Descubrir
            </button>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block">{user?.name || 'Usuario'}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={handleProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Perfil
                      </button>
                      <button
                        onClick={() => router.push('/settings')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Configuración
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={handleRegister}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  router.push('/events');
                  setShowMobileMenu(false);
                }}
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Eventos
              </button>
              <button
                onClick={() => {
                  router.push('/tribes');
                  setShowMobileMenu(false);
                }}
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Tribus
              </button>
              <button
                onClick={() => {
                  router.push('/discover');
                  setShowMobileMenu(false);
                }}
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Descubrir
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
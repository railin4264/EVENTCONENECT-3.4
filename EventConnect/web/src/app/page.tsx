'use client'

import HeroSection from '@/components/sections/HeroSection';
import EventDiscovery from '@/components/sections/EventDiscovery';
import SocialFeed from '@/components/feed/SocialFeed';
import InteractiveMap from '@/components/maps/InteractiveMap';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Event Discovery Section */}
      <EventDiscovery
        title="Eventos Destacados"
        subtitle="Descubre los eventos más populares y trending cerca de ti"
        showFilters={true}
        limit={8}
      />

      {/* Interactive Map Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Explora en el Mapa
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Visualiza eventos y tribus en tiempo real. Encuentra experiencias increíbles cerca de tu ubicación.
            </p>
          </div>
          
          <div className="h-96 lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <InteractiveMap
              showEvents={true}
              showTribes={true}
              showUsers={false}
            />
          </div>
        </div>
      </section>

      {/* Social Feed Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Feed Social
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Mantente al día con las últimas publicaciones, eventos y actividades de la comunidad EventConnect.
            </p>
          </div>
          
          <SocialFeed
            showCreatePost={true}
            filterType="all"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por qué EventConnect?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Descubre las características que hacen de EventConnect la plataforma líder para conectar personas a través de eventos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl border border-primary-200 dark:border-primary-700">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Descubrimiento Inteligente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nuestro algoritmo de IA aprende de tus preferencias para recomendarte eventos y tribus que realmente te interesan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-2xl border border-secondary-200 dark:border-secondary-700">
              <div className="w-16 h-16 bg-secondary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Geolocalización Precisa
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Encuentra eventos y comunidades cerca de ti con nuestro sistema de geolocalización avanzado y mapas interactivos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-2xl border border-accent-200 dark:border-accent-700">
              <div className="w-16 h-16 bg-accent-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tiempo Real
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chat en vivo, notificaciones instantáneas y actualizaciones en tiempo real para mantenerte conectado siempre.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700">
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Seguridad y Privacidad
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tu información está protegida con los más altos estándares de seguridad y control total sobre tu privacidad.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200 dark:border-purple-700">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sistema de Gamificación
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gana badges, sube de nivel y compite con otros usuarios mientras participas en eventos y comunidades.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200 dark:border-orange-700">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Multiplataforma
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accede desde cualquier dispositivo: web, móvil, tablet. Tu experiencia se sincroniza perfectamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para Conectar?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Únete a miles de personas que ya están descubriendo eventos increíbles y formando conexiones significativas en EventConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Comenzar Gratis
            </a>
            <a
              href="/about"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-primary-600 transition-colors font-semibold text-lg"
            >
              Conoce Más
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

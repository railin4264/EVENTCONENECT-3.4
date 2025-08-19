'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const featuredEvents = [
    {
      id: 1,
      title: 'Meetup de Desarrolladores',
      description: 'Conecta con otros desarrolladores y comparte experiencias',
      date: '2024-01-15',
      time: '19:00',
      location: 'Centro de Innovación',
      attendees: 45,
      category: 'Tecnología',
      image: '/images/event-dev.jpg'
    },
    {
      id: 2,
      title: 'Clase de Yoga al Aire Libre',
      description: 'Disfruta de una sesión de yoga en el parque central',
      date: '2024-01-16',
      time: '08:00',
      location: 'Parque Central',
      attendees: 23,
      category: 'Bienestar',
      image: '/images/event-yoga.jpg'
    },
    {
      id: 3,
      title: 'Noche de Networking',
      description: 'Amplía tu red profesional en un ambiente relajado',
      date: '2024-01-17',
      time: '20:00',
      location: 'Bar Downtown',
      attendees: 67,
      category: 'Negocios',
      image: '/images/event-networking.jpg'
    }
  ];

  const popularTribes = [
    {
      id: 1,
      name: 'Tech Enthusiasts',
      description: 'Apasionados por la tecnología y la innovación',
      members: 1247,
      category: 'Tecnología',
      image: '/images/tribe-tech.jpg'
    },
    {
      id: 2,
      name: 'Fitness & Wellness',
      description: 'Comunidad enfocada en salud y bienestar',
      members: 892,
      category: 'Salud',
      image: '/images/tribe-fitness.jpg'
    },
    {
      id: 3,
      name: 'Art & Culture',
      description: 'Amantes del arte, música y cultura',
      members: 567,
      category: 'Arte',
      image: '/images/tribe-art.jpg'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      toast.error('Por favor ingresa un término de búsqueda');
    }
  };

  const handleEventClick = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const handleTribeClick = (tribeId: number) => {
    router.push(`/tribes/${tribeId}`);
  };

  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'map':
        router.push('/map');
        break;
      case 'events':
        router.push('/events');
        break;
      case 'tribes':
        router.push('/tribes');
        break;
      case 'chat':
        router.push('/chat');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Descubre Eventos y Tribus
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Conecta con personas que comparten tus intereses. Únete a eventos increíbles y forma parte de tribus únicas cerca de ti.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos, tribus o personas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/events/create')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-semibold text-lg transition-colors"
              >
                Crear Evento
              </button>
              <button
                onClick={() => router.push('/tribes/create')}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full font-semibold text-lg transition-colors"
              >
                Crear Tribu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para conectar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              EventConnect te ofrece todas las herramientas para descubrir, conectar y vivir experiencias únicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Interactive Map */}
            <div 
              onClick={() => handleFeatureClick('map')}
              className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mapa Interactivo</h3>
              <p className="text-gray-600 mb-4">
                Descubre eventos y tribus cerca de ti con nuestro mapa inteligente
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                Explorar mapa
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Events Management */}
            <div 
              onClick={() => handleFeatureClick('events')}
              className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Eventos</h3>
              <p className="text-gray-600 mb-4">
                Crea, gestiona y únete a eventos increíbles de todo tipo
              </p>
              <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                Ver eventos
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tribes */}
            <div 
              onClick={() => handleFeatureClick('tribes')}
              className="group p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sistema de Tribus</h3>
              <p className="text-gray-600 mb-4">
                Únete a comunidades con intereses similares y forma conexiones duraderas
              </p>
              <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                Explorar tribus
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Real-time Chat */}
            <div 
              onClick={() => handleFeatureClick('chat')}
              className="group p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat en Tiempo Real</h3>
              <p className="text-gray-600 mb-4">
                Comunícate instantáneamente con otros miembros de la comunidad
              </p>
              <div className="flex items-center text-orange-600 font-medium group-hover:text-orange-700">
                Ir al chat
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Push Notifications */}
            <div 
              onClick={() => handleFeatureClick('notifications')}
              className="group p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 hover:border-red-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Notificaciones Push</h3>
              <p className="text-gray-600 mb-4">
                Mantente al día con eventos y actividades que te interesan
              </p>
              <div className="flex items-center text-red-600 font-medium group-hover:text-red-700">
                Configurar
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* PWA Features */}
            <div className="group p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">App Nativa</h3>
              <p className="text-gray-600 mb-4">
                Instala EventConnect como una app nativa y disfruta de funcionalidad offline
              </p>
              <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                Instalar app
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Eventos Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre los eventos más populares y únete a la diversión
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <CalendarIcon className="w-16 h-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      {event.attendees}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {event.date} • {event.time}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/events')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors"
            >
              Ver Todos los Eventos
            </button>
          </div>
        </div>
      </section>

      {/* Popular Tribes Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tribus Populares
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Únete a las comunidades más activas y conecta con personas que comparten tus intereses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularTribes.map((tribe) => (
              <div
                key={tribe.id}
                onClick={() => handleTribeClick(tribe.id)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <UserGroupIcon className="w-16 h-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {tribe.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      {tribe.members}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {tribe.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tribe.description}
                  </p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors">
                    Unirse a la Tribu
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/tribes')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors"
            >
              Explorar Todas las Tribus
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para conectar?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a EventConnect hoy mismo y comienza a descubrir eventos increíbles y conectar con personas que comparten tus pasiones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-semibold text-lg transition-colors"
            >
              Crear Cuenta Gratis
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full font-semibold text-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

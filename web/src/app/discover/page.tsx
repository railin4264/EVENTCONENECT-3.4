'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, Filter, TrendingUp, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: {
    address: string;
    city: string;
    coordinates: [number, number];
  };
  category: string;
  tags: string[];
  image: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  rating: number;
  isFeatured: boolean;
  isTrending: boolean;
}

interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  isFeatured: boolean;
}

// ==========================================
// DATOS MOCK PARA DESARROLLO
// ==========================================

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Electrónica',
    description: 'El evento más grande de música electrónica del año con los mejores DJs internacionales.',
    date: new Date('2024-12-31T20:00:00Z'),
    location: {
      address: 'Parque Central',
      city: 'Buenos Aires',
      coordinates: [-58.3816, -34.6037]
    },
    category: 'music',
    tags: ['música', 'electrónica', 'festival', 'DJ'],
    image: '/images/events/electronic-festival.jpg',
    attendees: 1500,
    maxAttendees: 2000,
    price: 150,
    rating: 4.8,
    isFeatured: true,
    isTrending: true
  },
  {
    id: '2',
    title: 'Conferencia de Tecnología',
    description: 'Descubre las últimas tendencias en tecnología e innovación.',
    date: new Date('2024-12-15T09:00:00Z'),
    location: {
      address: 'Centro de Convenciones',
      city: 'Córdoba',
      coordinates: [-64.1888, -31.4201]
    },
    category: 'technology',
    tags: ['tecnología', 'innovación', 'conferencia', 'startups'],
    image: '/images/events/tech-conference.jpg',
    attendees: 300,
    maxAttendees: 500,
    price: 75,
    rating: 4.6,
    isFeatured: true,
    isTrending: false
  },
  {
    id: '3',
    title: 'Clase de Yoga al Aire Libre',
    description: 'Conecta con la naturaleza mientras practicas yoga en un entorno único.',
    date: new Date('2024-12-20T07:00:00Z'),
    location: {
      address: 'Reserva Ecológica',
      city: 'Mendoza',
      coordinates: [-68.8272, -32.8908]
    },
    category: 'wellness',
    tags: ['yoga', 'naturaleza', 'bienestar', 'aire libre'],
    image: '/images/events/yoga-outdoor.jpg',
    attendees: 45,
    maxAttendees: 60,
    price: 25,
    rating: 4.9,
    isFeatured: false,
    isTrending: true
  }
];

const mockTribes: Tribe[] = [
  {
    id: '1',
    name: 'Amantes del Rock',
    description: 'Comunidad para todos los fanáticos del rock clásico y moderno.',
    category: 'music',
    tags: ['rock', 'música', 'bandas', 'conciertos'],
    image: '/images/tribes/rock-lovers.jpg',
    memberCount: 1250,
    maxMembers: 2000,
    isPublic: true,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Emprendedores Tech',
    description: 'Red de emprendedores en tecnología compartiendo experiencias y oportunidades.',
    category: 'business',
    tags: ['emprendimiento', 'tecnología', 'startups', 'networking'],
    image: '/images/tribes/tech-entrepreneurs.jpg',
    memberCount: 890,
    maxMembers: 1000,
    isPublic: true,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Viajeros Aventureros',
    description: 'Comunidad de viajeros que buscan experiencias únicas y aventuras.',
    category: 'travel',
    tags: ['viajes', 'aventura', 'exploración', 'cultura'],
    image: '/images/tribes/adventure-travelers.jpg',
    memberCount: 2100,
    maxMembers: 3000,
    isPublic: true,
    isFeatured: false
  }
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const DiscoverPage: React.FC = () => {
  // ==========================================
  // ESTADOS
  // ==========================================
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('trending');
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [tribes, setTribes] = useState<Tribe[]>(mockTribes);
  const [activeTab, setActiveTab] = useState<'events' | 'tribes'>('events');

  // ==========================================
  // CATEGORÍAS Y FILTROS
  // ==========================================
  
  const categories = [
    { id: 'all', name: 'Todas', icon: '🌟' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'technology', name: 'Tecnología', icon: '💻' },
    { id: 'wellness', name: 'Bienestar', icon: '🧘' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'travel', name: 'Viajes', icon: '✈️' },
    { id: 'sports', name: 'Deportes', icon: '⚽' },
    { id: 'art', name: 'Arte', icon: '🎨' },
    { id: 'food', name: 'Gastronomía', icon: '🍕' }
  ];

  const locations = [
    { id: 'all', name: 'Todas las ciudades' },
    { id: 'buenos-aires', name: 'Buenos Aires' },
    { id: 'cordoba', name: 'Córdoba' },
    { id: 'mendoza', name: 'Mendoza' },
    { id: 'rosario', name: 'Rosario' },
    { id: 'la-plata', name: 'La Plata' }
  ];

  // ==========================================
  // FUNCIONES DE FILTRADO Y BÚSQUEDA
  // ==========================================
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || 
                           event.location.city.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const filteredTribes = tribes.filter(tribe => {
    const matchesSearch = tribe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tribe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tribe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || tribe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.isTrending ? 1 : -1;
      case 'rating':
        return b.rating - a.rating;
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'attendees':
        return b.attendees - a.attendees;
      default:
        return 0;
    }
  });

  const sortedTribes = [...filteredTribes].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.isFeatured ? 1 : -1;
      case 'members':
        return b.memberCount - a.memberCount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // ==========================================
  // COMPONENTES DE RENDERIZADO
  // ==========================================
  
  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Evento';
          }}
        />
        {event.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            <Star className="w-3 h-3 inline mr-1" />
            Destacado
          </div>
        )}
        {event.isTrending && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Trending
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {categories.find(c => c.id === event.category)?.icon} {categories.find(c => c.id === event.category)?.name}
          </span>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700">{event.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{event.date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{event.location.city}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span>{event.attendees}/{event.maxAttendees} asistentes</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            ${event.price === 0 ? 'Gratis' : event.price}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
          Ver Detalles
        </button>
      </div>
    </motion.div>
  );

  const TribeCard: React.FC<{ tribe: Tribe }> = ({ tribe }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        <img 
          src={tribe.image} 
          alt={tribe.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Tribu';
          }}
        />
        {tribe.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            <Star className="w-3 h-3 inline mr-1" />
            Destacada
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {categories.find(c => c.id === tribe.category)?.icon} {categories.find(c => c.id === tribe.category)?.name}
          </span>
          <div className="flex items-center text-blue-500">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium text-gray-700">{tribe.memberCount}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{tribe.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tribe.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tribe.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {tribe.memberCount}/{tribe.maxMembers} miembros
          </span>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
            Unirse
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDERIZADO DEL COMPONENTE
  // ==========================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageHeader 
        title="Descubre"
        subtitle="Encuentra eventos increíbles y únete a comunidades apasionantes"
        showBackButton={false}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar eventos, tribus, categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="trending">🔥 Trending</option>
                <option value="rating">⭐ Mejor valorados</option>
                <option value="date">📅 Próximos</option>
                <option value="attendees">👥 Más populares</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎉 Eventos ({filteredEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('tribes')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tribes'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Tribus ({filteredTribes.length})
            </button>
          </div>
        </div>

        {/* Contenido de los tabs */}
        {activeTab === 'events' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Eventos Destacados
              </h2>
              <div className="flex items-center text-blue-600">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-medium">Descubriendo eventos increíbles</span>
              </div>
            </div>
            
            {sortedEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron eventos</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o la búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tribus Recomendadas
              </h2>
              <div className="flex items-center text-purple-600">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">Conectando con comunidades</span>
              </div>
            </div>
            
            {sortedTribes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron tribus</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o la búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedTribes.map(tribe => (
                  <TribeCard key={tribe.id} tribe={tribe} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
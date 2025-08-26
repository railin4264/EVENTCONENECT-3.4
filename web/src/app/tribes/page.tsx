'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Users, MapPin, TrendingUp, Star, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Tribe {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location?: string;
  category: string;
  image: string;
  tags: string[];
  isJoined: boolean;
  rating: number;
  isOnline: boolean;
}

const TribesPage = () => {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { id: 'all', name: 'Todos', icon: Users },
    { id: 'tech', name: 'Tecnología', icon: Users },
    { id: 'sports', name: 'Deportes', icon: Users },
    { id: 'music', name: 'Música', icon: Users },
    { id: 'art', name: 'Arte', icon: Users },
    { id: 'travel', name: 'Viajes', icon: Users },
    { id: 'food', name: 'Comida', icon: Users },
    { id: 'gaming', name: 'Gaming', icon: Users },
  ];

  useEffect(() => {
    loadTribes();
  }, []);

  const loadTribes = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTribes([
        {
          id: '1',
          name: 'Desarrolladores React',
          description: 'Comunidad de desarrolladores apasionados por React y tecnologías modernas.',
          memberCount: 1250,
          location: 'Madrid, España',
          category: 'tech',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
          tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
          isJoined: true,
          rating: 4.8,
          isOnline: true,
        },
        {
          id: '2',
          name: 'Fotógrafos Urbanos',
          description: 'Explora y captura la belleza de la ciudad junto a otros fotógrafos.',
          memberCount: 890,
          location: 'Barcelona, España',
          category: 'art',
          image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
          tags: ['Fotografía', 'Arte', 'Ciudad', 'Creatividad'],
          isJoined: false,
          rating: 4.6,
          isOnline: false,
        },
        {
          id: '3',
          name: 'Runners de Madrid',
          description: 'Grupo de running para todos los niveles. ¡Corre con nosotros!',
          memberCount: 2100,
          location: 'Madrid, España',
          category: 'sports',
          image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
          tags: ['Running', 'Deporte', 'Salud', 'Fitness'],
          isJoined: false,
          rating: 4.9,
          isOnline: true,
        },
        {
          id: '4',
          name: 'Amantes del Jazz',
          description: 'Disfruta de la mejor música jazz en conciertos y jam sessions.',
          memberCount: 540,
          location: 'Sevilla, España',
          category: 'music',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
          tags: ['Jazz', 'Música', 'Conciertos', 'Cultura'],
          isJoined: false,
          rating: 4.7,
          isOnline: false,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const filteredTribes = tribes.filter(tribe => {
    const matchesSearch = tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tribe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleJoinTribe = (tribeId: string) => {
    setTribes(prev => prev.map(tribe => 
      tribe.id === tribeId 
        ? { 
            ...tribe, 
            isJoined: !tribe.isJoined,
            memberCount: tribe.isJoined ? tribe.memberCount - 1 : tribe.memberCount + 1
          }
        : tribe
    ));
  };

  const TribeCard = ({ tribe }: { tribe: Tribe }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className="relative">
        <img 
          src={tribe.image} 
          alt={tribe.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            tribe.isOnline 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${tribe.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            {tribe.isOnline ? 'En línea' : 'Offline'}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {tribe.rating}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tribe.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
              {tribe.description}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{tribe.memberCount.toLocaleString()} miembros</span>
          </div>
          {tribe.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{tribe.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {tribe.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tribe.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tribe.tags.length - 3}
            </Badge>
          )}
        </div>

        <Button
          onClick={() => handleJoinTribe(tribe.id)}
          variant={tribe.isJoined ? "outline" : "default"}
          className="w-full"
        >
          {tribe.isJoined ? 'Miembro' : 'Unirse'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Descubre Tribus
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Únete a comunidades con intereses similares y conoce personas increíbles
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear Tribu
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar tribus por nombre, descripción o tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tribus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tribes.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tribus Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tribes.filter(t => t.isOnline).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mis Tribus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tribes.filter(t => t.isJoined).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(tribes.reduce((acc, t) => acc + t.rating, 0) / tribes.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tribes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTribes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron tribus
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Intenta con otros términos de búsqueda o ajusta los filtros
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear nueva tribu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTribes.map((tribe) => (
              <TribeCard key={tribe.id} tribe={tribe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TribesPage;










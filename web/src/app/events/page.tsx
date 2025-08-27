'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  TrendingUp,
  Star,
  Tag,
  ExternalLink,
  Image as ImageIcon,
  Video,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Award,
  Zap,
  Globe,
  Lock,
  Camera,
  Music,
  Gamepad2,
  Utensils,
  Car,
  Plane,
  GraduationCap,
  Briefcase,
  Heart as HeartIcon,
  ShoppingBag,
  Home,
  Palette,
  Dumbbell,
  BookOpen,
  Coffee,
  TreePine
} from 'lucide-react';
import EventCreateForm from '@/components/forms/EventCreateForm';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  venue: string;
  isOnline: boolean;
  onlineUrl?: string;
  isFree: boolean;
  price?: number;
  currency?: string;
  maxAttendees: number;
  currentAttendees: number;
  isPrivate: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  tags: string[];
  image?: string;
  gallery?: string[];
  host: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
    isHost: boolean;
  };
  coHosts?: {
    id: string;
    username: string;
    avatar?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  views: number;
  likes: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isShared: boolean;
  isAttending: boolean;
  isHost: boolean;
  isCoHost: boolean;
  rating: number;
  reviewCount: number;
}

interface EventFilters {
  search: string;
  category: string;
  dateRange: 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'year';
  location: string;
  price: 'all' | 'free' | 'paid';
  type: 'all' | 'online' | 'offline' | 'hybrid';
  sort: 'date' | 'popularity' | 'rating' | 'price' | 'distance';
}

export default function EventsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: '',
    dateRange: 'all',
    location: '',
    price: 'all',
    type: 'all',
    sort: 'date',
  });

  // Fetch events
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => api.events.getEvents(filters),
  });

  // Handle event actions
  const handleLike = async (eventId: string) => {
    try {
      await api.events.likeEvent(eventId);
      refetch();
      toast.success('Evento marcado como me gusta');
    } catch (error) {
      toast.error('Error al marcar evento');
    }
  };

  const handleBookmark = async (eventId: string) => {
    try {
      await api.events.bookmarkEvent(eventId);
      refetch();
      toast.success('Evento agregado a favoritos');
    } catch (error) {
      toast.error('Error al agregar a favoritos');
    }
  };

  const handleShare = async (event: Event) => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await api.events.deleteEvent(eventId);
        refetch();
        toast.success('Evento eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar evento');
      }
    }
  };

  const handleAttend = async (eventId: string) => {
    try {
      await api.events.attendEvent(eventId);
      refetch();
      toast.success('Te has registrado para el evento');
    } catch (error) {
      toast.error('Error al registrarse para el evento');
    }
  };

  const handleUnattend = async (eventId: string) => {
    try {
      await api.events.unattendEvent(eventId);
      refetch();
      toast.success('Te has desregistrado del evento');
    } catch (error) {
      toast.error('Error al desregistrarse del evento');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'musica': Music,
      'deportes': Dumbbell,
      'tecnologia': Zap,
      'arte': Palette,
      'gastronomia': Utensils,
      'viajes': Plane,
      'educacion': GraduationCap,
      'negocios': Briefcase,
      'social': HeartIcon,
      'shopping': ShoppingBag,
      'hogar': Home,
      'gaming': Gamepad2,
      'fitness': Dumbbell,
      'cultura': BookOpen,
      'networking': Users,
      'conferencias': GraduationCap,
      'workshops': Wrench,
      'exposiciones': Camera,
      'festivales': TreePine,
      'conciertos': Music,
    };
    return icons[category] || Calendar;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'musica': 'bg-purple-100 text-purple-800',
      'deportes': 'bg-green-100 text-green-800',
      'tecnologia': 'bg-blue-100 text-blue-800',
      'arte': 'bg-pink-100 text-pink-800',
      'gastronomia': 'bg-orange-100 text-orange-800',
      'viajes': 'bg-indigo-100 text-indigo-800',
      'educacion': 'bg-yellow-100 text-yellow-800',
      'negocios': 'bg-gray-100 text-gray-800',
      'social': 'bg-red-100 text-red-800',
      'shopping': 'bg-teal-100 text-teal-800',
      'hogar': 'bg-amber-100 text-amber-800',
      'gaming': 'bg-violet-100 text-violet-800',
      'fitness': 'bg-emerald-100 text-emerald-800',
      'cultura': 'bg-rose-100 text-rose-800',
      'networking': 'bg-cyan-100 text-cyan-800',
      'conferencias': 'bg-slate-100 text-slate-800',
      'workshops': 'bg-lime-100 text-lime-800',
      'exposiciones': 'bg-fuchsia-100 text-fuchsia-800',
      'festivales': 'bg-orange-100 text-orange-800',
      'conciertos': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.startDate + 'T' + event.startTime);
    
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed') return 'completed';
    if (eventDate < now) return 'past';
    if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'today';
    if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'this-week';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800',
      'past': 'bg-gray-100 text-gray-600',
      'today': 'bg-orange-100 text-orange-800',
      'this-week': 'bg-yellow-100 text-yellow-800',
      'upcoming': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'cancelled': 'Cancelado',
      'completed': 'Completado',
      'past': 'Pasado',
      'today': 'Hoy',
      'this-week': 'Esta semana',
      'upcoming': 'Próximamente',
    };
    return texts[status] || 'Desconocido';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Eventos</h1>
            <p className="text-gray-600">Descubre y crea eventos increíbles en tu comunidad</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Evento</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar eventos..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="musica">Música</option>
                <option value="deportes">Deportes</option>
                <option value="tecnologia">Tecnología</option>
                <option value="arte">Arte</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="viajes">Viajes</option>
                <option value="educacion">Educación</option>
                <option value="negocios">Negocios</option>
                <option value="social">Social</option>
                <option value="shopping">Shopping</option>
                <option value="hogar">Hogar</option>
                <option value="gaming">Gaming</option>
                <option value="fitness">Fitness</option>
                <option value="cultura">Cultura</option>
                <option value="networking">Networking</option>
                <option value="conferencias">Conferencias</option>
                <option value="workshops">Workshops</option>
                <option value="exposiciones">Exposiciones</option>
                <option value="festivales">Festivales</option>
                <option value="conciertos">Conciertos</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="tomorrow">Mañana</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <select
                value={filters.price}
                onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los precios</option>
                <option value="free">Gratis</option>
                <option value="paid">De pago</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="online">Online</option>
                <option value="offline">Presencial</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Por fecha</option>
                <option value="popularity">Por popularidad</option>
                <option value="rating">Por calificación</option>
                <option value="price">Por precio</option>
                <option value="distance">Por distancia</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => {
          const eventStatus = getEventStatus(event);
          const CategoryIcon = getCategoryIcon(event.category);
          
          return (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Event Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {event.title.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(eventStatus)}`}>
                    {getStatusText(eventStatus)}
                  </span>
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-4 right-4">
                  {event.isPrivate ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Privado</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center space-x-1">
                      <Globe className="w-3 h-3" />
                      <span>Público</span>
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)} flex items-center space-x-1`}>
                    <CategoryIcon className="w-3 h-3" />
                    <span className="capitalize">{event.category}</span>
                  </span>
                </div>

                {/* Action Menu */}
                {(event.isHost || event.isCoHost || event.isAttending) && (
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <button className="p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-gray-800">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-2">
                          {(event.isHost || event.isCoHost) && (
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                          )}
                          {(event.isHost || event.isCoHost) && (
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          )}
                          {event.isAttending && !event.isHost && !event.isCoHost && (
                            <button
                              onClick={() => handleUnattend(event.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Users className="w-4 h-4" />
                              <span>Cancelar asistencia</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Content */}
              <div className="p-6">
                {/* Title and Host */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {event.host.avatar ? (
                        <img src={event.host.avatar} alt={event.host.username} className="w-6 h-6 rounded-full" />
                      ) : (
                        event.host.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm text-gray-600">Organizado por {event.host.username}</span>
                    {event.host.isVerified && (
                      <span className="text-blue-600 text-sm">✓</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                  </div>
                  
                  {event.isOnline ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4" />
                      <span>Evento online</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue || event.location.city}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{event.currentAttendees}/{event.maxAttendees} asistentes</span>
                  </div>
                  
                  {!event.isFree && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Tag className="w-4 h-4" />
                      <span>{event.price} {event.currency}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{event.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{event.rating.toFixed(1)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{event.views}</span>
                    </span>
                  </div>
                  <span>{formatDate(event.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(event.id)}
                      className={`p-2 rounded-full ${
                        event.isLiked ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      } transition-colors duration-200`}
                    >
                      <Heart className={`w-5 h-5 ${event.isLiked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleBookmark(event.id)}
                      className={`p-2 rounded-full ${
                        event.isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      } transition-colors duration-200`}
                    >
                      <Bookmark className={`w-5 h-5 ${event.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleShare(event)}
                      className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {event.isAttending ? (
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      Asistiendo
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAttend(event.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Asistir
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!events || events.length === 0) && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos disponibles</h3>
          <p className="text-gray-600">
            {filters.search || filters.category || filters.dateRange !== 'all'
              ? 'No hay eventos que coincidan con los filtros aplicados'
              : 'Sé el primero en crear un evento en tu comunidad'
            }
          </p>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <EventCreateForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  refetch();
                  toast.success('Evento creado correctamente');
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Evento</h2>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <EventCreateForm
                event={editingEvent}
                onSuccess={() => {
                  setEditingEvent(null);
                  refetch();
                  toast.success('Evento actualizado correctamente');
                }}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Evento</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Event Image */}
                {selectedEvent.image && (
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                {/* Event Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Categoría:</span>
                      <p className="text-gray-600 capitalize">{selectedEvent.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p className="text-gray-600">{formatDate(selectedEvent.startDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hora:</span>
                      <p className="text-gray-600">{formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Ubicación:</span>
                      <p className="text-gray-600">{selectedEvent.venue || selectedEvent.location.city}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Asistentes:</span>
                      <p className="text-gray-600">{selectedEvent.currentAttendees}/{selectedEvent.maxAttendees}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Precio:</span>
                      <p className="text-gray-600">
                        {selectedEvent.isFree ? 'Gratis' : `${selectedEvent.price} ${selectedEvent.currency}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Ver Asistentes
                  </button>
                  <button
                    onClick={() => handleShare(selectedEvent)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi, getMockEvents } from '@/lib/api';
import { InterestFilterBar } from '@/components/filters/InterestFilterBar';
import { EventMap } from '@/components/map/EventMap';
import { EventIcon } from '@/lib/eventIcons';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  Share,
  Clock,
  ArrowRight,
  TrendingUp,
  Grid,
  List,
  Map,
  LayoutGrid,
  Filter as FilterIcon,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle, CardBadge } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';

// ===== EVENT INTERFACE =====
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  price: string;
  image: string;
  isLiked: boolean;
  isTrending: boolean;
  tags: string[];
  organizer: string;
  rating: number;
}

// ===== FILTER INTERFACE =====
interface FilterState {
  category: string;
  location: string;
  date: string;
  price: string;
  attendees: string;
}

// ===== SAMPLE EVENTS DATA =====
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Meetup Barcelona 2024',
    description:
      'Únete a desarrolladores y entusiastas de la tecnología para una noche de networking y charlas inspiradoras sobre el futuro del desarrollo web, IA y blockchain.',
    date: '15 Dic 2024',
    time: '19:00',
    location: 'Barcelona, España',
    category: 'Tecnología',
    attendees: 45,
    maxAttendees: 80,
    price: 'Gratis',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600',
    isLiked: true,
    isTrending: true,
    tags: ['Web Development', 'AI', 'Networking'],
    organizer: 'TechBarcelona',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Festival de Música Urbana Madrid',
    description:
      'Celebra la cultura urbana con los mejores artistas del momento. Una noche llena de ritmo, baile y energía positiva que no te puedes perder.',
    date: '20 Dic 2024',
    time: '22:00',
    location: 'Madrid, España',
    category: 'Música',
    attendees: 120,
    maxAttendees: 200,
    price: '€25',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    isLiked: false,
    isTrending: false,
    tags: ['Hip Hop', 'Reggaeton', 'Dance'],
    organizer: 'UrbanFest',
    rating: 4.6,
  },
  {
    id: '3',
    title: 'Workshop de Arte Digital Avanzado',
    description:
      'Aprende técnicas avanzadas de arte digital con herramientas modernas como Procreate, Photoshop y Blender. Perfecto para artistas que quieren expandir sus habilidades.',
    date: '22 Dic 2024',
    time: '16:00',
    location: 'Valencia, España',
    category: 'Arte',
    attendees: 18,
    maxAttendees: 25,
    price: '€45',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
    isLiked: false,
    isTrending: true,
    tags: ['Digital Art', 'Procreate', 'Design'],
    organizer: 'DigitalArt Studio',
    rating: 4.9,
  },
  {
    id: '4',
    title: 'Networking Empresarial Sevilla',
    description:
      'Conecta con emprendedores y profesionales del sector empresarial. Oportunidades únicas de colaboración, inversión y crecimiento para tu negocio.',
    date: '25 Dic 2024',
    time: '18:30',
    location: 'Sevilla, España',
    category: 'Negocios',
    attendees: 35,
    maxAttendees: 60,
    price: '€30',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    isLiked: true,
    isTrending: false,
    tags: ['Business', 'Networking', 'Startups'],
    organizer: 'Sevilla Business Club',
    rating: 4.7,
  },
  {
    id: '5',
    title: 'Maratón Nocturna Barcelona',
    description:
      'Corre por las calles iluminadas de Barcelona en esta maratón nocturna única. Recorrido de 42km con vistas espectaculares de la ciudad.',
    date: '28 Dic 2024',
    time: '21:00',
    location: 'Barcelona, España',
    category: 'Deportes',
    attendees: 85,
    maxAttendees: 150,
    price: '€55',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    isLiked: false,
    isTrending: true,
    tags: ['Running', 'Marathon', 'Night Race'],
    organizer: 'Barcelona Running Club',
    rating: 4.5,
  },
  {
    id: '6',
    title: 'Festival Gastronómico Valencia',
    description:
      'Explora la rica tradición culinaria valenciana con chefs reconocidos, degustaciones exclusivas y talleres de cocina tradicional.',
    date: '30 Dic 2024',
    time: '14:00',
    location: 'Valencia, España',
    category: 'Gastronomía',
    attendees: 65,
    maxAttendees: 100,
    price: '€75',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    isLiked: true,
    isTrending: false,
    tags: ['Food', 'Cooking', 'Valencia'],
    organizer: 'Valencia Food Festival',
    rating: 4.8,
  },
];

// ===== CATEGORIES DATA =====
const categories = [
  { value: 'all', label: 'Todos los Eventos' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'music', label: 'Música' },
  { value: 'art', label: 'Arte' },
  { value: 'business', label: 'Negocios' },
  { value: 'sports', label: 'Deportes' },
  { value: 'food', label: 'Gastronomía' },
  { value: 'education', label: 'Educación' },
  { value: 'health', label: 'Salud & Bienestar' },
  { value: 'culture', label: 'Cultura' },
];

// ===== LOCATIONS DATA =====
const locations = [
  { value: 'all', label: 'Todas las Ubicaciones' },
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
  { value: 'valencia', label: 'Valencia' },
  { value: 'sevilla', label: 'Sevilla' },
  { value: 'bilbao', label: 'Bilbao' },
  { value: 'granada', label: 'Granada' },
  { value: 'malaga', label: 'Málaga' },
];

// ===== PRICE RANGES =====
const priceRanges = [
  { value: 'all', label: 'Todos los Precios' },
  { value: 'free', label: 'Gratis' },
  { value: 'low', label: '€0 - €25' },
  { value: 'medium', label: '€26 - €50' },
  { value: 'high', label: '€51+' },
];

// ===== EVENT CARD COMPONENT =====
const EventCard: React.FC<{
  event: Event;
  index: number;
  viewMode: 'grid' | 'list' | 'map';
}> = ({ event, index, viewMode }) => {
  const [isLiked, setIsLiked] = useState(event.isLiked);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className='w-full'
      >
        <Card
          variant='glass'
          className='hover:scale-[1.02] transition-transform duration-300'
        >
          <CardContent className='p-0'>
            <div className='flex'>
              {/* Event Image */}
              <div className='w-48 h-32 relative flex-shrink-0'>
                <img
                  src={event.image}
                  alt={event.title}
                  className='w-full h-full object-cover rounded-l-xl'
                />

                {/* Category Icon & Badge */}
                <div className='absolute top-3 left-3 flex items-center space-x-2'>
                  <EventIcon 
                    category={event.category.toLowerCase()} 
                    size="sm" 
                    variant="gradient"
                    className="shadow-lg"
                  />
                  <CardBadge variant='primary'>{event.category}</CardBadge>
                </div>

                {/* Trending Badge */}
                {event.isTrending && (
                  <div className='absolute top-3 right-3'>
                    <CardBadge
                      variant='accent'
                      className='flex items-center space-x-1'
                    >
                      <TrendingUp className='w-3 h-3' />
                      <span>Trending</span>
                    </CardBadge>
                  </div>
                )}
              </div>

              {/* Event Content */}
              <div className='flex-1 p-6'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex-1'>
                    <CardTitle className='text-xl mb-2'>
                      {event.title}
                    </CardTitle>
                    <p className='text-gray-300 text-sm mb-3 line-clamp-2'>
                      {event.description}
                    </p>

                    {/* Tags */}
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {event.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className='px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className='flex items-center space-x-1 ml-4'>
                    <Star className='w-4 h-4 text-yellow-400 fill-current' />
                    <span className='text-sm text-gray-300'>
                      {event.rating}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='w-4 h-4 text-cyan-400' />
                    <span className='text-sm text-gray-300'>{event.date}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Clock className='w-4 h-4 text-cyan-400' />
                    <span className='text-sm text-gray-300'>{event.time}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <MapPin className='w-4 h-4 text-cyan-400' />
                    <span className='text-sm text-gray-300'>
                      {event.location}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Users className='w-4 h-4 text-cyan-400' />
                    <span className='text-sm text-gray-300'>
                      {event.attendees}/{event.maxAttendees}
                    </span>
                  </div>
                </div>

                {/* Event Footer */}
                <div className='flex justify-between items-center'>
                  <div className='flex items-center space-x-4'>
                    <span className='text-sm text-gray-400'>
                      Organizado por:
                    </span>
                    <span className='text-sm text-cyan-400 font-medium'>
                      {event.organizer}
                    </span>
                    <span className='text-lg font-bold text-cyan-400'>
                      {event.price}
                    </span>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleShare}
                      className='text-gray-400 hover:text-white'
                    >
                      <Share className='w-4 h-4' />
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleLike}
                      className={`${isLiked ? 'text-pink-400' : 'text-gray-400'} hover:text-pink-400`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
                      />
                    </Button>

                    <Button variant='primary' size='sm'>
                      <span>Unirse</span>
                      <ArrowRight className='w-4 h-4 ml-2' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className='w-full'
    >
      <Card
        variant='glass'
        className='hover:scale-105 transition-transform duration-300 h-full'
      >
        <CardContent className='p-0'>
          {/* Event Image */}
          <div className='relative h-48'>
            <img
              src={event.image}
              alt={event.title}
              className='w-full h-full object-cover rounded-t-xl'
            />

            {/* Category Icon & Badge */}
            <div className='absolute top-3 left-3 flex items-center space-x-2'>
              <EventIcon 
                category={event.category.toLowerCase()} 
                size="sm" 
                variant="gradient"
                className="shadow-lg"
              />
              <CardBadge variant='primary'>{event.category}</CardBadge>
            </div>

            {/* Trending Badge */}
            {event.isTrending && (
              <div className='absolute top-3 right-3'>
                <CardBadge
                  variant='accent'
                  className='flex items-center space-x-1'
                >
                  <TrendingUp className='w-3 h-3' />
                  <span>Trending</span>
                </CardBadge>
              </div>
            )}

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isLiked
                  ? 'bg-pink-500 text-white'
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Event Content */}
          <div className='p-4'>
            <div className='mb-3'>
              <CardTitle className='text-lg mb-2 line-clamp-2'>
                {event.title}
              </CardTitle>
              <p className='text-gray-300 text-sm line-clamp-2 mb-3'>
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className='space-y-2 mb-4'>
              <div className='flex items-center space-x-2'>
                <Calendar className='w-4 h-4 text-cyan-400' />
                <span className='text-sm text-gray-300'>
                  {event.date} • {event.time}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <MapPin className='w-4 h-4 text-cyan-400' />
                <span className='text-sm text-gray-300'>{event.location}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Users className='w-4 h-4 text-cyan-400' />
                <span className='text-sm text-gray-300'>
                  {event.attendees}/{event.maxAttendees} asistentes
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className='flex flex-wrap gap-1 mb-4'>
              {event.tags.slice(0, 2).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className='px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300'
                >
                  {tag}
                </span>
              ))}
              {event.tags.length > 2 && (
                <span className='px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300'>
                  +{event.tags.length - 2}
                </span>
              )}
            </div>

            {/* Event Footer */}
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2'>
                <Star className='w-4 h-4 text-yellow-400 fill-current' />
                <span className='text-sm text-gray-300'>{event.rating}</span>
                <span className='text-lg font-bold text-cyan-400 ml-2'>
                  {event.price}
                </span>
              </div>

              <Button variant='primary' size='sm'>
                <span>Unirse</span>
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== MAIN EVENTS PAGE =====
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    location: 'all',
    date: 'all',
    price: 'all',
    attendees: 'all',
  });
  
  const api = useApi();

  // ===== LOAD USER DATA & EVENTS =====
  useEffect(() => {
    const loadInitialData = async () => {
      // Cargar preferencias del usuario
      const savedInterests = localStorage.getItem('userInterests');
      const savedLocation = localStorage.getItem('userLocation');
      
      if (savedInterests) {
        const interests = JSON.parse(savedInterests);
        setUserInterests(interests);
      }
      
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
      }

      // Cargar eventos
      await loadEvents(savedInterests ? JSON.parse(savedInterests) : [], savedLocation ? JSON.parse(savedLocation) : null);
    };

    loadInitialData();
  }, []);

  const loadEvents = async (interests: string[] = userInterests, location: {lat: number, lng: number} | null = userLocation) => {
    setLoading(true);
    
    try {
      // Intentar cargar desde backend primero con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundo timeout
      
      const isBackendOnline = await api.healthCheck();
      clearTimeout(timeoutId);
      
      if (isBackendOnline) {
        const response = await api.getEvents({
          lat: location?.lat,
          lng: location?.lng,
          radius: 50,
          interests: interests,
          limit: 50
        });
        
        if (response.success && response.data) {
          // Convertir eventos de la API al formato local con memoización
          const apiEvents = response.data.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: new Date(event.date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short', 
              year: 'numeric'
            }),
            time: event.time,
            location: event.location.city,
            category: event.interests[0] || 'General',
            attendees: event.attendees,
            maxAttendees: event.maxAttendees || event.attendees + 50,
            price: event.price ? `€${event.price}` : 'Gratis',
            image: event.images[0] || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600',
            isLiked: false,
            isTrending: Math.random() > 0.7,
            tags: event.interests,
            organizer: event.organizer.name,
            rating: 4.0 + Math.random() * 1,
          }));
          
          // Cache en localStorage para offline
          localStorage.setItem('cached_events', JSON.stringify(apiEvents));
          localStorage.setItem('cached_events_timestamp', Date.now().toString());
          
          setEvents(apiEvents);
        } else {
          throw new Error('Invalid API response');
        }
      } else {
        throw new Error('Backend offline');
      }
    } catch (error) {
      console.warn('API failed, using fallback:', error.message);
      
      // Intentar usar cache primero
      const cachedEvents = localStorage.getItem('cached_events');
      const cacheTimestamp = localStorage.getItem('cached_events_timestamp');
      const isRecentCache = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 3600000; // 1 hora
      
      if (cachedEvents && isRecentCache) {
        console.log('Using cached events');
        setEvents(JSON.parse(cachedEvents));
        return;
      }
      
      // Usar eventos mockados como último recurso
      console.log('Using mock data with user preferences');
      let mockEvents = [...sampleEvents];
      
      // Personalizar eventos basados en intereses del usuario
      if (interests.length > 0) {
        mockEvents = mockEvents.map(event => {
          if (interests.some(interest => event.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())))) {
            return { ...event, isTrending: true };
          }
          return event;
        });
        
        // Ordenar eventos que coinciden con intereses primero
        mockEvents.sort((a, b) => {
          const aMatches = a.tags.some(tag => interests.some(interest => tag.toLowerCase().includes(interest.toLowerCase())));
          const bMatches = b.tags.some(tag => interests.some(interest => tag.toLowerCase().includes(interest.toLowerCase())));
          return bMatches ? 1 : aMatches ? -1 : 0;
        });
      }
      
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER EVENTS =====
  useEffect(() => {
    let filtered = events;

    // Interest filter (priority filter)
    if (selectedInterests.length > 0) {
      filtered = filtered.filter(event =>
        selectedInterests.some(interest =>
          event.category.toLowerCase().includes(interest.toLowerCase()) ||
          event.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
        )
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(
        event => event.category.toLowerCase() === filters.category
      );
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location)
      );
    }

    // Price filter
    if (filters.price !== 'all') {
      filtered = filtered.filter(event => {
        const price = event.price;
        if (filters.price === 'free') return price === 'Gratis';
        if (filters.price === 'low')
          return price !== 'Gratis' && parseFloat(price.replace('€', '')) <= 25;
        if (filters.price === 'medium')
          return (
            price !== 'Gratis' &&
            parseFloat(price.replace('€', '')) > 25 &&
            parseFloat(price.replace('€', '')) <= 50
          );
        if (filters.price === 'high')
          return price !== 'Gratis' && parseFloat(price.replace('€', '')) > 50;
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, filters, selectedInterests]);

  // ===== HANDLE FILTER CHANGE =====
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ===== INTEREST FILTER HANDLERS =====
  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const clearInterestFilters = () => {
    setSelectedInterests([]);
  };

  // ===== CLEAR ALL FILTERS =====
  const clearFilters = () => {
    setFilters({
      category: 'all',
      location: 'all',
      date: 'all',
      price: 'all',
      attendees: 'all',
    });
    setSearchQuery('');
    setSelectedInterests([]);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Cargando eventos increíbles...</h2>
            <p className="text-gray-300">
              {userInterests.length > 0 
                ? `Buscando eventos sobre: ${userInterests.join(', ')}`
                : 'Preparando la mejor experiencia para ti'
              }
            </p>
            {userLocation && (
              <p className="text-cyan-400 text-sm">📍 Eventos cerca de tu ubicación</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Background Particles */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className='absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className='fixed inset-0 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20 pointer-events-none' />

      <div className='relative z-10'>
        {/* Header Section */}
        <section className='pt-8 pb-8'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0"
            >
              <div>
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                  <span className='bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent'>
                    Eventos
                  </span>
                  <span className='text-white'> para ti</span>
                </h1>
                <p className='text-lg text-gray-300 max-w-2xl'>
                  {selectedInterests.length > 0 
                    ? `Mostrando eventos sobre: ${selectedInterests.join(', ')}`
                    : userLocation 
                      ? 'Eventos cerca de tu ubicación'
                      : 'Descubre eventos increíbles'
                  }
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros avanzados
                </Button>
                
                {(selectedInterests.length > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Limpiar todo
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Interest Filters Section */}
        <section className='pb-8'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <InterestFilterBar
                selectedInterests={selectedInterests}
                onInterestToggle={handleInterestToggle}
                onClearAll={clearInterestFilters}
                className="mb-6"
              />
            </motion.div>
          </div>
        </section>

        {/* Advanced Filters Section */}
        {showFilters && (
          <section className='pb-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant='glass' className='backdrop-blur-2xl'>
                  <CardContent className='p-6'>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        Cerrar
                      </Button>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <Input
                          type='text'
                          placeholder='Buscar eventos...'
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          variant='glass'
                          className='pl-9'
                        />
                      </div>

                      {/* Location Filter */}
                      <Dropdown
                        label='Ubicación'
                        options={locations}
                        value={filters.location}
                        onChange={value =>
                          handleFilterChange('location', value)
                        }
                        variant='glass'
                        placeholder='Seleccionar ubicación'
                      />

                      {/* Price Filter */}
                      <Dropdown
                        label='Precio'
                        options={priceRanges}
                        value={filters.price}
                        onChange={value => handleFilterChange('price', value)}
                        variant='glass'
                        placeholder='Seleccionar precio'
                      />

                      {/* Date Filter */}
                      <Dropdown
                        label='Fecha'
                        options={[
                          { value: 'all', label: 'Todas las fechas' },
                          { value: 'today', label: 'Hoy' },
                          { value: 'tomorrow', label: 'Mañana' },
                          { value: 'this_week', label: 'Esta semana' },
                          { value: 'this_month', label: 'Este mes' },
                        ]}
                        value={filters.date}
                        onChange={value => handleFilterChange('date', value)}
                        variant='glass'
                        placeholder='Seleccionar fecha'
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* View Mode Toggle */}
        <section className='pb-8'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className='flex justify-between items-center'
            >
              <div className='flex items-center space-x-4'>
                <h2 className='text-2xl font-bold text-white'>
                  {filteredEvents.length} Eventos Encontrados
                </h2>
                {Object.values(filters).some(f => f !== 'all') && (
                  <span className='px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full border border-cyan-400/30'>
                    Filtros activos
                  </span>
                )}
              </div>

              <div className='flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className='w-5 h-5' />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vista de lista"
                >
                  <List className='w-5 h-5' />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'map'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vista de mapa"
                >
                  <Map className='w-5 h-5' />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Events Display */}
        <section className='pb-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {filteredEvents.length > 0 ? (
              viewMode === 'map' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-[600px] rounded-xl overflow-hidden"
                >
                  <EventMap
                    events={filteredEvents.map(event => ({
                      id: event.id,
                      title: event.title,
                      category: event.category.toLowerCase(),
                      lat: 40.4168 + (Math.random() - 0.5) * 0.1, // Simulated coordinates
                      lng: -3.7038 + (Math.random() - 0.5) * 0.1,
                      date: event.date,
                      time: event.time,
                      attendees: event.attendees,
                      price: event.price,
                      image: event.image
                    }))}
                    userLocation={userLocation}
                    onEventSelect={(mapEvent) => {
                      // Handle event selection from map
                      console.log('Selected event:', mapEvent);
                    }}
                  />
                </motion.div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-6'
                  }
                >
                  {filteredEvents.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className='text-center py-20'
              >
                <Card variant='glass' className='max-w-md mx-auto'>
                  <CardContent className='p-8 text-center'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center'>
                      <Search className='w-8 h-8 text-gray-400' />
                    </div>
                    <h3 className='text-xl font-semibold text-white mb-2'>
                      No se encontraron eventos
                    </h3>
                    <p className='text-gray-300 mb-6'>
                      Intenta cambiar los filtros o la búsqueda para encontrar
                      más eventos
                    </p>
                    <Button variant='primary' onClick={clearFilters}>
                      Limpiar Filtros
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className='pb-20'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <Card variant='neon' className='text-center'>
                <CardContent className='p-8'>
                  <h2 className='text-3xl font-bold text-white mb-4'>
                    ¿No encuentras lo que buscas?
                  </h2>
                  <p className='text-gray-300 mb-8 text-lg'>
                    Crea tu propio evento y reúne a tu tribu. ¡Es más fácil de
                    lo que piensas!
                  </p>
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Button variant='primary' size='lg' glow>
                      Crear Evento
                    </Button>
                    <Button variant='outline' size='lg'>
                      Ver Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

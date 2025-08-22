'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  ClockIcon,
  TagIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/components/providers/WatchlistProvider';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ===== INTERFACES =====
interface EventData {
  id: string;
  title: string;
  description: string;
  image?: string;
  date?: string;
  location?: string | { address?: string; city?: string; venue?: string };
  distance?: string;
  attendees?: number;
  price?: number;
  category: string;
  host?: {
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rating?: number;
  };
  isPopular?: boolean;
  isTrending?: boolean;
  friendsAttending?: number;
  
  // Compatibilidad con formato existente
  dateTime?: {
    start: string;
    end: string;
  };
  capacity?: {
    current: number;
    max: number;
  };
  pricing?: {
    isFree: boolean;
    amount?: number;
  };
  media?: {
    images: string[];
  };
}

interface OptimizedEventCardProps {
  event: EventData;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  className?: string;
}

// ===== COMPONENTE PRINCIPAL =====
export const OptimizedEventCard: React.FC<OptimizedEventCardProps> = ({ 
  event, 
  variant = 'default', 
  showActions = true,
  className 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { joinEvent, leaveEvent } = useEvents();
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { has, toggle } = useWatchlist();

  // ===== HELPERS =====
  const getEventImage = () => {
    if (event.image) return event.image;
    if (event.media?.images?.[0]) return event.media.images[0];
    return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&q=80`;
  };

  const getEventDate = () => {
    if (event.date) return event.date;
    if (event.dateTime?.start) return event.dateTime.start;
    return new Date().toISOString();
  };

  const getEventLocation = () => {
    if (typeof event.location === 'string') return event.location;
    if (typeof event.location === 'object') {
      const loc = event.location;
      return loc.venue ? `${loc.venue}, ${loc.city}` : (loc.address || loc.city || 'Ubicación por definir');
    }
    return 'Ubicación por definir';
  };

  const getEventPrice = () => {
    if (event.price !== undefined) return event.price;
    if (event.pricing?.isFree) return 0;
    return event.pricing?.amount || 0;
  };

  const getAttendeeCount = () => {
    if (event.attendees !== undefined) return event.attendees;
    return event.capacity?.current || 0;
  };

  const getHostName = () => {
    if (event.host?.name) return event.host.name;
    if (event.host?.firstName && event.host?.lastName) {
      return `${event.host.firstName} ${event.host.lastName}`;
    }
    if (event.host?.username) return `@${event.host.username}`;
    return 'Organizador';
  };

  // ===== HANDLERS =====
  const handleJoinEvent = async () => {
    if (!isAuthenticated) return;
    
    setIsJoining(true);
    try {
      await joinEvent(event.id);
    } catch (error) {
      console.error('Error joining event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) return;
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    toggle(event.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: `${window.location.origin}/events/${event.id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
    }
  };

  // ===== RENDER COMPACT =====
  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.id}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer',
            className
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {event.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {formatDistanceToNow(new Date(getEventDate()), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-primary-600">
                {getEventPrice() === 0 ? 'GRATIS' : `€${getEventPrice()}`}
              </div>
              <div className="text-xs text-gray-500">
                {getAttendeeCount()} asistentes
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // ===== RENDER PRINCIPAL =====
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card variant="interactive" className="overflow-hidden h-full card-shadow">
        <div className="relative">
          <img
            src={getEventImage()}
            alt={event.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {event.isPopular && (
              <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <FireIcon className="w-3 h-3 mr-1" />
                Popular
              </div>
            )}
            {event.isTrending && (
              <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                Trending
              </div>
            )}
            {variant === 'featured' && (
              <div className="flex items-center bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <StarIcon className="w-3 h-3 mr-1" />
                Destacado
              </div>
            )}
          </div>
          
          {/* Precio */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
              {getEventPrice() === 0 ? 'GRATIS' : `€${getEventPrice()}`}
            </div>
          </div>
          
          {/* Amigos asistiendo */}
          {event.friendsAttending && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                <HeartIcon className="w-3 h-3 mr-1" />
                {event.friendsAttending} amigo{event.friendsAttending > 1 ? 's' : ''} va{event.friendsAttending > 1 ? 'n' : ''}
              </div>
            </div>
          )}
          
          {/* Acciones rápidas */}
          {showActions && (
            <div className="absolute top-3 right-16 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-black/50 text-white hover:bg-red-500'
                }`}
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSave}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  has(event.id)
                    ? 'bg-primary-500 text-white'
                    : 'bg-black/50 text-white hover:bg-primary-500'
                }`}
              >
                <BookmarkIcon className={`w-4 h-4 ${has(event.id) ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                {event.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                {event.description}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-500 text-sm">
              <CalendarDaysIcon className="w-4 h-4 mr-2 text-primary-500" />
              {format(new Date(getEventDate()), 'EEEE, d MMMM', { locale: es })}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPinIcon className="w-4 h-4 mr-2 text-primary-500" />
              <span className="truncate">{getEventLocation()}</span>
              {event.distance && <span className="ml-1">• {event.distance}</span>}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <UsersIcon className="w-4 h-4 mr-2 text-primary-500" />
              {getAttendeeCount().toLocaleString()} asistentes
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                <TagIcon className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-primary-600">{event.category}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {showActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              )}
              
              <Link href={`/events/${event.id}`}>
                <Button variant="primary" size="sm">
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Host info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {getHostName().charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {getHostName()}
              </span>
            </div>
            
            {event.host?.rating && (
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {event.host.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
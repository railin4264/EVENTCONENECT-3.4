'use client';

import { useState, useMemo } from 'react';
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
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWatchlist } from '@/components/providers/WatchlistProvider';

interface EventCardProps {
  event: any;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  className?: string;
}

const EventCard = ({
  event,
  variant = 'default',
  showActions = true,
  className,
}: EventCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const { joinEvent, leaveEvent } = useEvents();
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { location: userLocation } = useGeolocation();
  const { has, toggle } = useWatchlist();

  const isAttending = event.attendees?.some(
    (attendee: any) => attendee.user.id === user?.id
  );

  const isHost = event.host.id === user?.id;

  const handleJoinEvent = async () => {
    if (!isAuthenticated) return;

    setIsJoining(true);
    try {
      if (isAttending) {
        await leaveEvent(event.id);
      } else {
        await joinEvent(event.id);
      }
    } catch (error) {
      console.error('Error joining/leaving event:', error);
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/events/${event.id}`
      );
    }
  };

  const getEventStatus = () => {
    const now = new Date();
    const eventStart = new Date(event.dateTime.start);
    const eventEnd = new Date(event.dateTime.end);

    if (now < eventStart) {
      return 'upcoming';
    } else if (now >= eventStart && now <= eventEnd) {
      return 'ongoing';
    } else {
      return 'past';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'past':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Próximo';
      case 'ongoing':
        return 'En curso';
      case 'past':
        return 'Finalizado';
      default:
        return 'Desconocido';
    }
  };

  const calculateDistanceKm = (
    coord1: [number, number],
    coord2: [number, number]
  ): number => {
    const R = 6371; // km
    const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1[0] * Math.PI) / 180) *
        Math.cos((coord2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceKm = useMemo(() => {
    try {
      if (
        userLocation &&
        typeof userLocation.latitude === 'number' &&
        typeof userLocation.longitude === 'number' &&
        Array.isArray(event.location?.coordinates) &&
        event.location.coordinates.length === 2
      ) {
        // GeoJSON is [lng, lat], normalize to [lat, lng]
        const userCoord: [number, number] = [
          userLocation.latitude,
          userLocation.longitude,
        ];
        const eventCoord: [number, number] = [
          event.location.coordinates[1],
          event.location.coordinates[0],
        ];
        const d = calculateDistanceKm(userCoord, eventCoord);
        return Math.round(d * 10) / 10;
      }
    } catch {}
    return null;
  }, [userLocation, event.location?.coordinates]);

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
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0'>
              <CalendarDaysIcon className='w-6 h-6 text-primary-600' />
            </div>

            <div className='flex-1 min-w-0'>
              <h3 className='font-medium text-gray-900 dark:text-white truncate'>
                {event.title}
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                {formatDistanceToNow(new Date(event.dateTime.start), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>

            <div className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'>
              <MapPinIcon className='w-4 h-4' />
              <span>{event.location.city}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all',
        variant === 'featured' && 'ring-2 ring-primary-500',
        className
      )}
    >
      {/* Event Image */}
      <div className='relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100'>
        {event.media?.images?.[0] ? (
          <img
            src={event.media.images[0]}
            alt={event.title}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <CalendarDaysIcon className='w-16 h-16 text-primary-400' />
          </div>
        )}

        {/* Event Status Badge */}
        <div className='absolute top-3 left-3'>
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusColor(getEventStatus())
            )}
          >
            {getStatusText(getEventStatus())}
          </span>
        </div>

        {/* Price Badge */}
        {!event.pricing.isFree && (
          <div className='absolute top-3 right-3'>
            <span className='px-3 py-1 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white rounded-full shadow-sm'>
              ${event.pricing.amount}
            </span>
          </div>
        )}

        {/* Host Rating + Distance */}
        <div className='absolute bottom-3 left-3 flex gap-2'>
          <div
            className='flex items-center space-x-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm'
            aria-label='Calificación del anfitrión'
          >
            <StarIcon className='w-4 h-4 text-yellow-500' />
            <span className='text-sm font-medium text-gray-900 dark:text-white'>
              {event.host.rating.toFixed(1)}
            </span>
          </div>
          {distanceKm !== null && (
            <div
              className='flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full shadow-sm'
              aria-label='Distancia al evento'
            >
              <MapPinIcon className='w-4 h-4 text-primary-600' />
              <span className='text-sm font-medium text-gray-900 dark:text-white'>
                {distanceKm} km
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className='p-6'>
        {/* Event Header */}
        <div className='mb-4'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2'>
            {event.title}
          </h3>
          <p className='text-gray-600 dark:text-gray-400 line-clamp-2'>
            {event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className='space-y-3 mb-4'>
          {/* Date & Time */}
          <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
            <CalendarDaysIcon className='w-4 h-4' />
            <span>
              {format(new Date(event.dateTime.start), 'EEEE, d MMMM yyyy', {
                locale: es,
              })}
            </span>
          </div>

          <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
            <ClockIcon className='w-4 h-4' />
            <span>
              {format(new Date(event.dateTime.start), 'HH:mm')} -{' '}
              {format(new Date(event.dateTime.end), 'HH:mm')}
            </span>
          </div>

          {/* Location */}
          <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
            <MapPinIcon className='w-4 h-4' />
            <span>
              {event.location.address}, {event.location.city}
            </span>
          </div>

          {/* Capacity */}
          <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
            <UsersIcon className='w-4 h-4' />
            <span>
              {event.capacity.current}/{event.capacity.max} asistentes
              {event.capacity.waitlist > 0 &&
                ` (${event.capacity.waitlist} en lista de espera)`}
            </span>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
              <TagIcon className='w-4 h-4' />
              <div className='flex flex-wrap gap-1'>
                {event.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs'
                  >
                    {tag}
                  </span>
                ))}
                {event.tags.length > 3 && (
                  <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs'>
                    +{event.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Host Info */}
        <div className='flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
          {event.host.avatar ? (
            <img
              src={event.host.avatar}
              alt={event.host.firstName}
              className='w-10 h-10 rounded-full object-cover'
            />
          ) : (
            <div className='w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center'>
              <span className='text-sm font-medium text-primary-600'>
                {event.host.firstName[0]}
                {event.host.lastName[0]}
              </span>
            </div>
          )}

          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              {event.host.firstName} {event.host.lastName}
            </p>
            <div className='flex items-center space-x-1'>
              <StarIcon className='w-3 h-3 text-yellow-500' />
              <span className='text-xs text-gray-600 dark:text-gray-400'>
                {event.host.rating.toFixed(1)} ({event.host.reviewCount}{' '}
                reseñas)
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              {/* Join/Leave Button */}
              {!isHost && (
                <button
                  onClick={handleJoinEvent}
                  disabled={isJoining}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    isAttending
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800'
                  )}
                >
                  {isJoining ? '...' : isAttending ? 'Dejar Evento' : 'Unirse'}
                </button>
              )}

              {/* View Details Button */}
              <Link
                href={`/events/${event.id}`}
                className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Ver Detalles
              </Link>
            </div>

            {/* Action Icons */}
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleLike}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isLiked
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
                aria-label={isLiked ? 'Quitar me gusta' : 'Dar me gusta'}
              >
                {isLiked ? (
                  <HeartSolidIcon className='w-5 h-5' />
                ) : (
                  <HeartIcon className='w-5 h-5' />
                )}
              </button>

              <button
                onClick={handleSave}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  has(event.id)
                    ? 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                )}
                aria-label={
                  has(event.id) ? 'Quitar de guardados' : 'Guardar evento'
                }
              >
                <BookmarkIcon className='w-5 h-5' />
              </button>

              <button
                onClick={handleShare}
                className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                aria-label='Compartir evento'
              >
                <ShareIcon className='w-5 h-5' />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;

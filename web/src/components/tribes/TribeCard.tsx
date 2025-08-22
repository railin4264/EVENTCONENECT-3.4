'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UsersIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  TagIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import { useTribes } from '@/hooks/useTribes';
import { cn } from '@/lib/utils';

interface TribeCardProps {
  tribe: any;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  className?: string;
}

const TribeCard = ({
  tribe,
  variant = 'default',
  showActions = true,
  className,
}: TribeCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const { joinTribe, leaveTribe } = useTribes();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const isMember = tribe.members?.some(
    (member: any) => member.user.id === user?.id
  );

  const isCreator = tribe.creator.id === user?.id;
  const isModerator = tribe.moderators?.some((mod: any) => mod.id === user?.id);

  const handleJoinTribe = async () => {
    if (!isAuthenticated) return;

    setIsJoining(true);
    try {
      if (isMember) {
        await leaveTribe(tribe.id);
      } else {
        await joinTribe(tribe.id);
      }
    } catch (error) {
      console.error('Error joining/leaving tribe:', error);
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
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tribe.name,
          text: tribe.description,
          url: `${window.location.origin}/tribes/${tribe.id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/tribes/${tribe.id}`
      );
    }
  };

  const getPrivacyIcon = () => {
    switch (tribe.privacy) {
      case 'public':
        return <GlobeAltIcon className='w-4 h-4 text-green-500' />;
      case 'private':
        return <LockClosedIcon className='w-4 h-4 text-yellow-500' />;
      case 'invite_only':
        return <ShieldCheckIcon className='w-4 h-4 text-blue-500' />;
      default:
        return <GlobeAltIcon className='w-4 h-4 text-gray-500' />;
    }
  };

  const getPrivacyText = () => {
    switch (tribe.privacy) {
      case 'public':
        return 'Pública';
      case 'private':
        return 'Privada';
      case 'invite_only':
        return 'Solo por invitación';
      default:
        return 'Desconocida';
    }
  };

  if (variant === 'compact') {
    return (
      <Link href={`/tribes/${tribe.id}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer',
            className
          )}
        >
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0'>
              {tribe.avatar ? (
                <img
                  src={tribe.avatar}
                  alt={tribe.name}
                  className='w-12 h-12 rounded-lg object-cover'
                />
              ) : (
                <UsersIcon className='w-6 h-6 text-secondary-600' />
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <h3 className='font-medium text-gray-900 dark:text-white truncate'>
                {tribe.name}
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                {tribe.stats.memberCount} miembros
              </p>
            </div>

            <div className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'>
              <MapPinIcon className='w-4 h-4' />
              <span>{tribe.location.city || 'Global'}</span>
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
        variant === 'featured' && 'ring-2 ring-secondary-500',
        className
      )}
    >
      {/* Tribe Cover Image */}
      <div className='relative h-48 bg-gradient-to-br from-secondary-100 to-accent-100'>
        {tribe.coverImage ? (
          <img
            src={tribe.coverImage}
            alt={tribe.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <UsersIcon className='w-16 h-16 text-secondary-400' />
          </div>
        )}

        {/* Privacy Badge */}
        <div className='absolute top-3 left-3'>
          <div className='flex items-center space-x-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm'>
            {getPrivacyIcon()}
            <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
              {getPrivacyText()}
            </span>
          </div>
        </div>

        {/* Member Count Badge */}
        <div className='absolute top-3 right-3'>
          <div className='flex items-center space-x-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm'>
            <UsersIcon className='w-4 h-4 text-secondary-500' />
            <span className='text-sm font-medium text-gray-900 dark:text-white'>
              {tribe.stats.memberCount}
            </span>
          </div>
        </div>

        {/* Tribe Avatar */}
        <div className='absolute bottom-3 left-3'>
          {tribe.avatar ? (
            <img
              src={tribe.avatar}
              alt={tribe.name}
              className='w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg'
            />
          ) : (
            <div className='w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center'>
              <span className='text-2xl font-bold text-white'>
                {tribe.name[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tribe Content */}
      <div className='p-6'>
        {/* Tribe Header */}
        <div className='mb-4'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2'>
            {tribe.name}
          </h3>
          <p className='text-gray-600 dark:text-gray-400 line-clamp-2'>
            {tribe.description}
          </p>
        </div>

        {/* Tribe Details */}
        <div className='space-y-3 mb-4'>
          {/* Category */}
          <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
            <TagIcon className='w-4 h-4' />
            <span className='px-2 py-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full text-xs font-medium'>
              {tribe.category}
            </span>
          </div>

          {/* Location */}
          <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
            <MapPinIcon className='w-4 h-4' />
            <span>
              {tribe.location.isGlobal
                ? 'Tribu Global'
                : `${tribe.location.city}, ${tribe.location.country}`}
            </span>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div className='text-center'>
              <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                {tribe.stats.memberCount}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                Miembros
              </div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                {tribe.stats.eventCount}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                Eventos
              </div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                {tribe.stats.postCount}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                Publicaciones
              </div>
            </div>
          </div>

          {/* Tags */}
          {tribe.tags && tribe.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {tribe.tags.slice(0, 5).map((tag: string) => (
                <span
                  key={tag}
                  className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs'
                >
                  {tag}
                </span>
              ))}
              {tribe.tags.length > 5 && (
                <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs'>
                  +{tribe.tags.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Creator Info */}
        <div className='flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
          {tribe.creator.avatar ? (
            <img
              src={tribe.creator.avatar}
              alt={tribe.creator.firstName}
              className='w-10 h-10 rounded-full object-cover'
            />
          ) : (
            <div className='w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center'>
              <span className='text-sm font-medium text-primary-600'>
                {tribe.creator.firstName[0]}
                {tribe.creator.lastName[0]}
              </span>
            </div>
          )}

          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              Creado por {tribe.creator.firstName} {tribe.creator.lastName}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              @{tribe.creator.username}
            </p>
          </div>

          {/* Role Badge */}
          {isCreator && (
            <span className='px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium'>
              Creador
            </span>
          )}
          {isModerator && !isCreator && (
            <span className='px-2 py-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full text-xs font-medium'>
              Moderador
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              {/* Join/Leave Button */}
              {!isCreator && (
                <button
                  onClick={handleJoinTribe}
                  disabled={isJoining}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    isMember
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-800'
                  )}
                >
                  {isJoining ? '...' : isMember ? 'Dejar Tribu' : 'Unirse'}
                </button>
              )}

              {/* View Details Button */}
              <Link
                href={`/tribes/${tribe.id}`}
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
                  isSaved
                    ? 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                )}
              >
                <BookmarkIcon className='w-5 h-5' />
              </button>

              <button
                onClick={handleShare}
                className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
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

export default TribeCard;

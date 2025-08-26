'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  PhotoIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import CreatePostModal from './CreatePostModal';

interface SocialFeedProps {
  className?: string;
  showCreatePost?: boolean;
  filterType?: 'all' | 'events' | 'tribes' | 'following';
}

const SocialFeed = ({
  className,
  showCreatePost = true,
  filterType = 'all',
}: SocialFeedProps) => {
  const { user, isAuthenticated } = useAuth();
  const { posts, isLoading, error, createPost, likePost, unlikePost } =
    usePosts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filterType);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);

  // Filter posts based on active filter
  useEffect(() => {
    if (!posts) return;

    let filtered = [...posts];

    switch (activeFilter) {
      case 'events':
        filtered = posts.filter((post: any) => post.type === 'event');
        break;
      case 'tribes':
        filtered = posts.filter((post: any) => post.type === 'tribe');
        break;
      case 'all':
      default:
        filtered = posts;
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, activeFilter, user]);

  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) return;

    try {
      const post = posts.find((p: any) => p.id === postId);
      if (post?.isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <CalendarDaysIcon className='w-5 h-5 text-primary-500' />;
      case 'tribe':
        return <UsersIcon className='w-5 h-5 text-secondary-500' />;
      case 'location':
        return <MapPinIcon className='w-5 h-5 text-accent-500' />;
      default:
        return null;
    }
  };

  const getPostTypeText = (type: string) => {
    switch (type) {
      case 'event':
        return 'Evento';
      case 'tribe':
        return 'Tribu';
      case 'location':
        return 'Ubicación';
      default:
        return 'Publicación';
    }
  };

  const renderPost = (post: any) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm hover:shadow-md transition-all'
    >
      {/* Post Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.firstName}
              className='w-12 h-12 rounded-full object-cover'
            />
          ) : (
            <div className='w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center'>
              <span className='text-lg font-bold text-primary-600'>
                {post.author.firstName[0]}
                {post.author.lastName[0]}
              </span>
            </div>
          )}

          <div className='flex-1'>
            <div className='flex items-center space-x-2'>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {post.author.firstName} {post.author.lastName}
              </h3>
              {post.type && (
                <div className='flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full'>
                  {getPostIcon(post.type)}
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    {getPostTypeText(post.type)}
                  </span>
                </div>
              )}
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              @{post.author.username} •{' '}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>

        <button className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
          <EllipsisHorizontalIcon className='w-5 h-5' />
        </button>
      </div>

      {/* Post Content */}
      <div className='mb-4'>
        {post.title && (
          <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            {post.title}
          </h4>
        )}

        <p className='text-gray-700 dark:text-gray-300 whitespace-pre-wrap'>
          {post.content}
        </p>
      </div>

      {/* Post Media */}
      {post.media && post.media.images && post.media.images.length > 0 && (
        <div className='mb-4'>
          {post.media.images.length === 1 ? (
            <img
              src={post.media.images[0]}
              alt='Post image'
              className='w-full rounded-lg object-cover max-h-96'
            />
          ) : (
            <div className='grid grid-cols-2 gap-2'>
              {post.media.images
                .slice(0, 4)
                .map((image: string, index: number) => (
                  <div key={index} className='relative'>
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className='w-full h-32 rounded-lg object-cover'
                    />
                    {index === 3 && post.media.images.length > 4 && (
                      <div className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center'>
                        <span className='text-white font-semibold text-lg'>
                          +{post.media.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center space-x-6'>
          {/* Like Button */}
          <button
            onClick={() => handleLikePost(post.id)}
            className={cn(
              'flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors',
              post.isLiked && 'text-red-500 dark:text-red-400'
            )}
          >
            {post.isLiked ? (
              <HeartSolidIcon className='w-5 h-5' />
            ) : (
              <HeartIcon className='w-5 h-5' />
            )}
            <span className='text-sm font-medium'>
              {post.stats?.likeCount || 0}
            </span>
          </button>

          {/* Comment Button */}
          <button className='flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>
            <ChatBubbleLeftIcon className='w-5 h-5' />
            <span className='text-sm font-medium'>
              {post.stats?.commentCount || 0}
            </span>
          </button>

          {/* Share Button */}
          <button className='flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors'>
            <ShareIcon className='w-5 h-5' />
            <span className='text-sm font-medium'>
              {post.stats?.shareCount || 0}
            </span>
          </button>
        </div>

        {/* Save Button */}
        <button className='p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors'>
          <BookmarkIcon className='w-5 h-5' />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Feed Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Feed Social
          </h2>

          {showCreatePost && isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium'
            >
              Crear Publicación
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className='flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg'>
          {[
            { id: 'all', label: 'Todo' },
            { id: 'events', label: 'Eventos' },
            { id: 'tribes', label: 'Tribus' },
            { id: 'following', label: 'Siguiendo' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() =>
                setActiveFilter(
                  filter.id as 'all' | 'events' | 'tribes' | 'following'
                )
              }
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeFilter === filter.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div className='space-y-6'>
        {isLoading ? (
          <div className='text-center py-12'>
            <div className='w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <p className='text-gray-500 dark:text-gray-400'>
              Cargando publicaciones...
            </p>
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <p className='text-red-500 dark:text-red-400 mb-4'>
              Error al cargar las publicaciones: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
            >
              Reintentar
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
              <PhotoIcon className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No hay publicaciones
            </h3>
            <p className='text-gray-500 dark:text-gray-400 mb-4'>
              {activeFilter === 'following'
                ? 'Sigue a más usuarios para ver sus publicaciones'
                : 'Sé el primero en crear una publicación'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
              >
                Crear Publicación
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>{filteredPosts.map(renderPost)}</AnimatePresence>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default SocialFeed;

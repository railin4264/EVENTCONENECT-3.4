'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useTribes } from '@/hooks/useTribes';
import { useUsers } from '@/hooks/useUsers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'tribes' | 'users'>('all');
  const router = useRouter();

  const { events, isLoading: eventsLoading } = useEvents({ search: query });
  const { tribes, isLoading: tribesLoading } = useTribes({ search: query });
  const { users, isLoading: usersLoading } = useUsers({ search: query });

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleResultClick = (type: string, id: string) => {
    onClose();
    router.push(`/${type}/${id}`);
  };

  const tabs = [
    { id: 'all', label: 'Todo', count: events.length + tribes.length + users.length },
    { id: 'events', label: 'Eventos', count: events.length },
    { id: 'tribes', label: 'Tribus', count: tribes.length },
    { id: 'users', label: 'Usuarios', count: users.length },
  ];

  const renderEventResult = (event: any) => (
    <div
      key={event.id}
      onClick={() => handleResultClick('events', event.id)}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
        <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {event.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {event.host.firstName} {event.host.lastName}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <MapPinIcon className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {event.location.city}
          </span>
          <CalendarDaysIcon className="w-3 h-3 text-gray-400 ml-2" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(event.dateTime.start), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
      </div>
    </div>
  );

  const renderTribeResult = (tribe: any) => (
    <div
      key={tribe.id}
      onClick={() => handleResultClick('tribes', tribe.id)}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-lg flex items-center justify-center">
        <UsersIcon className="w-6 h-6 text-secondary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {tribe.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {tribe.description}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <UsersIcon className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tribe.stats.memberCount} miembros
          </span>
          <StarIcon className="w-3 h-3 text-gray-400 ml-2" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tribe.category}
          </span>
        </div>
      </div>
    </div>
  );

  const renderUserResult = (user: any) => (
    <div
      key={user.id}
      onClick={() => handleResultClick('users', user.id)}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-primary-100 rounded-full flex items-center justify-center">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <span className="text-lg font-bold text-accent-600">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user.firstName} {user.lastName}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          @{user.username}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.interests.slice(0, 2).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (activeTab === 'all' || activeTab === 'events') {
      return events.map(renderEventResult);
    }
    if (activeTab === 'all' || activeTab === 'tribes') {
      return tribes.map(renderTribeResult);
    }
    if (activeTab === 'all' || activeTab === 'users') {
      return users.map(renderUserResult);
    }
    return null;
  };

  const isLoading = eventsLoading || tribesLoading || usersLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Buscar en EventConnect
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos, tribus, usuarios..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {query.length === 0 ? (
                <div className="text-center py-8">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Escribe algo para buscar...
                  </p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Buscando...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderResults()}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
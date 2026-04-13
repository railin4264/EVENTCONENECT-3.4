'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface WatchlistItem {
  _id: string;
  eventId: string;
  event: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    coverImage?: string;
  };
  addedAt: string;
}

export default function WatchlistPage() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchWatchlist();
    }
  }, [mounted, user]);

  const fetchWatchlist = async () => {
    try {
      const response = await apiService.get('/api/watchlist');
      setWatchlist(response.data || []);
    } catch (error) {
      toast.error('Error cargando watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const removeFromWatchlist = async (eventId: string) => {
    try {
      await apiService.delete(`/api/watchlist/${eventId}`);
      setWatchlist(watchlist.filter(item => item.event._id !== eventId));
      toast.success('Evento removido del watchlist');
    } catch (error) {
      toast.error('Error removiendo evento del watchlist');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading during SSR or initial mount
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tu watchlist.</p>
        </div>
      </div>
    );
  }

  if (watchlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Watchlist</h1>
          <Link
            href="/events"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explorar Eventos
          </Link>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tu watchlist está vacía</h2>
            <p className="text-gray-600 mb-6">
              Guarda eventos que te interesen para verlos más tarde.
            </p>
            <Link
              href="/events"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Eventos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {item.event.coverImage && (
                  <img
                    src={item.event.coverImage}
                    alt={item.event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📅</span>
                      <span>{formatDate(item.event.startDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📍</span>
                      <span>{item.event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/events/${item.event._id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalles
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(item.event._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remover de watchlist"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
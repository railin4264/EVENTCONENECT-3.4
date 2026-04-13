'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { toast } from 'react-hot-toast';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Review {
  _id: string;
  eventId: string;
  eventTitle: string;
  rating: number;
  content: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  likes: string[];
  createdAt: string;
}

export default function ReviewsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my-reviews' | 'high-rating'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchReviews();
    }
  }, [mounted, user, filter]);

  const fetchReviews = async () => {
    try {
      const params = filter === 'my-reviews' ? { user: user?._id } : 
                    filter === 'high-rating' ? { minRating: 4 } : {};
      const response = await apiService.get('/api/reviews', { params });
      setReviews(response.data || []);
    } catch (error) {
      toast.error('Error cargando reseñas');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      await apiService.post(`/api/reviews/${reviewId}/like`);
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, likes: review.likes.includes(user?._id || '') 
              ? review.likes.filter(id => id !== user?._id)
              : [...review.likes, user?._id || '']
            }
          : review
      ));
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
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
          <p className="text-gray-600">Debes iniciar sesión para ver las reseñas.</p>
        </div>
      </div>
    );
  }

  if (reviewsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Reseñas de Eventos</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'my-reviews' | 'high-rating')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las reseñas</option>
              <option value="my-reviews">Mis reseñas</option>
              <option value="high-rating">Alta calificación</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {review.user.firstName[0]}{review.user.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {review.user.firstName} {review.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">({review.rating}/5)</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-blue-600 mb-2">{review.eventTitle}</h4>
                <p className="text-gray-700">{review.content}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(review._id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    review.likes.includes(user?._id || '')
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>❤️</span>
                  <span>{review.likes.length} likes</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay reseñas disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
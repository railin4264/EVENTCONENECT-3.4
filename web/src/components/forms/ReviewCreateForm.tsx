'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Image as ImageIcon, X, Upload, ThumbsUp, MessageCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// Schema de validación
const reviewSchema = z.object({
  rating: z.number().min(1, 'La puntuación es requerida').max(5, 'La puntuación máxima es 5'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'El título es muy largo'),
  content: z.string().min(10, 'La reseña debe tener al menos 10 caracteres'),
  images: z.array(z.string()).optional(),
  isAnonymous: z.boolean().default(false),
  helpful: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewCreateFormProps {
  eventId?: string; // Para reviews de eventos
  tribeId?: string; // Para reviews de tribus
  postId?: string; // Para reviews de posts
  onSuccess?: (review: any) => void;
  onCancel?: () => void;
}

export default function ReviewCreateForm({ 
  eventId, 
  tribeId, 
  postId, 
  onSuccess, 
  onCancel 
}: ReviewCreateFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      isAnonymous: false,
      helpful: false,
      tags: [],
      images: [],
    },
  });

  // Mutación para crear review
  const createReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      if (eventId) {
        return api.reviews.createEventReview(eventId, data);
      } else if (tribeId) {
        return api.reviews.createTribeReview(tribeId, data);
      } else if (postId) {
        return api.reviews.createPostReview(postId, data);
      }
      throw new Error('No se especificó el tipo de review');
    },
    onSuccess: (data) => {
      // Invalidar queries relevantes
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-reviews', eventId] });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      } else if (tribeId) {
        queryClient.invalidateQueries({ queryKey: ['tribe-reviews', tribeId] });
        queryClient.invalidateQueries({ queryKey: ['tribe', tribeId] });
      } else if (postId) {
        queryClient.invalidateQueries({ queryKey: ['post-reviews', postId] });
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
      
      onSuccess?.(data);
      reset();
      setUploadedImages([]);
      setRating(0);
    },
    onError: (error) => {
      console.error('Error creating review:', error);
    },
  });

  // Upload de imágenes
  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await api.upload.uploadImage(formData);
        return response.url;
      });

      const urls = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...urls];
      setUploadedImages(newImages);
      setValue('images', newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remover imagen
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue('images', newImages);
  };

  // Agregar tag
  const [newTag, setNewTag] = useState('');
  const addTag = () => {
    if (newTag.trim() && !watch('tags')?.includes(newTag.trim())) {
      const currentTags = watch('tags') || [];
      setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    const currentTags = watch('tags') || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Manejar rating
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating);
  };

  const getReviewType = () => {
    if (eventId) return 'evento';
    if (tribeId) return 'tribu';
    if (postId) return 'post';
    return 'elemento';
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await createReviewMutation.mutateAsync({
        ...data,
        rating,
        images: uploadedImages,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Reseña</h2>
        <p className="text-gray-600">Comparte tu experiencia sobre este {getReviewType()}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Puntuación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Star className="inline w-4 h-4 mr-2" />
            Puntuación *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating} estrella${rating > 1 ? 's' : ''}` : 'Selecciona una puntuación'}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Reseña *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resume tu experiencia en pocas palabras..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageCircle className="inline w-4 h-4 mr-2" />
            Tu Reseña *
          </label>
          <textarea
            {...register('content')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Comparte los detalles de tu experiencia. ¿Qué te gustó? ¿Qué podría mejorar? ¿Recomendarías este elemento a otros?"
          />
          <p className="mt-1 text-xs text-gray-500">
            Sé específico y constructivo en tu feedback
          </p>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Opcional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {watch('tags')?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agregar tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Agregar
            </button>
          </div>
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
          )}
        </div>

        {/* Upload de Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="inline w-4 h-4 mr-2" />
            Imágenes (Opcional)
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {isUploading ? 'Subiendo...' : 'Haz clic para subir imágenes'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PNG, JPG hasta 5MB cada una
              </span>
            </label>
          </div>

          {/* Imágenes subidas */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <input
              {...register('isAnonymous')}
              type="checkbox"
              id="isAnonymous"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700">
              <MessageCircle className="inline w-4 h-4 mr-2" />
              Reseña Anónima
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('helpful')}
              type="checkbox"
              id="helpful"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="helpful" className="text-sm font-medium text-gray-700">
              <ThumbsUp className="inline w-4 h-4 mr-2" />
              Marcar como Útil
            </label>
          </div>
        </div>

        {/* Consejos para una buena reseña */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para una buena reseña:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sé específico sobre lo que te gustó o no te gustó</li>
            <li>• Incluye detalles relevantes para otros usuarios</li>
            <li>• Mantén un tono constructivo y respetuoso</li>
            <li>• Si es posible, incluye fotos de tu experiencia</li>
          </ul>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading || rating === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando...' : 'Publicar Reseña'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, X, Upload, Edit3 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// Schema de validación
const eventSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  date: z.string().min(1, 'La fecha es requerida'),
  time: z.string().min(1, 'La hora es requerida'),
  location: z.string().min(5, 'La ubicación debe tener al menos 5 caracteres'),
  maxAttendees: z.number().min(1, 'Debe haber al menos 1 asistente').max(1000, 'Máximo 1000 asistentes'),
  category: z.string().min(1, 'La categoría es requerida'),
  price: z.number().min(0, 'El precio no puede ser negativo').optional(),
  isFree: z.boolean().default(true),
  tags: z.array(z.string()).min(1, 'Al menos 1 tag es requerido'),
  images: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventEditFormProps {
  event: any; // Evento a editar
  onSuccess?: (event: any) => void;
  onCancel?: () => void;
}

export default function EventEditForm({ event, onSuccess, onCancel }: EventEditFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(event?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event?.time || '',
      location: event?.location || '',
      maxAttendees: event?.maxAttendees || 100,
      category: event?.category || '',
      price: event?.price || 0,
      isFree: event?.isFree ?? true,
      tags: event?.tags || [],
      images: event?.images || [],
    },
  });

  const isFree = watch('isFree');

  // Cargar datos del evento cuando cambie
  useEffect(() => {
    if (event) {
      reset({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        location: event.location || '',
        maxAttendees: event.maxAttendees || 100,
        category: event.category || '',
        price: event.price || 0,
        isFree: event.isFree ?? true,
        tags: event.tags || [],
        images: event.images || [],
      });
      setUploadedImages(event.images || []);
    }
  }, [event, reset]);

  // Mutación para actualizar evento
  const updateEventMutation = useMutation({
    mutationFn: (data: EventFormData) => api.events.updateEvent(event.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Error updating event:', error);
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

  const onSubmit = async (data: EventFormData) => {
    try {
      await updateEventMutation.mutateAsync({
        ...data,
        images: uploadedImages,
        price: isFree ? 0 : data.price,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se encontró el evento a editar</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Edit3 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Evento</h2>
            <p className="text-gray-600">Modifica la información de tu evento</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título y Descripción */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Evento *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Meetup de Desarrollo Web"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              <option value="technology">Tecnología</option>
              <option value="business">Negocios</option>
              <option value="music">Música</option>
              <option value="sports">Deportes</option>
              <option value="education">Educación</option>
              <option value="health">Salud</option>
              <option value="entertainment">Entretenimiento</option>
              <option value="other">Otro</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe tu evento en detalle..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Fecha, Hora y Ubicación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Fecha *
            </label>
            <input
              {...register('date')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Hora *
            </label>
            <input
              {...register('time')}
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-2" />
              Máximo Asistentes *
            </label>
            <input
              {...register('maxAttendees', { valueAsNumber: true })}
              type="number"
              min="1"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
            {errors.maxAttendees && (
              <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Ubicación *
          </label>
          <input
            {...register('location')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dirección completa del evento"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Precio */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                {...register('isFree')}
                type="checkbox"
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Evento Gratuito</span>
            </label>
          </div>

          {!isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (USD)
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="19.99"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
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
            Imágenes del Evento
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
                    alt={`Evento ${index + 1}`}
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
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}

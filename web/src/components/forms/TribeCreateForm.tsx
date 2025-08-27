'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Image as ImageIcon, X, Upload, Hash, Globe, Lock, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// Schema de validación
const tribeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'La categoría es requerida'),
  privacy: z.enum(['public', 'private', 'secret']).default('public'),
  maxMembers: z.number().min(5, 'Mínimo 5 miembros').max(10000, 'Máximo 10,000 miembros'),
  tags: z.array(z.string()).min(1, 'Al menos 1 tag es requerido'),
  images: z.array(z.string()).optional(),
  rules: z.string().min(10, 'Las reglas deben tener al menos 10 caracteres'),
  location: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

type TribeFormData = z.infer<typeof tribeSchema>;

interface TribeCreateFormProps {
  onSuccess?: (tribe: any) => void;
  onCancel?: () => void;
}

export default function TribeCreateForm({ onSuccess, onCancel }: TribeCreateFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TribeFormData>({
    resolver: zodResolver(tribeSchema),
    defaultValues: {
      privacy: 'public',
      maxMembers: 100,
      tags: [],
      images: [],
      rules: '1. Respetar a todos los miembros\n2. No spam ni contenido inapropiado\n3. Mantener conversaciones constructivas\n4. Seguir las reglas de la comunidad',
    },
  });

  const privacy = watch('privacy');

  // Mutación para crear tribu
  const createTribeMutation = useMutation({
    mutationFn: (data: TribeFormData) => api.tribes.createTribe(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      onSuccess?.(data);
      reset();
      setUploadedImages([]);
    },
    onError: (error) => {
      console.error('Error creating tribe:', error);
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

  const onSubmit = async (data: TribeFormData) => {
    try {
      await createTribeMutation.mutateAsync({
        ...data,
        images: uploadedImages,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'public':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-yellow-600" />;
      case 'secret':
        return <Lock className="w-4 h-4 text-red-600" />;
      default:
        return <Eye className="w-4 h-4 text-green-600" />;
    }
  };

  const getPrivacyDescription = () => {
    switch (privacy) {
      case 'public':
        return 'Cualquiera puede ver y unirse a la tribu';
      case 'private':
        return 'Cualquiera puede ver la tribu, pero necesitas aprobación para unirte';
      case 'secret':
        return 'Solo los miembros pueden ver la tribu';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nueva Tribu</h2>
        <p className="text-gray-600">Construye una comunidad alrededor de tus intereses</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre y Categoría */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-2" />
              Nombre de la Tribu *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Desarrolladores Web"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
              <option value="gaming">Gaming</option>
              <option value="art">Arte</option>
              <option value="food">Comida</option>
              <option value="travel">Viajes</option>
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
            placeholder="Describe el propósito y objetivos de tu tribu..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Privacidad y Miembros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-2" />
              Privacidad *
            </label>
            <select
              {...register('privacy')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Pública</option>
              <option value="private">Privada</option>
              <option value="secret">Secreta</option>
            </select>
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
              {getPrivacyIcon()}
              <span>{getPrivacyDescription()}</span>
            </div>
            {errors.privacy && (
              <p className="mt-1 text-sm text-red-600">{errors.privacy.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-2" />
              Máximo Miembros *
            </label>
            <input
              {...register('maxMembers', { valueAsNumber: true })}
              type="number"
              min="5"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
            {errors.maxMembers && (
              <p className="mt-1 text-sm text-red-600">{errors.maxMembers.message}</p>
            )}
          </div>
        </div>

        {/* Ubicación y Website */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              Ubicación (Opcional)
            </label>
            <input
              {...register('location')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ciudad, País"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              Sitio Web (Opcional)
            </label>
            <input
              {...register('website')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </div>

        {/* Reglas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reglas de la Tribu *
          </label>
          <textarea
            {...register('rules')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Establece las reglas y normas para los miembros..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Las reglas ayudan a mantener un ambiente positivo en tu tribu
          </p>
          {errors.rules && (
            <p className="mt-1 text-sm text-red-600">{errors.rules.message}</p>
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
            Imágenes de la Tribu
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
                    alt={`Tribu ${index + 1}`}
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
            {isSubmitting ? 'Creando...' : 'Crear Tribu'}
          </button>
        </div>
      </form>
    </div>
  );
}

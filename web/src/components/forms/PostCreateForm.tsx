'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image as ImageIcon, X, Upload, Hash, Users, Video, FileText, Smile } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// Schema de validación
const postSchema = z.object({
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  type: z.enum(['text', 'image', 'video', 'link']).default('text'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  link: z.string().url('URL inválida').optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  tribeId: z.string().optional(), // Para posts en tribus específicas
});

type PostFormData = z.infer<typeof postSchema>;

interface PostCreateFormProps {
  onSuccess?: (post: any) => void;
  onCancel?: () => void;
  tribeId?: string; // Si se está creando un post en una tribu específica
}

export default function PostCreateForm({ onSuccess, onCancel, tribeId }: PostCreateFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'link'>('text');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: 'text',
      isPublic: true,
      allowComments: true,
      tags: [],
      images: [],
      videos: [],
      tribeId,
    },
  });

  const watchedType = watch('type');

  // Mutación para crear post
  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) => api.posts.createPost(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (tribeId) {
        queryClient.invalidateQueries({ queryKey: ['tribe-posts', tribeId] });
      }
      onSuccess?.(data);
      reset();
      setUploadedImages([]);
      setUploadedVideos([]);
    },
    onError: (error) => {
      console.error('Error creating post:', error);
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

  // Upload de videos
  const handleVideoUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('video', file);
        
        const response = await api.upload.uploadVideo(formData);
        return response.url;
      });

      const urls = await Promise.all(uploadPromises);
      const newVideos = [...uploadedVideos, ...urls];
      setUploadedVideos(newVideos);
      setValue('videos', newVideos);
    } catch (error) {
      console.error('Error uploading videos:', error);
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

  // Remover video
  const removeVideo = (index: number) => {
    const newVideos = uploadedVideos.filter((_, i) => i !== index);
    setUploadedVideos(newVideos);
    setValue('videos', newVideos);
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

  // Cambiar tipo de post
  const handleTypeChange = (type: 'text' | 'image' | 'video' | 'link') => {
    setPostType(type);
    setValue('type', type);
    // Limpiar campos no relevantes
    if (type !== 'image') {
      setUploadedImages([]);
      setValue('images', []);
    }
    if (type !== 'video') {
      setUploadedVideos([]);
      setValue('videos', []);
    }
    if (type !== 'link') {
      setValue('link', '');
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      await createPostMutation.mutateAsync({
        ...data,
        type: postType,
        images: uploadedImages,
        videos: uploadedVideos,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nuevo Post</h2>
        <p className="text-gray-600">Comparte tus pensamientos, imágenes o videos con la comunidad</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de Post */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Post
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'text', icon: FileText, label: 'Texto', color: 'bg-blue-100 text-blue-800' },
              { type: 'image', icon: ImageIcon, label: 'Imagen', color: 'bg-green-100 text-green-800' },
              { type: 'video', icon: Video, label: 'Video', color: 'bg-purple-100 text-purple-800' },
              { type: 'link', icon: Hash, label: 'Enlace', color: 'bg-orange-100 text-orange-800' },
            ].map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type as any)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  postType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className={`w-6 h-6 ${postType === type ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${postType === type ? 'text-blue-600' : 'text-gray-700'}`}>
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Título (opcional para posts de texto) */}
        {postType === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título (Opcional)
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título de tu post..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
        )}

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido *
          </label>
          <textarea
            {...register('content')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              postType === 'text'
                ? 'Escribe tu post aquí...'
                : postType === 'image'
                ? 'Describe las imágenes que estás compartiendo...'
                : postType === 'video'
                ? 'Describe el video que estás compartiendo...'
                : 'Describe el enlace que estás compartiendo...'
            }
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Enlace (solo para posts de tipo link) */}
        {postType === 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-2" />
              Enlace *
            </label>
            <input
              {...register('link')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com"
            />
            {errors.link && (
              <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>
            )}
          </div>
        )}

        {/* Upload de Imágenes (solo para posts de tipo image) */}
        {postType === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="inline w-4 h-4 mr-2" />
              Imágenes
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
                      alt={`Post ${index + 1}`}
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
        )}

        {/* Upload de Videos (solo para posts de tipo video) */}
        {postType === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video className="inline w-4 h-4 mr-2" />
              Videos
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => e.target.files && handleVideoUpload(e.target.files)}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Subiendo...' : 'Haz clic para subir videos'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  MP4, MOV hasta 100MB cada uno
                </span>
              </label>
            </div>

            {/* Videos subidos */}
            {uploadedVideos.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedVideos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video
                      src={video}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="inline w-4 h-4 mr-2" />
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

        {/* Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <input
              {...register('isPublic')}
              type="checkbox"
              id="isPublic"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
              <Users className="inline w-4 h-4 mr-2" />
              Post Público
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('allowComments')}
              type="checkbox"
              id="allowComments"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowComments" className="text-sm font-medium text-gray-700">
              <Smile className="inline w-4 h-4 mr-2" />
              Permitir Comentarios
            </label>
          </div>
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
            {isSubmitting ? 'Creando...' : 'Crear Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

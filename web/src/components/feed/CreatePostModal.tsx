'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => Promise<void>;
}

const CreatePostModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) => {
  const { user: _user } = useAuth();
  const { location: userLocation } = useGeolocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'event' | 'tribe' | 'location' | 'general',
    tags: [] as string[],
    mentions: [] as string[],
    isPublic: true,
  });

  const [media, setMedia] = useState<{
    images: File[];
    videos: File[];
  }>({
    images: [],
    videos: [],
  });

  const [location, setLocation] = useState<{
    coordinates: [number, number] | null;
    address: string;
    city: string;
    country: string;
  }>({
    coordinates: null,
    address: '',
    city: '',
    country: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      tags: [],
      mentions: [],
      isPublic: true,
    });
    setMedia({ images: [], videos: [] });
    setLocation({
      coordinates: null,
      address: '',
      city: '',
      country: '',
    });
    setErrors({});
    onClose();
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle media file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages: File[] = [];
    const newVideos: File[] = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
      } else if (file.type.startsWith('video/')) {
        newVideos.push(file);
      }
    });

    setMedia(prev => ({
      images: [...prev.images, ...newImages],
      videos: [...prev.videos, ...newVideos],
    }));
  };

  // Remove media file
  const removeMedia = (type: 'image' | 'video', index: number) => {
    if (type === 'image') {
      setMedia(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setMedia(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index),
      }));
    }
  };

  // Handle tag input
  const handleTagInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      const newTag = event.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      event.currentTarget.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Handle mention input
  const handleMentionInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      const newMention = event.currentTarget.value.trim();
      if (!formData.mentions.includes(newMention)) {
        setFormData(prev => ({
          ...prev,
          mentions: [...prev.mentions, newMention],
        }));
      }
      event.currentTarget.value = '';
    }
  };

  // Remove mention
  const removeMention = (mentionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      mentions: prev.mentions.filter(mention => mention !== mentionToRemove),
    }));
  };

  // Use current location
  const useCurrentLocation = () => {
    if (userLocation) {
      setLocation(prev => ({
        ...prev,
        coordinates: [userLocation.latitude, userLocation.longitude],
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors['content'] = 'El contenido es obligatorio';
    }

    if (formData.content.length > 1000) {
      newErrors['content'] = 'El contenido no puede exceder 1000 caracteres';
    }

    if (formData.title && formData.title.length > 100) {
      newErrors['title'] = 'El título no puede exceder 100 caracteres';
    }

    if (formData.tags.length > 10) {
      newErrors['tags'] = 'No puedes agregar más de 10 etiquetas';
    }

    if (formData.mentions.length > 20) {
      newErrors['mentions'] = 'No puedes mencionar más de 20 usuarios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const postData = {
        ...formData,
        media: {
          images: media.images.map(file => URL.createObjectURL(file)),
          videos: media.videos.map(file => URL.createObjectURL(file)),
        },
        location: location.coordinates
          ? {
              ...location,
              coordinates: location.coordinates,
            }
          : undefined,
      };

      await onSubmit(postData);
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Crear Publicación
              </h2>
              <button
                onClick={handleClose}
                className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <XMarkIcon className='w-5 h-5' />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='p-6 space-y-6'>
              {/* Post Type Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Tipo de Publicación
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { value: 'general', label: 'General', icon: '📝' },
                    { value: 'event', label: 'Evento', icon: '📅' },
                    { value: 'tribe', label: 'Tribu', icon: '👥' },
                    { value: 'location', label: 'Ubicación', icon: '📍' },
                  ].map(type => (
                    <button
                      key={type.value}
                      type='button'
                      onClick={() => handleInputChange('type', type.value)}
                      className={cn(
                        'p-3 border-2 rounded-lg text-center transition-colors',
                        formData.type === type.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      )}
                    >
                      <div className='text-2xl mb-1'>{type.icon}</div>
                      <div className='text-sm font-medium'>{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              {formData.type !== 'general' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Título
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder='Título de la publicación...'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    maxLength={100}
                  />
                  {errors['title'] && (
                    <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                      {errors['title']}
                    </p>
                  )}
                </div>
              )}

              {/* Content Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Contenido
                </label>
                <textarea
                  value={formData.content}
                  onChange={e => handleInputChange('content', e.target.value)}
                  placeholder='¿Qué quieres compartir?'
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                  maxLength={1000}
                />
                <div className='flex justify-between items-center mt-1'>
                  {errors['content'] && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors['content']}
                    </p>
                  )}
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {formData.content.length}/1000
                  </span>
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Medios
                </label>
                <div className='space-y-3'>
                  {/* Upload Button */}
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                  >
                    <div className='flex flex-col items-center space-y-2'>
                      <PhotoIcon className='w-8 h-8' />
                      <span>Haz clic para subir imágenes o videos</span>
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    accept='image/*,video/*'
                    onChange={handleFileSelect}
                    className='hidden'
                  />

                  {/* Selected Media Preview */}
                  {media.images.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Imágenes
                      </h4>
                      <div className='grid grid-cols-3 gap-2'>
                        {media.images.map((file, index) => (
                          <div key={index} className='relative'>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className='w-full h-24 object-cover rounded-lg'
                            />
                            <button
                              type='button'
                              onClick={() => removeMedia('image', index)}
                              className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {media.videos.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Videos
                      </h4>
                      <div className='space-y-2'>
                        {media.videos.map((file, index) => (
                          <div key={index} className='relative'>
                            <video
                              src={URL.createObjectURL(file)}
                              className='w-full h-32 object-cover rounded-lg'
                              controls
                            />
                            <button
                              type='button'
                              onClick={() => removeMedia('video', index)}
                              className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {formData.type === 'location' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Ubicación
                  </label>
                  <div className='space-y-3'>
                    <div className='flex space-x-2'>
                      <button
                        type='button'
                        onClick={useCurrentLocation}
                        className='px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-sm font-medium'
                      >
                        <MapPinIcon className='w-4 h-4 inline mr-1' />
                        Usar ubicación actual
                      </button>
                    </div>

                    <input
                      type='text'
                      value={location.address}
                      onChange={e =>
                        setLocation(prev => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder='Dirección'
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    />

                    <div className='grid grid-cols-2 gap-3'>
                      <input
                        type='text'
                        value={location.city}
                        onChange={e =>
                          setLocation(prev => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder='Ciudad'
                        className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      />
                      <input
                        type='text'
                        value={location.country}
                        onChange={e =>
                          setLocation(prev => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                        placeholder='País'
                        className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Etiquetas
                </label>
                <input
                  type='text'
                  onKeyDown={handleTagInput}
                  placeholder='Presiona Enter para agregar etiquetas...'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                />
                {formData.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className='px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center space-x-1'
                      >
                        <span>#{tag}</span>
                        <button
                          type='button'
                          onClick={() => removeTag(tag)}
                          className='hover:text-primary-900 dark:hover:text-primary-100'
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors['tags'] && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors['tags']}
                  </p>
                )}
              </div>

              {/* Mentions */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Menciones
                </label>
                <input
                  type='text'
                  onKeyDown={handleMentionInput}
                  placeholder='Presiona Enter para agregar menciones...'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                />
                {formData.mentions.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {formData.mentions.map(mention => (
                      <span
                        key={mention}
                        className='px-2 py-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full text-sm flex items-center space-x-1'
                      >
                        <span>@{mention}</span>
                        <button
                          type='button'
                          onClick={() => removeMention(mention)}
                          className='hover:text-secondary-900 dark:hover:text-secondary-100'
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors['mentions'] && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors['mentions']}
                  </p>
                )}
              </div>

              {/* Privacy Settings */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Privacidad
                </label>
                <div className='flex space-x-3'>
                  {[
                    {
                      value: true,
                      label: 'Pública',
                      icon: '📍',
                      color: 'text-green-600',
                    },
                    {
                      value: false,
                      label: 'Privada',
                      icon: '🔒',
                      color: 'text-yellow-600',
                    },
                  ].map(option => (
                    <button
                      key={option.value.toString()}
                      type='button'
                      onClick={() =>
                        handleInputChange('isPublic', option.value)
                      }
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 border-2 rounded-lg transition-colors',
                        formData.isPublic === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      )}
                    >
                      <span className={cn('w-4 h-4', option.color)}>
                        {option.icon}
                      </span>
                      <span className='text-sm font-medium'>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'
                >
                  {isSubmitting ? 'Creando...' : 'Crear Publicación'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;

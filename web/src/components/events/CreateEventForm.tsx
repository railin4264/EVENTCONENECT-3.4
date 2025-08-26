'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon,
  MapPinIcon,
  PhotoIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { eventsAPI } from '@/services/api';

// ===== INTERFACES =====
interface EventFormData {
  // Información básica
  title: string;
  description: string;
  category: string;
  tags: string[];
  
  // Fecha y hora
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  
  // Ubicación
  location: {
    type: 'physical' | 'virtual' | 'hybrid';
    address?: string;
    coordinates?: { lat: number; lng: number };
    venue?: string;
    virtualLink?: string;
    instructions?: string;
  };
  
  // Configuración
  capacity: number | null;
  isPrivate: boolean;
  requiresApproval: boolean;
  price: number;
  currency: string;
  
  // Media
  coverImage: File | null;
  additionalImages: File[];
  
  // Organizador
  organizer: {
    type: 'individual' | 'tribe';
    tribeId?: string;
  };
  
  // Configuraciones avanzadas
  ageRestriction: {
    hasRestriction: boolean;
    minAge?: number;
    maxAge?: number;
  };
  cancellationPolicy: string;
  refundPolicy: string;
  
  // Recurrencia
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    occurrences?: number;
  };
}

interface CreateEventFormProps {
  onSuccess?: (event: any) => void;
  onCancel?: () => void;
  initialData?: Partial<EventFormData>;
  mode?: 'create' | 'edit';
  eventId?: string;
}

// ===== CREATE EVENT FORM COMPONENT =====
export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  mode = 'create',
  eventId
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);

  // ===== FORM DATA =====
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: {
      type: 'physical'
    },
    capacity: null,
    isPrivate: false,
    requiresApproval: false,
    price: 0,
    currency: 'USD',
    coverImage: null,
    additionalImages: [],
    organizer: {
      type: 'individual'
    },
    ageRestriction: {
      hasRestriction: false
    },
    cancellationPolicy: 'flexible',
    refundPolicy: 'full',
    isRecurring: false,
    ...initialData
  });

  // ===== AVAILABLE OPTIONS =====
  const categories = [
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'sports', label: 'Deportes', icon: '⚽' },
    { id: 'technology', label: 'Tecnología', icon: '💻' },
    { id: 'art', label: 'Arte', icon: '🎨' },
    { id: 'food', label: 'Gastronomía', icon: '🍔' },
    { id: 'business', label: 'Negocios', icon: '💼' },
    { id: 'education', label: 'Educación', icon: '📚' },
    { id: 'health', label: 'Salud', icon: '🏥' },
    { id: 'outdoors', label: 'Aire Libre', icon: '🏔️' },
    { id: 'social', label: 'Social', icon: '🎉' }
  ];

  const steps = [
    { 
      id: 'basic', 
      title: 'Información Básica', 
      description: 'Título, descripción y categoría',
      icon: InformationCircleIcon 
    },
    { 
      id: 'datetime', 
      title: 'Fecha y Hora', 
      description: 'Cuándo será tu evento',
      icon: CalendarIcon 
    },
    { 
      id: 'location', 
      title: 'Ubicación', 
      description: 'Dónde será tu evento',
      icon: MapPinIcon 
    },
    { 
      id: 'settings', 
      title: 'Configuración', 
      description: 'Capacidad, precio y privacidad',
      icon: UsersIcon 
    },
    { 
      id: 'media', 
      title: 'Imágenes', 
      description: 'Fotos y multimedia',
      icon: PhotoIcon 
    },
    { 
      id: 'advanced', 
      title: 'Opciones Avanzadas', 
      description: 'Configuraciones adicionales',
      icon: CurrencyDollarIcon 
    }
  ];

  // ===== VALIDATION =====
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Basic info
        if (!formData.title.trim()) newErrors.title = 'El título es requerido';
        if (formData.title.length > 100) newErrors.title = 'El título no puede exceder 100 caracteres';
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (formData.description.length > 2000) newErrors.description = 'La descripción no puede exceder 2000 caracteres';
        if (!formData.category) newErrors.category = 'La categoría es requerida';
        break;
        
      case 1: // Date/Time
        if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
        if (!formData.startTime) newErrors.startTime = 'La hora de inicio es requerida';
        if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
        if (!formData.endTime) newErrors.endTime = 'La hora de fin es requerida';
        
        // Validar que la fecha de fin sea después del inicio
        if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
          const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
          const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
          
          if (endDateTime <= startDateTime) {
            newErrors.endDate = 'La fecha de fin debe ser después del inicio';
          }
          
          if (startDateTime <= new Date()) {
            newErrors.startDate = 'El evento debe ser en el futuro';
          }
        }
        break;
        
      case 2: // Location
        if (formData.location.type === 'physical') {
          if (!formData.location.address?.trim()) {
            newErrors.address = 'La dirección es requerida para eventos presenciales';
          }
        } else if (formData.location.type === 'virtual') {
          if (!formData.location.virtualLink?.trim()) {
            newErrors.virtualLink = 'El enlace virtual es requerido para eventos virtuales';
          }
        }
        break;
        
      case 3: // Settings
        if (formData.capacity && formData.capacity < 1) {
          newErrors.capacity = 'La capacidad debe ser mayor a 0';
        }
        if (formData.price < 0) {
          newErrors.price = 'El precio no puede ser negativo';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== HANDLERS =====
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const newData = { ...prev };
        let current = newData as any;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      }
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange('tags', [...formData.tags, tag.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (files: FileList | null, type: 'cover' | 'additional') => {
    if (!files || files.length === 0) return;
    
    if (type === 'cover') {
      handleInputChange('coverImage', files[0]);
    } else {
      const newImages = Array.from(files);
      handleInputChange('additionalImages', [...formData.additionalImages, ...newImages]);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Guardar como borrador en localStorage
      const draftData = {
        ...formData,
        savedAt: new Date().toISOString(),
        mode: 'draft'
      };
      localStorage.setItem('event_draft', JSON.stringify(draftData));
      
      // También intentar guardar en el backend como borrador
      try {
        await eventsAPI.saveDraft({
          ...formData,
          status: 'draft'
        });
      } catch (error) {
        console.warn('Error saving draft to backend:', error);
      }
      
      alert('Borrador guardado exitosamente');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error guardando borrador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        startDateTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endDateTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
        status: 'published'
      };

      let response;
      if (mode === 'edit' && eventId) {
        response = await eventsAPI.updateEvent(eventId, submitData);
      } else {
        response = await eventsAPI.createEvent(submitData);
      }

      if (response.success) {
        // Limpiar borrador guardado
        localStorage.removeItem('event_draft');
        
        onSuccess?.(response.data);
        alert(`Evento ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente!`);
      } else {
        alert(response.message || 'Error al guardar el evento');
      }
    } catch (error: any) {
      console.error('Error submitting event:', error);
      alert(error.message || 'Error de conexión. Verifica tu internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOAD DRAFT ON MOUNT =====
  useEffect(() => {
    if (mode === 'create') {
      const savedDraft = localStorage.getItem('event_draft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setFormData(prev => ({ ...prev, ...draftData }));
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [mode]);

  // ===== RENDER METHODS =====
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${index <= currentStep 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                  : 'bg-white/10 text-gray-400'
                }
              `}
            >
              {index < currentStep ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  w-12 h-1 mx-2 transition-all duration-300
                  ${index < currentStep ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-white/10'}
                `}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">{steps[currentStep].title}</h3>
        <p className="text-gray-400">{steps[currentStep].description}</p>
      </div>
    </div>
  );

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Título del evento *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="¿Cómo se llama tu evento?"
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
            bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50
            ${errors.title ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
          `}
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-2 text-red-400 text-sm">{errors.title}</p>
        )}
        <p className="mt-1 text-gray-400 text-sm">{formData.title.length}/100</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe tu evento..."
          rows={4}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
            bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none
            ${errors.description ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
          `}
          maxLength={2000}
        />
        {errors.description && (
          <p className="mt-2 text-red-400 text-sm">{errors.description}</p>
        )}
        <p className="mt-1 text-gray-400 text-sm">{formData.description.length}/2000</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Categoría *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => handleInputChange('category', category.id)}
              className={`
                p-3 rounded-xl border-2 transition-all duration-300 text-left
                ${formData.category === category.id
                  ? 'border-cyan-400 bg-cyan-500/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-sm font-medium text-white">{category.label}</div>
            </motion.button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-2 text-red-400 text-sm">{errors.category}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Etiquetas
        </label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 hover:text-red-400 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </motion.span>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              placeholder="Agregar etiqueta..."
              className="flex-1 px-4 py-2 rounded-l-xl border-2 border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagAdd(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              className="rounded-l-none"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                handleTagAdd(input.value);
                input.value = '';
              }}
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Fecha de inicio *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              bg-white/5 backdrop-blur-sm text-white
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              ${errors.startDate ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
            `}
          />
          {errors.startDate && (
            <p className="mt-2 text-red-400 text-sm">{errors.startDate}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Hora de inicio *
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              bg-white/5 backdrop-blur-sm text-white
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              ${errors.startTime ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
            `}
          />
          {errors.startTime && (
            <p className="mt-2 text-red-400 text-sm">{errors.startTime}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Fecha de fin *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              bg-white/5 backdrop-blur-sm text-white
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              ${errors.endDate ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
            `}
          />
          {errors.endDate && (
            <p className="mt-2 text-red-400 text-sm">{errors.endDate}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Hora de fin *
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              bg-white/5 backdrop-blur-sm text-white
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              ${errors.endTime ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
            `}
          />
          {errors.endTime && (
            <p className="mt-2 text-red-400 text-sm">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Zona horaria
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => handleInputChange('timezone', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="America/Mexico_City">Mexico City (CDMX)</option>
          <option value="Europe/Madrid">Madrid (CET)</option>
          <option value="Europe/London">London (GMT)</option>
        </select>
      </div>

      {/* Recurring Event */}
      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
          />
          <span className="text-white font-medium">Evento recurrente</span>
        </label>

        {formData.isRecurring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Frecuencia
              </label>
              <select
                value={formData.recurrence?.frequency || 'weekly'}
                onChange={(e) => handleInputChange('recurrence.frequency', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cada
              </label>
              <input
                type="number"
                min="1"
                value={formData.recurrence?.interval || 1}
                onChange={(e) => handleInputChange('recurrence.interval', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Repeticiones
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.recurrence?.occurrences || 1}
                onChange={(e) => handleInputChange('recurrence.occurrences', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">
      {/* Location Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Tipo de evento *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'physical', label: 'Presencial', icon: '📍', description: 'En un lugar físico' },
            { value: 'virtual', label: 'Virtual', icon: '💻', description: 'Solo en línea' },
            { value: 'hybrid', label: 'Híbrido', icon: '🌐', description: 'Presencial y virtual' }
          ].map((type) => (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => handleInputChange('location.type', type.value)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 text-center
                ${formData.location.type === type.value
                  ? 'border-cyan-400 bg-cyan-500/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-medium text-white">{type.label}</div>
              <div className="text-sm text-gray-400 mt-1">{type.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Physical Location */}
      {(formData.location.type === 'physical' || formData.location.type === 'hybrid') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Dirección *
            </label>
            <input
              type="text"
              value={formData.location.address || ''}
              onChange={(e) => handleInputChange('location.address', e.target.value)}
              placeholder="Dirección completa del evento"
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                ${errors.address ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
              `}
            />
            {errors.address && (
              <p className="mt-2 text-red-400 text-sm">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Lugar/Venue (opcional)
            </label>
            <input
              type="text"
              value={formData.location.venue || ''}
              onChange={(e) => handleInputChange('location.venue', e.target.value)}
              placeholder="Nombre del lugar o venue"
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>
        </motion.div>
      )}

      {/* Virtual Location */}
      {(formData.location.type === 'virtual' || formData.location.type === 'hybrid') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Enlace virtual *
            </label>
            <input
              type="url"
              value={formData.location.virtualLink || ''}
              onChange={(e) => handleInputChange('location.virtualLink', e.target.value)}
              placeholder="https://zoom.us/j/... o enlace de la plataforma"
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                ${errors.virtualLink ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
              `}
            />
            {errors.virtualLink && (
              <p className="mt-2 text-red-400 text-sm">{errors.virtualLink}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Additional Instructions */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Instrucciones adicionales
        </label>
        <textarea
          value={formData.location.instructions || ''}
          onChange={(e) => handleInputChange('location.instructions', e.target.value)}
          placeholder="Instrucciones para llegar, códigos de acceso, etc."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
        />
      </div>
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Capacidad máxima
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.capacity === null}
              onChange={(e) => handleInputChange('capacity', e.target.checked ? null : 50)}
              className="w-4 h-4 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <span className="text-white">Sin límite</span>
          </label>
          
          {formData.capacity !== null && (
            <div className="flex-1">
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || null)}
                placeholder="Número máximo de asistentes"
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                  bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                  ${errors.capacity ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
                `}
              />
            </div>
          )}
        </div>
        {errors.capacity && (
          <p className="mt-2 text-red-400 text-sm">{errors.capacity}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Precio
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.price === 0}
              onChange={(e) => handleInputChange('price', e.target.checked ? 0 : 10)}
              className="w-4 h-4 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <span className="text-white">Gratis</span>
          </label>
          
          {formData.price > 0 && (
            <div className="flex items-center space-x-2 flex-1">
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="px-3 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MXN">MXN</option>
                <option value="COP">COP</option>
              </select>
              
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`
                  flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300
                  bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                  ${errors.price ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}
                `}
              />
            </div>
          )}
        </div>
        {errors.price && (
          <p className="mt-2 text-red-400 text-sm">{errors.price}</p>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <div className="text-white font-medium">Evento privado</div>
            <div className="text-gray-400 text-sm">Solo personas invitadas pueden ver y unirse</div>
          </div>
          <input
            type="checkbox"
            checked={formData.isPrivate}
            onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <div className="text-white font-medium">Requiere aprobación</div>
            <div className="text-gray-400 text-sm">Los asistentes deben ser aprobados por ti</div>
          </div>
          <input
            type="checkbox"
            checked={formData.requiresApproval}
            onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
          />
        </label>
      </div>
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Imagen de portada
        </label>
        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors">
          {formData.coverImage ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(formData.coverImage)}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleInputChange('coverImage', null)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <div className="text-white mb-1">Agregar imagen de portada</div>
              <div className="text-gray-400 text-sm">PNG, JPG hasta 5MB</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files, 'cover')}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Additional Images */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Imágenes adicionales (opcional)
        </label>
        <div className="space-y-4">
          {formData.additionalImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.additionalImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Additional ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.additionalImages.filter((_, i) => i !== index);
                      handleInputChange('additionalImages', newImages);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {formData.additionalImages.length < 5 && (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-white/40 transition-colors">
              <label className="cursor-pointer">
                <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-white text-sm">Agregar más imágenes</div>
                <div className="text-gray-400 text-xs">Máximo 5 imágenes</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files, 'additional')}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdvancedStep = () => (
    <div className="space-y-6">
      {/* Age Restriction */}
      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ageRestriction.hasRestriction}
            onChange={(e) => handleInputChange('ageRestriction.hasRestriction', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
          />
          <span className="text-white font-medium">Restricción de edad</span>
        </label>

        {formData.ageRestriction.hasRestriction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Edad mínima
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.ageRestriction.minAge || ''}
                onChange={(e) => handleInputChange('ageRestriction.minAge', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Edad máxima (opcional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.ageRestriction.maxAge || ''}
                onChange={(e) => handleInputChange('ageRestriction.maxAge', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Política de cancelación
          </label>
          <select
            value={formData.cancellationPolicy}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            <option value="flexible">Flexible - Hasta 24h antes</option>
            <option value="moderate">Moderada - Hasta 48h antes</option>
            <option value="strict">Estricta - Hasta 7 días antes</option>
            <option value="no_refund">Sin reembolso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Política de reembolso
          </label>
          <select
            value={formData.refundPolicy}
            onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            <option value="full">Reembolso completo</option>
            <option value="partial">Reembolso parcial (80%)</option>
            <option value="credits">Solo créditos</option>
            <option value="none">Sin reembolso</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfoStep();
      case 1: return renderDateTimeStep();
      case 2: return renderLocationStep();
      case 3: return renderSettingsStep();
      case 4: return renderMediaStep();
      case 5: return renderAdvancedStep();
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card variant="glass" className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {mode === 'edit' ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="text-sm"
              >
                {isSaving ? <LoadingSpinner size="sm" /> : 'Guardar Borrador'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Progress Bar */}
          {renderProgressBar()}
          
          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0 || isLoading}
            >
              Anterior
            </Button>
            
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" variant="neon" />
              ) : currentStep === steps.length - 1 ? (
                mode === 'edit' ? 'Actualizar Evento' : 'Crear Evento'
              ) : (
                'Siguiente'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventForm;

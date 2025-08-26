import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemedStyles } from '../../contexts/ThemeContext';
import EventsService from '../../services/EventsService';

const { width, height } = Dimensions.get('window');

// ===== INTERFACES =====
interface EventFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  startDate: Date;
  endDate: Date;
  location: {
    type: 'physical' | 'virtual' | 'hybrid';
    address?: string;
    coordinates?: { lat: number; lng: number };
    venue?: string;
    virtualLink?: string;
    instructions?: string;
  };
  capacity: number | null;
  isPrivate: boolean;
  requiresApproval: boolean;
  price: number;
  currency: string;
  coverImage: string | null;
  additionalImages: string[];
  ageRestriction: {
    hasRestriction: boolean;
    minAge?: number;
    maxAge?: number;
  };
  cancellationPolicy: string;
  refundPolicy: string;
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    occurrences: number;
  };
}

interface CreateEventScreenProps {
  navigation: any;
  route?: {
    params?: {
      eventId?: string;
      mode?: 'create' | 'edit';
      initialData?: Partial<EventFormData>;
    };
  };
}

// ===== CREATE EVENT SCREEN COMPONENT =====
export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({
  navigation,
  route
}) => {
  const styles = useThemedStyles();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract params
  const { eventId, mode = 'create', initialData } = route?.params || {};

  // ===== FORM DATA =====
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2h
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
    ageRestriction: {
      hasRestriction: false
    },
    cancellationPolicy: 'flexible',
    refundPolicy: 'full',
    isRecurring: false,
    ...initialData
  });

  // ===== DATE PICKER STATES =====
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // ===== CATEGORIES =====
  const categories = [
    { id: 'music', label: 'Música', icon: 'musical-notes', color: '#8b5cf6' },
    { id: 'sports', label: 'Deportes', icon: 'fitness', color: '#10b981' },
    { id: 'technology', label: 'Tecnología', icon: 'laptop', color: '#3b82f6' },
    { id: 'art', label: 'Arte', icon: 'color-palette', color: '#f59e0b' },
    { id: 'food', label: 'Gastronomía', icon: 'restaurant', color: '#ef4444' },
    { id: 'business', label: 'Negocios', icon: 'briefcase', color: '#6366f1' },
    { id: 'education', label: 'Educación', icon: 'school', color: '#06b6d4' },
    { id: 'health', label: 'Salud', icon: 'medical', color: '#84cc16' },
    { id: 'outdoors', label: 'Aire Libre', icon: 'leaf', color: '#22c55e' },
    { id: 'social', label: 'Social', icon: 'people', color: '#ec4899' }
  ];

  // ===== STEPS =====
  const steps = [
    { 
      id: 'basic', 
      title: 'Información Básica', 
      description: 'Título y descripción',
      icon: 'information-circle' 
    },
    { 
      id: 'category', 
      title: 'Categoría', 
      description: 'Tipo de evento',
      icon: 'apps' 
    },
    { 
      id: 'datetime', 
      title: 'Fecha y Hora', 
      description: 'Cuándo será',
      icon: 'calendar' 
    },
    { 
      id: 'location', 
      title: 'Ubicación', 
      description: 'Dónde será',
      icon: 'location' 
    },
    { 
      id: 'settings', 
      title: 'Configuración', 
      description: 'Precio y opciones',
      icon: 'settings' 
    }
  ];

  // ===== VALIDATION =====
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Basic info
        if (!formData.title.trim()) newErrors.title = 'El título es requerido';
        if (formData.title.length > 100) newErrors.title = 'Máximo 100 caracteres';
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (formData.description.length > 2000) newErrors.description = 'Máximo 2000 caracteres';
        break;
        
      case 1: // Category
        if (!formData.category) newErrors.category = 'La categoría es requerida';
        break;
        
      case 2: // Date/Time
        if (formData.startDate <= new Date()) {
          newErrors.startDate = 'El evento debe ser en el futuro';
        }
        if (formData.endDate <= formData.startDate) {
          newErrors.endDate = 'La fecha de fin debe ser después del inicio';
        }
        break;
        
      case 3: // Location
        if (formData.location.type === 'physical' && !formData.location.address?.trim()) {
          newErrors.address = 'La dirección es requerida';
        }
        if (formData.location.type === 'virtual' && !formData.location.virtualLink?.trim()) {
          newErrors.virtualLink = 'El enlace virtual es requerido';
        }
        break;
        
      case 4: // Settings
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
    
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagePicker = async (type: 'cover' | 'additional') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos permisos para acceder a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8,
        allowsMultipleSelection: type === 'additional'
      });

      if (!result.canceled) {
        Haptics.selectionAsync();
        
        if (type === 'cover') {
          handleInputChange('coverImage', result.assets[0].uri);
        } else {
          const newImages = result.assets.map(asset => asset.uri);
          handleInputChange('additionalImages', [...formData.additionalImages, ...newImages]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleLocationPicker = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos permisos de ubicación');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (address.length > 0) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        
        handleInputChange('location.address', fullAddress);
        handleInputChange('location.coordinates', {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
        
        Haptics.selectionAsync();
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: string) => {
    const currentDate = selectedDate || formData.startDate;
    
    switch (type) {
      case 'startDate':
        setShowStartDatePicker(false);
        handleInputChange('startDate', currentDate);
        break;
      case 'endDate':
        setShowEndDatePicker(false);
        handleInputChange('endDate', currentDate);
        break;
      case 'startTime':
        setShowStartTimePicker(false);
        const newStartDate = new Date(formData.startDate);
        newStartDate.setHours(currentDate.getHours(), currentDate.getMinutes());
        handleInputChange('startDate', newStartDate);
        break;
      case 'endTime':
        setShowEndTimePicker(false);
        const newEndDate = new Date(formData.endDate);
        newEndDate.setHours(currentDate.getHours(), currentDate.getMinutes());
        handleInputChange('endDate', newEndDate);
        break;
    }
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await EventsService.saveDraft({
        ...formData,
        status: 'draft'
      });
      
      Alert.alert('Éxito', 'Borrador guardado exitosamente');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', error.message || 'Error guardando borrador');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      const submitData = {
        ...formData,
        startDateTime: formData.startDate.toISOString(),
        endDateTime: formData.endDate.toISOString(),
        status: 'published'
      };

      let response;
      if (mode === 'edit' && eventId) {
        response = await EventsService.updateEvent(eventId, submitData);
      } else {
        response = await EventsService.createEvent(submitData);
      }

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          'Éxito',
          `Evento ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente`,
          [
            {
              text: 'Ver evento',
              onPress: () => {
                navigation.replace('EventDetails', { 
                  eventId: response.data.event._id 
                });
              }
            },
            {
              text: 'Ir al inicio',
              onPress: () => {
                navigation.popToTop();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Error al guardar el evento');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error('Error submitting event:', error);
      Alert.alert('Error', error.message || 'Error de conexión');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER METHODS =====
  const renderProgressBar = () => (
    <View style={componentStyles.progressContainer}>
      <View style={componentStyles.progressBar}>
        {steps.map((step, index) => (
          <View key={step.id} style={componentStyles.progressStep}>
            <View
              style={[
                componentStyles.progressCircle,
                {
                  backgroundColor: index <= currentStep ? styles.colors.primary : styles.colors.surface,
                  borderColor: index <= currentStep ? styles.colors.primary : styles.colors.text + '40',
                }
              ]}
            >
              <Ionicons 
                name={index < currentStep ? 'checkmark' : step.icon as any} 
                size={16} 
                color={index <= currentStep ? 'white' : styles.colors.text + '60'} 
              />
            </View>
            {index < steps.length - 1 && (
              <View 
                style={[
                  componentStyles.progressLine,
                  { backgroundColor: index < currentStep ? styles.colors.primary : styles.colors.surface }
                ]} 
              />
            )}
          </View>
        ))}
      </View>
      
      <Text style={[componentStyles.stepTitle, { color: styles.colors.text }]}>
        {steps[currentStep].title}
      </Text>
      <Text style={[componentStyles.stepDescription, { color: styles.colors.text + '80' }]}>
        {steps[currentStep].description}
      </Text>
    </View>
  );

  const renderBasicInfoStep = () => (
    <View style={componentStyles.stepContainer}>
      {/* Title */}
      <View style={componentStyles.inputContainer}>
        <Text style={[componentStyles.label, { color: styles.colors.text }]}>
          Título del evento *
        </Text>
        <TextInput
          style={[
            componentStyles.textInput,
            {
              backgroundColor: styles.colors.surface,
              color: styles.colors.text,
              borderColor: errors.title ? '#ef4444' : styles.colors.surface,
            }
          ]}
          value={formData.title}
          onChangeText={(text) => handleInputChange('title', text)}
          placeholder="¿Cómo se llama tu evento?"
          placeholderTextColor={styles.colors.text + '60'}
          maxLength={100}
        />
        {errors.title && (
          <Text style={componentStyles.errorText}>{errors.title}</Text>
        )}
        <Text style={[componentStyles.charCount, { color: styles.colors.text + '60' }]}>
          {formData.title.length}/100
        </Text>
      </View>

      {/* Description */}
      <View style={componentStyles.inputContainer}>
        <Text style={[componentStyles.label, { color: styles.colors.text }]}>
          Descripción *
        </Text>
        <TextInput
          style={[
            componentStyles.textArea,
            {
              backgroundColor: styles.colors.surface,
              color: styles.colors.text,
              borderColor: errors.description ? '#ef4444' : styles.colors.surface,
            }
          ]}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Describe tu evento..."
          placeholderTextColor={styles.colors.text + '60'}
          multiline
          numberOfLines={4}
          maxLength={2000}
          textAlignVertical="top"
        />
        {errors.description && (
          <Text style={componentStyles.errorText}>{errors.description}</Text>
        )}
        <Text style={[componentStyles.charCount, { color: styles.colors.text + '60' }]}>
          {formData.description.length}/2000
        </Text>
      </View>
    </View>
  );

  const renderCategoryStep = () => (
    <View style={componentStyles.stepContainer}>
      <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
        Selecciona una categoría *
      </Text>
      
      <View style={componentStyles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              handleInputChange('category', category.id);
              Haptics.selectionAsync();
            }}
            style={[
              componentStyles.categoryCard,
              {
                backgroundColor: formData.category === category.id 
                  ? category.color + '20' 
                  : styles.colors.surface,
                borderColor: formData.category === category.id 
                  ? category.color 
                  : 'transparent',
              }
            ]}
          >
            <View
              style={[
                componentStyles.categoryIcon,
                { backgroundColor: category.color }
              ]}
            >
              <Ionicons name={category.icon as any} size={24} color="white" />
            </View>
            <Text
              style={[
                componentStyles.categoryLabel,
                { 
                  color: formData.category === category.id 
                    ? category.color 
                    : styles.colors.text 
                }
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {errors.category && (
        <Text style={componentStyles.errorText}>{errors.category}</Text>
      )}
    </View>
  );

  const renderDateTimeStep = () => (
    <View style={componentStyles.stepContainer}>
      {/* Start Date & Time */}
      <View style={componentStyles.dateTimeSection}>
        <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
          Inicio del evento *
        </Text>
        
        <View style={componentStyles.dateTimeRow}>
          <TouchableOpacity
            style={[componentStyles.dateTimeButton, { backgroundColor: styles.colors.surface }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={styles.colors.primary} />
            <Text style={[componentStyles.dateTimeText, { color: styles.colors.text }]}>
              {formData.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[componentStyles.dateTimeButton, { backgroundColor: styles.colors.surface }]}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Ionicons name="time" size={20} color={styles.colors.primary} />
            <Text style={[componentStyles.dateTimeText, { color: styles.colors.text }]}>
              {formData.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* End Date & Time */}
      <View style={componentStyles.dateTimeSection}>
        <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
          Final del evento *
        </Text>
        
        <View style={componentStyles.dateTimeRow}>
          <TouchableOpacity
            style={[componentStyles.dateTimeButton, { backgroundColor: styles.colors.surface }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={styles.colors.primary} />
            <Text style={[componentStyles.dateTimeText, { color: styles.colors.text }]}>
              {formData.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[componentStyles.dateTimeButton, { backgroundColor: styles.colors.surface }]}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Ionicons name="time" size={20} color={styles.colors.primary} />
            <Text style={[componentStyles.dateTimeText, { color: styles.colors.text }]}>
              {formData.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Errors */}
      {(errors.startDate || errors.endDate) && (
        <Text style={componentStyles.errorText}>
          {errors.startDate || errors.endDate}
        </Text>
      )}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          onChange={(event, date) => handleDateChange(event, date, 'startDate')}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          onChange={(event, date) => handleDateChange(event, date, 'endDate')}
          minimumDate={formData.startDate}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="time"
          onChange={(event, date) => handleDateChange(event, date, 'startTime')}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="time"
          onChange={(event, date) => handleDateChange(event, date, 'endTime')}
        />
      )}
    </View>
  );

  const renderLocationStep = () => (
    <View style={componentStyles.stepContainer}>
      {/* Location Type */}
      <View style={componentStyles.inputContainer}>
        <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
          Tipo de evento *
        </Text>
        
        <View style={componentStyles.locationTypeContainer}>
          {[
            { value: 'physical', label: 'Presencial', icon: 'location', description: 'En un lugar físico' },
            { value: 'virtual', label: 'Virtual', icon: 'laptop', description: 'Solo en línea' },
            { value: 'hybrid', label: 'Híbrido', icon: 'globe', description: 'Presencial y virtual' }
          ].map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => {
                handleInputChange('location.type', type.value);
                Haptics.selectionAsync();
              }}
              style={[
                componentStyles.locationTypeCard,
                {
                  backgroundColor: formData.location.type === type.value 
                    ? styles.colors.primary + '20' 
                    : styles.colors.surface,
                  borderColor: formData.location.type === type.value 
                    ? styles.colors.primary 
                    : 'transparent',
                }
              ]}
            >
              <Ionicons 
                name={type.icon as any} 
                size={24} 
                color={formData.location.type === type.value 
                  ? styles.colors.primary 
                  : styles.colors.text + '60'
                } 
              />
              <Text
                style={[
                  componentStyles.locationTypeLabel,
                  { 
                    color: formData.location.type === type.value 
                      ? styles.colors.primary 
                      : styles.colors.text 
                  }
                ]}
              >
                {type.label}
              </Text>
              <Text style={[componentStyles.locationTypeDescription, { color: styles.colors.text + '60' }]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Physical Location */}
      {(formData.location.type === 'physical' || formData.location.type === 'hybrid') && (
        <View style={componentStyles.inputContainer}>
          <Text style={[componentStyles.label, { color: styles.colors.text }]}>
            Dirección *
          </Text>
          <View style={componentStyles.addressInputContainer}>
            <TextInput
              style={[
                componentStyles.addressInput,
                {
                  backgroundColor: styles.colors.surface,
                  color: styles.colors.text,
                  borderColor: errors.address ? '#ef4444' : styles.colors.surface,
                }
              ]}
              value={formData.location.address || ''}
              onChangeText={(text) => handleInputChange('location.address', text)}
              placeholder="Dirección del evento"
              placeholderTextColor={styles.colors.text + '60'}
              multiline
            />
            <TouchableOpacity
              style={[componentStyles.locationButton, { backgroundColor: styles.colors.primary }]}
              onPress={handleLocationPicker}
            >
              <Ionicons name="navigate" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {errors.address && (
            <Text style={componentStyles.errorText}>{errors.address}</Text>
          )}
        </View>
      )}

      {/* Virtual Location */}
      {(formData.location.type === 'virtual' || formData.location.type === 'hybrid') && (
        <View style={componentStyles.inputContainer}>
          <Text style={[componentStyles.label, { color: styles.colors.text }]}>
            Enlace virtual *
          </Text>
          <TextInput
            style={[
              componentStyles.textInput,
              {
                backgroundColor: styles.colors.surface,
                color: styles.colors.text,
                borderColor: errors.virtualLink ? '#ef4444' : styles.colors.surface,
              }
            ]}
            value={formData.location.virtualLink || ''}
            onChangeText={(text) => handleInputChange('location.virtualLink', text)}
            placeholder="https://zoom.us/j/..."
            placeholderTextColor={styles.colors.text + '60'}
            keyboardType="url"
            autoCapitalize="none"
          />
          {errors.virtualLink && (
            <Text style={componentStyles.errorText}>{errors.virtualLink}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderSettingsStep = () => (
    <ScrollView style={componentStyles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Cover Image */}
      <View style={componentStyles.inputContainer}>
        <Text style={[componentStyles.label, { color: styles.colors.text }]}>
          Imagen de portada
        </Text>
        <TouchableOpacity
          style={[componentStyles.imagePickerButton, { backgroundColor: styles.colors.surface }]}
          onPress={() => handleImagePicker('cover')}
        >
          {formData.coverImage ? (
            <Image source={{ uri: formData.coverImage }} style={componentStyles.coverImagePreview} />
          ) : (
            <View style={componentStyles.imagePickerContent}>
              <Ionicons name="camera" size={32} color={styles.colors.text + '60'} />
              <Text style={[componentStyles.imagePickerText, { color: styles.colors.text + '60' }]}>
                Agregar imagen
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Capacity */}
      <View style={componentStyles.inputContainer}>
        <Text style={[componentStyles.label, { color: styles.colors.text }]}>
          Capacidad máxima
        </Text>
        <View style={componentStyles.capacityContainer}>
          <View style={componentStyles.switchContainer}>
            <Text style={[componentStyles.switchLabel, { color: styles.colors.text }]}>
              Sin límite
            </Text>
            <Switch
              value={formData.capacity === null}
              onValueChange={(value) => {
                handleInputChange('capacity', value ? null : 50);
                Haptics.selectionAsync();
              }}
              trackColor={{ false: styles.colors.surface, true: styles.colors.primary + '60' }}
              thumbColor={formData.capacity === null ? styles.colors.primary : styles.colors.text + '60'}
            />
          </View>
          
          {formData.capacity !== null && (
            <TextInput
              style={[
                componentStyles.capacityInput,
                {
                  backgroundColor: styles.colors.surface,
                  color: styles.colors.text,
                  borderColor: errors.capacity ? '#ef4444' : styles.colors.surface,
                }
              ]}
              value={formData.capacity?.toString() || ''}
              onChangeText={(text) => handleInputChange('capacity', parseInt(text) || null)}
              placeholder="Número de asistentes"
              placeholderTextColor={styles.colors.text + '60'}
              keyboardType="numeric"
            />
          )}
        </View>
        {errors.capacity && (
          <Text style={componentStyles.errorText}>{errors.capacity}</Text>
        )}
      </View>

      {/* Price */}
      <View style={componentStyles.inputContainer}>
        <Text style={[componentStyles.label, { color: styles.colors.text }]}>
          Precio
        </Text>
        <View style={componentStyles.priceContainer}>
          <View style={componentStyles.switchContainer}>
            <Text style={[componentStyles.switchLabel, { color: styles.colors.text }]}>
              Gratis
            </Text>
            <Switch
              value={formData.price === 0}
              onValueChange={(value) => {
                handleInputChange('price', value ? 0 : 10);
                Haptics.selectionAsync();
              }}
              trackColor={{ false: styles.colors.surface, true: styles.colors.primary + '60' }}
              thumbColor={formData.price === 0 ? styles.colors.primary : styles.colors.text + '60'}
            />
          </View>
          
          {formData.price > 0 && (
            <View style={componentStyles.priceInputContainer}>
              <Text style={[componentStyles.currencySymbol, { color: styles.colors.text }]}>
                $
              </Text>
              <TextInput
                style={[
                  componentStyles.priceInput,
                  {
                    backgroundColor: styles.colors.surface,
                    color: styles.colors.text,
                    borderColor: errors.price ? '#ef4444' : styles.colors.surface,
                  }
                ]}
                value={formData.price?.toString() || ''}
                onChangeText={(text) => handleInputChange('price', parseFloat(text) || 0)}
                placeholder="0.00"
                placeholderTextColor={styles.colors.text + '60'}
                keyboardType="decimal-pad"
              />
            </View>
          )}
        </View>
        {errors.price && (
          <Text style={componentStyles.errorText}>{errors.price}</Text>
        )}
      </View>

      {/* Privacy Settings */}
      <View style={componentStyles.settingsSection}>
        <View style={componentStyles.settingRow}>
          <View style={componentStyles.settingInfo}>
            <Text style={[componentStyles.settingLabel, { color: styles.colors.text }]}>
              Evento privado
            </Text>
            <Text style={[componentStyles.settingDescription, { color: styles.colors.text + '80' }]}>
              Solo personas invitadas pueden ver y unirse
            </Text>
          </View>
          <Switch
            value={formData.isPrivate}
            onValueChange={(value) => {
              handleInputChange('isPrivate', value);
              Haptics.selectionAsync();
            }}
            trackColor={{ false: styles.colors.surface, true: styles.colors.primary + '60' }}
            thumbColor={formData.isPrivate ? styles.colors.primary : styles.colors.text + '60'}
          />
        </View>

        <View style={componentStyles.settingRow}>
          <View style={componentStyles.settingInfo}>
            <Text style={[componentStyles.settingLabel, { color: styles.colors.text }]}>
              Requiere aprobación
            </Text>
            <Text style={[componentStyles.settingDescription, { color: styles.colors.text + '80' }]}>
              Los asistentes deben ser aprobados por ti
            </Text>
          </View>
          <Switch
            value={formData.requiresApproval}
            onValueChange={(value) => {
              handleInputChange('requiresApproval', value);
              Haptics.selectionAsync();
            }}
            trackColor={{ false: styles.colors.surface, true: styles.colors.primary + '60' }}
            thumbColor={formData.requiresApproval ? styles.colors.primary : styles.colors.text + '60'}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfoStep();
      case 1: return renderCategoryStep();
      case 2: return renderDateTimeStep();
      case 3: return renderLocationStep();
      case 4: return renderSettingsStep();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[componentStyles.container, { backgroundColor: styles.colors.background }]}
    >
      <LinearGradient
        colors={[styles.colors.background, styles.colors.surface + '20']}
        style={componentStyles.gradient}
      >
        {/* Header */}
        <View style={[componentStyles.header, { borderBottomColor: styles.colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={styles.colors.text} />
          </TouchableOpacity>
          
          <Text style={[componentStyles.headerTitle, { color: styles.colors.text }]}>
            {mode === 'edit' ? 'Editar Evento' : 'Crear Evento'}
          </Text>
          
          <TouchableOpacity onPress={handleSaveDraft} disabled={isSaving}>
            {isSaving ? (
              <Ionicons name="hourglass" size={24} color={styles.colors.text + '60'} />
            ) : (
              <Ionicons name="bookmark" size={24} color={styles.colors.text} />
            )}
          </TouchableOpacity>
        </View>

        {/* Progress */}
        {renderProgressBar()}

        {/* Content */}
        <View style={componentStyles.content}>
          {renderCurrentStep()}
        </View>

        {/* Navigation */}
        <View style={[componentStyles.navigation, { borderTopColor: styles.colors.surface }]}>
          <TouchableOpacity
            style={[
              componentStyles.navButton,
              componentStyles.prevButton,
              { backgroundColor: styles.colors.surface }
            ]}
            onPress={handlePrev}
            disabled={currentStep === 0}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentStep === 0 ? styles.colors.text + '40' : styles.colors.text} 
            />
            <Text 
              style={[
                componentStyles.navButtonText,
                { color: currentStep === 0 ? styles.colors.text + '40' : styles.colors.text }
              ]}
            >
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              componentStyles.navButton,
              componentStyles.nextButton,
              { opacity: isLoading ? 0.6 : 1 }
            ]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[styles.colors.primary, styles.colors.secondary]}
              style={componentStyles.nextButtonGradient}
            >
              {isLoading ? (
                <Ionicons name="hourglass" size={20} color="white" />
              ) : (
                <>
                  <Text style={componentStyles.nextButtonText}>
                    {currentStep === steps.length - 1 
                      ? (mode === 'edit' ? 'Actualizar' : 'Crear')
                      : 'Siguiente'
                    }
                  </Text>
                  {currentStep < steps.length - 1 && (
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// ===== STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationTypeContainer: {
    gap: 12,
  },
  locationTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  locationTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationTypeDescription: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  addressInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addressInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 60,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerButton: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    marginTop: 8,
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  capacityContainer: {
    gap: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  capacityInput: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  priceContainer: {
    gap: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  settingsSection: {
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {},
  nextButton: {
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateEventScreen;

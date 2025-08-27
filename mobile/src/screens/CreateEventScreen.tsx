import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Calendar, Clock, MapPin, Users, Tag, Image as ImageIcon,
  Camera, FileText, Link, Video, Upload, X
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface EventFormData {
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  location: string;
  isOnline: boolean;
  onlineUrl?: string;
  maxAttendees?: number;
  price: number;
  isFree: boolean;
  tags: string[];
  image?: string;
  type: 'online' | 'offline' | 'hybrid';
}

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    location: '',
    isOnline: false,
    onlineUrl: '',
    maxAttendees: undefined,
    price: 0,
    isFree: true,
    tags: [],
    type: 'offline',
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const response = await apiClient.post('/api/events', eventData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert(
        'Éxito',
        'Evento creado correctamente',
        [
          {
            text: 'Ver Evento',
            onPress: () => navigation.navigate('EventDetail' as never, { eventId: data.event._id } as never),
          },
          {
            text: 'Crear Otro',
            onPress: () => resetForm(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo crear el evento');
      console.error('Error creating event:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      location: '',
      isOnline: false,
      onlineUrl: '',
      maxAttendees: undefined,
      price: 0,
      isFree: true,
      tags: [],
      type: 'offline',
    });
    setNewTag('');
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      handleInputChange(field, selectedDate);
      
      // If changing start date, ensure end date is after start date
      if (field === 'startDate' && selectedDate > formData.endDate) {
        const newEndDate = new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000);
        handleInputChange('endDate', newEndDate);
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTypeChange = (type: 'online' | 'offline' | 'hybrid') => {
    handleInputChange('type', type);
    handleInputChange('isOnline', type !== 'offline');
    
    if (type === 'online') {
      handleInputChange('location', '');
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }
    
    if (!formData.category.trim()) {
      Alert.alert('Error', 'La categoría es obligatoria');
      return;
    }
    
    if (formData.startDate >= formData.endDate) {
      Alert.alert('Error', 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    
    if (formData.type !== 'online' && !formData.location.trim()) {
      Alert.alert('Error', 'La ubicación es obligatoria para eventos presenciales');
      return;
    }
    
    if (formData.type === 'online' && !formData.onlineUrl?.trim()) {
      Alert.alert('Error', 'La URL online es obligatoria para eventos virtuales');
      return;
    }
    
    setIsSubmitting(true);
    createEventMutation.mutate(formData);
  };

  const categories = [
    'Networking', 'Tech', 'Business', 'Social', 'Education', 'Sports',
    'Music', 'Art', 'Food', 'Health', 'Travel', 'Other'
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        Crear Evento
      </Text>
      
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Creando...' : 'Crear'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Tipo de Evento
      </Text>
      
      <View style={styles.typeSelector}>
        {[
          { key: 'offline', label: 'Presencial', icon: MapPin },
          { key: 'online', label: 'Virtual', icon: Link },
          { key: 'hybrid', label: 'Híbrido', icon: Users },
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeOption,
              formData.type === type.key && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleTypeChange(type.key as any)}
          >
            <type.icon
              size={20}
              color={formData.type === type.key ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.typeOptionText,
              { color: formData.type === type.key ? colors.primary : colors.textSecondary }
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Información Básica
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Título *
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Nombre del evento"
          placeholderTextColor={colors.textSecondary}
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          maxLength={100}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Descripción *
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Describe tu evento..."
          placeholderTextColor={colors.textSecondary}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Categoría *
        </Text>
        <View style={styles.categorySelector}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryOption,
                formData.category === category && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('category', category)}
            >
              <Text style={[
                styles.categoryOptionText,
                { color: formData.category === category ? 'white' : colors.text }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDateTime = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Fecha y Hora
      </Text>
      
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Fecha de Inicio
          </Text>
          <TouchableOpacity
            style={[styles.dateTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formData.startDate.toLocaleDateString('es-ES')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateTimeGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Hora de Inicio
          </Text>
          <TouchableOpacity
            style={[styles.dateTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Clock size={20} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formData.startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Fecha de Fin
          </Text>
          <TouchableOpacity
            style={[styles.dateTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formData.endDate.toLocaleDateString('es-ES')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateTimeGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Hora de Fin
          </Text>
          <TouchableOpacity
            style={[styles.dateTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Clock size={20} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formData.endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ubicación
      </Text>
      
      {formData.type !== 'online' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Ubicación *
          </Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Dirección del evento"
            placeholderTextColor={colors.textSecondary}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </View>
      )}
      
      {formData.type !== 'offline' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            URL Online *
          </Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            value={formData.onlineUrl}
            onChangeText={(value) => handleInputChange('onlineUrl', value)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
      )}
    </View>
  );

  const renderDetails = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Detalles Adicionales
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Asistentes Máximos
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Sin límite"
          placeholderTextColor={colors.textSecondary}
          value={formData.maxAttendees?.toString() || ''}
          onChangeText={(value) => handleInputChange('maxAttendees', value ? parseInt(value) : undefined)}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Precio
        </Text>
        <View style={styles.priceRow}>
          <TouchableOpacity
            style={[
              styles.priceToggle,
              formData.isFree && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleInputChange('isFree', true)}
          >
            <Text style={[
              styles.priceToggleText,
              { color: formData.isFree ? 'white' : colors.textSecondary }
            ]}>
              Gratis
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.priceToggle,
              !formData.isFree && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleInputChange('isFree', false)}
          >
            <Text style={[
              styles.priceToggleText,
              { color: !formData.isFree ? 'white' : colors.textSecondary }
            ]}>
              De Pago
            </Text>
          </TouchableOpacity>
        </View>
        
        {!formData.isFree && (
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={formData.price.toString()}
            onChangeText={(value) => handleInputChange('price', parseFloat(value) || 0)}
            keyboardType="numeric"
          />
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Etiquetas
        </Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.tagInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Agregar etiqueta"
            placeholderTextColor={colors.textSecondary}
            value={newTag}
            onChangeText={setNewTag}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity
            style={[styles.addTagButton, { backgroundColor: colors.primary }]}
            onPress={handleAddTag}
          >
            <Text style={styles.addTagButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {formData.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {formData.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  style={styles.removeTagButton}
                >
                  <X size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTypeSelector()}
        {renderBasicInfo()}
        {renderDateTime()}
        {renderLocation()}
        {renderDetails()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="datetime"
          display="default"
          onChange={(event, date) => handleDateChange('startDate', event, date)}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="datetime"
          display="default"
          onChange={(event, date) => handleDateChange('endDate', event, date)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeGroup: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceToggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  priceToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeTagButton: {
    padding: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});

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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Users, Lock, Globe, Tag, Image as ImageIcon,
  Camera, FileText, Upload, X
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const { width } = Dimensions.get('window');

interface TribeFormData {
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private' | 'invite-only';
  location: string;
  maxMembers?: number;
  tags: string[];
  image?: string;
  rules: string[];
  interests: string[];
}

export default function CreateTribeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<TribeFormData>({
    name: '',
    description: '',
    category: '',
    privacy: 'public',
    location: '',
    maxMembers: undefined,
    tags: [],
    rules: [''],
    interests: [],
  });

  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create tribe mutation
  const createTribeMutation = useMutation({
    mutationFn: async (tribeData: TribeFormData) => {
      const response = await apiClient.post('/api/tribes', tribeData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      Alert.alert(
        'Éxito',
        'Tribu creada correctamente',
        [
          {
            text: 'Ver Tribu',
            onPress: () => navigation.navigate('TribeDetail' as never, { tribeId: data.tribe._id } as never),
          },
          {
            text: 'Crear Otra',
            onPress: () => resetForm(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo crear la tribu');
      console.error('Error creating tribe:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      privacy: 'public',
      location: '',
      maxMembers: undefined,
      tags: [],
      rules: [''],
      interests: [],
    });
    setNewTag('');
    setNewRule('');
    setNewInterest('');
  };

  const handleInputChange = (field: keyof TribeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleAddRule = () => {
    if (newRule.trim()) {
      handleInputChange('rules', [...formData.rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (indexToRemove: number) => {
    handleInputChange('rules', formData.rules.filter((_, index) => index !== indexToRemove));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      handleInputChange('interests', [...formData.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    handleInputChange('interests', formData.interests.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
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
    
    if (!formData.location.trim()) {
      Alert.alert('Error', 'La ubicación es obligatoria');
      return;
    }
    
    // Filter out empty rules
    const filteredRules = formData.rules.filter(rule => rule.trim());
    if (filteredRules.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos una regla');
      return;
    }
    
    const submitData = {
      ...formData,
      rules: filteredRules,
    };
    
    setIsSubmitting(true);
    createTribeMutation.mutate(submitData);
  };

  const categories = [
    'Technology', 'Business', 'Social', 'Education', 'Sports',
    'Music', 'Art', 'Food', 'Health', 'Travel', 'Other'
  ];

  const privacyOptions = [
    { key: 'public', label: 'Pública', icon: Globe, description: 'Cualquiera puede ver y unirse' },
    { key: 'private', label: 'Privada', icon: Lock, description: 'Solo miembros pueden ver el contenido' },
    { key: 'invite-only', label: 'Solo Invitación', icon: Users, description: 'Solo con invitación explícita' },
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
        Crear Tribu
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

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Información Básica
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Nombre *
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Nombre de la tribu"
          placeholderTextColor={colors.textSecondary}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          maxLength={50}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Descripción *
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Describe tu tribu..."
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

  const renderPrivacy = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Privacidad
      </Text>
      
      <View style={styles.privacySelector}>
        {privacyOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.privacyOption,
              formData.privacy === option.key && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('privacy', option.key)}
          >
            <View style={styles.privacyOptionHeader}>
              <View style={[styles.privacyIcon, { backgroundColor: colors.primary + '20' }]}>
                <option.icon size={20} color={colors.primary} />
              </View>
              <View style={styles.privacyInfo}>
                <Text style={[
                  styles.privacyLabel,
                  { color: formData.privacy === option.key ? colors.primary : colors.text }
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.privacyDescription,
                  { color: colors.textSecondary }
                ]}>
                  {option.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ubicación
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Ubicación *
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Ciudad, país o región"
          placeholderTextColor={colors.textSecondary}
          value={formData.location}
          onChangeText={(value) => handleInputChange('location', value)}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Miembros Máximos
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Sin límite"
          placeholderTextColor={colors.textSecondary}
          value={formData.maxMembers?.toString() || ''}
          onChangeText={(value) => handleInputChange('maxMembers', value ? parseInt(value) : undefined)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderRules = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Reglas de la Tribu *
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Agregar Regla
        </Text>
        <View style={styles.ruleInputRow}>
          <TextInput
            style={[styles.ruleInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Escribe una regla..."
            placeholderTextColor={colors.textSecondary}
            value={newRule}
            onChangeText={setNewRule}
            onSubmitEditing={handleAddRule}
          />
          <TouchableOpacity
            style={[styles.addRuleButton, { backgroundColor: colors.primary }]}
            onPress={handleAddRule}
          >
            <Text style={styles.addRuleButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {formData.rules.filter(rule => rule.trim()).length > 0 && (
          <View style={styles.rulesList}>
            {formData.rules.filter(rule => rule.trim()).map((rule, index) => (
              <View key={index} style={[styles.rule, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.ruleText, { color: colors.primary }]}>
                  {index + 1}. {rule}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveRule(index)}
                  style={styles.removeRuleButton}
                >
                  <X size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderTags = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Etiquetas
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Agregar Etiqueta
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

  const renderInterests = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Intereses
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Agregar Interés
        </Text>
        <View style={styles.interestInputRow}>
          <TextInput
            style={[styles.interestInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Agregar interés"
            placeholderTextColor={colors.textSecondary}
            value={newInterest}
            onChangeText={setNewInterest}
            onSubmitEditing={handleAddInterest}
          />
          <TouchableOpacity
            style={[styles.addInterestButton, { backgroundColor: colors.primary }]}
            onPress={handleAddInterest}
          >
            <Text style={styles.addInterestButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {formData.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {formData.interests.map((interest, index) => (
              <View key={index} style={[styles.interest, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.interestText, { color: colors.primary }]}>
                  {interest}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveInterest(interest)}
                  style={styles.removeInterestButton}
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
        {renderBasicInfo()}
        {renderPrivacy()}
        {renderLocation()}
        {renderRules()}
        {renderTags()}
        {renderInterests()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  privacySelector: {
    gap: 12,
  },
  privacyOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  privacyOptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  ruleInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  ruleInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addRuleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRuleButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rulesList: {
    gap: 8,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  removeRuleButton: {
    padding: 4,
  },
  interestInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  interestInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addInterestButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addInterestButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interest: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeInterestButton: {
    padding: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});

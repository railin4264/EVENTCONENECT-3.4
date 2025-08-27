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
  MessageSquare, Image as ImageIcon, Video, FileText, Link, 
  Camera, Upload, X, Tag, Users, Globe, Lock
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const { width } = Dimensions.get('window');

interface PostFormData {
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'link';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  tags: string[];
  privacy: 'public' | 'tribe' | 'private';
  tribeId?: string;
  isAnonymous: boolean;
}

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    type: 'text',
    tags: [],
    privacy: 'public',
    isAnonymous: false,
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: PostFormData) => {
      const response = await apiClient.post('/api/posts', postData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      Alert.alert(
        'Éxito',
        'Post creado correctamente',
        [
          {
            text: 'Ver Post',
            onPress: () => navigation.navigate('PostDetail' as never, { postId: data.post._id } as never),
          },
          {
            text: 'Crear Otro',
            onPress: () => resetForm(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo crear el post');
      console.error('Error creating post:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'text',
      tags: [],
      privacy: 'public',
      isAnonymous: false,
    });
    setNewTag('');
  };

  const handleInputChange = (field: keyof PostFormData, value: any) => {
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

  const handleTypeChange = (type: PostFormData['type']) => {
    handleInputChange('type', type);
    
    // Reset media-related fields when changing type
    if (type !== 'image') handleInputChange('mediaUrl', undefined);
    if (type !== 'video') handleInputChange('mediaUrl', undefined);
    if (type !== 'document') {
      handleInputChange('fileName', undefined);
      handleInputChange('fileSize', undefined);
    }
    if (type !== 'link') {
      handleInputChange('linkUrl', undefined);
      handleInputChange('linkTitle', undefined);
      handleInputChange('linkDescription', undefined);
      handleInputChange('linkImage', undefined);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    
    if (!formData.content.trim()) {
      Alert.alert('Error', 'El contenido es obligatorio');
      return;
    }
    
    if (formData.type === 'link' && !formData.linkUrl?.trim()) {
      Alert.alert('Error', 'La URL del enlace es obligatoria');
      return;
    }
    
    setIsSubmitting(true);
    createPostMutation.mutate(formData);
  };

  const postTypes = [
    { key: 'text', label: 'Texto', icon: MessageSquare, description: 'Solo texto' },
    { key: 'image', label: 'Imagen', icon: ImageIcon, description: 'Imagen con texto' },
    { key: 'video', label: 'Video', icon: Video, description: 'Video con texto' },
    { key: 'document', label: 'Documento', icon: FileText, description: 'Archivo con texto' },
    { key: 'link', label: 'Enlace', icon: Link, description: 'Enlace con preview' },
  ];

  const privacyOptions = [
    { key: 'public', label: 'Público', icon: Globe, description: 'Visible para todos' },
    { key: 'tribe', label: 'Tribu', icon: Users, description: 'Solo para miembros de la tribu' },
    { key: 'private', label: 'Privado', icon: Lock, description: 'Solo para ti' },
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
        Crear Post
      </Text>
      
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Creando...' : 'Publicar'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Tipo de Post
      </Text>
      
      <View style={styles.typeSelector}>
        {postTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeOption,
              formData.type === type.key && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleTypeChange(type.key as any)}
          >
            <View style={styles.typeOptionHeader}>
              <View style={[styles.typeIcon, { backgroundColor: colors.primary + '20' }]}>
                <type.icon size={20} color={colors.primary} />
              </View>
              <View style={styles.typeInfo}>
                <Text style={[
                  styles.typeLabel,
                  { color: formData.type === type.key ? colors.primary : colors.text }
                ]}>
                  {type.label}
                </Text>
                <Text style={[
                  styles.typeDescription,
                  { color: colors.textSecondary }
                ]}>
                  {type.description}
                </Text>
              </View>
            </View>
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
          placeholder="Título del post"
          placeholderTextColor={colors.textSecondary}
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          maxLength={100}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Contenido *
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Escribe tu post..."
          placeholderTextColor={colors.textSecondary}
          value={formData.content}
          onChangeText={(value) => handleInputChange('content', value)}
          multiline
          numberOfLines={6}
          maxLength={2000}
        />
      </View>
    </View>
  );

  const renderMediaUpload = () => {
    if (formData.type === 'text') return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {formData.type === 'image' && 'Subir Imagen'}
          {formData.type === 'video' && 'Subir Video'}
          {formData.type === 'document' && 'Subir Documento'}
        </Text>
        
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Alert.alert('Info', 'Función de subida de archivos en desarrollo')}
        >
          <Upload size={24} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
            {formData.type === 'image' && 'Toca para seleccionar imagen'}
            {formData.type === 'video' && 'Toca para seleccionar video'}
            {formData.type === 'document' && 'Toca para seleccionar documento'}
          </Text>
        </TouchableOpacity>
        
        {formData.mediaUrl && (
          <View style={styles.mediaPreview}>
            <Text style={[styles.mediaPreviewText, { color: colors.textSecondary }]}>
              Archivo seleccionado: {formData.fileName || 'archivo'}
            </Text>
            <TouchableOpacity
              onPress={() => handleInputChange('mediaUrl', undefined)}
              style={styles.removeMediaButton}
            >
              <X size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderLinkInput = () => {
    if (formData.type !== 'link') return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Información del Enlace
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            URL del Enlace *
          </Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            value={formData.linkUrl}
            onChangeText={(value) => handleInputChange('linkUrl', value)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Título del Enlace
          </Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Título opcional del enlace"
            placeholderTextColor={colors.textSecondary}
            value={formData.linkTitle}
            onChangeText={(value) => handleInputChange('linkTitle', value)}
            maxLength={100}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Descripción del Enlace
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Descripción opcional del enlace"
            placeholderTextColor={colors.textSecondary}
            value={formData.linkDescription}
            onChangeText={(value) => handleInputChange('linkDescription', value)}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>
      </View>
    );
  };

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
      
      <View style={styles.anonymousToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            formData.isAnonymous && { backgroundColor: colors.primary }
          ]}
          onPress={() => handleInputChange('isAnonymous', !formData.isAnonymous)}
        >
          <Text style={[
            styles.toggleText,
            { color: formData.isAnonymous ? 'white' : colors.textSecondary }
          ]}>
            {formData.isAnonymous ? '✓' : '○'} Publicar de forma anónima
          </Text>
        </TouchableOpacity>
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
        {renderMediaUpload()}
        {renderLinkInput()}
        {renderPrivacy()}
        {renderTags()}
        
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  typeSelector: {
    gap: 12,
  },
  typeOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  typeOptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  uploadText: {
    fontSize: 16,
    textAlign: 'center',
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 12,
  },
  mediaPreviewText: {
    fontSize: 14,
    flex: 1,
  },
  removeMediaButton: {
    padding: 4,
  },
  privacySelector: {
    gap: 12,
    marginBottom: 16,
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
  anonymousToggle: {
    marginTop: 8,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  toggleText: {
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

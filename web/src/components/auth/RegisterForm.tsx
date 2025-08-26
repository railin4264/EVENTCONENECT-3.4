'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  AtSymbolIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { authAPI } from '@/services/api';

// ===== INTERFACES =====
interface RegisterFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Personal Info
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio: string;
  
  // Location
  city: string;
  country: string;
  
  // Interests
  interests: string[];
  
  // Agreements
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
}

interface RegisterFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToLogin?: () => void;
}

// ===== REGISTER FORM COMPONENT =====
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bio: '',
    city: '',
    country: '',
    interests: [],
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false
  });
  
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // ===== AVAILABLE INTERESTS =====
  const availableInterests = [
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'sports', label: 'Deportes', icon: '⚽' },
    { id: 'technology', label: 'Tecnología', icon: '💻' },
    { id: 'art', label: 'Arte', icon: '🎨' },
    { id: 'food', label: 'Comida', icon: '🍔' },
    { id: 'travel', label: 'Viajes', icon: '✈️' },
    { id: 'education', label: 'Educación', icon: '📚' },
    { id: 'business', label: 'Negocios', icon: '💼' },
    { id: 'health', label: 'Salud', icon: '🏥' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'reading', label: 'Lectura', icon: '📖' },
    { id: 'photography', label: 'Fotografía', icon: '📸' },
    { id: 'cooking', label: 'Cocina', icon: '👨‍🍳' },
    { id: 'dancing', label: 'Baile', icon: '💃' },
    { id: 'writing', label: 'Escritura', icon: '✍️' },
    { id: 'volunteering', label: 'Voluntariado', icon: '🤝' },
    { id: 'outdoors', label: 'Aire libre', icon: '🏔️' },
    { id: 'fashion', label: 'Moda', icon: '👗' }
  ];

  // ===== FORM STEPS =====
  const steps = [
    { title: 'Información Básica', description: 'Datos personales' },
    { title: 'Cuenta y Seguridad', description: 'Usuario y contraseña' },
    { title: 'Perfil Personal', description: 'Detalles adicionales' },
    { title: 'Intereses', description: 'Qué te gusta' },
    { title: 'Términos y Condiciones', description: 'Aceptar políticas' }
  ];

  // ===== VALIDATION =====
  const validateField = (name: keyof RegisterFormData, value: any): string | null => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return `${name === 'firstName' ? 'Nombre' : 'Apellido'} es requerido`;
        if (value.length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return null;

      case 'username':
        if (!value.trim()) return 'Nombre de usuario es requerido';
        if (value.length < 3) return 'Mínimo 3 caracteres';
        if (value.length > 30) return 'Máximo 30 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y guiones bajos';
        return null;

      case 'email':
        if (!value.trim()) return 'Email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return null;

      case 'password':
        if (!value) return 'Contraseña es requerida';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        if (!/(?=.*[a-z])/.test(value)) return 'Debe incluir al menos una minúscula';
        if (!/(?=.*[A-Z])/.test(value)) return 'Debe incluir al menos una mayúscula';
        if (!/(?=.*\d)/.test(value)) return 'Debe incluir al menos un número';
        return null;

      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return null;

      case 'dateOfBirth':
        if (!value) return 'Fecha de nacimiento es requerida';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) return 'Debes ser mayor de 13 años';
        if (age > 120) return 'Fecha inválida';
        return null;

      case 'city':
      case 'country':
        if (!value.trim()) return `${name === 'city' ? 'Ciudad' : 'País'} es requerido`;
        return null;

      case 'bio':
        if (value.length > 500) return 'Máximo 500 caracteres';
        return null;

      case 'termsAccepted':
      case 'privacyAccepted':
        if (!value) return 'Debes aceptar los términos';
        return null;

      default:
        return null;
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};
    let hasErrors = false;

    const fieldsToValidate = getFieldsForStep(currentStep);
    
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error as any;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const getFieldsForStep = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 0: return ['firstName', 'lastName'];
      case 1: return ['username', 'email', 'password', 'confirmPassword'];
      case 2: return ['dateOfBirth', 'city', 'country'];
      case 3: return []; // Interests are optional
      case 4: return ['termsAccepted', 'privacyAccepted'];
      default: return [];
    }
  };

  // ===== HANDLERS =====
  const handleInputChange = (field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInterestToggle = (interestId: string) => {
    const newInterests = formData.interests.includes(interestId)
      ? formData.interests.filter(id => id !== interestId)
      : [...formData.interests, interestId];
    
    handleInputChange('interests', newInterests);
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setRegisterError(null);

    try {
      const registrationData = {
        ...formData,
        // Format data for backend
        location: {
          address: {
            city: formData.city,
            country: formData.country
          }
        }
      };

      const response = await authAPI.register(registrationData);

      if (response.success) {
        setRegisterSuccess(true);
        
        // Store tokens if provided
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        }

        onSuccess?.(response.data.user);
        
        // Redirect to onboarding or dashboard
        setTimeout(() => {
          window.location.href = '/onboarding';
        }, 2000);
      } else {
        setRegisterError(response.message || 'Error en el registro');
      }
    } catch (error: any) {
      setRegisterError(
        error.response?.data?.message || 
        error.message || 
        'Error de conexión. Verifica tu internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER METHODS =====
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${index <= currentStep 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                  : 'bg-white/10 text-gray-400'
                }
              `}
            >
              {index < currentStep ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 transition-all duration-300
                  ${index < currentStep ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-white/10'}
                `}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{steps[currentStep].title}</h3>
        <p className="text-gray-400 text-sm">{steps[currentStep].description}</p>
      </div>
    </div>
  );

  const renderInputField = (
    field: keyof RegisterFormData,
    label: string,
    type: string = 'text',
    icon: React.ReactNode,
    placeholder?: string,
    required: boolean = true
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
        
        <input
          type={
            field === 'password' ? (showPassword ? 'text' : 'password') :
            field === 'confirmPassword' ? (showConfirmPassword ? 'text' : 'password') :
            type
          }
          value={formData[field] as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300
            bg-white/5 backdrop-blur-sm text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50
            ${errors[field] 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-white/20 focus:border-cyan-500 hover:border-white/40'
            }
          `}
          disabled={isLoading}
        />
        
        {/* Password visibility toggle */}
        {(field === 'password' || field === 'confirmPassword') && (
          <button
            type="button"
            onClick={() => 
              field === 'password' 
                ? setShowPassword(!showPassword)
                : setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {(field === 'password' ? showPassword : showConfirmPassword) ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {errors[field] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-400 text-sm"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{errors[field]}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ===== STEP COMPONENTS =====
  const Step0_BasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {renderInputField(
          'firstName',
          'Nombre',
          'text',
          <UserIcon className="h-5 w-5" />,
          'Tu nombre'
        )}
        
        {renderInputField(
          'lastName',
          'Apellido',
          'text',
          <UserIcon className="h-5 w-5" />,
          'Tu apellido'
        )}
      </div>
    </div>
  );

  const Step1_AccountSecurity = () => (
    <div className="space-y-6">
      {renderInputField(
        'username',
        'Nombre de usuario',
        'text',
        <AtSymbolIcon className="h-5 w-5" />,
        'usuario123'
      )}
      
      {renderInputField(
        'email',
        'Correo electrónico',
        'email',
        <AtSymbolIcon className="h-5 w-5" />,
        'tu@email.com'
      )}
      
      {renderInputField(
        'password',
        'Contraseña',
        'password',
        <LockClosedIcon className="h-5 w-5" />,
        'Contraseña segura'
      )}
      
      {renderInputField(
        'confirmPassword',
        'Confirmar contraseña',
        'password',
        <LockClosedIcon className="h-5 w-5" />,
        'Repite tu contraseña'
      )}
      
      {/* Password strength indicator */}
      {formData.password && (
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Fortaleza de la contraseña:</div>
          <div className="space-y-1">
            <div className={`text-xs ${formData.password.length >= 8 ? 'text-green-400' : 'text-red-400'}`}>
              ✓ Al menos 8 caracteres
            </div>
            <div className={`text-xs ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
              ✓ Una letra minúscula
            </div>
            <div className={`text-xs ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
              ✓ Una letra mayúscula
            </div>
            <div className={`text-xs ${/(?=.*\d)/.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
              ✓ Un número
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const Step2_PersonalInfo = () => (
    <div className="space-y-6">
      {/* Date of Birth */}
      {renderInputField(
        'dateOfBirth',
        'Fecha de nacimiento',
        'date',
        <CalendarIcon className="h-5 w-5" />
      )}
      
      {/* Gender */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Género
        </label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 bg-white/5 backdrop-blur-sm text-white border-white/20 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          disabled={isLoading}
        >
          <option value="prefer_not_to_say">Prefiero no decir</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        {renderInputField(
          'city',
          'Ciudad',
          'text',
          <MapPinIcon className="h-5 w-5" />,
          'Tu ciudad'
        )}
        
        {renderInputField(
          'country',
          'País',
          'text',
          <MapPinIcon className="h-5 w-5" />,
          'Tu país'
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Biografía <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Cuéntanos un poco sobre ti..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border-2 bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 border-white/20 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          disabled={isLoading}
        />
        <div className="text-xs text-gray-400 text-right">
          {formData.bio.length}/500
        </div>
      </div>
    </div>
  );

  const Step3_Interests = () => (
    <div className="space-y-6">
      <div className="text-center">
        <HeartIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">¿Qué te interesa?</h3>
        <p className="text-gray-400 text-sm mb-6">
          Selecciona tus intereses para encontrar eventos perfectos para ti
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableInterests.map((interest) => (
          <motion.button
            key={interest.id}
            type="button"
            onClick={() => handleInterestToggle(interest.id)}
            className={`
              p-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium
              ${formData.interests.includes(interest.id)
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            <div className="text-lg mb-1">{interest.icon}</div>
            <div>{interest.label}</div>
          </motion.button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">
        Seleccionados: {formData.interests.length}
      </div>
    </div>
  );

  const Step4_Terms = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircleIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Últimos detalles</h3>
        <p className="text-gray-400 text-sm mb-6">
          Por favor acepta nuestros términos y condiciones
        </p>
      </div>

      <div className="space-y-4">
        {/* Terms of Service */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2 mt-0.5"
            disabled={isLoading}
          />
          <div className="text-sm">
            <span className="text-white">Acepto los </span>
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
              Términos de Servicio
            </a>
            <span className="text-red-400"> *</span>
          </div>
        </label>

        {/* Privacy Policy */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.privacyAccepted}
            onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2 mt-0.5"
            disabled={isLoading}
          />
          <div className="text-sm">
            <span className="text-white">Acepto la </span>
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
              Política de Privacidad
            </a>
            <span className="text-red-400"> *</span>
          </div>
        </label>

        {/* Marketing Communications */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.marketingAccepted}
            onChange={(e) => handleInputChange('marketingAccepted', e.target.checked)}
            className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2 mt-0.5"
            disabled={isLoading}
          />
          <div className="text-sm text-white">
            Acepto recibir emails con noticias y promociones 
            <span className="text-gray-400"> (opcional)</span>
          </div>
        </label>
      </div>

      {/* Terms errors */}
      <AnimatePresence>
        {(errors.termsAccepted || errors.privacyAccepted) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-400 text-sm"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>Debes aceptar los términos obligatorios</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return <Step0_BasicInfo />;
      case 1: return <Step1_AccountSecurity />;
      case 2: return <Step2_PersonalInfo />;
      case 3: return <Step3_Interests />;
      case 4: return <Step4_Terms />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center"
            >
              <UserIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Crear Cuenta
            </h1>
            <p className="text-gray-300 mt-2">
              Únete a EventConnect y descubre eventos increíbles
            </p>
          </div>

          {/* Success State */}
          <AnimatePresence>
            {registerSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-6"
              >
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">
                  ¡Registro exitoso!
                </p>
                <p className="text-gray-400 text-sm">
                  Redirigiendo al onboarding...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register Error */}
          <AnimatePresence>
            {registerError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-red-400">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{registerError}</span>
                  </div>
                  <button
                    onClick={() => setRegisterError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!registerSuccess && (
            <>
              {/* Progress Bar */}
              {renderProgressBar()}

              {/* Step Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderCurrentStep()}
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={currentStep === 0 ? onSwitchToLogin : handlePrevStep}
                  disabled={isLoading}
                >
                  {currentStep === 0 ? 'Ya tengo cuenta' : 'Anterior'}
                </Button>

                <Button
                  variant="primary"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : handleNextStep}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" variant="neon" />
                  ) : currentStep === steps.length - 1 ? (
                    'Crear Cuenta'
                  ) : (
                    'Siguiente'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;

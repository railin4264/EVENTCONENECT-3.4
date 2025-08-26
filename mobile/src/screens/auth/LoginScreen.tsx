import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useThemedStyles } from '../../contexts/ThemeContext';
import AuthService from '../../services/AuthService';

const { width, height } = Dimensions.get('window');

// ===== INTERFACES =====
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess?: (user: any) => void;
}

// ===== LOGIN SCREEN COMPONENT =====
export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onLoginSuccess
}) => {
  const styles = useThemedStyles();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ===== ANIMATED VALUES =====
  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    // Entrance animations
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    formOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  // ===== ANIMATED STYLES =====
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }]
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  // ===== VALIDATION =====
  const validateField = (field: keyof LoginFormData, value: any): string | null => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return null;
      
      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        return null;
      
      default:
        return null;
    }
  };

  // ===== HANDLERS =====
  const handleInputChange = (field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldFocus = (field: string) => {
    setFocusedField(field);
    Haptics.selectionAsync();
  };

  const handleFieldBlur = (field: keyof LoginFormData) => {
    setFocusedField(null);
    
    // Validate field on blur
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error as any }));
    }
  };

  const handleLogin = async () => {
    // Validate form
    const newErrors: Partial<LoginFormData> = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      if (key !== 'rememberMe') {
        const error = validateField(key as keyof LoginFormData, formData[key as keyof LoginFormData]);
        if (error) {
          newErrors[key as keyof LoginFormData] = error as any;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Button press animation
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await AuthService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLoginSuccess?.(response.data.user);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', response.message || 'Error en el inicio de sesión');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error de Conexión',
        error.message || 'Verifica tu conexión a internet'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Haptics.selectionAsync();
    Alert.alert('Próximamente', `Login con ${provider} estará disponible pronto`);
  };

  const handleNavigateToRegister = () => {
    Haptics.selectionAsync();
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    Haptics.selectionAsync();
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={componentStyles.container}
    >
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={componentStyles.gradient}
      >
        <ScrollView
          style={componentStyles.scrollView}
          contentContainerStyle={componentStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[componentStyles.header, logoAnimatedStyle]}>
            <LinearGradient
              colors={[styles.colors.primary, styles.colors.secondary]}
              style={componentStyles.logoContainer}
            >
              <Ionicons name="calendar" size={40} color="white" />
            </LinearGradient>
            
            <Text style={[componentStyles.appName, { color: styles.colors.text }]}>
              EventConnect
            </Text>
            <Text style={[componentStyles.tagline, { color: styles.colors.text + '80' }]}>
              Conecta con eventos extraordinarios
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[componentStyles.form, formAnimatedStyle]}>
            {/* Email Input */}
            <View style={componentStyles.inputContainer}>
              <Text style={[componentStyles.label, { color: styles.colors.text }]}>
                Correo electrónico
              </Text>
              <View style={[
                componentStyles.inputWrapper,
                {
                  backgroundColor: styles.colors.surface,
                  borderColor: focusedField === 'email' 
                    ? styles.colors.primary 
                    : errors.email 
                    ? '#ef4444' 
                    : styles.colors.surface,
                }
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={focusedField === 'email' ? styles.colors.primary : styles.colors.text + '60'} 
                  style={componentStyles.inputIcon}
                />
                <TextInput
                  style={[componentStyles.textInput, { color: styles.colors.text }]}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={() => handleFieldBlur('email')}
                  placeholder="tu@email.com"
                  placeholderTextColor={styles.colors.text + '60'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email && (
                <View style={componentStyles.errorContainer}>
                  <Ionicons name="warning-outline" size={16} color="#ef4444" />
                  <Text style={componentStyles.errorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={componentStyles.inputContainer}>
              <Text style={[componentStyles.label, { color: styles.colors.text }]}>
                Contraseña
              </Text>
              <View style={[
                componentStyles.inputWrapper,
                {
                  backgroundColor: styles.colors.surface,
                  borderColor: focusedField === 'password' 
                    ? styles.colors.primary 
                    : errors.password 
                    ? '#ef4444' 
                    : styles.colors.surface,
                }
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={focusedField === 'password' ? styles.colors.primary : styles.colors.text + '60'} 
                  style={componentStyles.inputIcon}
                />
                <TextInput
                  style={[componentStyles.textInput, { color: styles.colors.text }]}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={() => handleFieldBlur('password')}
                  placeholder="Tu contraseña"
                  placeholderTextColor={styles.colors.text + '60'}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowPassword(!showPassword);
                    Haptics.selectionAsync();
                  }}
                  style={componentStyles.passwordToggle}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={styles.colors.text + '60'} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <View style={componentStyles.errorContainer}>
                  <Ionicons name="warning-outline" size={16} color="#ef4444" />
                  <Text style={componentStyles.errorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={componentStyles.optionsRow}>
              <TouchableOpacity
                style={componentStyles.rememberMeContainer}
                onPress={() => {
                  handleInputChange('rememberMe', !formData.rememberMe);
                  Haptics.selectionAsync();
                }}
                disabled={isLoading}
              >
                <View style={[
                  componentStyles.checkbox,
                  {
                    backgroundColor: formData.rememberMe ? styles.colors.primary : 'transparent',
                    borderColor: formData.rememberMe ? styles.colors.primary : styles.colors.text + '40',
                  }
                ]}>
                  {formData.rememberMe && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={[componentStyles.rememberMeText, { color: styles.colors.text }]}>
                  Recordarme
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <Text style={[componentStyles.forgotPassword, { color: styles.colors.primary }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[componentStyles.loginButton, { opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[styles.colors.primary, styles.colors.secondary]}
                  style={componentStyles.loginButtonGradient}
                >
                  {isLoading ? (
                    <View style={componentStyles.loadingContainer}>
                      <Ionicons name="hourglass-outline" size={20} color="white" />
                      <Text style={componentStyles.loginButtonText}>Iniciando sesión...</Text>
                    </View>
                  ) : (
                    <Text style={componentStyles.loginButtonText}>Iniciar Sesión</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Social Login */}
            <View style={componentStyles.socialContainer}>
              <View style={componentStyles.divider}>
                <View style={[componentStyles.dividerLine, { backgroundColor: styles.colors.text + '20' }]} />
                <Text style={[componentStyles.dividerText, { color: styles.colors.text + '60' }]}>
                  O continúa con
                </Text>
                <View style={[componentStyles.dividerLine, { backgroundColor: styles.colors.text + '20' }]} />
              </View>

              <View style={componentStyles.socialButtons}>
                <TouchableOpacity
                  style={[componentStyles.socialButton, { backgroundColor: styles.colors.surface }]}
                  onPress={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={24} color="#4285f4" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[componentStyles.socialButton, { backgroundColor: styles.colors.surface }]}
                  onPress={() => handleSocialLogin('Facebook')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[componentStyles.socialButton, { backgroundColor: styles.colors.surface }]}
                  onPress={() => handleSocialLogin('Apple')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={24} color={styles.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Link */}
            <View style={componentStyles.registerContainer}>
              <Text style={[componentStyles.registerText, { color: styles.colors.text + '80' }]}>
                ¿No tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={handleNavigateToRegister} disabled={isLoading}>
                <Text style={[componentStyles.registerLink, { color: styles.colors.primary }]}>
                  Regístrate aquí
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialContainer: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;

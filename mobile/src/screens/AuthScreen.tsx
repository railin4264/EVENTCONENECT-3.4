import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  acceptTerms: boolean;
}

export default function AuthScreen() {
  const { login, register } = useAuth();
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    acceptTerms: false,
  });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.firstName || !registerForm.lastName || !registerForm.username || 
        !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!registerForm.acceptTerms) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        username: registerForm.username,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        dateOfBirth: registerForm.dateOfBirth,
      });
      
      Alert.alert(
        'Éxito', 
        'Cuenta creada exitosamente. Por favor inicia sesión.',
        [{ text: 'OK', onPress: () => setIsLogin(true) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Se enviará un enlace de recuperación a tu email',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => {
          // Implement forgot password logic
          Alert.alert('Info', 'Función de recuperación de contraseña en desarrollo');
        }},
      ]
    );
  };

  const renderInput = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    secureTextEntry?: boolean,
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric'
  ) => (
    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
      <View style={styles.inputIcon}>
        {icon}
      </View>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );

  const renderPasswordInput = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void
  ) => (
    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
      <View style={styles.inputIcon}>
        {icon}
      </View>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.passwordToggle}
        onPress={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff size={20} color={colors.textSecondary} />
        ) : (
          <Eye size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="flash" size={40} color="white" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a EventConnect'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLogin 
              ? 'Inicia sesión para continuar conectando' 
              : 'Crea tu cuenta y comienza a conectar'
            }
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          {isLogin ? (
            /* Login Form */
            <View style={styles.form}>
              {renderInput(
                <Mail size={20} color={colors.textSecondary} />,
                'Email',
                loginForm.email,
                (text) => setLoginForm(prev => ({ ...prev, email: text })),
                false,
                'email-address'
              )}

              {renderPasswordInput(
                <Lock size={20} color={colors.textSecondary} />,
                'Contraseña',
                loginForm.password,
                (text) => setLoginForm(prev => ({ ...prev, password: text })),
                showPassword,
                setShowPassword
              )}

              <View style={styles.formOptions}>
                <TouchableOpacity style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, { borderColor: colors.border }]}>
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
                    Recordarme
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={[styles.forgotPassword, { color: colors.primary }]}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.submitButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Register Form */
            <View style={styles.form}>
              <View style={styles.nameRow}>
                {renderInput(
                  <User size={20} color={colors.textSecondary} />,
                  'Nombre',
                  registerForm.firstName,
                  (text) => setRegisterForm(prev => ({ ...prev, firstName: text })),
                  false
                )}
                
                {renderInput(
                  <User size={20} color={colors.textSecondary} />,
                  'Apellido',
                  registerForm.lastName,
                  (text) => setRegisterForm(prev => ({ ...prev, lastName: text })),
                  false
                )}
              </View>

              {renderInput(
                <User size={20} color={colors.textSecondary} />,
                'Nombre de usuario',
                registerForm.username,
                (text) => setRegisterForm(prev => ({ ...prev, username: text })),
                false
              )}

              {renderInput(
                <Mail size={20} color={colors.textSecondary} />,
                'Email',
                registerForm.email,
                (text) => setRegisterForm(prev => ({ ...prev, email: text })),
                false,
                'email-address'
              )}

              {renderInput(
                <Phone size={20} color={colors.textSecondary} />,
                'Teléfono (opcional)',
                registerForm.phone,
                (text) => setRegisterForm(prev => ({ ...prev, phone: text })),
                false,
                'phone-pad'
              )}

              {renderInput(
                <Calendar size={20} color={colors.textSecondary} />,
                'Fecha de nacimiento (opcional)',
                registerForm.dateOfBirth,
                (text) => setRegisterForm(prev => ({ ...prev, dateOfBirth: text })),
                false
              )}

              {renderPasswordInput(
                <Lock size={20} color={colors.textSecondary} />,
                'Contraseña',
                registerForm.password,
                (text) => setRegisterForm(prev => ({ ...prev, password: text })),
                showPassword,
                setShowPassword
              )}

              {renderPasswordInput(
                <Lock size={20} color={colors.textSecondary} />,
                'Confirmar contraseña',
                registerForm.confirmPassword,
                (text) => setRegisterForm(prev => ({ ...prev, confirmPassword: text })),
                showConfirmPassword,
                setShowConfirmPassword
              )}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRegisterForm(prev => ({ ...prev, acceptTerms: !prev.acceptTerms }))}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    borderColor: colors.border,
                    backgroundColor: registerForm.acceptTerms ? colors.primary : 'transparent'
                  }
                ]}>
                  {registerForm.acceptTerms && (
                    <CheckCircle size={16} color="white" />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
                  Acepto los términos y condiciones
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.submitButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              O continúa con
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
              onPress={() => Alert.alert('Info', 'Login con Google en desarrollo')}
            >
              <Ionicons name="logo-google" size={24} color="#EA4335" />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
              onPress={() => Alert.alert('Info', 'Login con Facebook en desarrollo')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Facebook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
              onPress={() => Alert.alert('Info', 'Login con Apple en desarrollo')}
            >
              <Ionicons name="logo-apple" size={24} color={colors.text} />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Switch Mode */}
          <View style={styles.switchMode}>
            <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={[styles.switchModeButton, { color: colors.primary }]}>
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Seguro y confiable
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="globe" size={20} color={colors.info} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Conecta globalmente
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flash" size={20} color={colors.warning} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Rápido y fácil
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 4,
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
  },
  switchModeButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

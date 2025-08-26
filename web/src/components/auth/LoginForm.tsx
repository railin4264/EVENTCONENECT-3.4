'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  AtSymbolIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { authAPI } from '@/services/api';
import Link from 'next/link';

// ===== INTERFACES =====
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToRegister?: () => void;
  redirectTo?: string;
}

// ===== LOGIN FORM COMPONENT =====
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  redirectTo = '/dashboard'
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ===== VALIDATION =====
  const validateField = (name: keyof LoginFormData, value: any): string | null => {
    switch (name) {
      case 'email':
        if (!value) return 'El email es requerido';
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

  const validateForm = (): boolean => {
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
    return !hasErrors;
  };

  // ===== HANDLERS =====
  const handleInputChange = (field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        setLoginSuccess(true);
        
        // Store tokens
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        }

        // Call success callback
        onSuccess?.(response.data.user);
        
        // Redirect after a short delay to show success state
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      } else {
        setLoginError(response.message || 'Error en el inicio de sesión');
      }
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message || 
        error.message || 
        'Error de conexión. Verifica tu internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER INPUT FIELD =====
  const renderInputField = (
    field: keyof LoginFormData,
    label: string,
    type: string = 'text',
    icon: React.ReactNode,
    placeholder?: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
        
        <input
          type={field === 'password' ? (showPassword ? 'text' : 'password') : type}
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
        {field === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
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
              <LockClosedIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Bienvenido
            </h1>
            <p className="text-gray-300 mt-2">
              Inicia sesión en EventConnect
            </p>
          </div>

          {/* Success State */}
          <AnimatePresence>
            {loginSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-6"
              >
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">
                  ¡Inicio de sesión exitoso!
                </p>
                <p className="text-gray-400 text-sm">
                  Redirigiendo...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Error */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center space-x-2 text-red-400">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{loginError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            {renderInputField(
              'email',
              'Correo electrónico',
              'email',
              <AtSymbolIcon className="h-5 w-5" />,
              'tu@email.com'
            )}

            {/* Password Field */}
            {renderInputField(
              'password',
              'Contraseña',
              'password',
              <LockClosedIcon className="h-5 w-5" />,
              'Tu contraseña'
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-transparent border-2 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300">Recordarme</span>
              </label>

              <Link 
                href="/auth/forgot-password"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading || loginSuccess}
              className="relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" variant="neon" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : loginSuccess ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>¡Éxito!</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-gray-400">O continúa con</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </Button>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6">
              <span className="text-gray-400">¿No tienes cuenta? </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Regístrate aquí
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoginForm;

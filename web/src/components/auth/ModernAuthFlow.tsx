'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventConnectContext } from '@/contexts/EventConnectContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle,
  Chrome,
  Github,
  Facebook
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ModernAuthFlowProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onModeChange?: (mode: 'login' | 'register') => void;
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const ModernAuthFlow: React.FC<ModernAuthFlowProps> = ({ 
  mode, 
  onSuccess, 
  onModeChange 
}) => {
  const { login, register } = useEventConnectContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const schema = isRegister ? registerSchema : loginSchema;

  type FormValues = z.infer<typeof schema>;

  const { register: rhfRegister, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isRegister ? {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    } as any : {
      email: '',
      password: '',
    } as any,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError('');
    try {
      let ok = false;
      if (!isRegister) {
        ok = await login(values.email, values.password);
        if (!ok) setError('Email o contraseña incorrectos');
      } else {
        const { username, email, password, firstName, lastName } = values as any;
        ok = await register({ username, email, password, firstName, lastName });
        if (!ok) setError('Error al crear la cuenta. Verifica que el email no esté en uso.');
      }
      if (ok) onSuccess?.();
    } catch (e) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValue = watch('password' as any);

  const handleSocialAuth = (provider: string) => {
    console.log(`Authenticating with ${provider}`);
    // Implementar autenticación social
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a EventConnect'}
              </h1>
              
              <p className="text-gray-300">
                {mode === 'login' 
                  ? 'Inicia sesión para continuar' 
                  : 'Crea tu cuenta para comenzar'
                }
              </p>
            </div>

            {/* Social Auth */}
            <div className="space-y-3 mb-6">
              <Button 
                variant="glass" 
                fullWidth 
                onClick={() => handleSocialAuth('google')}
                className="group"
              >
                <Chrome className="w-5 h-5 mr-3" />
                Continuar con Google
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="glass" 
                  onClick={() => handleSocialAuth('github')}
                  className="group"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
                
                <Button 
                  variant="glass" 
                  onClick={() => handleSocialAuth('facebook')}
                  className="group"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-gray-400">o continúa con email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nombre de usuario"
                        className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all ${
                          errors.username ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                        }`}
                        {...rhfRegister('username' as any)}
                      />
                      {errors.username && (
                        <p className="text-red-400 text-sm mt-1">{String(errors.username.message)}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nombre"
                          className={`w-full pl-4 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all ${
                            errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                          }`}
                          {...rhfRegister('firstName' as any)}
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-1">{String(errors.firstName.message)}</p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Apellido"
                          className={`w-full pl-4 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all ${
                            errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                          }`}
                          {...rhfRegister('lastName' as any)}
                        />
                        {errors.lastName && (
                          <p className="text-red-400 text-sm mt-1">{String(errors.lastName.message)}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                  }`}
                  {...rhfRegister('email' as any)}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{String(errors.email.message)}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                  }`}
                  {...rhfRegister('password' as any)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{String(errors.password.message)}</p>
                )}
              </div>

              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirmar contraseña"
                        className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all ${
                          errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                        }`}
                        {...rhfRegister('confirmPassword' as any)}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">{String(errors.confirmPassword.message)}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              <Button 
                type="submit"
                variant="primary" 
                size="lg" 
                fullWidth
                loading={isLoading}
                className="group mt-6"
              >
                {isLoading ? (
                  'Procesando...'
                ) : (
                  <>
                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                {' '}
                <button
                  onClick={() => onModeChange?.(mode === 'login' ? 'register' : 'login')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>

            {mode === 'register' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Al crear una cuenta, aceptas nuestros{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">Términos de Servicio</a>
                  {' '}y{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">Política de Privacidad</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

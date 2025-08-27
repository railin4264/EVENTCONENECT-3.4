'use client';

import React, { useState } from 'react';
import { oauthService, OAuthProvider } from '@/services/oauthService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface OAuthButtonsProps {
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  variant?: 'default' | 'compact' | 'minimal';
  showLabels?: boolean;
  className?: string;
}

export default function OAuthButtons({
  onSuccess,
  onError,
  variant = 'default',
  showLabels = true,
  className = '',
}: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const providers = oauthService.getProviders();

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (isLoading) return;

    setIsLoading(provider.id);
    
    try {
      const response = await oauthService.loginWithProvider(provider.id);
      
      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Mostrar mensaje de éxito
      toast.success(`¡Bienvenido, ${response.user.name}!`);
      
      // Callback de éxito
      onSuccess?.(response.user);
      
      // Redirigir al dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error(`Error en login con ${provider.name}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al iniciar sesión con ${provider.name}: ${errorMessage}`);
      
      // Callback de error
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(null);
    }
  };

  const getButtonClasses = (provider: OAuthProvider) => {
    const baseClasses = 'flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} w-10 h-10 rounded-full text-white ${provider.color} hover:opacity-90 focus:ring-${provider.color}`;
      case 'minimal':
        return `${baseClasses} w-8 h-8 rounded-full text-white ${provider.color} hover:opacity-90 focus:ring-${provider.color}`;
      default:
        return `${baseClasses} w-full px-4 py-3 rounded-lg text-white ${provider.color} hover:opacity-90 focus:ring-${provider.color}`;
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-5 h-5';
      case 'minimal':
        return 'w-4 h-4';
      default:
        return 'w-5 h-5';
    }
  };

  const getProviderIcon = (provider: OAuthProvider) => {
    const iconSize = getIconSize();
    
    switch (provider.id) {
      case 'google':
        return (
          <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'apple':
        return (
          <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (providers.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm">
        No hay proveedores OAuth configurados
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {variant === 'default' && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>
      )}

      <div className={`grid ${variant === 'default' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleOAuthLogin(provider)}
            disabled={isLoading === provider.id}
            className={getButtonClasses(provider)}
            title={`Iniciar sesión con ${provider.name}`}
          >
            {isLoading === provider.id ? (
              <Loader2 className={`${getIconSize()} animate-spin`} />
            ) : (
              <>
                {getProviderIcon(provider)}
                {showLabels && variant === 'default' && (
                  <span className="ml-3">
                    Continuar con {provider.name}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {variant === 'default' && (
        <p className="text-xs text-gray-500 text-center">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Política de Privacidad
          </a>
        </p>
      )}
    </div>
  );
}

// Componente de botón OAuth individual
export function OAuthButton({
  provider,
  onClick,
  variant = 'default',
  showLabel = true,
  className = '',
}: {
  provider: OAuthProvider;
  onClick: () => void;
  variant?: 'default' | 'compact' | 'minimal';
  showLabel?: boolean;
  className?: string;
}) {
  const getButtonClasses = () => {
    const baseClasses = 'flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} w-10 h-10 rounded-full text-white ${provider.color} hover:opacity-90 focus:ring-${provider.color} ${className}`;
      case 'minimal':
        return `${baseClasses} w-8 h-8 rounded-full text-white ${provider.color} hover:opacity-90 focus:ring-${provider.color} ${className}`;
      default:
        return `${baseClasses} px-4 py-2 rounded-lg text-white ${provider.color} hover:opacity-90 focus:ring-${provider.color} ${className}`;
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-5 h-5';
      case 'minimal':
        return 'w-4 h-4';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
      title={`Iniciar sesión con ${provider.name}`}
    >
      {getProviderIcon(provider)}
      {showLabel && variant === 'default' && (
        <span className="ml-2">
          {provider.name}
        </span>
      )}
    </button>
  );
}

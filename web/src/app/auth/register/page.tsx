'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ModernAuthFlow } from '@/components/auth/ModernAuthFlow';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Registro exitoso');
    // Después del registro, ir al onboarding/configuración de intereses
    router.push('/'); // El ModernHeroSection manejará el onboarding
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    if (mode === 'login') {
      router.push('/auth/login');
    }
  };

  return (
    <ModernAuthFlow 
      mode="register"
      onSuccess={handleSuccess}
      onModeChange={handleModeChange}
    />
  );
}

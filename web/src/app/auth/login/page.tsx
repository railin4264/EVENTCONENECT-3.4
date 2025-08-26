'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ModernAuthFlow } from '@/components/auth/ModernAuthFlow';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Login exitoso');
    router.push('/'); // Redirigir al home después del login
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      router.push('/auth/register');
    }
  };

  return (
    <ModernAuthFlow 
      mode="login"
      onSuccess={handleSuccess}
      onModeChange={handleModeChange}
    />
  );
}

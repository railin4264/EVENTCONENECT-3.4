'use client';

import React from 'react';
import { PersonalizableDashboard } from '@/components/dashboard/PersonalizableDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  // Redirect if not authenticated
  if (!isLoading && !user) {
    redirect('/auth/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Dashboard Personalizable"
          subtitle="Personaliza tu vista de EventConnect"
          showBackButton={false}
        />
        <PersonalizableDashboard />
      </div>
    </div>
  );
}
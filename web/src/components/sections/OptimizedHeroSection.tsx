import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { logComponentMount, logUserAction } from '@/lib/debug';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users,
  Sparkles,
  Zap
} from 'lucide-react';

// Optimized Hero Section for improved LCP
export const OptimizedHeroSection: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    logComponentMount('OptimizedHeroSection');
  }, []);

  const handleExploreEvents = () => {
    logUserAction('click_explore_events');
    console.log('Navegando a eventos...');
    router.push('/events');
  };

  const handleJoinCommunity = () => {
    logUserAction('click_join_community');
    console.log('Navegando a registro...');
    router.push('/auth/login');
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
      
      {/* Main content - simplified for fast LCP */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Simplified title without complex animations */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Bienvenido a
            <br />
            <span className="text-cyan-400">EventConnect</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Descubre eventos increíbles, conecta con personas afines y crea experiencias únicas
          </p>
        </div>

        {/* Call to action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            variant="primary" 
            size="xl" 
            className="min-w-[200px]"
            onClick={handleExploreEvents}
          >
            <Search className="w-5 h-5 mr-2" />
            Explorar Eventos
          </Button>
          <Button 
            variant="outline" 
            size="xl" 
            className="min-w-[200px]"
            onClick={handleJoinCommunity}
          >
            <Users className="w-5 h-5 mr-2" />
            Unirse a la Comunidad
          </Button>
        </div>

        {/* Simple feature icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-sm text-gray-300 font-medium">Buscar</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-sm text-gray-300 font-medium">Ubicación</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-sm text-gray-300 font-medium">Calendario</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-sm text-gray-300 font-medium">Premium</span>
          </div>
        </div>
      </div>
    </section>
  );
};

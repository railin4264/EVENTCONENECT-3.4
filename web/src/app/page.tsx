'use client';

import React, { Suspense, lazy } from 'react';
import { ModernHeroSection } from '@/components/sections/ModernHeroSection';
import { NearbyEventsSection } from '@/components/sections/NearbyEventsSection';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardTitle,
  CardSubtitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Zap,
  Globe,
  Heart,
} from 'lucide-react';

// Component lazy loading para mejor performance con delay
const LazyNearbyEventsSection = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => resolve({ default: NearbyEventsSection }), 50);
  })
);
const LazyFeaturedEventsSection = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => resolve({ default: FeaturedEventsSection }), 100);
  })
);
const LazyFeaturesSection = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => resolve({ default: FeaturesSection }), 200);
  })
);
const LazyCTASection = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => resolve({ default: CTASection }), 300);
  })
);

// ===== FEATURED EVENTS SECTION =====
const FeaturedEventsSection: React.FC = () => {
  const router = useRouter();

  const handleEventClick = (eventId: number) => {
    console.log(`Navegando al evento ${eventId}`);
    router.push(`/events/${eventId}`);
  };
  const events = [
    {
      id: 1,
      title: 'Festival de Música Electrónica',
      location: 'Madrid, España',
      date: '15 Dic 2024',
      attendees: '2.5K',
      rating: 4.8,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUUyOTNCIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiMwNkI2RDQiLz4KPHN2ZyB4PSIxNjAiIHk9IjEyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIj4KPHN0eWxlPi5tdXNpYyB7IGFuaW1hdGlvbjogcHVsc2UgMnMgaW5maW5pdGU7IH0gQGtleWZyYW1lcyBwdWxzZSB7IDAlLCAxMDAlIHsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfSA1MCUgeyB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7IH0gfTwvc3R5bGU+CjxyZWN0IGNsYXNzPSJtdXNpYyIgeD0iMTAiIHk9IjQ1IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMCIgZmlsbD0iIzA2QjZENCIvPgo8cmVjdCBjbGFzcz0ibXVzaWMiIHg9IjIyIiB5PSIzNSIgd2lkdGg9IjYiIGhlaWdodD0iMjAiIGZpbGw9IiMwNkI2RDQiLz4KPHJlY3QgY2xhc3M9Im11c2ljIiB4PSIzNCIgeT0iMjUiIHdpZHRoPSI2IiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDZCNkQ0Ii8+CjxyZWN0IGNsYXNzPSJtdXNpYyIgeD0iNDYiIHk9IjQwIiB3aWR0aD0iNiIgaGVpZ2h0PSIxNSIgZmlsbD0iIzA2QjZENCIvPgo8L3N2Zz4KPC9zdmc+',
    },
    {
      id: 2,
      title: 'Conferencia de Tecnología',
      location: 'Barcelona, España',
      date: '20 Dic 2024',
      attendees: '1.2K',
      rating: 4.9,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUUyOTNCIi8+CjxyZWN0IHg9IjE1MCIgeT0iMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iIzNCODJGNiIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNDAiIHI9IjE1IiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjE3MCIgeT0iMTkwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDIiIGZpbGw9IiMzQjgyRjYiLz4KPHJlY3QgeD0iMTc1IiB5PSIxOTQiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzNCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=',
    },
    {
      id: 3,
      title: 'Exposición de Arte Contemporáneo',
      location: 'Valencia, España',
      date: '25 Dic 2024',
      attendees: '800',
      rating: 4.7,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUUyOTNCIi8+CjxyZWN0IHg9IjEwMCIgeT0iNzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzhCNUNGNiIvPgo8cmVjdCB4PSIyMjAiIHk9IjEwMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRUM0ODk5Ii8+CjxyZWN0IHg9IjE0MCIgeT0iMTgwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkJCRjI0Ii8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE4MCIgcj0iMjUiIGZpbGw9IiMxMEI5ODEiLz4KPC9zdmc+',
    },
  ];

  return (
    <section className='py-20 bg-gradient-to-b from-slate-900 to-slate-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            Eventos{' '}
            <span className='bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'>
              Destacados
            </span>
          </h2>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
            Descubre los eventos más populares y trending de la temporada
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card variant='interactive' className='h-full'>
                <div className='relative'>
                  <img
                    src={event.image}
                    alt={event.title}
                    className='w-full h-48 object-cover rounded-t-xl'
                    loading="lazy"
                    decoding="async"
                    style={{ contentVisibility: 'auto' }}
                  />
                  <div className='absolute top-4 right-4'>
                    <div className='bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center'>
                      <Star className='w-4 h-4 mr-1 text-yellow-400 fill-current' />
                      {event.rating}
                    </div>
                  </div>
                </div>

                <CardContent className='p-6'>
                  <CardTitle className='text-xl mb-2'>{event.title}</CardTitle>

                  <div className='space-y-2 mb-4'>
                    <div className='flex items-center text-gray-300'>
                      <MapPin className='w-4 h-4 mr-2 text-cyan-400' />
                      {event.location}
                    </div>
                    <div className='flex items-center text-gray-300'>
                      <Calendar className='w-4 h-4 mr-2 text-purple-400' />
                      {event.date}
                    </div>
                    <div className='flex items-center text-gray-300'>
                      <Users className='w-4 h-4 mr-2 text-green-400' />
                      {event.attendees} asistentes
                    </div>
                  </div>

                  <Button 
                    variant='primary' 
                    fullWidth
                    onClick={() => handleEventClick(event.id)}
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== FEATURES SECTION =====
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Globe className='w-8 h-8' />,
      title: 'Descubrimiento Global',
      description:
        'Explora eventos de todo el mundo con nuestro sistema de recomendaciones inteligente',
    },
    {
      icon: <Zap className='w-8 h-8' />,
      title: 'Notificaciones en Tiempo Real',
      description: 'Recibe alertas instantáneas sobre eventos que te interesan',
    },
    {
      icon: <Heart className='w-8 h-8' />,
      title: 'Comunidades Apasionadas',
      description: 'Únete a tribus que comparten tus intereses y pasiones',
    },
    {
      icon: <TrendingUp className='w-8 h-8' />,
      title: 'Análisis Avanzado',
      description:
        'Obtén insights sobre eventos populares y tendencias emergentes',
    },
  ];

  return (
    <section className='py-20 bg-gradient-to-b from-slate-800 to-slate-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            ¿Por qué elegir{' '}
            <span className='bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'>
              EventConnect
            </span>
            ?
          </h2>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
            La plataforma más avanzada para conectar con eventos y comunidades
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card variant='glass' className='h-full text-center p-6'>
                <div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white'>
                  {feature.icon}
                </div>
                <CardTitle className='text-xl mb-3'>{feature.title}</CardTitle>
                <CardSubtitle className='text-gray-300'>
                  {feature.description}
                </CardSubtitle>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== CTA SECTION =====
const CTASection: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    console.log('Navegando a registro...');
    router.push('/auth/register');
  };

  const handleDemo = () => {
    console.log('Mostrando demo...');
    // Aquí podrías mostrar un modal de demo o navegar a una demo
    alert('Demo próximamente disponible');
  };
  return (
    <section className='py-20 bg-gradient-to-r from-cyan-900/20 to-purple-900/20'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            ¿Listo para{' '}
            <span className='bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'>
              conectar
            </span>
            ?
          </h2>
          <p className='text-xl text-gray-300 mb-8'>
            Únete a miles de personas que ya están descubriendo eventos
            increíbles y creando conexiones duraderas
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button 
              variant='primary' 
              size='xl' 
              glow
              onClick={handleGetStarted}
            >
              Comenzar Gratis
            </Button>
            <Button 
              variant='outline' 
              size='xl'
              onClick={handleDemo}
            >
              Ver Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ===== LOADING SKELETON =====
const SectionSkeleton: React.FC = () => (
  <section className='py-20 bg-gradient-to-b from-slate-900 to-slate-800'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='h-8 bg-slate-700 rounded w-1/3 mx-auto mb-16 animate-pulse' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {[1, 2, 3].map(i => (
          <div key={i} className='h-96 bg-slate-700 rounded-xl animate-pulse' />
        ))}
      </div>
    </div>
  </section>
);

// ===== MAIN PAGE COMPONENT =====
export default function HomePage() {
  return (
    <main className='min-h-screen'>
      {/* Modern Hero Section with Interest & Location Onboarding */}
      <ModernHeroSection />

      {/* Nearby Events Section - NEW! */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyNearbyEventsSection />
      </Suspense>

      {/* Featured Events - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyFeaturedEventsSection />
      </Suspense>

      {/* Features - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyFeaturesSection />
      </Suspense>

      {/* CTA Section - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyCTASection />
      </Suspense>
    </main>
  );
}

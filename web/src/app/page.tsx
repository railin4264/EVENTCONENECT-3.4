'use client';

import React from 'react';
import { PersonalizedHome } from '@/components/sections/PersonalizedHome';
import { useAuth } from '@/hooks/useAuth';

// Importaciones para landing page (usuarios no autenticados)
import { HeroSection } from '@/components/sections/HeroSection';
import { Card, CardContent, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Star, TrendingUp, Zap, Globe, Heart } from 'lucide-react';

// ===== FEATURED EVENTS SECTION =====
const FeaturedEventsSection: React.FC = () => {
  const events = [
    {
      id: 1,
      title: "Festival de Música Electrónica",
      location: "Madrid, España",
      date: "15 Dic 2024",
      attendees: "2.5K",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Conferencia de Tecnología",
      location: "Barcelona, España",
      date: "20 Dic 2024",
      attendees: "1.2K",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Exposición de Arte Contemporáneo",
      location: "Valencia, España",
      date: "25 Dic 2024",
      attendees: "800",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Eventos <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Destacados</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre los eventos más populares y trending de la temporada
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card variant="interactive" className="h-full">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      {event.rating}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-2 text-green-400" />
                      {event.attendees} asistentes
                    </div>
                  </div>
                  
                  <Button variant="primary" fullWidth>
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
      icon: <Globe className="w-8 h-8" />,
      title: "Descubrimiento Global",
      description: "Explora eventos de todo el mundo con nuestro sistema de recomendaciones inteligente"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Notificaciones en Tiempo Real",
      description: "Recibe alertas instantáneas sobre eventos que te interesan"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Comunidades Apasionadas",
      description: "Únete a tribus que comparten tus intereses y pasiones"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Análisis Avanzado",
      description: "Obtén insights sobre eventos populares y tendencias emergentes"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Por qué elegir <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">EventConnect</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            La plataforma más avanzada para conectar con eventos y comunidades
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="h-full text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                <CardSubtitle className="text-gray-300">{feature.description}</CardSubtitle>
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
  return (
    <section className="py-20 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">conectar</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de personas que ya están descubriendo eventos increíbles y 
            creando conexiones duraderas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="xl" glow>
              Comenzar Gratis
            </Button>
            <Button variant="outline" size="xl">
              Ver Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ===== MAIN PAGE COMPONENT =====
export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // Si el usuario está autenticado, mostrar home personalizado
  if (isAuthenticated) {
    return <PersonalizedHome />;
  }

  // Si no está autenticado, mostrar landing page
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Events */}
      <FeaturedEventsSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* CTA Section */}
      <CTASection />
    </main>
  );
}

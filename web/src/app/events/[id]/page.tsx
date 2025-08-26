'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import SocialShareModal from '@/components/share/SocialShareModal';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  Heart, 
  Bookmark, 
  Share2,
  ArrowLeft,
  ExternalLink,
  Navigation,
  Phone,
  Globe
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  price: string;
  image: string;
  organizer: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  rating: number;
  tags: string[];
  isLiked: boolean;
  isSaved: boolean;
  isAttending: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'attendees' | 'reviews'>('details');

  // Mock event data - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvent({
        id: eventId,
        title: 'Tech Meetup Barcelona 2024',
        description: 'Únete a desarrolladores y entusiastas de la tecnología para una noche de networking y charlas inspiradoras sobre el futuro del desarrollo web, IA y blockchain. Este evento reunirá a los mejores talentos de la industria tecnológica catalana.',
        date: '15 Dic 2024',
        time: '19:00',
        location: 'Barcelona, España',
        address: 'Centro de Convenciones Barcelona, Av. Diagonal 123',
        category: 'Tecnología',
        attendees: 245,
        maxAttendees: 300,
        price: 'Gratis',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
        organizer: {
          name: 'TechBarcelona',
          avatar: 'https://ui-avatars.com/api/?name=TechBarcelona&background=67e8f9&color=fff',
          verified: true
        },
        rating: 4.8,
        tags: ['Web Development', 'AI', 'Blockchain', 'Networking'],
        isLiked: false,
        isSaved: false,
        isAttending: false
      });
      setIsLoading(false);
    }, 1000);
  }, [eventId]);

  const handleJoinEvent = () => {
    if (!event) return;
    setEvent({ ...event, isAttending: !event.isAttending });
  };

  const handleLikeEvent = () => {
    if (!event) return;
    setEvent({ ...event, isLiked: !event.isLiked });
  };

  const handleSaveEvent = () => {
    if (!event) return;
    setEvent({ ...event, isSaved: !event.isSaved });
  };

  const handleGetDirections = () => {
    if (event?.address) {
      const encodedAddress = encodeURIComponent(event.address);
      window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Evento no encontrado</h2>
            <Button onClick={() => router.push('/events')}>
              Volver a eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="pt-8 pb-4 px-4">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Event Hero */}
        <div className="px-4 mb-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Event Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full border border-cyan-400/30">
                    {event.category}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-200">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span>{event.attendees} asistentes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span>{event.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mb-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                variant={event.isAttending ? "outline" : "primary"}
                size="lg"
                onClick={handleJoinEvent}
                className={event.isAttending ? "border-green-500 text-green-400" : ""}
              >
                <Users className="w-5 h-5 mr-2" />
                {event.isAttending ? 'Asistiendo' : 'Unirse al Evento'}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleLikeEvent}
                className={event.isLiked ? "text-red-400" : ""}
              >
                <Heart className={`w-5 h-5 mr-2 ${event.isLiked ? 'fill-current' : ''}`} />
                Me gusta
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleSaveEvent}
                className={event.isSaved ? "text-yellow-400" : ""}
              >
                <Bookmark className={`w-5 h-5 mr-2 ${event.isSaved ? 'fill-current' : ''}`} />
                Guardar
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
              </Button>

              {event.address && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGetDirections}
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Cómo llegar
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {[
                { id: 'details', label: 'Detalles' },
                { id: 'attendees', label: `Asistentes (${event.attendees})` },
                { id: 'reviews', label: 'Reseñas' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {activeTab === 'details' && (
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-semibold text-white mb-6">Descripción</h3>
                        <p className="text-gray-300 leading-relaxed mb-8">
                          {event.description}
                        </p>

                        <h4 className="text-lg font-semibold text-white mb-4">Tags</h4>
                        <div className="flex flex-wrap gap-2 mb-8">
                          {event.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-400/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {event.address && (
                          <>
                            <h4 className="text-lg font-semibold text-white mb-4">Ubicación</h4>
                            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                              <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                              <div className="flex-1">
                                <p className="text-white font-medium">{event.location}</p>
                                <p className="text-gray-300 text-sm">{event.address}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGetDirections}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'attendees' && (
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-semibold text-white mb-6">
                          Asistentes ({event.attendees})
                        </h3>
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Lista de asistentes disponible próximamente</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'reviews' && (
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-semibold text-white mb-6">Reseñas</h3>
                        <div className="text-center py-12">
                          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Las reseñas estarán disponibles después del evento</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Organizer Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Organizador</h3>
                      <div className="flex items-center space-x-3">
                        <img
                          src={event.organizer.avatar}
                          alt={event.organizer.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-white">{event.organizer.name}</p>
                            {event.organizer.verified && (
                              <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">Organizador verificado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Event Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Información del Evento</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Precio</span>
                          <span className="text-white font-medium">{event.price}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Asistentes</span>
                          <span className="text-white font-medium">{event.attendees}/{event.maxAttendees}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white font-medium">{event.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          image: event.image
        }}
      />
    </div>
  );
}

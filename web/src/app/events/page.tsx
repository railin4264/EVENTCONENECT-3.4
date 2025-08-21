'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Heart,
  Share,
  Clock,
  ArrowRight,
  TrendingUp,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle, CardBadge } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';

// ===== EVENT INTERFACE =====
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  price: string;
  image: string;
  isLiked: boolean;
  isTrending: boolean;
  tags: string[];
  organizer: string;
  rating: number;
}

// ===== FILTER INTERFACE =====
interface FilterState {
  category: string;
  location: string;
  date: string;
  price: string;
  attendees: string;
}

// ===== SAMPLE EVENTS DATA =====
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Meetup Barcelona 2024',
    description: 'Únete a desarrolladores y entusiastas de la tecnología para una noche de networking y charlas inspiradoras sobre el futuro del desarrollo web, IA y blockchain.',
    date: '15 Dic 2024',
    time: '19:00',
    location: 'Barcelona, España',
    category: 'Tecnología',
    attendees: 45,
    maxAttendees: 80,
    price: 'Gratis',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600',
    isLiked: true,
    isTrending: true,
    tags: ['Web Development', 'AI', 'Networking'],
    organizer: 'TechBarcelona',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Festival de Música Urbana Madrid',
    description: 'Celebra la cultura urbana con los mejores artistas del momento. Una noche llena de ritmo, baile y energía positiva que no te puedes perder.',
    date: '20 Dic 2024',
    time: '22:00',
    location: 'Madrid, España',
    category: 'Música',
    attendees: 120,
    maxAttendees: 200,
    price: '€25',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    isLiked: false,
    isTrending: false,
    tags: ['Hip Hop', 'Reggaeton', 'Dance'],
    organizer: 'UrbanFest',
    rating: 4.6,
  },
  {
    id: '3',
    title: 'Workshop de Arte Digital Avanzado',
    description: 'Aprende técnicas avanzadas de arte digital con herramientas modernas como Procreate, Photoshop y Blender. Perfecto para artistas que quieren expandir sus habilidades.',
    date: '22 Dic 2024',
    time: '16:00',
    location: 'Valencia, España',
    category: 'Arte',
    attendees: 18,
    maxAttendees: 25,
    price: '€45',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
    isLiked: false,
    isTrending: true,
    tags: ['Digital Art', 'Procreate', 'Design'],
    organizer: 'DigitalArt Studio',
    rating: 4.9,
  },
  {
    id: '4',
    title: 'Networking Empresarial Sevilla',
    description: 'Conecta con emprendedores y profesionales del sector empresarial. Oportunidades únicas de colaboración, inversión y crecimiento para tu negocio.',
    date: '25 Dic 2024',
    time: '18:30',
    location: 'Sevilla, España',
    category: 'Negocios',
    attendees: 35,
    maxAttendees: 60,
    price: '€30',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    isLiked: false,
    isTrending: false,
    tags: ['Business', 'Startup', 'Networking'],
    organizer: 'BizSevilla',
    rating: 4.5,
  },
];

export default function EventsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'Todas',
    location: 'Cerca de mí',
    date: 'Esta semana',
    price: 'Todos',
    attendees: 'Cualquiera',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eventsPageFilters');
      if (saved) setFilters(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('eventsPageFilters', JSON.stringify(filters));
    } catch {}
  }, [filters]);

  return (
    <main>
      {process.env.NEXT_PUBLIC_DEMO === 'true' && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 text-center">
            Estás en modo demo. Esta página usa datos locales.
          </div>
        </div>
      )}
      {/* ... the rest of the existing file remains unchanged ... */}
    </main>
  );
}
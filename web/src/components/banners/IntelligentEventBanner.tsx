'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
  SparklesIcon,
  ArrowRightIcon,
  FireIcon,
  ClockIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { eventsAPI } from '@/services/api';
import Image from 'next/image';

// ===== INTERFACES =====
interface FeaturedEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  location: {
    address: string;
    coordinates: number[];
    distance?: number;
  };
  category: string;
  price: number;
  attendees: number;
  rating: number;
  organizer: {
    name: string;
    verified: boolean;
  };
  matchScore: number;
  matchReasons: string[];
  isTrending: boolean;
  spotsLeft?: number;
}

interface BannerProps {
  userId?: string;
  userInterests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

// ===== INTELLIGENT EVENT BANNER COMPONENT =====
export const IntelligentEventBanner: React.FC<BannerProps> = ({
  userId,
  userInterests = [],
  location: userLocation,
}) => {
  const router = useRouter();
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== LOAD FEATURED EVENTS =====
  useEffect(() => {
    loadFeaturedEvents();
    startAutoScroll();
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [userLocation, userInterests]);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      handleNext();
    }, 6000); // Change slide every 6 seconds
  };

  const handleUserInteraction = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get user location from browser if not provided
      let location = userLocation;
      if (!location && typeof window !== 'undefined' && 'geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            });
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Geolocation not available or denied');
        }
      }

      // Fetch featured events with AI-powered recommendations
      const response = await eventsAPI.getFeaturedEvents({
        userId,
        interests: userInterests,
        location,
        limit: 5
      });

      if (response.success) {
        setFeaturedEvents(response.data);
      } else {
        // Fallback to mock data if API fails
        setFeaturedEvents(getMockFeaturedEvents());
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
      setFeaturedEvents(getMockFeaturedEvents());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockFeaturedEvents = (): FeaturedEvent[] => [
    {
      id: '1',
      title: 'Tech Innovation Summit 2024',
      description: 'Join industry leaders for the most innovative tech conference of the year',
      imageUrl: '/images/events/tech-summit.jpg',
      startDate: '2024-03-15T09:00:00Z',
      location: {
        address: 'San Francisco Convention Center',
        coordinates: [37.7749, -122.4194]
      },
      category: 'Technology',
      price: 299,
      attendees: 1200,
      rating: 4.8,
      organizer: {
        name: 'TechCorp',
        verified: true
      },
      matchScore: 95,
      matchReasons: ['Matches your tech interests', 'High-rated event', 'Great networking opportunity'],
      isTrending: true,
      spotsLeft: 45
    },
    {
      id: '2',
      title: 'Jazz Under the Stars',
      description: 'An evening of smooth jazz music in a beautiful outdoor setting',
      imageUrl: '/images/events/jazz-night.jpg',
      startDate: '2024-03-20T19:00:00Z',
      location: {
        address: 'Central Park Amphitheater',
        coordinates: [40.7829, -73.9654]
      },
      category: 'Music',
      price: 45,
      attendees: 300,
      rating: 4.6,
      organizer: {
        name: 'Jazz Society',
        verified: true
      },
      matchScore: 87,
      matchReasons: ['Perfect for music lovers', 'Outdoor venue', 'Affordable price'],
      isTrending: false,
      spotsLeft: 120
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === featuredEvents.length - 1 ? 0 : prev + 1
    );
    handleUserInteraction();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? featuredEvents.length - 1 : prev - 1
    );
    handleUserInteraction();
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
        <div className="text-center text-white">
          <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
          <h3 className="text-2xl font-bold mb-2">No Featured Events</h3>
          <p className="text-blue-100">Check back later for amazing events!</p>
        </div>
      </div>
    );
  }

  const currentEvent = featuredEvents[currentIndex];

  return (
    <div className="w-full" ref={containerRef}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative w-full h-96 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={currentEvent.imageUrl}
              alt={currentEvent.title}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center p-8">
            <div className="w-full max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div className="space-y-6">
                  {/* Event Badges */}
                  <div className="flex items-center gap-3">
                    {currentEvent.isTrending && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full"
                      >
                        <FireIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm font-semibold">Trending</span>
                      </motion.div>
                    )}
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 backdrop-blur-sm rounded-full"
                    >
                      <SparklesIcon className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 text-sm font-semibold">
                        {currentEvent.matchScore}% Match
                      </span>
                    </motion.div>
                  </div>

                  {/* Event Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl lg:text-5xl font-bold text-white leading-tight"
                  >
                    {currentEvent.title}
                  </motion.h2>

                  {/* Event Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-blue-100 max-w-lg"
                  >
                    {currentEvent.description}
                  </motion.p>

                  {/* Event Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-6 text-white/80"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span className="text-sm">
                        {new Date(currentEvent.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5" />
                      <span className="text-sm">{currentEvent.location.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-5 h-5" />
                      <span className="text-sm">{currentEvent.attendees} attending</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm">{currentEvent.rating}</span>
                    </div>
                  </motion.div>

                  {/* Match Reasons */}
                  {currentEvent.matchReasons.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                    >
                      <p className="text-sm text-cyan-400 mb-2 font-semibold">
                        Why we recommend this:
                      </p>
                      <ul className="space-y-1">
                        {currentEvent.matchReasons.map((reason, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                            <span className="text-cyan-400">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    <div>
                      <p className="text-sm text-gray-400">Starting from</p>
                      <p className="text-3xl font-bold text-white">
                        {currentEvent.price === 0 ? 'FREE' : `$${currentEvent.price}`}
                      </p>
                    </div>
                    
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => router.push(`/events/${currentEvent.id}`)}
                      className="flex items-center gap-2"
                    >
                      Get Tickets
                      <ArrowRightIcon className="w-5 h-5" />
                    </Button>

                    {currentEvent.spotsLeft && currentEvent.spotsLeft < 50 && (
                      <div className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg">
                        <p className="text-red-400 font-semibold text-sm">
                          Only {currentEvent.spotsLeft} spots left!
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Right Content - Empty for now, can add additional visuals */}
                <div className="hidden lg:block" />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex items-center gap-4">
              <button
                onClick={handlePrevious}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ArrowRightIcon className="w-5 h-5 text-white rotate-180" />
              </button>
              
              <div className="flex gap-2">
                {featuredEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleUserInteraction();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ArrowRightIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IntelligentEventBanner;




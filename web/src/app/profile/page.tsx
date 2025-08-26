'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Edit,
  Camera,
  MapPin,
  Calendar,
  Users,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Star,
  Award,
  Activity,
  TrendingUp,
  Mail,
  Phone,
  Link,
  Instagram,
  Twitter,
  Facebook,
  Shield,
  Crown,
  MoreVertical,
  Plus,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  profilePicture: string;
  coverImage: string;
  isVerified: boolean;
  isPremium: boolean;
  joinedAt: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  stats: {
    eventsCreated: number;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    totalLikes: number;
    profileViews: number;
    achievementsCount: number;
    averageRating: number;
  };
  interests: string[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'event_created' | 'post_liked' | 'tribe_joined' | 'achievement_unlocked';
    description: string;
    timestamp: string;
  }>;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  attendeesCount: number;
  category: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'saved' | 'stats'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'María González',
        username: 'mariag_dev',
        email: 'maria@example.com',
        bio: 'Desarrolladora Frontend apasionada por React y el diseño UX. Creadora de comunidades tech. 🚀✨ Siempre aprendiendo algo nuevo.',
        location: 'Madrid, España',
        website: 'https://mariagonzalez.dev',
        profilePicture: 'https://ui-avatars.com/api/?name=Maria Gonzalez&background=67e8f9&color=fff&size=200',
        coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=300&fit=crop',
        isVerified: true,
        isPremium: true,
        joinedAt: '2023-01-15T00:00:00Z',
        socialLinks: {
          instagram: '@mariag_dev',
          twitter: '@mariagonzalez',
          facebook: 'maria.gonzalez.dev',
        },
        stats: {
          eventsCreated: 12,
          postsCount: 89,
          followersCount: 1240,
          followingCount: 340,
          totalLikes: 2840,
          profileViews: 5670,
          achievementsCount: 8,
          averageRating: 4.8,
        },
        interests: ['React', 'TypeScript', 'UI/UX', 'Fotografía', 'Viajes', 'Café', 'Música', 'Lectura'],
        achievements: [
          {
            id: '1',
            title: 'Organizador Estrella',
            description: 'Organizó 10+ eventos exitosos',
            icon: '🌟',
            unlockedAt: '2024-01-10T00:00:00Z',
          },
          {
            id: '2',
            title: 'Mentor de la Comunidad',
            description: 'Ayudó a 50+ desarrolladores',
            icon: '👨‍🏫',
            unlockedAt: '2024-01-05T00:00:00Z',
          },
          {
            id: '3',
            title: 'Fotógrafo del Mes',
            description: 'Mejor foto de evento en diciembre',
            icon: '📸',
            unlockedAt: '2023-12-20T00:00:00Z',
          },
        ],
        recentActivity: [
          {
            id: '1',
            type: 'event_created',
            description: 'Creó el evento "React Workshop Avanzado"',
            timestamp: '2024-01-12T10:30:00Z',
          },
          {
            id: '2',
            type: 'achievement_unlocked',
            description: 'Desbloqueó el logro "Organizador Estrella"',
            timestamp: '2024-01-10T15:20:00Z',
          },
          {
            id: '3',
            type: 'tribe_joined',
            description: 'Se unió a la tribu "Fotógrafos Urbanos"',
            timestamp: '2024-01-08T09:15:00Z',
          },
        ],
      });

      setPosts([
        {
          id: '1',
          content: '🚀 ¡Increíble sesión de coding today! Implementamos un sistema de chat en tiempo real con Socket.IO y React. La experiencia de desarrollo fue súper fluida. ¿Alguien más trabajando con WebSockets últimamente?',
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
          createdAt: '2024-01-12T14:30:00Z',
          likesCount: 45,
          commentsCount: 12,
          isLiked: true,
        },
        {
          id: '2',
          content: 'Compartiendo algunos tips de UX que he aprendido organizando eventos tech:\n\n1️⃣ La primera impresión importa muchísimo\n2️⃣ Keep it simple, but powerful\n3️⃣ Feedback inmediato es clave\n4️⃣ Accesibilidad no es opcional\n\n¿Qué otros consejos añadirían?',
          createdAt: '2024-01-10T16:45:00Z',
          likesCount: 67,
          commentsCount: 23,
          isLiked: false,
        },
        {
          id: '3',
          content: '📸 Capturando momentos increíbles en el último meetup. Hay algo mágico en ver a la comunidad conectar y compartir conocimiento. ¡Gracias a todos los que hicieron posible este evento!',
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop',
          createdAt: '2024-01-08T19:20:00Z',
          likesCount: 89,
          commentsCount: 34,
          isLiked: true,
        },
      ]);

      setEvents([
        {
          id: '1',
          title: 'React Workshop Avanzado',
          date: '2024-02-15T18:00:00Z',
          location: 'Madrid Tech Hub',
          image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=250&fit=crop',
          attendeesCount: 85,
          category: 'Tech',
        },
        {
          id: '2',
          title: 'Fotografía Urbana - Street Photography',
          date: '2024-02-20T10:00:00Z',
          location: 'Centro de Madrid',
          image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
          attendeesCount: 32,
          category: 'Arte',
        },
        {
          id: '3',
          title: 'Networking Café & Code',
          date: '2024-02-25T17:30:00Z',
          location: 'Café Central',
          image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=250&fit=crop',
          attendeesCount: 56,
          category: 'Networking',
        },
      ]);

      setSavedPosts([
        {
          id: '4',
          content: 'Interesante artículo sobre las mejores prácticas en React 18. Definitivamente vale la pena darle un vistazo si estás trabajando con concurrent features.',
          createdAt: '2024-01-11T12:30:00Z',
          likesCount: 124,
          commentsCount: 28,
          isLiked: true,
        },
        {
          id: '5',
          content: 'Tutorial paso a paso para configurar TypeScript con Next.js 14. Incluye todas las configuraciones avanzadas que necesitas.',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
          createdAt: '2024-01-09T08:15:00Z',
          likesCount: 87,
          commentsCount: 15,
          isLiked: false,
        },
      ]);

      setIsLoading(false);
    }, 1000);
  };

  const handleTabChange = (tab: 'posts' | 'events' | 'saved' | 'stats') => {
    setActiveTab(tab);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <p className="text-gray-900 dark:text-white text-sm leading-relaxed mb-4 whitespace-pre-line">
        {post.content}
      </p>
      
      {post.image && (
        <img 
          src={post.image} 
          alt="Post image"
          className="w-full h-64 object-cover rounded-xl mb-4"
        />
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>{formatDate(post.createdAt)}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${post.isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
            <Heart className="w-4 h-4 mr-2" />
            Me gusta
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <MessageCircle className="w-4 h-4 mr-2" />
            Comentar
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <img 
        src={event.image} 
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-3 h-3" />
            <span>{event.attendeesCount}</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <Button size="sm" className="w-full mt-4">
          Ver detalles
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Cover skeleton */}
          <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          
          {/* Profile skeleton */}
          <div className="px-6 pb-6">
            <div className="flex flex-col lg:flex-row gap-6 -mt-20">
              <div className="lg:w-1/3">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                </div>
              </div>
              
              <div className="lg:w-2/3 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
          <img 
            src={user?.coverImage} 
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button variant="secondary" size="sm" className="bg-white/90 text-gray-900">
              <Camera className="w-4 h-4 mr-2" />
              Cambiar portada
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 px-6 pb-6">
          <div className="flex flex-col lg:flex-row gap-6 -mt-20">
            {/* Profile Info */}
            <div className="lg:w-1/3">
              <div className="relative mb-4">
                <img 
                  src={user?.profilePicture} 
                  alt={user?.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800"
                />
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                  {user?.isVerified && (
                    <div className="bg-blue-500 p-1 rounded-full">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {user?.isPremium && (
                    <div className="bg-yellow-500 p-1 rounded-full">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="p-1.5 bg-white">
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{user?.username}
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {user?.bio}
                </p>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {user?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  {user?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a href={user.website} className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Se unió en {formatDate(user?.joinedAt || '')}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(user?.socialLinks?.instagram || user?.socialLinks?.twitter || user?.socialLinks?.facebook) && (
                  <div className="flex items-center gap-2">
                    {user.socialLinks.instagram && (
                      <Button variant="outline" size="sm" className="p-2">
                        <Instagram className="w-4 h-4 text-pink-500" />
                      </Button>
                    )}
                    {user.socialLinks.twitter && (
                      <Button variant="outline" size="sm" className="p-2">
                        <Twitter className="w-4 h-4 text-blue-400" />
                      </Button>
                    )}
                    {user.socialLinks.facebook && (
                      <Button variant="outline" size="sm" className="p-2">
                        <Facebook className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button onClick={() => setShowEditModal(true)} className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar perfil
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Intereses
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {user?.interests.slice(0, 8).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.stats.eventsCreated}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
                </Card>
                
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.stats.postsCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
                </Card>
                
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.stats.followersCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
                </Card>
                
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.stats.followingCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Siguiendo</p>
                </Card>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { key: 'posts', label: 'Posts', count: user?.stats.postsCount },
                    { key: 'events', label: 'Eventos', count: user?.stats.eventsCreated },
                    { key: 'saved', label: 'Guardados', count: savedPosts.length },
                    { key: 'stats', label: 'Estadísticas' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="ml-2 text-xs text-gray-400">({tab.count})</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'posts' && (
                  posts.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No hay posts aún
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Comparte tu primer post con la comunidad
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear post
                      </Button>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )
                )}

                {activeTab === 'events' && (
                  events.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No hay eventos
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Crea tu primer evento y compártelo con la comunidad
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear evento
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )
                )}

                {activeTab === 'saved' && (
                  savedPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No hay posts guardados
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Los posts que guardes aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    savedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    {/* Advanced Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="p-6 text-center">
                        <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.stats.totalLikes}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                      </Card>
                      
                      <Card className="p-6 text-center">
                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.stats.profileViews}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Vistas del perfil</p>
                      </Card>
                      
                      <Card className="p-6 text-center">
                        <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.stats.achievementsCount}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Logros</p>
                      </Card>
                      
                      <Card className="p-6 text-center">
                        <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.stats.averageRating}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rating promedio</p>
                      </Card>
                    </div>

                    {/* Achievements */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Logros Recientes
                      </h3>
                      <div className="space-y-4">
                        {user?.achievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {achievement.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {achievement.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(achievement.unlockedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Actividad Reciente
                      </h3>
                      <div className="space-y-3">
                        {user?.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 p-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;










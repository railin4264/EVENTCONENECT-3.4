'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  User, Edit, Camera, Settings, Heart, Bookmark, Calendar, Users, 
  FileText, Star, MapPin, Globe, Mail, Phone, Link, Award, 
  CheckCircle, Zap, Eye, Share2, Plus, Trash2, MoreHorizontal,
  Bell, Lock, Shield, HelpCircle, LogOut, Download, Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EventCreateForm from '@/components/forms/EventCreateForm';
import TribeCreateForm from '@/components/forms/TribeCreateForm';
import PostCreateForm from '@/components/forms/PostCreateForm';
import ReviewCreateForm from '@/components/forms/ReviewCreateForm';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  isVerified: boolean;
  isHost: boolean;
  isOnline: boolean;
  lastSeen: string;
  followers: number;
  following: number;
  events: number;
  tribes: number;
  posts: number;
  reviews: number;
  rating: number;
  badges: string[];
  interests: string[];
  skills: string[];
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
    events: boolean;
    messages: boolean;
    mentions: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTribeForm, setShowTribeForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    interests: [] as string[],
    skills: [] as string[],
  });

  // Fetch user profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.users.getProfile(),
  });

  // Fetch user content
  const { data: userEvents } = useQuery({
    queryKey: ['user-events'],
    queryFn: () => api.events.getUserEvents(),
  });

  const { data: userTribes } = useQuery({
    queryKey: ['user-tribes'],
    queryFn: () => api.tribes.getUserTribes(),
  });

  const { data: userPosts } = useQuery({
    queryKey: ['user-posts'],
    queryFn: () => api.posts.getUserPosts(),
  });

  const { data: userReviews } = useQuery({
    queryKey: ['user-reviews'],
    queryFn: () => api.reviews.getUserReviews(),
  });

  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        phone: profile.phone || '',
        interests: profile.interests,
        skills: profile.skills,
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.users.updateProfile(editForm);
      refetch();
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.users.uploadAvatar(formData);
      refetch();
      toast.success('Avatar actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar avatar');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Perfil no encontrado</h3>
        <p className="text-gray-600">No se pudo cargar el perfil del usuario</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Avatar */}
          <div className="absolute bottom-4 left-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-gray-600 border-4 border-white shadow-lg">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
              
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-white bg-opacity-90 text-gray-600 rounded-full hover:bg-white transition-colors duration-200">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white bg-opacity-90 text-gray-600 rounded-full hover:bg-white transition-colors duration-200">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 pt-20">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.isVerified && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
                {profile.isHost && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Host Verificado
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600">@{profile.username}</p>
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}
            </div>
            
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.followers}</p>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.following}</p>
              <p className="text-sm text-gray-600">Siguiendo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.events}</p>
              <p className="text-sm text-gray-600">Eventos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.rating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowEventForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Evento</span>
            </button>
            <button
              onClick={() => setShowTribeForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Tribu</span>
            </button>
            <button
              onClick={() => setShowPostForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Post</span>
            </button>
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Escribir Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vista General', icon: Eye },
              { id: 'events', label: 'Mis Eventos', icon: Calendar },
              { id: 'tribes', label: 'Mis Tribus', icon: Users },
              { id: 'posts', label: 'Mis Posts', icon: FileText },
              { id: 'reviews', label: 'Mis Reviews', icon: Star },
              { id: 'settings', label: 'Configuración', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Personal Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center space-x-3">
                        <Link className="w-5 h-5 text-gray-400" />
                        <a href={profile.website} className="text-blue-600 hover:text-blue-700">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        Miembro desde {formatDate(profile.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {profile.privacySettings.profileVisibility === 'public' ? 'Perfil Público' : 'Perfil Privado'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {profile.notificationSettings.push ? 'Notificaciones Activas' : 'Notificaciones Inactivas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests & Skills */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Intereses y Habilidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Intereses</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Habilidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Insignias y Logros</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg"
                      >
                        <Award className="w-5 h-5" />
                        <span className="font-medium">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Mis Eventos</h3>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Crear Evento
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents?.map((event) => (
                  <div key={event.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue || event.location.city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.currentAttendees}/{event.maxAttendees} asistentes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tribes Tab */}
          {activeTab === 'tribes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Mis Tribus</h3>
                <button
                  onClick={() => setShowTribeForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Crear Tribu
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTribes?.map((tribe) => (
                  <div key={tribe.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{tribe.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{tribe.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{tribe.memberCount}/{tribe.maxMembers} miembros</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{tribe.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Mis Posts</h3>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Crear Post
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts?.map((post) => (
                  <div key={post.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{post.content}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{post.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes} me gusta</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Mis Reviews</h3>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Escribir Review
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userReviews?.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{review.content}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{review.rating}/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Configuración de Privacidad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Visibilidad del perfil</span>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="public">Público</option>
                      <option value="private">Privado</option>
                      <option value="friends">Solo amigos</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Mostrar email</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Mostrar teléfono</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Mostrar ubicación</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Configuración de Notificaciones</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notificaciones por email</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notificaciones push</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notificaciones de eventos</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notificaciones de mensajes</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones de Cuenta</h3>
                <div className="space-y-4">
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Exportar Datos</span>
                  </button>
                  <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Cuenta</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Perfil</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Creation Modals */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h2>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <EventCreateForm
                onSuccess={() => {
                  setShowEventForm(false);
                  toast.success('Evento creado correctamente');
                }}
                onCancel={() => setShowEventForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showTribeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Tribu</h2>
                <button
                  onClick={() => setShowTribeForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <TribeCreateForm
                onSuccess={() => {
                  setShowTribeForm(false);
                  toast.success('Tribu creada correctamente');
                }}
                onCancel={() => setShowTribeForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Post</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <PostCreateForm
                onSuccess={() => {
                  setShowPostForm(false);
                  toast.success('Post creado correctamente');
                }}
                onCancel={() => setShowPostForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Escribir Nuevo Review</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <ReviewCreateForm
                onSuccess={() => {
                  setShowReviewForm(false);
                  toast.success('Review creado correctamente');
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  Target, 
  Zap, 
  Crown,
  Medal,
  Fire,
  Heart,
  Lightning
} from 'lucide-react';

interface GamificationProfile {
  userId: string;
  username: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperience: number;
  achievements: Achievement[];
  badges: Badge[];
  rank: number;
  points: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  points: number;
  experience: number;
}

export default function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'leaderboard' | 'badges'>('profile');

  // Fetch gamification data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: () => api.gamification.getProfile(),
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['gamification-achievements'],
    queryFn: () => api.gamification.getAchievements(),
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['gamification-leaderboard'],
    queryFn: () => api.gamification.getLeaderboard(),
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['gamification-badges'],
    queryFn: () => api.gamification.getBadges(),
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'text-amber-700 bg-amber-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 100) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (level >= 50) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (level >= 25) return <Star className="w-6 h-6 text-yellow-500" />;
    if (level >= 10) return <Award className="w-6 h-6 text-blue-500" />;
    return <Target className="w-6 h-6 text-green-500" />;
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudo cargar el perfil de gamificación</p>
      </div>
    );
  }

  const progressPercentage = (profile.experience / profile.experienceToNextLevel) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎮 Centro de Gamificación</h1>
        <p className="text-gray-600">¡Compite, desbloquea logros y sube de nivel!</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Perfil', icon: Users },
            { id: 'achievements', label: 'Logros', icon: Trophy },
            { id: 'leaderboard', label: 'Clasificación', icon: TrendingUp },
            { id: 'badges', label: 'Insignias', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.username}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getLevelIcon(profile.level)}
                    <span className="text-lg font-semibold text-gray-700">
                      Nivel {profile.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-lg font-semibold text-gray-700">
                      {profile.points} pts
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-lg font-semibold text-gray-700">
                      #{profile.rank} en el ranking
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Experiencia: {profile.experience}</span>
                <span>{profile.experienceToNextLevel - profile.experience} XP para el siguiente nivel</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total: {profile.totalExperience} XP
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Logros Desbloqueados</h3>
              <p className="text-3xl font-bold text-blue-600">{profile.achievements.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Insignias Ganadas</h3>
              <p className="text-3xl font-bold text-purple-600">{profile.badges.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Puntos Totales</h3>
              <p className="text-3xl font-bold text-green-600">{profile.points}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Logros Disponibles</h2>
            
            {achievementsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      achievement.unlockedAt
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.unlockedAt ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {achievement.unlockedAt ? (
                          <Trophy className="w-5 h-5 text-green-600" />
                        ) : (
                          <Target className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${
                            achievement.unlockedAt ? 'text-green-800' : 'text-gray-900'
                          }`}>
                            {achievement.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          achievement.unlockedAt ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {achievement.unlockedAt ? 'Desbloqueado' : 'Bloqueado'}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            +{achievement.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏅 Tabla de Clasificación</h2>
            
            {leaderboardLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard?.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 ${
                      index === 0
                        ? 'border-yellow-300 bg-yellow-50'
                        : index === 1
                        ? 'border-gray-300 bg-gray-50'
                        : index === 2
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      {index === 0 ? (
                        <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-gray-500 mx-auto" />
                      ) : index === 2 ? (
                        <Medal className="w-6 h-6 text-amber-500 mx-auto" />
                      ) : (
                        <span className="text-lg font-bold text-gray-600">#{entry.rank}</span>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{entry.username}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Nivel {entry.level}</span>
                        <span>{entry.experience} XP</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{entry.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏅 Insignias y Reconocimientos</h2>
            
            {badgesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map((badge) => (
                  <div
                    key={badge.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      badge.unlockedAt
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        badge.unlockedAt ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {badge.unlockedAt ? (
                          <Award className="w-8 h-8 text-green-600" />
                        ) : (
                          <Target className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <h3 className={`font-semibold mb-2 ${
                        badge.unlockedAt ? 'text-green-800' : 'text-gray-900'
                      }`}>
                        {badge.name}
                      </h3>
                      
                      <p className={`text-sm mb-3 ${
                        badge.unlockedAt ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {badge.description}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                          {badge.category}
                        </span>
                      </div>
                      
                      {badge.unlockedAt && (
                        <div className="mt-3 text-xs text-green-600">
                          Desbloqueado el {new Date(badge.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

interface UserLevel {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  color: string;
  badge: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface GamificationSystemProps {
  userId: string;
  className?: string;
}

// Componente 3D para badges
const Badge3D: React.FC<{ badge: Badge; isUnlocked: boolean }> = ({
  badge,
  isUnlocked,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      if (hovered) {
        meshRef.current.rotation.z =
          Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  const rarityColors = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#fbbf24',
  };

  const color = rarityColors[badge.rarity];

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={isUnlocked ? color : '#000000'}
          emissiveIntensity={isUnlocked ? 0.3 : 0}
        />
      </Sphere>

      {isUnlocked && (
        <Text
          position={[0, 0, 1.2]}
          fontSize={0.3}
          color='white'
          anchorX='center'
          anchorY='middle'
        >
          ✓
        </Text>
      )}
    </group>
  );
};

// Componente de confeti
const ConfettiExplosion: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trigger && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });

      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Limpiar después de 3 segundos
      setTimeout(() => {
        myConfetti.reset();
      }, 3000);
    }
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none z-50'
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

// Componente principal de gamificación
export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  userId,
  className = '',
}) => {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    title: 'Novato',
    color: '#6b7280',
    badge: '🌟',
  });

  const [badges, setBadges] = useState<Badge[]>([
    {
      id: 'first-event',
      name: 'Primer Evento',
      description: 'Asististe a tu primer evento',
      icon: '🎉',
      rarity: 'common',
      unlocked: false,
    },
    {
      id: 'event-creator',
      name: 'Creador de Eventos',
      description: 'Creaste tu primer evento',
      icon: '✨',
      rarity: 'rare',
      unlocked: false,
    },
    {
      id: 'social-butterfly',
      name: 'Mariposa Social',
      description: 'Conectaste con 50 personas',
      icon: '🦋',
      rarity: 'epic',
      unlocked: false,
    },
    {
      id: 'event-master',
      name: 'Maestro de Eventos',
      description: 'Organizaste 10 eventos exitosos',
      icon: '👑',
      rarity: 'legendary',
      unlocked: false,
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'event-attendance',
      name: 'Asistente Fiel',
      description: 'Asiste a eventos regularmente',
      icon: '📅',
      category: 'attendance',
      unlocked: false,
      progress: 0,
      maxProgress: 10,
    },
    {
      id: 'community-builder',
      name: 'Constructor de Comunidad',
      description: 'Construye comunidades activas',
      icon: '🏗️',
      category: 'community',
      unlocked: false,
      progress: 0,
      maxProgress: 5,
    },
  ]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [recentUnlock, setRecentUnlock] = useState<Badge | Achievement | null>(
    null
  );

  // Simular progreso del usuario (en producción esto vendría del backend)
  useEffect(() => {
    const interval = setInterval(() => {
      setUserLevel(prev => {
        const newExp = prev.experience + Math.floor(Math.random() * 10);
        if (newExp >= prev.experienceToNext) {
          // Subir de nivel
          const newLevel = prev.level + 1;
          const newExpToNext = prev.experienceToNext * 1.5;

          // Celebrar subida de nivel
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1000);

          return {
            ...prev,
            level: newLevel,
            experience: newExp - prev.experienceToNext,
            experienceToNext: newExpToNext,
            title: getLevelTitle(newLevel),
            color: getLevelColor(newLevel),
            badge: getLevelBadge(newLevel),
          };
        }
        return { ...prev, experience: newExp };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Novato';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Experto';
    if (level < 50) return 'Maestro';
    return 'Leyenda';
  };

  const getLevelColor = (level: number): string => {
    if (level < 5) return '#6b7280';
    if (level < 10) return '#3b82f6';
    if (level < 20) return '#8b5cf6';
    if (level < 50) return '#fbbf24';
    return '#ef4444';
  };

  const getLevelBadge = (level: number): string => {
    if (level < 5) return '🌟';
    if (level < 10) return '⭐';
    if (level < 20) return '💫';
    if (level < 50) return '✨';
    return '👑';
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev =>
      prev.map(badge =>
        badge.id === badgeId
          ? { ...badge, unlocked: true, unlockedAt: new Date() }
          : badge
      )
    );

    setRecentUnlock(badges.find(b => b.id === badgeId) || null);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev =>
      prev.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    );

    setRecentUnlock(achievements.find(a => a.id === achievementId) || null);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  const progressBarWidth =
    (userLevel.experience / userLevel.experienceToNext) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Confeti */}
      <ConfettiExplosion trigger={showConfetti} />

      {/* Nivel del usuario */}
      <motion.div
        className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <motion.div
              className='text-4xl'
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              {userLevel.badge}
            </motion.div>
            <div>
              <h3 className='text-xl font-bold text-white'>
                Nivel {userLevel.level} - {userLevel.title}
              </h3>
              <p className='text-gray-300'>
                {userLevel.experience} / {userLevel.experienceToNext} XP
              </p>
            </div>
          </div>

          <motion.div
            className='w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold'
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {userLevel.level}
          </motion.div>
        </div>

        {/* Barra de progreso */}
        <div className='w-full bg-gray-700 rounded-full h-3 overflow-hidden'>
          <motion.div
            className='h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full'
            initial={{ width: 0 }}
            animate={{ width: `${progressBarWidth}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Badges */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 cursor-pointer'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => !badge.unlocked && unlockBadge(badge.id)}
          >
            <div className='h-24 mb-3'>
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Badge3D badge={badge} isUnlocked={badge.unlocked} />
              </Canvas>
            </div>

            <div className='text-center'>
              <h4 className='font-semibold text-white mb-1'>{badge.name}</h4>
              <p className='text-sm text-gray-300 mb-2'>{badge.description}</p>

              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  badge.unlocked
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}
              >
                {badge.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Logros */}
      <div className='space-y-4'>
        <h3 className='text-xl font-bold text-white'>Logros</h3>
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className='flex items-center space-x-4'>
              <div className='text-3xl'>{achievement.icon}</div>

              <div className='flex-1'>
                <h4 className='font-semibold text-white mb-1'>
                  {achievement.name}
                </h4>
                <p className='text-sm text-gray-300 mb-2'>
                  {achievement.description}
                </p>

                {/* Barra de progreso del logro */}
                <div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden'>
                  <motion.div
                    className='h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full'
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>

                <p className='text-xs text-gray-400 mt-1'>
                  {achievement.progress} / {achievement.maxProgress}
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  achievement.unlocked
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}
              >
                {achievement.unlocked ? '✓' : '🔒'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notificación de desbloqueo reciente */}
      <AnimatePresence>
        {recentUnlock && (
          <motion.div
            className='fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl shadow-2xl z-50'
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <div className='flex items-center space-x-3'>
              <div className='text-2xl'>🎉</div>
              <div>
                <h4 className='font-bold'>¡Desbloqueado!</h4>
                <p className='text-sm'>{recentUnlock.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

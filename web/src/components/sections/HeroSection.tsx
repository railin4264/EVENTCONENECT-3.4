import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Zap,
  Target,
  Globe,
  Music,
  Palette,
  Settings,
} from 'lucide-react';
import { ParticleSystem } from '@/components/advanced-systems/ParticleSystem';
import { useDynamicTheme } from '@/contexts/DynamicThemeContext';
import { DynamicIllustration } from '@/components/advanced-systems/DynamicIllustrations';
import { MorphingCard } from '@/components/advanced-systems/FluidTransitions';
import { useNotifications } from '@/components/notifications/ImmersiveNotifications';

// ===== PARTICLE FIELD COMPONENT =====
const ParticleField: React.FC = () => {
  const { currentTheme } = useDynamicTheme();

  return (
    <ParticleSystem
      count={currentTheme.particles.count}
      theme={currentTheme.particles.theme}
      intensity={currentTheme.particles.intensity}
      className='absolute inset-0 pointer-events-none'
    />
  );
};

// ===== FEATURE ICON COMPONENT =====
const FeatureIcon: React.FC<{
  icon: React.ReactNode;
  label: string;
  delay: number;
}> = ({ icon, label, delay }) => {
  const { currentTheme } = useDynamicTheme();

  return (
    <motion.div
      className='flex flex-col items-center space-y-2 text-center'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div
        className='w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg'
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
        }}
        whileHover={{
          scale: 1.1,
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <span className='text-sm text-gray-300 font-medium'>{label}</span>
    </motion.div>
  );
};

// ===== STATS COMPONENT =====
const StatItem: React.FC<{ value: string; label: string; delay: number }> = ({
  value,
  label,
  delay,
}) => {
  const { currentTheme } = useDynamicTheme();

  return (
    <motion.div
      className='text-center'
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div
        className='text-3xl md:text-4xl font-bold mb-1'
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {value}
      </motion.div>
      <div className='text-sm text-gray-400'>{label}</div>
    </motion.div>
  );
};

// ===== MAIN HERO SECTION =====
export const HeroSection: React.FC = () => {
  const { currentTheme, setEventType } = useDynamicTheme();
  const { addNotification } = useNotifications();
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cambiar tema según el tipo de evento
  const handleEventTypeChange = (type: string) => {
    setEventType(type);

    // Mostrar notificación
    addNotification({
      type: 'info',
      title: 'Tema Cambiado',
      message: `Interfaz adaptada para eventos de ${type}`,
      priority: 'medium',
      autoClose: 3000,
    });
  };

  // Activar modo inmersivo
  const toggleImmersiveMode = () => {
    setIsImmersiveMode(!isImmersiveMode);

    if (!isImmersiveMode) {
      addNotification({
        type: 'achievement',
        title: 'Modo Inmersivo Activado',
        message: 'Disfruta de una experiencia completamente inmersiva',
        priority: 'high',
        autoClose: 5000,
      });
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-1000 ${
        isImmersiveMode ? 'bg-black' : ''
      }`}
      style={{
        background: isImmersiveMode
          ? 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
          : currentTheme.colors.background,
      }}
    >
      {/* Background con gradiente dinámico */}
      <div
        className='absolute inset-0 transition-all duration-1000'
        style={{
          background: isImmersiveMode
            ? 'radial-gradient(circle at center, rgba(6, 182, 212, 0.1) 0%, transparent 70%)'
            : `linear-gradient(135deg, ${currentTheme.colors.background})`,
        }}
      />

      {/* Sistema de partículas */}
      <ParticleField />

      {/* Grid pattern overlay */}
      <div
        className='absolute inset-0 opacity-20 transition-opacity duration-1000'
        style={{
          background: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Contenido principal */}
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* Saludo dinámico */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='mb-8'
        >
          <h1 className='text-6xl md:text-8xl font-bold mb-6'>
            <span className='text-white'>{getGreeting()},</span>
            <br />
            <span
              className='bg-clip-text text-transparent'
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              }}
            >
              EventConnect
            </span>
          </h1>

          <motion.p
            className='text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Descubre eventos increíbles, únete a comunidades apasionadas y crea
            conexiones que duran toda la vida.
            <br />
            <span className='text-cyan-400 font-medium'>
              La plataforma social más avanzada para conectar con eventos y
              tribus.
            </span>
          </motion.p>
        </motion.div>

        {/* Botones de acción principales */}
        <motion.div
          className='flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Button
            size='lg'
            variant='primary'
            className='px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-2xl'
            onClick={() => handleEventTypeChange('music')}
          >
            <Search className='w-5 h-5 mr-2' />
            Explorar Eventos
          </Button>

          <Button
            size='lg'
            variant='secondary'
            className='px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300'
            onClick={toggleImmersiveMode}
          >
            <Sparkles className='w-5 h-5 mr-2' />
            {isImmersiveMode ? 'Modo Normal' : 'Modo Inmersivo'}
          </Button>
        </motion.div>

        {/* Selector de tipo de evento */}
        <motion.div
          className='mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <h3 className='text-lg font-semibold text-white mb-6'>
            Personaliza tu experiencia
          </h3>
          <div className='flex flex-wrap justify-center gap-3'>
            {[
              { type: 'music', label: '🎵 Música', color: '#ec4899' },
              { type: 'tech', label: '💻 Tech', color: '#06b6d4' },
              { type: 'art', label: '🎨 Arte', color: '#8b5cf6' },
              { type: 'nature', label: '🌿 Naturaleza', color: '#10b981' },
              { type: 'sports', label: '⚽ Deportes', color: '#f97316' },
              { type: 'romantic', label: '💕 Romántico', color: '#ec4899' },
            ].map((category, index) => (
              <motion.button
                key={category.type}
                className='px-4 py-2 rounded-full border-2 transition-all duration-300 hover:scale-105'
                style={{
                  borderColor: category.color,
                  backgroundColor: `${category.color}20`,
                }}
                onClick={() => handleEventTypeChange(category.type)}
                whileHover={{
                  backgroundColor: `${category.color}40`,
                  boxShadow: `0 0 20px ${category.color}40`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
              >
                <span className='text-white font-medium'>{category.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <StatItem value='50K+' label='Eventos' delay={0} />
          <StatItem value='100K+' label='Usuarios' delay={0.1} />
          <StatItem value='500+' label='Tribus' delay={0.2} />
          <StatItem value='99%' label='Satisfacción' delay={0.3} />
        </motion.div>

        {/* Características principales */}
        <motion.div
          className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <FeatureIcon
            icon={<Search className='w-6 h-6' />}
            label='Búsqueda Inteligente'
            delay={0}
          />
          <FeatureIcon
            icon={<Users className='w-6 h-6' />}
            label='Comunidades'
            delay={0.1}
          />
          <FeatureIcon
            icon={<MapPin className='w-6 h-6' />}
            label='Ubicación'
            delay={0.2}
          />
          <FeatureIcon
            icon={<Sparkles className='w-6 h-6' />}
            label='Experiencias'
            delay={0.3}
          />
        </motion.div>

        {/* Ilustración dinámica */}
        <motion.div
          className='flex justify-center mb-16'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 1.0 }}
        >
          <DynamicIllustration
            type='person'
            context={
              currentTheme.name.toLowerCase().includes('mañana')
                ? 'morning'
                : currentTheme.name.toLowerCase().includes('tarde')
                  ? 'afternoon'
                  : currentTheme.name.toLowerCase().includes('atardecer')
                    ? 'evening'
                    : 'night'
            }
            size='large'
            interactive={true}
          />
        </motion.div>

        {/* Cards de características avanzadas */}
        <motion.div
          className='grid grid-cols-1 md:grid-cols-3 gap-8'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
        >
          <MorphingCard variant='breathing' className='h-full'>
            <CardContent className='p-6 text-center'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center'>
                <Zap className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                IA Predictiva
              </h3>
              <p className='text-gray-300'>
                Descubre eventos antes de que los busques con nuestra IA
                avanzada
              </p>
            </CardContent>
          </MorphingCard>

          <MorphingCard variant='breathing' className='h-full'>
            <CardContent className='p-6 text-center'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center'>
                <Target className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                Personalización
              </h3>
              <p className='text-gray-300'>
                Adapta la interfaz a tu estilo y preferencias únicas
              </p>
            </CardContent>
          </MorphingCard>

          <MorphingCard variant='breathing' className='h-full'>
            <CardContent className='p-6 text-center'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center'>
                <Globe className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                Conectividad Global
              </h3>
              <p className='text-gray-300'>
                Conecta con personas de todo el mundo en tiempo real
              </p>
            </CardContent>
          </MorphingCard>
        </motion.div>

        {/* Indicador de tema actual */}
        <motion.div
          className='mt-16 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <div className='flex items-center justify-center space-x-3'>
            <Palette className='w-5 h-5 text-cyan-400' />
            <span className='text-white/80'>
              Tema actual:{' '}
              <span className='text-cyan-400 font-medium'>
                {currentTheme.name}
              </span>
            </span>
            <span className='text-white/60'>•</span>
            <span className='text-white/80'>
              Estado de ánimo:{' '}
              <span className='text-cyan-400 font-medium'>
                {currentTheme.mood}
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

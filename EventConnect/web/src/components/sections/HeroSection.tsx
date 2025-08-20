import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, MapPin, Calendar, Users, Sparkles, Zap, Target, Globe } from 'lucide-react';

// ===== PARTICLE FIELD COMPONENT =====
const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// ===== FEATURE ICON COMPONENT =====
const FeatureIcon: React.FC<{ icon: React.ReactNode; label: string; delay: number }> = ({ 
  icon, 
  label, 
  delay 
}) => {
  return (
    <motion.div
      className="flex flex-col items-center space-y-2 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
        {icon}
      </div>
      <span className="text-sm text-gray-300 font-medium">{label}</span>
    </motion.div>
  );
};

// ===== STATS COMPONENT =====
const StatItem: React.FC<{ value: string; label: string; delay: number }> = ({ 
  value, 
  label, 
  delay 
}) => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
};

// ===== MAIN HERO SECTION =====
export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Particle field */}
      <ParticleField />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
      
      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Conecta
            </span>
            <br />
            <span className="text-white">con tu Tribu</span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Descubre eventos increíbles, únete a comunidades apasionadas y crea 
            <span className="text-cyan-400 font-semibold"> conexiones que duran toda la vida</span>
          </motion.p>
        </motion.div>
        
        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <Card variant="glass" className="max-w-2xl mx-auto backdrop-blur-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="¿Qué tipo de evento buscas?"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                  />
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="px-8 py-3"
                  glow
                >
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button 
            variant="primary" 
            size="xl" 
            className="px-8 py-4 text-lg font-semibold"
            glow
            pulse
          >
            <Sparkles className="w-6 h-6 mr-3" />
            Explorar Eventos
          </Button>
          
          <Button 
            variant="outline" 
            size="xl" 
            className="px-8 py-4 text-lg font-semibold border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
          >
            <Zap className="w-6 h-6 mr-3" />
            Crear Evento
          </Button>
        </motion.div>
        
        {/* Feature icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-4xl mx-auto"
        >
          <FeatureIcon icon={<MapPin className="w-6 h-6" />} label="Ubicación" delay={1.2} />
          <FeatureIcon icon={<Calendar className="w-6 h-6" />} label="Eventos" delay={1.4} />
          <FeatureIcon icon={<Users className="w-6 h-6" />} label="Comunidad" delay={1.6} />
          <FeatureIcon icon={<Target className="w-6 h-6" />} label="Descubrir" delay={1.8} />
        </motion.div>
        
        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <StatItem value="10K+" label="Eventos" delay={1.4} />
          <StatItem value="50K+" label="Usuarios" delay={1.6} />
          <StatItem value="100+" label="Ciudades" delay={1.8} />
          <StatItem value="24/7" label="Activo" delay={2.0} />
        </motion.div>
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 hidden lg:block"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-cyan-500/50" />
        </motion.div>
        
        <motion.div
          className="absolute top-40 right-20 hidden lg:block"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-3 h-3 bg-purple-400 rounded-full shadow-purple-500/50" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-40 left-20 hidden lg:block"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-2 h-2 bg-blue-400 rounded-full shadow-blue-500/50" />
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
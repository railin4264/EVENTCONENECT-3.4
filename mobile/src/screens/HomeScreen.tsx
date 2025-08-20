import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  TrendingUp,
  Sparkles,
  Zap,
  Globe,
  Heart
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// ===== PARTICLE COMPONENT =====
const Particle: React.FC<{ 
  index: number; 
  total: number 
}> = ({ index, total }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    const delay = (index / total) * 2000;
    
    translateY.value = withRepeat(
      withTiming(-100, { duration: 3000 + Math.random() * 2000 }),
      -1,
      true
    );
    
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 2000 }),
      -1,
      true
    );
    
    scale.value = withRepeat(
      withTiming(1.5, { duration: 2500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${(index / total) * 100}%`,
          top: `${Math.random() * 100}%`,
        },
        animatedStyle,
      ]}
    />
  );
};

// ===== FEATURE CARD COMPONENT =====
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 600 });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.featureCard, animatedStyle]}>
      <Card variant="glass" className="h-full">
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="text-base mb-2 text-center">{title}</CardTitle>
          <Text className="text-sm text-gray-300 text-center leading-relaxed">
            {description}
          </Text>
        </CardContent>
      </Card>
    </Animated.View>
  );
};

// ===== STAT CARD COMPONENT =====
const StatCard: React.FC<{
  value: string;
  label: string;
  delay: number;
}> = ({ value, label, delay }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 600 });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <Text className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {value}
      </Text>
      <Text className="text-sm text-gray-400 text-center">{label}</Text>
    </Animated.View>
  );
};

// ===== MAIN HOME SCREEN =====
export const HomeScreen: React.FC = () => {
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    if (offsetY > 100) {
      headerOpacity.value = withTiming(0.8, { duration: 200 });
    } else {
      headerOpacity.value = withTiming(1, { duration: 200 });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Particle Field */}
      <View style={styles.particleContainer}>
        {Array.from({ length: 30 }).map((_, index) => (
          <Particle key={index} index={index} total={30} />
        ))}
      </View>

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>EventConnect</Text>
          <Text style={styles.tagline}>Conecta con tu Tribu</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Descubre Eventos{' '}
            <Text style={styles.heroTitleAccent}>Increíbles</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Únete a comunidades apasionadas y crea conexiones que duran toda la vida
          </Text>
          
          {/* Search Card */}
          <Card variant="glass" className="mt-6">
            <CardContent className="p-4">
              <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                <Text style={styles.searchPlaceholder}>
                  ¿Qué tipo de evento buscas?
                </Text>
              </View>
              <Button 
                variant="primary" 
                size="lg" 
                className="mt-3"
                glow
              >
                <Search size={18} style={{ marginRight: 8 }} />
                Buscar
              </Button>
            </CardContent>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            variant="primary" 
            size="lg" 
            className="flex-1 mr-2"
            glow
            pulse
          >
            <Sparkles size={20} style={{ marginRight: 8 }} />
            Explorar Eventos
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 ml-2"
          >
            <Zap size={20} style={{ marginRight: 8 }} />
            Crear Evento
          </Button>
        </View>

        {/* Feature Icons */}
        <View style={styles.featureIcons}>
          <View style={styles.featureIcon}>
            <View style={styles.iconContainer}>
              <MapPin size={24} color="#ffffff" />
            </View>
            <Text style={styles.iconLabel}>Ubicación</Text>
          </View>
          
          <View style={styles.featureIcon}>
            <View style={styles.iconContainer}>
              <Calendar size={24} color="#ffffff" />
            </View>
            <Text style={styles.iconLabel}>Eventos</Text>
          </View>
          
          <View style={styles.featureIcon}>
            <View style={styles.iconContainer}>
              <Users size={24} color="#ffffff" />
            </View>
            <Text style={styles.iconLabel}>Comunidad</Text>
          </View>
          
          <View style={styles.featureIcon}>
            <View style={styles.iconContainer}>
              <TrendingUp size={24} color="#ffffff" />
            </View>
            <Text style={styles.iconLabel}>Descubrir</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>EventConnect en Números</Text>
          <View style={styles.statsGrid}>
            <StatCard value="10K+" label="Eventos" delay={200} />
            <StatCard value="50K+" label="Usuarios" delay={400} />
            <StatCard value="100+" label="Ciudades" delay={600} />
            <StatCard value="24/7" label="Activo" delay={800} />
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>¿Por qué elegir EventConnect?</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon={<Globe size={24} color="#ffffff" />}
              title="Descubrimiento Global"
              description="Explora eventos de todo el mundo con nuestro sistema de recomendaciones inteligente"
              delay={200}
            />
            <FeatureCard
              icon={<Zap size={24} color="#ffffff" />}
              title="Notificaciones en Tiempo Real"
              description="Recibe alertas instantáneas sobre eventos que te interesan"
              delay={400}
            />
            <FeatureCard
              icon={<Heart size={24} color="#ffffff" />}
              title="Comunidades Apasionadas"
              description="Únete a tribus que comparten tus intereses y pasiones"
              delay={600}
            />
            <FeatureCard
              icon={<TrendingUp size={24} color="#ffffff" />}
              title="Análisis Avanzado"
              description="Obtén insights sobre eventos populares y tendencias emergentes"
              delay={800}
            />
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            ¿Listo para <Text style={styles.ctaTitleAccent}>conectar</Text>?
          </Text>
          <Text style={styles.ctaSubtitle}>
            Únete a miles de personas que ya están descubriendo eventos increíbles
          </Text>
          
          <View style={styles.ctaButtons}>
            <Button 
              variant="primary" 
              size="xl" 
              className="mb-3"
              glow
            >
              Comenzar Gratis
            </Button>
            <Button 
              variant="outline" 
              size="lg"
            >
              Ver Demo
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#06b6d4',
    borderRadius: 2,
    opacity: 0.3,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(20px)',
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  heroTitleAccent: {
    backgroundGradient: {
      colors: ['#06b6d4', '#3b82f6'],
    },
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  featureIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 32,
  },
  featureIcon: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  ctaTitleAccent: {
    backgroundGradient: {
      colors: ['#06b6d4', '#3b82f6'],
    },
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 300,
  },
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
});

export default HomeScreen;
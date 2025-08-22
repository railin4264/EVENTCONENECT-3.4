const express = require('express');
const cors = require('cors');

// ===== SERVIDOR SIMPLE PARA TESTING =====
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MOCK DATA =====
const mockEvents = [
  {
    id: '1',
    title: 'AI Summit Madrid 2024',
    description: 'El evento más grande de IA en España',
    category: 'Tecnología',
    date: '2024-12-25',
    location: { city: 'Madrid', venue: 'WiZink Center', coordinates: { latitude: 40.4168, longitude: -3.7038 } },
    distance: '2.1 km',
    attendees: 450,
    price: 75,
    host: { name: 'Tech Madrid', avatar: '/host1.jpg' },
    isPopular: true,
    isTrending: true,
    friendsAttending: 3,
    tags: ['ai', 'technology', 'networking'],
    likes: 230,
    shares: 45,
    comments: 67
  },
  {
    id: '2',
    title: 'Festival Gastronómico de Invierno',
    description: 'Los mejores chefs de Madrid se reúnen',
    category: 'Gastronomía',
    date: '2024-12-28',
    location: { city: 'Madrid', venue: 'Retiro Park', coordinates: { latitude: 40.4152, longitude: -3.6906 } },
    distance: '1.8 km',
    attendees: 320,
    price: 25,
    host: { name: 'Madrid Food', avatar: '/host2.jpg' },
    friendsAttending: 4,
    tags: ['food', 'chefs', 'madrid'],
    likes: 180,
    shares: 32,
    comments: 41
  }
];

const mockUser = {
  id: 'user123',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  interests: ['tecnología', 'gastronomía'],
  location: { city: 'Madrid', coordinates: { latitude: 40.4168, longitude: -3.7038 } },
  totalPoints: 150,
  eventsAttended: 3,
  recentAchievements: [
    { id: 'first_event', title: 'Primer Paso', icon: '🎉', points: 10 }
  ]
};

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development',
    database: 'mock',
    redis: 'memory'
  });
});

// ===== ENDPOINTS DE TESTING =====

// Recomendaciones
app.get('/api/recommendations/personalized', (req, res) => {
  const { limit = 20, category } = req.query;
  
  let recommendations = [...mockEvents];
  
  if (category) {
    recommendations = recommendations.filter(e => 
      e.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Simular scoring
  recommendations = recommendations.map(event => ({
    ...event,
    score: Math.floor(Math.random() * 50) + 50,
    reasons: ['Coincide con tus intereses', 'Está cerca de ti']
  }));
  
  res.json({
    success: true,
    data: {
      recommendations: recommendations.slice(0, parseInt(limit)),
      context: {
        userId: 'user123',
        timeOfDay: 'afternoon',
        userLocation: mockUser.location
      },
      generatedAt: new Date().toISOString()
    }
  });
});

// Trending
app.get('/api/recommendations/trending', (req, res) => {
  const { timeWindow = '24h', location = 'city' } = req.query;
  
  const trendingEvents = mockEvents
    .filter(e => e.isTrending)
    .map(event => ({
      ...event,
      trendingScore: Math.floor(Math.random() * 30) + 70,
      velocityMetrics: {
        attendeeVelocity: Math.random() * 10,
        engagementRate: Math.random() * 5,
        shareVelocity: Math.random() * 3
      }
    }));
  
  res.json({
    success: true,
    data: {
      events: trendingEvents,
      metrics: { timeWindow, location, totalTrending: trendingEvents.length }
    }
  });
});

// Gamificación
app.get('/api/gamification/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: mockUser.id,
        level: { level: 3, title: 'Entusiasta', pointsRequired: 150 },
        totalPoints: mockUser.totalPoints,
        pointsToNextLevel: 250,
        progressPercent: 60
      },
      achievements: {
        unlocked: mockUser.recentAchievements,
        available: [
          { id: 'social_butterfly', title: 'Mariposa Social', icon: '🦋', points: 75 }
        ],
        total: 11,
        completionRate: 18
      }
    }
  });
});

// Eventos
app.get('/api/events', (req, res) => {
  const { category, limit = 20 } = req.query;
  
  let events = [...mockEvents];
  
  if (category) {
    events = events.filter(e => 
      e.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  res.json({
    success: true,
    data: {
      events: events.slice(0, parseInt(limit)),
      total: events.length,
      page: 1,
      hasMore: false
    }
  });
});

// Búsqueda
app.get('/api/search', (req, res) => {
  const { q, category, limit = 20 } = req.query;
  
  let results = [...mockEvents];
  
  if (q) {
    results = results.filter(e => 
      e.title.toLowerCase().includes(q.toLowerCase()) ||
      e.description.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (category) {
    results = results.filter(e => 
      e.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  res.json({
    success: true,
    data: {
      events: results.slice(0, parseInt(limit)),
      total: results.length,
      suggestions: ['conciertos madrid', 'eventos tech', 'networking']
    }
  });
});

// Métricas en tiempo real
app.get('/api/analytics/realtime', (req, res) => {
  res.json({
    success: true,
    data: {
      activeUsers: Math.floor(Math.random() * 200) + 100,
      eventsToday: Math.floor(Math.random() * 20) + 10,
      newSignups: Math.floor(Math.random() * 10) + 5,
      engagementRate: Math.floor(Math.random() * 20) + 70,
      trendingEvents: ['1', '2'],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Feedback de recomendaciones
app.post('/api/recommendations/feedback', (req, res) => {
  const { eventId, action } = req.body;
  
  console.log(`📊 Feedback recibido: ${action} para evento ${eventId}`);
  
  res.json({
    success: true,
    data: {
      message: 'Feedback registrado',
      eventId,
      action
    }
  });
});

// ===== ERROR HANDLERS =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`🚀 Servidor de testing ejecutándose en puerto ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/events`);
  console.log(`   GET  /api/recommendations/personalized`);
  console.log(`   GET  /api/recommendations/trending`);
  console.log(`   GET  /api/gamification/profile`);
  console.log(`   GET  /api/search`);
  console.log(`   GET  /api/analytics/realtime`);
  console.log(`   POST /api/recommendations/feedback`);
});

module.exports = app;
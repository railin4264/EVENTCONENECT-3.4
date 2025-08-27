// Mock data para desarrollo sin base de datos
const mockUsers = [
  {
    id: '1',
    email: 'admin@eventconnect.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5wJmC', // admin123
    firstName: 'Admin',
    lastName: 'EventConnect',
    username: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'admin',
    location: {
      city: 'Madrid',
      country: 'España',
      coordinates: [40.4168, -3.7038]
    },
    interests: ['tecnología', 'música', 'deportes'],
    bio: 'Administrador de EventConnect',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'maria@example.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5wJmC', // dev123
    firstName: 'María',
    lastName: 'García',
    username: 'maria_garcia',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    location: {
      city: 'Barcelona',
      country: 'España',
      coordinates: [41.3851, 2.1734]
    },
    interests: ['música', 'arte', 'gastronomía'],
    bio: 'Amante de la música y el arte',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    email: 'carlos@example.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5wJmC', // dev123
    firstName: 'Carlos',
    lastName: 'López',
    username: 'carlos_lopez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    location: {
      city: 'Valencia',
      country: 'España',
      coordinates: [39.4699, -0.3763]
    },
    interests: ['tecnología', 'deportes', 'viajes'],
    bio: 'Desarrollador y viajero',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

const mockEvents = [
  {
    id: '1',
    title: 'Tech Meetup Barcelona 2024',
    description: 'El evento tecnológico más importante de Barcelona. Charlas sobre IA, blockchain y desarrollo web.',
    category: 'tecnología',
    tags: ['Web Development', 'AI', 'Blockchain'],
    host: {
      id: '2',
      username: 'maria_garcia',
      firstName: 'María',
      lastName: 'García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 24
    },
    location: {
      coordinates: [41.3851, 2.1734],
      address: 'Carrer de la Pau, 1',
      city: 'Barcelona',
      country: 'España',
      venue: 'Centro de Convenciones'
    },
    dateTime: {
      start: '2024-12-15T09:00:00Z',
      end: '2024-12-15T18:00:00Z',
      timezone: 'Europe/Madrid'
    },
    capacity: {
      max: 300,
      current: 245,
      waitlist: 12
    },
    pricing: {
      isFree: true,
      amount: 0,
      currency: 'EUR'
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop'
      ],
      videos: []
    },
    attendees: [
      { user: { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }, status: 'confirmed', joinedAt: '2024-01-10T10:00:00Z', isHost: false },
      { user: { id: '3', username: 'carlos_lopez', firstName: 'Carlos', lastName: 'López', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }, status: 'confirmed', joinedAt: '2024-01-12T14:30:00Z', isHost: false }
    ],
    reviews: [
      {
        id: '1',
        user: { id: '3', username: 'carlos_lopez', firstName: 'Carlos', lastName: 'López', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        rating: 5,
        comment: 'Excelente evento, muy bien organizado y contenido de calidad.',
        createdAt: '2024-01-12T16:00:00Z'
      }
    ],
    stats: {
      viewCount: 1250,
      shareCount: 89,
      saveCount: 156,
      averageRating: 4.8,
      reviewCount: 1
    },
    settings: {
      isPublic: true,
      allowComments: true,
      requireApproval: false,
      maxWaitlist: 50
    },
    status: 'published',
    isActive: true,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z'
  },
  {
    id: '2',
    title: 'Workshop de React Avanzado',
    description: 'Aprende técnicas avanzadas de React: hooks personalizados, context API, y optimización de performance.',
    category: 'tecnología',
    tags: ['React', 'JavaScript', 'Frontend'],
    host: {
      id: '3',
      username: 'carlos_lopez',
      firstName: 'Carlos',
      lastName: 'López',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 18
    },
    location: {
      coordinates: [39.4699, -0.3763],
      address: 'Carrer de Colón, 60',
      city: 'Valencia',
      country: 'España',
      venue: 'Espacio Coworking'
    },
    dateTime: {
      start: '2024-12-20T10:00:00Z',
      end: '2024-12-20T17:00:00Z',
      timezone: 'Europe/Madrid'
    },
    capacity: {
      max: 50,
      current: 38,
      waitlist: 5
    },
    pricing: {
      isFree: false,
      amount: 75,
      currency: 'EUR'
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop'
      ],
      videos: []
    },
    attendees: [
      { user: { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }, status: 'confirmed', joinedAt: '2024-01-08T11:00:00Z', isHost: false }
    ],
    reviews: [],
    stats: {
      viewCount: 890,
      shareCount: 45,
      saveCount: 98,
      averageRating: 0,
      reviewCount: 0
    },
    settings: {
      isPublic: true,
      allowComments: true,
      requireApproval: false,
      maxWaitlist: 20
    },
    status: 'published',
    isActive: true,
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z'
  },
  {
    id: '3',
    title: 'Conferencia de UX/UI Design',
    description: 'Descubre las últimas tendencias en diseño de experiencia de usuario e interfaces.',
    category: 'diseño',
    tags: ['UX', 'UI', 'Design'],
    host: {
      id: '2',
      username: 'maria_garcia',
      firstName: 'María',
      lastName: 'García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 31
    },
    location: {
      coordinates: [40.4168, -3.7038],
      address: 'Calle de Alcalá, 456',
      city: 'Madrid',
      country: 'España',
      venue: 'Palacio de Congresos'
    },
    dateTime: {
      start: '2024-12-25T09:00:00Z',
      end: '2024-12-25T19:00:00Z',
      timezone: 'Europe/Madrid'
    },
    capacity: {
      max: 500,
      current: 423,
      waitlist: 25
    },
    pricing: {
      isFree: false,
      amount: 120,
      currency: 'EUR'
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop'
      ],
      videos: []
    },
    attendees: [
      { user: { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }, status: 'confirmed', joinedAt: '2024-01-05T09:00:00Z', isHost: false }
    ],
    reviews: [],
    stats: {
      viewCount: 2100,
      shareCount: 156,
      saveCount: 234,
      averageRating: 0,
      reviewCount: 0
    },
    settings: {
      isPublic: true,
      allowComments: true,
      requireApproval: false,
      maxWaitlist: 100
    },
    status: 'published',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  }
];

const mockTribes = [
  {
    id: '1',
    name: 'Tech Enthusiasts Barcelona',
    description: 'Comunidad de entusiastas de la tecnología en Barcelona. Compartimos conocimiento, organizamos eventos y construimos el futuro.',
    category: 'tecnología',
    privacy: 'public',
    creator: { id: '2', username: 'maria_garcia', firstName: 'María', lastName: 'García' },
    moderators: [
      { id: '2', username: 'maria_garcia', firstName: 'María', lastName: 'García' }
    ],
    members: [
      { user: { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect' }, role: 'member', joinedAt: '2024-01-10T10:00:00Z' },
      { user: { id: '3', username: 'carlos_lopez', firstName: 'Carlos', lastName: 'López' }, role: 'member', joinedAt: '2024-01-12T14:30:00Z' }
    ],
    location: {
      city: 'Barcelona',
      country: 'España',
      coordinates: [41.3851, 2.1734]
    },
    tags: ['tecnología', 'programación', 'innovación'],
    stats: {
      memberCount: 3,
      eventCount: 1,
      postCount: 5
    },
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z'
  },
  {
    id: '2',
    name: 'Música y Arte Madrid',
    description: 'Comunidad para amantes de la música y el arte en Madrid. Organizamos conciertos, exposiciones y talleres.',
    category: 'arte',
    privacy: 'public',
    creator: { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect' },
    moderators: [
      { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect' }
    ],
    members: [
      { user: { id: '2', username: 'maria_garcia', firstName: 'María', lastName: 'García' }, role: 'member', joinedAt: '2024-01-08T11:00:00Z' }
    ],
    location: {
      city: 'Madrid',
      country: 'España',
      coordinates: [40.4168, -3.7038]
    },
    tags: ['música', 'arte', 'cultura'],
    stats: {
      memberCount: 2,
      eventCount: 1,
      postCount: 3
    },
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  },
  {
    id: '3',
    name: 'Desarrolladores Valencia',
    description: 'Comunidad de desarrolladores en Valencia. Compartimos conocimiento, organizamos hackathons y construimos proyectos juntos.',
    category: 'tecnología',
    privacy: 'public',
    creator: { id: '3', username: 'carlos_lopez', firstName: 'Carlos', lastName: 'López' },
    moderators: [
      { id: '3', username: 'carlos_lopez', firstName: 'Carlos', lastName: 'López' }
    ],
    members: [
      { user: { id: '1', username: 'admin', firstName: 'Admin', lastName: 'EventConnect' }, role: 'member', joinedAt: '2024-01-08T11:00:00Z' }
    ],
    location: {
      city: 'Valencia',
      country: 'España',
      coordinates: [39.4699, -0.3763]
    },
    tags: ['desarrollo', 'programación', 'tecnología'],
    stats: {
      memberCount: 2,
      eventCount: 1,
      postCount: 2
    },
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z'
  }
];

const mockPosts = [
  {
    id: '1',
    content: '¡Acabamos de confirmar el próximo Tech Meetup Barcelona! Será el 15 de diciembre con charlas increíbles sobre IA y blockchain. ¿Quién se apunta? 🚀',
    type: 'event',
    author: {
      id: '2',
      username: 'maria_garcia',
      firstName: 'María',
      lastName: 'García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    event: { id: '1', title: 'Tech Meetup Barcelona 2024' },
    likes: 45,
    comments: 12,
    shares: 8,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    content: 'Excelente workshop de React ayer en Valencia. Aprendí mucho sobre hooks personalizados y optimización. ¡Gracias a todos los asistentes! 💻',
    type: 'event',
    author: {
      id: '3',
      username: 'carlos_lopez',
      firstName: 'Carlos',
      lastName: 'López',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    event: { id: '2', title: 'Workshop de React Avanzado' },
    likes: 23,
    comments: 5,
    shares: 3,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-20T16:30:00Z',
    updatedAt: '2024-01-20T16:30:00Z'
  },
  {
    id: '3',
    content: 'La conferencia de UX/UI en Madrid fue un éxito total. Más de 400 asistentes y charlas de nivel internacional. ¡El diseño está vivo! 🎨',
    type: 'event',
    author: {
      id: '2',
      username: 'maria_garcia',
      firstName: 'María',
      lastName: 'García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    event: { id: '3', title: 'Conferencia de UX/UI Design' },
    likes: 67,
    comments: 18,
    shares: 15,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z'
  }
];

module.exports = {
  mockUsers,
  mockEvents,
  mockTribes,
  mockPosts
};
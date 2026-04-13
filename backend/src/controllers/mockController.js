const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  mockUsers,
  mockEvents,
  mockTribes,
  mockPosts,
} = require('../config/mockData');

class MockController {
  // ==========================================
  // AUTENTICACIÓN MOCK
  // ==========================================

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario en mock data
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      // Verificar contraseña (en mock data usamos 'dev123' para todos)
      const isValidPassword = password === 'dev123' || password === 'admin123';

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      // Generar tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
        { expiresIn: '30d' }
      );

      // Remover contraseña del usuario
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error('Mock login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async register(req, res) {
    try {
      const { email, password, firstName, lastName, username } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = mockUsers.find(
        u => u.email === email || u.username === username
      );

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya existe',
        });
      }

      // Crear nuevo usuario mock
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        email,
        password: await bcrypt.hash(password, 12),
        firstName,
        lastName,
        username,
        avatar: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=150&h=150&fit=crop&crop=face`,
        role: 'user',
        location: {
          city: 'Madrid',
          country: 'España',
          coordinates: [40.4168, -3.7038],
        },
        interests: [],
        bio: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Agregar a mock data (en producción esto iría a la base de datos)
      mockUsers.push(newUser);

      // Generar tokens
      const accessToken = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { userId: newUser.id },
        process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
        { expiresIn: '30d' }
      );

      // Remover contraseña del usuario
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error('Mock register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async getProfile(req, res) {
    try {
      // En un sistema real, req.user vendría del middleware de autenticación
      const userId = req.user?.id || req.query.userId || '1';

      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Remover contraseña del usuario
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error('Mock getProfile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // EVENTOS MOCK
  // ==========================================

  async getEvents(req, res) {
    try {
      const { category, location, search, limit = 10, page = 1 } = req.query;

      let filteredEvents = [...mockEvents];

      // Filtrar por categoría
      if (category && category !== 'all') {
        filteredEvents = filteredEvents.filter(
          event => event.category === category
        );
      }

      // Filtrar por ubicación
      if (location) {
        filteredEvents = filteredEvents.filter(event =>
          event.location.city.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Buscar por texto
      if (search) {
        filteredEvents = filteredEvents.filter(
          event =>
            event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.description.toLowerCase().includes(search.toLowerCase()) ||
            event.tags.some(tag =>
              tag.toLowerCase().includes(search.toLowerCase())
            )
        );
      }

      // Paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          events: paginatedEvents,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredEvents.length / limit),
            totalEvents: filteredEvents.length,
            hasNextPage: endIndex < filteredEvents.length,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Mock getEvents error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async getEvent(req, res) {
    try {
      const { id } = req.params;

      const event = mockEvents.find(e => e.id === id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error('Mock getEvent error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async createEvent(req, res) {
    try {
      const eventData = req.body;

      // Crear nuevo evento mock
      const newEvent = {
        id: (mockEvents.length + 1).toString(),
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
        reviews: [],
        stats: {
          viewCount: 0,
          shareCount: 0,
          saveCount: 0,
          averageRating: 0,
          reviewCount: 0,
        },
        status: 'published',
        isActive: true,
      };

      // Agregar a mock data
      mockEvents.push(newEvent);

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: newEvent,
      });
    } catch (error) {
      console.error('Mock createEvent error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // TRIBUS MOCK
  // ==========================================

  async getTribes(req, res) {
    try {
      const { category, search, limit = 10, page = 1 } = req.query;

      let filteredTribes = [...mockTribes];

      // Filtrar por categoría
      if (category && category !== 'all') {
        filteredTribes = filteredTribes.filter(
          tribe => tribe.category === category
        );
      }

      // Buscar por texto
      if (search) {
        filteredTribes = filteredTribes.filter(
          tribe =>
            tribe.name.toLowerCase().includes(search.toLowerCase()) ||
            tribe.description.toLowerCase().includes(search.toLowerCase()) ||
            tribe.tags.some(tag =>
              tag.toLowerCase().includes(search.toLowerCase())
            )
        );
      }

      // Paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedTribes = filteredTribes.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          tribes: paginatedTribes,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredTribes.length / limit),
            totalTribes: filteredTribes.length,
            hasNextPage: endIndex < filteredTribes.length,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Mock getTribes error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async getTribe(req, res) {
    try {
      const { id } = req.params;

      const tribe = mockTribes.find(t => t.id === id);

      if (!tribe) {
        return res.status(404).json({
          success: false,
          message: 'Tribu no encontrada',
        });
      }

      res.json({
        success: true,
        data: tribe,
      });
    } catch (error) {
      console.error('Mock getTribe error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // POSTS MOCK
  // ==========================================

  async getPosts(req, res) {
    try {
      const { type, limit = 10, page = 1 } = req.query;

      let filteredPosts = [...mockPosts];

      // Filtrar por tipo
      if (type && type !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.type === type);
      }

      // Paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          posts: paginatedPosts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredPosts.length / limit),
            totalPosts: filteredPosts.length,
            hasNextPage: endIndex < filteredPosts.length,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Mock getPosts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  async healthCheck(req, res) {
    res.json({
      success: true,
      message: 'EventConnect API funcionando en modo MOCK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mode: 'mock-data',
      dataAvailable: {
        users: mockUsers.length,
        events: mockEvents.length,
        tribes: mockTribes.length,
        posts: mockPosts.length,
      },
    });
  }
}

module.exports = new MockController();

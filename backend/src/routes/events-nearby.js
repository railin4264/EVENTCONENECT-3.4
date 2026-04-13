const express = require('express');

const router = express.Router();
const Event = require('../models/Event');

// Función para calcular distancia usando fórmula de Haversine
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

const toRadians = degrees => {
  return degrees * (Math.PI / 180);
};

// GET /api/events/nearby - Obtener eventos cercanos
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 50, categories } = req.query;

    // Validar parámetros requeridos
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);
    const maxResults = parseInt(limit);

    // Validar que sean números válidos
    if (isNaN(userLat) || isNaN(userLng) || isNaN(searchRadius)) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas o radio inválidos',
      });
    }

    // Construir filtros base
    const filters = {
      status: 'published',
      visibility: 'public',
      date: { $gte: new Date() }, // Solo eventos futuros
      // Filtro geográfico aproximado para optimizar la consulta
      'location.coordinates.0': {
        $gte: userLng - searchRadius / 111, // Aproximadamente 1 grado = 111km
        $lte: userLng + searchRadius / 111,
      },
      'location.coordinates.1': {
        $gte: userLat - searchRadius / 111,
        $lte: userLat + searchRadius / 111,
      },
    };

    // Filtrar por categorías si se especifican
    if (categories) {
      const categoryArray = categories.split(',').map(cat => cat.trim());
      filters.category = { $in: categoryArray };
    }

    // Buscar eventos en la base de datos
    const events = await Event.find(filters)
      .populate('organizer', 'username firstName lastName avatar')
      .populate('attendees', 'username firstName lastName avatar')
      .sort({ date: 1 })
      .limit(maxResults * 2) // Obtener más eventos para filtrar por distancia
      .lean();

    // Calcular distancia exacta y filtrar
    const nearbyEvents = events
      .map(event => {
        // Verificar que el evento tenga coordenadas
        if (
          !event.location ||
          !event.location.coordinates ||
          event.location.coordinates.length < 2
        ) {
          return null;
        }

        const eventLng = event.location.coordinates[0];
        const eventLat = event.location.coordinates[1];
        const distance = calculateDistance(
          userLat,
          userLng,
          eventLat,
          eventLng
        );

        return {
          ...event,
          distance,
          lat: eventLat,
          lng: eventLng,
        };
      })
      .filter(event => event && event.distance <= searchRadius) // Filtrar por radio
      .sort((a, b) => a.distance - b.distance) // Ordenar por distancia
      .slice(0, maxResults); // Limitar resultados

    // Formatear respuesta
    const formattedEvents = nearbyEvents.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: {
        address: event.location.address,
        lat: event.lat,
        lng: event.lng,
      },
      distance: event.distance,
      price: event.price,
      attendees: event.attendees?.length || 0,
      maxAttendees: event.maxAttendees,
      organizer: event.organizer,
      images: event.images,
      tags: event.tags,
      status: event.status,
      createdAt: event.createdAt,
    }));

    res.json({
      success: true,
      data: {
        events: formattedEvents,
        total: formattedEvents.length,
        userLocation: { lat: userLat, lng: userLng },
        searchRadius,
        categories: categories ? categories.split(',') : null,
      },
    });
  } catch (error) {
    console.error('Error obteniendo eventos cercanos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/events/nearby/categories - Obtener categorías disponibles en el área
router.get('/nearby/categories', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Obtener categorías únicas en el área
    const categories = await Event.aggregate([
      {
        $match: {
          status: 'published',
          visibility: 'public',
          date: { $gte: new Date() },
          'location.coordinates.0': {
            $gte: userLng - searchRadius / 111,
            $lte: userLng + searchRadius / 111,
          },
          'location.coordinates.1': {
            $gte: userLat - searchRadius / 111,
            $lte: userLat + searchRadius / 111,
          },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count,
        })),
        total: categories.length,
      },
    });
  } catch (error) {
    console.error('Error obteniendo categorías cercanas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

// POST /api/events/nearby/save-location - Guardar ubicación del usuario (opcional)
router.post('/nearby/save-location', async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas',
      });
    }

    // Si el usuario está autenticado, guardar su ubicación preferida
    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, {
        'preferences.location': {
          coordinates: [parseFloat(lng), parseFloat(lat)],
          address: address || 'Ubicación guardada',
        },
      });
    }

    res.json({
      success: true,
      message: 'Ubicación guardada correctamente',
    });
  } catch (error) {
    console.error('Error guardando ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

module.exports = router;

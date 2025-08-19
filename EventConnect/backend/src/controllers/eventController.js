const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status = 'published',
      search,
      sort = 'dateTime.start',
      order = 'asc',
      location,
      radius = 10000,
      startDate,
      endDate,
      priceType,
      isVirtual,
      tags
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Location filter
    if (location && location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Date filters
    if (startDate) {
      query['dateTime.start'] = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query['dateTime.end'] = { $lte: new Date(endDate) };
    }

    // Price type filter
    if (priceType) {
      query['price.type'] = priceType;
    }

    // Virtual filter
    if (isVirtual !== undefined) {
      query['features.isVirtual'] = isVirtual === 'true';
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Sort options
    const sortOptions = {};
    if (sort === 'dateTime.start') {
      sortOptions['dateTime.start'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'createdAt') {
      sortOptions.createdAt = order === 'desc' ? -1 : 1;
    } else if (sort === 'popularity') {
      sortOptions['social.likes'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'capacity') {
      sortOptions.capacity = order === 'desc' ? -1 : 1;
    }

    const events = await Event.find(query)
      .populate('host', 'username firstName lastName avatar')
      .populate('cohosts', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('host', 'username firstName lastName avatar bio')
      .populate('cohosts', 'username firstName lastName avatar')
      .populate('attendees.user', 'username firstName lastName avatar')
      .populate('waitlist.user', 'username firstName lastName avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Increment views
    await event.incrementViews();

    // Check if user is authenticated and get their status
    let userStatus = null;
    if (req.user) {
      const attendee = event.attendees.find(a => 
        a.user._id.toString() === req.user.id
      );
      if (attendee) {
        userStatus = attendee.status;
      } else if (event.waitlist.some(w => w.user._id.toString() === req.user.id)) {
        userStatus = 'waitlist';
      }
    }

    res.json({
      success: true,
      data: {
        event,
        userStatus
      }
    });

  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      subcategory,
      cohosts,
      location,
      dateTime,
      capacity,
      price,
      images,
      tags,
      requirements,
      features,
      virtualDetails,
      recurring,
      visibility
    } = req.body;

    // Create new event
    const event = new Event({
      title,
      description,
      category,
      subcategory,
      host: req.user.id,
      cohosts: cohosts || [],
      location,
      dateTime,
      capacity,
      price,
      images: images || [],
      tags: tags || [],
      requirements: requirements || {},
      features: features || {},
      virtualDetails: features?.isVirtual ? virtualDetails : {},
      recurring: features?.isRecurring ? recurring : {},
      visibility: visibility || 'public'
    });

    await event.save();

    // Add host as confirmed attendee
    await event.addAttendee(req.user.id, 'confirmed');

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('eventsHosted');
      await user.save();
    }

    // Populate host info for response
    await event.populate('host', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: { event }
    });

  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Check if user is host or cohost
    if (event.host.toString() !== req.user.id && 
        !event.cohosts.some(c => c.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este evento'
      });
    }

    // Check if event can be edited
    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar un evento completado o cancelado'
      });
    }

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.host;
    delete updateFields.status;
    delete updateFields.attendees;
    delete updateFields.waitlist;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('host', 'username firstName lastName avatar')
    .populate('cohosts', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: { event: updatedEvent }
    });

  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Check if user is host
    if (event.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Solo el anfitrión puede eliminar el evento'
      });
    }

    // Check if event can be deleted
    if (event.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un evento completado'
      });
    }

    // Soft delete - change status to deleted
    event.status = 'deleted';
    await event.save();

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Join event
// @route   POST /api/events/:id/join
// @access  Private
const joinEvent = async (req, res) => {
  try {
    const { status = 'pending' } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'No se puede unir a un evento que no está publicado'
      });
    }

    // Check if event is full
    if (event.isFull && status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'El evento está lleno'
      });
    }

    // Check if user is already attending
    const existingAttendee = event.attendees.find(a => 
      a.user.toString() === req.user.id
    );

    if (existingAttendee) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás registrado en este evento'
      });
    }

    // Add user to event
    await event.addAttendee(req.user.id, status);

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('eventsAttended');
      await user.save();
    }

    // Send notification to host
    if (event.host.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: event.host,
        sender: req.user.id,
        type: status === 'confirmed' ? 'event_joined' : 'event_rsvp',
        title: status === 'confirmed' ? 'Nuevo asistente confirmado' : 'Nueva RSVP',
        message: `${req.user.firstName} ${req.user.lastName} se ha ${status === 'confirmed' ? 'unido' : 'registrado'} a tu evento "${event.title}"`,
        category: 'event',
        data: {
          event: event._id,
          eventTitle: event.title,
          eventDate: event.dateTime.start,
          user: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
      await notification.save();
    }

    // Populate event for response
    await event.populate('host', 'username firstName lastName avatar');
    await event.populate('attendees.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: `Te has ${status === 'confirmed' ? 'unido' : 'registrado'} al evento exitosamente`,
      data: { event }
    });

  } catch (error) {
    console.error('Error uniéndose al evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Leave event
// @route   POST /api/events/:id/leave
// @access  Private
const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Check if user is attending
    const attendee = event.attendees.find(a => 
      a.user.toString() === req.user.id
    );

    if (!attendee) {
      return res.status(400).json({
        success: false,
        message: 'No estás registrado en este evento'
      });
    }

    // Remove user from event
    await event.removeAttendee(req.user.id);

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('eventsAttended', -1);
      await user.save();
    }

    // Send notification to host
    if (event.host.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: event.host,
        sender: req.user.id,
        type: 'event_left',
        title: 'Asistente se retiró',
        message: `${req.user.firstName} ${req.user.lastName} se ha retirado de tu evento "${event.title}"`,
        category: 'event',
        data: {
          event: event._id,
          eventTitle: event.title,
          eventDate: event.dateTime.start,
          user: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
      await notification.save();
    }

    // Populate event for response
    await event.populate('host', 'username firstName lastName avatar');
    await event.populate('attendees.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Te has retirado del evento exitosamente',
      data: { event }
    });

  } catch (error) {
    console.error('Error retirándose del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle event like
// @route   POST /api/events/:id/like
// @access  Private
const toggleEventLike = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Toggle like
    await event.toggleLike(req.user.id);

    // Populate event for response
    await event.populate('host', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: event.social.likes.some(l => l.user.toString() === req.user.id) ? 
        'Evento marcado como me gusta' : 'Me gusta removido',
      data: { event }
    });

  } catch (error) {
    console.error('Error marcando me gusta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Share event
// @route   POST /api/events/:id/share
// @access  Private
const shareEvent = async (req, res) => {
  try {
    const { platform } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Add share
    await event.addShare(req.user.id, platform);

    res.json({
      success: true,
      message: 'Evento compartido exitosamente',
      data: { event }
    });

  } catch (error) {
    console.error('Error compartiendo evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nearby events
// @route   GET /api/events/nearby
// @access  Public
const getNearbyEvents = async (req, res) => {
  try {
    const { coordinates, maxDistance = 10000, limit = 20 } = req.query;

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas son requeridas'
      });
    }

    const coordArray = coordinates.split(',').map(Number);
    if (coordArray.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Formato de coordenadas inválido'
      });
    }

    const events = await Event.findNearby(coordArray, parseInt(maxDistance), parseInt(limit));

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Error obteniendo eventos cercanos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.findByCategory(category, parseInt(limit));
    const total = await Event.countDocuments({ 
      category, 
      status: 'published',
      'dateTime.start': { $gte: new Date() }
    });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo eventos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.findUpcoming(parseInt(limit));
    const total = await Event.countDocuments({ 
      status: 'published',
      'dateTime.start': { $gte: new Date() }
    });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo eventos próximos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get events by host
// @route   GET /api/events/host/:hostId
// @access  Public
const getEventsByHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.findByHost(hostId, parseInt(limit));
    const total = await Event.countDocuments({ 
      host: hostId,
      status: { $in: ['published', 'completed'] }
    });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo eventos por anfitrión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  toggleEventLike,
  shareEvent,
  getNearbyEvents,
  getEventsByCategory,
  getUpcomingEvents,
  getEventsByHost
};
const cloudinary = require('../config/cloudinary');
const { Event, User } = require('../models');
const GamificationService = require('../services/GamificationService');

class EventController {
  // ==========================================
  // OBTENER EVENTOS
  // ==========================================

  async getEvents(req, res) {
    try {
      const { page = 1, limit = 10, category, location, date } = req.query;
      const skip = (page - 1) * limit;

      const filter = { status: 'published' };

      if (category) filter.categories = category;
      if (location) filter['location.city'] = new RegExp(location, 'i');
      if (date) {
        const targetDate = new Date(date);
        filter.startDate = {
          $gte: targetDate,
          $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        };
      }

      const events = await Event.find(filter)
        .populate('organizer', 'firstName lastName avatar')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Event.countDocuments(filter);

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
      res.status(500).json({
        success: false,
        message: 'Error obteniendo eventos',
        error: error.message
      });
    }
  }

  async getEventById(req, res) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId)
        .populate('organizer', 'firstName lastName avatar')
        .populate('attendees', 'firstName lastName avatar');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo evento',
        error: error.message
      });
    }
  }

  async searchEvents(req, res) {
    try {
      const { q, category, location, date } = req.query;
      const filter = { status: 'published' };

      if (q) {
        filter.$or = [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { tags: new RegExp(q, 'i') }
        ];
      }

      if (category) filter.categories = category;
      if (location) filter['location.city'] = new RegExp(location, 'i');
      if (date) {
        const targetDate = new Date(date);
        filter.startDate = {
          $gte: targetDate,
          $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        };
      }

      const events = await Event.find(filter)
        .populate('organizer', 'firstName lastName avatar')
        .sort({ startDate: 1 })
        .limit(20);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error buscando eventos',
        error: error.message
      });
    }
  }

  async getRecommendedEvents(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Obtener preferencias del usuario
      const user = await User.findById(userId).select('preferences interests');
      
      const filter = { 
        status: 'published',
        startDate: { $gte: new Date() }
      };

      // Filtrar por preferencias del usuario
      if (user?.preferences?.categories?.length > 0) {
        filter.categories = { $in: user.preferences.categories };
      }

      const events = await Event.find(filter)
        .populate('organizer', 'firstName lastName avatar')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Event.countDocuments(filter);

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
      res.status(500).json({
        success: false,
        message: 'Error obteniendo eventos recomendados',
        error: error.message
      });
    }
  }

  // ==========================================
  // CREAR EVENTO COMPLETO
  // ==========================================

  async createEvent(req, res) {
    try {
      const userId = req.user.id;
      const eventData = req.body;

      // Validar datos requeridos
      const requiredFields = [
        'title',
        'description',
        'category',
        'startDateTime',
        'endDateTime',
      ];
      for (const field of requiredFields) {
        if (!eventData[field]) {
          return res.status(400).json({
            success: false,
            message: `El campo ${field} es requerido`,
          });
        }
      }

      // Validar fechas
      const startDate = new Date(eventData.startDateTime);
      const endDate = new Date(eventData.endDateTime);
      const now = new Date();

      if (startDate <= now) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de inicio debe ser en el futuro',
        });
      }

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de fin debe ser después del inicio',
        });
      }

      // Preparar datos del evento
      const newEventData = {
        ...eventData,
        organizer: userId,
        startDate,
        endDate,
        status: eventData.status || 'published',
        createdAt: new Date(),
        updatedAt: new Date(),

        // Configuraciones por defecto
        attendees: [],
        interestedUsers: [],
        stats: {
          views: 0,
          interactions: 0,
          shares: 0,
        },

        // Configurar ubicación
        location: this.processLocationData(eventData.location),

        // Configurar precios
        price: eventData.price || 0,
        currency: eventData.currency || 'USD',

        // Configurar capacidad
        capacity: eventData.capacity || null,

        // Configurar configuraciones de privacidad
        isPrivate: eventData.isPrivate || false,
        requiresApproval: eventData.requiresApproval || false,

        // Tags y categorías
        tags: eventData.tags || [],
        categories: [eventData.category],

        // Configuraciones avanzadas
        ageRestriction: eventData.ageRestriction || { hasRestriction: false },
        cancellationPolicy: eventData.cancellationPolicy || 'flexible',
        refundPolicy: eventData.refundPolicy || 'full',
      };

      // Manejar imágenes si están presentes
      if (req.files) {
        const imageUrls = await this.uploadEventImages(req.files);
        newEventData.images = imageUrls;
        if (imageUrls.length > 0) {
          newEventData.coverImage = imageUrls[0];
        }
      }

      // Crear evento
      const event = new Event(newEventData);
      await event.save();

      // Poblar datos del organizador
      await event.populate('organizer', 'firstName lastName avatar username');

      // Manejar evento recurrente
      if (eventData.isRecurring && eventData.recurrence) {
        await this.createRecurringEvents(event, eventData.recurrence);
      }

      // Otorgar experiencia por crear evento
      await GamificationService.addExperience(userId, {
        amount: 50,
        source: 'event_creation',
        description: `Creó el evento: ${event.title}`,
      });

      // Actualizar estadísticas del usuario
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.eventsHosted': 1 },
      });

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: {
          event,
          experienceGained: 50,
          nextSteps: [
            'Publica tu evento en redes sociales',
            'Invita a tus amigos',
            'Configura recordatorios',
          ],
        },
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // ==========================================
  // ACTUALIZAR EVENTO
  // ==========================================

  async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Verificar que el evento existe y el usuario es el organizador
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar este evento',
        });
      }

      // Validar fechas si se están actualizando
      if (updateData.startDateTime || updateData.endDateTime) {
        const startDate = new Date(updateData.startDateTime || event.startDate);
        const endDate = new Date(updateData.endDateTime || event.endDate);

        if (endDate <= startDate) {
          return res.status(400).json({
            success: false,
            message: 'La fecha de fin debe ser después del inicio',
          });
        }
      }

      // Manejar nuevas imágenes
      if (req.files) {
        const imageUrls = await this.uploadEventImages(req.files);
        updateData.images = [...(event.images || []), ...imageUrls];
        if (!event.coverImage && imageUrls.length > 0) {
          updateData.coverImage = imageUrls[0];
        }
      }

      // Procesar ubicación si se actualiza
      if (updateData.location) {
        updateData.location = this.processLocationData(updateData.location);
      }

      // Actualizar fecha de modificación
      updateData.updatedAt = new Date();

      // Actualizar evento
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('organizer', 'firstName lastName avatar username');

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: { event: updatedEvent },
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // GUARDAR BORRADOR
  // ==========================================

  async saveDraft(req, res) {
    try {
      const userId = req.user.id;
      const draftData = req.body;

      // Crear borrador con estado draft
      const draftEvent = {
        ...draftData,
        organizer: userId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDraft: true,
      };

      const event = new Event(draftEvent);
      await event.save();

      res.json({
        success: true,
        message: 'Borrador guardado exitosamente',
        data: {
          draftId: event._id,
          savedAt: event.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({
        success: false,
        message: 'Error guardando borrador',
      });
    }
  }

  // ==========================================
  // OBTENER EVENTOS
  // ==========================================

  async getEvents(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        location,
        radius = 25,
        startDate,
        endDate,
        priceMin,
        priceMax,
        search,
        sortBy = 'startDate',
        sortOrder = 'asc',
        status = 'published',
      } = req.query;

      // Construir filtros
      const filters = { status };

      if (category) filters.categories = category;
      if (startDate) filters.startDate = { $gte: new Date(startDate) };
      if (endDate) filters.endDate = { $lte: new Date(endDate) };
      if (priceMin || priceMax) {
        filters.price = {};
        if (priceMin) filters.price.$gte = parseFloat(priceMin);
        if (priceMax) filters.price.$lte = parseFloat(priceMax);
      }

      // Filtro de búsqueda por texto
      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      // Filtro de ubicación
      if (location) {
        const [lng, lat] = location.split(',').map(Number);
        filters.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radius * 1000, // convertir km a metros
          },
        };
      }

      // Configurar paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Configurar ordenamiento
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Ejecutar consulta
      const events = await Event.find(filters)
        .populate('organizer', 'firstName lastName avatar username')
        .populate('tribe', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Contar total para paginación
      const total = await Event.countDocuments(filters);

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalEvents: total,
            hasNext: skip + events.length < total,
            hasPrev: parseInt(page) > 1,
          },
          filters: {
            category,
            location,
            radius,
            priceRange: { min: priceMin, max: priceMax },
            dateRange: { start: startDate, end: endDate },
          },
        },
      });
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // OBTENER EVENTO POR ID
  // ==========================================

  async getEventById(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      const event = await Event.findById(eventId)
        .populate('organizer', 'firstName lastName avatar username bio stats')
        .populate('tribe', 'name avatar description')
        .populate({
          path: 'attendees.userId',
          select: 'firstName lastName avatar username',
        });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      // Incrementar vistas si no es el organizador
      if (userId && event.organizer._id.toString() !== userId) {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { 'stats.views': 1 },
        });
      }

      // Agregar información específica del usuario
      let userRelation = null;
      if (userId) {
        const attendee = event.attendees.find(
          a => a.userId._id.toString() === userId
        );
        const isInterested = event.interestedUsers.includes(userId);

        userRelation = {
          isAttending: !!attendee,
          attendanceStatus: attendee?.status,
          isInterested,
          isOrganizer: event.organizer._id.toString() === userId,
          canEdit: event.organizer._id.toString() === userId,
        };
      }

      res.json({
        success: true,
        data: {
          event,
          userRelation,
          recommendations: await this.getRelatedEvents(
            eventId,
            event.categories
          ),
        },
      });
    } catch (error) {
      console.error('Error getting event by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // UNIRSE A EVENTO
  // ==========================================

  async joinEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      // Verificar si ya está registrado
      const alreadyAttending = event.attendees.some(
        attendee => attendee.userId.toString() === userId
      );

      if (alreadyAttending) {
        return res.status(400).json({
          success: false,
          message: 'Ya estás registrado en este evento',
        });
      }

      // Verificar capacidad
      if (event.capacity && event.attendees.length >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'El evento ha alcanzado su capacidad máxima',
        });
      }

      // Verificar restricción de edad
      if (event.ageRestriction?.hasRestriction) {
        const user = await User.findById(userId);
        const userAge = this.calculateAge(user.dateOfBirth);

        if (
          event.ageRestriction.minAge &&
          userAge < event.ageRestriction.minAge
        ) {
          return res.status(400).json({
            success: false,
            message: `Debes tener al menos ${event.ageRestriction.minAge} años`,
          });
        }

        if (
          event.ageRestriction.maxAge &&
          userAge > event.ageRestriction.maxAge
        ) {
          return res.status(400).json({
            success: false,
            message: `La edad máxima permitida es ${event.ageRestriction.maxAge} años`,
          });
        }
      }

      // Determinar estado inicial
      const status = event.requiresApproval ? 'pending' : 'confirmed';

      // Agregar a asistentes
      event.attendees.push({
        userId,
        status,
        joinedAt: new Date(),
      });

      // Remover de interesados si estaba ahí
      event.interestedUsers = event.interestedUsers.filter(
        id => id.toString() !== userId
      );

      await event.save();

      // Otorgar experiencia
      await GamificationService.addExperience(userId, {
        amount: 10,
        source: 'event_join',
        description: `Se unió al evento: ${event.title}`,
      });

      // Actualizar estadísticas del usuario
      if (status === 'confirmed') {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'stats.eventsAttended': 1 },
        });
      }

      res.json({
        success: true,
        message:
          status === 'pending'
            ? 'Solicitud enviada, espera la aprobación del organizador'
            : 'Te has unido al evento exitosamente',
        data: {
          status,
          experienceGained: 10,
          totalAttendees: event.attendees.length,
        },
      });
    } catch (error) {
      console.error('Error joining event:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // MARCAR INTERÉS
  // ==========================================

  async markInterested(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      const isAlreadyInterested = event.interestedUsers.includes(userId);
      const isAttending = event.attendees.some(
        a => a.userId.toString() === userId
      );

      if (isAttending) {
        return res.status(400).json({
          success: false,
          message: 'Ya estás registrado en este evento',
        });
      }

      if (isAlreadyInterested) {
        // Remover interés
        event.interestedUsers = event.interestedUsers.filter(
          id => id.toString() !== userId
        );
      } else {
        // Agregar interés
        event.interestedUsers.push(userId);
      }

      await event.save();

      res.json({
        success: true,
        message: isAlreadyInterested
          ? 'Interés removido del evento'
          : 'Marcado como interesado en el evento',
        data: {
          isInterested: !isAlreadyInterested,
          totalInterested: event.interestedUsers.length,
        },
      });
    } catch (error) {
      console.error('Error marking interest:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  processLocationData(locationData) {
    if (!locationData) return null;

    const processedLocation = {
      type: locationData.type || 'physical',
    };

    if (locationData.type === 'physical' || locationData.type === 'hybrid') {
      processedLocation.address = locationData.address;
      processedLocation.venue = locationData.venue;

      if (locationData.coordinates) {
        processedLocation.coordinates = {
          type: 'Point',
          coordinates: [
            locationData.coordinates.lng,
            locationData.coordinates.lat,
          ],
        };
      }
    }

    if (locationData.type === 'virtual' || locationData.type === 'hybrid') {
      processedLocation.virtualLink = locationData.virtualLink;
    }

    if (locationData.instructions) {
      processedLocation.instructions = locationData.instructions;
    }

    return processedLocation;
  }

  async uploadEventImages(files) {
    const imageUrls = [];

    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'eventconnect/events',
          transformation: [
            { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
          ],
        });
        imageUrls.push(result.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return imageUrls;
  }

  async createRecurringEvents(baseEvent, recurrence) {
    const events = [];
    const { frequency, interval, occurrences } = recurrence;

    for (let i = 1; i < occurrences; i++) {
      const newStartDate = new Date(baseEvent.startDate);
      const newEndDate = new Date(baseEvent.endDate);

      switch (frequency) {
        case 'daily':
          newStartDate.setDate(newStartDate.getDate() + interval * i);
          newEndDate.setDate(newEndDate.getDate() + interval * i);
          break;
        case 'weekly':
          newStartDate.setDate(newStartDate.getDate() + 7 * interval * i);
          newEndDate.setDate(newEndDate.getDate() + 7 * interval * i);
          break;
        case 'monthly':
          newStartDate.setMonth(newStartDate.getMonth() + interval * i);
          newEndDate.setMonth(newEndDate.getMonth() + interval * i);
          break;
      }

      const recurringEvent = new Event({
        ...baseEvent.toObject(),
        _id: undefined,
        startDate: newStartDate,
        endDate: newEndDate,
        parentEventId: baseEvent._id,
        isRecurring: false,
        attendees: [],
        interestedUsers: [],
      });

      events.push(recurringEvent);
    }

    if (events.length > 0) {
      await Event.insertMany(events);
    }

    return events;
  }

  async getRelatedEvents(eventId, categories) {
    const relatedEvents = await Event.find({
      _id: { $ne: eventId },
      categories: { $in: categories },
      status: 'published',
      startDate: { $gte: new Date() },
    })
      .populate('organizer', 'firstName lastName avatar')
      .limit(3)
      .sort({ startDate: 1 });

    return relatedEvents;
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // ==========================================
  // MÉTODOS FALTANTES - PARTICIPACIÓN
  // ==========================================

  async saveDraft(req, res) {
    try {
      const userId = req.user.id;
      const draftData = req.body;

      const draft = new Event({
        ...draftData,
        organizer: userId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await draft.save();

      res.status(201).json({
        success: true,
        message: 'Borrador guardado exitosamente',
        data: draft,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error guardando borrador',
        error: error.message,
      });
    }
  }

  async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este evento',
        });
      }

      // Manejar imágenes si están presentes
      if (req.files) {
        const imageUrls = await this.uploadEventImages(req.files);
        updateData.images = imageUrls;
        if (imageUrls.length > 0) {
          updateData.coverImage = imageUrls[0];
        }
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('organizer', 'firstName lastName avatar');

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: updatedEvent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error actualizando evento',
        error: error.message,
      });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este evento',
        });
      }

      await Event.findByIdAndDelete(eventId);

      res.json({
        success: true,
        message: 'Evento eliminado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error eliminando evento',
        error: error.message,
      });
    }
  }

  async joinEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.attendees.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Ya estás registrado en este evento',
        });
      }

      event.attendees.push(userId);
      await event.save();

      res.json({
        success: true,
        message: 'Te has unido al evento exitosamente',
        data: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uniéndote al evento',
        error: error.message,
      });
    }
  }

  async leaveEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (!event.attendees.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: 'No estás registrado en este evento',
        });
      }

      event.attendees = event.attendees.filter(
        (attendee) => attendee.toString() !== userId
      );
      await event.save();

      res.json({
        success: true,
        message: 'Has salido del evento exitosamente',
        data: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saliendo del evento',
        error: error.message,
      });
    }
  }

  async markInterested(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.interestedUsers.includes(userId)) {
        // Remover interés
        event.interestedUsers = event.interestedUsers.filter(
          (user) => user.toString() !== userId
        );
        await event.save();

        res.json({
          success: true,
          message: 'Interés removido exitosamente',
          data: event,
        });
      } else {
        // Agregar interés
        event.interestedUsers.push(userId);
        await event.save();

        res.json({
          success: true,
          message: 'Interés marcado exitosamente',
          data: event,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marcando interés',
        error: error.message,
      });
    }
  }

  async moderateAttendee(req, res) {
    try {
      const { eventId } = req.params;
      const { attendeeId, action } = req.body;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para moderar este evento',
        });
      }

      if (action === 'approve') {
        if (!event.pendingAttendees.includes(attendeeId)) {
          return res.status(400).json({
            success: false,
            message: 'El usuario no está en la lista de pendientes',
          });
        }
        event.pendingAttendees = event.pendingAttendees.filter(
          (id) => id.toString() !== attendeeId
        );
        event.attendees.push(attendeeId);
      } else if (action === 'reject') {
        event.pendingAttendees = event.pendingAttendees.filter(
          (id) => id.toString() !== attendeeId
        );
      }

      await event.save();

      res.json({
        success: true,
        message: `Usuario ${action === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`,
        data: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error moderando asistente',
        error: error.message,
      });
    }
  }

  async reportEvent(req, res) {
    try {
      const { eventId } = req.params;
      const { reason, description } = req.body;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      // Aquí se implementaría la lógica de reporte
      // Por ahora solo retornamos éxito
      res.json({
        success: true,
        message: 'Evento reportado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error reportando evento',
        error: error.message,
      });
    }
  }

  async shareEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      // Incrementar contador de shares
      event.stats.shares = (event.stats.shares || 0) + 1;
      await event.save();

      res.json({
        success: true,
        message: 'Evento compartido exitosamente',
        data: {
          shareUrl: `${process.env.CLIENT_URL}/events/${eventId}`,
          stats: event.stats,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error compartiendo evento',
        error: error.message,
      });
    }
  }

  async addComment(req, res) {
    try {
      const { eventId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      const comment = {
        user: userId,
        content,
        createdAt: new Date(),
      };

      event.comments.push(comment);
      await event.save();

      res.json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: comment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error agregando comentario',
        error: error.message,
      });
    }
  }

  async getComments(req, res) {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const event = await Event.findById(eventId)
        .populate('comments.user', 'firstName lastName avatar')
        .select('comments');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      const comments = event.comments
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(skip, skip + parseInt(limit));

      res.json({
        success: true,
        data: {
          comments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: event.comments.length,
            pages: Math.ceil(event.comments.length / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo comentarios',
        error: error.message,
      });
    }
  }

  // ==========================================
  // MÉTODOS ADICIONALES - ANÁLISIS Y UTILIDADES
  // ==========================================

  async getEventAnalytics(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las estadísticas de este evento',
        });
      }

      const analytics = {
        totalAttendees: event.attendees.length,
        totalInterested: event.interestedUsers.length,
        totalViews: event.stats?.views || 0,
        totalShares: event.stats?.shares || 0,
        totalComments: event.comments?.length || 0,
        capacity: event.capacity,
        capacityPercentage: event.capacity ? (event.attendees.length / event.capacity) * 100 : null,
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas del evento',
        error: error.message,
      });
    }
  }

  async getAttendees(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const event = await Event.findById(eventId)
        .populate('attendees', 'firstName lastName avatar email')
        .select('attendees organizer');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver los asistentes de este evento',
        });
      }

      const attendees = event.attendees.slice(skip, skip + parseInt(limit));

      res.json({
        success: true,
        data: {
          attendees,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: event.attendees.length,
            pages: Math.ceil(event.attendees.length / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo asistentes',
        error: error.message,
      });
    }
  }

  async duplicateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const originalEvent = await Event.findById(eventId);
      if (!originalEvent) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      // Crear copia del evento
      const duplicatedEvent = new Event({
        ...originalEvent.toObject(),
        _id: undefined,
        organizer: userId,
        attendees: [],
        interestedUsers: [],
        comments: [],
        stats: {
          views: 0,
          interactions: 0,
          shares: 0,
        },
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await duplicatedEvent.save();

      res.json({
        success: true,
        message: 'Evento duplicado exitosamente',
        data: duplicatedEvent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error duplicando evento',
        error: error.message,
      });
    }
  }

  async exportEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId)
        .populate('organizer', 'firstName lastName email')
        .populate('attendees', 'firstName lastName email');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }

      if (event.organizer._id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para exportar este evento',
        });
      }

      const exportData = {
        event: {
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          category: event.category,
          organizer: event.organizer,
        },
        attendees: event.attendees,
        stats: event.stats,
        exportDate: new Date(),
      };

      res.json({
        success: true,
        message: 'Evento exportado exitosamente',
        data: exportData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error exportando evento',
        error: error.message,
      });
    }
  }
}

module.exports = new EventController();

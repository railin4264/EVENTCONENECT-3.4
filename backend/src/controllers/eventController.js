const { Event } = require('../models');

class EventController {
  async getEvents(req, res) {
    try {
      const events = await Event.find({ status: 'published' })
        .populate('organizer', 'firstName lastName avatar username')
        .sort({ startDate: 1 })
        .limit(20)
        .lean();

      res.json({
        success: true,
        data: { events }
      });
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getEventById(req, res) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId)
        .populate('organizer', 'firstName lastName avatar username');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      res.json({
        success: true,
        data: { event }
      });
    } catch (error) {
      console.error('Error getting event by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getFeaturedEvents(req, res) {
    try {
      const events = await Event.find({
        status: 'published',
        startDate: { $gte: new Date() }
      })
        .populate('organizer', 'firstName lastName avatar username')
        .sort({ startDate: 1 })
        .limit(5)
        .lean();

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error getting featured events:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo eventos destacados'
      });
    }
  }
}

module.exports = new EventController();



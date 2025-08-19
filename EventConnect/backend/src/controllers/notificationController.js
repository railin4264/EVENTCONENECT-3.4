const Notification = require('../models/Notification');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'unread',
      category,
      type,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const options = {
      status,
      category,
      type,
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const notifications = await Notification.findByRecipient(req.user.id, options);
    const total = await Notification.findUnreadCount(req.user.id, category);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('sender', 'username firstName lastName avatar')
      .populate('data.event', 'title dateTime')
      .populate('data.tribe', 'name')
      .populate('data.post', 'content')
      .populate('data.user', 'username firstName lastName avatar');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta notificación'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });

  } catch (error) {
    console.error('Error obteniendo notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta notificación'
      });
    }

    // Mark as read
    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: { notification }
    });

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { category } = req.query;

    await Notification.markAllAsRead(req.user.id, category);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Archive notification
// @route   PUT /api/notifications/:id/archive
// @access  Private
const archiveNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta notificación'
      });
    }

    // Archive notification
    await notification.archive();

    res.json({
      success: true,
      message: 'Notificación archivada exitosamente',
      data: { notification }
    });

  } catch (error) {
    console.error('Error archivando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Unarchive notification
// @route   PUT /api/notifications/:id/unarchive
// @access  Private
const unarchiveNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta notificación'
      });
    }

    // Unarchive notification
    await notification.unarchive();

    res.json({
      success: true,
      message: 'Notificación desarchivada exitosamente',
      data: { notification }
    });

  } catch (error) {
    console.error('Error desarchivando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta notificación'
      });
    }

    // Soft delete notification
    await notification.softDelete();

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const { category } = req.query;

    const count = await Notification.findUnreadCount(req.user.id, category);

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Error obteniendo conteo de no leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Admin/System)
const createNotification = async (req, res) => {
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
      recipient,
      sender,
      type,
      title,
      message,
      data,
      priority = 'normal',
      category,
      channels = ['in_app'],
      scheduledFor,
      expiresAt
    } = req.body;

    // Create new notification
    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      data,
      priority,
      category,
      channels,
      scheduledFor,
      expiresAt
    });

    await notification.save();

    // Populate notification for response
    await notification.populate('recipient', 'username firstName lastName');
    if (sender) {
      await notification.populate('sender', 'username firstName lastName');
    }

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: { notification }
    });

  } catch (error) {
    console.error('Error creando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private (Admin/System)
const updateNotification = async (req, res) => {
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

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.recipient;
    delete updateFields.sender;
    delete updateFields.type;

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('recipient', 'username firstName lastName')
    .populate('sender', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Notificación actualizada exitosamente',
      data: { notification: updatedNotification }
    });

  } catch (error) {
    console.error('Error actualizando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Send bulk notifications
// @route   POST /api/notifications/bulk
// @access  Private (Admin/System)
const sendBulkNotifications = async (req, res) => {
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
      recipients,
      sender,
      type,
      title,
      message,
      data,
      priority = 'normal',
      category,
      channels = ['in_app'],
      scheduledFor,
      expiresAt
    } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de destinatarios es requerida'
      });
    }

    // Create notifications for each recipient
    const notifications = [];
    for (const recipientId of recipients) {
      const notification = new Notification({
        recipient: recipientId,
        sender,
        type,
        title,
        message,
        data,
        priority,
        category,
        channels,
        scheduledFor,
        expiresAt
      });
      notifications.push(notification);
    }

    // Save all notifications
    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `${notifications.length} notificaciones enviadas exitosamente`,
      data: { count: notifications.length }
    });

  } catch (error) {
    console.error('Error enviando notificaciones masivas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const settings = user.preferences?.notifications || {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      categories: {
        events: true,
        tribes: true,
        social: true,
        chat: true,
        system: true
      }
    };

    res.json({
      success: true,
      data: { settings }
    });

  } catch (error) {
    console.error('Error obteniendo configuración de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
const updateNotificationSettings = async (req, res) => {
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
      email,
      push,
      sms,
      inApp,
      categories
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Update notification preferences
    if (!user.preferences) user.preferences = {};
    user.preferences.notifications = {
      email: email !== undefined ? email : user.preferences.notifications?.email,
      push: push !== undefined ? push : user.preferences.notifications?.push,
      sms: sms !== undefined ? sms : user.preferences.notifications?.sms,
      inApp: inApp !== undefined ? inApp : user.preferences.notifications?.inApp,
      categories: {
        ...user.preferences.notifications?.categories,
        ...categories
      }
    };

    await user.save();

    res.json({
      success: true,
      message: 'Configuración de notificaciones actualizada exitosamente',
      data: { settings: user.preferences.notifications }
    });

  } catch (error) {
    console.error('Error actualizando configuración de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Test notification
// @route   POST /api/notifications/test
// @access  Private
const testNotification = async (req, res) => {
  try {
    const { channel = 'in_app' } = req.body;

    // Create test notification
    const notification = new Notification({
      recipient: req.user.id,
      sender: req.user.id,
      type: 'test',
      title: 'Notificación de prueba',
      message: 'Esta es una notificación de prueba para verificar la configuración',
      category: 'system',
      channels: [channel],
      priority: 'normal'
    });

    await notification.save();

    // Populate notification for response
    await notification.populate('recipient', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Notificación de prueba enviada exitosamente',
      data: { notification }
    });

  } catch (error) {
    console.error('Error enviando notificación de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get notification analytics
// @route   GET /api/notifications/analytics
// @access  Private (Admin)
const getNotificationAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;

    const query = {};
    
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    if (category) {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }

    // Get basic stats
    const totalNotifications = await Notification.countDocuments(query);
    const readNotifications = await Notification.countDocuments({ ...query, status: 'read' });
    const unreadNotifications = await Notification.countDocuments({ ...query, status: 'unread' });

    // Get delivery stats
    const deliveryStats = await Notification.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalDelivered: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'read'] },
                1,
                0
              ]
            }
          },
          totalFailed: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$delivery.push.failed', true] },
                  { $eq: ['$delivery.email.failed', true] },
                  { $eq: ['$delivery.sms.failed', true] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get category distribution
    const categoryDistribution = await Notification.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get type distribution
    const typeDistribution = await Notification.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const analytics = {
      total: totalNotifications,
      read: readNotifications,
      unread: unreadNotifications,
      readRate: totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0,
      delivery: deliveryStats[0] || { totalSent: 0, totalDelivered: 0, totalFailed: 0 },
      categoryDistribution,
      typeDistribution
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Error obteniendo analytics de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserNotifications,
  getNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
  getUnreadCount,
  createNotification,
  updateNotification,
  sendBulkNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  testNotification,
  getNotificationAnalytics
};
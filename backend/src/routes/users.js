const express = require('express');
const { body, validationResult } = require('express-validator');

const { AppError } = require('../middleware/errorHandler');
const { User, Event, Tribe, Post } = require('../models');
const { redis } = require('../config');

const router = express.Router();

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Autenticación requerida', 401));
  }
  next();
};

// Middleware de autorización (propietario o admin)
const ownerOrAdmin = (req, res, next) => {
  const { id } = req.params;
  if (req.user.id !== id && req.user.role !== 'admin') {
    return next(new AppError('No autorizado', 403));
  }
  next();
};

// GET /api/users - Obtener lista de usuarios
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = 'createdAt' } = req.query;
    const skip = (page - 1) * limit;

    // Construir query
    const query = { status: 'active' };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // Ejecutar query
    const users = await User.find(query)
      .select('-password')
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('tribes', 'name avatar');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/user/profile - Obtener perfil del usuario actual
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { include } = req.query;

    const user = await User.findById(userId)
      .select('-password')
      .populate('tribes', 'name avatar description memberCount');

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Incluir datos adicionales si se solicitan
    const response = { success: true, data: user };

    if (include && include.includes('events')) {
      const events = await Event.find({ host: userId, status: 'active' })
        .select('name description startDate location category')
        .sort({ startDate: 1 })
        .limit(10);
      response.events = events;
    }

    if (include && include.includes('posts')) {
      const posts = await Post.find({ author: userId, status: 'active' })
        .select('content createdAt likes comments')
        .sort({ createdAt: -1 })
        .limit(10);
      response.posts = posts;
    }

    if (include && include.includes('stats')) {
      const stats = await getUserStats(userId);
      response.stats = stats;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/profile - Actualizar perfil del usuario actual
router.put(
  '/profile',
  requireAuth,
  [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('location').optional().isObject(),
    body('interests').optional().isArray(),
    body('socialLinks').optional().isObject(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Datos de validación inválidos', 400);
      }

      const userId = req.user.id;
      const updateData = req.body;

      // Remover campos sensibles
      delete updateData.password;
      delete updateData.email;
      delete updateData.role;
      delete updateData.status;

      const user = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Limpiar cache
      await redis.del(`user:${userId}`);

      res.json({
        success: true,
        data: user,
        message: 'Perfil actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id - Obtener usuario específico
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const user = await User.findById(id)
      .select('-password')
      .populate('tribes', 'name avatar description memberCount');

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Incluir datos adicionales si se solicitan
    const response = { success: true, data: user };

    if (include && include.includes('events')) {
      const events = await Event.find({ host: id, status: 'active' })
        .select('name description startDate location category')
        .sort({ startDate: 1 })
        .limit(10);
      response.events = events;
    }

    if (include && include.includes('posts')) {
      const posts = await Post.find({ author: id, status: 'active' })
        .select('content createdAt likes comments')
        .sort({ createdAt: -1 })
        .limit(10);
      response.posts = posts;
    }

    if (include && include.includes('stats')) {
      const stats = await getUserStats(id);
      response.stats = stats;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put(
  '/:id',
  requireAuth,
  ownerOrAdmin,
  [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('location').optional().isObject(),
    body('interests').optional().isArray(),
    body('socialLinks').optional().isObject(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Datos de validación inválidos', 400);
      }

      const { id } = req.params;
      const updateData = req.body;

      // Remover campos sensibles
      delete updateData.password;
      delete updateData.email;
      delete updateData.role;
      delete updateData.status;

      const user = await User.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Limpiar cache
      await redis.del(`user:${id}`);

      res.json({
        success: true,
        data: user,
        message: 'Usuario actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', requireAuth, ownerOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - marcar como inactivo
    const user = await User.findByIdAndUpdate(
      id,
      { status: 'inactive', deletedAt: new Date() },
      { new: true }
    );

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Limpiar cache
    await redis.del(`user:${id}`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/followers - Obtener seguidores
router.get('/:id/followers', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const followers = await User.find({ following: id })
      .select('username firstName lastName avatar bio')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ following: id });

    res.json({
      success: true,
      data: followers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/following - Obtener usuarios seguidos
router.get('/:id/following', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const following = await User.find({ _id: { $in: user.following } })
      .select('username firstName lastName avatar bio')
      .skip(skip)
      .limit(parseInt(limit));

    const total = user.following.length;

    res.json({
      success: true,
      data: following,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:id/follow - Seguir usuario
router.post('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (id === followerId) {
      throw new AppError('No puedes seguirte a ti mismo', 400);
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const follower = await User.findById(followerId);
    if (follower.following.includes(id)) {
      throw new AppError('Ya estás siguiendo a este usuario', 400);
    }

    // Agregar a following
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: id },
      $inc: { followingCount: 1 },
    });

    // Agregar a followers
    await User.findByIdAndUpdate(id, {
      $addToSet: { followers: followerId },
      $inc: { followersCount: 1 },
    });

    res.json({
      success: true,
      message: 'Usuario seguido exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id/follow - Dejar de seguir usuario
router.delete('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    const follower = await User.findById(followerId);
    if (!follower.following.includes(id)) {
      throw new AppError('No estás siguiendo a este usuario', 400);
    }

    // Remover de following
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: id },
      $inc: { followingCount: -1 },
    });

    // Remover de followers
    await User.findByIdAndUpdate(id, {
      $pull: { followers: followerId },
      $inc: { followersCount: -1 },
    });

    res.json({
      success: true,
      message: 'Dejaste de seguir al usuario exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// Función auxiliar para obtener estadísticas del usuario
async function getUserStats(userId) {
  try {
    const [eventCount, tribeCount, postCount, followerCount] =
      await Promise.all([
        Event.countDocuments({ host: userId, status: 'active' }),
        Tribe.countDocuments({ members: userId }),
        Post.countDocuments({ author: userId, status: 'active' }),
        User.countDocuments({ following: userId }),
      ]);

    return {
      eventCount,
      tribeCount,
      postCount,
      followerCount,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    return {
      eventCount: 0,
      tribeCount: 0,
      postCount: 0,
      followerCount: 0,
    };
  }
}

module.exports = router;

const { Tribe, User, Post } = require('../models');
const { cloudinary } = require('../config');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { validateTribeCreation, validateTribeUpdate } = require('../middleware/validation');

class TribeController {
  // Create new tribe
  createTribe = asyncHandler(async (req, res, next) => {
    try {
      const tribeData = req.body;
      const userId = req.user.id;

      // Add creator information
      tribeData.creator = userId;
      tribeData.members = [userId];
      tribeData.moderators = [userId];
      tribeData.status = 'active';

      // Handle location coordinates
      if (tribeData.location && tribeData.location.coordinates) {
        tribeData.location.type = 'Point';
        tribeData.location.coordinates = [
          tribeData.location.coordinates.longitude,
          tribeData.location.coordinates.latitude
        ];
      }

      // Create tribe
      const tribe = new Tribe(tribeData);
      await tribe.save();

      // Populate creator information
      await tribe.populate('creator', 'username firstName lastName avatar');
      await tribe.populate('members', 'username firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Tribu creada exitosamente',
        data: { tribe }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all tribes with filtering and pagination
  getTribes = asyncHandler(async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        subcategory,
        location,
        isPublic,
        tags,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        radius = 50,
        latitude,
        longitude
      } = req.query;

      // Build query
      const query = { status: 'active' };

      // Category filter
      if (category) {
        query.category = category;
      }

      // Subcategory filter
      if (subcategory) {
        query.subcategory = subcategory;
      }

      // Public/private filter
      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
      }

      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Location filter with geospatial query
      if (latitude && longitude && radius) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const tribes = await Tribe.find(query)
        .populate('creator', 'username firstName lastName avatar')
        .populate('members', 'username firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const total = await Tribe.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: {
          tribes,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get tribe by ID
  getTribeById = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user?.id;

      const tribe = await Tribe.findById(tribeId)
        .populate('creator', 'username firstName lastName avatar bio')
        .populate('members', 'username firstName lastName avatar')
        .populate('moderators', 'username firstName lastName avatar')
        .populate('tags');

      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if user is member
      let isMember = false;
      let isModerator = false;
      let isCreator = false;
      let userRole = null;

      if (userId) {
        isMember = tribe.members.some(member => member._id.toString() === userId);
        isModerator = tribe.moderators.some(moderator => moderator._id.toString() === userId);
        isCreator = tribe.creator._id.toString() === userId;
        
        if (isCreator) {
          userRole = 'creator';
        } else if (isModerator) {
          userRole = 'moderator';
        } else if (isMember) {
          userRole = 'member';
        } else {
          userRole = 'guest';
        }
      }

      // Increment view count
      tribe.views = (tribe.views || 0) + 1;
      await tribe.save();

      res.status(200).json({
        success: true,
        data: {
          tribe,
          userInteraction: {
            isMember,
            isModerator,
            isCreator,
            userRole
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Update tribe
  updateTribe = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find tribe and check permissions
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      if (tribe.creator.toString() !== userId && 
          !tribe.moderators.includes(userId) && 
          req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para editar esta tribu', 403);
      }

      // Handle location coordinates
      if (updateData.location && updateData.location.coordinates) {
        updateData.location.type = 'Point';
        updateData.location.coordinates = [
          updateData.location.coordinates.longitude,
          updateData.location.coordinates.latitude
        ];
      }

      // Update tribe
      const updatedTribe = await Tribe.findByIdAndUpdate(
        tribeId,
        updateData,
        { new: true, runValidators: true }
      ).populate('creator', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Tribu actualizada exitosamente',
        data: { tribe: updatedTribe }
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete tribe
  deleteTribe = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user.id;

      // Find tribe and check ownership
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      if (tribe.creator.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar esta tribu', 403);
      }

      // Delete tribe
      await Tribe.findByIdAndDelete(tribeId);

      res.status(200).json({
        success: true,
        message: 'Tribu eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Join tribe
  joinTribe = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user.id;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if tribe is public
      if (!tribe.isPublic && !tribe.requiresApproval) {
        throw new AppError('Esta tribu es privada y no acepta nuevos miembros', 400);
      }

      // Check if user is already a member
      if (tribe.members.includes(userId)) {
        throw new AppError('Ya eres miembro de esta tribu', 400);
      }

      // Check capacity
      if (tribe.maxMembers && tribe.members.length >= tribe.maxMembers) {
        throw new AppError('La tribu ha alcanzado su capacidad máxima', 400);
      }

      // Add user to members
      tribe.members.push(userId);
      tribe.memberCount = tribe.members.length;
      await tribe.save();

      // Populate tribe data
      await tribe.populate('creator', 'username firstName lastName avatar');
      await tribe.populate('members', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Te has unido a la tribu exitosamente',
        data: { tribe }
      });
    } catch (error) {
      next(error);
    }
  });

  // Leave tribe
  leaveTribe = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user.id;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if user is a member
      if (!tribe.members.includes(userId)) {
        throw new AppError('No eres miembro de esta tribu', 400);
      }

      // Check if user is creator
      if (tribe.creator.toString() === userId) {
        throw new AppError('El creador no puede dejar la tribu. Transfiere la propiedad o elimina la tribu', 400);
      }

      // Remove user from members and moderators
      tribe.members = tribe.members.filter(member => member.toString() !== userId);
      tribe.moderators = tribe.moderators.filter(moderator => moderator.toString() !== userId);
      tribe.memberCount = tribe.members.length;
      await tribe.save();

      // Populate tribe data
      await tribe.populate('creator', 'username firstName lastName avatar');
      await tribe.populate('members', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Has dejado la tribu exitosamente',
        data: { tribe }
      });
    } catch (error) {
      next(error);
    }
  });

  // Request to join tribe (for private tribes)
  requestJoinTribe = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user.id;
      const { message } = req.body;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if tribe requires approval
      if (!tribe.requiresApproval) {
        throw new AppError('Esta tribu no requiere aprobación para unirse', 400);
      }

      // Check if user is already a member
      if (tribe.members.includes(userId)) {
        throw new AppError('Ya eres miembro de esta tribu', 400);
      }

      // Check if request already exists
      if (tribe.joinRequests && tribe.joinRequests.some(req => req.user.toString() === userId)) {
        throw new AppError('Ya has enviado una solicitud para unirte a esta tribu', 400);
      }

      // Add join request
      if (!tribe.joinRequests) {
        tribe.joinRequests = [];
      }

      tribe.joinRequests.push({
        user: userId,
        message: message || '',
        status: 'pending',
        requestedAt: new Date()
      });

      await tribe.save();

      res.status(200).json({
        success: true,
        message: 'Solicitud enviada exitosamente. Espera la aprobación de los moderadores.'
      });
    } catch (error) {
      next(error);
    }
  });

  // Approve/deny join request
  handleJoinRequest = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId, requestId } = req.params;
      const { action } = req.body; // 'approve' or 'deny'
      const userId = req.user.id;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if user is moderator or creator
      if (tribe.creator.toString() !== userId && 
          !tribe.moderators.includes(userId) && 
          req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para manejar solicitudes', 403);
      }

      // Find join request
      const joinRequest = tribe.joinRequests.id(requestId);
      if (!joinRequest) {
        throw new AppError('Solicitud no encontrada', 404);
      }

      if (action === 'approve') {
        // Add user to members
        if (!tribe.members.includes(joinRequest.user)) {
          tribe.members.push(joinRequest.user);
          tribe.memberCount = tribe.members.length;
        }
        
        // Update request status
        joinRequest.status = 'approved';
        joinRequest.processedBy = userId;
        joinRequest.processedAt = new Date();

        // Remove request
        tribe.joinRequests = tribe.joinRequests.filter(req => req._id.toString() !== requestId);

        await tribe.save();

        res.status(200).json({
          success: true,
          message: 'Solicitud aprobada exitosamente'
        });
      } else if (action === 'deny') {
        // Update request status
        joinRequest.status = 'denied';
        joinRequest.processedBy = userId;
        joinRequest.processedAt = new Date();

        // Remove request
        tribe.joinRequests = tribe.joinRequests.filter(req => req._id.toString() !== requestId);

        await tribe.save();

        res.status(200).json({
          success: true,
          message: 'Solicitud denegada exitosamente'
        });
      } else {
        throw new AppError('Acción inválida. Debe ser "approve" o "deny"', 400);
      }
    } catch (error) {
      next(error);
    }
  });

  // Add moderator
  addModerator = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const { userId: newModeratorId } = req.body;
      const currentUserId = req.user.id;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if current user is creator or admin
      if (tribe.creator.toString() !== currentUserId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para agregar moderadores', 403);
      }

      // Check if user is already a moderator
      if (tribe.moderators.includes(newModeratorId)) {
        throw new AppError('El usuario ya es moderador de esta tribu', 400);
      }

      // Check if user is a member
      if (!tribe.members.includes(newModeratorId)) {
        throw new AppError('El usuario debe ser miembro de la tribu para ser moderador', 400);
      }

      // Add user to moderators
      tribe.moderators.push(newModeratorId);
      await tribe.save();

      res.status(200).json({
        success: true,
        message: 'Moderador agregado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Remove moderator
  removeModerator = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId, moderatorId } = req.params;
      const currentUserId = req.user.id;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      // Check if current user is creator or admin
      if (tribe.creator.toString() !== currentUserId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para remover moderadores', 403);
      }

      // Check if user is a moderator
      if (!tribe.moderators.includes(moderatorId)) {
        throw new AppError('El usuario no es moderador de esta tribu', 400);
      }

      // Remove user from moderators
      tribe.moderators = tribe.moderators.filter(moderator => moderator.toString() !== moderatorId);
      await tribe.save();

      res.status(200).json({
        success: true,
        message: 'Moderador removido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Get tribe members
  getTribeMembers = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const { page = 1, limit = 20, role } = req.query;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      let members = [];

      if (role === 'moderators') {
        members = await User.find({ _id: { $in: tribe.moderators } })
          .select('username firstName lastName avatar bio createdAt')
          .lean();
      } else if (role === 'creator') {
        members = await User.find({ _id: tribe.creator })
          .select('username firstName lastName avatar bio createdAt')
          .lean();
      } else {
        // Get all members with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        members = await User.find({ _id: { $in: tribe.members } })
          .select('username firstName lastName avatar bio createdAt')
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
      }

      const total = tribe.members.length;
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          members,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get tribe posts
  getTribePosts = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find({ tribe: tribeId, status: 'active' })
        .populate('author', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments({ tribe: tribeId, status: 'active' });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          posts,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Upload tribe images
  uploadTribeImages = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const userId = req.user.id;
      const files = req.files;

      if (!files || files.length === 0) {
        throw new AppError('No se proporcionaron archivos', 400);
      }

      // Check tribe permissions
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      if (tribe.creator.toString() !== userId && 
          !tribe.moderators.includes(userId) && 
          req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para subir imágenes a esta tribu', 403);
      }

      // Upload images to Cloudinary
      const uploadResults = await cloudinary.uploadTribeImages(files, tribeId);

      if (uploadResults.failureCount > 0) {
        console.warn('Algunas imágenes no se pudieron subir:', uploadResults.failed);
      }

      // Update tribe with new images
      const newImages = uploadResults.successful.map(result => ({
        url: result.url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }));

      tribe.images = [...(tribe.images || []), ...newImages];
      await tribe.save();

      res.status(200).json({
        success: true,
        message: 'Imágenes subidas exitosamente',
        data: {
          uploadedImages: newImages,
          totalImages: tribe.images.length,
          uploadResults
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete tribe image
  deleteTribeImage = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId, imageId } = req.params;
      const userId = req.user.id;

      // Check tribe permissions
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new AppError('Tribu no encontrada', 404);
      }

      if (tribe.creator.toString() !== userId && 
          !tribe.moderators.includes(userId) && 
          req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar imágenes de esta tribu', 403);
      }

      // Find image
      const image = tribe.images.id(imageId);
      if (!image) {
        throw new AppError('Imagen no encontrada', 404);
      }

      // Delete from Cloudinary
      if (image.publicId) {
        await cloudinary.deleteFile(image.publicId, 'image');
      }

      // Remove from tribe
      tribe.images = tribe.images.filter(img => img._id.toString() !== imageId);
      await tribe.save();

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user's tribes
  getUserTribes = asyncHandler(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { type = 'all', page = 1, limit = 20 } = req.query;

      let query = {};

      switch (type) {
        case 'created':
          query.creator = userId;
          break;
        case 'member':
          query.members = userId;
          break;
        case 'moderator':
          query.moderators = userId;
          break;
        case 'all':
          query.$or = [
            { creator: userId },
            { members: userId },
            { moderators: userId }
          ];
          break;
        default:
          throw new AppError('Tipo de tribu inválido', 400);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const tribes = await Tribe.find(query)
        .populate('creator', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Tribe.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          tribes,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get trending tribes
  getTrendingTribes = asyncHandler(async (req, res, next) => {
    try {
      const { limit = 10, days = 7 } = req.query;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      const tribes = await Tribe.aggregate([
        {
          $match: {
            status: 'active',
            createdAt: { $gte: dateFrom }
          }
        },
        {
          $addFields: {
            score: {
              $add: [
                { $multiply: ['$views', 0.3] },
                { $multiply: ['$memberCount', 0.5] },
                { $multiply: ['$postCount', 0.2] }
              ]
            }
          }
        },
        {
          $sort: { score: -1 }
        },
        {
          $limit: parseInt(limit)
        },
        {
          $lookup: {
            from: 'users',
            localField: 'creator',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $unwind: '$creator'
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            category: 1,
            subcategory: 1,
            images: 1,
            tags: 1,
            memberCount: 1,
            postCount: 1,
            views: 1,
            score: 1,
            isPublic: 1,
            'creator.username': 1,
            'creator.firstName': 1,
            'creator.lastName': 1,
            'creator.avatar': 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: { tribes }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get nearby tribes
  getNearbyTribes = asyncHandler(async (req, res, next) => {
    try {
      const { latitude, longitude, radius = 50, limit = 20 } = req.query;

      if (!latitude || !longitude) {
        throw new AppError('Latitud y longitud son requeridas', 400);
      }

      const tribes = await Tribe.find({
        status: 'active',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      })
        .populate('creator', 'username firstName lastName avatar')
        .sort({ memberCount: -1 })
        .limit(parseInt(limit))
        .lean();

      res.status(200).json({
        success: true,
        data: { tribes }
      });
    } catch (error) {
      next(error);
    }
  });

  // Search tribes
  searchTribes = asyncHandler(async (req, res, next) => {
    try {
      const {
        query,
        category,
        location,
        tags,
        page = 1,
        limit = 20,
        sortBy = 'relevance'
      } = req.body;

      // Build search query
      const searchQuery = { status: 'active' };

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Apply other filters
      if (category) searchQuery.category = category;
      if (tags && tags.length > 0) {
        searchQuery.tags = { $in: tags };
      }

      // Build sort
      let sort = {};
      switch (sortBy) {
        case 'memberCount':
          sort = { memberCount: -1 };
          break;
        case 'createdAt':
          sort = { createdAt: -1 };
          break;
        case 'popularity':
          sort = { memberCount: -1, postCount: -1 };
          break;
        case 'relevance':
        default:
          if (query) {
            sort = { score: { $meta: 'textScore' } };
          } else {
            sort = { memberCount: -1 };
          }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const tribes = await Tribe.find(searchQuery)
        .populate('creator', 'username firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Tribe.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          tribes,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = new TribeController();
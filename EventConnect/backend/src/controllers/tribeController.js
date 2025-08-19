const Tribe = require('../models/Tribe');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// @desc    Get all tribes
// @route   GET /api/tribes
// @access  Public
const getTribes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status = 'active',
      search,
      sort = 'createdAt',
      order = 'desc',
      location,
      radius = 10000,
      tags,
      privacy = 'public'
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
        { name: { $regex: search, $options: 'i' } },
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

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Privacy filter
    if (privacy) {
      query['settings.privacy'] = privacy;
    }

    // Sort options
    const sortOptions = {};
    if (sort === 'createdAt') {
      sortOptions.createdAt = order === 'desc' ? -1 : 1;
    } else if (sort === 'members') {
      sortOptions['stats.totalMembers'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'popularity') {
      sortOptions['social.likes'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortOptions.name = order === 'desc' ? -1 : 1;
    }

    const tribes = await Tribe.find(query)
      .populate('creator', 'username firstName lastName avatar')
      .populate('admins', 'username firstName lastName avatar')
      .populate('moderators', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tribe.countDocuments(query);

    res.json({
      success: true,
      data: {
        tribes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo tribus:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single tribe
// @route   GET /api/tribes/:id
// @access  Public
const getTribe = async (req, res) => {
  try {
    const tribe = await Tribe.findById(req.params.id)
      .populate('creator', 'username firstName lastName avatar bio')
      .populate('admins', 'username firstName lastName avatar')
      .populate('moderators', 'username firstName lastName avatar')
      .populate('members.user', 'username firstName lastName avatar')
      .populate('discussions.author', 'username firstName lastName avatar')
      .populate('resources.uploadedBy', 'username firstName lastName avatar');

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check privacy settings
    if (tribe.settings.privacy === 'secret' && 
        !tribe.members.some(m => m.user._id.toString() === req.user?.id) &&
        tribe.creator.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tribu'
      });
    }

    // Increment views
    await tribe.incrementViews();

    // Check if user is authenticated and get their status
    let userRole = null;
    let userStatus = null;
    if (req.user) {
      const member = tribe.members.find(m => 
        m.user._id.toString() === req.user.id
      );
      if (member) {
        userRole = member.role;
        userStatus = member.status;
      }
    }

    res.json({
      success: true,
      data: {
        tribe,
        userRole,
        userStatus
      }
    });

  } catch (error) {
    console.error('Error obteniendo tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new tribe
// @route   POST /api/tribes
// @access  Private
const createTribe = async (req, res) => {
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
      name,
      description,
      category,
      subcategory,
      location,
      images,
      tags,
      rules,
      settings,
      features
    } = req.body;

    // Check if tribe name already exists
    const existingTribe = await Tribe.findOne({ name });
    if (existingTribe) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una tribu con ese nombre'
      });
    }

    // Create new tribe
    const tribe = new Tribe({
      name,
      description,
      category,
      subcategory,
      creator: req.user.id,
      location: location || {
        type: 'Point',
        coordinates: [0, 0]
      },
      images: images || {},
      tags: tags || [],
      rules: rules || [],
      settings: settings || {},
      features: features || {}
    });

    await tribe.save();

    // Add creator as member and admin
    await tribe.addMember(req.user.id, 'admin');
    await tribe.addAdmin(req.user.id);

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('tribesCreated');
      await user.save();
    }

    // Populate creator info for response
    await tribe.populate('creator', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Tribu creada exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error creando tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update tribe
// @route   PUT /api/tribes/:id
// @access  Private
const updateTribe = async (req, res) => {
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

    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if user is creator or admin
    if (tribe.creator.toString() !== req.user.id && 
        !tribe.admins.some(a => a.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta tribu'
      });
    }

    // Check if tribe can be edited
    if (tribe.status === 'deleted' || tribe.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una tribu eliminada o suspendida'
      });
    }

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.creator;
    delete updateFields.status;
    delete updateFields.members;

    const updatedTribe = await Tribe.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('creator', 'username firstName lastName avatar')
    .populate('admins', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Tribu actualizada exitosamente',
      data: { tribe: updatedTribe }
    });

  } catch (error) {
    console.error('Error actualizando tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete tribe
// @route   DELETE /api/tribes/:id
// @access  Private
const deleteTribe = async (req, res) => {
  try {
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if user is creator
    if (tribe.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador puede eliminar la tribu'
      });
    }

    // Soft delete - change status to deleted
    tribe.status = 'deleted';
    await tribe.save();

    res.json({
      success: true,
      message: 'Tribu eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Join tribe
// @route   POST /api/tribes/:id/join
// @access  Private
const joinTribe = async (req, res) => {
  try {
    const { role = 'member' } = req.body;
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if tribe is active
    if (tribe.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'No se puede unir a una tribu inactiva'
      });
    }

    // Check membership settings
    if (tribe.settings.membership === 'invite_only') {
      return res.status(400).json({
        success: false,
        message: 'Esta tribu solo acepta invitaciones'
      });
    }

    // Check if user is already a member
    const existingMember = tribe.members.find(m => 
      m.user.toString() === req.user.id
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Ya eres miembro de esta tribu'
      });
    }

    // Add user to tribe
    await tribe.addMember(req.user.id, role);

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('tribesJoined');
      await user.save();
    }

    // Send notification to creator and admins
    const notificationRecipients = [tribe.creator, ...tribe.admins];
    
    for (const recipientId of notificationRecipients) {
      if (recipientId.toString() !== req.user.id) {
        const notification = new Notification({
          recipient: recipientId,
          sender: req.user.id,
          type: 'tribe_joined',
          title: 'Nuevo miembro en la tribu',
          message: `${req.user.firstName} ${req.user.lastName} se ha unido a tu tribu "${tribe.name}"`,
          category: 'tribe',
          data: {
            tribe: tribe._id,
            tribeName: tribe.name,
            user: req.user.id,
            userName: `${req.user.firstName} ${req.user.lastName}`
          }
        });
        await notification.save();
      }
    }

    // Populate tribe for response
    await tribe.populate('creator', 'username firstName lastName avatar');
    await tribe.populate('members.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Te has unido a la tribu exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error uniéndose a la tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Leave tribe
// @route   POST /api/tribes/:id/leave
// @access  Private
const leaveTribe = async (req, res) => {
  try {
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if user is a member
    const member = tribe.members.find(m => 
      m.user.toString() === req.user.id
    );

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'No eres miembro de esta tribu'
      });
    }

    // Check if user is creator
    if (tribe.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'El creador no puede abandonar la tribu. Transfiere la propiedad o elimina la tribu.'
      });
    }

    // Remove user from tribe
    await tribe.removeMember(req.user.id);

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('tribesJoined', -1);
      await user.save();
    }

    // Send notification to creator and admins
    const notificationRecipients = [tribe.creator, ...tribe.admins];
    
    for (const recipientId of notificationRecipients) {
      if (recipientId.toString() !== req.user.id) {
        const notification = new Notification({
          recipient: recipientId,
          sender: req.user.id,
          type: 'tribe_left',
          title: 'Miembro abandonó la tribu',
          message: `${req.user.firstName} ${req.user.lastName} ha abandonado tu tribu "${tribe.name}"`,
          category: 'tribe',
          data: {
            tribe: tribe._id,
            tribeName: tribe.name,
            user: req.user.id,
            userName: `${req.user.firstName} ${req.user.lastName}`
          }
        });
        await notification.save();
      }
    }

    // Populate tribe for response
    await tribe.populate('creator', 'username firstName lastName avatar');
    await tribe.populate('members.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Has abandonado la tribu exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error abandonando la tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle tribe like
// @route   POST /api/tribes/:id/like
// @access  Private
const toggleTribeLike = async (req, res) => {
  try {
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Toggle like
    await tribe.toggleLike(req.user.id);

    // Populate tribe for response
    await tribe.populate('creator', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: tribe.social.likes.some(l => l.user.toString() === req.user.id) ? 
        'Tribu marcada como me gusta' : 'Me gusta removido',
      data: { tribe }
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

// @desc    Share tribe
// @route   POST /api/tribes/:id/share
// @access  Private
const shareTribe = async (req, res) => {
  try {
    const { platform } = req.body;
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Add share
    await tribe.addShare(req.user.id, platform);

    res.json({
      success: true,
      message: 'Tribu compartida exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error compartiendo tribu:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add tribe rule
// @route   POST /api/tribes/:id/rules
// @access  Private
const addTribeRule = async (req, res) => {
  try {
    const { title, description } = req.body;
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if user is creator or admin
    if (tribe.creator.toString() !== req.user.id && 
        !tribe.admins.some(a => a.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar reglas'
      });
    }

    // Add rule
    await tribe.addRule(title, description);

    res.json({
      success: true,
      message: 'Regla agregada exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error agregando regla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update tribe rule
// @route   PUT /api/tribes/:id/rules/:ruleId
// @access  Private
const updateTribeRule = async (req, res) => {
  try {
    const { title, description, isActive } = req.body;
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if user is creator or admin
    if (tribe.creator.toString() !== req.user.id && 
        !tribe.admins.some(a => a.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar reglas'
      });
    }

    // Update rule
    await tribe.updateRule(req.params.ruleId, { title, description, isActive });

    res.json({
      success: true,
      message: 'Regla actualizada exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error actualizando regla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove tribe rule
// @route   DELETE /api/tribes/:id/rules/:ruleId
// @access  Private
const removeTribeRule = async (req, res) => {
  try {
    const tribe = await Tribe.findById(req.params.id);

    if (!tribe) {
      return res.status(404).json({
        success: false,
        message: 'Tribu no encontrada'
      });
    }

    // Check if user is creator or admin
    if (tribe.creator.toString() !== req.user.id && 
        !tribe.admins.some(a => a.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar reglas'
      });
    }

    // Remove rule
    await tribe.removeRule(req.params.ruleId);

    res.json({
      success: true,
      message: 'Regla eliminada exitosamente',
      data: { tribe }
    });

  } catch (error) {
    console.error('Error eliminando regla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nearby tribes
// @route   GET /api/tribes/nearby
// @access  Public
const getNearbyTribes = async (req, res) => {
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

    const tribes = await Tribe.findNearby(coordArray, parseInt(maxDistance), parseInt(limit));

    res.json({
      success: true,
      data: { tribes }
    });

  } catch (error) {
    console.error('Error obteniendo tribus cercanas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get tribes by category
// @route   GET /api/tribes/category/:category
// @access  Public
const getTribesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const tribes = await Tribe.findByCategory(category, parseInt(limit));
    const total = await Tribe.countDocuments({ 
      category, 
      status: 'active',
      'settings.privacy': { $ne: 'secret' }
    });

    res.json({
      success: true,
      data: {
        tribes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo tribus por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get popular tribes
// @route   GET /api/tribes/popular
// @access  Public
const getPopularTribes = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const tribes = await Tribe.findPopular(parseInt(limit));
    const total = await Tribe.countDocuments({ 
      status: 'active',
      'settings.privacy': { $ne: 'secret' }
    });

    res.json({
      success: true,
      data: {
        tribes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo tribus populares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get tribes by creator
// @route   GET /api/tribes/creator/:creatorId
// @access  Public
const getTribesByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const tribes = await Tribe.findByCreator(creatorId, parseInt(limit));
    const total = await Tribe.countDocuments({ 
      $or: [
        { creator: creatorId },
        { admins: creatorId },
        { moderators: creatorId }
      ],
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        tribes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo tribus por creador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTribes,
  getTribe,
  createTribe,
  updateTribe,
  deleteTribe,
  joinTribe,
  leaveTribe,
  toggleTribeLike,
  shareTribe,
  addTribeRule,
  updateTribeRule,
  removeTribeRule,
  getNearbyTribes,
  getTribesByCategory,
  getPopularTribes,
  getTribesByCreator
};
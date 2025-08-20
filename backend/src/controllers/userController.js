const { validationResult } = require('express-validator');

const Event = require('../models/Event');
const Post = require('../models/Post');
const Tribe = require('../models/Tribe');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      includeStats = true,
      includeEvents = false,
      includeTribes = false,
    } = req.query;

    const user = await User.findById(id).select(
      '-password -refreshTokens -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user && req.user.id === id;
    const isFollowing = req.user ? user.isFollowedBy(req.user.id) : false;
    const isFriend = req.user
      ? user.isFollowing(req.user.id) && isFollowing
      : false;

    // Determine what data to include based on privacy settings
    const profileData = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      socialLinks: user.socialLinks,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      isFollowing,
      isOwnProfile,
    };

    // Add stats if requested and allowed
    if (
      includeStats &&
      (isOwnProfile ||
        user.preferences?.privacy?.profileVisibility === 'public' ||
        isFriend)
    ) {
      profileData.stats = {
        eventsAttendedCount: user.eventsAttendedCount,
        eventsHostedCount: user.eventsHostedCount,
        tribesJoinedCount: user.tribesJoinedCount,
        tribesCreatedCount: user.tribesCreatedCount,
        postsCreatedCount: user.postsCreatedCount,
      };
    }

    // Add events if requested and allowed
    if (
      includeEvents &&
      (isOwnProfile ||
        user.preferences?.privacy?.eventVisibility === 'public' ||
        isFriend)
    ) {
      const events = await Event.findByHost(id, 5);
      profileData.recentEvents = events;
    }

    // Add tribes if requested and allowed
    if (
      includeTribes &&
      (isOwnProfile ||
        user.preferences?.privacy?.tribeVisibility === 'public' ||
        isFriend)
    ) {
      const tribes = await Tribe.findByCreator(id, 5);
      profileData.recentTribes = tribes;
    }

    res.json({
      success: true,
      data: { user: profileData },
    });
  } catch (error) {
    console.error('Error obteniendo perfil del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -refreshTokens -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Error obteniendo perfil actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      bio,
      dateOfBirth,
      gender,
      location,
      interests,
      socialLinks,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (location !== undefined) user.location = location;
    if (interests !== undefined) user.interests = interests;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;

    await user.save();

    // Remove sensitive fields for response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpire;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpire;

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/me/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const { notifications, privacy, theme, language, currency } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Initialize preferences if they don't exist
    if (!user.preferences) user.preferences = {};

    // Update notification preferences
    if (notifications) {
      if (!user.preferences.notifications) user.preferences.notifications = {};
      Object.assign(user.preferences.notifications, notifications);
    }

    // Update privacy preferences
    if (privacy) {
      if (!user.preferences.privacy) user.preferences.privacy = {};
      Object.assign(user.preferences.privacy, privacy);
    }

    // Update other preferences
    if (theme !== undefined) user.preferences.theme = theme;
    if (language !== undefined) user.preferences.language = language;
    if (currency !== undefined) user.preferences.currency = currency;

    await user.save();

    res.json({
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      data: { preferences: user.preferences },
    });
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is trying to follow themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes seguirte a ti mismo',
      });
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario actual no encontrado',
      });
    }

    // Check if already following
    const isAlreadyFollowing = currentUser.following.some(
      f => f.user.toString() === id
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás siguiendo a este usuario',
      });
    }

    // Add to following
    currentUser.following.push({
      user: id,
      followedAt: new Date(),
    });

    // Add to followers
    userToFollow.followers.push({
      user: req.user.id,
      followedAt: new Date(),
    });

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      success: true,
      message: 'Usuario seguido exitosamente',
      data: {
        isFollowing: true,
        followersCount: userToFollow.followersCount,
      },
    });
  } catch (error) {
    console.error('Error siguiendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario actual no encontrado',
      });
    }

    // Check if following
    const isFollowing = currentUser.following.some(
      f => f.user.toString() === id
    );

    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'No estás siguiendo a este usuario',
      });
    }

    // Remove from following
    currentUser.following = currentUser.following.filter(
      f => f.user.toString() !== id
    );

    // Remove from followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      f => f.user.toString() !== req.user.id
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);

    res.json({
      success: true,
      message: 'Usuario dejado de seguir exitosamente',
      data: {
        isFollowing: false,
        followersCount: userToUnfollow.followersCount,
      },
    });
  } catch (error) {
    console.error('Error dejando de seguir usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user && req.user.id === id;
    const isFollowing = req.user ? user.isFollowedBy(req.user.id) : false;
    const isFriend = req.user
      ? user.isFollowing(req.user.id) && isFollowing
      : false;

    if (
      user.preferences?.privacy?.profileVisibility === 'private' &&
      !isOwnProfile &&
      !isFriend
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta información',
      });
    }

    const followers = await User.findById(id)
      .populate('followers.user', 'username firstName lastName avatar')
      .select('followers');

    const total = user.followersCount;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFollowers = followers.followers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        followers: paginatedFollowers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo seguidores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user && req.user.id === id;
    const isFollowing = req.user ? user.isFollowedBy(req.user.id) : false;
    const isFriend = req.user
      ? user.isFollowing(req.user.id) && isFollowing
      : false;

    if (
      user.preferences?.privacy?.profileVisibility === 'private' &&
      !isOwnProfile &&
      !isFriend
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta información',
      });
    }

    const following = await User.findById(id)
      .populate('following.user', 'username firstName lastName avatar')
      .select('following');

    const total = user.followingCount;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFollowing = following.following.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        following: paginatedFollowing,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo seguidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user events
// @route   GET /api/users/:id/events
// @access  Public
const getUserEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type = 'all' } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user && req.user.id === id;
    const isFollowing = req.user ? user.isFollowedBy(req.user.id) : false;
    const isFriend = req.user
      ? user.isFollowing(req.user.id) && isFollowing
      : false;

    if (
      user.preferences?.privacy?.eventVisibility === 'private' &&
      !isOwnProfile &&
      !isFriend
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta información',
      });
    }

    let events = [];
    let total = 0;

    if (type === 'hosted' || type === 'all') {
      const hostedEvents = await Event.findByHost(id, parseInt(limit));
      events = [...events, ...hostedEvents];
    }

    if (type === 'attending' || type === 'all') {
      const attendingEvents = await Event.find({
        'attendees.user': id,
        'attendees.status': 'confirmed',
      })
        .populate('host', 'username firstName lastName avatar')
        .sort({ 'dateTime.start': 1 })
        .limit(parseInt(limit));

      events = [...events, ...attendingEvents];
    }

    // Remove duplicates and sort by date
    events = events.filter(
      (event, index, self) =>
        index === self.findIndex(e => e._id.toString() === event._id.toString())
    );
    events.sort(
      (a, b) => new Date(a.dateTime.start) - new Date(b.dateTime.start)
    );

    total = events.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = events.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        events: paginatedEvents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo eventos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user tribes
// @route   GET /api/users/:id/tribes
// @access  Public
const getUserTribes = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type = 'all' } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user && req.user.id === id;
    const isFollowing = req.user ? user.isFollowedBy(req.user.id) : false;
    const isFriend = req.user
      ? user.isFollowing(req.user.id) && isFollowing
      : false;

    if (
      user.preferences?.privacy?.tribeVisibility === 'private' &&
      !isOwnProfile &&
      !isFriend
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta información',
      });
    }

    let tribes = [];
    let total = 0;

    if (type === 'created' || type === 'all') {
      const createdTribes = await Tribe.findByCreator(id, parseInt(limit));
      tribes = [...tribes, ...createdTribes];
    }

    if (type === 'joined' || type === 'all') {
      const joinedTribes = await Tribe.find({
        'members.user': id,
        'members.status': 'active',
      })
        .populate('creator', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      tribes = [...tribes, ...joinedTribes];
    }

    // Remove duplicates and sort by creation date
    tribes = tribes.filter(
      (tribe, index, self) =>
        index === self.findIndex(t => t._id.toString() === tribe._id.toString())
    );
    tribes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    total = tribes.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTribes = tribes.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        tribes: paginatedTribes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo tribus del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user posts
// @route   GET /api/users/:id/posts
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user && req.user.id === id;
    const isFollowing = req.user ? user.isFollowedBy(req.user.id) : false;
    const isFriend = req.user
      ? user.isFollowing(req.user.id) && isFollowing
      : false;

    if (
      user.preferences?.privacy?.profileVisibility === 'private' &&
      !isOwnProfile &&
      !isFriend
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta información',
      });
    }

    const posts = await Post.findByAuthor(id, parseInt(limit));
    const total = await Post.countDocuments({
      author: id,
      status: 'published',
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo posts del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      category,
      location,
      sort = 'relevance',
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda debe tener al menos 2 caracteres',
      });
    }

    const searchQuery = {
      $and: [
        { isActive: true },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { bio: { $regex: q, $options: 'i' } },
            { interests: { $in: [new RegExp(q, 'i')] } },
          ],
        },
      ],
    };

    // Add category filter
    if (category) {
      searchQuery.$and.push({ interests: { $in: [category] } });
    }

    // Add location filter
    if (location) {
      searchQuery.$and.push({
        'location.address.city': { $regex: location, $options: 'i' },
      });
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'username':
        sortObj = { username: 1 };
        break;
      case 'recent':
        sortObj = { createdAt: -1 };
        break;
      case 'popular':
        sortObj = { followersCount: -1 };
        break;
      default:
        sortObj = { score: { $meta: 'textScore' } };
    }

    const users = await User.find(searchQuery)
      .select(
        '-password -refreshTokens -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire'
      )
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user badges
// @route   GET /api/users/:id/badges
// @access  Public
const getUserBadges = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: { badges: user.badges },
    });
  } catch (error) {
    console.error('Error obteniendo badges del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña es requerida para eliminar la cuenta',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña incorrecta',
      });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    user.status = 'deleted';
    await user.save();

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getUserProfile,
  getCurrentUser,
  updateProfile,
  updatePreferences,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserEvents,
  getUserTribes,
  getUserPosts,
  searchUsers,
  getUserBadges,
  deleteAccount,
};

const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      author,
      category,
      search,
      sort = 'createdAt',
      order = 'desc',
      tags,
      hashtags,
      location,
      radius = 10000,
      relatedEvent,
      relatedTribe
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { status: 'published', visibility: 'public' };

    // Type filter
    if (type) {
      query.type = type;
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Category filter (for event/tribe posts)
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { hashtags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Hashtags filter
    if (hashtags) {
      const hashtagArray = hashtags.split(',').map(hashtag => hashtag.trim());
      query.hashtags = { $in: hashtagArray };
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

    // Related event filter
    if (relatedEvent) {
      query.relatedEvent = relatedEvent;
    }

    // Related tribe filter
    if (relatedTribe) {
      query.relatedTribe = relatedTribe;
    }

    // Sort options
    const sortOptions = {};
    if (sort === 'createdAt') {
      sortOptions.createdAt = order === 'desc' ? -1 : 1;
    } else if (sort === 'popularity') {
      sortOptions['social.likes'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'views') {
      sortOptions['social.views'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'comments') {
      sortOptions['comments.length'] = order === 'desc' ? -1 : 1;
    }

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .populate('relatedEvent', 'title dateTime')
      .populate('relatedTribe', 'name')
      .populate('mentions', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar bio')
      .populate('relatedEvent', 'title dateTime location')
      .populate('relatedTribe', 'name location')
      .populate('mentions', 'username firstName lastName avatar')
      .populate('comments.author', 'username firstName lastName avatar')
      .populate('comments.replies.author', 'username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Check visibility
    if (post.visibility === 'private' && 
        post.author._id.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este post'
      });
    }

    // Increment views
    await post.incrementViews();

    // Check if user is authenticated and get their interactions
    let userLiked = false;
    let userSaved = false;
    if (req.user) {
      userLiked = post.social.likes.some(l => l.user.toString() === req.user.id);
      userSaved = post.social.saves.some(s => s.user.toString() === req.user.id);
    }

    res.json({
      success: true,
      data: {
        post,
        userLiked,
        userSaved
      }
    });

  } catch (error) {
    console.error('Error obteniendo post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
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
      type = 'text',
      title,
      content,
      media,
      location,
      tags,
      hashtags,
      relatedEvent,
      relatedTribe,
      poll,
      link,
      visibility = 'public',
      audience
    } = req.body;

    // Create new post
    const post = new Post({
      type,
      title,
      content,
      author: req.user.id,
      media: media || [],
      location: location || null,
      tags: tags || [],
      hashtags: hashtags || [],
      relatedEvent,
      relatedTribe,
      poll: poll || null,
      link: link || null,
      visibility,
      audience: audience || {}
    });

    await post.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('postsCreated');
      await user.save();
    }

    // Send notifications to mentioned users
    if (post.mentions && post.mentions.length > 0) {
      for (const mention of post.mentions) {
        if (mention.toString() !== req.user.id) {
          const notification = new Notification({
            recipient: mention,
            sender: req.user.id,
            type: 'mention',
            title: 'Mencionado en un post',
            message: `${req.user.firstName} ${req.user.lastName} te mencionó en un post`,
            category: 'social',
            data: {
              post: post._id,
              postContent: post.content.substring(0, 100),
              user: req.user.id,
              userName: `${req.user.firstName} ${req.user.lastName}`
            }
          });
          await notification.save();
        }
      }
    }

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error creando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
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

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este post'
      });
    }

    // Check if post can be edited
    if (post.status === 'deleted' || post.status === 'moderated') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar este post'
      });
    }

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.author;
    delete updateFields.status;
    delete updateFields.social;
    delete updateFields.comments;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      data: { post: updatedPost }
    });

  } catch (error) {
    console.error('Error actualizando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este post'
      });
    }

    // Soft delete - change status to deleted
    post.status = 'deleted';
    await post.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.updateStats('postsCreated', -1);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle post like
// @route   POST /api/posts/:id/like
// @access  Private
const togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Toggle like
    await post.toggleLike(req.user.id);

    // Send notification to author if liked
    if (post.social.likes.some(l => l.user.toString() === req.user.id) &&
        post.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        type: 'post_liked',
        title: 'Post marcado como me gusta',
        message: `${req.user.firstName} ${req.user.lastName} marcó tu post como me gusta`,
        category: 'social',
        data: {
          post: post._id,
          postContent: post.content.substring(0, 100),
          user: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
      await notification.save();
    }

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: post.social.likes.some(l => l.user.toString() === req.user.id) ? 
        'Post marcado como me gusta' : 'Me gusta removido',
      data: { post }
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

// @desc    Toggle post save
// @route   POST /api/posts/:id/save
// @access  Private
const togglePostSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Toggle save
    await post.toggleSave(req.user.id);

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: post.social.saves.some(s => s.user.toString() === req.user.id) ? 
        'Post guardado' : 'Post removido de guardados',
      data: { post }
    });

  } catch (error) {
    console.error('Error guardando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Share post
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = async (req, res) => {
  try {
    const { platform } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Add share
    await post.addShare(req.user.id, platform);

    res.json({
      success: true,
      message: 'Post compartido exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error compartiendo post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Add comment
    await post.addComment(req.user.id, content);

    // Send notification to author
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        type: 'post_commented',
        title: 'Nuevo comentario en tu post',
        message: `${req.user.firstName} ${req.user.lastName} comentó en tu post`,
        category: 'social',
        data: {
          post: post._id,
          postContent: post.content.substring(0, 100),
          user: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
      await notification.save();
    }

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');
    await post.populate('comments.author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error agregando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update comment
// @route   PUT /api/posts/:id/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Update comment
    await post.updateComment(req.params.commentId, req.user.id, content);

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');
    await post.populate('comments.author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error actualizando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Delete comment
    await post.deleteComment(req.params.commentId, req.user.id);

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');
    await post.populate('comments.author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle comment like
// @route   POST /api/posts/:id/comments/:commentId/like
// @access  Private
const toggleCommentLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Toggle comment like
    await post.toggleCommentLike(req.params.commentId, req.user.id);

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');
    await post.populate('comments.author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Like del comentario actualizado',
      data: { post }
    });

  } catch (error) {
    console.error('Error marcando like del comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add reply to comment
// @route   POST /api/posts/:id/comments/:commentId/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Add reply
    await post.addReply(req.params.commentId, req.user.id, content);

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');
    await post.populate('comments.author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Respuesta agregada exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error agregando respuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Vote in poll
// @route   POST /api/posts/:id/poll/vote
// @access  Private
const voteInPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    if (!post.poll) {
      return res.status(400).json({
        success: false,
        message: 'Este post no tiene una encuesta'
      });
    }

    // Vote in poll
    await post.voteInPoll(optionIndex, req.user.id);

    // Populate post for response
    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Voto registrado exitosamente',
      data: { post }
    });

  } catch (error) {
    console.error('Error votando en encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get trending posts
// @route   GET /api/posts/trending
// @access  Public
const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.findTrending(parseInt(limit));
    const total = await Post.countDocuments({ 
      status: 'published',
      visibility: 'public',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo posts trending:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get posts by author
// @route   GET /api/posts/author/:authorId
// @access  Public
const getPostsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.findByAuthor(authorId, parseInt(limit));
    const total = await Post.countDocuments({ 
      author: authorId,
      status: 'published'
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo posts por autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get posts by tags
// @route   GET /api/posts/tags/:tags
// @access  Public
const getPostsByTags = async (req, res) => {
  try {
    const { tags } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const tagArray = tags.split(',').map(tag => tag.trim());
    const posts = await Post.findByTags(tagArray, parseInt(limit));
    const total = await Post.countDocuments({ 
      tags: { $in: tagArray },
      status: 'published',
      visibility: 'public'
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo posts por tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get posts by hashtags
// @route   GET /api/posts/hashtags/:hashtags
// @access  Public
const getPostsByHashtags = async (req, res) => {
  try {
    const { hashtags } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const hashtagArray = hashtags.split(',').map(hashtag => hashtag.trim());
    const posts = await Post.findByHashtags(hashtagArray, parseInt(limit));
    const total = await Post.countDocuments({ 
      hashtags: { $in: hashtagArray },
      status: 'published',
      visibility: 'public'
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo posts por hashtags:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nearby posts
// @route   GET /api/posts/nearby
// @access  Public
const getNearbyPosts = async (req, res) => {
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

    const posts = await Post.findNearby(coordArray, parseInt(maxDistance), parseInt(limit));

    res.json({
      success: true,
      data: { posts }
    });

  } catch (error) {
    console.error('Error obteniendo posts cercanos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  togglePostSave,
  sharePost,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  addReply,
  voteInPoll,
  getTrendingPosts,
  getPostsByAuthor,
  getPostsByTags,
  getPostsByHashtags,
  getNearbyPosts
};
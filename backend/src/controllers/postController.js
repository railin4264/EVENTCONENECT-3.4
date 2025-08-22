const { cloudinary } = require('../config');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const {
  validatePostCreation,
  validatePostUpdate,
} = require('../middleware/validation');
const { Post, User, Event, Tribe } = require('../models');

class PostController {
  // Create new post
  createPost = asyncHandler(async (req, res, next) => {
    try {
      const postData = req.body;
      const userId = req.user.id;

      // Add author information
      postData.author = userId;
      // Status lo maneja el modelo (default 'published')

      // Saneos de payload
      if (postData.type && postData.type !== 'poll') {
        delete postData.poll;
      }
      if (postData.location) {
        const coords = postData.location.coordinates;
        const hasValidCoords = Array.isArray(coords) && coords.length === 2;
        if (!hasValidCoords) {
          delete postData.location;
        } else {
          // Normalizar a [lon, lat] números
          postData.location.type = 'Point';
          postData.location.coordinates = [
            Number(postData.location.coordinates[0]),
            Number(postData.location.coordinates[1]),
          ];
        }
      }

      // Mapear event → relatedEvent si viene del cliente
      if (postData.event && !postData.relatedEvent) {
        postData.relatedEvent = postData.event;
        delete postData.event;
      }

      // Handle media uploads if any
      if (req.files && req.files.length > 0) {
        const uploadResults = await cloudinary.uploadPostMedia(
          req.files,
          'temp'
        );

        if (uploadResults.failureCount > 0) {
          console.warn(
            'Algunas imágenes no se pudieron subir:',
            uploadResults.failed
          );
        }

        postData.media = uploadResults.successful.map(result => ({
          url: result.url,
          publicId: result.public_id,
          type: result.resource_type,
          width: result.width,
          height: result.height,
          format: result.format,
        }));
      }

      // Create post
      const post = new Post(postData);

      // Asegurar que no se persista location sin coordinates válidas
      if (
        !post.location ||
        !Array.isArray(post.location.coordinates) ||
        post.location.coordinates.length !== 2
      ) {
        post.location = undefined;
      }
      await post.save();

      // Populate author information
      await post.populate('author', 'username firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all posts with filtering and pagination
  getPosts = asyncHandler(async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category,
        author,
        event,
        tribe,
        tags,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        following = false,
      } = req.query;

      const userId = req.user?.id;

      // Build query
      const query = { status: 'active' };

      // Type filter
      if (type) {
        query.type = type;
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Author filter
      if (author) {
        query.author = author;
      }

      // Event filter
      if (event) {
        query.event = event;
      }

      // Tribe filter
      if (tribe) {
        query.tribe = tribe;
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
      }

      // Search filter
      if (search) {
        query.$or = [
          { content: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      // Following filter (posts from users the current user follows)
      if (following === 'true' && userId) {
        const user = await User.findById(userId).select('following');
        if (user && user.following && user.following.length > 0) {
          query.author = { $in: user.following };
        } else {
          // If user doesn't follow anyone, return empty result
          return res.status(200).json({
            success: true,
            data: {
              posts: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                total: 0,
                hasNextPage: false,
                hasPrevPage: false,
                limit: parseInt(limit),
              },
            },
          });
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find(query)
        .populate('author', 'username firstName lastName avatar')
        .populate('event', 'title category')
        .populate('tribe', 'name category')
        .populate('likes', 'username firstName lastName avatar')
        .populate('comments.author', 'username firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const total = await Post.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: {
          posts,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get post by ID
  getPostById = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId)
        .populate('author', 'username firstName lastName avatar bio')
        .populate('event', 'title category startDate endDate')
        .populate('tribe', 'name category')
        .populate('likes', 'username firstName lastName avatar')
        .populate('comments.author', 'username firstName lastName avatar')
        .populate('shares.author', 'username firstName lastName avatar')
        .populate('tags');

      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      // Check if user has liked, saved, or shared the post
      let isLiked = false;
      let isSaved = false;
      let isShared = false;
      let userRole = null;

      if (userId) {
        isLiked = post.likes.some(like => like._id.toString() === userId);
        isSaved =
          post.saves && post.saves.some(save => save.toString() === userId);
        isShared =
          post.shares &&
          post.shares.some(share => share.author._id.toString() === userId);

        if (post.author._id.toString() === userId) {
          userRole = 'author';
        } else {
          userRole = 'viewer';
        }
      }

      // Increment view count
      post.views = (post.views || 0) + 1;
      await post.save();

      res.status(200).json({
        success: true,
        data: {
          post,
          userInteraction: {
            isLiked,
            isSaved,
            isShared,
            userRole,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Update post
  updatePost = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find post and check ownership
      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      if (post.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para editar este post', 403);
      }

      // Handle media uploads if any
      if (req.files && req.files.length > 0) {
        const uploadResults = await cloudinary.uploadPostMedia(
          req.files,
          postId
        );

        if (uploadResults.failureCount > 0) {
          console.warn(
            'Algunas imágenes no se pudieron subir:',
            uploadResults.failed
          );
        }

        const newMedia = uploadResults.successful.map(result => ({
          url: result.url,
          publicId: result.public_id,
          type: result.resource_type,
          width: result.width,
          height: result.height,
          format: result.format,
        }));

        // Add new media to existing media
        updateData.media = [...(post.media || []), ...newMedia];
      }

      // Update post
      const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
        new: true,
        runValidators: true,
      }).populate('author', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: { post: updatedPost },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete post
  deletePost = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Find post and check ownership
      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      if (post.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar este post', 403);
      }

      // Delete media from Cloudinary if any
      if (post.media && post.media.length > 0) {
        for (const media of post.media) {
          if (media.publicId) {
            await cloudinary.deleteFile(media.publicId, media.type);
          }
        }
      }

      // Delete post
      await Post.findByIdAndDelete(postId);

      res.status(200).json({
        success: true,
        message: 'Post eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Like/unlike post
  toggleLike = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      const isLiked = post.likes.some(like => like._id.toString() === userId);

      if (isLiked) {
        // Unlike
        post.likes = post.likes.filter(like => like._id.toString() !== userId);
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      } else {
        // Like
        post.likes.push(userId);
        post.likeCount = (post.likeCount || 0) + 1;
      }

      await post.save();

      res.status(200).json({
        success: true,
        message: isLiked ? 'Post deslikeado' : 'Post likeado',
        data: {
          isLiked: !isLiked,
          likeCount: post.likeCount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Save/unsave post
  toggleSave = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      // Initialize saves array if it doesn't exist
      if (!post.saves) {
        post.saves = [];
      }

      const isSaved = post.saves.includes(userId);

      if (isSaved) {
        // Unsave
        post.saves = post.saves.filter(save => save.toString() !== userId);
        post.saveCount = Math.max(0, (post.saveCount || 0) - 1);
      } else {
        // Save
        post.saves.push(userId);
        post.saveCount = (post.saveCount || 0) + 1;
      }

      await post.save();

      res.status(200).json({
        success: true,
        message: isSaved ? 'Post removido de guardados' : 'Post guardado',
        data: {
          isSaved: !isSaved,
          saveCount: post.saveCount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Share post
  sharePost = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { platform, message } = req.body;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      // Initialize shares array if it doesn't exist
      if (!post.shares) {
        post.shares = [];
      }

      // Add share
      post.shares.push({
        author: userId,
        platform: platform || 'internal',
        message: message || '',
        sharedAt: new Date(),
      });

      post.shareCount = (post.shareCount || 0) + 1;
      await post.save();

      res.status(200).json({
        success: true,
        message: 'Post compartido exitosamente',
        data: {
          shareCount: post.shareCount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Add comment to post
  addComment = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { content, parentCommentId } = req.body;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      // Initialize comments array if it doesn't exist
      if (!post.comments) {
        post.comments = [];
      }

      const comment = {
        author: userId,
        content,
        parentComment: parentCommentId || null,
        createdAt: new Date(),
      };

      post.comments.push(comment);
      post.commentCount = (post.commentCount || 0) + 1;
      await post.save();

      // Populate comment author
      await post.populate(
        'comments.author',
        'username firstName lastName avatar'
      );

      // Get the newly added comment
      const newComment = post.comments[post.comments.length - 1];

      res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: {
          comment: newComment,
          commentCount: post.commentCount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Update comment
  updateComment = asyncHandler(async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      // Find comment
      const comment = post.comments.id(commentId);
      if (!comment) {
        throw new AppError('Comentario no encontrado', 404);
      }

      // Check ownership
      if (comment.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para editar este comentario',
          403
        );
      }

      // Update comment
      comment.content = content;
      comment.updatedAt = new Date();
      comment.isEdited = true;

      await post.save();

      // Populate comment author
      await post.populate(
        'comments.author',
        'username firstName lastName avatar'
      );

      res.status(200).json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete comment
  deleteComment = asyncHandler(async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      // Find comment
      const comment = post.comments.id(commentId);
      if (!comment) {
        throw new AppError('Comentario no encontrado', 404);
      }

      // Check ownership or admin
      if (comment.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para eliminar este comentario',
          403
        );
      }

      // Remove comment
      post.comments = post.comments.filter(c => c._id.toString() !== commentId);
      post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
      await post.save();

      res.status(200).json({
        success: true,
        message: 'Comentario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user's posts
  getUserPosts = asyncHandler(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { type = 'all', page = 1, limit = 20 } = req.query;

      const query = { author: userId, status: 'active' };

      // Type filter
      if (type && type !== 'all') {
        query.type = type;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find(query)
        .populate('author', 'username firstName lastName avatar')
        .populate('event', 'title category')
        .populate('tribe', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments(query);
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
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user's saved posts
  getSavedPosts = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find({
        saves: userId,
        status: 'active',
      })
        .populate('author', 'username firstName lastName avatar')
        .populate('event', 'title category')
        .populate('tribe', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments({
        saves: userId,
        status: 'active',
      });
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
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get trending posts
  getTrendingPosts = asyncHandler(async (req, res, next) => {
    try {
      const { limit = 10, days = 7 } = req.query;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      const posts = await Post.aggregate([
        {
          $match: {
            status: 'active',
            createdAt: { $gte: dateFrom },
          },
        },
        {
          $addFields: {
            score: {
              $add: [
                { $multiply: ['$views', 0.2] },
                { $multiply: ['$likeCount', 0.4] },
                { $multiply: ['$commentCount', 0.3] },
                { $multiply: ['$shareCount', 0.1] },
              ],
            },
          },
        },
        {
          $sort: { score: -1 },
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $unwind: '$author',
        },
        {
          $project: {
            _id: 1,
            type: 1,
            title: 1,
            content: 1,
            media: 1,
            tags: 1,
            likeCount: 1,
            commentCount: 1,
            shareCount: 1,
            views: 1,
            score: 1,
            createdAt: 1,
            'author.username': 1,
            'author.firstName': 1,
            'author.lastName': 1,
            'author.avatar': 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: { posts },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get posts by event
  getEventPosts = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find({
        event: eventId,
        status: 'active',
      })
        .populate('author', 'username firstName lastName avatar')
        .populate('event', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments({
        event: eventId,
        status: 'active',
      });
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
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get posts by tribe
  getTribePosts = asyncHandler(async (req, res, next) => {
    try {
      const { tribeId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find({
        tribe: tribeId,
        status: 'active',
      })
        .populate('author', 'username firstName lastName avatar')
        .populate('tribe', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments({
        tribe: tribeId,
        status: 'active',
      });
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
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Search posts
  searchPosts = asyncHandler(async (req, res, next) => {
    try {
      const {
        query,
        type,
        category,
        author,
        event,
        tribe,
        tags,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'relevance',
      } = req.body;

      // Build search query
      const searchQuery = { status: 'active' };

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Apply other filters
      if (type) searchQuery.type = type;
      if (category) searchQuery.category = category;
      if (author) searchQuery.author = author;
      if (event) searchQuery.event = event;
      if (tribe) searchQuery.tribe = tribe;
      if (tags && tags.length > 0) {
        searchQuery.tags = { $in: tags };
      }
      if (dateFrom || dateTo) {
        searchQuery.createdAt = {};
        if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
      }

      // Build sort
      let sort = {};
      switch (sortBy) {
        case 'date':
          sort = { createdAt: -1 };
          break;
        case 'likes':
          sort = { likeCount: -1 };
          break;
        case 'comments':
          sort = { commentCount: -1 };
          break;
        case 'views':
          sort = { views: -1 };
          break;
        case 'relevance':
        default:
          if (query) {
            sort = { score: { $meta: 'textScore' } };
          } else {
            sort = { createdAt: -1 };
          }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find(searchQuery)
        .populate('author', 'username firstName lastName avatar')
        .populate('event', 'title category')
        .populate('tribe', 'name category')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments(searchQuery);
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
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Upload post media
  uploadPostMedia = asyncHandler(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const { files } = req;

      if (!files || files.length === 0) {
        throw new AppError('No se proporcionaron archivos', 400);
      }

      // Check post ownership
      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      if (post.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para subir medios a este post',
          403
        );
      }

      // Upload media to Cloudinary
      const uploadResults = await cloudinary.uploadPostMedia(files, postId);

      if (uploadResults.failureCount > 0) {
        console.warn(
          'Algunos archivos no se pudieron subir:',
          uploadResults.failed
        );
      }

      // Update post with new media
      const newMedia = uploadResults.successful.map(result => ({
        url: result.url,
        publicId: result.public_id,
        type: result.resource_type,
        width: result.width,
        height: result.height,
        format: result.format,
      }));

      post.media = [...(post.media || []), ...newMedia];
      await post.save();

      res.status(200).json({
        success: true,
        message: 'Medios subidos exitosamente',
        data: {
          uploadedMedia: newMedia,
          totalMedia: post.media.length,
          uploadResults,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete post media
  deletePostMedia = asyncHandler(async (req, res, next) => {
    try {
      const { postId, mediaId } = req.params;
      const userId = req.user.id;

      // Check post ownership
      const post = await Post.findById(postId);
      if (!post) {
        throw new AppError('Post no encontrado', 404);
      }

      if (post.author.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para eliminar medios de este post',
          403
        );
      }

      // Find media
      const media = post.media.id(mediaId);
      if (!media) {
        throw new AppError('Medio no encontrado', 404);
      }

      // Delete from Cloudinary
      if (media.publicId) {
        await cloudinary.deleteFile(media.publicId, media.type);
      }

      // Remove from post
      post.media = post.media.filter(m => m._id.toString() !== mediaId);
      await post.save();

      res.status(200).json({
        success: true,
        message: 'Medio eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = new PostController();

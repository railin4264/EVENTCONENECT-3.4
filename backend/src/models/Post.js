const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor del post es requerido'],
    },
    type: {
      type: String,
      enum: [
        'text',
        'image',
        'video',
        'link',
        'event',
        'tribe',
        'poll',
        'article',
      ],
      default: 'text',
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'El contenido del post es requerido'],
      maxlength: [10000, 'El contenido no puede exceder 10000 caracteres'],
    },
    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'audio', 'document'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        alt: String,
        caption: String,
        thumbnail: String,
        duration: Number, // for video/audio
        size: Number,
        mimeType: String,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, 'Cada tag no puede exceder 30 caracteres'],
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hashtags: [
      {
        type: String,
        trim: true,
        maxlength: [30, 'Cada hashtag no puede exceder 30 caracteres'],
      },
    ],
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    relatedTribe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe',
    },
    poll: {
      question: {
        type: String,
        required: true,
        maxlength: [
          200,
          'La pregunta de la encuesta no puede exceder 200 caracteres',
        ],
      },
      options: [
        {
          text: {
            type: String,
            required: true,
            maxlength: [100, 'Cada opción no puede exceder 100 caracteres'],
          },
          votes: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
              },
              votedAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
        },
      ],
      isMultipleChoice: { type: Boolean, default: false },
      endsAt: Date,
      isActive: { type: Boolean, default: true },
    },
    link: {
      url: String,
      title: String,
      description: String,
      image: String,
      domain: String,
    },
    social: {
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      shares: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          platform: String,
          sharedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      saves: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          savedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      views: {
        type: Number,
        default: 0,
      },
    },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [2000, 'El comentario no puede exceder 2000 caracteres'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: Date,
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        replies: [
          {
            author: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            content: {
              type: String,
              required: true,
              maxlength: [
                1000,
                'La respuesta no puede exceder 1000 caracteres',
              ],
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
            likes: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
              },
            ],
          },
        ],
        isEdited: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'friends', 'tribe_only', 'private'],
      default: 'public',
    },
    audience: {
      tribes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tribe',
        },
      ],
      specificUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      excludeUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived', 'deleted', 'moderated'],
      default: 'published',
    },
    moderation: {
      isApproved: { type: Boolean, default: true },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      rejectionReason: String,
      moderatedAt: Date,
      moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    analytics: {
      reach: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 },
    },
    scheduledFor: Date,
    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ type: 1 });
postSchema.index({ status: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ location: '2dsphere' });
postSchema.index({ 'social.likes': 1 });
postSchema.index({ 'social.saves': 1 });
postSchema.index({ relatedEvent: 1 });
postSchema.index({ relatedTribe: 1 });

// Virtuals
postSchema.virtual('likesCount').get(function () {
  return this.social.likes.length;
});

postSchema.virtual('sharesCount').get(function () {
  return this.social.shares.length;
});

postSchema.virtual('savesCount').get(function () {
  return this.social.saves.length;
});

postSchema.virtual('commentsCount').get(function () {
  return this.comments.filter(c => !c.isDeleted).length;
});

postSchema.virtual('totalReplies').get(function () {
  return this.comments.reduce((total, comment) => {
    return total + comment.replies.length;
  }, 0);
});

postSchema.virtual('isLiked').get(function () {
  return userId =>
    this.social.likes.some(like => like.user.toString() === userId.toString());
});

postSchema.virtual('isSaved').get(function () {
  return userId =>
    this.social.saves.some(save => save.user.toString() === userId.toString());
});

postSchema.virtual('isPollActive').get(function () {
  if (!this.poll) return false;
  return (
    this.poll.isActive && (!this.poll.endsAt || this.poll.endsAt > new Date())
  );
});

postSchema.virtual('pollTotalVotes').get(function () {
  if (!this.poll) return 0;
  return this.poll.options.reduce(
    (total, option) => total + option.votes.length,
    0
  );
});

// Methods
postSchema.methods.toggleLike = function (userId) {
  const likeIndex = this.social.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    this.social.likes.splice(likeIndex, 1);
  } else {
    this.social.likes.push({ user: userId });
  }

  return this.save();
};

postSchema.methods.toggleSave = function (userId) {
  const saveIndex = this.social.saves.findIndex(
    save => save.user.toString() === userId.toString()
  );

  if (saveIndex > -1) {
    this.social.saves.splice(saveIndex, 1);
  } else {
    this.social.saves.push({ user: userId });
  }

  return this.save();
};

postSchema.methods.addComment = function (authorId, content) {
  this.comments.push({
    author: authorId,
    content,
  });

  return this.save();
};

postSchema.methods.updateComment = function (commentId, content, userId) {
  const comment = this.comments.id(commentId);
  if (comment && comment.author.toString() === userId.toString()) {
    comment.content = content;
    comment.updatedAt = new Date();
    comment.isEdited = true;
  }
  return this.save();
};

postSchema.methods.deleteComment = function (commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && comment.author.toString() === userId.toString()) {
    comment.isDeleted = true;
  }
  return this.save();
};

postSchema.methods.toggleCommentLike = function (commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    const likeIndex = comment.likes.findIndex(
      like => like.toString() === userId.toString()
    );
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }
  }
  return this.save();
};

postSchema.methods.addReply = function (commentId, authorId, content) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.replies.push({
      author: authorId,
      content,
    });
  }
  return this.save();
};

postSchema.methods.toggleReplyLike = function (commentId, replyIndex, userId) {
  const comment = this.comments.id(commentId);
  if (comment && comment.replies[replyIndex]) {
    const reply = comment.replies[replyIndex];
    const likeIndex = reply.likes.findIndex(
      like => like.toString() === userId.toString()
    );
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(userId);
    }
  }
  return this.save();
};

postSchema.methods.voteInPoll = function (optionIndex, userId) {
  if (!this.poll || !this.isPollActive) {
    throw new Error('La encuesta no está activa');
  }

  const option = this.poll.options[optionIndex];
  if (!option) {
    throw new Error('Opción de encuesta inválida');
  }

  // Remove previous votes if not multiple choice
  if (!this.poll.isMultipleChoice) {
    this.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(
        vote => vote.user.toString() !== userId.toString()
      );
    });
  }

  // Check if user already voted for this option
  const existingVote = option.votes.find(
    vote => vote.user.toString() === userId.toString()
  );
  if (!existingVote) {
    option.votes.push({ user: userId });
  }

  return this.save();
};

postSchema.methods.addShare = function (userId, platform) {
  this.social.shares.push({
    user: userId,
    platform,
    sharedAt: new Date(),
  });

  return this.save();
};

postSchema.methods.incrementViews = function () {
  this.social.views += 1;
  return this.save();
};

// Static methods
postSchema.statics.findByAuthor = function (authorId, limit = 20) {
  return this.find({
    author: authorId,
    status: 'published',
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

postSchema.statics.findByType = function (type, limit = 20) {
  return this.find({
    type,
    status: 'published',
    visibility: 'public',
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

postSchema.statics.findByTags = function (tags, limit = 20) {
  return this.find({
    tags: { $in: tags },
    status: 'published',
    visibility: 'public',
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

postSchema.statics.findByHashtags = function (hashtags, limit = 20) {
  return this.find({
    hashtags: { $in: hashtags },
    status: 'published',
    visibility: 'public',
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

postSchema.statics.findTrending = function (limit = 20) {
  return this.find({
    status: 'published',
    visibility: 'public',
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ 'social.likes': -1, 'social.shares': -1, 'social.views': -1 })
    .limit(limit);
};

postSchema.statics.findNearby = function (
  coordinates,
  maxDistance = 10000,
  limit = 20
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'published',
    visibility: 'public',
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware
postSchema.pre('save', function (next) {
  // Set publishedAt if not set and status is published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Extract hashtags from content
  if (this.content) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    this.hashtags = [...new Set(this.content.match(hashtagRegex) || [])];
  }

  // Extract mentions from content
  if (this.content) {
    const mentionRegex = /@[\w\u0590-\u05ff]+/g;
    const mentions = this.content.match(mentionRegex) || [];
    // Note: This would need to be resolved to actual user IDs in the controller
  }

  next();
});

module.exports = mongoose.model('Post', postSchema);

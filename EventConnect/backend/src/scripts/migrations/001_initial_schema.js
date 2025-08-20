const mongoose = require('mongoose');

const { database } = require('../../config');

/**
 * Initial database migration
 * Creates all necessary collections and indexes
 */
class InitialMigration {
  /**
   *
   */
  constructor() {
    this.migrationName = '001_initial_schema';
    this.description =
      'Create initial database schema with all collections and indexes';
  }

  /**
   * Run the migration
   */
  async up() {
    try {
      console.log(`🚀 Running migration: ${this.migrationName}`);
      console.log(`📝 Description: ${this.description}`);

      const { db } = mongoose.connection;

      // Create collections if they don't exist
      await this.createCollections(db);

      // Create indexes for better performance
      await this.createIndexes();

      // Create initial admin user if it doesn't exist
      await this.createInitialAdmin();

      console.log('✅ Migration completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback the migration
   */
  async down() {
    try {
      console.log(`🔄 Rolling back migration: ${this.migrationName}`);

      const { db } = mongoose.connection;

      // Drop all collections
      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        await db.dropCollection(collection.name);
        console.log(`🗑️  Dropped collection: ${collection.name}`);
      }

      console.log('✅ Rollback completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Create all necessary collections
   * @param db
   */
  async createCollections(db) {
    console.log('📚 Creating collections...');

    const collections = [
      'users',
      'events',
      'tribes',
      'posts',
      'chats',
      'notifications',
      'reviews',
    ];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          // Collection already exists
          console.log(`⚠️  Collection already exists: ${collectionName}`);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Create database indexes for better performance
   */
  async createIndexes() {
    console.log('🔍 Creating indexes...');

    // User indexes
    await this.createUserIndexes();

    // Event indexes
    await this.createEventIndexes();

    // Tribe indexes
    await this.createTribeIndexes();

    // Post indexes
    await this.createPostIndexes();

    // Chat indexes
    await this.createChatIndexes();

    // Notification indexes
    await this.createNotificationIndexes();

    // Review indexes
    await this.createReviewIndexes();

    console.log('✅ All indexes created successfully');
  }

  /**
   * Create user collection indexes
   */
  async createUserIndexes() {
    const User = mongoose.model('User');

    try {
      // Unique indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ username: 1 }, { unique: true });

      // Search indexes
      await User.collection.createIndex({ firstName: 1, lastName: 1 });
      await User.collection.createIndex({ interests: 1 });
      await User.collection.createIndex({ location: '2dsphere' });
      await User.collection.createIndex({ rating: -1 });
      await User.collection.createIndex({ isVerified: 1 });
      await User.collection.createIndex({ isAdmin: 1 });
      await User.collection.createIndex({ createdAt: -1 });

      console.log('✅ User indexes created');
    } catch (error) {
      console.error('❌ Error creating user indexes:', error);
    }
  }

  /**
   * Create event collection indexes
   */
  async createEventIndexes() {
    const Event = mongoose.model('Event');

    try {
      // Search indexes
      await Event.collection.createIndex({
        title: 'text',
        description: 'text',
        tags: 'text',
      });
      await Event.collection.createIndex({ category: 1 });
      await Event.collection.createIndex({ subcategory: 1 });
      await Event.collection.createIndex({ startDate: 1 });
      await Event.collection.createIndex({ endDate: 1 });
      await Event.collection.createIndex({ location: '2dsphere' });
      await Event.collection.createIndex({ host: 1 });
      await Event.collection.createIndex({ status: 1 });
      await Event.collection.createIndex({ isPrivate: 1 });
      await Event.collection.createIndex({ attendeeCount: -1 });
      await Event.collection.createIndex({ likeCount: -1 });
      await Event.collection.createIndex({ createdAt: -1 });

      // Compound indexes
      await Event.collection.createIndex({ category: 1, startDate: 1 });
      await Event.collection.createIndex({ host: 1, startDate: 1 });
      await Event.collection.createIndex({ status: 1, startDate: 1 });

      console.log('✅ Event indexes created');
    } catch (error) {
      console.error('❌ Error creating event indexes:', error);
    }
  }

  /**
   * Create tribe collection indexes
   */
  async createTribeIndexes() {
    const Tribe = mongoose.model('Tribe');

    try {
      // Search indexes
      await Tribe.collection.createIndex({
        name: 'text',
        description: 'text',
        tags: 'text',
      });
      await Tribe.collection.createIndex({ category: 1 });
      await Tribe.collection.createIndex({ creator: 1 });
      await Tribe.collection.createIndex({ location: '2dsphere' });
      await Tribe.collection.createIndex({ isPrivate: 1 });
      await Tribe.collection.createIndex({ memberCount: -1 });
      await Tribe.collection.createIndex({ likeCount: -1 });
      await Tribe.collection.createIndex({ createdAt: -1 });

      // Compound indexes
      await Tribe.collection.createIndex({ category: 1, memberCount: -1 });
      await Tribe.collection.createIndex({ creator: 1, createdAt: -1 });

      console.log('✅ Tribe indexes created');
    } catch (error) {
      console.error('❌ Error creating tribe indexes:', error);
    }
  }

  /**
   * Create post collection indexes
   */
  async createPostIndexes() {
    const Post = mongoose.model('Post');

    try {
      // Search indexes
      await Post.collection.createIndex({ content: 'text', tags: 'text' });
      await Post.collection.createIndex({ author: 1 });
      await Post.collection.createIndex({ type: 1 });
      await Post.collection.createIndex({ event: 1 });
      await Post.collection.createIndex({ tribe: 1 });
      await Post.collection.createIndex({ status: 1 });
      await Post.collection.createIndex({ likeCount: -1 });
      await Post.collection.createIndex({ commentCount: -1 });
      await Post.collection.createIndex({ createdAt: -1 });

      // Compound indexes
      await Post.collection.createIndex({ author: 1, createdAt: -1 });
      await Post.collection.createIndex({ event: 1, createdAt: -1 });
      await Post.collection.createIndex({ tribe: 1, createdAt: -1 });

      console.log('✅ Post indexes created');
    } catch (error) {
      console.error('❌ Error creating post indexes:', error);
    }
  }

  /**
   * Create chat collection indexes
   */
  async createChatIndexes() {
    const Chat = mongoose.model('Chat');

    try {
      // Search indexes
      await Chat.collection.createIndex({ type: 1 });
      await Chat.collection.createIndex({ participants: 1 });
      await Chat.collection.createIndex({ creator: 1 });
      await Chat.collection.createIndex({ event: 1 });
      await Chat.collection.createIndex({ tribe: 1 });
      await Chat.collection.createIndex({ lastMessage: -1 });
      await Chat.collection.createIndex({ createdAt: -1 });

      // Compound indexes
      await Chat.collection.createIndex({ participants: 1, type: 1 });
      await Chat.collection.createIndex({ event: 1, type: 1 });
      await Chat.collection.createIndex({ tribe: 1, type: 1 });

      console.log('✅ Chat indexes created');
    } catch (error) {
      console.error('❌ Error creating chat indexes:', error);
    }
  }

  /**
   * Create notification collection indexes
   */
  async createNotificationIndexes() {
    const Notification = mongoose.model('Notification');

    try {
      // Search indexes
      await Notification.collection.createIndex({ recipient: 1 });
      await Notification.collection.createIndex({ type: 1 });
      await Notification.collection.createIndex({ status: 1 });
      await Notification.collection.createIndex({ priority: 1 });
      await Notification.collection.createIndex({ readAt: 1 });
      await Notification.collection.createIndex({ createdAt: -1 });

      // Compound indexes
      await Notification.collection.createIndex({ recipient: 1, status: 1 });
      await Notification.collection.createIndex({ recipient: 1, type: 1 });
      await Notification.collection.createIndex({
        recipient: 1,
        createdAt: -1,
      });

      console.log('✅ Notification indexes created');
    } catch (error) {
      console.error('❌ Error creating notification indexes:', error);
    }
  }

  /**
   * Create review collection indexes
   */
  async createReviewIndexes() {
    const Review = mongoose.model('Review');

    try {
      // Search indexes
      await Review.collection.createIndex({ reviewer: 1 });
      await Review.collection.createIndex({ event: 1 });
      await Review.collection.createIndex({ host: 1 });
      await Review.collection.createIndex({ rating: 1 });
      await Review.collection.createIndex({ status: 1 });
      await Review.collection.createIndex({ isVerified: 1 });
      await Review.collection.createIndex({ createdAt: -1 });

      // Compound indexes
      await Review.collection.createIndex({ host: 1, rating: -1 });
      await Review.collection.createIndex({ event: 1, rating: -1 });
      await Review.collection.createIndex({ reviewer: 1, createdAt: -1 });

      console.log('✅ Review indexes created');
    } catch (error) {
      console.error('❌ Error creating review indexes:', error);
    }
  }

  /**
   * Create initial admin user
   */
  async createInitialAdmin() {
    try {
      const User = mongoose.model('User');

      // Check if admin user already exists
      const existingAdmin = await User.findOne({
        email: 'admin@eventconnect.com',
      });
      if (existingAdmin) {
        console.log('⚠️  Admin user already exists, skipping creation');
        return;
      }

      // Create admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const adminUser = new User({
        username: 'admin',
        email: 'admin@eventconnect.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        bio: 'System administrator for EventConnect',
        isAdmin: true,
        isVerified: true,
        rating: 5.0,
        interests: ['technology', 'business', 'networking'],
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128], // New York
          address: 'New York, NY, USA',
          city: 'New York',
          state: 'NY',
          country: 'USA',
        },
        notificationPreferences: {
          event_invitation: true,
          tribe_invitation: true,
          friend_request: true,
          post_mention: true,
          event_reminder: true,
          event_update: true,
          tribe_update: true,
          system_announcement: true,
          push: true,
          email: true,
          sms: false,
        },
      });

      await adminUser.save();
      console.log('✅ Initial admin user created');
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    try {
      const { db } = mongoose.connection;
      const collections = await db.listCollections().toArray();

      return {
        name: this.migrationName,
        description: this.description,
        status: 'completed',
        collections: collections.map(c => c.name),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: this.migrationName,
        description: this.description,
        status: 'error',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}

module.exports = InitialMigration;

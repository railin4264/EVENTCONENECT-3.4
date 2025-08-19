const mongoose = require('mongoose');
const { database, redis } = require('../config');
const { UserSeeder, EventSeeder } = require('./seeders');
const { InitialMigration } = require('./migrations');

/**
 * Database management script
 * Handles migrations, seeding, and database operations
 */
class DatabaseManager {
  constructor() {
    this.isConnected = false;
  }

  /**
   * Connect to database
   */
  async connect() {
    try {
      if (this.isConnected) {
        console.log('✅ Already connected to database');
        return;
      }

      console.log('🔌 Connecting to database...');
      await database.connectDB();
      this.isConnected = true;
      console.log('✅ Database connected successfully');

      // Connect to Redis
      console.log('🔌 Connecting to Redis...');
      await redis.connect();
      console.log('✅ Redis connected successfully');

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    try {
      if (!this.isConnected) {
        console.log('⚠️  Not connected to database');
        return;
      }

      console.log('🔌 Disconnecting from database...');
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');

      // Disconnect from Redis
      console.log('🔌 Disconnecting from Redis...');
      await redis.disconnect();
      console.log('✅ Redis disconnected successfully');

    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Run all migrations
   */
  async runMigrations() {
    try {
      console.log('🚀 Running database migrations...');

      const migrations = [
        new InitialMigration()
      ];

      for (const migration of migrations) {
        console.log(`\n📋 Running migration: ${migration.migrationName}`);
        await migration.up();
      }

      console.log('\n✅ All migrations completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback migrations
   */
  async rollbackMigrations() {
    try {
      console.log('🔄 Rolling back database migrations...');

      const migrations = [
        new InitialMigration()
      ];

      for (const migration of migrations.reverse()) {
        console.log(`\n📋 Rolling back migration: ${migration.migrationName}`);
        await migration.down();
      }

      console.log('\n✅ All migrations rolled back successfully');
      return true;

    } catch (error) {
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
  }

  /**
   * Seed database with sample data
   */
  async seedDatabase() {
    try {
      console.log('🌱 Seeding database with sample data...');

      // Seed users first
      console.log('\n👥 Seeding users...');
      const users = await UserSeeder.seed();

      // Seed events
      console.log('\n🎉 Seeding events...');
      const events = await EventSeeder.seed();

      console.log('\n✅ Database seeding completed successfully');
      return {
        users: users.length,
        events: events.length
      };

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Clear all data from database
   */
  async clearDatabase() {
    try {
      console.log('🗑️  Clearing database...');

      // Clear events first (due to dependencies)
      await EventSeeder.clear();

      // Clear users
      await UserSeeder.clear();

      console.log('✅ Database cleared successfully');
      return true;

    } catch (error) {
      console.error('❌ Database clearing failed:', error);
      throw error;
    }
  }

  /**
   * Reset database (clear + seed)
   */
  async resetDatabase() {
    try {
      console.log('🔄 Resetting database...');

      await this.clearDatabase();
      await this.seedDatabase();

      console.log('✅ Database reset completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Get database status
   */
  async getStatus() {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      const stats = {
        connection: this.isConnected ? 'connected' : 'disconnected',
        database: mongoose.connection.name,
        collections: collections.length,
        collectionsList: collections.map(c => c.name),
        timestamp: new Date()
      };

      // Get collection counts
      for (const collection of collections) {
        try {
          const count = await db.collection(collection.name).countDocuments();
          stats[`${collection.name}Count`] = count;
        } catch (error) {
          stats[`${collection.name}Count`] = 'error';
        }
      }

      return stats;

    } catch (error) {
      return {
        connection: this.isConnected ? 'connected' : 'disconnected',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check database health
   */
  async checkHealth() {
    try {
      console.log('🏥 Checking database health...');

      // Check MongoDB connection
      const mongoStatus = await database.checkDBHealth();
      console.log('✅ MongoDB health check passed');

      // Check Redis connection
      const redisStatus = await redis.healthCheck();
      console.log('✅ Redis health check passed');

      // Check collections
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`✅ Found ${collections.length} collections`);

      const healthReport = {
        status: 'healthy',
        mongo: mongoStatus,
        redis: redisStatus,
        collections: collections.length,
        timestamp: new Date()
      };

      console.log('✅ Database health check completed');
      return healthReport;

    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Create database backup
   */
  async createBackup(backupPath = './backup') {
    try {
      console.log('💾 Creating database backup...');
      
      const result = await database.backupDatabase(backupPath);
      console.log('✅ Database backup created successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupFile) {
    try {
      console.log('📥 Restoring database from backup...');
      
      const result = await database.restoreDatabase(backupFile);
      console.log('✅ Database restored successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Database restore failed:', error);
      throw error;
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🚀 EventConnect Database Manager

Available commands:
  migrate          - Run all database migrations
  rollback         - Rollback all migrations
  seed             - Seed database with sample data
  clear            - Clear all data from database
  reset            - Reset database (clear + seed)
  status           - Show database status
  health           - Check database health
  backup           - Create database backup
  restore <file>   - Restore database from backup
  help             - Show this help message

Examples:
  node src/scripts/database.js migrate
  node src/scripts/database.js seed
  node src/scripts/database.js reset
  node src/scripts/database.js status
    `);
  }
}

// Main execution
async function main() {
  const manager = new DatabaseManager();
  const command = process.argv[2];

  try {
    if (!command || command === 'help') {
      manager.showHelp();
      return;
    }

    await manager.connect();

    switch (command) {
      case 'migrate':
        await manager.runMigrations();
        break;
      case 'rollback':
        await manager.rollbackMigrations();
        break;
      case 'seed':
        await manager.seedDatabase();
        break;
      case 'clear':
        await manager.clearDatabase();
        break;
      case 'reset':
        await manager.resetDatabase();
        break;
      case 'status':
        const status = await manager.getStatus();
        console.log('📊 Database Status:', JSON.stringify(status, null, 2));
        break;
      case 'health':
        const health = await manager.checkHealth();
        console.log('🏥 Health Report:', JSON.stringify(health, null, 2));
        break;
      case 'backup':
        await manager.createBackup();
        break;
      case 'restore':
        const backupFile = process.argv[3];
        if (!backupFile) {
          console.error('❌ Please specify backup file path');
          return;
        }
        await manager.restoreBackup(backupFile);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        manager.showHelp();
        break;
    }

  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  } finally {
    await manager.disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseManager;
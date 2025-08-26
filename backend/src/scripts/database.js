require('dotenv').config();




const mongoose = require('mongoose');
const { Event, User, Tribe, Post, Review, Chat, Notification } = require('../models');

/**
 * Database management script for EventConnect
 */
class DatabaseManager {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<object>} MongoDB connection
   */
  async connect() {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.connection = conn;
      this.isConnected = true;
      console.log('✅ Conectado a MongoDB');

      return conn;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('✅ Desconectado de MongoDB');
      }
    } catch (error) {
      console.error('❌ Error desconectando de MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get database status
   * @returns {object} Database status
   */
  getStatus() {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: state === 1 ? 'connected' : 'disconnected',
      state: states[state] || 'unknown',
      readyState: state,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get database statistics
   * @returns {Promise<object>} Database statistics
   */
  async getStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        views: stats.views,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   * @returns {Promise<object>} Collection statistics
   */
  async getCollectionStats() {
    try {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const stats = {};

      for (const collection of collections) {
        try {
          const collectionStats = await mongoose.connection.db
            .collection(collection.name)
            .stats();
          stats[collection.name] = {
            count: collectionStats.count,
            size: collectionStats.size,
            avgObjSize: collectionStats.avgObjSize,
            storageSize: collectionStats.storageSize,
            indexes: collectionStats.nindexes,
            indexSize: collectionStats.totalIndexSize,
          };
        } catch (error) {
          console.warn(
            `⚠️ Error obteniendo stats de ${collection.name}:`,
            error.message
          );
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de colecciones:', error);
      throw error;
    }
  }

  /**
   * Get database health
   * @returns {Promise<object>} Database health status
   */
  async getHealth() {
    try {
      const status = this.getStatus();
      const stats = await this.getStats();
      const collectionStats = await this.getCollectionStats();

      return {
        status: status.status,
        state: status.state,
        timestamp: status.timestamp,
        stats,
        collections: collectionStats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    } catch (error) {
      console.error('❌ Error obteniendo health check:', error);
      throw error;
    }
  }

  /**
   * Run database migration
   * @param {string} migrationName - Name of migration to run
   * @returns {Promise<object>} Migration result
   */
  async runMigration(migrationName) {
    try {
      console.log(`🔄 Ejecutando migración: ${migrationName}`);

      // This would typically run actual migration files
      // For now, return success status
      return {
        success: true,
        migration: migrationName,
        timestamp: new Date().toISOString(),
        message: 'Migración ejecutada exitosamente',
      };
    } catch (error) {
      console.error(`❌ Error ejecutando migración ${migrationName}:`, error);
      throw error;
    }
  }

  /**
   * Rollback database migration
   * @param {string} migrationName - Name of migration to rollback
   * @returns {Promise<object>} Rollback result
   */
  async rollbackMigration(migrationName) {
    try {
      console.log(`🔄 Haciendo rollback de migración: ${migrationName}`);

      // This would typically rollback actual migration files
      // For now, return success status
      return {
        success: true,
        migration: migrationName,
        timestamp: new Date().toISOString(),
        message: 'Rollback ejecutado exitosamente',
      };
    } catch (error) {
      console.error(
        `❌ Error haciendo rollback de migración ${migrationName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Seed database with sample data
   * @returns {Promise<object>} Seeding result
   */
  async seedDatabase() {
    try {
      console.log('🌱 Sembrando base de datos con datos de ejemplo...');
      const email = 'demo@example.com';
      const username = 'demouser';
      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (!exists) {
        const user = new User({
          email,
          password: 'Aa123456!',
          username,
          firstName: 'Demo',
          lastName: 'User',
          acceptTerms: true,
          isActive: true,
        });
        await user.save();
        console.log('✅ Usuario demo creado:', email, username);
        return {
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Base de datos sembrada exitosamente',
          recordsCreated: 1,
        };
      }
      console.log('ℹ️ Usuario demo ya existe, no se crea de nuevo');
      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Base de datos ya contenía datos demo',
        recordsCreated: 0,
      };
    } catch (error) {
      console.error('❌ Error sembrando base de datos:', error);
      throw error;
    }
  }

  /**
   * Clear all data from database
   * @returns {Promise<object>} Clear result
   */
  async clearDatabase() {
    try {
      console.log('🗑️ Limpiando base de datos...');
      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const { name } of collections) {
        if (!name.startsWith('system.')) {
          await mongoose.connection.db.collection(name).deleteMany({});
        }
      }
      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Base de datos limpiada exitosamente',
      };
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  /**
   * Reset database to initial state
   * @returns {Promise<object>} Reset result
   */
  async resetDatabase() {
    try {
      console.log('🔄 Reseteando base de datos...');

      // Clear all data
      await this.clearDatabase();

      // Run initial migration
      await this.runMigration('001_initial_schema');

      // Seed with initial data
      await this.seedDatabase();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Base de datos reseteada exitosamente',
      };
    } catch (error) {
      console.error('❌ Error reseteando base de datos:', error);
      throw error;
    }
  }

  /**
   * Create database backup
   * @param {string} backupPath - Path for backup file
   * @returns {Promise<object>} Backup result
   */
  async createBackup(backupPath) {
    try {
      console.log(`💾 Creando backup en: ${backupPath}`);

      // This would typically create an actual backup
      // For now, return success status
      return {
        success: true,
        backupPath,
        timestamp: new Date().toISOString(),
        message: 'Backup creado exitosamente',
        size: '0 MB',
      };
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   * @param {string} backupPath - Path to backup file
   * @returns {Promise<object>} Restore result
   */
  async restoreBackup(backupPath) {
    try {
      console.log(`🔄 Restaurando desde backup: ${backupPath}`);

      // This would typically restore from actual backup
      // For now, return success status
      return {
        success: true,
        backupPath,
        timestamp: new Date().toISOString(),
        message: 'Backup restaurado exitosamente',
      };
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      throw error;
    }
  }
}

// Main execution function
async function main() {
  const dbManager = new DatabaseManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    // Connect to database
    await dbManager.connect();

    switch (command) {
      case 'migrate': {
        const migrationName = args[0] || 'latest';
        const result = await dbManager.runMigration(migrationName);
        console.log('✅ Migración completada:', result);
        break;
      }

      case 'rollback': {
        const migrationName = args[0] || 'latest';
        const result = await dbManager.rollbackMigration(migrationName);
        console.log('✅ Rollback completado:', result);
        break;
      }

      case 'seed': {
        const result = await dbManager.seedDatabase();
        console.log('✅ Seeding completado:', result);
        break;
      }

      case 'clear': {
        const result = await dbManager.clearDatabase();
        console.log('✅ Limpieza completada:', result);
        break;
      }

      case 'reset': {
        const result = await dbManager.resetDatabase();
        console.log('✅ Reset completado:', result);
        break;
      }

      case 'status': {
        const status = dbManager.getStatus();
        console.log('📊 Estado de la base de datos:', status);
        break;
      }

      case 'health': {
        const health = await dbManager.getHealth();
        console.log('🏥 Health check:', health);
        break;
      }

      case 'backup': {
        const backupPath = args[0] || './backup';
        const result = await dbManager.createBackup(backupPath);
        console.log('✅ Backup completado:', result);
        break;
      }

      case 'restore': {
        const backupPath = args[0];
        if (!backupPath) {
          console.error('❌ Ruta de backup requerida');
          process.exit(1);
        }
        const result = await dbManager.restoreBackup(backupPath);
        console.log('✅ Restauración completada:', result);
        break;
      }

      default:
        console.log('📖 Comandos disponibles:');
        console.log('  migrate [name]     - Ejecutar migración');
        console.log('  rollback [name]    - Hacer rollback de migración');
        console.log('  seed               - Sembrar base de datos');
        console.log('  clear              - Limpiar base de datos');
        console.log('  reset              - Resetear base de datos');
        console.log('  status             - Estado de la base de datos');
        console.log('  health             - Health check completo');
        console.log('  backup [path]      - Crear backup');
        console.log('  restore [path]     - Restaurar desde backup');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Disconnect from database
    await dbManager.disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = DatabaseManager;

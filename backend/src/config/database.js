const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000, // Reduced timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', err => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    mongoose.connection.on('close', () => {
      console.log('🔒 Conexión a MongoDB cerrada');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB conexión cerrada por terminación de la app');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al cerrar conexión de MongoDB:', error);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB conexión cerrada por terminación de la app');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al cerrar conexión de MongoDB:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (err) {
    console.warn(
      `⚠️ Error al conectar a MongoDB: ${err.message}. Continuando sin conexión a MongoDB`
    );
    return null;
  }
};

// Health check function
const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state] || 'unknown',
      readyState: state,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Get database stats
const getDBStats = async () => {
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
      totalSize: stats.totalSize,
      scaleFactor: stats.scaleFactor,
      fsUsedSize: stats.fsUsedSize,
      fsTotalSize: stats.fsTotalSize,
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return null;
  }
};

// Create indexes for all models
const createIndexes = async () => {
  try {
    console.log('🔍 Creando índices de base de datos...');

    // Import models
    const {
      User,
      Event,
      Tribe,
      Post,
      Chat,
      Notification,
      Review,
    } = require('../models');

    // Create indexes for each model
    await Promise.all([
      User.createIndexes(),
      Event.createIndexes(),
      Tribe.createIndexes(),
      Post.createIndexes(),
      Chat.createIndexes(),
      Notification.createIndexes(),
      Review.createIndexes(),
    ]);

    console.log('✅ Índices de base de datos creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando índices:', error);
  }
};

// Drop all collections (for testing/development)
const dropAllCollections = async () => {
  try {
    console.log('🗑️ Eliminando todas las colecciones...');

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`✅ Colección ${collection.name} eliminada`);
    }

    console.log('✅ Todas las colecciones eliminadas');
  } catch (error) {
    console.error('❌ Error eliminando colecciones:', error);
  }
};

// Seed database with initial data
const seedDatabase = async () => {
  try {
    console.log('🌱 Sembrando base de datos con datos iniciales...');

    // Check if data already exists
    const { User } = require('../models');
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log('⚠️ Base de datos ya contiene datos, omitiendo siembra');
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@eventconnect.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    await adminUser.save();
    console.log('✅ Usuario administrador creado');

    // Add more seed data as needed

    console.log('✅ Base de datos sembrada exitosamente');
  } catch (error) {
    console.error('❌ Error sembrando base de datos:', error);
  }
};

// Backup database
const backupDatabase = async (backupPath = './backup') => {
  try {
    console.log('💾 Creando respaldo de base de datos...');

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${backupPath}/backup-${timestamp}.gz`;

    // Create backup directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Extract database name from connection string
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];

    // Create backup command
    const backupCommand = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupFile}" --gzip`;

    await execAsync(backupCommand);

    console.log(`✅ Respaldo creado: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Error creando respaldo:', error);
    throw error;
  }
};

// Restore database from backup
const restoreDatabase = async backupFile => {
  try {
    console.log(`🔄 Restaurando base de datos desde: ${backupFile}`);

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Restore command
    const restoreCommand = `mongorestore --uri="${process.env.MONGODB_URI}" --archive="${backupFile}" --gzip`;

    await execAsync(restoreCommand);

    console.log('✅ Base de datos restaurada exitosamente');
  } catch (error) {
    console.error('❌ Error restaurando base de datos:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  getDBStats,
  createIndexes,
  dropAllCollections,
  seedDatabase,
  backupDatabase,
  restoreDatabase,
};

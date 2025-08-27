const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// ESQUEMA DE USUARIO CON VALIDACIONES CRÍTICAS
// ==========================================

const userSchema = new mongoose.Schema({
  // Información básica
  username: {
    type: String,
    required: [true, 'Username es requerido'],
    unique: true,
    trim: true,
    minlength: [3, 'Username debe tener al menos 3 caracteres'],
    maxlength: [30, 'Username no puede exceder 30 caracteres'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username solo puede contener letras, números y guiones bajos'],
    index: true, // Índice crítico para búsquedas
  },
  
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    index: true, // Índice crítico para autenticación
  },
  
  password: {
    type: String,
    required: [true, 'Password es requerido'],
    minlength: [8, 'Password debe tener al menos 8 caracteres'],
    select: false, // No incluir en queries por defecto
  },
  
  firstName: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    maxlength: [50, 'Nombre no puede exceder 50 caracteres'],
  },
  
  lastName: {
    type: String,
    required: [true, 'Apellido es requerido'],
    trim: true,
    maxlength: [50, 'Apellido no puede exceder 50 caracteres'],
  },
  
  // Estado y verificación
  isVerified: {
    type: Boolean,
    default: false,
    index: true, // Índice para filtrar usuarios verificados
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true, // Índice para filtrar usuarios activos
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'deleted'],
    default: 'active',
    index: true, // Índice para moderación
  },
  
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'superadmin'],
    default: 'user',
    index: true, // Índice para autorización
  },
  
  // Perfil
  avatar: {
    type: String,
    default: null,
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio no puede exceder 500 caracteres'],
    default: '',
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
    address: String,
    city: String,
    country: String,
    timezone: String,
  },
  
  // Preferencias
  preferences: {
    language: {
      type: String,
      default: 'es',
      enum: ['es', 'en', 'fr', 'de', 'pt'],
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto'],
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    privacy: {
      profileVisibility: {
        type: String,
        default: 'public',
        enum: ['public', 'friends', 'private'],
      },
      locationVisibility: {
        type: String,
        default: 'friends',
        enum: ['public', 'friends', 'private'],
      },
      activityVisibility: {
        type: String,
        default: 'friends',
        enum: ['public', 'friends', 'private'],
      },
    },
  },
  
  // Gamificación
  level: {
    type: Number,
    default: 1,
    min: 1,
    index: true, // Índice para leaderboards
  },
  
  experience: {
    type: Number,
    default: 0,
    min: 0,
    index: true, // Índice para rankings
  },
  
  points: {
    type: Number,
    default: 0,
    min: 0,
    index: true, // Índice para rankings
  },
  
  achievements: [{
    type: String,
    ref: 'Achievement',
  }],
  
  badges: [{
    type: String,
    ref: 'Badge',
  }],
  
  // Estadísticas
  stats: {
    eventsCreated: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 },
    tribesJoined: { type: Number, default: 0 },
    postsCreated: { type: Number, default: 0 },
    reviewsGiven: { type: Number, default: 0 },
    connectionsMade: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  
  // Seguridad
  loginAttempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  lockUntil: {
    type: Date,
    default: null,
  },
  
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Tokens de autenticación
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    device: String,
    ip: String,
  }],
  
  // Verificación
  verificationToken: String,
  verificationExpires: Date,
  emailChangeToken: String,
  emailChangeExpires: Date,
  newEmail: String,
  
  // Social
  socialAccounts: [{
    provider: {
      type: String,
      enum: ['google', 'facebook', 'twitter', 'github', 'linkedin'],
    },
    providerId: String,
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
  }],
  
  // Configuración de notificaciones push
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
  
  // Metadatos
  lastLogin: {
    type: Date,
    default: Date.now,
    index: true, // Índice para análisis de actividad
  },
  
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  
  // Campos de auditoría
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  deletedAt: {
    type: Date,
    default: null,
    index: true, // Índice para soft deletes
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ==========================================
// ÍNDICES CRÍTICOS PARA PERFORMANCE
// ==========================================

// Índice compuesto para búsquedas de usuarios
userSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  username: 'text', 
  bio: 'text' 
});

// Índice geoespacial para ubicaciones
userSchema.index({ location: '2dsphere' });

// Índice compuesto para autenticación
userSchema.index({ email: 1, isActive: 1, status: 1 });

// Índice compuesto para moderación
userSchema.index({ role: 1, status: 1, isActive: 1 });

// Índice compuesto para gamificación
userSchema.index({ level: -1, experience: -1, points: -1 });

// Índice para análisis de actividad
userSchema.index({ lastLogin: -1, lastSeen: -1 });

// Índice para soft deletes
userSchema.index({ deletedAt: 1, status: 1 });

// ==========================================
// VALIDACIONES Y MIDDLEWARE
// ==========================================

// Validación personalizada para password
userSchema.path('password').validate(function(value) {
  if (!value) return true; // Permitir password vacío en updates
  
  // Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  return passwordRegex.test(value);
}, 'Password debe contener al menos una mayúscula, una minúscula, un número y un carácter especial');

// Validación personalizada para username
userSchema.path('username').validate(function(value) {
  if (!value) return true;
  
  // No puede contener palabras reservadas
  const reservedWords = ['admin', 'root', 'system', 'test', 'user', 'guest'];
  return !reservedWords.includes(value.toLowerCase());
}, 'Username no puede ser una palabra reservada');

// Middleware pre-save para hash de password
userSchema.pre('save', async function(next) {
  try {
    // Solo hashear si el password fue modificado
    if (!this.isModified('password')) return next();
    
    // Hash del password con salt de 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Actualizar timestamp de cambio de password
    this.passwordChangedAt = Date.now() - 1000; // -1 segundo para asegurar que el token se creó después
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pre-save para validaciones adicionales
userSchema.pre('save', function(next) {
  try {
    // Validar que las coordenadas sean válidas si están presentes
    if (this.location && this.location.coordinates) {
      if (this.location.coordinates.length !== 2) {
        throw new Error('Las coordenadas deben ser un array de 2 elementos [longitud, latitud]');
      }
      
      const [lng, lat] = this.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Coordenadas inválidas');
      }
    }
    
    // Validar que el email no esté en uso por otro usuario
    if (this.isModified('email')) {
      // Esta validación se hará en el controlador para evitar problemas de concurrencia
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// MÉTODOS DE INSTANCIA
// ==========================================

// Comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparando password');
  }
};

// Verificar si el password cambió después de que se emitió un token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
}

// Generar token de acceso
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role,
      version: this.passwordChangedAt ? this.passwordChangedAt.getTime() : 0
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Generar token de refresh
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Verificar si la cuenta está bloqueada
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Incrementar intentos de login
userSchema.methods.incLoginAttempts = function() {
  // Si hay un lock previo que expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta si se excedieron los intentos
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 horas
  }
  
  return this.updateOne(updates);
};

// Resetear intentos de login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// ==========================================
// MÉTODOS ESTÁTICOS
// ==========================================

// Buscar usuario por email o username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ],
    isActive: true,
    status: 'active'
  });
};

// Buscar usuarios por ubicación
userSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    status: 'active'
  });
};

// ==========================================
// VIRTUAL FIELDS
// ==========================================

// Nombre completo
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// URL del avatar
userSchema.virtual('avatarUrl').get(function() {
  if (this.avatar) {
    return this.avatar.startsWith('http') ? this.avatar : `${process.env.API_URL}/uploads/avatars/${this.avatar}`;
  }
  return `${process.env.API_URL}/uploads/avatars/default.png`;
});

// ==========================================
// CONFIGURACIÓN DEL MODELO
// ==========================================

// Configurar opciones de búsqueda de texto
userSchema.set('autoIndex', false); // Deshabilitar auto-indexación en producción

// Configurar opciones de validación
userSchema.set('validateBeforeSave', true);

// Configurar opciones de transformación
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.verificationToken;
    delete ret.passwordResetToken;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);

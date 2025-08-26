const Joi = require('joi');

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  coordinates: /^-?\d+(\.\d+)?$/,
};

// Common validation messages
const messages = {
  required: 'Este campo es requerido',
  email: 'Debe ser un email válido',
  password:
    'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
  phone: 'Debe ser un número de teléfono válido',
  username:
    'El nombre de usuario debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos',
  url: 'Debe ser una URL válida',
  minLength: (field, length) =>
    `${field} debe tener al menos ${length} caracteres`,
  maxLength: (field, length) =>
    `${field} debe tener máximo ${length} caracteres`,
  minValue: (field, value) => `${field} debe ser al menos ${value}`,
  maxValue: (field, value) => `${field} debe ser máximo ${value}`,
  invalidFormat: field => `Formato de ${field} inválido`,
  alreadyExists: field => `${field} ya existe`,
  notFound: field => `${field} no encontrado`,
  unauthorized: 'No tienes permisos para realizar esta acción',
  invalidCredentials: 'Credenciales inválidas',
  tokenExpired: 'Token expirado',
  invalidToken: 'Token inválido',
};

// User validation schemas
const userSchemas = {
  // Registration
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': messages.email,
      'any.required': messages.required,
    }),
    password: Joi.string().pattern(patterns.password).required().messages({
      'string.pattern.base': messages.password,
      'any.required': messages.required,
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': messages.required,
      }),
    username: Joi.string()
      .pattern(patterns.username)
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': messages.username,
        'string.min': messages.minLength('username', 3),
        'string.max': messages.maxLength('username', 20),
        'any.required': messages.required,
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': messages.minLength('nombre', 2),
        'string.max': messages.maxLength('nombre', 50),
        'any.required': messages.required,
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': messages.minLength('apellido', 2),
        'string.max': messages.maxLength('apellido', 50),
        'any.required': messages.required,
      }),
    dateOfBirth: Joi.date().max('now').messages({
      'date.max': 'La fecha de nacimiento no puede ser en el futuro',
    }),
    phone: Joi.string().pattern(patterns.phone).messages({
      'string.pattern.base': messages.phone,
    }),
    acceptTerms: Joi.boolean().valid(true).required().messages({
      'any.only': 'Debes aceptar los términos y condiciones',
      'any.required': messages.required,
    }),
    acceptMarketing: Joi.boolean().default(false),
  }),

  // Login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': messages.email,
      'any.required': messages.required,
    }),
    password: Joi.string().required().messages({
      'any.required': messages.required,
    }),
    rememberMe: Joi.boolean().default(false),
  }),

  // Profile update
  updateProfile: Joi.object({
    username: Joi.string()
      .pattern(patterns.username)
      .min(3)
      .max(20)
      .messages({
        'string.pattern.base': messages.username,
        'string.min': messages.minLength('username', 3),
        'string.max': messages.maxLength('username', 20),
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': messages.minLength('nombre', 2),
        'string.max': messages.maxLength('nombre', 50),
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': messages.minLength('apellido', 2),
        'string.max': messages.maxLength('apellido', 50),
      }),
    bio: Joi.string()
      .max(500)
      .messages({
        'string.max': messages.maxLength('biografía', 500),
      }),
    dateOfBirth: Joi.date().max('now').messages({
      'date.max': 'La fecha de nacimiento no puede ser en el futuro',
    }),
    phone: Joi.string().pattern(patterns.phone).messages({
      'string.pattern.base': messages.phone,
    }),
    website: Joi.string().uri().messages({
      'string.uri': messages.url,
    }),
    location: Joi.object({
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }),
    interests: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 intereses',
    }),
    socialLinks: Joi.object({
      facebook: Joi.string().uri(),
      twitter: Joi.string().uri(),
      instagram: Joi.string().uri(),
      linkedin: Joi.string().uri(),
      youtube: Joi.string().uri(),
    }),
  }),

  // Password change
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Contraseña actual es requerida',
    }),
    newPassword: Joi.string().pattern(patterns.password).required().messages({
      'string.pattern.base': messages.password,
      'any.required': 'Nueva contraseña es requerida',
    }),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'Confirmación de contraseña es requerida',
      }),
  }),

  // Password reset request
  requestPasswordReset: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': messages.email,
      'any.required': messages.required,
    }),
  }),

  // Password reset
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token es requerido',
    }),
    newPassword: Joi.string().pattern(patterns.password).required().messages({
      'string.pattern.base': messages.password,
      'any.required': 'Nueva contraseña es requerida',
    }),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'Confirmación de contraseña es requerida',
      }),
  }),
};

// Event validation schemas
const eventSchemas = {
  // Create event
  create: Joi.object({
    title: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': messages.minLength('título', 5),
        'string.max': messages.maxLength('título', 200),
        'any.required': messages.required,
      }),
    description: Joi.string()
      .min(20)
      .max(2000)
      .required()
      .messages({
        'string.min': messages.minLength('descripción', 20),
        'string.max': messages.maxLength('descripción', 2000),
        'any.required': messages.required,
      }),
    category: Joi.string().required().messages({
      'any.required': messages.required,
    }),
    subcategory: Joi.string(),
    startDate: Joi.date().greater('now').required().messages({
      'date.greater': 'La fecha de inicio debe ser en el futuro',
      'any.required': messages.required,
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).messages({
      'date.greater': 'La fecha de fin debe ser después de la fecha de inicio',
    }),
    location: Joi.object({
      name: Joi.string().max(200),
      address: Joi.string().max(500),
      city: Joi.string().max(100).required(),
      state: Joi.string().max(100),
      country: Joi.string().max(100).required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      }).required(),
    }).required(),
    capacity: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .messages({
        'number.min': messages.minValue('capacidad', 1),
        'number.max': messages.maxValue('capacidad', 10000),
      }),
    price: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string().length(3).default('USD'),
      isFree: Joi.boolean().default(false),
    }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    isPublic: Joi.boolean().default(true),
    requiresApproval: Joi.boolean().default(false),
    maxAge: Joi.number().integer().min(0).max(120),
    minAge: Joi.number().integer().min(0).max(120),
    dressCode: Joi.string().max(200),
    accessibility: Joi.array().items(Joi.string()),
    rules: Joi.array().items(Joi.string().max(500)),
  }),

  // Update event
  update: Joi.object({
    title: Joi.string()
      .min(5)
      .max(200)
      .messages({
        'string.min': messages.minLength('título', 5),
        'string.max': messages.maxLength('título', 200),
      }),
    description: Joi.string()
      .min(20)
      .max(2000)
      .messages({
        'string.min': messages.minLength('descripción', 20),
        'string.max': messages.maxLength('descripción', 2000),
      }),
    category: Joi.string(),
    subcategory: Joi.string(),
    startDate: Joi.date().greater('now').messages({
      'date.greater': 'La fecha de inicio debe ser en el futuro',
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).messages({
      'date.greater': 'La fecha de fin debe ser después de la fecha de inicio',
    }),
    location: Joi.object({
      name: Joi.string().max(200),
      address: Joi.string().max(500),
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }),
    capacity: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .messages({
        'number.min': messages.minValue('capacidad', 1),
        'number.max': messages.maxValue('capacidad', 10000),
      }),
    price: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string().length(3),
      isFree: Joi.boolean(),
    }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    isPublic: Joi.boolean(),
    requiresApproval: Joi.boolean(),
    maxAge: Joi.number().integer().min(0).max(120),
    minAge: Joi.number().integer().min(0).max(120),
    dressCode: Joi.string().max(200),
    accessibility: Joi.array().items(Joi.string()),
    rules: Joi.array().items(Joi.string().max(500)),
  }),
};

// Tribe validation schemas
const tribeSchemas = {
  // Create tribe
  create: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': messages.minLength('nombre', 3),
        'string.max': messages.maxLength('nombre', 100),
        'any.required': messages.required,
      }),
    description: Joi.string()
      .min(20)
      .max(1000)
      .required()
      .messages({
        'string.min': messages.minLength('descripción', 20),
        'string.max': messages.maxLength('descripción', 1000),
        'any.required': messages.required,
      }),
    category: Joi.string().required().messages({
      'any.required': messages.required,
    }),
    subcategory: Joi.string(),
    location: Joi.object({
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }),
    isPublic: Joi.boolean().default(true),
    requiresApproval: Joi.boolean().default(false),
    maxMembers: Joi.number()
      .integer()
      .min(2)
      .max(10000)
      .messages({
        'number.min': messages.minValue('máximo de miembros', 2),
        'number.max': messages.maxValue('máximo de miembros', 10000),
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    rules: Joi.array().items(Joi.string().max(500)).max(20).messages({
      'array.max': 'Máximo 20 reglas',
    }),
    guidelines: Joi.string().max(2000),
  }),

  // Update tribe
  update: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .messages({
        'string.min': messages.minLength('nombre', 3),
        'string.max': messages.maxLength('nombre', 100),
      }),
    description: Joi.string()
      .min(20)
      .max(1000)
      .messages({
        'string.min': messages.minLength('descripción', 20),
        'string.max': messages.maxLength('descripción', 1000),
      }),
    category: Joi.string(),
    subcategory: Joi.string(),
    location: Joi.object({
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }),
    isPublic: Joi.boolean(),
    requiresApproval: Joi.boolean(),
    maxMembers: Joi.number()
      .integer()
      .min(2)
      .max(10000)
      .messages({
        'number.min': messages.minValue('máximo de miembros', 2),
        'number.max': messages.maxValue('máximo de miembros', 10000),
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    rules: Joi.array().items(Joi.string().max(500)).max(20).messages({
      'array.max': 'Máximo 20 reglas',
    }),
    guidelines: Joi.string().max(2000),
  }),
};

// Post validation schemas
const postSchemas = {
  // Create post
  create: Joi.object({
    content: Joi.string()
      .min(1)
      .max(5000)
      .required()
      .messages({
        'string.min': 'El contenido no puede estar vacío',
        'string.max': messages.maxLength('contenido', 5000),
        'any.required': messages.required,
      }),
    type: Joi.string()
      .valid('text', 'image', 'video', 'poll', 'event', 'tribe')
      .default('text')
      .messages({
        'any.only': 'Tipo de post inválido',
      }),
    visibility: Joi.string()
      .valid('public', 'friends', 'private')
      .default('public')
      .messages({
        'any.only': 'Visibilidad inválida',
      }),
    eventId: Joi.string()
      .when('type', {
        is: 'event',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        'any.required': 'ID de evento es requerido para posts de tipo evento',
        'any.forbidden': 'ID de evento no permitido para este tipo de post',
      }),
    tribeId: Joi.string()
      .when('type', {
        is: 'tribe',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        'any.required': 'ID de tribu es requerido para posts de tipo tribu',
        'any.forbidden': 'ID de tribu no permitido para este tipo de post',
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    location: Joi.object({
      name: Joi.string().max(200),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }),
    poll: Joi.object({
      question: Joi.string().max(200).required(),
      options: Joi.array()
        .items(Joi.string().max(100))
        .min(2)
        .max(10)
        .required()
        .messages({
          'array.min': 'Mínimo 2 opciones para la encuesta',
          'array.max': 'Máximo 10 opciones para la encuesta',
          'any.required': 'Opciones de encuesta son requeridas',
        }),
      expiresAt: Joi.date().greater('now'),
    }).when('type', {
      is: 'poll',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  }),

  // Update post
  update: Joi.object({
    content: Joi.string()
      .min(1)
      .max(5000)
      .messages({
        'string.min': 'El contenido no puede estar vacío',
        'string.max': messages.maxLength('contenido', 5000),
      }),
    visibility: Joi.string().valid('public', 'friends', 'private').messages({
      'any.only': 'Visibilidad inválida',
    }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    location: Joi.object({
      name: Joi.string().max(200),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }),
  }),
};

// Review validation schemas
const reviewSchemas = {
  // Create review
  create: Joi.object({
    eventId: Joi.string().required().messages({
      'any.required': 'ID de evento es requerido',
    }),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': messages.minValue('calificación', 1),
        'number.max': messages.maxValue('calificación', 5),
        'any.required': messages.required,
      }),
    comment: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': messages.minLength('comentario', 10),
        'string.max': messages.maxLength('comentario', 1000),
        'any.required': messages.required,
      }),
    categories: Joi.array()
      .items(
        Joi.object({
          category: Joi.string().required(),
          rating: Joi.number().integer().min(1).max(5).required(),
        })
      )
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'Mínimo 1 categoría de calificación',
        'array.max': 'Máximo 10 categorías de calificación',
        'any.required': 'Categorías de calificación son requeridas',
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
    isAnonymous: Joi.boolean().default(false),
  }),

  // Update review
  update: Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .messages({
        'number.min': messages.minValue('calificación', 1),
        'number.max': messages.maxValue('calificación', 5),
      }),
    comment: Joi.string()
      .min(10)
      .max(1000)
      .messages({
        'string.min': messages.minLength('comentario', 10),
        'string.max': messages.maxLength('comentario', 1000),
      }),
    categories: Joi.array()
      .items(
        Joi.object({
          category: Joi.string().required(),
          rating: Joi.number().integer().min(1).max(5).required(),
        })
      )
      .min(1)
      .max(10)
      .messages({
        'array.min': 'Mínimo 1 categoría de calificación',
        'array.max': 'Máximo 10 categorías de calificación',
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).messages({
      'array.max': 'Máximo 20 etiquetas',
    }),
  }),
};

// Chat validation schemas
const chatSchemas = {
  // Send message
  sendMessage: Joi.object({
    chatId: Joi.string().required().messages({
      'any.required': 'ID de chat es requerido',
    }),
    content: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'El mensaje no puede estar vacío',
        'string.max': messages.maxLength('mensaje', 2000),
        'any.required': messages.required,
      }),
    type: Joi.string()
      .valid('text', 'image', 'video', 'file', 'location')
      .default('text')
      .messages({
        'any.only': 'Tipo de mensaje inválido',
      }),
    replyTo: Joi.string(),
    attachments: Joi.array().items(Joi.string()).max(10).messages({
      'array.max': 'Máximo 10 archivos adjuntos',
    }),
  }),

  // Create chat
  createChat: Joi.object({
    type: Joi.string()
      .valid('private', 'group', 'event', 'tribe')
      .required()
      .messages({
        'any.only': 'Tipo de chat inválido',
        'any.required': messages.required,
      }),
    participants: Joi.array().items(Joi.string()).min(2).required().messages({
      'array.min': 'Mínimo 2 participantes',
      'any.required': 'Participantes son requeridos',
    }),
    name: Joi.string()
      .max(100)
      .when('type', {
        is: 'group',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        'string.max': messages.maxLength('nombre', 100),
        'any.required': 'Nombre es requerido para chats grupales',
        'any.forbidden': 'Nombre no permitido para este tipo de chat',
      }),
    eventId: Joi.string()
      .when('type', {
        is: 'event',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        'any.required': 'ID de evento es requerido para chats de evento',
        'any.forbidden': 'ID de evento no permitido para este tipo de chat',
      }),
    tribeId: Joi.string()
      .when('type', {
        is: 'tribe',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        'any.required': 'ID de tribu es requerido para chats de tribu',
        'any.forbidden': 'ID de tribu no permitido para este tipo de chat',
      }),
  }),
};

// Search validation schemas
const searchSchemas = {
  // General search
  search: Joi.object({
    query: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': messages.minLength('búsqueda', 2),
        'string.max': messages.maxLength('búsqueda', 200),
        'any.required': messages.required,
      }),
    type: Joi.string()
      .valid('all', 'events', 'tribes', 'users', 'posts')
      .default('all')
      .messages({
        'any.only': 'Tipo de búsqueda inválido',
      }),
    category: Joi.string(),
    location: Joi.object({
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
      radius: Joi.number().min(1).max(1000).default(50),
    }),
    dateRange: Joi.object({
      start: Joi.date(),
      end: Joi.date().min(Joi.ref('start')),
    }),
    priceRange: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(Joi.ref('min')),
    }),
    tags: Joi.array().items(Joi.string().max(50)),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid('relevance', 'date', 'distance', 'price', 'rating', 'popularity')
      .default('relevance'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Pagination validation schemas
const paginationSchemas = {
  // Standard pagination
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.min': messages.minValue('página', 1),
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.min': messages.minValue('límite', 1),
        'number.max': messages.maxValue('límite', 100),
      }),
    sortBy: Joi.string().max(50),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'Orden de clasificación debe ser asc o desc',
    }),
  }),
};

// Export all schemas
module.exports = {
  patterns,
  messages,
  userSchemas,
  eventSchemas,
  tribeSchemas,
  postSchemas,
  reviewSchemas,
  chatSchemas,
  searchSchemas,
  paginationSchemas,
};

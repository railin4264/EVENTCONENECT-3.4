const Joi = require('joi');

// Esquema para validar notificaciones básicas
const notificationSchema = Joi.object({
  type: Joi.string()
    .valid(
      'event_invite',
      'event_reminder',
      'event_update',
      'event_cancelled',
      'tribe_invite',
      'tribe_update',
      'new_message',
      'mention',
      'like',
      'comment',
      'follow',
      'system',
      'security',
      'promotional'
    )
    .required()
    .messages({
      'any.required': 'El tipo de notificación es requerido',
      'any.only': 'Tipo de notificación no válido',
    }),

  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'El título no puede estar vacío',
    'string.min': 'El título debe tener al menos 1 carácter',
    'string.max': 'El título no puede exceder 200 caracteres',
    'any.required': 'El título es requerido',
  }),

  body: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'El cuerpo de la notificación no puede estar vacío',
    'string.min': 'El cuerpo debe tener al menos 1 carácter',
    'string.max': 'El cuerpo no puede exceder 500 caracteres',
    'any.required': 'El cuerpo de la notificación es requerido',
  }),

  data: Joi.object().default({}).messages({
    'object.base': 'Los datos deben ser un objeto válido',
  }),

  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .default('normal')
    .messages({
      'any.only': 'Prioridad no válida',
    }),

  categoryId: Joi.string().default('general').messages({
    'string.base': 'El ID de categoría debe ser una cadena',
  }),

  sound: Joi.string().valid('default', 'custom').default('default').messages({
    'any.only': 'Sonido no válido',
  }),

  badge: Joi.number().integer().min(0).max(999).default(1).messages({
    'number.base': 'El badge debe ser un número',
    'number.integer': 'El badge debe ser un número entero',
    'number.min': 'El badge no puede ser menor a 0',
    'number.max': 'El badge no puede exceder 999',
  }),

  channels: Joi.array()
    .items(Joi.string().valid('push', 'email', 'sms', 'in_app'))
    .min(1)
    .default(['push', 'in_app'])
    .messages({
      'array.min': 'Debe especificar al menos un canal',
      'array.includes': 'Canal no válido',
    }),

  android: Joi.object({
    channelId: Joi.string(),
    priority: Joi.string().valid('normal', 'high', 'urgent'),
    sound: Joi.string(),
    vibrate: Joi.array().items(Joi.number()),
    icon: Joi.string().uri(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
    sticky: Joi.boolean(),
  }).messages({
    'object.base': 'Configuración de Android debe ser un objeto válido',
  }),

  ios: Joi.object({
    sound: Joi.string(),
    badge: Joi.number().integer().min(0),
    categoryId: Joi.string(),
    threadId: Joi.string(),
  }).messages({
    'object.base': 'Configuración de iOS debe ser un objeto válido',
  }),
});

// Esquema para notificaciones programadas
const scheduledNotificationSchema = Joi.object({
  notification: notificationSchema.required(),

  scheduledTime: Joi.date().greater('now').required().messages({
    'date.base': 'La fecha programada debe ser una fecha válida',
    'date.greater': 'La fecha programada debe ser en el futuro',
    'any.required': 'La fecha programada es requerida',
  }),

  recurrence: Joi.object({
    enabled: Joi.boolean().default(false),
    pattern: Joi.when('enabled', {
      is: true,
      then: Joi.string()
        .valid('daily', 'weekly', 'monthly', 'yearly', 'custom')
        .required(),
      otherwise: Joi.forbidden(),
    }),
    interval: Joi.when('enabled', {
      is: true,
      then: Joi.number().integer().min(1).max(365).default(1),
      otherwise: Joi.forbidden(),
    }),
    daysOfWeek: Joi.when('enabled', {
      is: true,
      then: Joi.array().items(Joi.number().min(0).max(6)).min(1).max(7),
      otherwise: Joi.forbidden(),
    }),
    dayOfMonth: Joi.when('enabled', {
      is: true,
      then: Joi.number().integer().min(1).max(31),
      otherwise: Joi.forbidden(),
    }),
    monthOfYear: Joi.when('enabled', {
      is: true,
      then: Joi.number().integer().min(1).max(12),
      otherwise: Joi.forbidden(),
    }),
    endDate: Joi.date().greater('now'),
    maxOccurrences: Joi.number().integer().min(1).max(1000),
  }).messages({
    'object.base': 'La configuración de recurrencia debe ser un objeto válido',
  }),

  conditions: Joi.object({
    userOnline: Joi.boolean().default(false),
    userActive: Joi.boolean().default(false),
    timeWindow: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    }).messages({
      'object.base': 'La ventana de tiempo debe ser un objeto válido',
      'string.pattern.base': 'El formato de tiempo debe ser HH:mm',
    }),
    timezone: Joi.string().default('UTC'),
    userPreferences: Joi.object(),
  }).messages({
    'object.base': 'Las condiciones deben ser un objeto válido',
  }),

  metadata: Joi.object({
    source: Joi.string().valid(
      'system',
      'user',
      'event',
      'tribe',
      'chat',
      'automated',
      'manual'
    ),
    campaign: Joi.string(),
    segment: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    createdBy: Joi.string().hex().length(24),
    batchId: Joi.string(),
    priority: Joi.number().integer().min(1).max(100),
  }).messages({
    'object.base': 'Los metadatos deben ser un objeto válido',
  }),
});

// Esquema para preferencias de usuario
const userPreferencesSchema = Joi.object({
  push: Joi.object({
    enabled: Joi.boolean().default(true),
    types: Joi.object({
      event_invite: Joi.boolean().default(true),
      event_reminder: Joi.boolean().default(true),
      event_update: Joi.boolean().default(true),
      event_cancelled: Joi.boolean().default(true),
      tribe_invite: Joi.boolean().default(true),
      tribe_update: Joi.boolean().default(true),
      new_message: Joi.boolean().default(true),
      mention: Joi.boolean().default(true),
      like: Joi.boolean().default(true),
      comment: Joi.boolean().default(true),
      follow: Joi.boolean().default(true),
      system: Joi.boolean().default(true),
      security: Joi.boolean().default(true),
      promotional: Joi.boolean().default(false),
    }),
    quietHours: Joi.object({
      enabled: Joi.boolean().default(false),
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      timezone: Joi.string().default('UTC'),
    }),
  }),

  email: Joi.object({
    enabled: Joi.boolean().default(true),
    types: Joi.object({
      event_invite: Joi.boolean().default(true),
      event_reminder: Joi.boolean().default(true),
      event_update: Joi.boolean().default(true),
      event_cancelled: Joi.boolean().default(true),
      tribe_invite: Joi.boolean().default(true),
      tribe_update: Joi.boolean().default(true),
      new_message: Joi.boolean().default(false),
      mention: Joi.boolean().default(true),
      like: Joi.boolean().default(false),
      comment: Joi.boolean().default(false),
      follow: Joi.boolean().default(false),
      system: Joi.boolean().default(true),
      security: Joi.boolean().default(true),
      promotional: Joi.boolean().default(false),
    }),
    frequency: Joi.string()
      .valid('immediate', 'hourly', 'daily', 'weekly')
      .default('immediate'),
  }),

  sms: Joi.object({
    enabled: Joi.boolean().default(false),
    types: Joi.object({
      event_reminder: Joi.boolean().default(true),
      security: Joi.boolean().default(true),
    }),
  }),

  in_app: Joi.object({
    enabled: Joi.boolean().default(true),
    types: Joi.object({
      event_invite: Joi.boolean().default(true),
      event_reminder: Joi.boolean().default(true),
      event_update: Joi.boolean().default(true),
      event_cancelled: Joi.boolean().default(true),
      tribe_invite: Joi.boolean().default(true),
      tribe_update: Joi.boolean().default(true),
      new_message: Joi.boolean().default(true),
      mention: Joi.boolean().default(true),
      like: Joi.boolean().default(true),
      comment: Joi.boolean().default(true),
      follow: Joi.boolean().default(true),
      system: Joi.boolean().default(true),
      security: Joi.boolean().default(true),
      promotional: Joi.boolean().default(true),
    }),
    sound: Joi.boolean().default(true),
    vibration: Joi.boolean().default(true),
    badge: Joi.boolean().default(true),
  }),
});

// Esquema para registro de token push
const pushTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'El token no puede estar vacío',
    'any.required': 'El token es requerido',
  }),

  platform: Joi.string().valid('ios', 'android', 'web').required().messages({
    'any.only': 'Plataforma no válida',
    'any.required': 'La plataforma es requerida',
  }),

  deviceId: Joi.string().optional().messages({
    'string.base': 'El ID del dispositivo debe ser una cadena',
  }),

  appVersion: Joi.string().optional().messages({
    'string.base': 'La versión de la app debe ser una cadena',
  }),

  osVersion: Joi.string().optional().messages({
    'string.base': 'La versión del SO debe ser una cadena',
  }),
});

// Esquema para notificaciones del sistema
const systemNotificationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'El título no puede estar vacío',
    'string.min': 'El título debe tener al menos 1 carácter',
    'string.max': 'El título no puede exceder 200 caracteres',
    'any.required': 'El título es requerido',
  }),

  body: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'El cuerpo de la notificación no puede estar vacío',
    'string.min': 'El cuerpo debe tener al menos 1 carácter',
    'string.max': 'El cuerpo no puede exceder 500 caracteres',
    'any.required': 'El cuerpo de la notificación es requerido',
  }),

  recipients: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().hex().length(24)).min(1),
      Joi.string().valid('all', 'online', 'active')
    )
    .required()
    .messages({
      'any.required': 'Los destinatarios son requeridos',
      'array.min': 'Debe especificar al menos un destinatario',
    }),

  data: Joi.object().default({}).messages({
    'object.base': 'Los datos deben ser un objeto válido',
  }),

  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .default('normal')
    .messages({
      'any.only': 'Prioridad no válida',
    }),

  channels: Joi.array()
    .items(Joi.string().valid('push', 'email', 'sms', 'in_app'))
    .min(1)
    .default(['push', 'in_app'])
    .messages({
      'array.min': 'Debe especificar al menos un canal',
      'array.includes': 'Canal no válido',
    }),

  scheduledFor: Joi.date().greater('now').optional().messages({
    'date.base': 'La fecha programada debe ser una fecha válida',
    'date.greater': 'La fecha programada debe ser en el futuro',
  }),

  expiresAt: Joi.date().greater('now').optional().messages({
    'date.base': 'La fecha de expiración debe ser una fecha válida',
    'date.greater': 'La fecha de expiración debe ser en el futuro',
  }),
});

// Validadores
const validateNotification = (req, res, next) => {
  const { error } = notificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de notificación inválidos',
      errors: error.details.map(detail => detail.message),
    });
  }
  next();
};

const validateScheduledNotification = (req, res, next) => {
  const { error } = scheduledNotificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de notificación programada inválidos',
      errors: error.details.map(detail => detail.message),
    });
  }
  next();
};

const validateUserPreferences = (req, res, next) => {
  const { error } = userPreferencesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Preferencias de usuario inválidas',
      errors: error.details.map(detail => detail.message),
    });
  }
  next();
};

const validatePushToken = (req, res, next) => {
  const { error } = pushTokenSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de token push inválidos',
      errors: error.details.map(detail => detail.message),
    });
  }
  next();
};

const validateSystemNotification = (req, res, next) => {
  const { error } = systemNotificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de notificación del sistema inválidos',
      errors: error.details.map(detail => detail.message),
    });
  }
  next();
};

module.exports = {
  validateNotification,
  validateScheduledNotification,
  validateUserPreferences,
  validatePushToken,
  validateSystemNotification,
  notificationSchema,
  scheduledNotificationSchema,
  userPreferencesSchema,
  pushTokenSchema,
  systemNotificationSchema,
};

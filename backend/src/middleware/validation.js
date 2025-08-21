const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Sanitize HTML content
const sanitizeHtmlContent = (req, res, next) => {
  if (req.body.content) {
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'a',
        'img',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      'El nombre de usuario solo puede contener letras, números y guiones bajos'
    ),

  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    ),

  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'prefer-not-to-say'])
    .withMessage('Género inválido'),

  handleValidationErrors,
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('La contraseña es requerida'),

  handleValidationErrors,
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede exceder 500 caracteres'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'prefer-not-to-say'])
    .withMessage('Género inválido'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Los intereses deben ser un array'),

  body('interests.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Cada interés no puede exceder 50 caracteres'),

  handleValidationErrors,
];

// Event validation rules
const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título del evento debe tener entre 1 y 100 caracteres'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage(
      'La descripción del evento debe tener entre 10 y 2000 caracteres'
    ),

  body('category')
    .isIn([
      'music',
      'sports',
      'technology',
      'art',
      'food',
      'travel',
      'education',
      'business',
      'health',
      'fitness',
      'gaming',
      'reading',
      'photography',
      'cooking',
      'dancing',
      'writing',
      'volunteering',
      'outdoors',
      'fashion',
      'networking',
      'workshop',
      'conference',
      'festival',
      'party',
      'community',
      'family',
      'kids',
      'pets',
      'charity',
      'online',
      'other',
    ])
    .withMessage('Categoría de evento inválida'),

  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La subcategoría no puede exceder 100 caracteres'),

  body('dateTime.start')
    .isISO8601()
    .withMessage('Fecha y hora de inicio inválida'),

  body('dateTime.end')
    .optional()
    .isISO8601()
    .withMessage('Fecha y hora de fin inválida')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.dateTime.start)) {
        throw new Error(
          'La fecha de fin debe ser posterior a la fecha de inicio'
        );
      }
      return true;
    }),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage(
      'Las coordenadas deben ser un array de 2 elementos [longitud, latitud]'
    ),

  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Coordenadas inválidas'),

  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero mayor a 0'),

  body('price.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio no puede ser negativo'),

  body('tags').optional().isArray().withMessage('Los tags deben ser un array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Cada tag no puede exceder 30 caracteres'),

  handleValidationErrors,
];

const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título del evento debe tener entre 1 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage(
      'La descripción del evento debe tener entre 10 y 2000 caracteres'
    ),

  body('category')
    .optional()
    .isIn([
      'music',
      'sports',
      'technology',
      'art',
      'food',
      'travel',
      'education',
      'business',
      'health',
      'fitness',
      'gaming',
      'reading',
      'photography',
      'cooking',
      'dancing',
      'writing',
      'volunteering',
      'outdoors',
      'fashion',
      'networking',
      'workshop',
      'conference',
      'festival',
      'party',
      'community',
      'family',
      'kids',
      'pets',
      'charity',
      'online',
      'other',
    ])
    .withMessage('Categoría de evento inválida'),

  handleValidationErrors,
];

// Tribe creation validation rules
const validateTribeCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre de la tribu debe tener entre 3 y 100 caracteres'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),

  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La categoría debe tener entre 1 y 50 caracteres'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidos'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Cada tag debe tener entre 1 y 20 caracteres'),

  body('visibility')
    .optional()
    .isIn(['public', 'private', 'invite_only'])
    .withMessage('Visibilidad inválida'),

  body('location')
    .optional()
    .isObject()
    .withMessage('La ubicación debe ser un objeto'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array de 2 elementos'),

  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180'),

  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90'),

  body('location.address')
    .optional()
    .isObject()
    .withMessage('La dirección debe ser un objeto'),

  handleValidationErrors,
];

// Tribe update validation rules
const validateTribeUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre de la tribu debe tener entre 3 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La categoría debe tener entre 1 y 50 caracteres'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidos'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Cada tag debe tener entre 1 y 20 caracteres'),

  body('visibility')
    .optional()
    .isIn(['public', 'private', 'invite_only'])
    .withMessage('Visibilidad inválida'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'deleted'])
    .withMessage('Estado de tribu inválido'),

  body('location')
    .optional()
    .isObject()
    .withMessage('La ubicación debe ser un objeto'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array de 2 elementos'),

  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180'),

  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90'),

  body('location.address')
    .optional()
    .isObject()
    .withMessage('La dirección debe ser un objeto'),

  handleValidationErrors,
];

// Post validation rules
const validatePostCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido del post debe tener entre 1 y 5000 caracteres'),

  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'link', 'poll', 'event'])
    .withMessage('Tipo de post inválido'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidos'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Cada tag debe tener entre 1 y 20 caracteres'),

  body('event')
    .optional()
    .isMongoId()
    .withMessage('ID de evento inválido'),

  body('tribe')
    .optional()
    .isMongoId()
    .withMessage('ID de tribu inválido'),

  body('location')
    .optional()
    .isObject()
    .withMessage('La ubicación debe ser un objeto'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array de 2 elementos'),

  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180'),

  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90'),

  body('location.address')
    .optional()
    .isObject()
    .withMessage('La dirección debe ser un objeto'),

  handleValidationErrors,
];

// Post update validation rules
const validatePostUpdate = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido del post debe tener entre 1 y 5000 caracteres'),

  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'link', 'poll', 'event'])
    .withMessage('Tipo de post inválido'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidos'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Cada tag debe tener entre 1 y 20 caracteres'),

  body('status')
    .optional()
    .isIn(['active', 'draft', 'archived', 'deleted'])
    .withMessage('Estado de post inválido'),

  handleValidationErrors,
];

// Comment creation validation rules
const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido del comentario debe tener entre 1 y 1000 caracteres'),

  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('ID de comentario padre inválido'),

  handleValidationErrors,
];

// Comment update validation rules
const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido del comentario debe tener entre 1 y 1000 caracteres'),

  handleValidationErrors,
];

// Chat validation rules
const validateChatMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El mensaje debe tener entre 1 y 5000 caracteres'),

  body('type')
    .optional()
    .isIn([
      'text',
      'image',
      'video',
      'audio',
      'file',
      'location',
      'event',
      'tribe',
    ])
    .withMessage('Tipo de mensaje inválido'),

  body('replyTo.message')
    .optional()
    .isMongoId()
    .withMessage('ID de mensaje de respuesta inválido'),

  handleValidationErrors,
];

// Review creation validation rules
const validateReviewCreation = [
  body('eventId')
    .isMongoId()
    .withMessage('ID de evento inválido'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),

  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('El contenido debe tener entre 10 y 2000 caracteres'),

  body('categories')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Máximo 5 categorías permitidas'),

  body('categories.*')
    .optional()
    .isIn([
      'overall',
      'organization',
      'communication',
      'value',
      'atmosphere',
      'location',
      'food',
      'entertainment',
      'accessibility',
    ])
    .withMessage('Categoría de calificación inválida'),

  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('El campo anónimo debe ser un booleano'),

  handleValidationErrors,
];

// Review update validation rules
const validateReviewUpdate = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('El contenido debe tener entre 10 y 2000 caracteres'),

  body('categories')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Máximo 5 categorías permitidas'),

  body('categories.*')
    .optional()
    .isIn([
      'overall',
      'organization',
      'communication',
      'value',
      'atmosphere',
      'location',
      'food',
      'entertainment',
      'accessibility',
    ])
    .withMessage('Categoría de calificación inválida'),

  body('status')
    .optional()
    .isIn(['active', 'pending', 'moderated', 'deleted'])
    .withMessage('Estado de review inválido'),

  handleValidationErrors,
];

// Reply creation validation rules
const validateReplyCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('El contenido de la respuesta debe tener entre 1 y 500 caracteres'),

  body('parentReply')
    .optional()
    .isMongoId()
    .withMessage('ID de respuesta padre inválido'),

  handleValidationErrors,
];

// Reply update validation rules
const validateReplyUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('El contenido de la respuesta debe tener entre 1 y 500 caracteres'),

  handleValidationErrors,
];

// Search validation rules
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),

  query('type')
    .optional()
    .isIn(['events', 'tribes', 'users', 'posts', 'all'])
    .withMessage('Tipo de búsqueda inválido'),

  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Categoría inválida'),

  query('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage(
      'Las coordenadas de ubicación deben ser un array de 2 elementos'
    ),

  query('radius')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El radio debe ser un número entre 0 y 100'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  handleValidationErrors,
];

// Pagination validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),

  query('sort')
    .optional()
    .isIn([
      'createdAt',
      'updatedAt',
      'name',
      'title',
      'date',
      'popularity',
      'rating',
    ])
    .withMessage('Campo de ordenamiento inválido'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden inválido (debe ser asc o desc)'),

  handleValidationErrors,
];

// ID validation rules
const validateMongoId = paramName => [
  param(paramName).isMongoId().withMessage('ID inválido'),

  handleValidationErrors,
];

// File upload validation
const validateFileUpload = [
  body('file').custom((value, { req }) => {
    if (!req.file) {
      throw new Error('Archivo requerido');
    }

    // Check file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo no puede exceder 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error(
        'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'
      );
    }

    return true;
  }),

  handleValidationErrors,
];

// Location validation
const validateLocation = [
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage(
      'Las coordenadas deben ser un array de 2 elementos [longitud, latitud]'
    ),

  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180'),

  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90'),

  body('location.address')
    .optional()
    .isObject()
    .withMessage('La dirección debe ser un objeto'),

  handleValidationErrors,
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    ),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
    .withMessage('Las contraseñas no coinciden'),

  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),

  handleValidationErrors,
];

// Password reset with token validation
const validatePasswordResetWithToken = [
  body('token')
    .notEmpty()
    .withMessage('El token de restablecimiento es requerido'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    ),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
    .withMessage('Las contraseñas no coinciden'),

  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  sanitizeHtmlContent,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validatePasswordReset,
  validatePasswordResetWithToken,
  validateEventCreation,
  validateEventUpdate,
  validateTribeCreation,
  validateTribeUpdate,
  validatePostCreation,
  validatePostUpdate,
  validateCommentCreation,
  validateCommentUpdate,
  validateChatMessage,
  validateReviewCreation,
  validateReviewUpdate,
  validateReplyCreation,
  validateReplyUpdate,
  validateSearch,
  validatePagination,
  validateMongoId,
  validateFileUpload,
  validateLocation,
};

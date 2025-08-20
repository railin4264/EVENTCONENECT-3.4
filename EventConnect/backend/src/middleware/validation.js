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

// Tribe validation rules
const validateTribeCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de la tribu debe tener entre 1 y 100 caracteres'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage(
      'La descripción de la tribu debe tener entre 10 y 2000 caracteres'
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
      'professional',
      'hobby',
      'support',
      'local',
      'online',
      'other',
    ])
    .withMessage('Categoría de tribu inválida'),

  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La subcategoría no puede exceder 100 caracteres'),

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

  body('tags').optional().isArray().withMessage('Los tags deben ser un array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Cada tag no puede exceder 30 caracteres'),

  body('settings.privacy')
    .optional()
    .isIn(['public', 'private', 'secret'])
    .withMessage('Configuración de privacidad inválida'),

  body('settings.membership')
    .optional()
    .isIn(['open', 'approval_required', 'invite_only'])
    .withMessage('Configuración de membresía inválida'),

  handleValidationErrors,
];

// Post validation rules
const validatePostCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('El contenido del post debe tener entre 1 y 10000 caracteres'),

  body('type')
    .optional()
    .isIn([
      'text',
      'image',
      'video',
      'link',
      'event',
      'tribe',
      'poll',
      'article',
    ])
    .withMessage('Tipo de post inválido'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder 200 caracteres'),

  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'tribe_only', 'private'])
    .withMessage('Visibilidad inválida'),

  body('tags').optional().isArray().withMessage('Los tags deben ser un array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Cada tag no puede exceder 30 caracteres'),

  body('poll.question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(
      'La pregunta de la encuesta debe tener entre 1 y 200 caracteres'
    ),

  body('poll.options')
    .optional()
    .isArray({ min: 2, max: 10 })
    .withMessage('La encuesta debe tener entre 2 y 10 opciones'),

  body('poll.options.*.text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      'Cada opción de la encuesta debe tener entre 1 y 100 caracteres'
    ),

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

// Review validation rules
const validateReviewCreation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entero entre 1 y 5'),

  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El comentario debe tener entre 10 y 1000 caracteres'),

  body('eventId').isMongoId().withMessage('ID de evento inválido'),

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

module.exports = {
  handleValidationErrors,
  sanitizeHtmlContent,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEventCreation,
  validateEventUpdate,
  validateTribeCreation,
  validatePostCreation,
  validateChatMessage,
  validateReviewCreation,
  validateSearch,
  validatePagination,
  validateMongoId,
  validateFileUpload,
  validateLocation,
};

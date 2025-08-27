const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Configuración de almacenamiento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'video/mp4': true,
    'video/avi': true,
    'video/mov': true,
    'video/wmv': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 5 // máximo 5 archivos por request
  }
});

/**
 * Middleware para subida de imágenes
 */
const uploadImages = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'eventImages', maxCount: 10 },
  { name: 'tribeImages', maxCount: 5 },
  { name: 'postImages', maxCount: 5 }
]);

/**
 * Middleware para subida de documentos
 */
const uploadDocuments = upload.fields([
  { name: 'documents', maxCount: 5 },
  { name: 'certificates', maxCount: 3 }
]);

/**
 * Middleware para subida de videos
 */
const uploadVideos = upload.fields([
  { name: 'eventVideos', maxCount: 3 },
  { name: 'promotionalVideos', maxCount: 2 }
]);

/**
 * Middleware para subida de archivos mixtos
 */
const uploadMixed = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 },
  { name: 'documents', maxCount: 5 }
]);

/**
 * Middleware para manejar errores de upload
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 10MB permitido.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Revisa los límites permitidos.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido. Solo se permiten imágenes, videos y documentos.'
    });
  }
  
  logger.error('Error en upload:', error);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor durante la subida de archivos.'
  });
};

/**
 * Middleware para validar archivos después del upload
 */
const validateUploadedFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No se han subido archivos.'
    });
  }
  
  // Validar que los archivos se subieron correctamente
  for (const fieldName in req.files) {
    const files = req.files[fieldName];
    
    for (const file of files) {
      if (!file.filename || !file.path) {
        return res.status(400).json({
          success: false,
          message: 'Error en la subida de archivos.'
        });
      }
    }
  }
  
  next();
};

/**
 * Middleware para limpiar archivos en caso de error
 */
const cleanupUploadedFiles = (req, res, next) => {
  // Guardar referencia a los archivos subidos
  const uploadedFiles = req.files ? Object.values(req.files).flat() : [];
  
  // Agregar función de limpieza al response
  res.locals.cleanupFiles = () => {
    uploadedFiles.forEach(file => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          logger.info(`Archivo eliminado: ${file.path}`);
        } catch (error) {
          logger.error(`Error eliminando archivo ${file.path}:`, error);
        }
      }
    });
  };
  
  next();
};

/**
 * Middleware para procesar metadatos de archivos
 */
const processFileMetadata = (req, res, next) => {
  if (req.files) {
    for (const fieldName in req.files) {
      const files = req.files[fieldName];
      
      files.forEach(file => {
        // Agregar metadatos útiles
        file.metadata = {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: req.user ? req.user._id : null
        };
      });
    }
  }
  
  next();
};

module.exports = {
  upload,
  uploadImages,
  uploadDocuments,
  uploadVideos,
  uploadMixed,
  handleUploadError,
  validateUploadedFiles,
  cleanupUploadedFiles,
  processFileMetadata
};
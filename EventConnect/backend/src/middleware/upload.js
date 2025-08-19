const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create subdirectories based on file type
    let subDir = 'general';
    if (file.fieldname === 'avatar') {
      subDir = 'avatars';
    } else if (file.fieldname === 'banner') {
      subDir = 'banners';
    } else if (file.fieldname === 'event') {
      subDir = 'events';
    } else if (file.fieldname === 'tribe') {
      subDir = 'tribes';
    } else if (file.fieldname === 'post') {
      subDir = 'posts';
    }

    const finalDir = path.join(uploadDir, subDir);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    cb(null, finalDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'video/mp4': true,
    'video/avi': true,
    'video/mov': true,
    'video/wmv': true,
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/ogg': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
  };

  if (allowedMimeTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Max 5 files per request
  }
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Multiple fields upload middleware
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Specific upload middlewares
const uploadAvatar = uploadSingle('avatar');
const uploadBanner = uploadSingle('banner');
const uploadEventImages = uploadMultiple('images', 10);
const uploadTribeImages = uploadMultiple('images', 5);
const uploadPostMedia = uploadMultiple('media', 10);

// Profile images upload
const uploadProfileImages = uploadFields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Event upload
const uploadEvent = uploadFields([
  { name: 'images', maxCount: 10 },
  { name: 'banner', maxCount: 1 }
]);

// Tribe upload
const uploadTribe = uploadFields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Post upload
const uploadPost = uploadFields([
  { name: 'media', maxCount: 10 },
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]);

// Error handling middleware for multer
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
        message: 'Demasiados archivos. Máximo 5 archivos permitidos.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado.'
      });
    }
  }

  if (error.message && error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// File validation middleware
const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No se proporcionó ningún archivo'
    });
  }

  // Check if files exist
  if (req.files) {
    const fileFields = Object.keys(req.files);
    for (const field of fileFields) {
      if (!req.files[field] || req.files[field].length === 0) {
        return res.status(400).json({
          success: false,
          message: `No se proporcionó archivo para el campo '${field}'`
        });
      }
    }
  }

  next();
};

// File size validation
const validateFileSize = (maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    const files = req.files ? Object.values(req.files).flat() : [req.file];
    
    for (const file of files) {
      if (file && file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `El archivo '${file.originalname}' es demasiado grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB permitido.`
        });
      }
    }

    next();
  };
};

// File type validation
const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    const files = req.files ? Object.values(req.files).flat() : [req.file];
    
    for (const file of files) {
      if (file && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${allowedTypes.join(', ')}`
        });
      }
    }

    next();
  };
};

// Image validation (only images)
const validateImage = validateFileType([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]);

// Video validation (only videos)
const validateVideo = validateFileType([
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv'
]);

// Document validation (only documents)
const validateDocument = validateFileType([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

// Clean up uploaded files on error
const cleanupFiles = (req, res, next) => {
  // Store original send method
  const originalSend = res.send;
  
  // Override send method to clean up files on error
  res.send = function(data) {
    if (res.statusCode >= 400) {
      // Clean up uploaded files on error
      const files = req.files ? Object.values(req.files).flat() : [req.file];
      files.forEach(file => {
        if (file && file.path) {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }
      });
    }
    
    // Call original send method
    originalSend.call(this, data);
  };
  
  next();
};

// Generate file URL
const generateFileUrl = (file, baseUrl = '') => {
  if (!file) return null;
  
  const relativePath = file.path.replace(path.join(__dirname, '../../uploads'), '');
  return `${baseUrl}/uploads${relativePath}`;
};

// Delete file from filesystem
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file info
const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  };
};

// Get files info
const getFilesInfo = (files) => {
  if (!files) return [];
  
  const fileArray = Array.isArray(files) ? files : Object.values(files).flat();
  return fileArray.map(file => getFileInfo(file));
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadAvatar,
  uploadBanner,
  uploadEventImages,
  uploadTribeImages,
  uploadPostMedia,
  uploadProfileImages,
  uploadEvent,
  uploadTribe,
  uploadPost,
  handleUploadError,
  validateFile,
  validateFileSize,
  validateFileType,
  validateImage,
  validateVideo,
  validateDocument,
  cleanupFiles,
  generateFileUrl,
  deleteFile,
  getFileInfo,
  getFilesInfo
};
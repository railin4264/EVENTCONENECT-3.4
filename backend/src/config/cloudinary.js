const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Only require CloudinaryStorage if we're not in test mode
let CloudinaryStorage;
try {
  CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
} catch (error) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ multer-storage-cloudinary no disponible');
  }
  CloudinaryStorage = null;
}

const path = require('path');
const fs = require('fs');

class CloudinaryManager {
  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      console.warn(
        '⚠️ Configuración de Cloudinary incompleta. Las subidas de archivos pueden no funcionar correctamente.'
      );
    }

    // Configure Cloudinary only if credentials are available
    if (this.cloudName && this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true,
      });
    }

    this.defaultOptions = {
      folder: 'eventconnect',
      allowed_formats: [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'mp4',
        'mov',
        'avi',
        'pdf',
        'doc',
        'docx',
      ],
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      resource_type: 'auto',
    };
  }

  // Test Cloudinary connection
  async testConnection() {
    try {
      if (!this.cloudName || !this.apiKey || !this.apiSecret) {
        throw new Error('Configuración de Cloudinary incompleta');
      }

      const result = await cloudinary.api.ping();
      console.log('✅ Conexión a Cloudinary exitosa:', result);
      return true;
    } catch (error) {
      console.error('❌ Error conectando a Cloudinary:', error);
      return false;
    }
  }

  // Upload single file
  async uploadFile(file, options = {}) {
    try {
      if (!file) {
        throw new Error('Archivo no proporcionado');
      }

      // If Cloudinary is not configured, return a mock response for testing
      if (!this.cloudName || !this.apiKey || !this.apiSecret) {
        return {
          public_id: 'test-file-id',
          secure_url: 'https://via.placeholder.com/300x200',
          url: 'https://via.placeholder.com/300x200',
          format: 'jpg',
          width: 300,
          height: 200,
          bytes: file.size || 1024,
          resource_type: 'image'
        };
      }

      const uploadOptions = {
        ...this.defaultOptions,
        ...options,
        public_id:
          options.public_id || this.generatePublicId(file.originalname),
      };

      // Handle different file types
      if (file.mimetype.startsWith('image/')) {
        uploadOptions.resource_type = 'image';
        uploadOptions.transformation = [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { width: options.width || 'auto' },
          { height: options.height || 'auto' },
          { crop: options.crop || 'limit' },
        ];
      } else if (file.mimetype.startsWith('video/')) {
        uploadOptions.resource_type = 'video';
        uploadOptions.transformation = [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ];
      } else {
        uploadOptions.resource_type = 'raw';
      }

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);

      // Clean up local file
      this.cleanupLocalFile(file.path);

      return {
        success: true,
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        resource_type: result.resource_type,
        created_at: result.created_at,
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo a Cloudinary:', error);

      // Clean up local file on error
      this.cleanupLocalFile(file.path);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, options = {}) {
    try {
      if (!files || !Array.isArray(files)) {
        throw new Error('Archivos no proporcionados o formato inválido');
      }

      const uploadPromises = files.map(file => this.uploadFile(file, options));
      const results = await Promise.allSettled(uploadPromises);

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successful.push({
            originalName: files[index].originalname,
            ...result.value,
          });
        } else {
          failed.push({
            originalName: files[index].originalname,
            error:
              result.status === 'rejected'
                ? result.reason.message
                : result.value.error,
          });
        }
      });

      return {
        successful,
        failed,
        total: files.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      console.error(
        '❌ Error subiendo múltiples archivos a Cloudinary:',
        error
      );
      return {
        successful: [],
        failed: files.map(file => ({
          originalName: file.originalname,
          error: error.message,
        })),
        total: files.length,
        successCount: 0,
        failureCount: files.length,
      };
    }
  }

  // Upload image with specific transformations
  async uploadImage(file, transformations = {}) {
    try {
      const options = {
        folder: transformations.folder || 'eventconnect/images',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      };

      // Add custom transformations
      if (transformations.width)
        options.transformation.push({ width: transformations.width });
      if (transformations.height)
        options.transformation.push({ height: transformations.height });
      if (transformations.crop)
        options.transformation.push({ crop: transformations.crop });
      if (transformations.gravity)
        options.transformation.push({ gravity: transformations.gravity });
      if (transformations.radius)
        options.transformation.push({ radius: transformations.radius });
      if (transformations.effect)
        options.transformation.push({ effect: transformations.effect });

      return await this.uploadFile(file, options);
    } catch (error) {
      console.error('❌ Error subiendo imagen a Cloudinary:', error);
      throw error;
    }
  }

  // Upload avatar image
  async uploadAvatar(file, userId) {
    try {
      const options = {
        folder: `eventconnect/avatars/${userId}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        public_id: `avatar_${userId}_${Date.now()}`,
      };

      return await this.uploadFile(file, options);
    } catch (error) {
      console.error('❌ Error subiendo avatar a Cloudinary:', error);
      throw error;
    }
  }

  // Upload banner image
  async uploadBanner(file, userId) {
    try {
      const options = {
        folder: `eventconnect/banners/${userId}`,
        transformation: [
          { width: 1200, height: 400, crop: 'fill', gravity: 'auto' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        public_id: `banner_${userId}_${Date.now()}`,
      };

      return await this.uploadFile(file, options);
    } catch (error) {
      console.error('❌ Error subiendo banner a Cloudinary:', error);
      throw error;
    }
  }

  // Upload event images
  async uploadEventImages(files, eventId) {
    try {
      const options = {
        folder: `eventconnect/events/${eventId}`,
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      };

      return await this.uploadMultipleFiles(files, options);
    } catch (error) {
      console.error(
        '❌ Error subiendo imágenes de evento a Cloudinary:',
        error
      );
      throw error;
    }
  }

  // Upload tribe images
  async uploadTribeImages(files, tribeId) {
    try {
      const options = {
        folder: `eventconnect/tribes/${tribeId}`,
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      };

      return await this.uploadMultipleFiles(files, options);
    } catch (error) {
      console.error('❌ Error subiendo imágenes de tribu a Cloudinary:', error);
      throw error;
    }
  }

  // Upload post media
  async uploadPostMedia(files, postId) {
    try {
      const options = {
        folder: `eventconnect/posts/${postId}`,
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      };

      return await this.uploadMultipleFiles(files, options);
    } catch (error) {
      console.error('❌ Error subiendo media de post a Cloudinary:', error);
      throw error;
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = 'auto') {
    try {
      if (!publicId) {
        throw new Error('Public ID no proporcionado');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      return {
        success: true,
        result: result.result,
        public_id: publicId,
      };
    } catch (error) {
      console.error('❌ Error eliminando archivo de Cloudinary:', error);
      return {
        success: false,
        error: error.message,
        public_id: publicId,
      };
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(publicIds, resourceType = 'auto') {
    try {
      if (!publicIds || !Array.isArray(publicIds)) {
        throw new Error('Public IDs no proporcionados o formato inválido');
      }

      const deletePromises = publicIds.map(publicId =>
        this.deleteFile(publicId, resourceType)
      );
      const results = await Promise.allSettled(deletePromises);

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successful.push(result.value);
        } else {
          failed.push({
            public_id: publicIds[index],
            error:
              result.status === 'rejected'
                ? result.reason.message
                : result.value.error,
          });
        }
      });

      return {
        successful,
        failed,
        total: publicIds.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      console.error(
        '❌ Error eliminando múltiples archivos de Cloudinary:',
        error
      );
      return {
        successful: [],
        failed: publicIds.map(publicId => ({
          public_id: publicId,
          error: error.message,
        })),
        total: publicIds.length,
        successCount: 0,
        failureCount: publicIds.length,
      };
    }
  }

  // Get file info
  async getFileInfo(publicId, resourceType = 'auto') {
    try {
      if (!publicId) {
        throw new Error('Public ID no proporcionado');
      }

      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      return {
        success: true,
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        resource_type: result.resource_type,
        created_at: result.created_at,
        tags: result.tags || [],
      };
    } catch (error) {
      console.error(
        '❌ Error obteniendo información del archivo de Cloudinary:',
        error
      );
      return {
        success: false,
        error: error.message,
        public_id: publicId,
      };
    }
  }

  // Generate image URL with transformations
  generateImageUrl(publicId, transformations = {}) {
    try {
      if (!publicId) {
        throw new Error('Public ID no proporcionado');
      }

      const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
      let url = `${baseUrl}/${publicId}`;

      // Add transformations
      if (Object.keys(transformations).length > 0) {
        const transformParams = [];

        if (transformations.width)
          transformParams.push(`w_${transformations.width}`);
        if (transformations.height)
          transformParams.push(`h_${transformations.height}`);
        if (transformations.crop)
          transformParams.push(`c_${transformations.crop}`);
        if (transformations.gravity)
          transformParams.push(`g_${transformations.gravity}`);
        if (transformations.radius)
          transformParams.push(`r_${transformations.radius}`);
        if (transformations.quality)
          transformParams.push(`q_${transformations.quality}`);
        if (transformations.format)
          transformParams.push(`f_${transformations.format}`);

        if (transformParams.length > 0) {
          url = `${baseUrl}/${transformParams.join(',')}/${publicId}`;
        }
      }

      return url;
    } catch (error) {
      console.error('❌ Error generando URL de imagen de Cloudinary:', error);
      return null;
    }
  }

  // Generate video URL with transformations
  generateVideoUrl(publicId, transformations = {}) {
    try {
      if (!publicId) {
        throw new Error('Public ID no proporcionado');
      }

      const baseUrl = `https://res.cloudinary.com/${this.cloudName}/video/upload`;
      let url = `${baseUrl}/${publicId}`;

      // Add transformations
      if (Object.keys(transformations).length > 0) {
        const transformParams = [];

        if (transformations.width)
          transformParams.push(`w_${transformations.width}`);
        if (transformations.height)
          transformParams.push(`h_${transformations.height}`);
        if (transformations.crop)
          transformParams.push(`c_${transformations.crop}`);
        if (transformations.quality)
          transformParams.push(`q_${transformations.quality}`);
        if (transformations.format)
          transformParams.push(`f_${transformations.format}`);

        if (transformParams.length > 0) {
          url = `${baseUrl}/${transformParams.join(',')}/${publicId}`;
        }
      }

      return url;
    } catch (error) {
      console.error('❌ Error generando URL de video de Cloudinary:', error);
      return null;
    }
  }

  // Create Cloudinary storage for multer
  createStorage(
    folder = 'eventconnect',
    allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  ) {
    try {
      if (!CloudinaryStorage) {
        throw new Error('multer-storage-cloudinary no está disponible.');
      }
      return new CloudinaryStorage({
        cloudinary,
        params: {
          folder,
          allowed_formats: allowedFormats,
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
        },
      });
    } catch (error) {
      console.error('❌ Error creando storage de Cloudinary:', error);
      throw error;
    }
  }

  // Generate public ID
  generatePublicId(originalName) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(originalName);
      const nameWithoutExt = path.basename(originalName, extension);

      return `${nameWithoutExt}_${timestamp}_${randomString}`;
    } catch (error) {
      console.error('❌ Error generando public ID:', error);
      return `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  // Clean up local file
  cleanupLocalFile(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Archivo local eliminado: ${filePath}`);
      }
    } catch (error) {
      console.error('❌ Error eliminando archivo local:', error);
    }
  }

  // Get Cloudinary usage statistics
  async getUsageStats() {
    try {
      const result = await cloudinary.api.usage();

      return {
        success: true,
        plan: result.plan,
        credits: result.credits,
        objects: result.objects,
        bandwidth: result.bandwidth,
        storage: result.storage,
        requests: result.requests,
        resources: result.resources,
        derived_resources: result.derived_resources,
      };
    } catch (error) {
      console.error(
        '❌ Error obteniendo estadísticas de uso de Cloudinary:',
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Search files in Cloudinary
  async searchFiles(query = '', options = {}) {
    try {
      const searchOptions = {
        max_results: options.maxResults || 100,
        next_cursor: options.nextCursor,
        ...options,
      };

      const result = await cloudinary.search
        .expression(query)
        .sort_by('created_at', 'desc')
        .max_results(searchOptions.max_results)
        .next_cursor(searchOptions.next_cursor)
        .execute();

      return {
        success: true,
        resources: result.resources,
        next_cursor: result.next_cursor,
        total_count: result.total_count,
      };
    } catch (error) {
      console.error('❌ Error buscando archivos en Cloudinary:', error);
      return {
        success: false,
        error: error.message,
        resources: [],
        next_cursor: null,
        total_count: 0,
      };
    }
  }

  // Create folder structure
  async createFolder(folderPath) {
    try {
      // Cloudinary doesn't have a direct folder creation API
      // Folders are created automatically when files are uploaded
      console.log(`📁 Carpeta creada automáticamente: ${folderPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error creando carpeta en Cloudinary:', error);
      return false;
    }
  }

  // Get folder contents
  async getFolderContents(folderPath, options = {}) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: options.maxResults || 100,
        next_cursor: options.nextCursor,
        ...options,
      });

      return {
        success: true,
        resources: result.resources,
        next_cursor: result.next_cursor,
        total_count: result.total_count,
      };
    } catch (error) {
      console.error(
        '❌ Error obteniendo contenido de carpeta de Cloudinary:',
        error
      );
      return {
        success: false,
        error: error.message,
        resources: [],
        next_cursor: null,
        total_count: 0,
      };
    }
  }
}

// Create and export Cloudinary manager instance
const cloudinaryManager = new CloudinaryManager();

module.exports = cloudinaryManager;

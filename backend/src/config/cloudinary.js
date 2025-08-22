const fs = require('fs');

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary service class
/**
 *
 */
class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param {string} filePath - Path to the image file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options.folder || 'eventconnect',
        transformation: options.transformation || [],
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        resource_type: 'image',
        ...options,
      });

      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }

  /**
   * Upload video to Cloudinary
   * @param {string} filePath - Path to the video file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadVideo(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options.folder || 'eventconnect/videos',
        resource_type: 'video',
        transformation: options.transformation || [],
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        ...options,
      });

      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        duration: result.duration,
        size: result.bytes,
      };
    } catch (error) {
      console.error('Error uploading video to Cloudinary:', error);
      throw new Error(`Error uploading video: ${error.message}`);
    }
  }

  /**
   * Upload file to Cloudinary
   * @param {string} filePath - Path to the file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options.folder || 'eventconnect/files',
        resource_type: 'auto',
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        ...options,
      });

      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - Public ID of the file
   * @param {string} resourceType - Type of resource (image, video, raw)
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result === 'ok') {
        return {
          success: true,
          message: 'File deleted successfully',
        };
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * Transform image with Cloudinary transformations
   * @param {string} publicId - Public ID of the image
   * @param {Array} transformations - Array of transformations
   * @returns {string} Transformed image URL
   */
  transformImage(publicId, transformations = []) {
    try {
      return cloudinary.url(publicId, {
        transformation: transformations,
        secure: true,
      });
    } catch (error) {
      console.error('Error transforming image:', error);
      throw new Error(`Error transforming image: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail from video
   * @param {string} publicId - Public ID of the video
   * @param {Object} options - Thumbnail options
   * @returns {string} Thumbnail URL
   */
  generateVideoThumbnail(publicId, options = {}) {
    try {
      const defaultOptions = {
        width: 300,
        height: 200,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        format: 'jpg',
      };

      const thumbnailOptions = { ...defaultOptions, ...options };

      return cloudinary.url(publicId, {
        transformation: [
          {
            width: thumbnailOptions.width,
            height: thumbnailOptions.height,
            crop: thumbnailOptions.crop,
            gravity: thumbnailOptions.gravity,
            quality: thumbnailOptions.quality,
            format: thumbnailOptions.format,
          },
        ],
        resource_type: 'video',
        secure: true,
      });
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      throw new Error(`Error generating thumbnail: ${error.message}`);
    }
  }

  /**
   * Optimize image for web
   * @param {string} publicId - Public ID of the image
   * @param {Object} options - Optimization options
   * @returns {string} Optimized image URL
   */
  optimizeImage(publicId, options = {}) {
    try {
      const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        strip: true,
      };

      const optimizationOptions = { ...defaultOptions, ...options };

      return cloudinary.url(publicId, {
        transformation: [
          {
            quality: optimizationOptions.quality,
            fetch_format: optimizationOptions.fetch_format,
            strip: optimizationOptions.strip,
          },
        ],
        secure: true,
      });
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw new Error(`Error optimizing image: ${error.message}`);
    }
  }

  /**
   * Create responsive images with multiple sizes
   * @param {string} publicId - Public ID of the image
   * @param {Array} sizes - Array of sizes
   * @returns {Object} Responsive image URLs
   */
  createResponsiveImages(publicId, sizes = [300, 600, 900, 1200]) {
    try {
      const responsiveImages = {};

      sizes.forEach(size => {
        responsiveImages[size] = cloudinary.url(publicId, {
          transformation: [
            {
              width: size,
              height: size,
              crop: 'fill',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
          secure: true,
        });
      });

      return responsiveImages;
    } catch (error) {
      console.error('Error creating responsive images:', error);
      throw new Error(`Error creating responsive images: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of file paths
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFiles(files, options = {}) {
    try {
      const uploadPromises = files.map(filePath =>
        this.uploadFile(filePath, options)
      );
      const results = await Promise.all(uploadPromises);

      return results;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error(`Error uploading multiple files: ${error.message}`);
    }
  }

  /**
   * Clean up temporary files
   * @param {Array} filePaths - Array of file paths to clean up
   */
  cleanupTempFiles(filePaths) {
    try {
      filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Get file information
   * @param {string} publicId - Public ID of the file
   * @param {string} resourceType - Type of resource
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      return {
        success: true,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        created_at: result.created_at,
        url: result.secure_url,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error(`Error getting file info: ${error.message}`);
    }
  }
}

// Create instance
const cloudinaryService = new CloudinaryService();

module.exports = {
  cloudinary,
  cloudinaryService,
  CloudinaryService,
};

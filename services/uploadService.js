import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import {
  optimizeImage,
  compressImageToSize,
  createThumbnail,
  getImageMetadata
} from '../utils/imageProcessor.js';
import logger from '../config/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadService {
  /**
   * Create temporary file from buffer
   * @param {Buffer} buffer - File buffer
   * @param {string} originalname - Original filename
   * @returns {Promise<string>} Temporary file path
   */
  async createTempFile(buffer, originalname) {
    const tempDir = os.tmpdir();
    const ext = path.extname(originalname);
    const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const tempPath = path.join(tempDir, filename);
    
    await fs.writeFile(tempPath, buffer);
    return tempPath;
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - File path to delete
   */
  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn(`Failed to cleanup temp file: ${error.message}`);
    }
  }

  /**
   * Upload and process image from buffer
   * @param {object} file - Multer file object with buffer
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  async uploadImage(file, options = {}) {
    let tempPath = null;
    let optimizedPath = null;
    let thumbPath = null;
    
    try {
      const {
        folder = 'elitehub',
        maxWidth = 1920,
        maxHeight = 1080,
        maxSizeKB = 500,
        createThumb = false,
        thumbSize = 200
      } = options;
      
      // Create temporary file from buffer
      tempPath = await this.createTempFile(file.buffer, file.originalname);
      
      // Get original metadata
      const originalMetadata = await getImageMetadata(tempPath);
      logger.info(`Original image: ${originalMetadata.width}x${originalMetadata.height}, ${originalMetadata.sizeKB}KB`);
      
      // Optimize image
      optimizedPath = tempPath.replace(path.extname(tempPath), '-optimized' + path.extname(tempPath));
      const optimizationResult = await optimizeImage(tempPath, optimizedPath, {
        maxWidth,
        maxHeight,
        maxSizeKB,
        quality: 85
      });
      
      // Read optimized file as buffer
      const optimizedBuffer = await fs.readFile(optimizedPath);
      
      // Upload optimized image to Cloudinary using buffer stream
      const uploadResult = await uploadBufferToCloudinary(optimizedBuffer, { folder });
      
      // Create thumbnail if requested
      let thumbnailUrl = null;
      if (createThumb) {
        thumbPath = tempPath.replace(path.extname(tempPath), '-thumb' + path.extname(tempPath));
        await createThumbnail(optimizedPath, thumbPath, thumbSize);
        
        const thumbBuffer = await fs.readFile(thumbPath);
        const thumbResult = await uploadBufferToCloudinary(thumbBuffer, { 
          folder: `${folder}/thumbnails` 
        });
        thumbnailUrl = thumbResult.url;
      }
      
      // Clean up temporary files
      await this.cleanupTempFile(tempPath);
      await this.cleanupTempFile(optimizedPath);
      if (thumbPath) await this.cleanupTempFile(thumbPath);
      
      return {
        success: true,
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          thumbnailUrl,
          originalSize: originalMetadata.size,
          optimizedSize: optimizationResult.optimizedSize,
          savings: optimizationResult.savings,
          dimensions: optimizationResult.dimensions
        }
      };
    } catch (error) {
      // Clean up on error
      if (tempPath) await this.cleanupTempFile(tempPath);
      if (optimizedPath) await this.cleanupTempFile(optimizedPath);
      if (thumbPath) await this.cleanupTempFile(thumbPath);
      
      logger.error(`Upload service error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload multiple images from buffers
   * @param {Array} files - Array of Multer file objects with buffers
   * @param {object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleImages(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadImage(file, options);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to upload ${file.originalname}: ${error.message}`);
        results.push({
          success: false,
          filename: file.originalname,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Upload image with specific size constraint from buffer
   * @param {object} file - Multer file object with buffer
   * @param {number} targetSizeKB - Target file size in KB
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  async uploadImageWithSizeLimit(file, targetSizeKB, options = {}) {
    let tempPath = null;
    let compressedPath = null;
    
    try {
      const { folder = 'elitehub' } = options;
      
      // Create temporary file from buffer
      tempPath = await this.createTempFile(file.buffer, file.originalname);
      
      // Compress to target size
      compressedPath = tempPath.replace(path.extname(tempPath), '-compressed' + path.extname(tempPath));
      const compressionResult = await compressImageToSize(tempPath, compressedPath, targetSizeKB);
      
      // Read compressed file as buffer
      const compressedBuffer = await fs.readFile(compressedPath);
      
      // Upload to Cloudinary using buffer stream
      const uploadResult = await uploadBufferToCloudinary(compressedBuffer, { folder });
      
      // Clean up
      await this.cleanupTempFile(tempPath);
      await this.cleanupTempFile(compressedPath);
      
      return {
        success: true,
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          size: compressionResult.size,
          quality: compressionResult.quality,
          resized: compressionResult.resized,
          dimensions: compressionResult.dimensions
        }
      };
    } catch (error) {
      if (tempPath) await this.cleanupTempFile(tempPath);
      if (compressedPath) await this.cleanupTempFile(compressedPath);
      
      logger.error(`Upload with size limit error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload buffer directly (already processed)
   * @param {Buffer} buffer - Processed image buffer
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  async uploadProcessedBuffer(buffer, options = {}) {
    try {
      const { folder = 'elitehub' } = options;
      
      const uploadResult = await uploadBufferToCloudinary(buffer, { folder });
      
      return {
        success: true,
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          size: buffer.length,
          format: uploadResult.format,
          dimensions: {
            width: uploadResult.width,
            height: uploadResult.height
          }
        }
      };
    } catch (error) {
      logger.error(`Upload processed buffer error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Replace existing image
   * @param {string} oldPublicId - Old Cloudinary public ID
   * @param {object} file - New Multer file object with buffer
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  async replaceImage(oldPublicId, file, options = {}) {
    try {
      // Upload new image
      const uploadResult = await this.uploadImage(file, options);
      
      // Delete old image
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId).catch(err => {
          logger.warn(`Failed to delete old image: ${err.message}`);
        });
      }
      
      return uploadResult;
    } catch (error) {
      logger.error(`Replace image error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete image
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<object>} Delete result
   */
  async deleteImage(publicId) {
    try {
      await deleteFromCloudinary(publicId);
      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } catch (error) {
      logger.error(`Delete image error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload profile image
   * @param {object} file - Multer file object with buffer
   * @param {string} userId - User ID
   * @returns {Promise<object>} Upload result
   */
  async uploadProfileImage(file, userId) {
    return this.uploadImage(file, {
      folder: `elitehub/profiles/${userId}`,
      maxWidth: 500,
      maxHeight: 500,
      maxSizeKB: 200,
      createThumb: true,
      thumbSize: 150
    });
  }

  /**
   * Upload room image
   * @param {object} file - Multer file object with buffer
   * @param {string} roomId - Room ID
   * @returns {Promise<object>} Upload result
   */
  async uploadRoomImage(file, roomId) {
    return this.uploadImage(file, {
      folder: `elitehub/rooms/${roomId}`,
      maxWidth: 1920,
      maxHeight: 1080,
      maxSizeKB: 800,
      createThumb: true,
      thumbSize: 300
    });
  }

  /**
   * Upload menu item image
   * @param {object} file - Multer file object with buffer
   * @param {string} menuItemId - Menu item ID
   * @returns {Promise<object>} Upload result
   */
  async uploadMenuItemImage(file, menuItemId) {
    return this.uploadImage(file, {
      folder: `elitehub/menu/${menuItemId}`,
      maxWidth: 800,
      maxHeight: 600,
      maxSizeKB: 300,
      createThumb: true,
      thumbSize: 200
    });
  }

  /**
   * Upload bar item image
   * @param {object} file - Multer file object with buffer
   * @param {string} barItemId - Bar item ID
   * @returns {Promise<object>} Upload result
   */
  async uploadBarItemImage(file, barItemId) {
    return this.uploadImage(file, {
      folder: `elitehub/bar/${barItemId}`,
      maxWidth: 600,
      maxHeight: 600,
      maxSizeKB: 250,
      createThumb: true,
      thumbSize: 150
    });
  }

  /**
   * Get upload statistics
   * @returns {object} Upload statistics
   */
  getUploadStats() {
    return {
      maxFileSizes: {
        profile: '200KB',
        room: '800KB',
        menu: '300KB',
        bar: '250KB',
        document: '20MB'
      },
      allowedFormats: {
        images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        documents: ['pdf', 'doc', 'docx', 'txt']
      },
      maxDimensions: {
        profile: '500x500',
        room: '1920x1080',
        menu: '800x600',
        bar: '600x600'
      },
      storageType: 'memory (buffer-based)',
      uploadMethod: 'stream to Cloudinary'
    };
  }
}

export default new UploadService();

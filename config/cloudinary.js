import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import logger from './logger.js';

/**
 * Configure Cloudinary
 */
const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    logger.info('✅ Cloudinary configured successfully');
    return cloudinary;
  } catch (error) {
    logger.error(`❌ Cloudinary configuration failed: ${error.message}`);
    throw error;
  }
};

// Initialize Cloudinary
const cloudinaryInstance = configureCloudinary();

/**
 * Upload buffer to Cloudinary using streams
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: options.folder || 'elitehub',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options
    };

    // Create upload stream
    const uploadStream = cloudinaryInstance.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message}`);
          return reject(new Error(`Failed to upload file: ${error.message}`));
        }

        logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
        
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes,
          createdAt: result.created_at
        });
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload image to Cloudinary (file path or buffer)
 * @param {string|Buffer} filePathOrBuffer - Local file path or buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePathOrBuffer, options = {}) => {
  try {
    // If it's a buffer, use stream upload
    if (Buffer.isBuffer(filePathOrBuffer)) {
      return await uploadBufferToCloudinary(filePathOrBuffer, options);
    }

    // Otherwise, use file path upload
    const defaultOptions = {
      folder: options.folder || 'elitehub',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options
    };

    const result = await cloudinaryInstance.uploader.upload(filePathOrBuffer, defaultOptions);
    
    logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinaryInstance.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info(`File deleted from Cloudinary: ${publicId}`);
      return { success: true, message: 'File deleted successfully' };
    } else {
      throw new Error('File not found or already deleted');
    }
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<object>} Delete result
 */
export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinaryInstance.api.delete_resources(publicIds);
    
    logger.info(`Multiple files deleted from Cloudinary: ${publicIds.length} files`);
    
    return {
      success: true,
      deleted: result.deleted,
      deletedCount: Object.keys(result.deleted).length
    };
  } catch (error) {
    logger.error(`Cloudinary bulk delete error: ${error.message}`);
    throw new Error(`Failed to delete files: ${error.message}`);
  }
};

/**
 * Get image details from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Image details
 */
export const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinaryInstance.api.resource(publicId);
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    logger.error(`Cloudinary get details error: ${error.message}`);
    throw new Error(`Failed to get image details: ${error.message}`);
  }
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };

  return cloudinaryInstance.url(publicId, defaultTransformations);
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (publicId, width = 200, height = 200) => {
  return cloudinaryInstance.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

/**
 * Upload base64 image to Cloudinary
 * @param {string} base64String - Base64 encoded image
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadBase64ToCloudinary = async (base64String, options = {}) => {
  try {
    const defaultOptions = {
      folder: options.folder || 'elitehub',
      resource_type: 'auto',
      ...options
    };

    const result = await cloudinaryInstance.uploader.upload(base64String, defaultOptions);
    
    logger.info(`Base64 image uploaded to Cloudinary: ${result.public_id}`);
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes
    };
  } catch (error) {
    logger.error(`Cloudinary base64 upload error: ${error.message}`);
    throw new Error(`Failed to upload base64 image: ${error.message}`);
  }
};

/**
 * Upload multiple buffers to Cloudinary
 * @param {Buffer[]} buffers - Array of file buffers
 * @param {object} options - Upload options
 * @returns {Promise<object[]>} Array of upload results
 */
export const uploadMultipleBuffers = async (buffers, options = {}) => {
  try {
    const uploadPromises = buffers.map(buffer => 
      uploadBufferToCloudinary(buffer, options)
    );
    
    const results = await Promise.all(uploadPromises);
    logger.info(`Uploaded ${results.length} files to Cloudinary`);
    
    return results;
  } catch (error) {
    logger.error(`Multiple buffer upload error: ${error.message}`);
    throw new Error(`Failed to upload multiple files: ${error.message}`);
  }
};

export default cloudinaryInstance;

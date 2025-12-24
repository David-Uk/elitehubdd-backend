import { Jimp } from 'jimp';
import logger from '../config/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Resize image to specific dimensions
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<string>} Output file path
 */
export const resizeImage = async (inputPath, outputPath, width, height) => {
  try {
    const image = await Jimp.read(inputPath);
    
    await image
      .resize(width, height)
      .quality(90)
      .writeAsync(outputPath);
    
    logger.info(`Image resized: ${width}x${height}`);
    return outputPath;
  } catch (error) {
    logger.error(`Image resize error: ${error.message}`);
    throw new Error(`Failed to resize image: ${error.message}`);
  }
};

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<string>} Output file path
 */
export const resizeImageToFit = async (inputPath, outputPath, maxWidth, maxHeight) => {
  try {
    const image = await Jimp.read(inputPath);
    
    await image
      .scaleToFit(maxWidth, maxHeight)
      .quality(90)
      .writeAsync(outputPath);
    
    logger.info(`Image resized to fit: ${maxWidth}x${maxHeight}`);
    return outputPath;
  } catch (error) {
    logger.error(`Image resize to fit error: ${error.message}`);
    throw new Error(`Failed to resize image: ${error.message}`);
  }
};

/**
 * Resize image to cover dimensions (crop if necessary)
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<string>} Output file path
 */
export const resizeImageToCover = async (inputPath, outputPath, width, height) => {
  try {
    const image = await Jimp.read(inputPath);
    
    await image
      .cover(width, height)
      .quality(90)
      .writeAsync(outputPath);
    
    logger.info(`Image resized to cover: ${width}x${height}`);
    return outputPath;
  } catch (error) {
    logger.error(`Image resize to cover error: ${error.message}`);
    throw new Error(`Failed to resize image: ${error.message}`);
  }
};

/**
 * Compress image to target file size
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {number} targetSizeKB - Target file size in KB
 * @returns {Promise<object>} Result with output path and final size
 */
export const compressImageToSize = async (inputPath, outputPath, targetSizeKB) => {
  try {
    const image = await Jimp.read(inputPath);
    let quality = 90;
    let currentSize = 0;
    const targetSize = targetSizeKB * 1024; // Convert to bytes
    
    // Try different quality levels to achieve target size
    while (quality > 10) {
      await image.quality(quality).writeAsync(outputPath);
      
      const stats = await fs.stat(outputPath);
      currentSize = stats.size;
      
      if (currentSize <= targetSize) {
        logger.info(`Image compressed to ${(currentSize / 1024).toFixed(2)}KB with quality ${quality}`);
        return {
          path: outputPath,
          size: currentSize,
          quality
        };
      }
      
      quality -= 10;
    }
    
    // If still too large, resize the image
    const scaleFactor = Math.sqrt(targetSize / currentSize);
    const newWidth = Math.floor(image.bitmap.width * scaleFactor);
    const newHeight = Math.floor(image.bitmap.height * scaleFactor);
    
    await image
      .resize(newWidth, newHeight)
      .quality(80)
      .writeAsync(outputPath);
    
    const finalStats = await fs.stat(outputPath);
    
    logger.info(`Image compressed and resized to ${(finalStats.size / 1024).toFixed(2)}KB`);
    
    return {
      path: outputPath,
      size: finalStats.size,
      quality: 80,
      resized: true,
      dimensions: { width: newWidth, height: newHeight }
    };
  } catch (error) {
    logger.error(`Image compression error: ${error.message}`);
    throw new Error(`Failed to compress image: ${error.message}`);
  }
};

/**
 * Create thumbnail
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<string>} Output file path
 */
export const createThumbnail = async (inputPath, outputPath, size = 200) => {
  try {
    const image = await Jimp.read(inputPath);
    
    await image
      .cover(size, size)
      .quality(85)
      .writeAsync(outputPath);
    
    logger.info(`Thumbnail created: ${size}x${size}`);
    return outputPath;
  } catch (error) {
    logger.error(`Thumbnail creation error: ${error.message}`);
    throw new Error(`Failed to create thumbnail: ${error.message}`);
  }
};

/**
 * Add watermark to image
 * @param {string} inputPath - Input file path
 * @param {string} watermarkPath - Watermark image path
 * @param {string} outputPath - Output file path
 * @param {object} options - Watermark options
 * @returns {Promise<string>} Output file path
 */
export const addWatermark = async (inputPath, watermarkPath, outputPath, options = {}) => {
  try {
    const image = await Jimp.read(inputPath);
    const watermark = await Jimp.read(watermarkPath);
    
    const {
      opacity = 50,
      position = 'bottom-right',
      margin = 10
    } = options;
    
    // Resize watermark to 20% of image width
    const watermarkWidth = Math.floor(image.bitmap.width * 0.2);
    watermark.resize(watermarkWidth, Jimp.AUTO);
    watermark.opacity(opacity / 100);
    
    // Calculate position
    let x, y;
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = image.bitmap.width - watermark.bitmap.width - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = image.bitmap.height - watermark.bitmap.height - margin;
        break;
      case 'bottom-right':
      default:
        x = image.bitmap.width - watermark.bitmap.width - margin;
        y = image.bitmap.height - watermark.bitmap.height - margin;
        break;
      case 'center':
        x = (image.bitmap.width - watermark.bitmap.width) / 2;
        y = (image.bitmap.height - watermark.bitmap.height) / 2;
        break;
    }
    
    await image
      .composite(watermark, x, y)
      .writeAsync(outputPath);
    
    logger.info(`Watermark added to image`);
    return outputPath;
  } catch (error) {
    logger.error(`Watermark error: ${error.message}`);
    throw new Error(`Failed to add watermark: ${error.message}`);
  }
};

/**
 * Convert image format
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {string} format - Target format (jpeg, png, bmp, tiff, gif)
 * @returns {Promise<string>} Output file path
 */
export const convertImageFormat = async (inputPath, outputPath, format) => {
  try {
    const image = await Jimp.read(inputPath);
    
    const mimeType = Jimp[`MIME_${format.toUpperCase()}`];
    if (!mimeType) {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    await image
      .quality(90)
      .writeAsync(outputPath);
    
    logger.info(`Image converted to ${format}`);
    return outputPath;
  } catch (error) {
    logger.error(`Image conversion error: ${error.message}`);
    throw new Error(`Failed to convert image: ${error.message}`);
  }
};

/**
 * Get image metadata
 * @param {string} inputPath - Input file path
 * @returns {Promise<object>} Image metadata
 */
export const getImageMetadata = async (inputPath) => {
  try {
    const image = await Jimp.read(inputPath);
    const stats = await fs.stat(inputPath);
    
    return {
      width: image.bitmap.width,
      height: image.bitmap.height,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      mimeType: image.getMIME(),
      extension: image.getExtension()
    };
  } catch (error) {
    logger.error(`Get metadata error: ${error.message}`);
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
};

/**
 * Optimize image (resize if too large, compress to reasonable size)
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {object} options - Optimization options
 * @returns {Promise<object>} Optimization result
 */
export const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      maxSizeKB = 500,
      quality = 85
    } = options;
    
    const image = await Jimp.read(inputPath);
    const metadata = await getImageMetadata(inputPath);
    
    // Resize if larger than max dimensions
    if (image.bitmap.width > maxWidth || image.bitmap.height > maxHeight) {
      image.scaleToFit(maxWidth, maxHeight);
      logger.info(`Image resized from ${metadata.width}x${metadata.height} to fit ${maxWidth}x${maxHeight}`);
    }
    
    // Apply quality
    image.quality(quality);
    
    // Write initial version
    await image.writeAsync(outputPath);
    
    // Check size and compress if needed
    let stats = await fs.stat(outputPath);
    if (stats.size > maxSizeKB * 1024) {
      const result = await compressImageToSize(outputPath, outputPath, maxSizeKB);
      stats = await fs.stat(outputPath);
    }
    
    const finalMetadata = await getImageMetadata(outputPath);
    
    logger.info(`Image optimized: ${metadata.sizeKB}KB → ${finalMetadata.sizeKB}KB`);
    
    return {
      path: outputPath,
      originalSize: metadata.size,
      optimizedSize: stats.size,
      savings: ((1 - stats.size / metadata.size) * 100).toFixed(2) + '%',
      dimensions: {
        width: finalMetadata.width,
        height: finalMetadata.height
      }
    };
  } catch (error) {
    logger.error(`Image optimization error: ${error.message}`);
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
};

/**
 * Process image buffer
 * @param {Buffer} buffer - Image buffer
 * @param {object} options - Processing options
 * @returns {Promise<Buffer>} Processed image buffer
 */
export const processImageBuffer = async (buffer, options = {}) => {
  try {
    const {
      width,
      height,
      quality = 90,
      format = 'jpeg'
    } = options;
    
    let image = await Jimp.read(buffer);
    
    if (width && height) {
      image = image.resize(width, height);
    } else if (width) {
      image = image.resize(width, Jimp.AUTO);
    } else if (height) {
      image = image.resize(Jimp.AUTO, height);
    }
    
    image = image.quality(quality);
    
    const mimeType = Jimp[`MIME_${format.toUpperCase()}`];
    if (mimeType) {
      image = image.mime(mimeType);
    }
    
    return await image.getBufferAsync(image.getMIME());
  } catch (error) {
    logger.error(`Buffer processing error: ${error.message}`);
    throw new Error(`Failed to process image buffer: ${error.message}`);
  }
};

export default {
  resizeImage,
  resizeImageToFit,
  resizeImageToCover,
  compressImageToSize,
  createThumbnail,
  addWatermark,
  convertImageFormat,
  getImageMetadata,
  optimizeImage,
  processImageBuffer
};

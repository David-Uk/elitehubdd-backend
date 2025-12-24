import uploadService from '../services/uploadService.js';
import logger from '../config/logger.js';
import db from '../models/index.js';

const { MenuItem, BarItem } = db;

class UploadController {
  /**
   * Upload profile image
   */
  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await uploadService.uploadProfileImage(req.file, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: result.data
      });
    } catch (error) {
      logger.error(`Upload profile image error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload profile image'
      });
    }
  }

  /**
   * Upload room image
   */
  async uploadRoomImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { roomId } = req.params;
      const result = await uploadService.uploadRoomImage(req.file, roomId);

      res.status(200).json({
        success: true,
        message: 'Room image uploaded successfully',
        data: result.data
      });
    } catch (error) {
      logger.error(`Upload room image error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload room image'
      });
    }
  }

  /**
   * Upload multiple room images
   */
  async uploadRoomImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const { roomId } = req.params;
      const results = await uploadService.uploadMultipleImages(req.files, {
        folder: `elitehub/rooms/${roomId}`,
        maxWidth: 1920,
        maxHeight: 1080,
        maxSizeKB: 800,
        createThumb: true
      });

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      res.status(200).json({
        success: true,
        message: `Uploaded ${successful.length} of ${results.length} images`,
        data: {
          successful,
          failed,
          total: results.length
        }
      });
    } catch (error) {
      logger.error(`Upload room images error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload room images'
      });
    }
  }

  /**
   * Upload menu item image
   */
  async uploadMenuItemImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { menuItemId } = req.params;
      
      // Verify item exists
      const menuItem = await MenuItem.findByPk(menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      const result = await uploadService.uploadMenuItemImage(req.file, menuItemId);
      
      // Update database
      await menuItem.update({
        productImage: result.data.url
      });

      res.status(200).json({
        success: true,
        message: 'Menu item image uploaded successfully',
        data: result.data
      });
    } catch (error) {
      logger.error(`Upload menu item image error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload menu item image'
      });
    }
  }

  /**
   * Upload bar item image
   */
  async uploadBarItemImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { barItemId } = req.params;

      // Verify item exists
      const barItem = await BarItem.findByPk(barItemId);
      if (!barItem) {
        return res.status(404).json({
          success: false,
          message: 'Bar item not found'
        });
      }

      const result = await uploadService.uploadBarItemImage(req.file, barItemId);

      // Update database
      await barItem.update({
        productImage: result.data.url
      });

      res.status(200).json({
        success: true,
        message: 'Bar item image uploaded successfully',
        data: result.data
      });
    } catch (error) {
      logger.error(`Upload bar item image error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload bar item image'
      });
    }
  }

  /**
   * Upload image with size limit
   */
  async uploadImageWithSizeLimit(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { targetSizeKB } = req.body;
      if (!targetSizeKB) {
        return res.status(400).json({
          success: false,
          message: 'Target size (targetSizeKB) is required'
        });
      }

      const result = await uploadService.uploadImageWithSizeLimit(
        req.file,
        parseInt(targetSizeKB),
        { folder: req.body.folder || 'elitehub' }
      );

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result.data
      });
    } catch (error) {
      logger.error(`Upload with size limit error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image'
      });
    }
  }

  /**
   * Delete image
   */
  async deleteImage(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
      }

      await uploadService.deleteImage(publicId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      logger.error(`Delete image error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete image'
      });
    }
  }

  /**
   * Get upload statistics
   */
  getUploadStats(req, res) {
    try {
      const stats = uploadService.getUploadStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error(`Get upload stats error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get upload statistics'
      });
    }
  }
}

export default new UploadController();

import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  uploadProfileImage,
  uploadRoomImage,
  uploadRoomImages,
  uploadMenuImage,
  uploadBarImage,
  uploadSingleFile,
  handleMulterError
} from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Profile image upload
 */
router.post('/profile',
  uploadProfileImage,
  handleMulterError,
  uploadController.uploadProfileImage
);

/**
 * Room image upload (single)
 */
router.post('/room/:roomId',
  authorize('admin', 'manager', 'receptionist'),
  uploadRoomImage,
  handleMulterError,
  uploadController.uploadRoomImage
);

/**
 * Room images upload (multiple)
 */
router.post('/room/:roomId/multiple',
  authorize('admin', 'manager', 'receptionist'),
  uploadRoomImages,
  handleMulterError,
  uploadController.uploadRoomImages
);

/**
 * Menu item image upload
 */
router.post('/menu/:menuItemId',
  authorize('admin', 'manager', 'restaurant_staff'),
  uploadMenuImage,
  handleMulterError,
  uploadController.uploadMenuItemImage
);

/**
 * Bar item image upload
 */
router.post('/bar/:barItemId',
  authorize('admin', 'manager', 'bar_staff'),
  uploadBarImage,
  handleMulterError,
  uploadController.uploadBarItemImage
);

/**
 * Upload image with specific size limit
 */
router.post('/with-size-limit',
  authorize('admin', 'manager'),
  uploadSingleFile,
  handleMulterError,
  uploadController.uploadImageWithSizeLimit
);

/**
 * Delete image
 */
router.delete('/:publicId',
  authorize('admin', 'manager'),
  uploadController.deleteImage
);

/**
 * Get upload statistics
 */
router.get('/stats',
  uploadController.getUploadStats
);

export default router;

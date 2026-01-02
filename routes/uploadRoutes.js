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
// Room image
router.post('/room/:roomId',
  authorize('super_admin', 'admin', 'manager', 'receptionist', 'accountant', 'supervisor'),
  uploadRoomImage,
  handleMulterError,
  uploadController.uploadRoomImage
);

/**
 * Room images upload (multiple)
 */
router.post('/room/:roomId/multiple',
  authorize('super_admin', 'admin', 'manager', 'receptionist', 'accountant', 'supervisor'),
  uploadRoomImages,
  handleMulterError,
  uploadController.uploadRoomImages
);

/**
 * Menu item image upload
 */
router.post('/menu/:menuItemId',
  authorize('super_admin', 'admin', 'manager', 'restaurant_staff', 'kitchen_staff', 'accountant', 'supervisor'), // Keeping restaurant_staff for safety
  uploadMenuImage,
  handleMulterError,
  uploadController.uploadMenuItemImage
);

/**
 * Bar item image upload
 */
router.post('/bar/:barItemId',
  authorize('super_admin', 'admin', 'manager', 'bar_staff', 'waiter', 'accountant', 'supervisor'), // Keeping bar_staff for safety
  uploadBarImage,
  handleMulterError,
  uploadController.uploadBarItemImage
);

/**
 * Upload image with specific size limit
 */
router.post('/with-size-limit',
  authorize('super_admin', 'admin', 'manager'),
  uploadSingleFile,
  handleMulterError,
  uploadController.uploadImageWithSizeLimit
);

/**
 * Delete image
 */
router.delete('/:publicId',
  authorize('super_admin', 'admin', 'manager'),
  uploadController.deleteImage
);

/**
 * Get upload statistics
 */
router.get('/stats',
  uploadController.getUploadStats
);

export default router;

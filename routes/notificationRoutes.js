import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get notifications for authenticated user
router.get('/', 
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter', 'accountant'),
  notificationController.getNotifications
);

// Get notification statistics
router.get('/stats',
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter', 'accountant'),
  notificationController.getNotificationStats
);

// Mark notification as read
router.patch('/:id/read',
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter', 'accountant'),
  notificationController.markAsRead
);

// Clear all notifications (Super Admin only)
router.delete('/clear-all',
  authorize('super_admin'),
  invalidateCache(['/api/notifications*']),
  notificationController.clearAllNotifications
);

export default router;

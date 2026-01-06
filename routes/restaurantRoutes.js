import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { validateRestaurantOrder, validateUUID, validateUUIDOrBatchId, validateStatusUpdate, validatePayment, validateMenuItem, validateBatchOrder, validateBatchStatusUpdate, validateBatchOrderEdit } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all batch orders
router.get('/batch-orders',
  authorize('super_admin', 'admin', 'accountant', 'supervisor'),
  cache(60),
  restaurantController.getAllBatchOrders
);

// Create batch order with multiple sources
router.post('/batch-orders',
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  validateBatchOrder,
  invalidateCache(['/api/restaurant/batch-orders*', '/api/restaurant/batches*', '/api/reports*']),
  restaurantController.createBatchOrder
);

// Create menu item
router.post('/menu',
  authorize('super_admin', 'admin'),
  validateMenuItem,
  invalidateCache(['/api/restaurant/menu*']),
  restaurantController.createMenuItem
);

// Menu items with caching (10 minutes)
router.get('/menu', 
  cache(600),
  restaurantController.getMenuItems
);

// Orders - Restaurant
router.post('/orders', 
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  validateRestaurantOrder,
  invalidateCache(['/api/restaurant/orders*', '/api/reports*']),
  restaurantController.createOrder
);

router.get('/orders', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  cache(60), // Cache for 1 minute
  restaurantController.getAllOrders
);

// Delete all restaurant orders (Super Admin only)
router.delete('/orders/delete-all',
  authorize('super_admin'),
  invalidateCache(['/api/restaurant/orders*', '/api/restaurant/batches*', '/api/restaurant/batch-orders*', '/api/reports*']),
  restaurantController.deleteAllOrders
);

router.get('/orders/:id', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  cache(300),
  restaurantController.getOrderById
);

router.patch('/orders/:id/status', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  validateStatusUpdate,
  invalidateCache(['/api/restaurant/orders*', '/api/reports*']),
  restaurantController.updateOrderStatus
);

router.post('/orders/:id/payment', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  validatePayment,
  invalidateCache(['/api/restaurant/orders*', '/api/reports*']),
  restaurantController.completePayment
);

// Batch Management Routes
router.get('/batches', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  cache(60),
  restaurantController.getAllBatches
);

router.get('/batches/date/:date', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  cache(60),
  restaurantController.getBatchesByDate
);

router.get('/batches/:id', 
  validateUUIDOrBatchId,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'kitchen_staff'),
  cache(300),
  restaurantController.getBatchById
);

router.post('/batches/:batchId/orders', 
  validateUUIDOrBatchId,
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  invalidateCache(['/api/restaurant/batches*', '/api/restaurant/orders*', '/api/reports*']),
  restaurantController.addOrderToBatch
);

router.patch('/batches/:id/status', 
  validateUUIDOrBatchId,
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  validateBatchStatusUpdate,
  invalidateCache(['/api/restaurant/batches*', '/api/reports*']),
  restaurantController.updateBatchStatus
);

router.post('/batches/:id/complete', 
  validateUUIDOrBatchId,
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  invalidateCache(['/api/restaurant/batches*', '/api/restaurant/orders*', '/api/reports*']),
  restaurantController.completeBatch
);

router.post('/batches/:id/cancel', 
  validateUUIDOrBatchId,
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  invalidateCache(['/api/restaurant/batches*', '/api/reports*']),
  restaurantController.cancelBatch
);

router.patch('/batches/:id/edit', 
  validateUUIDOrBatchId,
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  validateBatchOrderEdit,
  invalidateCache(['/api/restaurant/batches*', '/api/restaurant/orders*', '/api/reports*']),
  restaurantController.editBatchOrder
);

// Order Status & Item Updates
router.patch('/order-items/:itemId',
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  invalidateCache(['/api/restaurant/orders*', '/api/restaurant/batches*', '/api/reports*']),
  restaurantController.updateOrderItem
);

router.patch('/order-items/:itemId/status',
  authorize('super_admin', 'admin', 'supervisor', 'kitchen_staff', 'waiter'),
  invalidateCache(['/api/restaurant/orders*', '/api/restaurant/batches*', '/api/reports*']),
  restaurantController.updateOrderItemStatus
);

export default router;

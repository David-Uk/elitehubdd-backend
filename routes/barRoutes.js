import express from 'express';
import barController from '../controllers/barController.js';
import { authenticate, authorize, authorizeDepartment } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { validateBarOrder, validateUUID } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Bar items with caching (10 minutes)
router.get('/items', 
  cache(600),
  barController.getBarItems
);

// Stock management (bar_staff, manager, admin only - AND Restaurant Department)
router.patch('/items/:id/stock', 
  validateUUID,
  authorize('bar_staff', 'manager', 'admin'),
  authorizeDepartment('restaurant'),
  invalidateCache(['/api/bar/items*', '/api/reports*']),
  barController.updateStock
);

// Orders - Restaurant Department (handling bar)
router.post('/orders', 
  authorizeDepartment('restaurant'),
  orderLimiter,
  validateBarOrder,
  invalidateCache(['/api/bar/orders*', '/api/reports*']),
  barController.createOrder
);

router.get('/orders', 
  authorizeDepartment('restaurant'),
  cache(60), // Cache for 1 minute
  barController.getAllOrders
);

router.get('/orders/:id', 
  validateUUID,
  authorizeDepartment('restaurant'),
  cache(300),
  barController.getOrderById
);

router.patch('/orders/:id/status', 
  validateUUID,
  authorizeDepartment('restaurant'),
  invalidateCache(['/api/bar/orders*', '/api/reports*']),
  barController.updateOrderStatus
);

router.post('/orders/:id/payment', 
  validateUUID,
  authorizeDepartment('restaurant'),
  invalidateCache(['/api/bar/orders*', '/api/reports*']),
  barController.completePayment
);

export default router;

import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import { authenticate, authorizeDepartment } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { validateRestaurantOrder, validateUUID } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Menu items with caching (10 minutes)
router.get('/menu', 
  cache(600),
  restaurantController.getMenuItems
);

// Orders - Restaurant Department
router.post('/orders', 
  authorizeDepartment('restaurant'),
  orderLimiter,
  validateRestaurantOrder,
  invalidateCache(['/api/restaurant/orders*', '/api/reports*']),
  restaurantController.createOrder
);

router.get('/orders', 
  authorizeDepartment('restaurant'),
  cache(60), // Cache for 1 minute
  restaurantController.getAllOrders
);

router.get('/orders/:id', 
  validateUUID,
  authorizeDepartment('restaurant'),
  cache(300),
  restaurantController.getOrderById
);

router.patch('/orders/:id/status', 
  validateUUID,
  authorizeDepartment('restaurant'),
  invalidateCache(['/api/restaurant/orders*', '/api/reports*']),
  restaurantController.updateOrderStatus
);

router.post('/orders/:id/payment', 
  validateUUID,
  authorizeDepartment('restaurant'),
  invalidateCache(['/api/restaurant/orders*', '/api/reports*']),
  restaurantController.completePayment
);

export default router;

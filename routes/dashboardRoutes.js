import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache } from '../middleware/cache.js';

const router = express.Router();

// Get comprehensive dashboard statistics
router.get('/stats', 
  authenticate,
  authorize('super_admin', 'admin', 'manager', 'supervisor'),
  cache(300), // Cache for 5 minutes
  dashboardController.getDashboardStats
);

// Support POST requests for dashboard stats as well
router.post('/stats', 
  authenticate,
  authorize('super_admin', 'admin', 'manager', 'supervisor'),
  cache(300), // Cache for 5 minutes
  dashboardController.getDashboardStats
);

// Get occupancy statistics
router.get('/occupancy', 
  authenticate,
  authorize('super_admin', 'admin', 'manager', 'supervisor'),
  cache(300),
  dashboardController.getOccupancyStats
);

// Get revenue statistics
router.get('/revenue', 
  authenticate,
  authorize('super_admin', 'admin', 'manager', 'supervisor'),
  cache(300),
  dashboardController.getRevenueStats
);

export default router;

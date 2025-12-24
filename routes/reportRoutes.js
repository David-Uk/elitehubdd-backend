import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticate, isAdminOrManager } from '../middleware/auth.js';
import { cache } from '../middleware/cache.js';
import { reportLimiter } from '../middleware/rateLimiter.js';
import { validateDateRange } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication and admin/manager role
router.use(authenticate);
router.use(isAdminOrManager);
router.use(reportLimiter);

// Revenue report with caching (5 minutes)
router.get('/revenue', 
  validateDateRange,
  cache(300),
  reportController.getRevenueReport
);

// Occupancy report with caching (5 minutes)
router.get('/occupancy', 
  validateDateRange,
  cache(300),
  reportController.getOccupancyReport
);

// Reservation statistics with caching (5 minutes)
router.get('/reservations', 
  validateDateRange,
  cache(300),
  reportController.getReservationStats
);

// Feedback summary with caching (10 minutes)
router.get('/feedback', 
  validateDateRange,
  cache(600),
  reportController.getFeedbackSummary
);

// Top performing rooms with caching (10 minutes)
router.get('/top-rooms', 
  validateDateRange,
  cache(600),
  reportController.getTopPerformingRooms
);

// Guest statistics with caching (10 minutes)
router.get('/guests', 
  validateDateRange,
  cache(600),
  reportController.getGuestStats
);

export default router;

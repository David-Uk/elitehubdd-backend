import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache } from '../middleware/cache.js';
import { validateDateRange } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication and privileges
router.use(authenticate);
// router.use(authorize(...)); // Granular per route

// Revenue (Admins, Accountant, Supervisor only)
router.get('/revenue', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor'),
  validateDateRange,
  cache(300),
  reportController.getRevenueReport
);

// Occupancy (Receptionist allowed)
router.get('/occupancy', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'receptionist'),
  validateDateRange,
  cache(300),
  reportController.getOccupancyReport
);

// Reservation stats (Receptionist allowed)
router.get('/reservations', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'receptionist'),
  validateDateRange,
  cache(300),
  reportController.getReservationStats
);

// Feedback (Admins, Accountant, Supervisor) - maybe Receptionist too? Staying safe.
router.get('/feedback', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor'),
  validateDateRange,
  cache(600),
  reportController.getFeedbackSummary
);

// Top Rooms (Receptionist allowed)
router.get('/top-rooms', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'receptionist'),
  validateDateRange,
  cache(600),
  reportController.getTopPerformingRooms
);

// Guest stats (Receptionist allowed)
router.get('/guests', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'receptionist'),
  validateDateRange,
  cache(600),
  reportController.getGuestStats
);

export default router;

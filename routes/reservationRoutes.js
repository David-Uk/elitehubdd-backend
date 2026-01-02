import express from 'express';
import reservationController from '../controllers/reservationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { validateReservation, validateUUID } from '../middleware/validator.js';

const router = express.Router();

// Public endpoint - Check room availability (no authentication required)
router.get('/availability/check', 
  cache(300),
  reservationController.checkRoomAvailability
);

// All routes below require authentication
router.use(authenticate);

// Create reservation
router.post('/', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  validateReservation,
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.createReservation
);

// Get all reservations
router.get('/', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(300),
  reservationController.getAllReservations
);

// Get reservation by ID
router.get('/:id', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(300),
  reservationController.getReservationById
);

// Check-in
router.post('/:id/check-in', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.checkIn
);

// Check-out
router.post('/:id/check-out', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.checkOut
);

// Cancel reservation (restricted)
router.post('/:id/cancel', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager'),
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.cancelReservation
);

export default router;

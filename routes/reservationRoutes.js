import express from 'express';
import reservationController from '../controllers/reservationController.js';
import { authenticate, authorize, authorizeDepartment } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { validateReservation, validateUUID } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create reservation - Reception Department
router.post('/', 
  authorizeDepartment('reception'),
  validateReservation,
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.createReservation
);

// Get all reservations - Reception or Management
router.get('/', 
  authorizeDepartment('reception', 'management'),
  cache(300),
  reservationController.getAllReservations
);

// Get reservation by ID
router.get('/:id', 
  validateUUID,
  authorizeDepartment('reception', 'management'),
  cache(300),
  reservationController.getReservationById
);

// Check-in - Reception Department
router.post('/:id/check-in', 
  validateUUID,
  authorizeDepartment('reception'),
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.checkIn
);

// Check-out - Reception Department
router.post('/:id/check-out', 
  validateUUID,
  authorizeDepartment('reception'),
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.checkOut
);

// Cancel reservation (admin/manager only) - Management Department
router.post('/:id/cancel', 
  validateUUID,
  authorize('admin', 'manager'),
  authorizeDepartment('management', 'reception'), // Managers or Reception lead? Using management as primary, but reception often needs to cancel. Adding both.
  invalidateCache(['/api/reservations*', '/api/reports*']),
  reservationController.cancelReservation
);

export default router;

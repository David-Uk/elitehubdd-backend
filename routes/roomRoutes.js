import express from 'express';
import roomController from '../controllers/roomController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { validateUUID, validateDateRange, validateRoom } from '../middleware/validator.js';

const router = express.Router();

// Public endpoint - Get available rooms (no authentication required)
router.get('/available', 
  validateDateRange,
  cache(300),
  roomController.getAvailableRooms
);

// All routes below require authentication
router.use(authenticate);

// Create room (admin only)
router.post('/', 
  authorize('super_admin', 'admin'),
  validateRoom,
  invalidateCache(['/api/rooms*']),
  roomController.createRoom
);

// Get all rooms
router.get('/', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(600),
  roomController.getAllRooms
);

// Get room by ID
router.get('/:id', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(600),
  roomController.getRoomById
);

// Get room by room number
router.get('/number/:roomNumber', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(600),
  roomController.getRoomByNumber
);

export default router;

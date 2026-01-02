import express from 'express';
import roomTypeController from '../controllers/roomTypeController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache } from '../middleware/cache.js';
import { validateUUID } from '../middleware/validator.js';

const router = express.Router();

// All routes below require authentication
router.use(authenticate);

// Get all room types
router.get('/', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(600),
  roomTypeController.getAllRoomTypes
);

// Get room type by ID
router.get('/:id', 
  validateUUID,
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(600),
  roomTypeController.getRoomTypeById
);

// Get room type by name
router.get('/name/:name', 
  authorize('super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist'),
  cache(600),
  roomTypeController.getRoomTypeByName
);

export default router;

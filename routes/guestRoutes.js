import express from 'express';
import guestController from '../controllers/guestController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache } from '../middleware/cache.js';
import { validateGuest } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/guests
 * @desc    Create a new guest
 * @access  Private (receptionist, manager, admin, super_admin)
 */
router.post('/', 
  authorize('receptionist', 'manager', 'admin', 'super_admin'),
  validateGuest,
  guestController.createGuest
);

/**
 * @route   GET /api/guests
 * @desc    Get all guests with pagination and filters
 * @access  Private (receptionist, manager, admin, super_admin, accountant, supervisor)
 */
router.get('/', 
  authorize('receptionist', 'manager', 'admin', 'super_admin', 'accountant', 'supervisor'),
  cache(300),
  guestController.getAllGuests
);

/**
 * @route   GET /api/guests/search
 * @desc    Search guests by name, email, phone, or ID number
 * @access  Private (receptionist, manager, admin, super_admin, accountant, supervisor)
 */
router.get('/search', 
  authorize('receptionist', 'manager', 'admin', 'super_admin', 'accountant', 'supervisor'),
  guestController.searchGuests
);

/**
 * @route   GET /api/guests/:id
 * @desc    Get guest by ID with reservation history
 * @access  Private (receptionist, manager, admin, super_admin, accountant, supervisor)
 */
router.get('/:id', 
  authorize('receptionist', 'manager', 'admin', 'super_admin', 'accountant', 'supervisor'),
  cache(600),
  guestController.getGuestById
);

/**
 * @route   PUT /api/guests/:id
 * @desc    Update guest information
 * @access  Private (receptionist, manager, admin, super_admin)
 */
router.put('/:id', 
  authorize('receptionist', 'manager', 'admin', 'super_admin'),
  validateGuest,
  guestController.updateGuest
);

/**
 * @route   DELETE /api/guests/:id
 * @desc    Delete guest (soft delete)
 * @access  Private (admin, super_admin)
 */
router.delete('/:id', 
  authorize('admin', 'super_admin'),
  guestController.deleteGuest
);

export default router;

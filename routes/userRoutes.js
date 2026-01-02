import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateUUID, validateUserUpdate } from '../middleware/validator.js';

const router = express.Router();

// All user management routes require high-level privileges for staff management
// Accountant and Supervisor are explicitly excluded from Staff module
router.use(authenticate, authorize('super_admin', 'admin'));

// User model management
router.get('/', userController.getAllUsers);
router.get('/:id', validateUUID, userController.getUserById);
router.patch('/:id', validateUUID, validateUserUpdate, userController.updateUser);
router.delete('/:id', validateUUID, userController.deleteUser);

// Staff management (Aliased under users or separate)
router.get('/staff/all', userController.getAllStaff);
router.patch('/staff/:id', validateUUID, validateUserUpdate, userController.updateStaff);

export default router;

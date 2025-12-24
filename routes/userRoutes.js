import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validator.js';

const router = express.Router();

// All user management routes require admin privileges
router.use(authenticate, isAdmin);

// User model management
router.get('/', userController.getAllUsers);
router.get('/:id', validateUUID, userController.getUserById);
router.patch('/:id', validateUUID, userController.updateUser);
router.delete('/:id', validateUUID, userController.deleteUser);

// Staff management (Aliased under users or separate)
router.get('/staff/all', userController.getAllStaff);
router.patch('/staff/:id', validateUUID, userController.updateStaff);

export default router;

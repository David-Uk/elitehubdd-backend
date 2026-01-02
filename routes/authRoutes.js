import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  validateStaffRegistration,
  validateAdminRegistration,
  validateLogin, 
  validatePasswordChange 
} from '../middleware/validator.js';

const router = express.Router();

// Public routes with rate limiting
// Register routes
router.post('/register', 
  authenticate,
  validateStaffRegistration,
  authController.register
);

router.post('/register-admin',
  authenticate,
  validateAdminRegistration,
  authController.registerAdmin
);

router.post('/register-super-admin',
  validateAdminRegistration,
  authController.registerSuperAdmin
);

router.post('/login', 
  validateLogin,
  authController.login
);

// Protected routes
router.get('/profile', 
  authenticate, 
  authController.getProfile
);

router.post('/change-password', 
  authenticate,
  validatePasswordChange,
  authController.changePassword
);

router.post('/forgot-password',
  authController.forgotPassword
);

router.post('/reset-password/:token',
  authController.resetPassword
);

export default router;

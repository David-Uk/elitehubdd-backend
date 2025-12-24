import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { 
  validateStaffRegistration, 
  validateLogin, 
  validatePasswordChange 
} from '../middleware/validator.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', 
  registerLimiter,
  validateStaffRegistration,
  authController.register
);

router.post('/register-admin',
  authenticate,
  // isAdmin, // We can add isAdmin here if we want only admins to create other admins
  authController.registerAdmin
);

router.post('/login', 
  authLimiter,
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
  passwordResetLimiter,
  validatePasswordChange,
  authController.changePassword
);

export default router;
